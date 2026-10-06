import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import {
  Award,
  Sun,
  Moon,
  LogOut,
  Bell,
  Search,
  UserCheck,
  Check,
} from 'lucide-react';
import { Avatar, Dropdown, DropdownItem } from '../ui/Avatar';
import { ConfirmDialog } from '../ui/Modal';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const { profile, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  if (!profile) return null;

  const roleLabel = () => {
    switch (profile.role) {
      case 'admin':
        return 'Administrator';
      case 'teacher':
        return 'Guru Pembina';
      case 'student':
        return 'Siswa Olimpiade';
    }
  };

  const roleBadgeStyle = () => {
    switch (profile.role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
      case 'teacher':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'student':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    }
  };

  const handleConfirmLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await logout();
    showToast('Anda telah berhasil keluar.', 'info');
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-3">
            {/* Logo & Branding */}
            <div
              className="flex items-center gap-3 shrink-0 cursor-pointer"
              onClick={() => navigate(`/${profile.role}`)}
            >
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs shadow-blue-600/25">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 tracking-tight text-base sm:text-lg">
                    OLYMPIAD CBT
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hidden sm:inline-block">
                    SD
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block leading-none">
                  Sistem Ujian Pembinaan Olimpiade
                </p>
              </div>
            </div>

            {/* Center Search (Desktop) */}
            <div className="hidden lg:flex items-center flex-1 max-w-xs mx-6">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Cari ujian atau menu..."
                  className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 transition-colors"
                />
              </div>
            </div>

            {/* Right Tools: Theme Toggle, Notification & Profile */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Notification Icon */}
              <button
                type="button"
                onClick={() => showToast('Tidak ada pengumuman baru.', 'info')}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
                aria-label="Lihat notifikasi"
              >
                <Bell className="w-4 h-4" />
                <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1.5 right-1.5" />
              </button>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={resolvedTheme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
              </button>

              {/* User Profile Dropdown */}
              <Dropdown
                trigger={
                  <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 select-none">
                    <Avatar name={profile.displayName} src={profile.photoURL} size="sm" />
                    <div className="hidden md:block text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[120px] leading-tight">
                        {profile.displayName}
                      </div>
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleBadgeStyle()}`}>
                        {roleLabel()}
                      </span>
                    </div>
                  </div>
                }
              >
                <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {profile.displayName}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono truncate">
                    @{profile.username}
                  </p>
                </div>

                <div className="py-1">
                  <DropdownItem onClick={() => navigate(`/${profile.role}/profile`)}>
                    <UserCheck className="w-4 h-4" />
                    <span>Profil Pengguna</span>
                  </DropdownItem>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <DropdownItem onClick={() => setIsLogoutConfirmOpen(true)} destructive>
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Akun</span>
                  </DropdownItem>
                </div>
              </Dropdown>
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Dialog (Section 13) */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Konfirmasi Keluar"
        message="Apakah Anda yakin ingin keluar dari sesi aplikasi OLYMPIAD CBT?"
        confirmLabel="Keluar"
        cancelLabel="Batal"
        isDestructive={true}
      />
    </>
  );
};
