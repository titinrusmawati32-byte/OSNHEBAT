import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Input, Textarea, Select } from '../ui/Input';
import { Button } from '../ui/Button';
import { Question, QuestionDifficulty } from '../../types/question';
import { useAuth } from '../../contexts/AuthContext';
import { createQuestion } from '../../services/questionService';
import { useToast } from '../../contexts/ToastContext';

interface ManualQuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSubjectId?: string;
  onSuccess: (newQ: Question) => void;
}

export const ManualQuestionModal: React.FC<ManualQuestionModalProps> = ({
  isOpen,
  onClose,
  defaultSubjectId = 'ipa',
  onSuccess,
}) => {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [subjectId, setSubjectId] = useState(defaultSubjectId);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>('medium');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) {
      showToast('Harap isi teks pertanyaan serta pilihan A dan B.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createQuestion({
        subjectId,
        questionNumber,
        questionText: questionText.trim(),
        options: {
          A: optionA.trim(),
          B: optionB.trim(),
          C: optionC.trim(),
          D: optionD.trim(),
        },
        correctAnswer,
        explanation: explanation.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        imageAlt: imageAlt.trim() || undefined,
        difficulty,
        createdBy: profile.uid,
        createdByName: profile.displayName || profile.name || profile.username,
        sourceType: 'manual',
        isActive: true,
      });

      showToast('Soal manual berhasil disimpan ke Bank Soal!', 'success');
      onSuccess(created);
      onClose();

      // Reset
      setQuestionText('');
      setOptionA('');
      setOptionB('');
      setOptionC('');
      setOptionD('');
      setExplanation('');
      setImageUrl('');
      setImageAlt('');
    } catch (err: any) {
      console.error(err);
      showToast('Gagal menyimpan soal manual: ' + err.message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Soal Manual"
      description="Buat satu butir soal baru langsung ke Bank Soal CBT"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Bidang Olimpiade"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            options={[
              { value: 'ipa', label: 'IPA' },
              { value: 'ips', label: 'IPS' },
              { value: 'matematika', label: 'Matematika' },
              { value: 'bahasa_inggris', label: 'Bahasa Inggris' },
            ]}
          />

          <Input
            label="Nomor Soal (Opsional)"
            type="number"
            min={1}
            value={questionNumber}
            onChange={(e) => setQuestionNumber(parseInt(e.target.value, 10) || 1)}
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
          placeholder="Tuliskan butir soal olimpiade SD..."
          required
        />

        {/* Options */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Pilihan Jawaban (A, B, C, D):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Input
              label="Pilihan A"
              value={optionA}
              onChange={(e) => setOptionA(e.target.value)}
              placeholder="Opsi A..."
              required
            />
            <Input
              label="Pilihan B"
              value={optionB}
              onChange={(e) => setOptionB(e.target.value)}
              placeholder="Opsi B..."
              required
            />
            <Input
              label="Pilihan C"
              value={optionC}
              onChange={(e) => setOptionC(e.target.value)}
              placeholder="Opsi C..."
              required
            />
            <Input
              label="Pilihan D"
              value={optionD}
              onChange={(e) => setOptionD(e.target.value)}
              placeholder="Opsi D..."
              required
            />
          </div>
        </div>

        {/* Kunci Jawaban */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
            Kunci Jawaban Benar:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {(['A', 'B', 'C', 'D'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setCorrectAnswer(k)}
                className={`py-2 px-3 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  correctAnswer === k
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
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
          placeholder="Langkah penyelesaian ilmiah..."
        />

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button variant="primary" size="sm" type="submit" isLoading={isSubmitting}>
            Simpan Soal ke Bank
          </Button>
        </div>
      </form>
    </Modal>
  );
};
