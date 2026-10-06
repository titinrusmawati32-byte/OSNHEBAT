import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastType } from '../types';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3500) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type, duration }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      {/* Toast Container: safe positioning on mobile (top center) and desktop (bottom right) */}
      <div className="fixed top-4 inset-x-4 sm:top-auto sm:bottom-5 sm:right-5 sm:left-auto z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let bg = 'bg-slate-900 text-white dark:bg-slate-800 dark:border-slate-700';
          let icon = <Info className="w-4 h-4 text-blue-400 shrink-0" />;

          if (toast.type === 'success') {
            bg = 'bg-emerald-600 text-white dark:bg-emerald-700 shadow-emerald-900/20';
            icon = <CheckCircle2 className="w-4 h-4 text-white shrink-0" />;
          } else if (toast.type === 'error') {
            bg = 'bg-rose-600 text-white dark:bg-rose-700 shadow-rose-900/20';
            icon = <AlertCircle className="w-4 h-4 text-white shrink-0" />;
          } else if (toast.type === 'warning') {
            bg = 'bg-amber-600 text-white dark:bg-amber-700 shadow-amber-900/20';
            icon = <AlertTriangle className="w-4 h-4 text-white shrink-0" />;
          }

          return (
            <div
              key={toast.id}
              role="alert"
              className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border border-white/10 text-xs sm:text-sm font-medium transition-all duration-200 animate-in fade-in slide-in-from-top-2 sm:slide-in-from-bottom-2 ${bg}`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {icon}
                <span className="truncate">{toast.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(toast.id)}
                aria-label="Tutup notifikasi"
                className="ml-3 p-1 rounded-lg hover:bg-black/15 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
