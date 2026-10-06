import { SubjectType } from './auth';

export type ExamStatus = 'draft' | 'active' | 'scheduled' | 'archived';
export type ExamDifficulty = 'easy' | 'medium' | 'hard' | 'mixed';

export interface ExamPackage {
  id: string;
  title: string;
  description: string;
  subject: SubjectType;
  category: string; // e.g., 'Pembinaan', 'Try Out', 'Lomba'
  durationMinutes: number;
  questionIds: string[]; // List of IDs from question bank
  settings: ExamSettings;
  status: ExamStatus;
  createdBy: string; // uid
  teacherName?: string;
  createdAt: any;
  updatedAt: any;
  scheduledAt?: any;
  expiresAt?: any;
}

export interface ExamSettings {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showScoreToStudent: boolean;
  allowReview: boolean;
  maxAttempts: number;
  passingScore?: number;
  preventMultipleTabs?: boolean;
}

export interface QuestionSummary {
  id: string;
  text: string;
  type: string;
  subject: SubjectType;
  difficulty: string;
}
