export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export type QuestionSourceType = 'manual' | 'word' | 'excel' | 'pdf';

export type ImportSessionStatus = 'processing' | 'review' | 'completed' | 'cancelled';

export interface QuestionOptions {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface Question {
  id: string;
  subjectId: string;
  questionNumber?: number;
  questionText: string;
  options: QuestionOptions;
  correctAnswer: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  imageUrl?: string;
  imageAlt?: string;
  difficulty: QuestionDifficulty;
  createdBy: string;
  createdByName: string;
  sourceType: QuestionSourceType;
  sourceFileName?: string;
  importSessionId?: string;
  isActive: boolean;
  createdAt: any;
  updatedAt: any;

  // Compatibility helpers
  question?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
}

export interface ParsedQuestion {
  id: string; // temporary client id
  questionNumber?: number;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer?: 'A' | 'B' | 'C' | 'D' | '';
  explanation?: string;
  imageUrl?: string;
  imageAlt?: string;
  difficulty: QuestionDifficulty;
  needsReview: boolean;
  reviewReason?: string;
  confidence: 'high' | 'medium' | 'low';
  isEdited?: boolean;
  originalText?: string;
  isDuplicate?: boolean;
}

export interface QuestionImportSession {
  id: string;
  fileName: string;
  fileType: 'word' | 'excel' | 'pdf';
  subjectId: string;
  uploadedBy: string;
  uploadedByName: string;
  totalDetected: number;
  totalValid: number;
  totalNeedsReview: number;
  totalWithImages: number;
  status: ImportSessionStatus;
  parsedQuestions?: ParsedQuestion[]; // UI only or rebuilt from subcollection
  createdAt: any;
  completedAt?: any;
}
