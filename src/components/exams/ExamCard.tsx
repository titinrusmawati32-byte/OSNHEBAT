import React from 'react';
import { ExamPackage } from '../../types/exam';
import { Layers, Clock, Calendar, Users, Edit2, Trash2, Eye, Play, Archive, Copy } from 'lucide-react';
import { Button } from '../ui/Button';

interface ExamCardProps {
  exam: ExamPackage;
  onEdit: (exam: ExamPackage) => void;
  onDelete: (id: string) => void;
  onPreview: (exam: ExamPackage) => void;
  onDuplicate: (exam: ExamPackage) => void;
  onStatusChange: (id: string, status: any) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({
  exam,
  onEdit,
  onDelete,
  onPreview,
  onDuplicate,
  onStatusChange,
}) => {
  const statusColors = {
    draft: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
    archived: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
  };

  const statusLabels = {
    draft: 'Draft',
    active: 'Aktif',
    scheduled: 'Terjadwal',
    archived: 'Arsip',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all group">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              {exam.subject?.toUpperCase() || ''}
            </span>
            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {exam.category}
            </span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${statusColors[exam.status]}`}>
              {statusLabels[exam.status]}
            </span>
          </div>
          
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight leading-tight">
            {exam.title}
          </h3>
          
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
            {exam.description || 'Tidak ada deskripsi.'}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Layers className="w-3.5 h-3.5" />
              <span>{exam.questionIds.length} Soal</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Clock className="w-3.5 h-3.5" />
              <span>{exam.durationMinutes} Menit</span>
            </div>
            {exam.teacherName && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <Users className="w-3.5 h-3.5" />
                <span>Oleh: {exam.teacherName}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 sm:w-full"
            onClick={() => onPreview(exam)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
          >
            Preview
          </Button>
          <div className="flex gap-2 flex-1 sm:w-full">
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              onClick={() => onEdit(exam)}
              title="Edit Paket"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1"
              onClick={() => onDuplicate(exam)}
              title="Duplikat Paket"
            >
              <Copy className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 border-rose-200 text-rose-500 hover:bg-rose-50"
              onClick={() => onDelete(exam.id)}
              title="Hapus Paket"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="text-[10px] text-slate-400">
          Diperbarui: {exam.updatedAt?.toDate?.()?.toLocaleDateString() || 'Baru saja'}
        </div>
        <div className="flex items-center gap-2">
          {exam.status === 'draft' && (
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => onStatusChange(exam.id, 'active')}
              leftIcon={<Play className="w-3.5 h-3.5" />}
            >
              Aktifkan
            </Button>
          )}
          {exam.status === 'active' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onStatusChange(exam.id, 'archived')}
              leftIcon={<Archive className="w-3.5 h-3.5" />}
            >
              Arsipkan
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
