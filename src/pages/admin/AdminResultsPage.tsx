import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { resultService } from '../../services/resultService';
import { AttemptResult } from '../../types/result';
import { Button } from '../../components/ui/Button';
import { 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  Users,
  Layers,
  Activity,
  Globe,
  PieChart
} from 'lucide-react';

export const AdminResultsPage: React.FC = () => {
  const { showToast } = useToast();
  const [results, setResults] = useState<AttemptResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await resultService.getAllResults(50);
        setResults(data);
      } catch (err) {
        showToast('Gagal memuat data sistem.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const stats = {
    totalAttempts: results.length,
    avgSystemScore: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) : 0,
    activeExams: new Set(results.map(r => r.examId)).size,
    totalStudents: new Set(results.map(r => r.studentId)).size,
  };

  return (
    <div className="space-y-6 text-left pb-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 text-white">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-black uppercase tracking-wider mb-2">
            <Globe className="w-3.5 h-3.5" />
            <span>Sistem Monitoring Global</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            Analisis Seluruh Bidang
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Pantau performa sistem CBT secara real-time, statistik kelulusan antar bidang, dan efektivitas paket soal olimpiade.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => showToast('Export data masal sedang diproses...', 'info')}
          leftIcon={<Download className="w-4 h-4" />}
          className="shrink-0 w-full sm:w-auto bg-blue-600 hover:bg-blue-700 border-none"
        >
          REKAP SELURUH DATA
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Attempt', value: stats.totalAttempts, icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Rata-rata Sistem', value: stats.avgSystemScore, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Paket Ujian Aktif', value: stats.activeExams, icon: Layers, color: 'text-amber-500', bg: 'bg-amber-50' },
          { label: 'Siswa Berpartisipasi', value: stats.totalStudents, icon: Users, color: 'text-purple-500', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${s.bg} dark:bg-opacity-10 ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
                <div className="text-xl font-black text-slate-900 dark:text-slate-100">{s.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder for complex charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <PieChart className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Performa per Bidang</h4>
            <p className="text-xs text-slate-400">Visualisasi statistik IPA, IPS, MTK, Inggris akan tampil di sini.</p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs min-h-[300px] flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
            <Activity className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 dark:text-slate-200">Trend Pengerjaan</h4>
            <p className="text-xs text-slate-400">Statistik aktivitas pengerjaan harian sedang dikumpulkan.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
