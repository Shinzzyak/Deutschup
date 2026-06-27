import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });

    // Log to console for production debugging
    console.error('[ERROR_BOUNDARY] Render error:', {
      message: error.message,
      stack: error.stack?.substring(0, 1000),
      componentStack: errorInfo.componentStack?.substring(0, 1000),
      route: window.location.pathname,
      timestamp: new Date().toISOString(),
    });

    // Capture to localStorage for mobile debugging
    try {
      const existing = JSON.parse(localStorage.getItem('debug_errors') || '[]');
      existing.unshift({
        timestamp: new Date().toISOString(),
        type: 'render_error',
        message: error.message,
        stack: error.stack?.substring(0, 800),
        componentStack: errorInfo.componentStack?.substring(0, 800),
        route: window.location.pathname,
      });
      localStorage.setItem('debug_errors', JSON.stringify(existing.slice(0, 50)));
    } catch {}

    // Capture to debug_logs table if available (fire-and-forget)
    // The localStorage capture above is sufficient for mobile debugging
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0a0a0a] bg-[#0a0a0a] flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#0a0a0a]  border border-[#8b2500]/30 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10  bg-[#8b2500]/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#8b2500]" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-[#0a0a0a]">Terjadi Kesalahan</h1>
                <p className="text-sm text-[#0a0a0a]/40">
                  Komposen mengalami error saat render
                </p>
              </div>
            </div>

            <div className="bg-[#0a0a0a]  p-4 mb-4 border border-[#0a0a0a]/10">
              <div className="text-xs font-mono text-[#8b2500] mb-1">Error Message</div>
              <div className="text-sm text-[#0a0a0a]/80 font-mono break-all">
                {this.state.error.message}
              </div>
            </div>

            {this.state.errorInfo?.componentStack && (
              <div className="bg-[#0a0a0a]  p-4 mb-4 border border-[#0a0a0a]/10 max-h-48 overflow-y-auto">
                <div className="text-xs font-mono text-yellow-400 mb-1">Component Stack</div>
                <pre className="text-xs text-[#0a0a0a]/30 font-mono whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {this.state.error.stack && (
              <div className="bg-[#0a0a0a]  p-4 mb-4 border border-[#0a0a0a]/10 max-h-48 overflow-y-auto">
                <div className="text-xs font-mono text-[#0a0a0a]/60 mb-1">Stack Trace</div>
                <pre className="text-xs text-[#0a0a0a]/30 font-mono whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className="bg-[#0a0a0a]  p-4 mb-4 border border-[#0a0a0a]/10">
              <div className="text-xs font-mono text-[#0a0a0a]/50 mb-1">Context</div>
              <div className="text-xs text-[#0a0a0a]/40 font-mono">
                Route: {window.location.pathname}<br />
                Time: {new Date().toLocaleString('id-ID')}<br />
                User Agent: {navigator.userAgent.substring(0, 80)}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#8b2500] hover:bg-[#8b2500]/80 text-[#f5f0eb]  text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-3 bg-[#0a0a0a]/90 hover:bg-[#0a0a0a]/80  text-sm font-medium transition-colors"
              >
                Ke Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
