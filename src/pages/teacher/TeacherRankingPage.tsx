import React from 'react';

export const TeacherRankingPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Peringkat Pembinaan
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Papan peringkat peserta olimpiade tingkat sekolah dasar.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4">
        <div className="text-xs text-slate-500">
          Klasemen ranking per bidang akan dihitung otomatis saat skor tersedia.
        </div>
      </div>
    </div>
  );
};
