export * from './auth';
export * from './question';
export * from './exam';

export type UserRole = 'admin' | 'teacher' | 'student' | 'guru' | 'siswa';

export type SubjectId = 'ipa' | 'ips' | 'matematika' | 'bahasa_inggris' | 'inggris';

export type Theme = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'teacher' | 'student';
  email?: string;
  school?: string;
  grade?: string;
  avatar?: string;
  subjectAccess?: SubjectId | 'all';
  createdAt?: string;
}

export interface Subject {
  id: SubjectId;
  name: string;
  code: string;
  color: 'emerald' | 'orange' | 'violet' | 'blue';
  description: string;
  icon: string;
  examCount: number;
}

export type DifficultyLevel = 'Mudah' | 'Sedang' | 'Sulit';

export interface Question {
  id: string;
  subjectId: SubjectId;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  difficulty: DifficultyLevel;
  createdBy: string;
  createdAt: string;
}

export type ExamStatus = 'Tersedia' | 'Berjalan' | 'Selesai' | 'Draf';

export interface Exam {
  id: string;
  title: string;
  subjectId: SubjectId;
  description: string;
  questionCount: number;
  durationMinutes: number;
  status: ExamStatus;
  startDate?: string;
  endDate?: string;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  showResultsImmediately?: boolean;
}

export interface Result {
  id: string;
  examId: string;
  examTitle: string;
  subjectId: SubjectId;
  studentId: string;
  studentName: string;
  score: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  durationSeconds: number;
  submittedAt: string;
}

export interface NavigationItem {
  name: string;
  path: string;
  icon: string;
  badge?: string | number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}
