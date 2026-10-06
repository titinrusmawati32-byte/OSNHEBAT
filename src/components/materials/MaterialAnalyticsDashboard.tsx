import React from 'react';
import { useMaterialAnalytics } from '../../hooks/useMaterialAnalytics';
import { BookOpen, FileText, Youtube, CheckCircle2, Layers, Archive, Users, Loader2 } from 'lucide-react';
import { StatCard } from '../dashboard/StatCard';

interface MaterialAnalyticsDashboardProps {
  teacherId?: string;
  role: 'admin' | 'teacher';
}

export const MaterialAnalyticsDashboard: React.FC<MaterialAnalyticsDashboardProps> = ({ teacherId, role }) => {
  const { stats, bySubject, byType, byStatus, teachers, activity, loading, error } = useMaterialAnalytics(teacherId);

  if (loading) {
    return (
      <div className="py-12 flex items-center justify-center gap-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Memuat Statistik Materi...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
        <p className="text-xs font-bold text-rose-500">{error}</p>
      </div>
    );
  }

  const maxSubjectCount = Math.max(...bySubject.map(s => s.count), 1);
  const maxTeacherCount = Math.max(...teachers.map(t => t.count), 1);

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Analitik Materi Pembinaan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Statistik dan distribusi konten modul pembelajaran nyata dari Firebase.
          </p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Materi"
          value={stats.total}
          subtitle="Modul tersimpan"
          icon={<BookOpen className="w-4 h-4 text-blue-600" />}
          color="blue"
        />
        <StatCard
          title="File PDF"
          value={stats.pdfCount}
          subtitle="Dokumen materi"
          icon={<FileText className="w-4 h-4 text-rose-600" />}
          color="rose"
        />
        <StatCard
          title="Video YouTube"
          value={stats.youtubeCount}
          subtitle="Referensi video"
          icon={<Youtube className="w-4 h-4 text-amber-500" />}
          color="amber"
        />
        <StatCard
          title="Dipublikasikan"
          value={stats.publishedCount}
          subtitle="Dapat diakses siswa"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          color="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Subject Distribution */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
            Distribusi per Mata Pelajaran
          </h4>
          
          {stats.total === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Belum ada data materi.</div>
          ) : (
            <div className="space-y-3 pt-2">
              {bySubject.map((subj) => {
                const percentage = Math.round((subj.count / maxSubjectCount) * 100);
                return (
                  <div key={subj.subjectId} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{subj.name}</span>
                      <span>{subj.count} Materi</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Material Types */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
            Komposisi Jenis Materi (PDF vs YouTube)
          </h4>

          {stats.total === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Belum ada data materi.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50 flex flex-col justify-between">
                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 mb-3">
                  <FileText className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">PDF</span>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.pdfCount}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Dokumen modul</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50 flex flex-col justify-between">
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-3">
                  <Youtube className="w-5 h-5" />
                  <span className="text-xs font-bold uppercase tracking-wider">YouTube</span>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100">{stats.youtubeCount}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Video referensi</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {role === 'admin' && teachers.length > 0 && (
          <div className="lg:col-span-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
              Kontribusi Materi oleh Guru Pembina
            </h4>
            <div className="space-y-3 pt-2">
              {teachers.map((t) => {
                const percentage = Math.round((t.count / maxTeacherCount) * 100);
                return (
                  <div key={t.teacherId} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                      <span>{t.teacherName}</span>
                      <span>{t.count} Materi</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-violet-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
