import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Textarea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { ParsedQuestion, QuestionDifficulty } from '../../types/question';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface QuestionEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: ParsedQuestion | null;
  onSave: (updated: ParsedQuestion) => void;
}

export const QuestionEditModal: React.FC<QuestionEditModalProps> = ({
  isOpen,
  onClose,
  question,
  onSave,
}) => {
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [questionText, setQuestionText] = useState<string>('');
  const [optionA, setOptionA] = useState<string>('');
  const [optionB, setOptionB] = useState<string>('');
  const [optionC, setOptionC] = useState<string>('');
  const [optionD, setOptionD] = useState<string>('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D' | ''>('A');
  const [explanation, setExplanation] = useState<string>('');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');

  useEffect(() => {
    if (question) {
      setQuestionNumber(question.questionNumber || 1);
      setQuestionText(question.questionText || '');
      setOptionA(question.options.A || '');
      setOptionB(question.options.B || '');
      setOptionC(question.options.C || '');
      setOptionD(question.options.D || '');
      setCorrectAnswer(question.correctAnswer || 'A');
      setExplanation(question.explanation || '');
      setDifficulty(question.difficulty || 'medium');
    }
  }, [question]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question) return;

    const optA = optionA.trim();
    const optB = optionB.trim();
    const optC = optionC.trim();
    const optD = optionD.trim();
    const qText = questionText.trim();

    const missingFields: string[] = [];
    if (!qText) missingFields.push('Pertanyaan kosong.');
    if (!optA || !optB) missingFields.push('Opsi A atau B belum lengkap.');
    if (!optC) missingFields.push('Opsi C belum lengkap.');
    if (!optD) missingFields.push('Opsi D belum lengkap.');
    if (!correctAnswer) missingFields.push('Kunci jawaban belum dipilih.');

    const needsReview = missingFields.length > 0;

    const updated: ParsedQuestion = {
      ...question,
      questionNumber,
      questionText: qText,
      options: {
        A: optA,
        B: optB,
        C: optC,
        D: optD,
      },
      correctAnswer: correctAnswer || 'A',
      explanation: explanation.trim() || undefined,
      difficulty,
      isEdited: true,
      needsReview,
      reviewReason: needsReview ? missingFields.join(' ') : undefined,
      confidence: needsReview ? 'medium' : 'high',
    };

    onSave(updated);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Koreksi Soal ${questionNumber ? `No. ${questionNumber}` : ''}`}
      description="Perbaiki teks pertanyaan, opsi pilihan, dan kunci jawaban hasil ekstraksi"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left pt-2">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Nomor Soal"
            type="number"
            min={1}
            value={questionNumber}
            onChange={(e) => setQuestionNumber(parseInt(e.target.value, 10) || 1)}
            required
          />

          <Select
            label="Tingkat Kesulitan"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as QuestionDifficulty)}
            options={[
              { value: 'easy', label: 'Mudah' },
              { value: 'medium', label: 'Sedang' },
              { value: 'hard', label: 'Sulit' },
            ]}
          />
        </div>

        <Textarea
          label="Teks Pertanyaan"
          rows={3}
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Tuliskan teks pertanyaan soal olimpiade..."
          required
        />

        {/* Options A, B, C, D */}
        <div className="space-y-2.5 pt-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Pilihan Jawaban (A, B, C, D):
          </label>

          <div className="space-y-2">
            {[
              { key: 'A', val: optionA, setVal: setOptionA },
              { key: 'B', val: optionB, setVal: setOptionB },
              { key: 'C', val: optionC, setVal: setOptionC },
              { key: 'D', val: optionD, setVal: setOptionD },
            ].map((opt) => (
              <div key={opt.key} className="flex items-center gap-2">
                <span
                  className={`w-7 h-7 rounded-lg text-xs font-black flex items-center justify-center shrink-0 border ${
                    correctAnswer === opt.key
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {opt.key}
                </span>
                <input
                  type="text"
                  value={opt.val}
                  onChange={(e) => opt.setVal(e.target.value)}
                  placeholder={`Isi pilihan ${opt.key}...`}
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Kunci Jawaban Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Pilih Kunci Jawaban Benar:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['A', 'B', 'C', 'D'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setCorrectAnswer(k)}
                className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  correctAnswer === k
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                Kunci {k}
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        <Textarea
          label="Pembahasan Soal (Opsional)"
          rows={2}
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Tuliskan langkah penyelesaian atau konsep sains yang mendasari..."
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" size="sm" type="submit">
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
