import React from 'react';
import { Download, ExternalLink, X, FileText } from 'lucide-react';

interface PdfPreviewProps {
  fileUrl: string;
  title: string;
  onClose?: () => void;
}

export const PdfPreview: React.FC<PdfPreviewProps> = ({ fileUrl, title, onClose }) => {
  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800">
      {/* PDF Header */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-900/30 text-rose-500">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-md">
              {title}
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Dokumen Materi PDF</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <a 
            href={fileUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors shadow-2xs flex items-center gap-2 text-xs font-bold"
            title="Buka di Tab Baru"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">Tab Baru</span>
          </a>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* PDF Viewer Iframe */}
      <div className="flex-1 min-h-[500px] bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center relative">
        <iframe
          src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full h-full border-none"
          title={title}
        />
        
        {/* Mobile Fallback Overlay if iframe fails or on very small screens */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs pointer-events-none md:hidden opacity-0 group-hover:opacity-100 transition-opacity">
           <FileText className="w-12 h-12 text-slate-300 mb-4" />
           <p className="text-xs text-slate-500 font-medium">Jika materi tidak tampil, silakan buka di tab baru atau download.</p>
        </div>
      </div>

      {/* Footer / Mobile Actions */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-center sm:justify-end">
        <a 
          href={fileUrl} 
          download={title}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
        >
          <Download className="w-4 h-4" />
          DOWNLOAD PDF
        </a>
      </div>
    </div>
  );
};
