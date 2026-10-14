import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { 
  MaterialType, 
  MaterialSubject, 
  MaterialStatus, 
  TrainingMaterial 
} from '../../types/material';
import { materialService } from '../../services/materialService';
import { materialStorageService } from '../../services/materialStorageService';
import { parsePdfUrl } from '../../lib/pdfHelper';
import { 
  extractYoutubeVideoId, 
  isValidYoutubeUrl, 
  createYoutubeEmbedUrl 
} from '../../lib/youtube';
import { 
  FileText, 
  Youtube, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Link as LinkIcon,
  HardDrive,
  Cloud
} from 'lucide-react';

interface MaterialFormProps {
  onClose: () => void;
  onSuccess: () => void;
  editMaterial?: TrainingMaterial | null;
}

export const MaterialForm: React.FC<MaterialFormProps> = ({ 
  onClose, 
  onSuccess, 
  editMaterial 
}) => {
  const { profile } = useAuth();
  const { showToast } = useToast();

  const [title, setTitle] = useState(editMaterial?.title || '');
  const [description, setDescription] = useState(editMaterial?.description || '');
  const [subjectId, setSubjectId] = useState<MaterialSubject>(editMaterial?.subjectId || 'ipa');
  const [gradeLevel, setGradeLevel] = useState(editMaterial?.gradeLevel || '');
  const [topic, setTopic] = useState(editMaterial?.topic || '');
  const [type, setType] = useState<MaterialType>(editMaterial?.type || 'pdf');
  const [status, setStatus] = useState<MaterialStatus>(editMaterial?.status || 'published');

  // PDF Source Mode: 'drive' (Google Drive / Link URL) or 'upload' (Google Cloud Storage)
  const [pdfSourceMode, setPdfSourceMode] = useState<'drive' | 'upload'>('drive');
  const [fileUrl, setFileUrl] = useState(editMaterial?.fileUrl || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatusText, setUploadStatusText] = useState<string>('');

  // YouTube State
  const [youtubeUrl, setYoutubeUrl] = useState(editMaterial?.youtubeUrl || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const parsedPdf = parsePdfUrl(fileUrl);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        showToast('File tidak valid. Harap pilih dokumen berformat PDF.', 'error');
        return;
      }
      if (file.size > 30 * 1024 * 1024) {
        showToast('Ukuran file melebihi batas maksimal 30MB.', 'warning');
        return;
      }
      setSelectedFile(file);
      if (!title) {
        // Auto populate title from file name
        const cleanName = file.name.replace(/\.pdf$/i, '').replace(/[-_]/g, ' ');
        setTitle(cleanName);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    if (!title.trim()) {
      showToast('Judul materi wajib diisi.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalFileUrl = fileUrl.trim();
      let filePath = editMaterial?.filePath || '';
      let fileName = editMaterial?.fileName || title || 'Dokumen PDF';
      let fileSize = editMaterial?.fileSize || 1024 * 1024;

      if (type === 'pdf') {
        if (pdfSourceMode === 'upload' && selectedFile) {
          // Upload file directly to Google Cloud Storage (Firebase Storage)
          setUploadStatusText('Mengunggah PDF ke Google Cloud Storage...');
          const tempMaterialId = editMaterial?.id || `mat_${Date.now()}`;
          filePath = `materials/${subjectId}/${tempMaterialId}/document.pdf`;
          fileName = selectedFile.name;
          fileSize = selectedFile.size;

          finalFileUrl = await materialStorageService.uploadMaterialPdf(
            subjectId,
            tempMaterialId,
            selectedFile,
            (progress) => {
              setUploadProgress(Math.round(progress));
            }
          );
        } else if (pdfSourceMode === 'drive' || !selectedFile) {
          // Using URL (Google Drive / Web URL)
          if (!finalFileUrl) {
            showToast('Tautan URL PDF atau link Google Drive wajib diisi.', 'warning');
            setIsSubmitting(false);
            return;
          }
          if (parsedPdf.isGoogleDrive) {
            finalFileUrl = parsedPdf.embedUrl;
          }
        }
      }

      const materialData: any = {
        title: title.trim(),
        description: description.trim() || '',
        subjectId,
        gradeLevel: gradeLevel.trim() || '',
        topic: topic.trim() || '',
        type,
        status,
        createdBy: profile.uid,
        createdByName: profile.displayName || profile.name || profile.username || 'Guru Pembina',
      };

      if (type === 'youtube') {
        if (!isValidYoutubeUrl(youtubeUrl)) {
          showToast('URL YouTube tidak valid. Silakan masukkan URL video YouTube yang benar.', 'error');
          setIsSubmitting(false);
          return;
        }
        const videoId = extractYoutubeVideoId(youtubeUrl);
        if (videoId) {
          materialData.youtubeUrl = youtubeUrl;
          materialData.youtubeVideoId = videoId;
          materialData.youtubeEmbedUrl = createYoutubeEmbedUrl(videoId);
        }
      } else {
        materialData.fileUrl = finalFileUrl;
        materialData.fileName = fileName;
        materialData.fileSize = fileSize;
        materialData.filePath = filePath;
      }

      if (editMaterial) {
        await materialService.updateMaterial(editMaterial.id, materialData);
        showToast('Materi berhasil diperbarui.', 'success');
      } else {
        await materialService.createMaterial(materialData);
        showToast('Materi baru berhasil disimpan ke database.', 'success');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving material:', error);
      showToast('Gagal menyimpan materi: ' + (error.message || 'Silakan coba lagi.'), 'error');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
      setUploadStatusText('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {editMaterial ? 'Edit Materi Pembinaan' : 'Tambah Materi Baru'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mendukung tautan Google Drive, upload Cloud Storage, dan video YouTube.
          </p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Input 
              label="Judul Materi *"
              placeholder="Contoh: Modul Eksplorasi Sains & Matematika Lanjutan"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
              Deskripsi Materi
            </label>
            <textarea 
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all outline-hidden text-sm"
              rows={3}
              placeholder="Jelaskan isi materi atau instruksi untuk siswa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Select 
            label="Mata Pelajaran *"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value as MaterialSubject)}
            options={[
              { value: 'ipa', label: 'IPA (Sains)' },
              { value: 'ips', label: 'IPS (Sosial)' },
              { value: 'matematika', label: 'Matematika' },
              { value: 'bahasa_inggris', label: 'Bahasa Inggris' },
            ]}
          />

          <Input 
            label="Tingkat / Kelas"
            placeholder="Contoh: Kelas 5 - 6 SD"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
          />

          <Input 
            label="Topik Materi"
            placeholder="Contoh: Bilangan & Aljabar Dasar"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <Select 
            label="Jenis Materi *"
            value={type}
            onChange={(e) => setType(e.target.value as MaterialType)}
            options={[
              { value: 'pdf', label: 'Dokumen PDF (Drive / Cloud Storage)' },
              { value: 'youtube', label: 'Video YouTube' },
            ]}
            disabled={!!editMaterial}
          />

          <Select 
            label="Status Publikasi"
            value={status}
            onChange={(e) => setStatus(e.target.value as MaterialStatus)}
            options={[
              { value: 'published', label: 'Publish (Siswa dapat langsung akses)' },
              { value: 'draft', label: 'Simpan sebagai Draf' },
              { value: 'archived', label: 'Arsip' },
            ]}
          />
        </div>

        {/* Section PDF or YouTube */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          {type === 'pdf' ? (
            <div className="space-y-4">
              {/* Toggle PDF Mode: Drive URL vs Cloud Storage Upload */}
              {!editMaterial && (
                <div className="flex rounded-2xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setPdfSourceMode('drive')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      pdfSourceMode === 'drive'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <HardDrive className="w-3.5 h-3.5" />
                    <span>Google Drive / URL Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfSourceMode('upload')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      pdfSourceMode === 'upload'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    <Cloud className="w-3.5 h-3.5" />
                    <span>Upload Cloud Storage</span>
                  </button>
                </div>
              )}

              {pdfSourceMode === 'drive' ? (
                <div className="space-y-3">
                  <Input 
                    label="URL File PDF / Link Google Drive *"
                    placeholder="Contoh: https://drive.google.com/file/d/.../view atau https://.../materi.pdf"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    leftIcon={<LinkIcon className="w-4 h-4 text-blue-600" />}
                    helperText="Mendukung link Google Drive, tautan publik cloud storage, atau file .pdf langsung"
                    required={pdfSourceMode === 'drive'}
                  />

                  {parsedPdf.isGoogleDrive && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="text-xs text-emerald-800 dark:text-emerald-200 leading-relaxed">
                        <span className="font-bold">Link Google Drive Terdeteksi:</span> Sistem otomatis mengubah URL menjadi format preview embed (<code className="bg-emerald-100 dark:bg-emerald-900/60 px-1 py-0.5 rounded text-[10px]">{parsedPdf.embedUrl}</code>) agar dokumen dapat dibaca langsung oleh siswa tanpa terblokir.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Unggah Dokumen PDF ke Google Cloud Storage (Maks 30MB) *
                  </label>
                  
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-3xl p-6 text-center transition-colors bg-slate-50/50 dark:bg-slate-800/30">
                    <input 
                      type="file" 
                      id="pdf-upload" 
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                    <label htmlFor="pdf-upload" className="cursor-pointer block">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
                        <Upload className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                        {selectedFile ? selectedFile.name : 'Pilih Berkas Dokumen PDF'}
                      </div>
                      <p className="text-xs text-slate-400">
                        {selectedFile 
                          ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Siap disimpan ke server` 
                          : 'Klik untuk telusuri berkas dari komputer Anda'}
                      </p>
                    </label>
                  </div>

                  {uploadProgress > 0 && (
                    <div className="space-y-1.5 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800">
                      <div className="flex justify-between text-xs font-bold text-blue-700 dark:text-blue-300">
                        <span>{uploadStatusText || 'Mengunggah...'}</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <Input 
                label="URL Video YouTube *"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                leftIcon={<Youtube className="w-4 h-4 text-rose-600" />}
                helperText="Masukkan URL video, playlist, atau shorts YouTube"
                required={type === 'youtube'}
              />
              
              {youtubeUrl && isValidYoutubeUrl(youtubeUrl) && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>URL YouTube Valid — Siap di-embed untuk siswa</span>
                </div>
              )}

              {youtubeUrl && !isValidYoutubeUrl(youtubeUrl) && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                  <span>URL YouTube tidak valid. Silakan periksa kembali link video Anda.</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            disabled={isSubmitting}
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
          >
            {editMaterial ? 'Simpan Perubahan' : 'Simpan Materi'}
          </Button>
        </div>
      </form>
    </div>
  );
};
