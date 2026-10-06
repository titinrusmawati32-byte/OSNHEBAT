import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Search, Layers, Clock, Play, Sparkles } from 'lucide-react';
import { examService } from '../../services/examService';
import { attemptService } from '../../services/attemptService';
import { resultService } from '../../services/resultService';
import { ExamPackage } from '../../types/exam';
import { Button } from '../../components/ui/Button';

export const StudentExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [exams, setExams] = useState<ExamPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    const fetchExams = async () => {
      setLoading(true);
      try {
        const data = await examService.getAllExams();
        // Students only see active exams
        setExams(data.filter(e => e.status === 'active'));
      } catch (err) {
        showToast('Gagal memuat daftar ujian.', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const handleSimulateExam = async (exam: ExamPackage) => {
    if (!profile) return;
    setIsSimulating(true);
    try {
      showToast(`Memulai simulasi pengerjaan: ${exam.title}`, 'info');
      
      // 1. Create Attempt
      const attemptId = await attemptService.createAttempt(exam, profile);
      
      // 2. Mock Answers (Simulate a student answering 80% of questions)
      for (const qId of exam.questionIds) {
        const options = ['A', 'B', 'C', 'D', ''];
        // Bias towards A or B to make it look like someone answered
        const randomOption = options[Math.floor(Math.random() * options.length)] as any;
        await attemptService.saveAnswer(attemptId, qId, randomOption, Math.floor(Math.random() * 60) + 10);
      }
      
      // 3. Submit
      await attemptService.submitAttempt(attemptId);
      
      // 4. Grade Securely
      await resultService.gradeAttempt(attemptId);
      
      showToast('Simulasi pengerjaan dan penilaian selesai!', 'success');
      navigate(`/student/results/${attemptId}`);
    } catch (err) {
      console.error(err);
      showToast('Gagal menjalankan simulasi ujian.', 'error');
    } finally {
      setIsSimulating(false);
    }
  };

  const filteredExams = exams.filter((exam) => {
    if (subjectFilter !== 'all' && exam.subject !== subjectFilter) return false;
    if (search.trim()) {
      return exam.title.toLowerCase().includes(search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Ujian Tersedia
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Daftar paket ujian pembinaan olimpiade yang aktif dan dapat dikerjakan.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari ujian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 font-bold text-slate-700 dark:text-slate-200 cursor-pointer focus:outline-hidden"
          >
            <option value="all">Semua Bidang</option>
            <option value="ipa">IPA</option>
            <option value="ips">IPS</option>
            <option value="matematika">MATEMATIKA</option>
            <option value="bahasa_inggris">B. INGGRIS</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Memuat data ujian...</div>
      ) : filteredExams.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Tidak ada ujian aktif
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Belum ada paket ujian yang diaktifkan oleh Admin atau Guru untuk saat ini.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map((exam) => (
            <div key={exam.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {exam.subject?.toUpperCase() || ''}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{exam.category}</span>
              </div>
              
              <div className="space-y-1.5 flex-1">
                <h3 className="font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
                  {exam.title}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2">{exam.description || 'Simulasi pembinaan olimpiade tingkat SD.'}</p>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-500 font-bold border-t border-slate-50 dark:border-slate-800/60 pt-3">
                <div className="flex items-center gap-1">
                  <Layers className="w-3 h-3 text-blue-500" />
                  <span>{exam.questionIds.length} Soal</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-blue-500" />
                  <span>{exam.durationMinutes} Menit</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => handleSimulateExam(exam)}
                isLoading={isSimulating}
                leftIcon={<Sparkles className="w-4 h-4 fill-current" />}
                className="mt-2"
              >
                SIMULASI PENGERJAAN
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


