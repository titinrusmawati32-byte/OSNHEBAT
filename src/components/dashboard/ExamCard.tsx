import React from 'react';
import { Exam } from '../../types';
import { Clock, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';

export interface ExamCardProps {
  exam: Exam;
  onAction?: (exam: Exam) => void;
  actionLabel?: string;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onAction,
  actionLabel = 'LIHAT UJIAN',
}) => {
  const getSubjectBadge = () => {
    switch (exam.subjectId) {
      case 'ipa':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'ips':
        return 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
      case 'matematika':
        return 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800';
      case 'bahasa_inggris':
      case 'inggris':
        return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getSubjectBadge()}`}>
            {exam.subjectId}
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {exam.status}
          </span>
        </div>

        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-2">
          {exam.title}
        </h4>

        {exam.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {exam.description}
          </p>
        )}

        <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{exam.questionCount} Soal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>{exam.durationMinutes} Menit</span>
          </div>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <Button
          variant="primary"
          size="sm"
          className="w-full"
          onClick={() => onAction && onAction(exam)}
          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {title}
        </span>
        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-200 dark:border-slate-700">
          {icon}
        </div>
      </div>

      <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100">
        {value}
      </div>

      {(subtitle || trend) && (
        <div className="mt-2 text-xs flex items-center justify-between text-slate-500 dark:text-slate-400">
          {subtitle && <span>{subtitle}</span>}
          {trend && <span className="text-emerald-600 dark:text-emerald-400 font-bold">{trend}</span>}
        </div>
      )}
    </div>
  );
};
