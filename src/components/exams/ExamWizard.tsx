import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { ExamPackage, ExamSettings } from '../../types/exam';
import { Question } from '../../types/question';
import { getQuestions } from '../../services/questionService';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { 
  Info, 
  Layers, 
  Settings as SettingsIcon, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Search,
  Filter,
  Check,
  X,
  BookOpen,
  Clock,
  AlertCircle
} from 'lucide-react';

interface ExamWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exam: Omit<ExamPackage, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  initialData?: ExamPackage | null;
}

export const ExamWizard: React.FC<ExamWizardProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Basic Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState<any>('ipa');
  const [category, setCategory] = useState('Pembinaan');
  const [duration, setDuration] = useState(60);

  // Step 2: Question Selection
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionDifficulty, setQuestionDifficulty] = useState('all');

  // Step 3: Settings
  const [settings, setSettings] = useState<ExamSettings>({
    shuffleQuestions: true,
    shuffleOptions: true,
    showScoreToStudent: true,
    allowReview: true,
    maxAttempts: 1,
    preventMultipleTabs: true
  });

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setSubject(initialData.subject);
      setCategory(initialData.category);
      setDuration(initialData.durationMinutes);
      setSelectedQuestionIds(initialData.questionIds);
      setSettings(initialData.settings);
      setStep(1);
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSubject(profile?.role === 'teacher' ? profile.subject || 'ipa' : 'ipa');
    setCategory('Pembinaan');
    setDuration(60);
    setSelectedQuestionIds([]);
    setSettings({
      shuffleQuestions: true,
      shuffleOptions: true,
      showScoreToStudent: true,
      allowReview: true,
      maxAttempts: 1,
      preventMultipleTabs: true
    });
    setStep(1);
  };

  const fetchQuestions = async () => {
    setLoadingQuestions(true);
    try {
      // For wizard, we filter by subject chosen in Step 1
      const data = await getQuestions(subject);
      setAllQuestions(data);
    } catch (err) {
      showToast('Gagal memuat soal.', 'error');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    if (step === 2 && allQuestions.length === 0) {
      fetchQuestions();
    }
  }, [step, subject]);

  const toggleQuestion = (id: string) => {
    setSelectedQuestionIds(prev => 
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!title.trim()) {
        showToast('Judul ujian wajib diisi.', 'warning');
        return;
      }
    }
    if (step === 2) {
      if (selectedQuestionIds.length === 0) {
        showToast('Pilih setidaknya 1 butir soal.', 'warning');
        return;
      }
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleFinalSave = async () => {
    if (!profile) return;
    setIsSaving(true);
    try {
      await onSave({
        title,
        description,
        subject,
        category,
        durationMinutes: duration,
        questionIds: selectedQuestionIds,
        settings,
        status: initialData ? initialData.status : 'draft',
        createdBy: profile.uid,
        teacherName: profile.displayName || profile.name
      });
      showToast('Paket ujian berhasil disimpan.', 'success');
      onClose();
    } catch (err) {
      showToast('Gagal menyimpan paket ujian.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredQuestions = allQuestions.filter(q => {
    if (questionDifficulty !== 'all' && q.difficulty !== questionDifficulty) return false;
    if (questionSearch.trim()) {
      return q.questionText.toLowerCase().includes(questionSearch.toLowerCase());
    }
    return true;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Paket Ujian' : 'Buat Paket Ujian Baru'}
      size="3xl"
    >
      <div className="flex flex-col h-[70vh] sm:h-[600px]">
        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-8 px-2">
          {[
            { n: 1, label: 'Informasi', icon: Info },
            { n: 2, label: 'Pilih Soal', icon: Layers },
            { n: 3, label: 'Pengaturan', icon: SettingsIcon },
            { n: 4, label: 'Review', icon: CheckCircle2 },
          ].map((s) => (
            <div key={s.n} className="flex flex-col items-center gap-2 flex-1 relative">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-colors ${
                  step === s.n 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : step > s.n 
                      ? 'bg-emerald-500 border-emerald-500 text-white' 
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                }`}
              >
                <s.icon className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${
                step === s.n ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
              {s.n < 4 && (
                <div className={`absolute top-5 left-1/2 w-full h-[2px] -z-0 ${
                  step > s.n ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-2">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="space-y-4">
                <Input
                  label="Judul Paket Ujian"
                  placeholder="Contoh: Try Out IPA Terpadu Bab 1-3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Mata Pelajaran"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    disabled={profile?.role === 'teacher'}
                  >
                    <option value="ipa">IPA (Sains)</option>
                    <option value="ips">IPS (Sosial)</option>
                    <option value="matematika">Matematika</option>
                    <option value="bahasa_inggris">Bahasa Inggris</option>
                  </Select>
                  <Select
                    label="Kategori Ujian"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Pembinaan">Pembinaan Rutin</option>
                    <option value="Try Out">Try Out Akbar</option>
                    <option value="Lomba">Simulasi Lomba</option>
                  </Select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Durasi (Menit)"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    min={1}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Deskripsi (Opsional)</label>
                  <textarea
                    className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 outline-hidden min-h-[100px]"
                    placeholder="Berikan petunjuk pengerjaan atau keterangan paket ujian..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col h-full">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">Pilih Soal dari Bank Soal</h4>
                  <p className="text-[10px] text-slate-500">Mata Pelajaran: {subject.toUpperCase()}</p>
                </div>
                <div className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800">
                  {selectedQuestionIds.length} Soal Terpilih
                </div>
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari soal..."
                    className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-hidden focus:ring-2 focus:ring-blue-600"
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                  />
                </div>
                <select
                  className="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 outline-hidden"
                  value={questionDifficulty}
                  onChange={(e) => setQuestionDifficulty(e.target.value)}
                >
                  <option value="all">Semua Kesulitan</option>
                  <option value="easy">Mudah</option>
                  <option value="medium">Sedang</option>
                  <option value="hard">Sulit</option>
                </select>
              </div>

              <div className="flex-1 overflow-y-auto border border-slate-100 dark:border-slate-800 rounded-2xl min-h-[300px]">
                {loadingQuestions ? (
                  <div className="py-20 text-center text-xs text-slate-400">Memuat bank soal...</div>
                ) : filteredQuestions.length === 0 ? (
                  <div className="py-20 text-center text-xs text-slate-400">Tidak ada soal ditemukan.</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredQuestions.map((q) => {
                      const isSelected = selectedQuestionIds.includes(q.id);
                      return (
                        <div 
                          key={q.id}
                          className={`p-3 flex items-start gap-3 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                            isSelected ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                          }`}
                          onClick={() => toggleQuestion(q.id)}
                        >
                          <div className={`mt-1 shrink-0 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                            isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[4px]" />}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                                q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                q.difficulty === 'medium' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                                'bg-rose-50 text-rose-600 border border-rose-100'
                              }`}>
                                {q.difficulty}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">Oleh: {q.createdByName}</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                              {q.questionText}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Pengacakan</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Acak Urutan Soal</div>
                        <p className="text-[10px] text-slate-500">Urutan soal berbeda untuk tiap siswa</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.shuffleQuestions}
                        onChange={e => setSettings({...settings, shuffleQuestions: e.target.checked})}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Acak Pilihan Jawaban</div>
                        <p className="text-[10px] text-slate-500">Pilihan A-D akan diacak posisinya</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.shuffleOptions}
                        onChange={e => setSettings({...settings, shuffleOptions: e.target.checked})}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Hasil & Review</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Tampilkan Skor Akhir</div>
                        <p className="text-[10px] text-slate-500">Siswa dapat langsung melihat nilai</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.showScoreToStudent}
                        onChange={e => setSettings({...settings, showScoreToStudent: e.target.checked})}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Izinkan Review Jawaban</div>
                        <p className="text-[10px] text-slate-500">Siswa dapat melihat kunci setelah submit</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.allowReview}
                        onChange={e => setSettings({...settings, allowReview: e.target.checked})}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Keamanan</h4>
                  <div className="space-y-4">
                    <label className="flex items-center justify-between cursor-pointer group">
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Anti-Switch Tab</div>
                        <p className="text-[10px] text-slate-500">Deteksi jika siswa membuka tab lain</p>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={settings.preventMultipleTabs}
                        onChange={e => setSettings({...settings, preventMultipleTabs: e.target.checked})}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
                      />
                    </label>
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Pengerjaan</h4>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200">Maksimal Percobaan</div>
                      <div className="flex items-center gap-2 mt-1">
                        {[1, 2, 3, 5].map(v => (
                          <button
                            key={v}
                            onClick={() => setSettings({...settings, maxAttempts: v})}
                            className={`px-3 py-1 text-xs rounded-lg border font-bold transition-all ${
                              settings.maxAttempts === v 
                                ? 'bg-blue-600 border-blue-600 text-white' 
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 hover:border-blue-300'
                            }`}
                          >
                            {v}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{title}</h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs font-bold text-blue-600 uppercase">{subject}</span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-bold text-slate-500 uppercase">{category}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Durasi</span>
                    <div className="flex items-center gap-1.5 text-sm font-black text-slate-800 dark:text-slate-200">
                      <Clock className="w-4 h-4 text-blue-500" />
                      {duration} Menit
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Soal</span>
                    <div className="flex items-center gap-1.5 text-sm font-black text-slate-800 dark:text-slate-200">
                      <Layers className="w-4 h-4 text-blue-500" />
                      {selectedQuestionIds.length} Butir
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Acak Soal</span>
                    <div className="flex items-center gap-1.5 text-sm font-black text-slate-800 dark:text-slate-200">
                      {settings.shuffleQuestions ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-rose-500" />}
                      {settings.shuffleQuestions ? 'Aktif' : 'Non-aktif'}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skor Langsung</span>
                    <div className="flex items-center gap-1.5 text-sm font-black text-slate-800 dark:text-slate-200">
                      {settings.showScoreToStudent ? <Check className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-rose-500" />}
                      {settings.showScoreToStudent ? 'Ya' : 'Tidak'}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    <span className="font-bold">Informasi:</span> Paket ujian ini akan disimpan sebagai <span className="font-bold">Draft</span> terlebih dahulu. Anda perlu mengaktifkannya melalui menu Manajemen Paket Ujian agar dapat dikerjakan oleh siswa.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-2">
          <Button
            variant="ghost"
            onClick={step === 1 ? onClose : handleBack}
            disabled={isSaving}
          >
            {step === 1 ? 'Batalkan' : 'Sebelumnya'}
          </Button>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Langkah {step} dari 4
            </div>
            {step < 4 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                Lanjutkan
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleFinalSave}
                isLoading={isSaving}
                leftIcon={<CheckCircle2 className="w-4 h-4" />}
              >
                Simpan Paket Ujian
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
