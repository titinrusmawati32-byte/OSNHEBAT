import React from 'react';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface ErrorRecoveryPageProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onHome?: () => void;
  showDetails?: boolean;
  errorDetails?: {
    type: string;
    message: string;
    component?: string;
    route?: string;
    timestamp?: string;
    stack?: string;
  };
}

export const ErrorRecoveryPage: React.FC<ErrorRecoveryPageProps> = ({
  title = 'Terjadi kendala sementara',
  message = 'Bagian aplikasi ini mengalami kendala. Data Anda tidak akan diubah secara otomatis.',
  onRetry,
  onHome,
  showDetails = false,
  errorDetails,
}) => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 text-left">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/50">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onRetry && (
            <Button
              variant="primary"
              size="md"
              onClick={onRetry}
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="w-full sm:w-auto"
            >
              Coba Lagi
            </Button>
          )}
          <Button
            variant="outline"
            size="md"
            onClick={onHome || (() => window.location.href = '/')}
            leftIcon={<Home className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Kembali ke Dashboard
          </Button>
        </div>

        {showDetails && errorDetails && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-rose-500 mb-2">
              Development Error Information
            </h4>
            <div className="bg-slate-900 text-slate-200 p-4 rounded-2xl font-mono text-[11px] space-y-1.5 overflow-x-auto max-h-48 border border-slate-800">
              <div><span className="text-rose-400">Error Type:</span> {errorDetails.type}</div>
              <div><span className="text-rose-400">Message:</span> {errorDetails.message}</div>
              <div><span className="text-rose-400">Component:</span> {errorDetails.component}</div>
              <div><span className="text-rose-400">Route:</span> {errorDetails.route}</div>
              <div><span className="text-rose-400">Timestamp:</span> {errorDetails.timestamp}</div>
              {errorDetails.stack && (
                <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 whitespace-pre-wrap">
                  {errorDetails.stack}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
