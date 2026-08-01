import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from './Button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[UNHANDLED RUNTIME ERROR CAUGHT BY ERROR BOUNDARY]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-2xl shadow-xl p-8 text-center space-y-6">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Something went wrong</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                An unexpected application error occurred. The KnowToHire telemetry service has logged this event for review.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-100 rounded-xl text-left text-[11px] font-mono text-slate-700 overflow-x-auto max-h-32 border border-slate-200">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                onClick={() => window.location.reload()}
                className="flex-1 h-10 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reload Page
              </Button>

              <Button
                onClick={this.handleReset}
                className="flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" /> Return Home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
