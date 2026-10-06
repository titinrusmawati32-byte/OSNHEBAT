import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { StatCard } from '../../components/dashboard/StatCard';
import { statsService, AdminStats } from '../../services/statsService';
import { GraduationCap, Users, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { MaterialAnalyticsDashboard } from '../../components/materials/MaterialAnalyticsDashboard';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<AdminStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalQuestions: 0,
    totalExams: 0,
    activeExams: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await statsService.getAdminStats();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-8 text-left">
      {/* Admin Welcome Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            Pusat Kendali Administrator
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-2 tracking-tight">
            Dashboard Utama: {currentUser?.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Kelola data siswa, guru pembina, bank soal 4 bidang, dan pengawasan operasional ujian.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/students')}
            leftIcon={<GraduationCap className="w-4 h-4" />}
          >
            Kelola Siswa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/exams')}
            leftIcon={<Layers className="w-4 h-4" />}
          >
            Kelola Ujian
          </Button>
        </div>
      </div>

      {/* 5 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Total Siswa"
          value={loading ? '...' : stats.totalStudents}
          subtitle="Siswa SD terdaftar"
          icon={<GraduationCap className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          title="Total Guru"
          value={loading ? '...' : stats.totalTeachers}
          subtitle="Pembina 4 bidang"
          icon={<Users className="w-4 h-4 text-blue-600" />}
        />
        <StatCard
          title="Total Soal"
          value={loading ? '...' : stats.totalQuestions}
          subtitle="4 Bidang Olimpiade"
          icon={<BookOpen className="w-4 h-4 text-violet-600" />}
        />
        <StatCard
          title="Total Ujian"
          value={loading ? '...' : stats.totalExams}
          subtitle="Paket terdaftar"
          icon={<Layers className="w-4 h-4 text-orange-600" />}
        />
        <StatCard
          title="Ujian Aktif"
          value={loading ? '...' : stats.activeExams}
          subtitle="Siap dikerjakan"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
      </div>

      {/* Placeholder for Recent Activity - Could be fetched from a logs collection if needed */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
            Informasi Sistem
          </h3>
          <span className="text-xs text-slate-400">Monitoring realtime</span>
        </div>

        <div className="flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6 text-slate-300 dark:text-slate-600" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Sistem berjalan dengan normal</p>
          <p className="text-xs text-slate-400 mt-1 text-balance">Semua modul operasional berfungsi dengan baik.</p>
        </div>
      </div>

      {/* Material Analytics Section */}
      <MaterialAnalyticsDashboard role="admin" />
    </div>
  );
};
