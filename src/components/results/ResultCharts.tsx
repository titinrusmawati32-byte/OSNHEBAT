import React from 'react';

interface DonutChartProps {
  correct: number;
  wrong: number;
  unanswered: number;
  size?: number;
  strokeWidth?: number;
}

export const AccuracyDonut: React.FC<DonutChartProps> = ({
  correct,
  wrong,
  unanswered,
  size = 180,
  strokeWidth = 20,
}) => {
  const total = correct + wrong + unanswered;
  if (total === 0) return null;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const correctPct = (correct / total) * 100;
  const wrongPct = (wrong / total) * 100;
  
  const correctOffset = 0;
  const wrongOffset = (correctPct / 100) * circumference;
  const unansOffset = ((correctPct + wrongPct) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90 transform">
          {/* Background */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
          />
          {/* Correct */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (correctPct / 100) * circumference}
            className="text-emerald-500 transition-all duration-1000"
          />
          {/* Wrong */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (wrongPct / 100) * circumference}
            style={{ transform: `rotate(${(correctPct / 100) * 360}deg)`, transformOrigin: 'center' }}
            className="text-rose-500 transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-slate-900 dark:text-slate-100">{Math.round(correctPct)}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Akurasi</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="font-bold text-slate-600 dark:text-slate-400">Benar ({correct})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <span className="font-bold text-slate-600 dark:text-slate-400">Salah ({wrong})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-200 dark:bg-slate-700" />
          <span className="font-bold text-slate-600 dark:text-slate-400">Kosong ({unanswered})</span>
        </div>
      </div>
    </div>
  );
};

interface PillChartProps {
  label: string;
  percentage: number;
  color: string;
}

export const PillChart: React.FC<PillChartProps> = ({ label, percentage, color }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-end px-1">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-black text-slate-900 dark:text-slate-100">{percentage}%</span>
      </div>
      <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
