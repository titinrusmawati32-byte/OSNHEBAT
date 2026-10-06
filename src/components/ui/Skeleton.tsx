import React from 'react';
import { FolderX, AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const Skeleton: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-xl ${className}`}
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-full h-3" />
        <Skeleton className="w-2/3 h-3" />
      </div>
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="w-20 h-4" />
        <Skeleton className="w-16 h-8 rounded-xl" />
      </div>
    </div>
  );
};

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-10 h-10',
  };

  return (
    <div
      role="status"
      className={`inline-block border-2 border-slate-300 dark:border-slate-700 border-t-blue-600 dark:border-t-blue-500 rounded-full animate-spin ${sizeStyles[size]} ${className}`}
    >
      <span className="sr-only">Memuat...</span>
    </div>
  );
};

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <FolderX className="w-10 h-10 text-slate-400 dark:text-slate-500" />,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto ${className}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700">
        {icon}
      </div>
      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base sm:text-lg mb-1">
        {title}
      </h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Gagal Memuat Data',
  message,
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-6 sm:p-8 text-center flex flex-col items-center justify-center max-w-md mx-auto ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 border border-rose-200 dark:border-rose-800">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base mb-1">
        {title}
      </h4>
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Coba Lagi
        </Button>
      )}
    </div>
  );
};
