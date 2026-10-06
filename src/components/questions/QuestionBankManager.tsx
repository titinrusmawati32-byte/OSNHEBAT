import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { ConfirmDialog } from '../ui/Modal';
import {
  Question,
  ParsedQuestion,
  QuestionImportSession,
  QuestionDifficulty,
  QuestionSourceType,
} from '../../types/question';
import {
  getQuestions,
  deleteQuestion,
  updateQuestion,
} from '../../services/questionService';
import {
  processDocument,
  saveImportedQuestions,
  cancelImportSession,
  updateImportSession,
  getImportSession,
} from '../../services/questionImportService';

// Subcomponents & Modals
import { FormatSelectorModal } from './FormatSelectorModal';
import { DocumentUploadStep } from './DocumentUploadStep';
import { QuestionReviewCard } from './QuestionReviewCard';
import { QuestionEditModal } from './QuestionEditModal';
import { QuestionImageModal } from './QuestionImageModal';
import { QuestionPreviewModal } from './QuestionPreviewModal';
import { QuestionCompareModal } from './QuestionCompareModal';
import { ManualQuestionModal } from './ManualQuestionModal';
import { ImportHistoryModal } from './ImportHistoryModal';

import {
  UploadCloud,
  Plus,
  History,
  Search,
  Filter,
  Layers,
  BookOpen,
  CheckCircle2,
  AlertTriangle,
  Image as ImageIcon,
  Edit3,
  Trash2,
  Eye,
  FileText,
  FileSpreadsheet,
  Table,
  Sparkles,
  HelpCircle,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

export const QuestionBankManager: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const isAdmin = profile?.role === 'admin';
  const isTeacher = profile?.role === 'teacher';

  // Manager View Modes: 'list' | 'upload' | 'review'
  const [viewMode, setViewMode] = useState<'list' | 'upload' | 'review'>('list');

  // Selected format for upload: 'word' | 'excel' | 'pdf'
  const [selectedFormat, setSelectedFormat] = useState<'word' | 'excel' | 'pdf'>('word');
  const [isFormatModalOpen, setIsFormatModalOpen] = useState(false);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // List mode state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Upload & Progress state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('Membaca dokumen...');
  const [activeSession, setActiveSession] = useState<QuestionImportSession | null>(null);
  const [hasImageReferencesNote, setHasImageReferencesNote] = useState(false);
  const [pdfScanWarning, setPdfScanWarning] = useState<string | null>(null);

  // Review mode state
  const [reviewQuestions, setReviewQuestions] = useState<ParsedQuestion[]>([]);
  const [reviewFilter, setReviewFilter] = useState<
    'all' | 'valid' | 'needsReview' | 'edited' | 'hasImage' | 'noImage'
  >('all');
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());

  // Interactive Modals State
  const [editingQuestion, setEditingQuestion] = useState<ParsedQuestion | null>(null);
  const [imageModalQuestion, setImageModalQuestion] = useState<ParsedQuestion | Question | null>(null);
  const [previewQuestion, setPreviewQuestion] = useState<ParsedQuestion | Question | null>(null);
  const [compareQuestion, setCompareQuestion] = useState<ParsedQuestion | null>(null);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [isSavingFinal, setIsSavingFinal] = useState(false);
  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);

  // Fetch bank soal questions
  const fetchBankQuestions = async () => {
    if (!profile) return;
    setLoadingQuestions(true);
    try {
      // Teachers view their own questions or all subject questions; admins view all
      const createdByParam = isTeacher ? profile.uid : undefined;
      const data = await getQuestions(
        selectedSubjectFilter !== 'all' ? selectedSubjectFilter : undefined,
        createdByParam
      );
      setQuestions(data);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat bank soal.', 'error');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchBankQuestions();
  }, [profile, selectedSubjectFilter]);

  // Handle format choice from 3-card modal
  const handleSelectFormat = (format: 'word' | 'excel' | 'pdf') => {
    setSelectedFormat(format);
    setIsFormatModalOpen(false);
    setViewMode('upload');
  };

  // Process Document Workflow
  const handleProcessDocument = async (file: File, subjectId: string) => {
    if (!profile) return;
    setIsProcessing(true);
    setPdfScanWarning(null);
    setHasImageReferencesNote(false);

    try {
      const result = await processDocument({
        file,
        fileType: selectedFormat,
        subjectId,
        user: profile,
        onProgress: (step) => setProcessingStep(step),
      });

      setActiveSession(result.session);
      setReviewQuestions(result.questions);
      setHasImageReferencesNote(!!result.hasImageReferences);

      if (result.isScanOnly) {
        setPdfScanWarning(result.scanWarning || 'PDF berupa scan tanpa teks.');
      }

      showToast(`Berhasil mengekstrak ${result.questions.length} butir soal!`, 'success');
      setViewMode('review');
    } catch (err: any) {
      console.error('Processing error:', err);
      showToast(err.message || 'Gagal memproses dokumen.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reopen an import session from history
  const handleResumeReview = async (sessionMetadata: QuestionImportSession) => {
    setIsProcessing(true);
    setProcessingStep('Memuat data review...');
    try {
      const fullSession = await getImportSession(sessionMetadata.id);
      
      if (fullSession) {
        setActiveSession(fullSession);
        setReviewQuestions(fullSession.parsedQuestions || []);
        setViewMode('review');
        showToast(`Melanjutkan review: ${fullSession.fileName}`, 'info');
      } else {
        showToast('Gagal memuat data sesi.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat data sesi.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Update question inside review state
  const handleUpdateReviewQuestion = (updated: ParsedQuestion) => {
    setReviewQuestions((prev) =>
      prev.map((q) => (q.id === updated.id ? updated : q))
    );
    showToast(`Soal No. ${updated.questionNumber || ''} berhasil diperbarui.`, 'success');

    // Also update session in Firestore in background
    if (activeSession) {
      const updatedList = reviewQuestions.map((q) => (q.id === updated.id ? updated : q));
      updateImportSession(activeSession.id, {
        parsedQuestions: updatedList,
        totalValid: updatedList.filter((q) => !q.needsReview).length,
        totalNeedsReview: updatedList.filter((q) => q.needsReview).length,
      }).catch(console.error);
    }
  };

  // Save image attachment for either review question or existing question in bank
  const handleSaveImageAttachment = async (imageUrl?: string, imageAlt?: string) => {
    if (!imageModalQuestion) return;

    if (viewMode === 'review') {
      const updated: ParsedQuestion = {
        ...(imageModalQuestion as ParsedQuestion),
        imageUrl,
        imageAlt,
        isEdited: true,
      };
      handleUpdateReviewQuestion(updated);
    } else {
      // Existing question in bank soal
      try {
        await updateQuestion(imageModalQuestion.id, {
          imageUrl: imageUrl || '',
          imageAlt: imageAlt || '',
        });
        setQuestions((prev) =>
          prev.map((q) =>
            q.id === imageModalQuestion.id ? { ...q, imageUrl, imageAlt } : q
          )
        );
        showToast('Gambar soal berhasil diperbarui di Bank Soal.', 'success');
      } catch (err) {
        showToast('Gagal memperbarui gambar soal.', 'error');
      }
    }
  };

  // Delete question from review list
  const handleDeleteReviewQuestion = (id: string) => {
    setReviewQuestions((prev) => prev.filter((q) => q.id !== id));
    setSelectedQuestionIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    showToast('Soal dihapus dari daftar review.', 'info');
  };

  // Final Save to Firestore
  const handleFinalSave = async (onlyValid: boolean = false) => {
    if (!profile || !activeSession) return;

    const questionsToSave = onlyValid
      ? reviewQuestions.filter((q) => !q.needsReview)
      : reviewQuestions;

    if (questionsToSave.length === 0) {
      showToast('Tidak ada soal yang siap disimpan.', 'warning');
      return;
    }

    setIsSavingFinal(true);
    try {
      const result = await saveImportedQuestions(
        activeSession.id,
        questionsToSave,
        activeSession.subjectId,
        profile,
        activeSession.fileName,
        activeSession.fileType as QuestionSourceType
      );

      showToast(`Sukses! ${result.savedCount} soal berhasil disimpan ke Bank Soal.`, 'success');
      setViewMode('list');
      setActiveSession(null);
      setReviewQuestions([]);
      fetchBankQuestions();
    } catch (err: any) {
      console.error(err);
      showToast('Gagal menyimpan soal ke Bank Soal: ' + err.message, 'error');
    } finally {
      setIsSavingFinal(false);
    }
  };

  // Cancel import session
  const handleCancelSession = async () => {
    if (activeSession) {
      await cancelImportSession(activeSession.id);
    }
    setIsCancelConfirmOpen(false);
    setViewMode('list');
    setActiveSession(null);
    setReviewQuestions([]);
    showToast('Sesi import dibatalkan.', 'info');
  };

  // Filter review questions
  const filteredReviewQuestions = reviewQuestions.filter((q) => {
    if (reviewFilter === 'valid') return !q.needsReview;
    if (reviewFilter === 'needsReview') return q.needsReview;
    if (reviewFilter === 'edited') return q.isEdited;
    if (reviewFilter === 'hasImage') return !!q.imageUrl;
    if (reviewFilter === 'noImage') return !q.imageUrl;
    return true;
  });

  const validCount = reviewQuestions.filter((q) => !q.needsReview).length;
  const needsReviewCount = reviewQuestions.filter((q) => q.needsReview).length;
  const withImagesCount = reviewQuestions.filter((q) => !!q.imageUrl).length;

  // Filter Bank Soal Questions
  const filteredBankQuestions = questions.filter((q) => {
    if (selectedSubjectFilter !== 'all' && q.subjectId !== selectedSubjectFilter) return false;
    if (difficultyFilter !== 'all' && q.difficulty !== difficultyFilter) return false;
    if (sourceFilter !== 'all' && q.sourceType !== sourceFilter) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        q.questionText.toLowerCase().includes(query) ||
        q.options.A.toLowerCase().includes(query) ||
        q.options.B.toLowerCase().includes(query) ||
        q.options.C.toLowerCase().includes(query) ||
        q.options.D.toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 text-left">
      {/* ─────────────────────────────────────────────────────────────
          MODE 1: BANK SOAL LIST VIEW
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <>
          {/* Header & Primary Actions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                <span>Pusat Kelola Soal CBT</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                Bank Soal Olimpiade SD
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Import berkas naskah soal dari dokumen Word, Excel, atau PDF dengan ekstraksi teks cerdas, verifikasi kunci jawaban, dan manajemen lampiran gambar.
              </p>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsFormatModalOpen(true)}
                leftIcon={<UploadCloud className="w-4 h-4" />}
                className="shadow-sm shadow-blue-600/20"
              >
                + IMPORT SOAL
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => setIsManualModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                + Tambah Manual
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => setIsHistoryModalOpen(true)}
                leftIcon={<History className="w-4 h-4" />}
              >
                Riwayat Import
              </Button>
            </div>
          </div>

          {/* Subject Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: 'Semua Bidang' },
              { id: 'ipa', label: 'IPA (Sains)' },
              { id: 'ips', label: 'IPS (Sosial)' },
              { id: 'matematika', label: 'Matematika' },
              { id: 'bahasa_inggris', label: 'Bahasa Inggris' },
            ].map((sub) => (
              <button
                key={sub.id}
                type="button"
                onClick={() => setSelectedSubjectFilter(sub.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedSubjectFilter === sub.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {sub.label}
              </button>
            ))}
          </div>

          {/* Search & Sub-filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Cari teks soal, pilihan jawaban..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="sm:col-span-3">
              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="all">Semua Kesulitan</option>
                <option value="easy">Tingkat Mudah</option>
                <option value="medium">Tingkat Sedang</option>
                <option value="hard">Tingkat Sulit</option>
              </select>
            </div>

            <div className="sm:col-span-3">
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-hidden"
              >
                <option value="all">Semua Sumber</option>
                <option value="word">Word (.docx)</option>
                <option value="excel">Excel (.xlsx)</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="manual">Tambah Manual</option>
              </select>
            </div>
          </div>

          {/* Question List */}
          {loadingQuestions ? (
            <div className="py-16 text-center text-xs text-slate-400">
              Memuat bank soal dari Firestore...
            </div>
          ) : filteredBankQuestions.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Belum ada butir soal pada filter ini
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Mulai impor kumpulan soal dari berkas Word (.docx), Excel (.xlsx), atau PDF, atau tambahkan satu per satu secara manual.
              </p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <Button variant="primary" size="sm" onClick={() => setIsFormatModalOpen(true)}>
                  + Import Dokumen Soal
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsManualModalOpen(true)}>
                  + Tambah Manual
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-500 flex items-center justify-between">
                <span>Menampilkan {filteredBankQuestions.length} butir soal</span>
                <span>Bidang: {selectedSubjectFilter.toUpperCase()}</span>
              </div>

              {filteredBankQuestions.map((q, idx) => {
                const canManage = isAdmin || (isTeacher && q.createdBy === profile?.uid);

                return (
                  <div
                    key={q.id}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          #{q.questionNumber || idx + 1}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          {q.subjectId}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {q.sourceType}
                        </span>
                        {q.imageUrl && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                            <ImageIcon className="w-3 h-3" />
                            <span>Ada Gambar</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span>Oleh: {q.createdByName || 'Guru'}</span>
                      </div>
                    </div>

                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                      {q.questionText}
                    </div>

                    {q.imageUrl && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 inline-block bg-slate-50 dark:bg-slate-950 p-1">
                        <img
                          src={q.imageUrl}
                          alt={q.imageAlt || 'Gambar soal'}
                          className="h-24 w-auto object-contain rounded-lg"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {(['A', 'B', 'C', 'D'] as const).map((key) => {
                        const isCorrect = q.correctAnswer === key;
                        return (
                          <div
                            key={key}
                            className={`p-2 rounded-xl border flex items-start gap-2 ${
                              isCorrect
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 font-bold text-emerald-950 dark:text-emerald-100'
                                : 'bg-slate-50/60 dark:bg-slate-850 border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className="w-5 h-5 rounded-md text-[10px] font-black flex items-center justify-center shrink-0 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                              {key}
                            </span>
                            <span>{q.options[key]}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-auto shrink-0 mt-0.5" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                      <div className="text-slate-500">
                        Kunci Jawaban:{' '}
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          {q.correctAnswer}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewQuestion(q)}
                          className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Simulasi</span>
                        </button>

                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => setImageModalQuestion(q)}
                              className="px-2.5 py-1 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer"
                            >
                              <ImageIcon className="w-3 h-3" />
                              <span>{q.imageUrl ? 'Kelola Gambar' : '+ Gambar'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setQuestionToDelete(q.id)}
                              className="p-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE 2: DOCUMENT UPLOAD STEP
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'upload' && (
        <DocumentUploadStep
          format={selectedFormat}
          onBack={() => setViewMode('list')}
          onProcess={handleProcessDocument}
          isProcessing={isProcessing}
          processingStep={processingStep}
        />
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODE 3: TEMPORARY REVIEW STATE (/questions/import/review)
      ───────────────────────────────────────────────────────────── */}
      {viewMode === 'review' && activeSession && (
        <div className="space-y-6">
          {/* Review Header Banner */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Sesi Review Soal
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {activeSession.fileType.toUpperCase()}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {activeSession.subjectId.toUpperCase()}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">
                  {activeSession.fileName}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Periksa hasil ekstraksi, perbaiki soal yang memerlukan perhatian, dan tambahkan gambar sebelum menyimpan ke Bank Soal.
                </p>
              </div>

              {/* Action Buttons on top right */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCancelConfirmOpen(true)}
                >
                  Batalkan Import
                </Button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleFinalSave(false)}
                  disabled={isSavingFinal || reviewQuestions.length === 0}
                  isLoading={isSavingFinal}
                >
                  SIMPAN SEMUA ({reviewQuestions.length} SOAL)
                </Button>
              </div>
            </div>

            {/* 4 Summary Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Total Terdeteksi
                </span>
                <span className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1 block">
                  {reviewQuestions.length}
                </span>
                <span className="text-[10px] text-slate-400">Butir soal teridentifikasi</span>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                  Berhasil Diparsing (Valid)
                </span>
                <span className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1 block">
                  {validCount}
                </span>
                <span className="text-[10px] text-emerald-600/80">Siap disimpan langsung</span>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider block">
                  Perlu Review
                </span>
                <span className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-1 block">
                  {needsReviewCount}
                </span>
                <span className="text-[10px] text-amber-600/80">Opsi/kunci belum lengkap</span>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                  Memiliki Gambar
                </span>
                <span className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1 block">
                  {withImagesCount}
                </span>
                <span className="text-[10px] text-blue-600/80">Lampiran diagram/foto</span>
              </div>
            </div>

            {/* Scan Warning Banner if detected */}
            {pdfScanWarning && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-800 dark:text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Peringatan Ekstraksi PDF:</span> {pdfScanWarning}
                </div>
              </div>
            )}

            {/* Image References Indicator if Word refers to images */}
            {hasImageReferencesNote && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-start gap-3 text-xs text-blue-800 dark:text-blue-200">
                <ImageIcon className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Catatan Naskah:</span> Dokumen terdeteksi merujuk pada gambar/diagram. Sesuai prinsip <em>Text-First</em>, silakan lampirkan gambar secara manual pada soal terkait melalui tombol <strong>+ Gambar</strong>.
                </div>
              </div>
            )}

            {/* Quick-Jump Numbered Grid (Section 26) */}
            <div className="space-y-2 pt-2">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Daftar Lompat Cepat Nomor Soal:</span>
                <span className="text-[11px] text-slate-400">Klik nomor untuk menuju soal</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                {reviewQuestions.map((q, idx) => {
                  const numStr = String(q.questionNumber || idx + 1).padStart(2, '0');
                  let colorClass = 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300';
                  if (q.needsReview) {
                    colorClass = 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-300';
                  } else if (q.isEdited) {
                    colorClass = 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-300';
                  }

                  return (
                    <a
                      key={q.id}
                      href={`#q-card-${q.id}`}
                      className={`w-9 h-9 rounded-xl font-mono text-xs font-black flex items-center justify-center border transition-transform hover:scale-105 relative ${colorClass}`}
                      title={`Soal ${numStr}: ${q.needsReview ? 'Perlu Review' : 'Valid'}`}
                    >
                      {numStr}
                      {q.imageUrl && (
                        <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1 right-1" />
                      )}
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Filter Tabs for Review */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                {[
                  { id: 'all', label: `Semua (${reviewQuestions.length})` },
                  { id: 'valid', label: `Valid (${validCount})` },
                  { id: 'needsReview', label: `Perlu Review (${needsReviewCount})` },
                  { id: 'edited', label: 'Diubah' },
                  { id: 'hasImage', label: `Memiliki Gambar (${withImagesCount})` },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setReviewFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      reviewFilter === f.id
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Bulk Actions Button */}
              {needsReviewCount > 0 && validCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleFinalSave(true)}
                  disabled={isSavingFinal}
                  isLoading={isSavingFinal}
                >
                  Simpan {validCount} Soal Valid Saja
                </Button>
              )}
            </div>
          </div>

          {/* Question Cards List */}
          <div className="space-y-4">
            {filteredReviewQuestions.map((q, idx) => (
              <QuestionReviewCard
                key={q.id}
                question={q}
                index={idx}
                onEdit={(item) => setEditingQuestion(item)}
                onManageImage={(item) => setImageModalQuestion(item)}
                onPreview={(item) => setPreviewQuestion(item)}
                onCompare={(item) => setCompareQuestion(item)}
                onDelete={(id) => handleDeleteReviewQuestion(id)}
              />
            ))}
          </div>

          {/* Sticky Bottom Action Bar for Import Review */}
          <div className="sticky bottom-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-slate-600 dark:text-slate-300 text-left">
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                Ringkasan Import:
              </span>{' '}
              {validCount} soal valid, {needsReviewCount} perlu review.
              {needsReviewCount > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-bold ml-1">
                  (Anda dapat menyimpan soal valid saja atau mengoreksi soal yang bertanda kuning).
                </span>
              )}
            </div>

            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsCancelConfirmOpen(true)}
                disabled={isSavingFinal}
              >
                Batalkan
              </Button>

              {needsReviewCount > 0 && validCount > 0 && (
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleFinalSave(true)}
                  disabled={isSavingFinal}
                >
                  SIMPAN {validCount} SOAL VALID
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={() => handleFinalSave(false)}
                disabled={isSavingFinal || reviewQuestions.length === 0}
                isLoading={isSavingFinal}
              >
                {needsReviewCount === 0
                  ? `SIMPAN SEMUA (${reviewQuestions.length} SOAL)`
                  : 'SIMPAN SEMUA SETELAH REVIEW'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          MODALS
      ───────────────────────────────────────────────────────────── */}
      {/* 3-Card Format Selection Modal */}
      <FormatSelectorModal
        isOpen={isFormatModalOpen}
        onClose={() => setIsFormatModalOpen(false)}
        onSelectFormat={handleSelectFormat}
      />

      {/* Manual Question Addition Modal */}
      <ManualQuestionModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        defaultSubjectId={selectedSubjectFilter !== 'all' ? selectedSubjectFilter : 'ipa'}
        onSuccess={() => fetchBankQuestions()}
      />

      {/* Import History Modal */}
      <ImportHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        onResumeReview={handleResumeReview}
      />

      {/* Question Edit Modal */}
      <QuestionEditModal
        isOpen={!!editingQuestion}
        onClose={() => setEditingQuestion(null)}
        question={editingQuestion}
        onSave={handleUpdateReviewQuestion}
      />

      {/* Question Image Management Modal */}
      <QuestionImageModal
        isOpen={!!imageModalQuestion}
        onClose={() => setImageModalQuestion(null)}
        question={imageModalQuestion}
        onSaveImage={handleSaveImageAttachment}
      />

      {/* Question Student Simulation Preview Modal */}
      <QuestionPreviewModal
        isOpen={!!previewQuestion}
        onClose={() => setPreviewQuestion(null)}
        question={previewQuestion}
      />

      {/* Question Raw Text vs Parsed Comparison Modal */}
      <QuestionCompareModal
        isOpen={!!compareQuestion}
        onClose={() => setCompareQuestion(null)}
        question={compareQuestion}
      />

      {/* Delete Confirmation for Existing Question */}
      <ConfirmDialog
        isOpen={!!questionToDelete}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={async () => {
          if (questionToDelete) {
            try {
              await deleteQuestion(questionToDelete);
              setQuestions((prev) => prev.filter((q) => q.id !== questionToDelete));
              showToast('Soal berhasil dihapus dari Bank Soal.', 'success');
            } catch (err) {
              showToast('Gagal menghapus soal.', 'error');
            } finally {
              setQuestionToDelete(null);
            }
          }
        }}
        title="Hapus Butir Soal"
        description="Apakah Anda yakin ingin menghapus butir soal ini dari Bank Soal? Tindakan ini tidak dapat dibatalkan."
        confirmText="Hapus Soal"
        cancelText="Batal"
        variant="danger"
      />

      {/* Cancel Session Confirmation */}
      <ConfirmDialog
        isOpen={isCancelConfirmOpen}
        onClose={() => setIsCancelConfirmOpen(false)}
        onConfirm={handleCancelSession}
        title="Batalkan Sesi Import?"
        description="Hasil ekstraksi yang belum disimpan ke Bank Soal akan dibatalkan. Sesi ini tetap dapat dilihat pada Riwayat Import."
        confirmText="Ya, Batalkan"
        cancelText="Lanjut Review"
        variant="warning"
      />
    </div>
  );
};
