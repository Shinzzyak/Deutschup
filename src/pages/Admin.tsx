import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { Users, CreditCard, Activity, Key, Loader2, Save, ShieldAlert, Settings, BarChart3, TrendingUp, DollarSign, UserCheck, UserX, RefreshCw, Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from '../components/ui/button';

interface UserData {
  id: string;
  full_name: string;
  subscription: string;
  role: string;
  created_at: string;
}

interface StatsData {
  today: { requests: number; errors: number };
  recentOrders: any[];
  users: { total: number; pro: number };
}

export default function Admin() {
  const navigate = useNavigate();
  const { session, loading, profileData } = useAuthStore();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (profileData?.role !== 'admin' || !session) return;

    async function fetchData() {
      setFetching(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const [usersRes, statsRes, configRes] = await Promise.all([
          fetch('/api/admin?action=users', {
            headers: { 'Authorization': `Bearer ${session.access_token}` },
            signal: controller.signal
          }),
          fetch('/api/admin?action=stats', {
            headers: { 'Authorization': `Bearer ${session.access_token}` },
            signal: controller.signal
          }),
          fetch('/api/admin?action=config', {
            headers: { 'Authorization': `Bearer ${session.access_token}` },
            signal: controller.signal
          })
        ]);
        clearTimeout(timeoutId);

        if (usersRes.ok) setUsers(await usersRes.json());
        if (statsRes.ok) setStats(await statsRes.json());
        if (configRes.ok) {
          const d = await configRes.json();
          setApiKey(d.geminiApiKey || '');
        }
      } catch (e) {
        console.error('Fetch admin data failed:', e);
      } finally {
        setFetching(false);
      }
    }
    fetchData();
  }, [profileData?.role, session]);

  const handleUpdateApiKey = async () => {
    if (!session) return;
    setSavingKey(true);
    try {
      const res = await fetch('/api/admin?action=config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ geminiApiKey: apiKey })
      });
      alert(res.ok ? 'API Key updated!' : `Failed: ${res.status}`);
    } catch {
      alert('Error updating config');
    } finally {
      setSavingKey(false);
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePro = async (userId: string, currentSub: string) => {
    if (!session) return;
    const newSub = currentSub === 'pro' ? 'free' : 'pro';
    try {
      const res = await fetch('/api/admin?action=toggle-pro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ userId: userId, subscription: newSub })
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, subscription: newSub } : u));
      }
    } catch (e) {
      console.error('Toggle Pro failed:', e);
    }
  };

  const [forceResolve, setForceResolve] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => setForceResolve(true), 12000);
    return () => clearTimeout(t);
  }, [loading]);

  if ((loading && !forceResolve) || fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#F2C94C]" />
        <p className="text-sm text-muted-foreground">
          {loading ? 'Memeriksa autentikasi...' : 'Mengambil data admin...'}
        </p>
      </div>
    );
  }

  if (!session || profileData?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-foreground">Akses Ditolak</h1>
        <p className="text-muted-foreground">Anda tidak memiliki akses admin.</p>
      </div>
    );
  }

  const proCount = users.filter(u => u.subscription === 'pro').length;
  const freeCount = users.length - proCount;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-foreground mb-2">Admin Panel 🧠</h1>
            <p className="text-muted-foreground">Kelola pengguna, statistik, dan konfigurasi.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/admin/ai')} variant="outline" className="rounded-2xl">
              <Settings className="w-4 h-4 mr-2" /> AI Settings
            </Button>
            <Button onClick={() => fetchData()} variant="outline" className="rounded-2xl">
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-border pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'users', label: 'Users', icon: Users },
          { id: 'settings', label: 'Settings', icon: Settings },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[#F2C94C] text-[#1F2937]'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} label="Total Users" value={users.length} color="text-blue-500" />
          <StatCard icon={UserCheck} label="Pro Users" value={proCount} color="text-[#F2C94C]" />
          <StatCard icon={TrendingUp} label="Today Requests" value={stats?.today?.requests || 0} color="text-green-500" />
          <StatCard icon={Activity} label="Today Errors" value={stats?.today?.errors || 0} color="text-red-500" />
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-card rounded-3xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Subscription</th>
                <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Joined</th>
                <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-50 last:border-0 hover:bg-muted/50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F2C94C] to-[#E0B73A] flex items-center justify-center text-sm font-bold text-[#1F2937]">
                        {user.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{user.full_name || 'No name'}</p>
                        <p className="text-xs text-muted-foreground font-mono">{user.id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.subscription === 'pro' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 'bg-gray-50 text-gray-700 border border-gray-200'
                    }`}>
                      {user.subscription}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      onClick={() => handleTogglePro(user.id, user.subscription)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                    >
                      {user.subscription === 'pro' ? 'Revoke Pro' : 'Grant Pro'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-card rounded-3xl border border-border p-8">
          <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
            <Key className="w-5 h-5 text-[#F2C94C]" /> Gemini API Key
          </h3>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground pr-20"
                placeholder="Enter Gemini API Key"
              />
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-12 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCopyApiKey}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <Button onClick={handleUpdateApiKey} disabled={savingKey} className="rounded-xl">
              {savingKey ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-card rounded-3xl border border-border p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="text-3xl font-black text-foreground">{value}</p>
    </div>
  );
}
