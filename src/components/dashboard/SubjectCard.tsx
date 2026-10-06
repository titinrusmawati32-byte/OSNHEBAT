import React from 'react';
import { SubjectId } from '../../types';
import { Atom, Globe, Calculator, BookOpen, ChevronRight } from 'lucide-react';

export interface SubjectCardProps {
  id: SubjectId;
  name: string;
  code?: string;
  description?: string;
  color: 'emerald' | 'orange' | 'violet' | 'blue';
  icon: string;
  examCount: number;
  onClick?: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  id,
  name,
  code,
  description,
  color,
  icon,
  examCount,
  onClick,
}) => {
  const renderIcon = () => {
    switch (id) {
      case 'ipa':
        return <Atom className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'ips':
        return <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />;
      case 'matematika':
        return <Calculator className="w-5 h-5 text-violet-600 dark:text-violet-400" />;
      case 'bahasa_inggris':
      case 'inggris':
        return <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return <Atom className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBorderHover = () => {
    switch (color) {
      case 'emerald':
        return 'hover:border-emerald-300 dark:hover:border-emerald-700/60';
      case 'orange':
        return 'hover:border-orange-300 dark:hover:border-orange-700/60';
      case 'violet':
        return 'hover:border-violet-300 dark:hover:border-violet-700/60';
      case 'blue':
        return 'hover:border-blue-300 dark:hover:border-blue-700/60';
    }
  };

  const getBadgeStyle = () => {
    switch (color) {
      case 'emerald':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'orange':
        return 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800';
      case 'violet':
        return 'bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/60 dark:text-violet-300 dark:border-violet-800';
      case 'blue':
        return 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs transition-all duration-200 cursor-pointer group ${getBorderHover()}`}
    >
      <div className="flex items-center justify-between mb-3.5">
        <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
          {renderIcon()}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase ${getBadgeStyle()}`}>
          {code || id}
        </span>
      </div>

      <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base tracking-tight">
        {name}
      </h4>

      {description && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 h-8 leading-relaxed">
          {description}
        </p>
      )}

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-600 dark:text-slate-300">
          {examCount} Ujian
        </span>
        <span className="font-bold text-blue-600 dark:text-blue-400 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
          <span>Lihat</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
