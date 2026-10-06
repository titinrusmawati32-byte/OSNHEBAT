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
  BookOpen, 
  FileText, 
  MessageSquare, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  Layers,
  Search,
  Filter
} from 'lucide-react';

export const StudentResultDetailPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [questionResults, setQuestionResults] = useState<QuestionResult[]>([]);
  const [exam, setExam] = useState<ExamPackage | null>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'discussion'>('summary');
  
  // Discussion filters
  const [filter, setFilter] = useState<'all' | 'correct' | 'wrong' | 'unanswered'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!resultId || !profile) return;
      setLoading(true);
      try {
        const resData = await resultService.getResultById(resultId);
        if (!resData) {
          showToast('Hasil tidak ditemukan.', 'error');
          navigate('/student/results');
          return;
        }

        // Security check: only owner can see their result
        if (profile.role === 'student' && resData.studentId !== profile.uid) {
          showToast('Anda tidak memiliki akses ke hasil ini.', 'error');
          navigate('/student/results');
          return;
        }

        const qResData = await resultService.getQuestionResults(resultId);
        const exData = await examService.getExamById(resData.examId);

        setResult(resData);
        setQuestionResults(qResData);
        setExam(exData);
      } catch (err) {
        console.error(err);
        showToast('Gagal memuat detail hasil.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [resultId, profile]);

  if (loading) return <div className="py-20 text-center text-xs text-slate-400">Memuat analisis hasil...</div>;
  if (!result) return null;

  const filteredQuestions = questionResults.filter(q => {
    if (filter === 'correct' && !q.isCorrect) return false;
    if (filter === 'wrong' && (q.isCorrect || !q.isAnswered)) return false;
    if (filter === 'unanswered' && q.isAnswered) return false;
    if (search.trim()) return q.questionId.includes(search); // Simplified search for now
    return true;
  });

  const accuracyData = {
    easy: Math.round((questionResults.filter(q => q.difficulty === 'easy' && q.isCorrect).length / Math.max(1, questionResults.filter(q => q.difficulty === 'easy').length)) * 100),
    medium: Math.round((questionResults.filter(q => q.difficulty === 'medium' && q.isCorrect).length / Math.max(1, questionResults.filter(q => q.difficulty === 'medium').length)) * 100),
    hard: Math.round((questionResults.filter(q => q.difficulty === 'hard' && q.isCorrect).length / Math.max(1, questionResults.filter(q => q.difficulty === 'hard').length)) * 100),
  };

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto pb-12">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/student/results')} className="rounded-xl">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-none">
            {result.examTitle}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase font-bold tracking-wider">
            Hasil Analisis & Pembinaan • {result.subjectId.replace('_', ' ')}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-6 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'summary' 
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Ringkasan
        </button>
        <button
          onClick={() => setActiveTab('discussion')}
          className={`px-6 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${
            activeTab === 'discussion' 
              ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs' 
              : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Pembahasan
        </button>
      </div>

      {activeTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
          <div className="lg:col-span-8 space-y-6">
            <ResultSummary result={result} />
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-500" />
                Analisis Tingkat Kesulitan
              </h4>
              <div className="space-y-5">
                <PillChart label="Tingkat Mudah" percentage={accuracyData.easy} color="bg-emerald-500" />
                <PillChart label="Tingkat Sedang" percentage={accuracyData.medium} color="bg-amber-500" />
                <PillChart label="Tingkat Sulit" percentage={accuracyData.hard} color="bg-rose-500" />
              </div>
              <p className="text-[11px] text-slate-400 italic pt-2 border-t border-slate-50 dark:border-slate-800/50">
                * Persentase menunjukkan jumlah jawaban benar pada setiap tingkatan kesulitan soal.
              </p>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xs sticky top-6">
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider mb-8 text-center">
                Visualisasi Akurasi
              </h4>
              <AccuracyDonut 
                correct={result.correctCount} 
                wrong={result.wrongCount} 
                unanswered={result.unansweredCount} 
              />
              
              <div className="mt-8 space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">Waktu Rata-rata / Soal</span>
                  <span className="text-slate-900 dark:text-slate-100 font-black">{result.averageTimePerQuestion} detik</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-bold">Total Soal Terjawab</span>
                  <span className="text-slate-900 dark:text-slate-100 font-black">{result.answeredCount} dari {result.totalQuestions}</span>
                </div>
              </div>

              <Button 
                variant="outline" 
                size="md" 
                className="w-full mt-8 rounded-2xl" 
                onClick={() => setActiveTab('discussion')}
                leftIcon={<MessageSquare className="w-4 h-4" />}
              >
                Lihat Pembahasan
              </Button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'discussion' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 w-full md:w-auto">
              {[
                { id: 'all', label: 'Semua' },
                { id: 'correct', label: 'Benar', icon: CheckCircle2, color: 'text-emerald-500' },
                { id: 'wrong', label: 'Salah', icon: XCircle, color: 'text-rose-500' },
                { id: 'unanswered', label: 'Kosong', icon: HelpCircle, color: 'text-slate-400' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilter(t.id as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    filter === t.id 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  {t.icon && <t.icon className="w-3.5 h-3.5" />}
                  {t.label}
                </button>
              ))}
            </div>
            
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Cari kata kunci..."
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-hidden"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => (
              <div key={q.questionId} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-700 dark:text-slate-300">
                      {q.questionNumber}
                    </div>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                      q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' :
                      q.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    }`}>
                      {q.difficulty}
                    </span>
                  </div>
                  
                  {q.isAnswered ? (
                    q.isCorrect ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-black text-xs uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-800">
                        <CheckCircle2 className="w-4 h-4" />
                        BENAR
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-rose-600 font-black text-xs uppercase tracking-wider bg-rose-50 dark:bg-rose-950/40 px-3 py-1 rounded-full border border-rose-100 dark:border-rose-800">
                        <XCircle className="w-4 h-4" />
                        SALAH
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 font-black text-xs uppercase tracking-wider bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700">
                      <HelpCircle className="w-4 h-4" />
                      KOSONG
                    </div>
                  )}
                </div>

                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed pt-2">
                  {/* Since we don't have the question text in QuestionResult (to save space), 
                      we'd normally fetch it. For now I'll just show a placeholder if not passed.
                      Actually, in a real detailed view, we fetch the Question metadata too. */}
                  Analisis Soal #{q.questionNumber} ({q.difficulty?.toUpperCase() || ''})
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Jawaban Anda</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{q.selectedOption || '-'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Waktu</span>
                    <span className="text-sm font-black text-slate-700 dark:text-slate-200">{q.timeSpentSeconds} detik</span>
                  </div>
                </div>

                <div className="mt-4 pt-6 border-t border-slate-50 dark:border-slate-800/60">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest">Pembahasan</span>
                  </div>
                  {exam?.settings.allowReview ? (
                    <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      <p className="font-bold text-blue-700 dark:text-blue-400 mb-2">Penjelasan:</p>
                      Pembahasan untuk butir soal ini sedang dalam proses penyusunan oleh tim pakar olimpiade. Silakan periksa kembali beberapa saat lagi.
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                      <AlertCircle className="w-4 h-4" />
                      Pembahasan tidak diizinkan untuk ditampilkan oleh penyelenggara ujian.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
