import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { collection, query, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Users, CreditCard, Activity, Key, Loader2, Save, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Admin() {
  const { user } = useAuthStore();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  
  const [stats, setStats] = useState({ totalUsers: 0, proUsers: 0, revenue: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [loadingKey, setLoadingKey] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!user) { setChecking(false); return; }
      try {
        const token = await user.getIdToken();
        const res = await fetch('/api/admin/check', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
           setIsAdmin(true);
           fetchAdminData();
        }
      } catch(e) {}
      setChecking(false);
    }
    checkAdmin();
  }, [user]);

  const fetchAdminData = async () => {
    try {
       const token = await user?.getIdToken();
       // Fetch users from server (since client rules block listing all users)
       const res = await fetch('/api/admin/data', {
         headers: { 'Authorization': `Bearer ${token}` }
       });
       const data = await res.json();
       if (data.users) {
         setUsers(data.users);
         const pro = data.users.filter((u:any) => u.tier === 'pro').length;
         setStats({
           totalUsers: data.users.length,
           proUsers: pro,
           revenue: pro * 49000
         });
       }
       if (data.apiKeyMasked) {
         setApiKey(data.apiKeyMasked);
       }
    } catch(e) {
       console.error("Failed to fetch admin data", e);
    }
  };

  const handleUpdateApiKey = async () => {
    if (!apiKey || apiKey.includes('*')) return;
    setLoadingKey(true);
    try {
      const token = await user?.getIdToken();
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ geminiApiKey: apiKey })
      });
      alert('API Key updated successfully');
      fetchAdminData();
    } catch(e) {
      alert('Failed to update config');
    } finally {
      setLoadingKey(false);
    }
  };

  const handleUpdateUserTier = async (userId: string, newTier: string) => {
    try {
      const token = await user?.getIdToken();
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ targetUserId: userId, tier: newTier })
      });
      fetchAdminData();
    } catch(e) {
      alert('Failed to update user');
    }
  };

  if (checking) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" /></div>;
  if (!isAdmin) return <div className="p-20 text-center text-red-500 font-bold">Akses Ditolak. Anda bukan admin.</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-extrabold mb-8">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center text-slate-500 mb-2"><Users className="w-5 h-5 mr-2" /> Total Pengguna</div>
          <span className="text-3xl font-black text-slate-800">{stats.totalUsers}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center text-blue-500 mb-2"><Activity className="w-5 h-5 mr-2" /> Pro Subs</div>
          <span className="text-3xl font-black text-blue-600">{stats.proUsers}</span>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
          <div className="flex items-center text-green-500 mb-2"><CreditCard className="w-5 h-5 mr-2" /> Est. Revenue Monthly</div>
          <span className="text-3xl font-black text-green-600">Rp {(stats.revenue).toLocaleString('id-ID')}</span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 mb-10">
        <h2 className="text-xl font-bold flex items-center mb-4"><Key className="w-6 h-6 mr-2 text-amber-500" /> Gemini API Key Config</h2>
        <div className="flex gap-4">
          <input 
             type="text" 
             value={apiKey} 
             onChange={(e) => setApiKey(e.target.value)} 
             className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500" 
             placeholder="AIzaSy..." 
          />
          <Button onClick={handleUpdateApiKey} disabled={loadingKey || apiKey.includes('*')} className="rounded-xl px-8">
             {loadingKey ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
             Simpan
          </Button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
         <h2 className="text-xl font-bold mb-6">Manajemen Pengguna</h2>
         <div className="overflow-x-auto">
           <table className="w-full text-left border-collapse">
             <thead>
               <tr className="border-b border-slate-200">
                 <th className="py-3 px-4 text-slate-500 font-semibold">User ID</th>
                 <th className="py-3 px-4 text-slate-500 font-semibold">Email</th>
                 <th className="py-3 px-4 text-slate-500 font-semibold">Tier</th>
                 <th className="py-3 px-4 text-slate-500 font-semibold">Valid Until</th>
                 <th className="py-3 px-4 text-slate-500 font-semibold">Aksi</th>
               </tr>
             </thead>
             <tbody>
               {users.map(u => (
                 <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                   <td className="py-3 px-4 text-sm font-mono">{u.id.substring(0, 8)}...</td>
                   <td className="py-3 px-4">{u.email || 'N/A'}</td>
                   <td className="py-3 px-4">
                     <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                       u.tier === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                     }`}>
                       {u.tier || 'free'}
                     </span>
                   </td>
                   <td className="py-3 px-4 text-sm text-slate-500">
                     {u.tierExpiry ? new Date(u.tierExpiry).toLocaleDateString() : '-'}
                   </td>
                   <td className="py-3 px-4 flex gap-2">
                     <select 
                        value={u.tier || 'free'} 
                        onChange={(e) => handleUpdateUserTier(u.id, e.target.value)}
                        className="bg-slate-100 text-sm rounded-lg px-2 py-1 outline-none border border-slate-200"
                     >
                       <option value="free">Free</option>
                       <option value="pro">Pro</option>
                     </select>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
