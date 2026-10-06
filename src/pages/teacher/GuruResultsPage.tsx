import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { resultService } from '../../services/resultService';
import { AttemptResult } from '../../types/result';
import { ResultCard } from '../../components/results/ResultCard';
import { Button } from '../../components/ui/Button';
import { 
  FileCheck, 
  Search, 
  Filter, 
  Download, 
  LayoutDashboard,
  Users,
  Layers,
  TrendingUp,
  Percent,
  CheckCircle2,
  Trophy
} from 'lucide-react';

export const GuruResultsPage: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [results, setResults] = useState<AttemptResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // For guru, we fetch all for now or filter by subject
        // In a real app, guru only sees results for exams they created
        const data = await resultService.getAllResults();
        setResults(data);
      } catch (err) {
        showToast('Gagal memuat data hasil.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  const filteredResults = results.filter(r => {
    if (subjectFilter !== 'all' && r.subjectId !== subjectFilter) return false;
    return r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
           r.examTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const stats = {
    totalParticipants: results.length,
    averageScore: results.length > 0 ? Math.round(results.reduce((acc, r) => acc + r.score, 0) / results.length) : 0,
    passRate: results.length > 0 ? Math.round((results.filter(r => r.passed).length / results.length) * 100) : 0,
    highestScore: results.length > 0 ? Math.max(...results.map(r => r.score)) : 0,
  };

  return (
    <div className="space-y-6 text-left pb-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black uppercase tracking-wider mb-2">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Pusat Data Hasil Ujian</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Monitor & Analisis Nilai
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Rekapitulasi pencapaian nilai peserta olimpiade, analisis pola kesalahan, dan identifikasi area yang memerlukan penguatan.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={() => showToast('Fitur export CSV sedang disiapkan.', 'info')}
          leftIcon={<Download className="w-4 h-4" />}
          className="shrink-0 w-full sm:w-auto"
        >
          EXPORT HASIL (.CSV)
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Peserta', value: stats.totalParticipants, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Rata-rata Nilai', value: stats.averageScore, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tingkat Kelulusan', value: `${stats.passRate}%`, icon: Percent, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Skor Tertinggi', value: stats.highestScore, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa atau ujian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-hidden font-bold"
        >
          <option value="all">Semua Bidang</option>
          <option value="ipa">IPA (Sains)</option>
          <option value="ips">IPS (Sosial)</option>
          <option value="matematika">Matematika</option>
          <option value="bahasa_inggris">B. Inggris</option>
        </select>
      </div>

      {/* Results List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Memuat data hasil pengerjaan...</div>
      ) : filteredResults.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Belum ada hasil ditemukan
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Daftar nilai akan muncul setelah siswa menyelesaikan sesi ujian yang telah dijadwalkan.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Daftar Hasil Terkini</span>
            <span className="text-[10px] font-bold text-slate-400">{filteredResults.length} Rekaman</span>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {filteredResults.map((result) => (
              <div key={result.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-lg text-slate-600 dark:text-slate-300 shrink-0">
                    {result.studentName.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-black text-slate-900 dark:text-slate-100 truncate">{result.studentName}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">{result.examTitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-center sm:text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Nilai</div>
                    <div className={`text-2xl font-black ${result.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {result.score}
                    </div>
                  </div>
                  <div className="hidden md:block text-right">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Benar/Total</div>
                    <div className="text-sm font-black text-slate-700 dark:text-slate-200">
                      {result.correctCount} / {result.totalQuestions}
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl font-bold"
                    onClick={() => navigate(`/guru/results/${result.id}`)}
                  >
                    Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
