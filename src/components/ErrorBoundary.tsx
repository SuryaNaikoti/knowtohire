import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Mock PostHog / Sentry capture
    try {
      (window as any).Sentry?.captureException(error);
      (window as any).posthog?.capture('app_crash', { error: error.message, stack: errorInfo.componentStack });
    } catch (_err) { /* intentionally silent */ }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-slate-100 p-6 text-center shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
              <AlertOctagon className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-lg font-bold text-slate-800 mb-2">Something went wrong</h1>
            <p className="text-sm text-slate-500 mb-6">
              The application encountered an unexpected error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-xl text-sm hover:bg-emerald-700 transition-colors"
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
