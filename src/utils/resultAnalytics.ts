import { AttemptResult, QuestionResult, QuestionStatistics } from '../types/result';

export function calculateQuestionStatistics(
  results: AttemptResult[],
  questionResults: QuestionResult[]
): QuestionStatistics[] {
  const statsMap: Record<string, QuestionStatistics> = {};

  questionResults.forEach((qr) => {
    if (!statsMap[qr.questionId]) {
      statsMap[qr.questionId] = {
        questionId: qr.questionId,
        totalParticipants: 0,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
        correctPercentage: 0,
        distractorAnalysis: { A: 0, B: 0, C: 0, D: 0 },
      };
    }

    const s = statsMap[qr.questionId];
    s.totalParticipants++;
    if (qr.isCorrect) s.correctCount++;
    else if (qr.isAnswered) s.wrongCount++;
    else s.unansweredCount++;

    if (qr.selectedOption) {
      s.distractorAnalysis[qr.selectedOption]++;
    }
  });

  return Object.values(statsMap).map((s) => ({
    ...s,
    correctPercentage: Math.round((s.correctCount / s.totalParticipants) * 100),
  }));
}

export function getDifficultyLabel(percentage: number): string {
  if (percentage >= 80) return 'Penguasaan baik';
  if (percentage >= 60) return 'Perlu penguatan';
  return 'Perlu pembinaan';
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs} detik`;
  return `${mins} menit ${secs} detik`;
}
