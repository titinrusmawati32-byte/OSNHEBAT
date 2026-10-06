import React from 'react';
import { 
  FileText, 
  Youtube, 
  Clock, 
  User, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  Archive,
  Download,
  ExternalLink
} from 'lucide-react';
import { TrainingMaterial } from '../../types/material';
import { Button } from '../ui/Button';

interface MaterialCardProps {
  material: TrainingMaterial;
  role: 'admin' | 'teacher' | 'student';
  onEdit?: (material: TrainingMaterial) => void;
  onDelete?: (material: TrainingMaterial) => void;
  onView: (material: TrainingMaterial) => void;
  onArchive?: (material: TrainingMaterial) => void;
}

export const MaterialCard: React.FC<MaterialCardProps> = ({
  material,
  role,
  onEdit,
  onDelete,
  onView,
  onArchive,
}) => {
  const isPDF = material.type === 'pdf';
  const isYouTube = material.type === 'youtube';
  
  const subjectColors: Record<string, string> = {
    ipa: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
    ips: 'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400 border-orange-200 dark:border-orange-800',
    matematika: 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400 border-violet-200 dark:border-violet-800',
    bahasa_inggris: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  };

  const statusColors: Record<string, string> = {
    published: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
    draft: 'bg-slate-500/10 text-slate-500 border-slate-200/50',
    archived: 'bg-amber-500/10 text-amber-600 border-amber-200/50',
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '-';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 flex flex-col h-full">
      {/* Type Badge & Header Image/Placeholder */}
      <div className="relative h-32 overflow-hidden bg-slate-50 dark:bg-slate-850 flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
        {isPDF ? (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/30 text-rose-500">
              <FileText className="w-10 h-10" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">DOKUMEN PDF</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 text-blue-500">
              <Youtube className="w-10 h-10" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">VIDEO YOUTUBE</span>
          </div>
        )}

        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${subjectColors[material.subjectId] || 'bg-slate-100'}`}>
          {material.subjectId.replace('_', ' ')}
        </div>

        {role !== 'student' && (
          <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${statusColors[material.status]}`}>
            {material.status}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col space-y-3">
        <div>
          <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
            {material.title}
          </h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">{material.gradeLevel || 'Semua Kelas'}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="text-[10px] font-bold text-slate-400 uppercase truncate">{material.topic || 'Pembinaan'}</span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
          {material.description || 'Tidak ada deskripsi materi.'}
        </p>

        <div className="pt-3 mt-auto border-t border-slate-50 dark:border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <User className="w-3 h-3 text-slate-400" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-slate-900 dark:text-slate-100 leading-none">
                {material.createdByName}
              </span>
              <span className="text-[8px] text-slate-400 mt-0.5 uppercase tracking-tighter">
                {formatDate(material.createdAt)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {isPDF && material.fileUrl && (
              <a 
                href={material.fileUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                title="Download PDF"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </a>
            )}
            {isYouTube && material.youtubeUrl && (
              <a 
                href={material.youtubeUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                title="Buka di YouTube"
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 pt-0 grid grid-cols-1 gap-2">
        <Button 
          variant="primary" 
          size="sm" 
          fullWidth
          onClick={() => onView(material)}
          leftIcon={isYouTube ? <Youtube className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          className="rounded-xl text-[11px] font-black"
        >
          {isYouTube ? 'TONTON VIDEO' : 'BUKA MATERI'}
        </Button>

        {role !== 'student' && (
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onEdit?.(material)}
              className="flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-all shadow-2xs"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onArchive?.(material)}
              className="flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-all shadow-2xs"
              title="Arsip"
            >
              <Archive className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete?.(material)}
              className="flex items-center justify-center p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 transition-all shadow-2xs"
              title="Hapus"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
