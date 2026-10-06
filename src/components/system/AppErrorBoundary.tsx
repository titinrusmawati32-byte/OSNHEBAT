import React, { Component, ErrorInfo, ReactNode } from 'react';
import { normalizeError, logError, NormalizedError } from '../../lib/errorHandler';
import { ErrorRecoveryPage } from '../../pages/system/ErrorRecoveryPage';

interface Props {
  children: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error: NormalizedError | null;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    const normalized = normalizeError(error, 'AppErrorBoundary');
    return { hasError: true, error: normalized };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const componentName = this.props.componentName || 'RootComponent';
    const normalized = normalizeError(error, componentName);
    logError(normalized);
    this.setState({ error: normalized });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      const isDev = process.env.NODE_ENV === 'development' || window.location.hostname.includes('localhost') || window.location.hostname.includes('ais-dev');
      
      return (
        <ErrorRecoveryPage
          title={this.state.error.type === 'FirebaseError' ? 'Kendala Server Database' : 'Terjadi kendala sementara'}
          message={this.state.error.userMessage}
          onRetry={this.handleRetry}
          onHome={this.handleHome}
          showDetails={isDev}
          errorDetails={this.state.error}
        />
      );
    }

    return this.props.children;
  }
}
