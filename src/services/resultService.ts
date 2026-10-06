import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch,
  limit,
  Timestamp,
  increment,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AttemptResult, QuestionResult, ExamStatistics } from '../types/result';
import { ExamAttempt } from '../types/attempt';
import { Question } from '../types/question';
import { ExamPackage } from '../types/exam';

const RESULTS_COL = 'attemptResults';

export const resultService = {
  /**
   * Securely grade an attempt. 
   * In a real production app, this would be a Cloud Function.
   * Here we simulate it by fetching correct answers and calculating server-side.
   */
  async gradeAttempt(attemptId: string): Promise<AttemptResult> {
    // 1. Fetch Attempt
    const attemptSnap = await getDoc(doc(db, 'attempts', attemptId));
    if (!attemptSnap.exists()) throw new Error('Attempt not found');
    const attempt = { id: attemptSnap.id, ...attemptSnap.data() } as ExamAttempt;

    // 2. Fetch Exam Metadata
    const examSnap = await getDoc(doc(db, 'exams', attempt.examId));
    if (!examSnap.exists()) throw new Error('Exam not found');
    const exam = { id: examSnap.id, ...examSnap.data() } as ExamPackage;

    // 3. Fetch all questions in this exam to get correct answers
    // We use chunks if there are many questions
    const questionIds = exam.questionIds;
    const questions: Question[] = [];
    
    // Firestore 'in' query limit is 30, so we might need multiple fetches
    for (let i = 0; i < questionIds.length; i += 30) {
      const chunk = questionIds.slice(i, i + 30);
      const qQuery = query(collection(db, 'questions'), where('__name__', 'in', chunk));
      const qSnap = await getDocs(qQuery);
      qSnap.forEach(d => questions.push({ id: d.id, ...d.data() } as Question));
    }

    // 4. Calculate Scores
    let correctCount = 0;
    let wrongCount = 0;
    let answeredCount = 0;
    let totalTimeSpent = 0;

    const questionResults: QuestionResult[] = questions.map((q, idx) => {
      const userAnswer = attempt.answers[q.id];
      const isAnswered = userAnswer && userAnswer.selectedOption !== '';
      const isCorrect = isAnswered && userAnswer.selectedOption === q.correctAnswer;
      const timeSpent = userAnswer?.timeSpentSeconds || 0;

      if (isAnswered) {
        answeredCount++;
        if (isCorrect) correctCount++;
        else wrongCount++;
      }

      totalTimeSpent += timeSpent;

      return {
        questionId: q.id,
        questionNumber: q.questionNumber || idx + 1,
        selectedOption: userAnswer?.selectedOption || '',
        isAnswered,
        isCorrect,
        timeSpentSeconds: timeSpent,
        subjectId: q.subjectId,
        difficulty: q.difficulty,
      };
    });

    const totalQuestions = questions.length;
    const unansweredCount = totalQuestions - answeredCount;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= (exam.settings.passingScore || 0);

    const submittedAt = attempt.submittedAt || serverTimestamp();
    const duration = attempt.submittedAt && attempt.startedAt 
      ? (attempt.submittedAt.toMillis() - attempt.startedAt.toMillis()) / 1000 
      : totalTimeSpent;

    const result: Omit<AttemptResult, 'id'> = {
      attemptId: attempt.id,
      examId: attempt.examId,
      studentId: attempt.studentId,
      studentName: attempt.studentName,
      examTitle: exam.title,
      subjectId: exam.subject,
      totalQuestions,
      answeredCount,
      unansweredCount,
      correctCount,
      wrongCount,
      score,
      percentage: score,
      passed,
      durationSeconds: Math.round(duration),
      averageTimePerQuestion: totalQuestions > 0 ? Math.round(duration / totalQuestions) : 0,
      startedAt: attempt.startedAt,
      submittedAt: submittedAt,
      gradedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    };

    // 5. Save Result and Per-Question Results
    const resultDocRef = doc(db, RESULTS_COL, attemptId);
    const batch = writeBatch(db);
    
    batch.set(resultDocRef, result);

    // Save question results in subcollection
    const qResCol = collection(db, RESULTS_COL, attemptId, 'questionResults');
    questionResults.forEach(qr => {
      const qrRef = doc(qResCol, qr.questionId);
      batch.set(qrRef, qr);
    });

    // Update attempt status
    batch.update(doc(db, 'attempts', attemptId), { status: 'graded' });

    await batch.commit();

    return { id: attemptId, ...result } as AttemptResult;
  },

  async getStudentResults(studentId: string): Promise<AttemptResult[]> {
    const q = query(
      collection(db, RESULTS_COL),
      where('studentId', '==', studentId),
      orderBy('submittedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AttemptResult));
  },

  async getResultById(resultId: string): Promise<AttemptResult | null> {
    const snap = await getDoc(doc(db, RESULTS_COL, resultId));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as AttemptResult;
    }
    return null;
  },

  async getQuestionResults(resultId: string): Promise<QuestionResult[]> {
    const q = query(
      collection(db, RESULTS_COL, resultId, 'questionResults'),
      orderBy('questionNumber', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => d.data() as QuestionResult);
  },

  async getResultsByExam(examId: string): Promise<AttemptResult[]> {
    const q = query(
      collection(db, RESULTS_COL),
      where('examId', '==', examId),
      orderBy('submittedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AttemptResult));
  },

  async getAllResults(pageSize: number = 20, lastDoc?: any): Promise<AttemptResult[]> {
    let q = query(
      collection(db, RESULTS_COL),
      orderBy('submittedAt', 'desc'),
      limit(pageSize)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AttemptResult));
  }
};
