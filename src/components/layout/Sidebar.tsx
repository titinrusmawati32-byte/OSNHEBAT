import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Layers,
  Calendar,
  Award,
  Trophy,
  Settings,
  FileCheck,
  FileText,
  History,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = () => {
  const { profile } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!profile) return null;

  const adminNav = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Siswa', path: '/admin/students', icon: GraduationCap },
    { name: 'Guru', path: '/admin/teachers', icon: Users },
    { name: 'Bank Soal', path: '/admin/questions', icon: BookOpen },
    { name: 'Paket Ujian', path: '/admin/exams', icon: Layers },
    { name: 'Materi Pembinaan', path: '/admin/materials', icon: FileText },
    { name: 'Jadwal', path: '/admin/schedules', icon: Calendar },
    { name: 'Hasil Ujian', path: '/admin/results', icon: FileCheck },
    { name: 'Ranking', path: '/admin/ranking', icon: Trophy },
    { name: 'Pengaturan', path: '/admin/settings', icon: Settings },
  ];

  const teacherNav = [
    { name: 'Dashboard', path: '/teacher', icon: LayoutDashboard },
    { name: 'Bank Soal', path: '/teacher/questions', icon: BookOpen },
    { name: 'Paket Ujian', path: '/teacher/exams', icon: Layers },
    { name: 'Materi Pembinaan', path: '/teacher/materials', icon: FileText },
    { name: 'Hasil Siswa', path: '/teacher/results', icon: FileCheck },
    { name: 'Ranking', path: '/teacher/ranking', icon: Trophy },
  ];

  const studentNav = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Ujian Saya', path: '/student/exams', icon: Layers },
    { name: 'Materi Pembinaan', path: '/student/materials', icon: FileText },
    { name: 'Hasil', path: '/student/results', icon: Award },
    { name: 'Riwayat', path: '/student/history', icon: History },
  ];

  const navItems =
    profile.role === 'admin'
      ? adminNav
      : profile.role === 'teacher'
      ? teacherNav
      : studentNav;

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 z-20 shrink-0 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Sidebar Navigation Links */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          {!isCollapsed && 'Menu Navigasi'}
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/teacher' || item.path === '/student'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all select-none ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </div>

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        {!isCollapsed && (
          <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 truncate px-2">
            Phase 1 • UI Shell
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-label={isCollapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors mx-auto"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  );
};
