import React from 'react';

export const TeacherResultsPage: React.FC = () => {
  return (
    <div className="space-y-6 text-left">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Hasil & Analisis Siswa
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Rekapitulasi pencapaian nilai peserta olimpiade binaan Anda.
        </p>
      </div>
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center space-y-4">
        <div className="text-xs text-slate-500">
          Hasil pengerjaan siswa akan tampil di sini setelah ujian dilaksanakan.
        </div>
      </div>
    </div>
  );
};
