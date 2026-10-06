import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ParsedQuestion, Question } from '../../types/question';

interface QuestionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: ParsedQuestion | Question | null;
  subjectName?: string;
}

export const QuestionPreviewModal: React.FC<QuestionPreviewModalProps> = ({
  isOpen,
  onClose,
  question,
  subjectName = 'Olimpiade SD',
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  if (!question) return null;

  const options = question.options || {
    A: (question as any).optionA || '',
    B: (question as any).optionB || '',
    C: (question as any).optionC || '',
    D: (question as any).optionD || '',
  };

  const questionText = question.questionText || (question as any).question || '';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Simulasi Tampilan Siswa"
      description="Pratinjau bagaimana butir soal ini akan ditampilkan pada layar ujian siswa"
      size="md"
    >
      <div className="space-y-5 text-left pt-2">
        {/* Exam Header Simulator */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {subjectName}
          </span>
          <span className="text-xs font-mono font-bold text-slate-500">
            Nomor {question.questionNumber || 1}
          </span>
        </div>

        {/* Question Text */}
        <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
          {questionText}
        </div>

        {/* Attached Image if any */}
        {question.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-h-64 flex items-center justify-center p-2">
            <img
              src={question.imageUrl}
              alt={question.imageAlt || 'Gambar Soal'}
              className="max-h-60 w-auto object-contain rounded-xl"
            />
          </div>
        )}

        {/* Radio Options A, B, C, D */}
        <div className="space-y-2 pt-2">
          {(['A', 'B', 'C', 'D'] as const).map((key) => {
            const optText = options[key];
            const isSelected = selectedOption === key;

            return (
              <label
                key={key}
                onClick={() => setSelectedOption(key)}
                className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 ring-1 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 border mt-0.5 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {key}
                </div>
                <div className="text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug">
                  {optText || <span className="text-slate-400 italic">(Opsi kosong)</span>}
                </div>
              </label>
            );
          })}
        </div>

        {/* Footer simulation info */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 text-center">
          Kunci jawaban dan pembahasan disembunyikan dalam mode pratinjau siswa ini.
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup Pratinjau
          </Button>
        </div>
      </div>
    </Modal>
  );
};
