import React from 'react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: string;
  color?: 'blue' | 'emerald' | 'orange' | 'violet' | 'amber' | 'rose';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
}) => {
  const getColorStyles = () => {
    switch (color) {
      case 'emerald': return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50';
      case 'orange': return 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/50';
      case 'violet': return 'bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/50';
      case 'amber': return 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50';
      case 'rose': return 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/50';
      default: return 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-all text-left group hover:shadow-md">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-colors ${getColorStyles()}`}>
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
