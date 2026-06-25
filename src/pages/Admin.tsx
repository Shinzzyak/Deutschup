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
  ExternalLink
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
        <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 ${
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
          className="rounded-2xl px-6 py-5 font-bold shadow-lg shadow-[#F2C94C]/20 gap-2"
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
    <Card className="rounded-2xl border-border bg-card hover:shadow-md transition-shadow">
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
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin?action=users', { headers });
      if (res.ok) setUsers(await res.json());
    } catch (e) {
      console.error('Fetch users error:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePro = async (userId: string) => {
    setUpdating(userId);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin?action=toggle-pro', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        const result = await res.json();
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription: result.subscription } : u));
      }
    } catch (e) {
      console.error('Toggle pro error:', e);
    } finally {
      setUpdating(null);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    setUpdating(userId);
    try {
      const headers = await getAdminHeaders();
      const res = await fetch('/api/admin?action=update-role', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role } : u));
      }
    } catch (e) {
      console.error('Update role error:', e);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = users.filter(u =>
    (u.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
    u.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          Pengguna
          <span className="text-sm font-normal text-muted-foreground">({users.length})</span>
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari nama atau ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-4 pr-4 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50 w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-5 py-3">Nama</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-5 py-3">ID</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-5 py-3">Role</th>
                  <th className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider px-5 py-3">Status</th>
                  <th className="text-right text-xs font-bold text-muted-foreground uppercase tracking-wider px-5 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#E0B73A] flex items-center justify-center text-xs font-bold text-[#1F2937]">
                          {(u.full_name || u.id).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium text-foreground">{u.full_name || 'Unnamed'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono text-muted-foreground">{u.id.slice(0, 8)}...</span>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role || 'user'}
                        onChange={e => handleUpdateRole(u.id, e.target.value)}
                        disabled={updating === u.id}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                        u.subscription === 'pro' || u.tier === 'pro'
                          ? 'bg-[#F2C94C]/15 text-[#B8952E]'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {u.subscription === 'pro' || u.tier === 'pro' ? 'Pro' : 'Free'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleTogglePro(u.id)}
                        disabled={updating === u.id}
                        className="rounded-lg text-xs h-8"
                      >
                        {updating === u.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          u.subscription === 'pro' ? 'Set Free' : 'Set Pro'
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground text-sm">
                      Tidak ada pengguna ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// Admin page only — Users section
