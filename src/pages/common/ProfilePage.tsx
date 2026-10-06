import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { UserCheck, Shield, BookOpen, GraduationCap, LogOut, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/Modal';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { showToast } = useToast();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  if (!profile) return null;

  const roleLabel = () => {
    switch (profile.role) {
      case 'admin':
        return 'Administrator Sistem';
      case 'teacher':
        return 'Guru Pembina Olimpiade';
      case 'student':
        return 'Siswa Peserta Pembinaan';
    }
  };

  const handleConfirmLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await logout();
    showToast('Anda telah keluar.', 'info');
    navigate('/login');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Profil Akun Pengguna
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Informasi identitas akun dan status kepesertaan olimpiade.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* User Identity Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-black text-xl flex items-center justify-center border border-blue-200 dark:border-blue-800 shrink-0">
            {(profile.displayName || profile.username || 'U').substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              {profile.displayName}
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-mono">
              @{profile.username}
            </p>
          </div>
        </div>

        {/* Profile Data Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
              Peran / Role
            </span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100">
              {roleLabel()}
            </span>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
              Status Akun
            </span>
            <span
              className={`inline-flex items-center gap-1 font-bold ${
                profile.isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{profile.isActive ? 'Aktif & Terverifikasi' : 'Nonaktif'}</span>
            </span>
          </div>

          {profile.school && (
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
                Asal Sekolah
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                {profile.school}
              </span>
            </div>
          )}

          {(profile.className || profile.grade) && (
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
                Tingkat Kelas
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                {profile.className || profile.grade}
              </span>
            </div>
          )}

          {profile.subject && (
            <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40">
              <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
                Bidang Olimpiade
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100 uppercase">
                {profile.subject}
              </span>
            </div>
          )}

          <div className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-800/40 sm:col-span-2">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider block mb-1">
              User ID (Firebase Identity)
            </span>
            <span className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all">
              {profile.uid}
            </span>
          </div>
        </div>

        {/* Security Note */}
        <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300 leading-relaxed flex items-start gap-2.5">
          <Shield className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Kredensial password Anda dilindungi dengan enkripsi Firebase Authentication dan tidak disimpan dalam basis data Firestore demi keamanan maksimal.
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/${profile.role}`)}
          >
            Kembali ke Dashboard
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsLogoutConfirmOpen(true)}
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Keluar Akun
          </Button>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari sesi akun OLYMPIAD CBT?"
        confirmLabel="Keluar"
        cancelLabel="Batal"
        isDestructive={true}
      />
    </div>
  );
};
