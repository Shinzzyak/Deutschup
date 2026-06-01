import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Users, CreditCard, Activity, Key, Loader2, Save, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const { user } = useAuthStore();
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingKey, setLoadingKey] = useState(false);
  const adminCheckDone = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function performAdminCheck(currentSession: any) {
      if (cancelled) return;
      setSession(currentSession);

      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${currentSession.access_token}` }
      });

      if (cancelled) return;

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        setIsAdmin(true);
        adminCheckDone.current = true;

        const configRes = await fetch('/api/admin/config', {
          headers: { 'Authorization': `Bearer ${currentSession.access_token}` }
        });
        if (configRes.ok && !cancelled) {
          const configData = await configRes.json();
          setApiKey(configData.geminiApiKey || '');
        }
      } else {
        setIsAdmin(false);
      }
    }

    async function initialize() {
      try {
        // 1. Coba ambil session langsung
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (currentSession) {
          await performAdminCheck(currentSession);
          return;
        }
        // Session null → tunggu auth state change, jangan langsung tolak
      } catch (e) {
        console.error("Admin initialization failed", e);
        if (!cancelled) setIsAdmin(false);
      }
    }

    initialize();

    // 2. Fallback: subscribe ke auth state change
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (cancelled || adminCheckDone.current) return;
      if (session) {
        // Session baru muncul → trigger admin check
        try {
          await performAdminCheck(session);
          adminCheckDone.current = true;
        } catch (e) {
          console.error("Admin check via onAuthStateChange failed", e);
          setIsAdmin(false);
        }
      } else {
        // User signed out atau gak login
        setIsAdmin(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config', {
        headers: { 'Authorization': `Bearer ${session?.access_token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setApiKey(data.geminiApiKey || '');
      }
    } catch (e) {
      console.error("Failed to fetch config", e);
    }
  };

  const handleUpdateApiKey = async () => {
    if (!apiKey) return;
    setLoadingKey(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ geminiApiKey: apiKey })
      });
      if (res.ok) alert('API Key updated successfully!');
      else alert('Failed to update API Key');
    } catch (e) {
      alert('Error updating config');
    } finally {
      setLoadingKey(false);
    }
  };

  const handleUpdateUser = async (userId: string, updates: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ targetUserId: userId, ...updates })
      });
      if (res.ok) {
        alert('User updated successfully!');
        // Refresh list
        const updatedRes = await fetch('/api/admin/users', {
          headers: { 'Authorization': `Bearer ${session?.access_token}` }
        });
        const data = await updatedRes.json();
        setUsers(data);
      } else {
        alert('Failed to update user');
      }
    } catch (e) {
      alert('Error updating user');
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800">Akses Ditolak</h1>
        <p className="text-slate-500">Maaf, bre. Lo nggak punya role admin untuk masuk ke area ini.</p>
      </div>
    );
  }

  const proCount = users.filter(u => u.tier === 'pro').length;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <header className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 mb-2">Admin Cockpit 🧠</h1>
        <p className="text-slate-500">Manage users, system configuration, and AI settings.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-blue-50 rounded-2xl mr-4"><Users className="w-6 h-6 text-blue-600" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Users</p>
            <p className="text-2xl font-bold text-slate-900">{users.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-indigo-50 rounded-2xl mr-4"><Activity className="w-6 h-6 text-indigo-600" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pro Members</p>
            <p className="text-2xl font-bold text-slate-900">{proCount}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center">
          <div className="p-3 bg-emerald-50 rounded-2xl mr-4"><CreditCard className="w-6 h-6 text-emerald-600" /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Conv. Rate</p>
            <p className="text-2xl font-bold text-slate-900">
              {users.length > 0 ? ((proCount / users.length) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Config Section */}
      <section className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
        <div className="flex items-center mb-6">
          <Key className="w-6 h-6 text-amber-500 mr-3" />
          <h2 className="text-xl font-bold text-slate-800">AI Engine Configuration</h2>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <input 
            type="password" 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 transition-all" 
            placeholder="Enter Gemini API Key..." 
          />
          <Button 
            onClick={handleUpdateApiKey} 
            disabled={loadingKey} 
            className="rounded-2xl px-8 bg-slate-900 hover:bg-slate-800"
          >
            {loadingKey ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
            Update Key
          </Button>
        </div>
      </section>

      {/* User Table */}
      <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-xl font-bold text-slate-800">User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm font-semibold">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Tier</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-medium text-slate-900">{u.email || 'Unknown'}</div>
                    <div className="text-xs text-slate-400 font-mono">{u.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      u.tier === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.tier || 'free'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      <select 
                        value={u.tier || 'free'} 
                        onChange={(e) => handleUpdateUser(u.id, { tier: e.target.value })}
                        className="bg-slate-100 text-xs rounded-lg px-2 py-1 border border-slate-200 outline-none"
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                      </select>
                      <select 
                        value={u.role || 'user'} 
                        onChange={(e) => handleUpdateUser(u.id, { role: e.target.value })}
                        className="bg-slate-100 text-xs rounded-lg px-2 py-1 border border-slate-200 outline-none"
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
        {loading && (
          <div className="p-4 text-center bg-blue-50 text-blue-600 text-sm font-medium animate-pulse">
            Updating user data...
          </div>
        )}
      </section>
    </div>
  );
}
