import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { resultService } from '../../services/resultService';
import { examService } from '../../services/examService';
import { AttemptResult, QuestionResult } from '../../types/result';
import { ExamPackage } from '../../types/exam';
import { ResultSummary } from '../../components/results/ResultSummary';
import { AccuracyDonut, PillChart } from '../../components/results/ResultCharts';
import { Button } from '../../components/ui/Button';
import { 
  ChevronLeft, 
  User,
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  Layers,
  Clock,
  BarChart2
} from 'lucide-react';

export const GuruResultDetailPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [exam, setExam] = useState<ExamPackage | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!resultId) return;
      setLoading(true);
      try {
        const resData = await resultService.getResultById(resultId);
        if (!resData) {
          showToast('Hasil tidak ditemukan.', 'error');
          navigate('/teacher/results');
          return;
        }

        const qResData = await resultService.getQuestionResults(resultId);
        const exData = await examService.getExamById(resData.examId);

        setResult(resData);
        setQuestionResults(qResData);
        setExam(exData);
      } catch (err) {
        showToast('Gagal memuat detail hasil.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resultId]);

  if (loading) return <div className="py-20 text-center text-xs text-slate-400">Memuat analisis pengerjaan...</div>;
  if (!result) return null;

  const difficultyStats = {
    easy: Math.round((questionResults.filter(q => q.difficulty === 'easy' && q.isCorrect).length / Math.max(1, questionResults.filter(q => q.difficulty === 'easy').length)) * 100),
    medium: Math.round((questionResults.filter(q => q.difficulty === 'medium' && q.isCorrect).length / Math.max(1, questionResults.filter(q => q.difficulty === 'medium').length)) * 100),
    hard: Math.round((questionResults.filter(q => q.difficulty === 'hard' && q.isCorrect).length / Math.max(1, questionResults.filter(q => q.difficulty === 'hard').length)) * 100),
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/teacher/results')} className="rounded-xl">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
              Detail Pengerjaan Siswa
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold uppercase tracking-wider">
              {result.examTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-2xl shadow-xs">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-800">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <div className="text-xs font-black text-slate-900 dark:text-slate-100 truncate">{result.studentName}</div>
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{result.studentClass || 'Peserta'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <ResultSummary result={result} />
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-500" />
              Performa per Tingkat Kesulitan
            </h4>
            <div className="space-y-5">
              <PillChart label="Mudah" percentage={difficultyStats.easy} color="bg-emerald-500" />
              <PillChart label="Sedang" percentage={difficultyStats.medium} color="bg-amber-500" />
              <PillChart label="Sulit" percentage={difficultyStats.hard} color="bg-rose-500" />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs sticky top-6">
             <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-8 text-center">
                Distribusi Jawaban
              </h4>
              <AccuracyDonut 
                correct={result.correctCount} 
                wrong={result.wrongCount} 
                unanswered={result.unansweredCount} 
              />

              <div className="mt-8 space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Rata-rata Waktu / Soal</span>
                  <span className="text-lg font-black text-slate-900 dark:text-slate-100">{result.averageTimePerQuestion} detik</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Status Kelulusan</span>
                  <span className={`text-lg font-black ${result.passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {result.passed ? 'Lulus Ambang Batas' : 'Di Bawah Ambang Batas'}
                  </span>
                </div>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
