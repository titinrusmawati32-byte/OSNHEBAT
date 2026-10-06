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
  Loader2
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

  // PDF State
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setFileProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState(editMaterial?.fileUrl || '');
  const [fileName, setFileName] = useState(editMaterial?.fileName || '');
  const [fileSize, setFileSize] = useState(editMaterial?.fileSize || 0);
  const [filePath, setFilePath] = useState(editMaterial?.filePath || '');

  // YouTube State
  const [youtubeUrl, setYoutubeUrl] = useState(editMaterial?.youtubeUrl || '');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      showToast('Hanya file PDF yang diperbolehkan.', 'error');
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      showToast('Ukuran file maksimal 10MB.', 'error');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setFileSize(selectedFile.size);
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
      let materialData: any = {
        title,
        description,
        subjectId,
        gradeLevel,
        topic,
        type,
        status,
        createdBy: profile.uid,
        createdByName: profile.displayName || profile.name || profile.username,
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
        // PDF Type
        if (!editMaterial && !file && !fileUrl) {
          showToast('Silakan pilih file PDF untuk diunggah.', 'warning');
          setIsSubmitting(false);
          return;
        }

        // If new file is selected, upload it first
        if (file) {
          setIsUploading(true);
          const materialId = editMaterial?.id || 'temp_' + Date.now();
          const downloadUrl = await materialStorageService.uploadMaterialPdf(
            subjectId,
            materialId,
            file,
            (progress) => setFileProgress(progress)
          );
          materialData.fileUrl = downloadUrl;
          materialData.fileName = fileName;
          materialData.fileSize = fileSize;
          materialData.filePath = `materials/${subjectId}/${materialId}/document.pdf`;
          setIsUploading(false);
        } else if (editMaterial) {
          materialData.fileUrl = fileUrl;
          materialData.fileName = fileName;
          materialData.fileSize = fileSize;
          materialData.filePath = filePath;
        }
      }

      if (editMaterial) {
        await materialService.updateMaterial(editMaterial.id, materialData);
        showToast('Materi berhasil diperbarui.', 'success');
      } else {
        await materialService.createMaterial(materialData);
        showToast('Materi berhasil ditambahkan.', 'success');
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving material:', error);
      showToast('Gagal menyimpan materi. Silakan coba lagi.', 'error');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          {editMaterial ? 'Edit Materi Pembinaan' : 'Tambah Materi Baru'}
        </h3>
        <button 
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <Input 
              label="Judul Materi *"
              placeholder="Contoh: Pengenalan Fotosintesis"
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
              placeholder="Jelaskan isi materi secara singkat..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <Select 
            label="Mata Pelajaran *"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value as MaterialSubject)}
            options={[
              { value: 'ipa', label: 'IPA' },
              { value: 'ips', label: 'IPS' },
              { value: 'matematika', label: 'Matematika' },
              { value: 'bahasa_inggris', label: 'Bahasa Inggris' },
            ]}
          />

          <Input 
            label="Tingkat / Kelas"
            placeholder="Contoh: Kelas 6 SD"
            value={gradeLevel}
            onChange={(e) => setGradeLevel(e.target.value)}
          />

          <Input 
            label="Topik"
            placeholder="Contoh: Biologi Tumbuhan"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <Select 
            label="Jenis Materi *"
            value={type}
            onChange={(e) => setType(e.target.value as MaterialType)}
            options={[
              { value: 'pdf', label: 'File PDF' },
              { value: 'youtube', label: 'Video YouTube' },
            ]}
            disabled={!!editMaterial}
          />

          <Select 
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as MaterialStatus)}
            options={[
              { value: 'published', label: 'Langsung Publish' },
              { value: 'draft', label: 'Simpan sebagai Draf' },
              { value: 'archived', label: 'Arsip' },
            ]}
          />
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          {type === 'pdf' ? (
            <div className="space-y-4">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">
                Upload File PDF
              </label>
              
              {!file && !fileUrl ? (
                <div className="relative group">
                  <input 
                    type="file" 
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 bg-slate-50 dark:bg-slate-800/40 group-hover:border-blue-400 transition-colors">
                    <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Klik atau seret file PDF</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">Maksimal 10MB • Hanya PDF</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/40 text-rose-600">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">
                        {fileName}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">
                        {(fileSize / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  {!isUploading && !isSubmitting && (
                    <button 
                      type="button"
                      onClick={() => {
                        setFile(null);
                        setFileUrl('');
                        setFileName('');
                        setFileSize(0);
                      }}
                      className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {isUploading && (
                    <div className="flex flex-col items-end gap-1 min-w-[80px]">
                      <span className="text-[10px] font-black text-blue-600 uppercase">Mengunggah... {Math.round(uploadProgress)}%</span>
                      <div className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-600 transition-all duration-300"
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
                label="URL Video YouTube"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                leftIcon={<Youtube className="w-4 h-4 text-rose-600" />}
                helperText="Masukkan URL video, shorts, atau embed YouTube"
              />
              
              {youtubeUrl && isValidYoutubeUrl(youtubeUrl) && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 flex items-center gap-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>URL YouTube Valid</span>
                </div>
              )}

              {youtubeUrl && !isValidYoutubeUrl(youtubeUrl) && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 flex items-center gap-2 text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">
                  <AlertCircle className="w-4 h-4" />
                  <span>URL YouTube tidak valid. Silakan masukkan URL video YouTube yang benar.</span>
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
            disabled={isSubmitting || isUploading}
          >
            Batal
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            isLoading={isSubmitting || isUploading}
            leftIcon={isSubmitting || isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : undefined}
          >
            {editMaterial ? 'Simpan Perubahan' : 'Simpan Materi'}
          </Button>
        </div>
      </form>
    </div>
  );
};
