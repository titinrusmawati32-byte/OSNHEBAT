import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import {
  UploadCloud,
  FileText,
  FileSpreadsheet,
  Table,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Layers,
  FileQuestion,
  HelpCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface DocumentUploadStepProps {
  format: 'word' | 'excel' | 'pdf';
  onBack: () => void;
  onProcess: (file: File, subjectId: string) => Promise<void>;
  isProcessing: boolean;
  processingStep: string;
}

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const DocumentUploadStep: React.FC<DocumentUploadStepProps> = ({
  format,
  onBack,
  onProcess,
  isProcessing,
  processingStep,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [subjectId, setSubjectId] = useState<string>('ipa');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [excelSheets, setExcelSheets] = useState<string[]>([]);

  const formatConfig = {
    word: {
      title: 'Import Soal dari Word',
      exts: ['.docx'],
      accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      icon: <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />,
      color: 'blue',
      guide: 'Pastikan naskah Word memiliki penomoran soal jelas (1., 2., dst.) dan opsi pilihan (A., B., C., D.). Kunci jawaban dapat dicantumkan dengan "Kunci: B".',
    },
    excel: {
      title: 'Import Soal dari Excel',
      exts: ['.xlsx', '.xls'],
      accept: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
      icon: <FileSpreadsheet className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
      color: 'emerald',
      guide: 'Pastikan baris pertama berisi header kolom: No, Soal (atau Pertanyaan), A, B, C, D, Kunci (atau Kunci Jawaban), dan Pembahasan.',
    },
    pdf: {
      title: 'Import Soal dari PDF',
      exts: ['.pdf'],
      accept: '.pdf,application/pdf',
      icon: <Table className="w-8 h-8 text-rose-600 dark:text-rose-400" />,
      color: 'rose',
      guide: 'Gunakan dokumen PDF teks asli (dapat di-blok/select). Naskah hasil scan murni tanpa lapisan teks memerlukan OCR.',
    },
  }[format];

  const validateAndSetFile = async (file: File) => {
    setValidationError(null);
    setExcelSheets([]);

    // Check size
    if (file.size === 0) {
      setValidationError('File kosong (0 byte). Harap pilih file yang valid.');
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(`Ukuran file (${(file.size / (1024 * 1024)).toFixed(1)} MB) melebihi batas maksimal ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    // Check extension
    const fileName = file.name.toLowerCase();
    const hasValidExt = formatConfig.exts.some((ext) => fileName.endsWith(ext));
    if (!hasValidExt) {
      setValidationError(`Format file tidak sesuai dengan pilihan. Harap upload file ${formatConfig.exts.join(' atau ')}.`);
      return;
    }

    setSelectedFile(file);

    // If Excel, try reading sheet names for instant preview
    if (format === 'excel') {
      try {
        const buffer = await file.arrayBuffer();
        const wb = XLSX.read(buffer, { type: 'array' });
        setExcelSheets(wb.SheetNames || []);
      } catch {
        // Ignored; will be caught in processing
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isProcessing) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isProcessing) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || isProcessing) return;
    await onProcess(selectedFile, subjectId);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali Pilih Format</span>
        </button>

        <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
          Format: {format.toUpperCase()}
        </span>
      </div>

      {/* Main Upload Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
            {formatConfig.icon}
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {formatConfig.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Maksimal ukuran file: {MAX_FILE_SIZE_MB} MB. Format: {formatConfig.exts.join(', ')}.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Pilih Bidang Olimpiade (Berlaku untuk seluruh dokumen):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'ipa', label: 'IPA', color: 'emerald', desc: 'Sains & Fisika' },
                { id: 'ips', label: 'IPS', color: 'orange', desc: 'Sosial & Sejarah' },
                { id: 'matematika', label: 'Matematika', color: 'violet', desc: 'Aritmatika & Logika' },
                { id: 'bahasa_inggris', label: 'B. Inggris', color: 'blue', desc: 'Grammar & Vocab' },
              ].map((sub) => {
                const isSelected = subjectId === sub.id;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    disabled={isProcessing}
                    onClick={() => setSubjectId(sub.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-600/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center justify-between">
                      <span>{sub.label}</span>
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{sub.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 scale-[1.01]'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-950/40'
            } ${isProcessing ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={formatConfig.accept}
              className="hidden"
              disabled={isProcessing}
            />

            <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 border border-blue-200 dark:border-blue-800 shadow-2xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {selectedFile ? 'Ganti Dokumen' : 'Tarik & Letakkan File di Sini'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              atau klik untuk memilih file dari komputer / HP Anda
            </p>

            <div className="mt-3 inline-block px-3 py-1 rounded-full bg-slate-200/60 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
              Format yang diterima: {formatConfig.exts.join(', ')}
            </div>
          </div>

          {/* Quick Sample Document Generator */}
          {format === 'excel' && !selectedFile && (
            <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300">
                <FileSpreadsheet className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>Ingin mencoba langsung tanpa membuat file Excel baru?</span>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const { generateSampleExcelFile } = await import('../../lib/parsers/sampleDocuments');
                  const sampleFile = generateSampleExcelFile();
                  validateAndSetFile(sampleFile);
                }}
                className="px-3 py-1.5 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shrink-0 cursor-pointer shadow-xs"
              >
                Gunakan Naskah Sampel IPA (.xlsx)
              </button>
            </div>
          )}

          {/* Validation Error Message */}
          {validationError && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-rose-700 dark:text-rose-300 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Perhatian:</span> {validationError}
              </div>
            </div>
          )}

          {/* Selected File Card */}
          {selectedFile && (
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm truncate">
                    {selectedFile.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                    {excelSheets.length > 0 && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        • {excelSheets.length} Sheet ({excelSheets.join(', ')})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setSelectedFile(null);
                  setExcelSheets([]);
                }}
                className="text-xs font-bold text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-2 cursor-pointer"
              >
                Hapus
              </button>
            </div>
          )}

          {/* Live Progress Bar when Processing */}
          {isProcessing && (
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {processingStep || 'Memproses dokumen...'}
                </span>
                <span>Harap tunggu</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full animate-pulse w-3/4 transition-all duration-300" />
              </div>
              <p className="text-[11px] text-slate-400 text-left">
                Dokumen tidak akan langsung masuk database. Hasil ekstraksi akan dibuka di sesi review terlebih dahulu.
              </p>
            </div>
          )}

          {/* Guide Hint */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span>{formatConfig.guide}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onBack}
              disabled={isProcessing}
            >
              Batal
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!selectedFile || isProcessing}
              isLoading={isProcessing}
            >
              {isProcessing ? 'MEMPROSES DOKUMEN...' : 'PROSES DOKUMEN'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
