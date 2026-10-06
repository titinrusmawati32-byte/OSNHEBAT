import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ConfirmDialog } from '../ui/Modal';
import { ExamPackage, ExamStatus } from '../../types/exam';
import { examService } from '../../services/examService';
import { ExamCard } from './ExamCard';
import { ExamWizard } from './ExamWizard';
import { 
  Layers, 
  Search, 
  Plus, 
  Filter, 
  BookOpen, 
  AlertCircle,
  Clock,
  CheckCircle2,
  Calendar,
  Archive as ArchiveIcon
} from 'lucide-react';

export const ExamManager: React.FC = () => {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const isAdmin = profile?.role === 'admin';
  const isTeacher = profile?.role === 'teacher';

  const [exams, setExams] = useState<ExamPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamPackage | null>(null);
  const [examToDelete, setExamToDelete] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchExams = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      let data;
      if (isAdmin) {
        data = await examService.getAllExams();
      } else {
        data = await examService.getExamsByTeacher(profile.uid);
      }
      setExams(data);
    } catch (err) {
      console.error(err);
      showToast('Gagal memuat paket ujian.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, [profile]);

  const handleCreateOrUpdate = async (examData: Omit<ExamPackage, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (editingExam) {
        await examService.updateExam(editingExam.id, examData);
      } else {
        await examService.createExam(examData);
      }
      fetchExams();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!examToDelete) return;
    try {
      await examService.deleteExam(examToDelete);
      setExams(prev => prev.filter(e => e.id !== examToDelete));
      showToast('Paket ujian berhasil dihapus.', 'success');
    } catch (err) {
      showToast('Gagal menghapus paket ujian.', 'error');
    } finally {
      setExamToDelete(null);
    }
  };

  const handleStatusChange = async (id: string, status: ExamStatus) => {
    try {
      await examService.updateStatus(id, status);
      setExams(prev => prev.map(e => e.id === id ? { ...e, status } : e));
      showToast(`Status paket ujian diperbarui menjadi ${status}.`, 'success');
    } catch (err) {
      showToast('Gagal memperbarui status.', 'error');
    }
  };

  const handleDuplicate = async (exam: ExamPackage) => {
    try {
      const { id, createdAt, updatedAt, ...rest } = exam;
      await examService.createExam({
        ...rest,
        title: `${rest.title} (Salinan)`,
        status: 'draft'
      });
      fetchExams();
      showToast('Paket ujian berhasil diduplikasi.', 'success');
    } catch (err) {
      showToast('Gagal menduplikasi paket ujian.', 'error');
    }
  };

  const filteredExams = exams.filter(e => {
    if (subjectFilter !== 'all' && e.subject !== subjectFilter) return false;
    if (statusFilter !== 'all' && e.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      return e.title.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const stats = {
    total: exams.length,
    active: exams.filter(e => e.status === 'active').length,
    draft: exams.filter(e => e.status === 'draft').length,
    archived: exams.filter(e => e.status === 'archived').length,
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-black uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Manajemen Paket Ujian</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Paket Ujian CBT
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Susun paket ujian dari Bank Soal, atur durasi, sistem pengacakan, dan jadwal pelaksanaan pembinaan olimpiade.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setEditingExam(null);
            setIsWizardOpen(true);
          }}
          leftIcon={<Plus className="w-4 h-4" />}
          className="shadow-sm shadow-blue-600/20 shrink-0 w-full sm:w-auto"
        >
          + BUAT PAKET UJIAN
        </Button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Paket', value: stats.total, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Paket Aktif', value: stats.active, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Draft / Belum Aktif', value: stats.draft, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Diarsipkan', value: stats.archived, icon: ArchiveIcon, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${s.bg} dark:bg-opacity-10 ${s.color}`}>
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
            placeholder="Cari nama paket ujian..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">Semua Bidang</option>
            <option value="ipa">IPA (Sains)</option>
            <option value="ips">IPS (Sosial)</option>
            <option value="matematika">Matematika</option>
            <option value="bahasa_inggris">Bahasa Inggris</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 focus:outline-hidden"
          >
            <option value="all">Semua Status</option>
            <option value="draft">Draft</option>
            <option value="active">Aktif</option>
            <option value="archived">Arsip</option>
          </select>
        </div>
      </div>

      {/* Exam List */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">Memuat data paket ujian...</div>
      ) : filteredExams.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Belum ada paket ujian
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Mulai susun paket ujian pertama Anda untuk diberikan kepada siswa pada sesi pembinaan olimpiade.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsWizardOpen(true)}>
            + Buat Paket Ujian Sekarang
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredExams.map((exam) => (
            <ExamCard
              key={exam.id}
              exam={exam}
              onEdit={(e) => {
                setEditingExam(e);
                setIsWizardOpen(true);
              }}
              onDelete={(id) => setExamToDelete(id)}
              onDuplicate={handleDuplicate}
              onPreview={(e) => showToast(`Preview fitur CBT Engine segera hadir di Phase 5!`, 'info')}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* Wizard Modal */}
      <ExamWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setEditingExam(null);
        }}
        onSave={handleCreateOrUpdate}
        initialData={editingExam}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!examToDelete}
        onClose={() => setExamToDelete(null)}
        onConfirm={handleDelete}
        title="Hapus Paket Ujian"
        description="Apakah Anda yakin ingin menghapus paket ujian ini? Paket yang sudah dihapus tidak dapat dikembalikan."
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
};
