import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ParsedQuestion } from '../../types/question';

interface QuestionCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: ParsedQuestion | null;
}

export const QuestionCompareModal: React.FC<QuestionCompareModalProps> = ({
  isOpen,
  onClose,
  question,
}) => {
  if (!question) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Bandingkan Teks Soal No. ${question.questionNumber || 1}`}
      description="Periksa teks asli dokumen mentah terhadap hasil parsing struktur soal"
      size="lg"
    >
      <div className="space-y-4 text-left pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Original Text */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span>Teks Dokumen Asli</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                Raw Extracted
              </span>
            </div>
            <pre className="text-xs font-mono text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
              {question.originalText || '(Teks asli tidak tersedia)'}
            </pre>
          </div>

          {/* Right: Parsed Result */}
          <div className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 pb-2 border-b border-blue-200 dark:border-blue-900 flex items-center justify-between">
              <span>Hasil Parsing Terstruktur</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                JSON Object
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-800 dark:text-slate-200 max-h-80 overflow-y-auto pr-1">
              <div>
                <span className="font-bold text-slate-500">Pertanyaan:</span>
                <p className="mt-0.5">{question.questionText}</p>
              </div>

              <div className="space-y-1 pt-1">
                <span className="font-bold text-slate-500">Pilihan Jawaban:</span>
                <div>
                  <span className="font-bold">A.</span> {question.options.A || '-'}
                </div>
                <div>
                  <span className="font-bold">B.</span> {question.options.B || '-'}
                </div>
                <div>
                  <span className="font-bold">C.</span> {question.options.C || '-'}
                </div>
                <div>
                  <span className="font-bold">D.</span> {question.options.D || '-'}
                </div>
              </div>

              <div className="pt-1">
                <span className="font-bold text-slate-500">Kunci Jawaban:</span>{' '}
                <span className="font-black text-emerald-600 dark:text-emerald-400">
                  {question.correctAnswer || '(Belum terdeteksi)'}
                </span>
              </div>

              {question.explanation && (
                <div className="pt-1">
                  <span className="font-bold text-slate-500">Pembahasan:</span>
                  <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                    {question.explanation}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-3">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};
