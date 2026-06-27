import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Bug, X, Trash2 } from 'lucide-react';
import { getDebugLogs, clearDebugLogs, type DebugEntry } from '../stores/debugStore';
import { useAuthStore } from '../stores/authStore';

const TYPE_COLORS: Record<string, string> = {
  'window.error': '#ef4444',
  'unhandledrejection': '#ef4444',
  'render_error': '#ef4444',
  'auth': '#3b82f6',
  'route': '#22c55e',
  'app_start': '#a855f7',
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
      {/* Floating toggle button — admin only, visually detached from user actions */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed right-3 z-[99998] w-9 h-9  bg-[#0a0a0a]/90/70 hover:bg-[#0a0a0a]/80 text-[#0a0a0a]/50 hover:text-[#0a0a0a]/30  flex items-center justify-center transition-all duration-200 opacity-60 hover:opacity-100"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 56px)' }}
        aria-label="Toggle debug overlay"
      >
        <Bug className="w-3.5 h-3.5" />
        {errorCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5  bg-[#8b2500] text-[8px] font-bold flex items-center justify-center">
            {errorCount}
          </span>
        )}
      </button>

      {/* Debug drawer — portal to body, right-side, full height */}
      {createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[99998] bg-black/30 -sm transition-opacity duration-200 ${
              open ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            ref={panelRef}
            className={`fixed top-0 right-0 bottom-0 z-[99999] bg-[#0a0a0a] bg-[#0a0a0a]  flex flex-col transition-transform duration-200 ease-out ${
              open ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{
              width: 'min(90vw, 480px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#0a0a0a]/10 shrink-0">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-bold">DEBUG</span>
                <span className="text-[10px] text-[#0a0a0a]/50">{logs.length} entries</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { clearDebugLogs(); setLogs([]); }}
                  className="p-1.5 text-[#0a0a0a]/50 hover:text-[#8b2500] transition-colors  hover:bg-[#0a0a0a]/90"
                  aria-label="Clear debug logs"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 text-[#0a0a0a]/50 hover:bg-[#0a0a0a] transition-colors  hover:bg-[#0a0a0a]/90"
                  aria-label="Close debug panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-[#0a0a0a]/10 shrink-0">
              {(['all', 'errors', 'auth'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 py-2 text-xs font-medium transition-colors ${
                    tab === t
                      ? 'bg-[#0a0a0a] border-b-2 border-[#0a0a0a]/70'
                      : 'text-[#0a0a0a]/50 hover:text-[#0a0a0a]/30'
                  }`}
                >
                  {t === 'all' ? 'All' : t === 'errors' ? `Errors (${errorCount})` : 'Auth'}
                </button>
              ))}
            </div>

            {/* Log entries */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {filtered.length === 0 ? (
                <div className="text-center text-[#0a0a0a]/60 text-xs py-8">No entries</div>
              ) : (
                filtered.map((e, i) => (
                  <div key={i} className="text-xs font-mono px-2 py-2  bg-[#0a0a0a]/50">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-2 h-2  flex-shrink-0"
                        style={{ background: TYPE_COLORS[e.type] || '#6b7280' }}
                      />
                      <span className="text-[#0a0a0a]/50">{timeAgo(e.timestamp)}</span>
                      <span className="font-bold" style={{ color: TYPE_COLORS[e.type] || '#9ca3af' }}>
                        {e.type}
                      </span>
                    </div>
                    {e.message && (
                      <div className="mt-1 text-[#0a0a0a]/30 break-all">{e.message}</div>
                    )}
                    {e.detail && (
                      <div className="mt-1 text-[#0a0a0a]/50 break-all text-[10px]">{e.detail}</div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#0a0a0a]/10 px-4 py-2 shrink-0">
              <a
                href="/debug-auth"
                className="text-xs text-[#0a0a0a]/60 hover:text-blue-300 font-medium"
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
