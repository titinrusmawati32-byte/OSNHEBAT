import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { statsService, TeacherStats } from '../../services/statsService';
import { examService } from '../../services/examService';
import { ExamPackage } from '../../types/exam';
import { BookOpen, Layers, Users, Plus, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MaterialAnalyticsDashboard } from '../../components/materials/MaterialAnalyticsDashboard';

export const TeacherDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<TeacherStats>({
    totalQuestions: 0,
    totalExams: 0,
    activeExams: 0,
    totalParticipants: 0,
  });
  const [recentExams, setRecentExams] = useState<ExamPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (currentUser?.uid) {
        const [statsData, examsData] = await Promise.all([
          statsService.getTeacherStats(currentUser.uid),
          examService.getExamsByTeacher(currentUser.uid)
        ]);
        setStats(statsData);
        setRecentExams(examsData.slice(0, 3));
      }
      setLoading(false);
    }
    loadData();
  }, [currentUser]);

  return (
    <div className="space-y-8 text-left">
      {/* Teacher Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Guru Pembina Olimpiade
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-2 tracking-tight">
            Selamat datang, {currentUser?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Pantau bank soal, paket ujian, dan hasil pembinaan siswa olimpiade Anda.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/teacher/questions')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Tambah Soal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/teacher/exams')}
            leftIcon={<Layers className="w-4 h-4" />}
          >
            Buat Paket
          </Button>
        </div>
      </div>

      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Soal"
          value={loading ? '...' : stats.totalQuestions}
          subtitle="Tersimpan di Bank Soal"
          icon={<BookOpen className="w-4 h-4 text-blue-600" />}
        />
        <StatCard
          title="Paket Ujian"
          value={loading ? '...' : stats.totalExams}
          subtitle="Tersedia untuk siswa"
          icon={<Layers className="w-4 h-4 text-purple-600" />}
        />
        <StatCard
          title="Ujian Aktif"
          value={loading ? '...' : stats.activeExams}
          subtitle="Sedang berlangsung"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          title="Peserta Ujian"
          value={loading ? '...' : stats.totalParticipants}
          subtitle="Siswa terdaftar"
          icon={<Users className="w-4 h-4 text-amber-500" />}
        />
      </div>

      {/* Recent Exams & Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Paket Ujian Terbaru */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
              Paket Ujian Terbaru
            </h3>
            <button
              onClick={() => navigate('/teacher/exams')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Semua Paket</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {!loading && recentExams.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-sm">
                Belum ada paket ujian yang dibuat.
              </div>
            ) : (
              recentExams.map((exam) => (
                <div key={exam.id} className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {exam.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1 text-slate-400 text-xs">
                      <span className="uppercase font-bold text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {exam.subject}
                      </span>
                      <span>• {exam.questionIds?.length || 0} Soal</span>
                      <span>• {exam.durationMinutes} Menit</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                    {exam.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Monitoring Info */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
              Aktivitas Terkini
            </h3>
          </div>

          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 text-slate-300 dark:text-slate-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Monitoring Realtime Aktif</p>
            <p className="text-xs text-slate-400 mt-1">Semua aktivitas pembinaan terpantau dengan baik.</p>
          </div>
        </div>
      </div>

      {/* Material Analytics Section */}
      {currentUser?.uid && (
        <MaterialAnalyticsDashboard teacherId={currentUser.uid} role="teacher" />
      )}
    </div>
  );
};
