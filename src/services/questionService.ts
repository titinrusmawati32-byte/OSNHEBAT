import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Question } from '../types/question';
import { calculateSimilarity } from '../lib/parsers/questionParser';

const QUESTIONS_COL = 'questions';

// Convert Firestore doc to Question
function docToQuestion(docData: any, id: string): Question {
  const options = docData.options || {
    A: docData.optionA || '',
    B: docData.optionB || '',
    C: docData.optionC || '',
    D: docData.optionD || '',
  };

  const questionText = docData.questionText || docData.question || '';

  return {
    id,
    subjectId: docData.subjectId || 'ipa',
    questionNumber: docData.questionNumber,
    questionText,
    question: questionText,
    options,
    optionA: options.A,
    optionB: options.B,
    optionC: options.C,
    optionD: options.D,
    correctAnswer: docData.correctAnswer || 'A',
    explanation: docData.explanation || '',
    imageUrl: docData.imageUrl || '',
    imageAlt: docData.imageAlt || '',
    difficulty: docData.difficulty || 'medium',
    createdBy: docData.createdBy || '',
    createdByName: docData.createdByName || '',
    sourceType: docData.sourceType || 'manual',
    sourceFileName: docData.sourceFileName || '',
    importSessionId: docData.importSessionId || '',
    isActive: docData.isActive !== false,
    createdAt: docData.createdAt || null,
    updatedAt: docData.updatedAt || null,
  };
}

// Create a single question
export async function createQuestion(
  data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Question> {
  const newDocRef = doc(collection(db, QUESTIONS_COL));
  const now = serverTimestamp();

  const options = data.options || {
    A: data.optionA || '',
    B: data.optionB || '',
    C: data.optionC || '',
    D: data.optionD || '',
  };

  const questionText = data.questionText || data.question || '';

  const docPayload = {
    id: newDocRef.id,
    subjectId: data.subjectId,
    questionNumber: data.questionNumber || null,
    questionText,
    options,
    correctAnswer: data.correctAnswer || 'A',
    explanation: data.explanation || null,
    imageUrl: data.imageUrl || null,
    imageAlt: data.imageAlt || null,
    difficulty: data.difficulty || 'medium',
    createdBy: data.createdBy,
    createdByName: data.createdByName,
    sourceType: data.sourceType || 'manual',
    sourceFileName: data.sourceFileName || null,
    importSessionId: data.importSessionId || null,
    isActive: data.isActive !== false,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(newDocRef, docPayload);

  return docToQuestion(docPayload, newDocRef.id);
}

// Update question
export async function updateQuestion(
  questionId: string,
  updates: Partial<Question>
): Promise<void> {
  const docRef = doc(db, QUESTIONS_COL, questionId);
  const now = serverTimestamp();

  const payload: any = {
    ...updates,
    updatedAt: now,
  };

  if (updates.options) {
    payload.options = updates.options;
  }

  await updateDoc(docRef, payload);
}

// Delete question
export async function deleteQuestion(questionId: string): Promise<void> {
  await deleteDoc(doc(db, QUESTIONS_COL, questionId));
}

// Get all questions with optional filters
export async function getQuestions(
  subjectId?: string,
  createdBy?: string
): Promise<Question[]> {
  try {
    let q = collection(db, QUESTIONS_COL) as any;

    if (subjectId && subjectId !== 'all') {
      if (createdBy) {
        q = query(
          collection(db, QUESTIONS_COL),
          where('subjectId', '==', subjectId),
          where('createdBy', '==', createdBy)
        );
      } else {
        q = query(collection(db, QUESTIONS_COL), where('subjectId', '==', subjectId));
      }
    } else if (createdBy) {
      q = query(collection(db, QUESTIONS_COL), where('createdBy', '==', createdBy));
    }

    const snap = await getDocs(q);
    const questions: Question[] = [];
    snap.forEach((d) => {
      questions.push(docToQuestion(d.data(), d.id));
    });

    return questions.sort((a, b) => {
      // Sort by questionNumber or creation time
      if (a.questionNumber && b.questionNumber) return a.questionNumber - b.questionNumber;
      return 0;
    });
  } catch (error) {
    console.error('Failed to get questions from Firestore:', error);
    return [];
  }
}

// Check if a question text is likely duplicate
export async function checkDuplicateQuestion(
  newText: string,
  subjectId: string
): Promise<{ isDuplicate: boolean; similarQuestion?: Question; score: number }> {
  try {
    const existing = await getQuestions(subjectId);
    for (const q of existing) {
      const score = calculateSimilarity(newText, q.questionText);
      if (score >= 0.8) {
        return { isDuplicate: true, similarQuestion: q, score };
      }
    }
    return { isDuplicate: false, score: 0 };
  } catch {
    return { isDuplicate: false, score: 0 };
  }
}
