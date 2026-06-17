import { useState, useEffect, useRef } from 'react';
import { Bug, X, ChevronDown, Trash2, RotateCcw } from 'lucide-react';
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

  // Admin-only: visible to admins in all environments, hidden from non-admins
  if (profileData?.role !== 'admin') return null;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-20 right-3 z-[99998] w-10 h-10 rounded-full bg-slate-800/90 hover:bg-slate-700 text-slate-400 hover:text-white shadow-md flex items-center justify-center transition-all duration-200"
        aria-label="Toggle debug overlay"
        style={{ display: open ? 'none' : undefined }}
      >
        <Bug className="w-4 h-4" />
        {errorCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold flex items-center justify-center">
            {errorCount}
          </span>
        )}
      </button>

      {/* Debug panel */}
      {open && (
        <div
          ref={panelRef}
          className="fixed bottom-0 right-0 left-0 md:left-auto md:w-[380px] z-[99999] bg-slate-950 text-white border-t md:border md:rounded-t-2xl md:bottom-3 md:right-3 max-h-[70vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Bug className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-bold">DEBUG</span>
              <span className="text-[10px] text-slate-500">{logs.length} entries</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => { clearDebugLogs(); setLogs([]); }}
                className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                aria-label="Clear debug logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-slate-500 hover:text-white transition-colors"
                aria-label="Close debug panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-800">
            {(['all', 'errors', 'auth'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 text-[11px] font-medium transition-colors ${
                  tab === t
                    ? 'text-white border-b-2 border-blue-500'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {t === 'all' ? 'All' : t === 'errors' ? `Errors (${errorCount})` : 'Auth'}
              </button>
            ))}
          </div>

          {/* Log entries */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filtered.length === 0 ? (
              <div className="text-center text-slate-600 text-xs py-8">No entries</div>
            ) : (
              filtered.map((e, i) => (
                <div key={i} className="text-[11px] font-mono px-2 py-1.5 rounded bg-slate-900/50">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: TYPE_COLORS[e.type] || '#6b7280' }}
                    />
                    <span className="text-slate-500">{timeAgo(e.timestamp)}</span>
                    <span className="font-bold" style={{ color: TYPE_COLORS[e.type] || '#9ca3af' }}>
                      {e.type}
                    </span>
                  </div>
                  {e.message && (
                    <div className="mt-0.5 text-slate-300 break-all">{e.message}</div>
                  )}
                  {e.detail && (
                    <div className="mt-0.5 text-slate-500 break-all text-[10px]">{e.detail}</div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer: quick link to /debug-auth */}
          <div className="border-t border-slate-800 px-3 py-1.5">
            <a
              href="/debug-auth"
              className="text-[11px] text-blue-400 hover:text-blue-300 font-medium"
            >
              Open full debug page →
            </a>
          </div>
        </div>
      )}
    </>
  );
}
