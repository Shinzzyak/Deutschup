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

      /* LIGHT-NATIVE. This boundary wraps the whole app and never got the
         dark-theme sweep the pages did: useTheme() is called nowhere, so
         `.dark` never lands on <html> and these colours rendered on a WHITE
         card. Measured with WCAG 2.1 relative luminance:
           text-red-400    #ff6467 on white   2.89:1 -> brand-rust #8b2500 8.89:1
           text-red-400    on bg-muted/50     2.77:1 -> brand-rust          8.52:1
           text-yellow-400 #fdc700 on #fafafa 1.51:1 -> #7a5200             6.63:1
           bg-red-950/30 plate vs white       1.96:1 -> #f6e8e3 tint, #e0bfb2 edge,
                                                        rust icon on it     7.44:1
         Every label already carries its meaning in words, so no state here
         ever rested on colour alone. */
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 text-foreground">
          <div className="max-w-lg w-full bg-card border border-brand-rust/40 p-6 text-card-foreground shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#f6e8e3] border border-[#e0bfb2] flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-brand-rust" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground">Terjadi Kesalahan</h1>
                <p className="text-sm text-muted-foreground">
                  Komposen mengalami error saat render
                </p>
              </div>
            </div>

            <div className="bg-muted/50 p-4 mb-4 border border-border">
              <div className="text-xs font-mono text-brand-rust mb-1">Error Message</div>
              <div className="text-sm text-foreground font-mono break-all">
                {this.state.error.message}
              </div>
            </div>

            {this.state.errorInfo?.componentStack && (
              <div className="bg-muted/50 p-4 mb-4 border border-border max-h-48 overflow-y-auto">
                <div className="text-xs font-mono text-[#7a5200] mb-1">Component Stack</div>
                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {this.state.error.stack && (
              <div className="bg-muted/50 p-4 mb-4 border border-border max-h-48 overflow-y-auto">
                <div className="text-xs font-mono text-muted-foreground mb-1">Stack Trace</div>
                <pre className="text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className="bg-muted/50 p-4 mb-4 border border-border">
              <div className="text-xs font-mono text-muted-foreground mb-1">Context</div>
              <div className="text-xs text-muted-foreground font-mono">
                Route: {window.location.pathname}<br />
                Time: {new Date().toLocaleString('id-ID')}<br />
                User Agent: {navigator.userAgent.substring(0, 80)}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 px-4 py-3 bg-muted hover:bg-muted/80 text-foreground border border-border text-sm font-medium transition-colors"
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
