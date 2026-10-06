import React from 'react';
import { Modal } from '../ui/Modal';
import { FileText, Table, FileSpreadsheet, FileCheck, ArrowRight, Sparkles } from 'lucide-react';

interface FormatSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFormat: (format: 'word' | 'excel' | 'pdf') => void;
}

export const FormatSelectorModal: React.FC<FormatSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectFormat,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pilih Format Dokumen Soal"
      description="Bagaimana Anda ingin mengimpor soal ke Bank Soal CBT?"
      size="lg"
    >
      <div className="space-y-6 pt-2 text-left">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Microsoft Word */}
          <button
            type="button"
            onClick={() => onSelectFormat('word')}
            className="group relative flex flex-col items-start p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-md transition-all text-left cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 border border-blue-200 dark:border-blue-800 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div className="inline-block px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 text-[10px] font-bold tracking-wider uppercase mb-2">
              .DOCX
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Microsoft Word
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Import dari naskah soal Word berformat paragraf, opsi A–D, dan kunci jawaban.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between text-xs font-bold text-blue-600 dark:text-blue-400">
              <span>Pilih Format</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 2: Microsoft Excel */}
          <button
            type="button"
            onClick={() => onSelectFormat('excel')}
            className="group relative flex flex-col items-start p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-200 dark:border-emerald-800 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div className="inline-block px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-[10px] font-bold tracking-wider uppercase mb-2">
              .XLSX / .XLS
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              Microsoft Excel
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Import dari tabel spreadsheet kolom No, Soal, Pilihan A–D, Kunci, dan Pembahasan.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span>Pilih Format</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Card 3: PDF */}
          <button
            type="button"
            onClick={() => onSelectFormat('pdf')}
            className="group relative flex flex-col items-start p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-rose-500 dark:hover:border-rose-500 hover:shadow-md transition-all text-left cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-rose-500"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 border border-rose-200 dark:border-rose-800 group-hover:scale-110 transition-transform">
              <Table className="w-6 h-6" />
            </div>
            <div className="inline-block px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-[10px] font-bold tracking-wider uppercase mb-2">
              .PDF
            </div>
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              Dokumen PDF
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Ekstraksi teks cerdas dari naskah PDF asli (bukan hasil scan/foto).
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 w-full flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
              <span>Pilih Format</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>

        {/* Informative Note */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-slate-100">Prinsip Text-First:</span>{' '}
            Sistem akan mengekstrak teks soal dan opsi terlebih dahulu ke sesi review. Anda dapat memeriksa, mengoreksi, dan menambahkan gambar pendukung secara manual sebelum menyimpannya ke Bank Soal.
          </div>
        </div>
      </div>
    </Modal>
  );
};
