import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { resultService } from '../../services/resultService';
import { AttemptResult } from '../../types/result';
import { ResultCard } from '../../components/results/ResultCard';
import { History, Trophy, Filter, Search, BookOpen } from 'lucide-react';

export const StudentResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [results, setResults] = useState<AttemptResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      if (!profile) return;
      setLoading(true);
      try {
        const data = await resultService.getStudentResults(profile.uid);
        setResults(data);
      } catch (err) {
        console.error(err);
        showToast('Gagal memuat riwayat ujian.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [profile]);

  const filteredResults = results.filter(r => 
    r.examTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-blue-600" />
            Riwayat Ujian Saya
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daftar seluruh paket pembinaan olimpiade yang telah Anda selesaikan.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text"
            placeholder="Cari nama ujian..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-hidden focus:ring-2 focus:ring-blue-600"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400 flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
          Memuat riwayat ujian...
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-xs">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <Trophy className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            {searchQuery ? 'Hasil tidak ditemukan' : 'Belum ada riwayat ujian'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery 
              ? `Tidak ada hasil yang cocok dengan kata kunci "${searchQuery}".`
              : 'Anda belum menyelesaikan paket ujian apapun. Silakan pilih ujian yang tersedia pada menu Ujian.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredResults.map((result) => (
            <ResultCard 
              key={result.id} 
              result={result} 
              onClick={(id) => navigate(`/student/results/${id}`)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};


export const StudentHistoryPage: React.FC = () => {
  return <StudentResultsPage />;
};

export const StudentProfilePage: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto space-y-6 text-left">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          Profil Peserta Olimpiade
        </h3>
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <span className="text-slate-400 block text-xs uppercase font-bold">Nama Lengkap</span>
            <span className="font-bold text-slate-900 dark:text-slate-100 text-base">Budi Kurniawan</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs uppercase font-bold">Asal Sekolah</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">SD Negeri 01 Menteng</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs uppercase font-bold">Tingkat Kelas</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Kelas 5 SD</span>
          </div>
          <div>
            <span className="text-slate-400 block text-xs uppercase font-bold">Bidang Pilihan</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">IPA & Matematika</span>
          </div>
        </div>
      </div>
    </div>
  );
};
