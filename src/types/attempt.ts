export type AttemptStatus = 'active' | 'submitted' | 'timeout' | 'graded';

export interface QuestionAnswer {
  questionId: string;
  selectedOption: 'A' | 'B' | 'C' | 'D' | '';
  isMarked: boolean;
  timeSpentSeconds: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  subjectId: string;
  status: AttemptStatus;
  answers: Record<string, QuestionAnswer>; // questionId -> answer
  startedAt: any;
  lastActiveAt: any;
  submittedAt?: any;
  remainingSeconds: number;
}
