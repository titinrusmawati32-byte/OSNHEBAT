import React from 'react';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';

export const AdminSettingsPage: React.FC = () => {
  const { showToast } = useToast();
  return (
    <div className="max-w-2xl space-y-6 text-left">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Pengaturan Sistem OLYMPIAD CBT
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Konfigurasi umum platform pembinaan olimpiade.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4 text-xs sm:text-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-bold text-slate-900 dark:text-slate-100">Fase Pengembangan</div>
            <p className="text-xs text-slate-500">PHASE 4: Paket Ujian CBT & Wizard</p>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Aktif
          </span>
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => showToast('Pengaturan sistem disimpan.', 'success')}
          >
            Simpan Konfigurasi
          </Button>
        </div>
      </div>
    </div>
  );
};
