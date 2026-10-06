import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNavigation } from '../components/layout/BottomNavigation';

export const BaseLayout: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-blue-100 dark:selection:bg-blue-900/40">
      {/* Universal Top Header */}
      <Header />

      <div className="flex-1 flex w-full">
        {/* Desktop Sidebar (hidden on mobile) */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-12 overflow-x-hidden">
          {children || <Outlet />}
        </main>
      </div>

      {/* Mobile Bottom Navigation (hidden on desktop) */}
      <BottomNavigation />
    </div>
  );
};
