import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { Users, CreditCard, Activity, Key, Loader2, Save, ShieldAlert, Settings } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Admin() {
  const navigate = useNavigate();
  const { session, loading, profileData } = useAuthStore();
  const [users, setUsers] = useState<any[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [savingKey, setSavingKey] = useState(false);
  const [savingUser, setSavingUser] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Once store confirms admin + we have a session, fetch data
  useEffect(() => {
    if (profileData?.role !== 'admin' || !session) return;

    async function fetchData() {
      setFetching(true);
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const [usersRes, configRes] = await Promise.all([
          fetch('/api/admin?action=users', {
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
    if (!session) { alert('Session not ready, try again'); return; }
    if (!apiKey) { alert('API Key is empty'); return; }
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
      alert(res.ok ? 'API Key updated!' : `Failed: ${res.status} ${await res.text()}`);
    } catch {
      alert('Error updating config');
    } finally {
      setSavingKey(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    if (!session) return;
    setSavingUser(true);
    try {
      const res = await fetch('/api/admin?action=users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ targetUserId: userId, ...updates })
      });
      if (res.ok) {
        const updated = await fetch('/api/admin?action=users', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        setUsers(await updated.json());
      }
      alert(res.ok ? 'User updated!' : 'Failed to update');
    } catch {
      alert('Error updating user');
    } finally {
      setSavingUser(false);
    }
  };

  // Safety: force-resolve stuck loading state after 12s
  const [forceResolve, setForceResolve] = useState(false);
  useEffect(() => {
    if (!loading) return;
    const t = setTimeout(() => {
      console.warn('[Admin] FORCE RESOLVE — loading stuck >12s');
      setForceResolve(true);
    }, 12000);
    return () => clearTimeout(t);
  }, [loading]);

  // --- Render Gates ---
  if ((loading && !forceResolve) || fetching) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
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
        <p className="text-muted-foreground">Maaf, bre. Lo nggak punya role admin untuk masuk ke area ini.</p>
      </div>
    );
  }

  const proCount = users.filter(u => (u.subscription || u.tier) === 'pro').length;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-black text-foreground mb-2">Admin Cockpit 🧠</h1>
            <p className="text-muted-foreground">Manage users, system configuration, and AI settings.</p>
          </div>
          <Button
            onClick={() => navigate('/admin/ai')}
            variant="outline"
            className="rounded-2xl"
          >
            <Settings className="w-4 h-4 mr-2" /> AI Settings
          </Button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-10">
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border flex items-center">
          <div className="p-3 bg-blue-50 rounded-2xl mr-4"><Users className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Total Users</p>
            <p className="text-2xl font-bold text-foreground">{users.length}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border flex items-center">
          <div className="p-3 bg-indigo-50 rounded-2xl mr-4"><Activity className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Pro Members</p>
            <p className="text-2xl font-bold text-foreground">{proCount}</p>
          </div>
        </div>
        <div className="bg-card p-6 rounded-3xl shadow-sm border border-border flex items-center">
          <div className="p-3 bg-emerald-50 rounded-2xl mr-4"><CreditCard className="w-6 h-6 text-emerald-600" /></div>
          <div>
            <p className="text-sm text-muted-foreground font-medium">Conv. Rate</p>
            <p className="text-2xl font-bold text-foreground">
              {users.length > 0 ? ((proCount / users.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* API Key Config */}
      <section className="bg-card p-8 rounded-3xl shadow-sm border border-border mb-10">
        <div className="flex items-center mb-6">
          <Key className="w-6 h-6 text-amber-500 mr-3" />
          <h2 className="text-xl font-bold text-foreground">AI Engine Configuration</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="flex-1 bg-muted border border-border rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Enter Gemini API Key..."
          />
          <Button onClick={handleUpdateApiKey} disabled={savingKey} className="rounded-2xl px-8 bg-slate-900 hover:bg-slate-800">
            {savingKey ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Update Key
          </Button>
        </div>
      </section>

      {/* User Table */}
      <section className="bg-card rounded-3xl shadow-sm border border-border overflow-hidden">
        <div className="p-8 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted text-muted-foreground text-sm font-semibold">
                <th className="py-4 px-6">User ID</th>
                <th className="py-4 px-6">Tier</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Joined</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-muted transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-mono text-xs text-muted-foreground">{u.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      (u.subscription || u.tier) === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {u.subscription || u.tier || 'free'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-muted-foreground">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <select
                        value={u.subscription || u.tier || 'free'}
                        onChange={(e) => handleUpdateUser(u.id, { tier: e.target.value, subscription: e.target.value })}
                        className="bg-muted text-xs rounded-lg px-2 py-1 border border-border outline-none"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                      </select>
                      <select
                        value={u.role || 'user'}
                        onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                        className="bg-muted text-xs rounded-lg px-2 py-1 border border-border outline-none"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {savingUser && (
          <div className="p-4 text-center bg-blue-50 text-blue-600 text-sm font-medium animate-pulse">
            Updating user data...
          </div>
        )}
      </section>
    </div>
  );
}
