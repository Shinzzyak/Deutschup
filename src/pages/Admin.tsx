import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Users, 
  Activity, 
  Settings, 
  ShieldCheck, 
  RefreshCw, 
  Loader2,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Zap,
  Database,
  Globe,
  Webhook,
  ExternalLink,
  ChevronDown
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
  const { user, profileData } = useAuthStore();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getAdminHeaders = async (): Promise<Record<string, string>> => {
    if (!user) return {};
    const { data: { session } } = await import('../lib/supabase').then(m => m.supabase.auth.getSession());
    return {
      'Authorization': `Bearer ${session?.access_token}`,
      'x-user-email': user.email || '',
    };
  };

  const fetchAll = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const headers = await getAdminHeaders();
      const [statsRes, healthRes] = await Promise.all([
        fetch('/api/admin?action=stats', { headers }),
        fetch('/api/admin?action=system-health', { headers }),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (healthRes.ok) setHealth(await healthRes.json());
    } catch (e) {
      console.error('Admin fetch error:', e);
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#F2C94C]" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#F2C94C]/10 rounded-xl">
              <ShieldCheck className="w-6 h-6 text-[#F2C94C]" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-foreground">
              Admin <span className="text-[#F2C94C]">Panel</span>
            </h1>
          </div>
          <p className="text-muted-foreground ml-14">Kelola sistem, pengguna, dan konfigurasi DeutschUp.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
          className="rounded-xl border-border hover:bg-muted gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {/* System Health Banner */}
      {health && (
        <div className={`mb-8 p-4  border flex items-center gap-3 ${
          health.status === 'ok' 
            ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' 
            : 'bg-destructive/5 border-destructive/20 text-destructive'
        }`}>
          {health.status === 'ok' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          <span className="text-sm font-medium">
            System {health.status === 'ok' ? 'Operational' : 'Degraded'} — Version {health.version.slice(0, 7)}
          </span>
          <span className="ml-auto text-xs opacity-70">{new Date(health.timestamp).toLocaleString('id-ID')}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard 
          icon={Users} 
          label="Total Users" 
          value={stats?.users.total || 0} 
          accent="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatCard 
          icon={Zap} 
          label="Pro Members" 
          value={stats?.users.pro || 0} 
          accent="text-[#F2C94C]"
          bg="bg-[#F2C94C]/10"
        />
        <StatCard 
          icon={Activity} 
          label="AI Requests Hari Ini" 
          value={stats?.today.requests || 0} 
          accent="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatCard 
          icon={AlertTriangle} 
          label="Errors Hari Ini" 
          value={stats?.today.errors || 0} 
          accent="text-rose-500"
          bg="bg-rose-500/10"
        />
      </div>

      {/* Service Status */}
      {health && (
        <div className="mb-10">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-muted-foreground" />
            Status Layanan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ServicePill icon={Database} label="Database" ok={health.config.databaseConfigured} />
            <ServicePill icon={Zap} label="AI Engine" ok={health.config.aiConfigured} />
            <ServicePill icon={TrendingUp} label="Payment" ok={health.config.paymentConfigured} />
            <ServicePill icon={Webhook} label="Webhooks" ok={health.config.webhookConfigured} />
          </div>
        </div>
      )}

      {/* Users Table */}
      <UsersSection getAdminHeaders={getAdminHeaders} />

      {/* Quick Actions */}
      <div className="mt-10">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-muted-foreground" />
          Konfigurasi Sistem
        </h2>
        <Button
          onClick={() => navigate('/admin/ai')}
          className=" px-6 py-5 font-bold  shadow-[#F2C94C]/20 gap-2"
        >
          <Zap className="w-4 h-4" />
          Kelola AI Provider & Model
          <ExternalLink className="w-3.5 h-3.5 opacity-60" />
        </Button>
        <p className="text-xs text-muted-foreground mt-2 ml-1">Tambah provider, API key, dan model di satu tempat.</p>
      </div>

      {/* Spacer */}
      <div className="h-16" />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent, bg }: { 
  icon: any; label: string; value: number; accent: string; bg: string; 
}) {
  return (
    <Card className=" border-border bg-card hover: transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-xl ${bg}`}>
            <Icon className={`w-5 h-5 ${accent}`} />
          </div>
          <TrendingUp className="w-4 h-4 text-muted-foreground/30" />
        </div>
        <p className="text-3xl font-black text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground font-medium mt-1">{label}</p>
      </CardContent>
    </Card>
  );
}

function ServicePill({ icon: Icon, label, ok }: { icon: any; label: string; ok: boolean }) {
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
      ok 
        ? 'bg-emerald-500/5 border-emerald-500/20' 
        : 'bg-rose-500/5 border-rose-500/20'
    }`}>
      <Icon className={`w-4 h-4 ${ok ? 'text-emerald-500' : 'text-rose-500'}`} />
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className={`ml-auto text-xs font-bold ${ok ? 'text-emerald-600' : 'text-rose-600'}`}>
        {ok ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}

// ==================== CHUNK 2: Users Table + Config Panel ====================

interface UserProfile {
  id: string;
  full_name?: string;
  tier?: string;
  subscription?: string;
  role?: string;
  created_at?: string;
  updated_at?: string;
}

function UsersSection({ getAdminHeaders }: { getAdminHeaders: () => Promise<Record<string, string>> }) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (expanded && !loaded) {
      fetchUsers();
      setLoaded(true);
    }
  }, [expanded]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin?action=users', { headers });
      if (res.ok) setUsers(await res.json());
    } catch (e) { console.error('Fetch users error:', e); }
    finally { setLoading(false); }
  };

  const handleTogglePro = async (userId: string) => {
    setUpdating(userId);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin?action=toggle-pro', {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const result = await res.json();
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription: result.subscription } : u));
      }
    } catch (e) { console.error('Toggle pro error:', e); }
    finally { setUpdating(null); }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    setUpdating(userId);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin?action=update-role', {
        method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
    } catch (e) { console.error('Update role error:', e); }
    finally { setUpdating(null); }
  };

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-10">
      {/* Toggle header — click to expand/collapse */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-bold text-foreground">Pengguna</span>
          <span className="text-xs text-muted-foreground font-normal">({users.length})</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Collapsible content */}
      {expanded && (
        <div className="mt-3">
          {/* Search bar */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="Cari nama atau ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-3 pr-3 py-2 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Tidak ada pengguna.</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
              {filtered.map(u => {
                const isPro = u.subscription === 'pro' || u.tier === 'pro';
                const initial = (u.full_name || u.id).charAt(0).toUpperCase();
                return (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#E0B73A] flex items-center justify-center text-xs font-bold text-[#1F2937] shrink-0">
                      {initial}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{u.full_name || 'Unnamed'}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{u.id.slice(0, 8)}…</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                      isPro ? 'bg-[#F2C94C]/15 text-[#B8952E]' : 'bg-muted text-muted-foreground'
                    }`}>
                      {isPro ? 'Pro' : 'Free'}
                    </span>
                    <select
                      value={u.role || 'user'}
                      onChange={e => handleUpdateRole(u.id, e.target.value)}
                      disabled={updating === u.id}
                      className="text-[10px] font-medium px-2 py-1 rounded-md border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50 shrink-0"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleTogglePro(u.id)}
                      disabled={updating === u.id}
                      className="text-[10px] font-bold px-2.5 py-1 rounded-md border border-border hover:bg-muted transition-colors disabled:opacity-50 shrink-0"
                    >
                      {updating === u.id ? '…' : isPro ? '↓ Free' : '↑ Pro'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Admin page only — Users section
