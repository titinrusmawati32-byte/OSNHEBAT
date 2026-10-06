import React, { useState } from 'react';
import { Input, Select, Textarea } from '../ui/Input';
import { ExamDifficulty } from '../../types/exam';

interface ExamStepInfoProps {
  data: any;
  updateData: (updates: any) => void;
}

export const ExamStepInfo: React.FC<ExamStepInfoProps> = ({ data, updateData }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            label="Nama Ujian *"
            placeholder="Contoh: Try Out Olimpiade IPA SD — Paket 1"
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
            required
          />

          <Select
            label="Mata Pelajaran *"
            value={data.subjectId}
            onChange={(e) => updateData({ subjectId: e.target.value })}
            options={[
              { value: 'ipa', label: 'IPA' },
              { value: 'ips', label: 'IPS' },
              { value: 'matematika', label: 'Matematika' },
              { value: 'bahasa_inggris', label: 'Bahasa Inggris' },
            ]}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tingkat/Kelas"
              value={data.gradeLevel}
              onChange={(e) => updateData({ gradeLevel: e.target.value })}
              options={[
                { value: '4', label: 'Kelas 4' },
                { value: '5', label: 'Kelas 5' },
                { value: '6', label: 'Kelas 6' },
                { value: 'all', label: 'Semua' },
              ]}
            />

            <Select
              label="Tingkat Kesulitan"
              value={data.difficulty}
              onChange={(e) => updateData({ difficulty: e.target.value as ExamDifficulty })}
              options={[
                { value: 'mixed', label: 'Campuran' },
                { value: 'easy', label: 'Mudah' },
                { value: 'medium', label: 'Sedang' },
                { value: 'hard', label: 'Sulit' },
              ]}
            />
          </div>
        </div>

        <div className="space-y-4">
          <Textarea
            label="Deskripsi Ujian"
            placeholder="Tuliskan deskripsi atau instruksi pengerjaan..."
            rows={4}
            value={data.description}
            onChange={(e) => updateData({ description: e.target.value })}
          />

          <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">Informasi Paket</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 font-bold uppercase">Auto-Sync</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Jumlah Soal</p>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100">{data.questionIds.length} Soal</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-bold">Estimasi Waktu</p>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100">{data.durationMinutes} Menit</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
