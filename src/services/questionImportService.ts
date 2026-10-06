import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
  limit,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import {
  QuestionImportSession,
  ParsedQuestion,
  QuestionSourceType,
  Question,
} from '../types/question';
import { UserProfile, UserRole } from '../types/auth';
import { parseWordDocument } from '../lib/parsers/wordParser';
import { parseExcelDocument } from '../lib/parsers/excelParser';
import { parsePdfDocument } from '../lib/parsers/pdfParser';
import { checkDuplicateQuestion, createQuestion } from './questionService';

const IMPORTS_COL = 'questionImports';

// Convert doc data to QuestionImportSession
function docToSession(data: any, id: string): QuestionImportSession {
  return {
    id,
    fileName: data.fileName || '',
    fileType: data.fileType || 'word',
    subjectId: data.subjectId || 'ipa',
    uploadedBy: data.uploadedBy || '',
    uploadedByName: data.uploadedByName || '',
    totalDetected: data.totalDetected || 0,
    totalValid: data.totalValid || 0,
    totalNeedsReview: data.totalNeedsReview || 0,
    totalWithImages: data.totalWithImages || 0,
    status: data.status || 'review',
    parsedQuestions: [], // Will be loaded separately from subcollection
    createdAt: data.createdAt || null,
    completedAt: data.completedAt || null,
  };
}

// Helper to deep remove undefined values from an object (Firestore doesn't allow undefined)
function sanitizeForFirestore(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(v => sanitizeForFirestore(v));
  } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Timestamp)) {
    const newObj: any = {};
    Object.keys(obj).forEach(key => {
      const val = obj[key];
      if (val !== undefined) {
        newObj[key] = sanitizeForFirestore(val);
      }
    });
    return newObj;
  }
  return obj;
}

// Create an import session in Firestore
export async function createImportSession(
  sessionData: Omit<QuestionImportSession, 'id' | 'createdAt'>
): Promise<QuestionImportSession> {
  const { parsedQuestions, ...metadata } = sessionData;
  const docRef = doc(collection(db, IMPORTS_COL));
  const now = serverTimestamp();

  // 1. Prepare session metadata
  // Explicitly remove parsedQuestions from what goes to the main document
  const { parsedQuestions: _, ...cleanMetadata } = metadata as any;
  
  const payload = sanitizeForFirestore({
    ...cleanMetadata,
    id: docRef.id,
    createdAt: now,
  });

  // 2. Use batch to create metadata and first batch of questions (up to 500)
  const batch = writeBatch(db);
  batch.set(docRef, payload);

  const questionsCol = collection(db, IMPORTS_COL, docRef.id, 'questions');
  
  if (parsedQuestions && parsedQuestions.length > 0) {
    // Process questions in chunks of 450 (safe limit for batch including metadata doc)
    const chunkSize = 450;
    
    // Save first chunk in current batch
    const firstChunk = parsedQuestions.slice(0, chunkSize);
    firstChunk.forEach(q => {
      const qRef = doc(questionsCol, q.id);
      batch.set(qRef, sanitizeForFirestore(q));
    });

    await batch.commit();

    // Save subsequent chunks
    for (let i = chunkSize; i < parsedQuestions.length; i += 500) {
      const chunkBatch = writeBatch(db);
      const chunk = parsedQuestions.slice(i, i + 500);
      chunk.forEach(q => {
        const qRef = doc(questionsCol, q.id);
        chunkBatch.set(qRef, sanitizeForFirestore(q));
      });
      await chunkBatch.commit();
    }
  } else {
    await batch.commit();
  }

  // Build the final object for UI return
  const session: QuestionImportSession = {
    id: docRef.id,
    fileName: metadata.fileName,
    fileType: metadata.fileType,
    subjectId: metadata.subjectId,
    uploadedBy: metadata.uploadedBy,
    uploadedByName: metadata.uploadedByName,
    totalDetected: metadata.totalDetected,
    totalValid: metadata.totalValid,
    totalNeedsReview: metadata.totalNeedsReview,
    totalWithImages: metadata.totalWithImages,
    status: metadata.status,
    parsedQuestions,
    createdAt: new Date(),
  };

  return session;
}

// Get import session by ID (including questions)
export async function getImportSession(sessionId: string): Promise<QuestionImportSession | null> {
  try {
    const snap = await getDoc(doc(db, IMPORTS_COL, sessionId));
    if (snap.exists()) {
      const session = docToSession(snap.data(), snap.id);
      
      // Load questions from subcollection
      const qSnap = await getDocs(query(collection(db, IMPORTS_COL, sessionId, 'questions'), orderBy('questionNumber', 'asc')));
      session.parsedQuestions = qSnap.docs.map(d => d.data() as ParsedQuestion);
      
      return session;
    }
    return null;
  } catch (err) {
    console.error('Failed to get import session:', err);
    return null;
  }
}

// Update an import session (metadata or specific questions)
export async function updateImportSession(
  sessionId: string,
  updates: Partial<QuestionImportSession>
): Promise<void> {
  const { parsedQuestions, ...metadataUpdates } = updates;
  const docRef = doc(db, IMPORTS_COL, sessionId);

  // Update metadata if any
  if (Object.keys(metadataUpdates).length > 0) {
    const sanitizedUpdates = sanitizeForFirestore(metadataUpdates);
    await updateDoc(docRef, sanitizedUpdates);
  }

  // Update individual questions in subcollection if provided
  if (parsedQuestions && parsedQuestions.length > 0) {
    const questionsCol = collection(db, IMPORTS_COL, sessionId, 'questions');
    // For small updates (like one question changed in review), we just update that one
    // But since the UI currently sends the whole list, we might need to be careful.
    // Optimization: If UI starts sending individual updates, use this.
    // For now, if provided, we assume we update the specific ones that changed.
    
    const batch = writeBatch(db);
    parsedQuestions.forEach(q => {
      const qRef = doc(questionsCol, q.id);
      batch.set(qRef, sanitizeForFirestore(q), { merge: true });
    });
    await batch.commit();
  }
}

// Cancel an import session
export async function cancelImportSession(sessionId: string): Promise<void> {
  const docRef = doc(db, IMPORTS_COL, sessionId);
  await updateDoc(docRef, {
    status: 'cancelled',
    updatedAt: serverTimestamp(),
  });
}

// Get import history (Admins see all; teachers see their own)
export async function getImportHistory(
  userRole: UserRole,
  userId: string
): Promise<QuestionImportSession[]> {
  try {
    let q;
    if (userRole === 'admin') {
      q = collection(db, IMPORTS_COL);
    } else {
      q = query(collection(db, IMPORTS_COL), where('uploadedBy', '==', userId));
    }

    const snap = await getDocs(q);
    const sessions: QuestionImportSession[] = [];
    snap.forEach((d) => {
      sessions.push(docToSession(d.data(), d.id));
    });

    // Sort newest first
    return sessions.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt || 0).getTime();
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  } catch (err) {
    console.error('Failed to get import history:', err);
    return [];
  }
}

export interface ProcessDocumentOptions {
  file: File;
  fileType: 'word' | 'excel' | 'pdf';
  subjectId: string;
  user: UserProfile;
  onProgress?: (step: string) => void;
}

// Full document processing workflow
export async function processDocument({
  file,
  fileType,
  subjectId,
  user,
  onProgress,
}: ProcessDocumentOptions): Promise<{
  session: QuestionImportSession;
  questions: ParsedQuestion[];
  isScanOnly?: boolean;
  scanWarning?: string;
  hasImageReferences?: boolean;
}> {
  onProgress?.('Membaca dokumen...');
  const arrayBuffer = await file.arrayBuffer();

  onProgress?.('Mengekstrak teks...');
  let parsedQuestions: ParsedQuestion[] = [];
  let isScanOnly = false;
  let scanWarning: string | undefined = undefined;
  let hasImageReferences = false;

  if (fileType === 'word') {
    const wordResult = await parseWordDocument(arrayBuffer);
    parsedQuestions = wordResult.questions;
    hasImageReferences = wordResult.hasImageReferences;
  } else if (fileType === 'excel') {
    const excelResult = parseExcelDocument(arrayBuffer);
    parsedQuestions = excelResult.questions;
  } else if (fileType === 'pdf') {
    const pdfResult = await parsePdfDocument(arrayBuffer);
    parsedQuestions = pdfResult.questions;
    isScanOnly = pdfResult.isScanOnly;
    scanWarning = pdfResult.scanWarning;
  }

  onProgress?.('Mengenali struktur soal...');
  // Check duplicates against existing database questions
  onProgress?.('Memeriksa potensi duplikasi...');
  for (const q of parsedQuestions) {
    const dupCheck = await checkDuplicateQuestion(q.questionText, subjectId);
    if (dupCheck.isDuplicate) {
      q.isDuplicate = true;
      if (!q.needsReview) {
        q.needsReview = true;
        q.reviewReason = `Kemungkinan duplikat (Kemiripan ${Math.round(dupCheck.score * 100)}% dengan soal di bank soal).`;
      }
    }
  }

  onProgress?.('Menyiapkan sesi review...');
  const totalDetected = parsedQuestions.length;
  const totalValid = parsedQuestions.filter((q) => !q.needsReview).length;
  const totalNeedsReview = parsedQuestions.filter((q) => q.needsReview).length;
  const totalWithImages = parsedQuestions.filter((q) => !!q.imageUrl).length;

  const session = await createImportSession({
    fileName: file.name,
    fileType,
    subjectId,
    uploadedBy: user.uid,
    uploadedByName: user.displayName || user.name || user.username,
    totalDetected,
    totalValid,
    totalNeedsReview,
    totalWithImages,
    status: 'review',
    parsedQuestions,
  });

  return {
    session,
    questions: parsedQuestions,
    isScanOnly,
    scanWarning,
    hasImageReferences,
  };
}

// Save approved parsed questions to final Firestore questions collection
export async function saveImportedQuestions(
  importSessionId: string,
  questionsToSave: ParsedQuestion[],
  subjectId: string,
  user: UserProfile,
  sourceFileName: string,
  sourceType: QuestionSourceType
): Promise<{ savedCount: number }> {
  let savedCount = 0;

  for (const q of questionsToSave) {
    await createQuestion({
      subjectId,
      questionNumber: q.questionNumber,
      questionText: q.questionText,
      options: {
        A: q.options.A || '',
        B: q.options.B || '',
        C: q.options.C || '',
        D: q.options.D || '',
      },
      correctAnswer: (q.correctAnswer as any) || 'A',
      explanation: q.explanation || '',
      imageUrl: q.imageUrl || '',
      imageAlt: q.imageAlt || '',
      difficulty: q.difficulty || 'medium',
      createdBy: user.uid,
      createdByName: user.displayName || user.name || user.username,
      sourceType,
      sourceFileName,
      importSessionId,
      isActive: true,
    });
    savedCount++;
  }

  // Update session status to completed
  await updateImportSession(importSessionId, {
    status: 'completed',
    completedAt: serverTimestamp(),
  });

  return { savedCount };
}
