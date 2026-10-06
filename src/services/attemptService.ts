import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ExamAttempt, QuestionAnswer } from '../types/attempt';
import { UserProfile } from '../types/auth';
import { ExamPackage } from '../types/exam';

const ATTEMPTS_COL = 'attempts';

export const attemptService = {
  async createAttempt(exam: ExamPackage, user: UserProfile): Promise<string> {
    const docRef = doc(collection(db, ATTEMPTS_COL));
    
    const attempt: ExamAttempt = {
      id: docRef.id,
      examId: exam.id,
      studentId: user.uid,
      studentName: user.displayName || user.name || user.username,
      subjectId: exam.subject,
      status: 'active',
      answers: {},
      startedAt: serverTimestamp(),
      lastActiveAt: serverTimestamp(),
      remainingSeconds: exam.durationMinutes * 60,
    };

    await setDoc(docRef, attempt);
    return docRef.id;
  },

  async saveAnswer(attemptId: string, questionId: string, option: 'A' | 'B' | 'C' | 'D' | '', timeSpent: number): Promise<void> {
    const docRef = doc(db, ATTEMPTS_COL, attemptId);
    const answer: QuestionAnswer = {
      questionId,
      selectedOption: option,
      isMarked: false,
      timeSpentSeconds: timeSpent
    };

    await updateDoc(docRef, {
      [`answers.${questionId}`]: answer,
      lastActiveAt: serverTimestamp()
    });
  },

  async submitAttempt(attemptId: string): Promise<void> {
    const docRef = doc(db, ATTEMPTS_COL, attemptId);
    await updateDoc(docRef, {
      status: 'submitted',
      submittedAt: serverTimestamp()
    });
  }
};
