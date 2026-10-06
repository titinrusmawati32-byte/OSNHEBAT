import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ParsedQuestion, Question } from '../../types/question';
import { UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

interface QuestionImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: ParsedQuestion | Question | null;
  onSaveImage: (imageUrl?: string, imageAlt?: string) => void;
}

export const QuestionImageModal: React.FC<QuestionImageModalProps> = ({
  isOpen,
  onClose,
  question,
  onSaveImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [altText, setAltText] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (question) {
      setPreviewUrl(question.imageUrl || '');
      setAltText(question.imageAlt || '');
      setError(null);
    }
  }, [question]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validate format
      const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
      if (!validTypes.includes(file.type)) {
        setError('Format gambar harus JPG, JPEG, PNG, atau WEBP.');
        return;
      }

      // Max size: 5MB
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran gambar maksimal 5 MB.');
        return;
      }

      // Read as base64 Data URL for instant preview and offline/Firestore attachment
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSaveImage(previewUrl || undefined, altText.trim() || undefined);
    onClose();
  };

  const handleRemove = () => {
    setPreviewUrl('');
    setAltText('');
    onSaveImage(undefined, undefined);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kelola Gambar Soal"
      description="Tambahkan atau ganti gambar pendukung (diagram, grafik, anatomi, peta)"
      size="md"
    >
      <div className="space-y-4 text-left pt-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/webp,image/jpg"
          className="hidden"
        />

        {/* Preview Container */}
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center max-h-72">
              <img
                src={previewUrl}
                alt={altText || 'Preview gambar soal'}
                className="w-full h-auto max-h-72 object-contain"
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                Ganti Gambar Lain
              </button>

              <button
                type="button"
                onClick={handleRemove}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus Gambar</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-2xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-900/50"
          >
            <div className="w-12 h-12 mx-auto rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-200 dark:border-blue-800">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Klik untuk Pilih Gambar dari Komputer / HP
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              Format yang didukung: JPG, PNG, WEBP (Maksimal 5 MB)
            </div>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Alt Text Input */}
        <div>
          <Input
            label="Keterangan Gambar (Alt Text)"
            placeholder="Contoh: Ilustrasi penampang daun dan stomata"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            helperText="Keterangan aksesibilitas deskriptif untuk gambar soal."
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" type="button" onClick={onClose}>
            Tutup
          </Button>
          <Button
            variant="primary"
            size="sm"
            type="button"
            onClick={handleSave}
            disabled={!previewUrl && !question?.imageUrl}
          >
            Simpan Gambar
          </Button>
        </div>
      </div>
    </Modal>
  );
};
