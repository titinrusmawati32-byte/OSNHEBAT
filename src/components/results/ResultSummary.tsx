import React from 'react';
import { AttemptResult } from '../../types/result';
import { formatDuration } from '../../utils/resultAnalytics';
import { CheckCircle2, XCircle, HelpCircle, Clock, Percent, Trophy } from 'lucide-react';

interface ResultSummaryProps {
  result: AttemptResult;
}

export const ResultSummary: React.FC<ResultSummaryProps> = ({ result }) => {
  const isPassed = result.passed;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs text-center relative overflow-hidden">
        {/* Decorative background circle */}
        <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-10 ${isPassed ? 'bg-emerald-500' : 'bg-rose-500'}`} />
        
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-xs font-black uppercase tracking-widest text-slate-500">
            Skor Akhir Ujian
          </div>

          <div className="flex flex-col items-center justify-center">
            <span className={`text-8xl font-black tracking-tighter ${isPassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {result.score}
            </span>
            <div className={`mt-2 px-6 py-2 rounded-2xl text-sm font-black uppercase tracking-wider border-2 shadow-sm ${
              isPassed 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}>
              {isPassed ? 'LULUS' : 'BELUM LULUS'}
            </div>
          </div>

          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">
            {isPassed 
              ? 'Selamat! Anda telah mencapai ambang batas nilai yang ditentukan untuk bidang ini.' 
              : 'Terus semangat! Anda dapat mempelajari kembali materi yang belum dikuasai melalui pembahasan.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Soal', value: result.totalQuestions, icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Benar', value: result.correctCount, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Salah', value: result.wrongCount, icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50' },
          { label: 'Kosong', value: result.unansweredCount, icon: HelpCircle, color: 'text-slate-400', bg: 'bg-slate-50' },
        ].map((item, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col items-center justify-center text-center">
            <div className={`p-2.5 rounded-xl ${item.bg} dark:bg-opacity-10 mb-2`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div className="text-2xl font-black text-slate-900 dark:text-slate-100 leading-none mb-1">
              {item.value}
            </div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
            <Percent className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Akurasi Jawaban</div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">{result.percentage}%</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center shrink-0 border border-purple-100 dark:border-purple-800">
            <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Waktu Pengerjaan</div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100">{formatDuration(result.durationSeconds)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
