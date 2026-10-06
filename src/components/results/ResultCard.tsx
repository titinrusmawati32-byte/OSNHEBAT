import React from 'react';
import { AttemptResult } from '../../types/result';
import { Button } from '../ui/Button';
import { formatDuration } from '../../utils/resultAnalytics';
import { 
  Trophy, 
  Calendar, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface ResultCardProps {
  result: AttemptResult;
  onClick: (id: string) => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onClick }) => {
  const isPassed = result.passed;
  const dateStr = result.submittedAt?.toDate 
    ? result.submittedAt.toDate().toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'short', year: 'numeric' 
      })
    : '-';

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group flex flex-col sm:flex-row gap-6">
      <div className="flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {result.subjectId?.toUpperCase() || ''}
          </span>
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {dateStr}
          </span>
        </div>

        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">
            {result.examTitle}
          </h3>
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 font-bold">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {result.correctCount} Benar
            </span>
            <span className="flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              {result.wrongCount} Salah
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-blue-500" />
              {formatDuration(result.durationSeconds)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 shrink-0 sm:pl-6 sm:border-l border-slate-100 dark:border-slate-800">
        <div className="text-right">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Skor Akhir</div>
          <div className={`text-4xl font-black ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {result.score}
          </div>
          <div className={`text-[10px] font-black uppercase tracking-wider mt-1 ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPassed ? 'LULUS' : 'BELUM LULUS'}
          </div>
        </div>

        <Button 
          variant="primary" 
          size="sm" 
          onClick={() => onClick(result.id)}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="rounded-xl shadow-xs"
        >
          Lihat Detail
        </Button>
      </div>
    </div>
  );
};
