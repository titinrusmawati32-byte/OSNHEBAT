import { SubjectType } from './auth';

export type ResultStatus = 'graded' | 'grading_failed';

export interface QuestionResult {
  questionId: string;
  questionNumber: number;
  selectedOption: 'A' | 'B' | 'C' | 'D' | '';
  isAnswered: boolean;
  isCorrect: boolean;
  timeSpentSeconds: number;
  subjectId: string;
  difficulty: 'easy' | 'medium' | 'hard';
  // Note: correctAnswer and explanation are only included in UI if exam settings allow
}

export interface AttemptResult {
  id: string; // matches attemptId
  attemptId: string;
  examId: string;
  studentId: string;
  studentName: string;
  studentClass?: string;
  
  examTitle: string;
  subjectId: SubjectType;

  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;

  correctCount: number;
  wrongCount: number;

  score: number;
  percentage: number;

  passed: boolean;

  durationSeconds: number;
  averageTimePerQuestion: number;

  startedAt: any;
  submittedAt: any;
  gradedAt: any;

  createdAt: any;
}

export interface SubjectStatistics {
  subjectId: string;
  averageScore: number;
  totalParticipants: number;
  passRate: number;
}

export interface DifficultyStatistics {
  easyAccuracy: number;
  mediumAccuracy: number;
  hardAccuracy: number;
}

export interface QuestionStatistics {
  questionId: string;
  totalParticipants: number;
  correctCount: number;
  wrongCount: number;
  unansweredCount: number;
  correctPercentage: number;
  distractorAnalysis: {
    A: number;
    B: number;
    C: number;
    D: number;
  };
}

export interface ExamStatistics {
  totalParticipants: number;
  completedCount: number;
  averageScore: number;
  medianScore: number;
  highestScore: number;
  lowestScore: number;
  passPercentage: number;
}
