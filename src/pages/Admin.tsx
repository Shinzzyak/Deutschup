import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { getAuthHeaders } from '../lib/auth-headers';
import { Button } from '../components/ui/button';
import {
  AdminFeedbackStack,
  AdminNotice,
  BTN_QUIET,
  ConfirmDialog,
  PANEL,
  SectionHeading,
  StatusChip,
  TONE,
  networkMessage,
  readError,
  useAdminFeedback,
  useConfirm,
  type FeedbackApi,
  type Tone,
} from '../components/admin/AdminUI';
import {
  Users,
  Activity,
  Settings,
  ShieldCheck,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Zap,
  Database,
  Globe,
  Webhook,
  CreditCard,
  ExternalLink,
  ChevronDown,
  Search,
} from 'lucide-react';

interface AdminStats {
  today: { requests: number; errors: number };
  recentOrders: Array<{ id: string; status: string; amount: number; created_at: string }>;
  users: { total: number; pro: number };
}

interface SystemHealth {
  status: string;
  timestamp: string;
  config: {
    paymentConfigured: boolean;
    aiConfigured: boolean;
    databaseConfigured: boolean;
    webhookConfigured: boolean;
  };
  version: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const feedback = useAdminFeedback();
  const confirm = useConfirm();
  const { notify } = feedback;

  const getAdminHeaders = async (): Promise<Record<string, string>> => {
    if (!user) return {};
    return getAuthHeaders();
  };

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const headers = await getAdminHeaders();
      const [statsRes, healthRes] = await Promise.all([
        fetch('/api/admin?action=stats', { headers }),
        fetch('/api/admin?action=system-health', { headers }),
      ]);

      // Report partial failures instead of leaving stale numbers on screen
      // pretending to be fresh.
      const problems: string[] = [];
      if (statsRes.ok) {
        setStats(await statsRes.json());
      } else {
        problems.push(await readError(statsRes, 'Ringkasan angka gagal dimuat.'));
      }
      if (healthRes.ok) {
        setHealth(await healthRes.json());
      } else {
        problems.push(await readError(healthRes, 'Status layanan gagal dimuat.'));
      }

      if (problems.length > 0) {
        setLoadError(problems.join(' '));
        if (silent) notify('bad', 'Sebagian data gagal dimuat', problems.join(' '));
      } else {
        setLoadError(null);
        if (silent) notify('ok', 'Data diperbarui');
      }
    } catch (e) {
      console.error('Admin fetch error:', e);
      setLoadError(networkMessage());
      if (silent) notify('bad', 'Gagal memuat ulang', networkMessage());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Fetch admin data — API validates admin role server-side
    fetchAll();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAll(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-7 h-7 animate-spin text-brand-rust" aria-hidden="true" />
        <p className="text-sm text-ink-muted">Memuat panel admin…</p>
      </div>
    );
  }

  const healthy = health?.status === 'ok';

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="mb-8">
        <div className="h-px w-16 bg-brand-rust mb-4" aria-hidden="true" />
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="w-5 h-5 text-brand-rust shrink-0" aria-hidden="true" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-subtle">
                Ruang kendali
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl leading-none text-brand-ink">
              Panel Admin
            </h1>
            <p className="text-sm text-ink-muted mt-2 max-w-prose">
              Pantau kesehatan sistem, kelola pengguna, dan atur mesin AI DeutschUp.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className={`${BTN_QUIET} gap-2 shrink-0`}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} aria-hidden="true" />
            {refreshing ? 'Memuat…' : 'Muat ulang'}
          </Button>
        </div>
      </header>

      {loadError && (
        <AdminNotice tone="bad" title="Sebagian data belum tampil" className="mb-6">
          {loadError}
        </AdminNotice>
      )}

      {/* ── System banner ──────────────────────────────────────────── */}
      {health && (
        <div
          className={`mb-8 p-4 flex flex-wrap items-center gap-x-3 gap-y-1 ${
            healthy ? TONE.ok.surface : TONE.bad.surface
          }`}
        >
          {healthy ? (
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${TONE.ok.text}`} aria-hidden="true" />
          ) : (
            <AlertTriangle className={`w-5 h-5 shrink-0 ${TONE.bad.text}`} aria-hidden="true" />
          )}
          <span className={`text-sm font-semibold ${healthy ? TONE.ok.text : TONE.bad.text}`}>
            {healthy ? 'Semua sistem berjalan normal' : 'Ada layanan yang bermasalah'}
          </span>
          {health.version && (
            <span className="text-xs text-ink-muted font-mono">
              versi {String(health.version).slice(0, 7)}
            </span>
          )}
          <span className="text-xs text-ink-muted sm:ml-auto">
            Diperiksa {formatWhen(health.timestamp)}
          </span>
        </div>
      )}

      {/* ── Numbers ────────────────────────────────────────────────── */}
      <section className="mb-10">
        <SectionHeading icon={Activity} hint="Angka hari ini, dihitung ulang setiap kali dimuat.">
          Ringkasan
        </SectionHeading>
        {/* gap-px over an inked backdrop = hairline rules between cells */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-brand-ink/12 border border-brand-ink/12">
          <StatCard icon={Users} label="Total pengguna" value={stats?.users.total ?? 0} tone="idle" />
          <StatCard icon={Zap} label="Anggota Pro" value={stats?.users.pro ?? 0} tone="info" />
          <StatCard
            icon={Activity}
            label="Permintaan AI hari ini"
            value={stats?.today.requests ?? 0}
            tone="ok"
          />
          <StatCard
            icon={AlertTriangle}
            label="Kegagalan hari ini"
            value={stats?.today.errors ?? 0}
            tone={(stats?.today.errors ?? 0) > 0 ? 'bad' : 'idle'}
          />
        </div>
      </section>

      {/* ── Services ───────────────────────────────────────────────── */}
      {health && (
        <section className="mb-10">
          <SectionHeading icon={Globe} hint="Yang bertanda mati berarti kuncinya belum dipasang di server.">
            Status Layanan
          </SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-ink/12 border border-brand-ink/12">
            <ServicePill icon={Database} label="Basis data" ok={health.config.databaseConfigured} />
            <ServicePill icon={Zap} label="Mesin AI" ok={health.config.aiConfigured} />
            <ServicePill icon={CreditCard} label="Pembayaran" ok={health.config.paymentConfigured} />
            <ServicePill icon={Webhook} label="Notifikasi" ok={health.config.webhookConfigured} />
          </div>
        </section>
      )}

      {/* ── Users ──────────────────────────────────────────────────── */}
      <UsersSection getAdminHeaders={getAdminHeaders} feedback={feedback} confirm={confirm} />

      {/* ── Configuration ──────────────────────────────────────────── */}
      <section className="mt-10">
        <SectionHeading icon={Settings} hint="Provider, kunci API, dan pemilihan model ada di halaman terpisah.">
          Konfigurasi Sistem
        </SectionHeading>
        <div className={`${PANEL} p-5`}>
          <Button onClick={() => navigate('/admin/ai')} className="gap-2 h-10 px-5">
            <Zap className="w-4 h-4" aria-hidden="true" />
            Kelola Provider &amp; Model AI
            <ExternalLink className="w-3.5 h-3.5 opacity-70" aria-hidden="true" />
          </Button>
          <p className="text-sm text-ink-muted mt-3">
            Tambah provider, simpan kunci API, dan tentukan model utama beserta cadangannya.
          </p>
        </div>
      </section>

      <div className="h-16" />

      <AdminFeedbackStack feedback={feedback} />
      <ConfirmDialog control={confirm} />
    </div>
  );
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'baru saja';
  return d.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  tone: Tone;
}) {
  return (
    <div className="bg-white p-4 sm:p-5">
      <Icon className={`w-4 h-4 mb-3 ${TONE[tone].text}`} aria-hidden="true" />
      <p className="font-heading text-3xl sm:text-4xl leading-none text-brand-ink tabular-nums">
        {value.toLocaleString('id-ID')}
      </p>
      <p className="text-xs text-ink-muted mt-2 leading-snug">{label}</p>
    </div>
  );
}

function ServicePill({
  icon: Icon,
  label,
  ok,
}: {
  icon: typeof Database;
  label: string;
  ok: boolean;
}) {
  return (
    <div className="bg-white flex items-center gap-3 px-4 py-3">
      <Icon
        className={`w-4 h-4 shrink-0 ${ok ? TONE.ok.text : TONE.bad.text}`}
        aria-hidden="true"
      />
      <span className="text-sm font-medium text-brand-ink min-w-0 truncate">{label}</span>
      <StatusChip tone={ok ? 'ok' : 'bad'} className="ml-auto">
        {ok ? 'Aktif' : 'Mati'}
      </StatusChip>
    </div>
  );
}

// ==================== Users ====================

interface UserProfile {
  id: string;
  full_name?: string;
  tier?: string;
  subscription?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

function UsersSection({
  getAdminHeaders,
  feedback,
  confirm,
}: {
  getAdminHeaders: () => Promise<Record<string, string>>;
  feedback: FeedbackApi;
  confirm: ReturnType<typeof useConfirm>;
}) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const { notify } = feedback;

  useEffect(() => {
    if (expanded && !loaded) {
      fetchUsers();
      setLoaded(true);
    }
  }, [expanded]);

  const fetchUsers = async () => {
    setLoading(true);
    setListError(null);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin?action=users', { headers });
      if (res.ok) {
        setUsers(await res.json());
      } else {
        setListError(await readError(res, 'Daftar pengguna gagal dimuat.'));
      }
    } catch (e) {
      console.error('Fetch users error:', e);
      setListError(networkMessage());
    } finally {
      setLoading(false);
    }
  };

  const applyTogglePro = async (u: UserProfile) => {
    const name = displayName(u);
    setUpdating(u.id);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin?action=toggle-pro', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id }),
      });
      if (!res.ok) {
        notify('bad', 'Status langganan tidak berubah', await readError(res, 'Perubahan ditolak server.'));
        return;
      }
      const result = await res.json();
      setUsers(prev =>
        prev.map(x => (x.id === u.id ? { ...x, subscription: result.subscription } : x))
      );
      notify(
        'ok',
        result.subscription === 'pro' ? `${name} sekarang Pro` : `${name} kembali ke Free`
      );
    } catch (e) {
      console.error('Toggle pro error:', e);
      notify('bad', 'Status langganan tidak berubah', networkMessage());
    } finally {
      setUpdating(null);
    }
  };

  const applyRole = async (u: UserProfile, role: string) => {
    const name = displayName(u);
    setUpdating(u.id);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin?action=update-role', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: u.id, role }),
      });
      if (!res.ok) {
        notify('bad', 'Peran tidak berubah', await readError(res, 'Perubahan peran ditolak server.'));
        return;
      }
      setUsers(prev => prev.map(x => (x.id === u.id ? { ...x, role } : x)));
      notify(
        'ok',
        role === 'admin' ? `${name} kini seorang admin` : `${name} kembali jadi pengguna biasa`
      );
    } catch (e) {
      console.error('Update role error:', e);
      notify('bad', 'Peran tidak berubah', networkMessage());
    } finally {
      setUpdating(null);
    }
  };

  // Role changes hand out (or take away) full control of this panel, so they
  // always pass through a confirmation first.
  const requestRoleChange = (u: UserProfile, role: string) => {
    const name = displayName(u);
    confirm.ask({
      title: role === 'admin' ? 'Jadikan admin?' : 'Cabut akses admin?',
      body:
        role === 'admin'
          ? 'Admin bisa membuka panel ini, mengubah kunci API, dan mengatur peran orang lain.'
          : 'Orang ini akan kehilangan akses ke panel admin beserta seluruh pengaturannya.',
      target: name,
      confirmLabel: role === 'admin' ? 'Ya, jadikan admin' : 'Ya, cabut akses',
      onConfirm: () => applyRole(u, role),
    });
  };

  const requestProChange = (u: UserProfile) => {
    const isPro = u.subscription === 'pro' || u.tier === 'pro';
    if (!isPro) {
      applyTogglePro(u);
      return;
    }
    // Downgrading removes something the person paid for — worth a beat.
    confirm.ask({
      title: 'Turunkan ke Free?',
      body: 'Akses fitur Pro akan dicabut segera setelah perubahan ini disimpan.',
      target: displayName(u),
      confirmLabel: 'Ya, turunkan',
      onConfirm: () => applyTogglePro(u),
    });
  };

  const filtered = users.filter(
    u =>
      (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="mt-10">
      <button
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 ${PANEL} hover:bg-brand-cream transition-colors`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <Users className="w-5 h-5 text-brand-rust shrink-0" aria-hidden="true" />
          <span className="font-heading text-xl text-brand-ink">Pengguna</span>
          {loaded && <span className="text-xs text-ink-muted">({users.length})</span>}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-ink-muted shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          <div className="relative">
            <Search
              className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              placeholder="Cari nama atau ID…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              aria-label="Cari pengguna"
              className="w-full pl-9 pr-3 py-2.5 border border-brand-ink/15 bg-white text-sm text-brand-ink placeholder:text-ink-subtle focus:outline-none focus:border-brand-rust focus:ring-1 focus:ring-brand-rust"
            />
          </div>

          {listError && (
            <AdminNotice tone="bad" title="Daftar pengguna belum tampil">
              {listError}{' '}
              <button onClick={fetchUsers} className="underline font-medium text-[#8b2500]">
                Coba lagi
              </button>
            </AdminNotice>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-ink-muted">
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              Memuat pengguna…
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-ink-muted py-8 text-center">
              {users.length === 0 ? 'Belum ada pengguna terdaftar.' : 'Tidak ada yang cocok dengan pencarian itu.'}
            </p>
          ) : (
            <div className="max-h-[26rem] overflow-y-auto border border-brand-ink/12">
              <ul className="divide-y divide-brand-ink/10">
                {filtered.map(u => {
                  const isPro = u.subscription === 'pro' || u.tier === 'pro';
                  const isAdmin = (u.role || 'user') === 'admin';
                  const busy = updating === u.id;
                  return (
                    <li key={u.id} className="bg-white p-3 sm:px-4">
                      <div className="flex items-start gap-3">
                        <span
                          className="w-8 h-8 shrink-0 bg-brand-ink text-brand-cream flex items-center justify-center text-xs font-bold"
                          aria-hidden="true"
                        >
                          {displayName(u).charAt(0).toUpperCase()}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-brand-ink truncate">
                            {displayName(u)}
                          </p>
                          <p className="text-[11px] text-ink-subtle font-mono truncate">{u.id}</p>
                        </div>
                        <div className="flex flex-wrap justify-end gap-1.5 shrink-0">
                          <StatusChip tone={isPro ? 'info' : 'idle'}>
                            {isPro ? 'Pro' : 'Free'}
                          </StatusChip>
                          {isAdmin && <StatusChip tone="warn">Admin</StatusChip>}
                        </div>
                      </div>

                      {/* Controls drop to their own row so nothing is squeezed
                          off-screen on a phone. */}
                      <div className="flex flex-wrap items-center gap-2 mt-3 pl-11">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => requestProChange(u)}
                          className={BTN_QUIET}
                        >
                          {busy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                          ) : null}
                          {isPro ? 'Turunkan ke Free' : 'Naikkan ke Pro'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busy}
                          onClick={() => requestRoleChange(u, isAdmin ? 'user' : 'admin')}
                          className={BTN_QUIET}
                        >
                          {isAdmin ? 'Cabut akses admin' : 'Jadikan admin'}
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function displayName(u: UserProfile): string {
  return u.full_name?.trim() || `Tanpa nama · ${u.id.slice(0, 8)}`;
}
