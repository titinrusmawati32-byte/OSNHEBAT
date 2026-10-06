import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { QuestionImportSession } from '../../types/question';
import { useAuth } from '../../contexts/AuthContext';
import { getImportHistory } from '../../services/questionImportService';
import {
  FileText,
  FileSpreadsheet,
  Table,
  CheckCircle2,
  Clock,
  XCircle,
  Calendar,
  User,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';

interface ImportHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResumeReview: (session: QuestionImportSession) => void;
}

export const ImportHistoryModal: React.FC<ImportHistoryModalProps> = ({
  isOpen,
  onClose,
  onResumeReview,
}) => {
  const { profile } = useAuth();
  const [history, setHistory] = useState<QuestionImportSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setLoading(true);
      getImportHistory(profile.role, profile.uid)
        .then((data) => setHistory(data))
        .finally(() => setLoading(false));
    }
  }, [isOpen, profile]);

  const getFormatIcon = (type: string) => {
    if (type === 'word') return <FileText className="w-4 h-4 text-blue-600" />;
    if (type === 'excel') return <FileSpreadsheet className="w-4 h-4 text-emerald-600" />;
    return <Table className="w-4 h-4 text-rose-600" />;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3" />
            <span>Selesai</span>
          </span>
        );
      case 'review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3" />
            <span>Dalam Review</span>
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
            <XCircle className="w-3 h-3" />
            <span>Dibatalkan</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Riwayat Import Dokumen Soal"
      description="Daftar audit file naskah soal yang pernah diunggah ke sistem"
      size="lg"
    >
      <div className="space-y-4 text-left pt-2">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Memuat riwayat import...
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
            <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Belum ada riwayat import
            </div>
            <p className="text-xs text-slate-400">
              Dokumen Word, Excel, atau PDF yang diimpor akan tercatat di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {history.map((item) => {
              const dateStr = item.createdAt?.toDate
                ? item.createdAt.toDate().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '-';

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 mt-0.5">
                      {getFormatIcon(item.fileType)}
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                          {item.fileName}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {item.subjectId?.toUpperCase() || ''}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1 font-mono">
                          {item.totalDetected} soal terdeteksi ({item.totalValid} valid)
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {dateStr}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {item.uploadedByName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    {getStatusBadge(item.status)}

                    {item.status === 'review' && (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => {
                          onResumeReview(item);
                          onClose();
                        }}
                        rightIcon={<ArrowRight className="w-3 h-3" />}
                      >
                        Lanjutkan
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button variant="outline" size="sm" onClick={onClose}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  );
};
