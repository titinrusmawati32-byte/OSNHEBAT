import React from 'react';
import { ParsedQuestion } from '../../types/question';
import {
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Image as ImageIcon,
  Eye,
  FileSearch,
  Trash2,
  Sparkles,
} from 'lucide-react';

interface QuestionReviewCardProps {
  question: ParsedQuestion;
  index: number;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  onEdit: (q: ParsedQuestion) => void;
  onManageImage: (q: ParsedQuestion) => void;
  onPreview: (q: ParsedQuestion) => void;
  onCompare: (q: ParsedQuestion) => void;
  onDelete: (id: string) => void;
}

export const QuestionReviewCard: React.FC<QuestionReviewCardProps> = ({
  question,
  index,
  isSelected,
  onToggleSelect,
  onEdit,
  onManageImage,
  onPreview,
  onCompare,
  onDelete,
}) => {
  const getStatusBadge = () => {
    if (question.needsReview) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-3 h-3" />
          <span>Perlu Review</span>
        </span>
      );
    }
    if (question.isEdited) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Edit3 className="w-3 h-3" />
          <span>Diubah</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
        <CheckCircle2 className="w-3 h-3" />
        <span>Valid</span>
      </span>
    );
  };

  return (
    <div
      id={`q-card-${question.id}`}
      className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all text-left space-y-4 ${
        question.needsReview
          ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/15 dark:bg-amber-950/10'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
          )}

          <span className="font-mono text-xs font-black px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
            SOAL {String(question.questionNumber || index + 1).padStart(2, '0')}
          </span>

          {getStatusBadge()}

          {question.imageUrl && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              <ImageIcon className="w-3 h-3" />
              <span>Gambar</span>
            </span>
          )}

          {question.isDuplicate && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
              Duplikat
            </span>
          )}
        </div>

        <div className="text-[11px] font-bold text-slate-400">
          Tingkat:{' '}
          <span className="text-slate-700 dark:text-slate-300 capitalize">
            {question.difficulty === 'easy'
              ? 'Mudah'
              : question.difficulty === 'hard'
              ? 'Sulit'
              : 'Sedang'}
          </span>
        </div>
      </div>

      {/* Review Warning Banner if needs review */}
      {question.needsReview && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/60 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">Perlu Review:</span>{' '}
            {question.reviewReason || 'Terdapat data soal yang belum lengkap atau perlu pemeriksaan.'}
          </div>
          <button
            type="button"
            onClick={() => onEdit(question)}
            className="font-bold text-blue-600 dark:text-blue-400 underline hover:text-blue-700 shrink-0 cursor-pointer"
          >
            Lengkapi Sekarang
          </button>
        </div>
      )}

      {/* Question Text */}
      <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
        {question.questionText}
      </div>

      {/* Attached Image Thumbnail */}
      {question.imageUrl && (
        <div className="relative inline-block rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-1 max-w-sm">
          <img
            src={question.imageUrl}
            alt={question.imageAlt || 'Gambar soal'}
            className="h-28 w-auto object-contain rounded-lg"
          />
          {question.imageAlt && (
            <div className="text-[10px] text-slate-500 italic mt-1 px-1">
              Alt: {question.imageAlt}
            </div>
          )}
        </div>
      )}

      {/* Options Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        {(['A', 'B', 'C', 'D'] as const).map((key) => {
          const isKey = question.correctAnswer === key;
          const optContent = question.options[key];

          return (
            <div
              key={key}
              className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                isKey
                  ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold'
                  : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-850 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-md text-[11px] font-black flex items-center justify-center shrink-0 ${
                  isKey
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {key}
              </span>
              <span className="leading-snug break-words">
                {optContent || <span className="text-rose-500 italic font-normal">(Belum terisi)</span>}
              </span>
              {isKey && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0 mt-0.5" />}
            </div>
          );
        })}
      </div>

      {/* Answer Key & Explanation snippet */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-bold">Kunci:</span>
          {question.correctAnswer ? (
            <span className="font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
              Pilihan {question.correctAnswer}
            </span>
          ) : (
            <span className="text-rose-500 font-bold">(Belum ditentukan)</span>
          )}

          {question.explanation && (
            <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate max-w-xs ml-2">
              • {question.explanation}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(question)}
            className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>

          <button
            type="button"
            onClick={() => onManageImage(question)}
            className={`px-2.5 py-1 text-xs font-bold rounded-xl border flex items-center gap-1 cursor-pointer transition-colors ${
              question.imageUrl
                ? 'border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-950/30'
                : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{question.imageUrl ? 'Kelola Gambar' : '+ Gambar'}</span>
          </button>

          <button
            type="button"
            onClick={() => onPreview(question)}
            className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview</span>
          </button>

          <button
            type="button"
            onClick={() => onCompare(question)}
            className="p-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer transition-colors"
            title="Bandingkan Teks Asli vs Hasil Parsing"
          >
            <FileSearch className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onDelete(question.id)}
            className="p-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
            title="Hapus Soal ini dari Review"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
