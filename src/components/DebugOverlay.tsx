import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Bug, X, Trash2 } from 'lucide-react';
import { getDebugLogs, clearDebugLogs, type DebugEntry } from '../stores/debugStore';
import { useAuthStore } from '../stores/authStore';

const TYPE_COLORS: Record<string, string> = {
  /* Light-native. These are printed as text on a white card, so they are
     measured against #ffffff, not against the dark panel this map was written
     for: #ef4444 3.76:1, #3b82f6 3.68:1, #22c55e 2.28:1, #a855f7 3.96:1 — all
     under AA. The replacements are 6.5–8.9:1 and reuse the same tone ramp as
     the admin surfaces. The type name is printed next to the dot, so colour
     never carries the category on its own. */
  'window.error': '#8b2500',
  'unhandledrejection': '#8b2500',
  'render_error': '#8b2500',
  'auth': '#1e40af',
  'route': '#1a6b3d',
  'app_start': '#6d28d9',
};

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return new Date(ts).toLocaleTimeString('id-ID');
}

export default function DebugOverlay() {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<DebugEntry[]>([]);
  const [tab, setTab] = useState<'all' | 'errors' | 'auth'>('all');
  const panelRef = useRef<HTMLDivElement>(null);

  const { profileData } = useAuthStore();

  useEffect(() => {
    if (!open) return;
    const interval = setInterval(() => setLogs(getDebugLogs()), 1000);
    setLogs(getDebugLogs());
    return () => clearInterval(interval);
  }, [open]);

  const filtered = logs.filter(e => {
    if (tab === 'errors') return e.type.includes('error') || e.type === 'unhandledrejection' || e.type === 'render_error';
    if (tab === 'auth') return e.type === 'auth';
    return true;
  });

  const errorCount = logs.filter(e => e.type.includes('error') || e.type === 'unhandledrejection').length;

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  // Click outside to close
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setOpen(false);
    }
  }, []);

  // Admin-only
  if (profileData?.role !== 'admin') return null;

  return (
    <>
      {/* Floating toggle button — admin only */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-3 z-[99998] w-9 h-9 bg-background/90 hover:bg-background/80 text-muted-foreground hover:text-foreground border border-border flex items-center justify-center transition-all duration-200 opacity-60 hover:opacity-100"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 56px)' }}
        aria-label="Toggle debug overlay"
      >
        <Bug className="w-3.5 h-3.5" />
        {errorCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brand-rust text-brand-cream text-[8px] font-bold flex items-center justify-center">
            {errorCount}
          </span>
        )}
      </button>

      {/* Debug drawer — portal to body, right-side, full height */}
      {createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[99998] bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
              open ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            ref={panelRef}
            className={`fixed top-0 right-0 bottom-0 z-[99999] bg-background border-l border-border flex flex-col transition-transform duration-200 ease-out shadow-2xl ${
              open ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{
              width: 'min(90vw, 480px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-[#7a5200]" />
                <span className="text-sm font-bold text-foreground">DEBUG</span>
                <span className="text-[10px] text-muted-foreground">{logs.length} entries</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { clearDebugLogs(); setLogs([]); }}
                  className="p-1.5 text-muted-foreground hover:text-brand-rust transition-colors rounded hover:bg-muted"
                  aria-label="Clear debug logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                  aria-label="Close debug panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border shrink-0">
              {(['all', 'errors', 'auth'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    tab === t
                      ? 'bg-muted text-foreground border-b-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'errors' ? `Errors (${errorCount})` : 'Auth'}
                </button>
              ))}
            </div>

            {/* Log entries */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {filtered.length === 0 ? (
                <div className="text-center text-muted-foreground text-xs py-8">No entries</div>
              ) : (
                filtered.map((e, i) => (
                  <div key={i} className="text-xs font-mono px-2 py-2 rounded bg-muted/50 border border-border">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: TYPE_COLORS[e.type] || '#5c5956' }}
                      />
                      <span className="text-muted-foreground">{timeAgo(e.timestamp)}</span>
                      <span className="font-bold" style={{ color: TYPE_COLORS[e.type] || '#5c5956' }}>
                        {e.type}
                      </span>
                    </div>
                    {e.message && (
                      <div className="mt-1 text-foreground/70 break-all">{e.message}</div>
                    )}
                    {e.detail && (
                      <div className="mt-1 text-muted-foreground break-all text-[10px]">{e.detail}</div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border px-4 py-2 shrink-0">
              <a
                href="/debug-auth"
                className="text-xs text-muted-foreground hover:text-primary font-medium"
              >
                Open full debug page →
              </a>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
