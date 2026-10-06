import React, { useState } from 'react';
import { useMaterials } from '../../hooks/useMaterials';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { MaterialCard } from './MaterialCard';
import { MaterialForm } from './MaterialForm';
import { PdfPreview } from './PdfPreview';
import { YoutubeEmbed } from './YoutubeEmbed';
import { Modal, ConfirmDialog } from '../ui/Modal';
import { Input } from '../ui/Input';
import { TrainingMaterial, MaterialStatus } from '../../types/material';
import { materialService } from '../../services/materialService';
import { 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Youtube, 
  Loader2, 
  BookOpen, 
  Layers,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';
import { Button } from '../ui/Button';

interface MaterialListProps {
  role: 'admin' | 'teacher' | 'student';
}

export const MaterialList: React.FC<MaterialListProps> = ({ role }) => {
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectId, setSubjectId] = useState('all');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState<MaterialStatus | 'all'>('all');

  // View state
  const [viewType, setViewType] = useState<'grid' | 'list'>('grid');

  const { materials, loading, error } = useMaterials({
    subjectId,
    type,
    status: role === 'student' ? 'published' : status,
    createdBy: role === 'teacher' ? profile?.uid : undefined,
    onlyPublished: role === 'student',
  });

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<TrainingMaterial | null>(null);
  const [viewingMaterial, setViewMaterial] = useState<TrainingMaterial | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<TrainingMaterial | null>(null);
  const [archivingMaterial, setArchivingMaterial] = useState<TrainingMaterial | null>(null);

  const filteredMaterials = materials.filter(m => {
    const searchLower = searchQuery.toLowerCase();
    return (
      m.title.toLowerCase().includes(searchLower) ||
      m.description?.toLowerCase().includes(searchLower) ||
      m.topic?.toLowerCase().includes(searchLower)
    );
  });

  const handleEdit = (material: TrainingMaterial) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleArchive = async (material: TrainingMaterial) => {
    setArchivingMaterial(material);
  };

  const confirmArchive = async () => {
    if (!archivingMaterial) return;
    try {
      await materialService.archiveMaterial(archivingMaterial.id);
      showToast('Materi berhasil diarsipkan.', 'success');
      setArchivingMaterial(null);
    } catch (err) {
      showToast('Gagal mengarsipkan materi.', 'error');
    }
  };

  const handleDelete = (material: TrainingMaterial) => {
    setDeletingMaterial(material);
  };

  const confirmDelete = async () => {
    if (!deletingMaterial) return;
    try {
      await materialService.deleteMaterial(deletingMaterial);
      showToast('Materi berhasil dihapus.', 'success');
      setDeletingMaterial(null);
    } catch (err) {
      showToast('Gagal menghapus materi.', 'error');
    }
  };

  const handleView = (material: TrainingMaterial) => {
    setViewMaterial(material);
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Materi Pembinaan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {role === 'student' 
              ? 'Akses koleksi materi PDF dan video untuk persiapan olimpiade Anda.' 
              : 'Kelola naskah materi, modul PDF, dan referensi video YouTube pembinaan.'}
          </p>
        </div>

        {role !== 'student' && (
          <Button 
            variant="primary" 
            size="md"
            onClick={() => {
              setEditingMaterial(null);
              setIsFormOpen(true);
            }}
            leftIcon={<Plus className="w-5 h-5" />}
            className="shadow-lg shadow-blue-500/20"
          >
            TAMBAH MATERI
          </Button>
        )}
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input 
              type="text"
              placeholder="Cari judul, topik, atau deskripsi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-hidden text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <select 
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-600 outline-hidden min-w-[120px]"
            >
              <option value="all">Semua Bidang</option>
              <option value="ipa">IPA</option>
              <option value="ips">IPS</option>
              <option value="matematika">Matematika</option>
              <option value="bahasa_inggris">Bahasa Inggris</option>
            </select>

            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-600 outline-hidden min-w-[120px]"
            >
              <option value="all">Semua Jenis</option>
              <option value="pdf">PDF</option>
              <option value="youtube">YouTube</option>
            </select>

            {role !== 'student' && (
              <select 
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="px-4 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 text-xs font-bold text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-blue-600 outline-hidden min-w-[120px]"
              >
                <option value="all">Semua Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            )}

            <div className="flex items-center gap-1 p-1 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800">
              <button 
                onClick={() => setViewType('grid')}
                className={`p-2 rounded-lg transition-all ${viewType === 'grid' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewType('list')}
                className={`p-2 rounded-lg transition-all ${viewType === 'list' ? 'bg-white dark:bg-slate-800 text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'}`}
              >
                <ListIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Materials Display */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Memuat Materi...</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-rose-500 font-bold">{error}</p>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-4">
            Coba Lagi
          </Button>
        </div>
      ) : filteredMaterials.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-10">
          <div className="p-5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-700 mb-4">
            <BookOpen className="w-12 h-12" />
          </div>
          <h3 className="text-lg font-black text-slate-800 dark:text-slate-200">
            {searchQuery || subjectId !== 'all' || type !== 'all' || status !== 'all'
              ? 'Materi tidak ditemukan' 
              : role === 'student' ? 'Belum ada materi pembinaan yang tersedia.' : 'Belum ada materi'}
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xs">
            {role === 'student' 
              ? 'Silakan hubungi Guru Pembina untuk mendapatkan akses materi terbaru.' 
              : 'Mulai dengan menambahkan materi PDF atau Video YouTube pertama Anda.'}
          </p>
          {role !== 'student' && !searchQuery && (
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setIsFormOpen(true)}
              className="mt-6"
            >
              + TAMBAH MATERI PERTAMA
            </Button>
          )}
        </div>
      ) : (
        <div className={viewType === 'grid' 
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          : "flex flex-col gap-4"
        }>
          {filteredMaterials.map((material) => (
            <MaterialCard 
              key={material.id}
              material={material}
              role={role}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onArchive={handleArchive}
            />
          ))}
        </div>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <Modal 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)}
          className="max-w-2xl"
        >
          <MaterialForm 
            onClose={() => setIsFormOpen(false)}
            onSuccess={() => {
              setIsFormOpen(false);
              setEditingMaterial(null);
            }}
            editMaterial={editingMaterial}
          />
        </Modal>
      )}

      {/* View Modal */}
      {viewingMaterial && (
        <Modal
          isOpen={!!viewingMaterial}
          onClose={() => setViewMaterial(null)}
          title={viewingMaterial.title}
          description={viewingMaterial.description}
          className={viewingMaterial.type === 'pdf' ? "max-w-5xl h-[90vh]" : "max-w-3xl"}
        >
          {viewingMaterial.type === 'pdf' ? (
            <PdfPreview 
              fileUrl={viewingMaterial.fileUrl!} 
              title={viewingMaterial.title}
              onClose={() => setViewMaterial(null)}
            />
          ) : (
            <div className="space-y-4">
              <YoutubeEmbed 
                videoId={viewingMaterial.youtubeVideoId!} 
                title={viewingMaterial.title} 
              />
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{viewingMaterial.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {viewingMaterial.description || 'Tidak ada deskripsi untuk video ini.'}
                </p>
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
                   <div className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase">
                     {viewingMaterial.subjectId}
                   </div>
                   <div className="text-[10px] text-slate-400 font-bold">
                     DIUNGGAH OLEH {viewingMaterial.createdByName?.toUpperCase() || 'ADMIN'}
                   </div>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button variant="outline" size="sm" onClick={() => setViewMaterial(null)}>Tutup Video</Button>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog 
        isOpen={!!deletingMaterial}
        onClose={() => setDeletingMaterial(null)}
        onConfirm={confirmDelete}
        title="Hapus Materi?"
        description={`Apakah Anda yakin ingin menghapus materi "${deletingMaterial?.title}"? File yang terkait juga akan dihapus permanen.`}
        confirmText="Ya, Hapus Permanen"
        variant="danger"
      />

      {/* Archive Confirmation */}
      <ConfirmDialog 
        isOpen={!!archivingMaterial}
        onClose={() => setArchivingMaterial(null)}
        onConfirm={confirmArchive}
        title="Arsipkan Materi?"
        description={`Materi "${archivingMaterial?.title}" akan dipindahkan ke arsip dan tidak lagi terlihat oleh Siswa.`}
        confirmText="Ya, Arsipkan"
        variant="warning"
      />
    </div>
  );
};
