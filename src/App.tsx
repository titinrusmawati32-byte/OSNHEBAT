import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppRoutes } from './routes/AppRoutes';
import { AppErrorBoundary } from './components/system/AppErrorBoundary';
import { normalizeError, logError } from './lib/errorHandler';

export default function App() {
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent) => {
      const normalized = normalizeError(event.error || event.message, 'GlobalWindow');
      logError(normalized);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const normalized = normalizeError(event.reason, 'UnhandledPromiseRejection');
      logError(normalized);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <AppErrorBoundary componentName="RootApp">
      <BrowserRouter>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

