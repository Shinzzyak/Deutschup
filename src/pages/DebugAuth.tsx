import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { getDebugLogs, clearDebugLogs, type DebugEntry } from '../stores/debugStore';
import { ArrowLeft, Trash2, Copy, Check } from 'lucide-react';

export default function DebugAuth() {
  const { user, loading, profileData, tierData, profileLoaded } = useAuthStore();
  const location = useLocation();
  const [logs, setLogs] = useState<DebugEntry[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLogs(getDebugLogs());
    const interval = setInterval(() => setLogs(getDebugLogs()), 2000);
    return () => clearInterval(interval);
  }, []);

  // Admin-only: visible to admins in all environments, hidden from non-admins
  if (profileData?.role !== 'admin') return null;

  const authEvents = logs.filter(e => e.type === 'auth');
  const routeEvents = logs.filter(e => e.type === 'route');
  const errorEvents = logs.filter(e =>
    e.type.includes('error') || e.type === 'unhandledrejection' || e.type === 'render_error'
  );

  const copyAll = async () => {
    const text = JSON.stringify({
      timestamp: new Date().toISOString(),
      route: location.pathname,
      auth: { userId: user?.id, loading, profileLoaded, tierData, profileData },
      errors: errorEvents,
      authEvents,
      routeEvents,
      allLogs: logs,
    }, null, 2);
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Back to dashboard">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Debug: Auth</h1>
            <p className="text-xs text-muted-foreground">{logs.length} captured entries</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-300" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy All'}
          </button>
          <button
            onClick={() => { clearDebugLogs(); setLogs([]); }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-950/40 hover:bg-red-950/60 text-red-300 border border-red-500/25 text-xs font-medium transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Auth State */}
      <Section title="Auth State" color="blue">
        <Row label="user.id" value={user?.id || 'NULL'} />
        <Row label="user.email" value={user?.email || 'NULL'} />
        <Row label="loading" value={String(loading)} />
        <Row label="profileLoaded" value={String(profileLoaded)} />
        <Row label="tierData.tier" value={tierData?.tier || 'NULL'} />
        <Row label="tierData.subscription" value={tierData?.subscription || 'NULL'} />
        <Row label="tierData.pro_expires_at" value={tierData?.pro_expires_at || 'NULL'} />
      </Section>

      {/* Profile State */}
      <Section title="Profile State" color="purple">
        <Row label="full_name" value={profileData?.full_name || 'NULL'} />
        <Row label="avatar_url" value={profileData?.avatar_url || 'NULL'} />
        <Row label="role" value={profileData?.role || 'NULL'} />
      </Section>

      {/* Clerk State */}
      <Section title="Clerk State" color="yellow">
        <Row label="window.Clerk" value={typeof (window as any).Clerk} />
        <Row label="Clerk.user" value={(window as any).Clerk?.user ? 'present' : 'null'} />
      </Section>

      {/* Route State */}
      <Section title="Route State" color="green">
        <Row label="pathname" value={location.pathname} />
        <Row label="search" value={location.search || '(none)'} />
        <Row label="hash" value={location.hash || '(none)'} />
        <Row label="route_transitions" value={String(routeEvents.length)} />
        {routeEvents.slice(0, 5).map((e, i) => (
          <Row key={i} label={timeAgo(e.timestamp)} value={e.message || ''} />
        ))}
      </Section>

      {/* Errors */}
      <Section title={`Errors (${errorEvents.length})`} color="red">
        {errorEvents.length === 0 ? (
          <div className="text-muted-foreground text-xs py-2">No errors captured</div>
        ) : (
          errorEvents.map((e, i) => (
            <div key={i} className="text-[11px] font-mono border-b border-border py-2 last:border-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-red-400 font-bold">{e.type}</span>
                <span className="text-muted-foreground">{timeAgo(e.timestamp)}</span>
                <span className="text-muted-foreground">{e.route}</span>
              </div>
              <div className="text-foreground/80 mt-0.5 break-all">{e.message}</div>
              {e.detail && (
                <div className="text-muted-foreground mt-0.5 break-all text-[10px] max-h-16 overflow-y-auto">{e.detail}</div>
              )}
            </div>
          ))
        )}
      </Section>

      {/* Auth Events */}
      <Section title={`Auth Events (${authEvents.length})`} color="blue">
        {authEvents.length === 0 ? (
          <div className="text-muted-foreground text-xs py-2">No auth events</div>
        ) : (
          authEvents.slice(0, 20).map((e, i) => (
            <div key={i} className="text-[11px] font-mono border-b border-border py-1.5 last:border-0">
              <span className="text-blue-400">{timeAgo(e.timestamp)}</span>
              <span className="text-foreground/80 ml-2">{e.message}</span>
              {e.detail && <span className="text-muted-foreground ml-2">{e.detail}</span>}
            </div>
          ))
        )}
      </Section>

      {/* All Logs */}
      <Section title={`All Logs (${logs.length})`} color="slate">
        {logs.slice(0, 50).map((e, i) => (
          <div key={i} className="text-[10px] font-mono border-b border-border py-1 last:border-0">
            <span className="text-muted-foreground">{timeAgo(e.timestamp)}</span>
            <span className="ml-1 font-bold" style={{ color: TYPE_COLORS[e.type] || '#9ca3af' }}>{e.type}</span>
            <span className="text-foreground/70 ml-1 break-all">{e.message?.substring(0, 100)}</span>
          </div>
        ))}
      </Section>
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const borderColors: Record<string, string> = {
    blue: 'border-blue-500/35',
    purple: 'border-purple-500/35',
    yellow: 'border-yellow-500/35',
    green: 'border-green-500/35',
    red: 'border-red-500/35',
    slate: 'border-border',
  };
  return (
    <section className={`bg-card border ${borderColors[color] || 'border-border'} mb-4 text-card-foreground shadow-sm`}>
      <div className="px-4 py-2 border-b border-border bg-muted/30">
        <h2 className="text-sm font-bold">{title}</h2>
      </div>
      <div className="px-4 py-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 py-1 text-xs font-mono">
      <span className="text-muted-foreground w-40 flex-shrink-0">{label}</span>
      <span className="text-foreground break-all">{value}</span>
    </div>
  );
}

function timeAgo(ts: string) {
  const diff = Date.now() - new Date(ts).getTime();
  if (diff < 60000) return `${Math.floor(diff / 1000)}s`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  return new Date(ts).toLocaleTimeString('id-ID');
}

const TYPE_COLORS: Record<string, string> = {
  'window.error': '#ef4444',
  'unhandledrejection': '#ef4444',
  'render_error': '#ef4444',
  'auth': '#3b82f6',
  'route': '#22c55e',
  'app_start': '#a855f7',
};
