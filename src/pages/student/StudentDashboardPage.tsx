import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { APP_SUBJECTS } from '../../constants/subjects';
import { examService } from '../../services/examService';
import { SubjectCard } from '../../components/dashboard/SubjectCard';
import { ExamCard } from '../../components/dashboard/ExamCard';
import { StatCard } from '../../components/dashboard/StatCard';
import { statsService, StudentStats } from '../../services/statsService';
import { SubjectId } from '../../types';
import { ExamPackage } from '../../types/exam';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Award, FileText, CheckCircle2, Layers } from 'lucide-react';

export const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [selectedExamForModal, setSelectedExamForModal] = useState<ExamPackage | null>(null);
  const [stats, setStats] = useState<StudentStats>({
    examsTaken: 0,
    averageScore: 0,
    highestScore: 0,
    currentRank: 0,
  });
  const [availableExams, setAvailableExams] = useState<ExamPackage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (currentUser?.uid) {
        const [statsData, examsData] = await Promise.all([
          statsService.getStudentStats(currentUser.uid),
          examService.getActiveExams()
        ]);
        setStats(statsData);
        setAvailableExams(examsData);
      }
      setLoading(false);
    }
    loadData();
  }, [currentUser]);

  const filteredExams = availableExams.filter((exam) => {
    if (selectedSubject !== 'all' && exam.subject !== selectedSubject) {
      return false;
    }
    return true;
  });

  const handleExamClick = (exam: ExamPackage) => {
    setSelectedExamForModal(exam);
  };

  const handleStartExam = () => {
    if (selectedExamForModal) {
      navigate(`/student/exams/${selectedExamForModal.id}`);
      setSelectedExamForModal(null);
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Student Welcome Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {currentUser?.grade || 'Peserta Olimpiade'}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              {currentUser?.school || 'SD Mitra Prestasi'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 mt-2 tracking-tight">
            Selamat datang, {currentUser?.name} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Siap mengikuti pembinaan hari ini? Pilih bidang di bawah untuk memulai latihan.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/student/history')}
            leftIcon={<Award className="w-4 h-4 text-blue-600" />}
          >
            Riwayat Nilai
          </Button>
        </div>
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Ujian Diikuti"
          value={loading ? '...' : stats.examsTaken}
          subtitle="Paket terselesaikan"
          icon={<FileText className="w-4 h-4 text-blue-600" />}
        />
        <StatCard
          title="Rata-rata Nilai"
          value={loading ? '...' : stats.averageScore}
          subtitle="Skala 100"
          icon={<Award className="w-4 h-4 text-emerald-600" />}
        />
        <StatCard
          title="Nilai Tertinggi"
          value={loading ? '...' : stats.highestScore}
          subtitle="Predikat Emas"
          icon={<CheckCircle2 className="w-4 h-4 text-amber-500" />}
        />
        <StatCard
          title="Peringkat Sekolah"
          value={loading ? '...' : (stats.currentRank > 0 ? `#${stats.currentRank}` : '-')}
          subtitle="Posisi saat ini"
          icon={<Award className="w-4 h-4 text-violet-600" />}
          color="violet"
        />
      </div>

      {/* 4 Subject Cards Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Bidang Olimpiade SD
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pilih bidang studi untuk memfilter paket ujian yang tersedia
            </p>
          </div>

          {selectedSubject !== 'all' && (
            <button
              onClick={() => setSelectedSubject('all')}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Tampilkan Semua ({availableExams.length})
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {APP_SUBJECTS.map((subj) => (
            <SubjectCard
              key={subj.id}
              id={subj.id as any}
              name={subj.name}
              code={subj.code}
              description={subj.description}
              color={subj.color}
              icon={subj.icon}
              examCount={availableExams.filter(e => e.subject === subj.id).length}
              onClick={() => {
                setSelectedSubject(selectedSubject === subj.id ? 'all' : subj.id as any);
                showToast(`Filter bidang: ${subj.name}`, 'info');
              }}
            />
          ))}
        </div>
      </div>

      {/* Section Ujian Tersedia */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Ujian Tersedia
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filteredExams.length} paket ujian siap dikerjakan
            </p>
          </div>
        </div>

        {filteredExams.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <Layers className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada ujian yang tersedia untuk filter ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExams.map((exam) => (
              <ExamCard
                key={exam.id}
                exam={exam as any}
                onAction={() => handleExamClick(exam)}
                actionLabel="LIHAT UJIAN"
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal Preview Ujian */}
      {selectedExamForModal && (
        <Modal
          isOpen={!!selectedExamForModal}
          onClose={() => setSelectedExamForModal(null)}
          title="Detail Paket Ujian"
          description="Informasi petunjuk pelaksanaan ujian CBT"
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base">
                {selectedExamForModal.title}
              </h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                {selectedExamForModal.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold">Jumlah Soal</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  {selectedExamForModal.questionIds?.length || 0} Butir
                </span>
              </div>
              <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-400 block font-semibold">Alokasi Waktu</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                  {selectedExamForModal.durationMinutes} Menit
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/50 rounded-xl border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Petunjuk:</strong> Pastikan koneksi internet stabil sebelum memulai ujian. Jawaban akan disimpan secara otomatis.
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedExamForModal(null)}
              >
                Tutup
              </Button>
              <Button variant="primary" size="sm" onClick={handleStartExam}>
                Mulai Ujian Sekarang
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
