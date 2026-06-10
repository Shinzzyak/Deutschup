import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { isUserPro, getProDaysRemaining, type SubscriptionData } from '../lib/subscription';
import { Check, Loader2, Sparkles, Clock, Receipt } from 'lucide-react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';

type PlanVariant = 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';

interface Plan {
  id: 'free' | 'pro';
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: PlanVariant;
  popular?: boolean;
}

interface OrderHistory {
  id: string;
  status: string;
  amount: number;
  payment_method: string;
  paid_at: string;
  created_at: string;
}

export default function Pricing() {
  const { user, session, tierData } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const subData: SubscriptionData = {
    subscription: tierData.subscription || 'free',
    pro_expires_at: tierData.pro_expires_at || null,
  };
  const activePro = isUserPro(subData);
  const daysRemaining = getProDaysRemaining(subData);

  // Fetch billing history
  useEffect(() => {
    if (!user) { setOrdersLoading(false); return; }
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, status, amount, payment_method, paid_at, created_at')
          .eq('user_id', user.id)
          .eq('status', 'paid')
          .order('created_at', { ascending: false });
        console.log("[PAYMENT-HISTORY] user.id:", user.id, "rows:", data?.length, "error:", error); if (!error && data) setOrders(data);
      } catch (e) {
        console.error('Failed to fetch orders:', e);
      } finally {
        setOrdersLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 'Rp 0',
      description: 'Mulai belajar bahasa Jerman',
      features: ['Akses materi A1', '10 Pesan Herr Deutsch / hari', '1 Simulasi Ujian / minggu'],
      buttonText: !activePro ? 'Sedang Aktif' : 'Gratis',
      buttonVariant: 'outline',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'Rp 49.000',
      period: '/ bulan',
      description: 'Akses penuh ke semua materi',
      features: ['Akses semua materi A1 - B2', 'Pesan Herr Deutsch sepuasnya', 'Simulasi Ujian tak terbatas', 'Unduh laporan PDF'],
      buttonText: activePro ? 'Sedang Aktif' : 'Pilih Pro',
      buttonVariant: activePro ? 'outline' : 'default',
      popular: !activePro
    }
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    if (!user) return alert("Silakan login terlebih dahulu.");
    if (activePro) return;

    setLoading(planId);
    try {
      if (!session?.access_token) return alert("Sesi tidak valid. Silakan login ulang.");
      const token = session.access_token;

      const res = await fetch('/api/payment?action=create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id, planType: planId, email: user.email, name: user.user_metadata?.full_name || user.email })
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.error('[payment] Expected JSON but got:', contentType, res.status);
        alert('Gagal terhubung ke server pembayaran. Coba lagi nanti.');
        return;
      }

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Gagal membuat pembayaran");
      }
    } catch(e) {
      console.error(e);
      alert("Terjadi kesalahan sistem.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <div className="text-center mb-16">
         <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Pilih Paket Belajarmu</h1>
         <p className="text-lg text-slate-600">Investasi terbaik untuk masa depan bahasamu. Mulai gratis, upgrade kapan saja.</p>
         {activePro && (
           <div className="mt-4 inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm font-medium border border-green-200">
             <Check className="w-4 h-4" />
             Pro Aktif — {daysRemaining} hari tersisa
           </div>
         )}
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => (
          <div key={plan.id} className={`relative bg-white rounded-3xl p-8 border ${plan.popular ? 'border-blue-500 shadow-xl scale-105 z-10' : 'border-slate-200 shadow-sm'} flex flex-col`}>
            {plan.popular && (
              <div className="absolute -top-4 inset-x-0 flex justify-center">
                 <span className="bg-blue-500 flex items-center shadow-lg text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                   <Sparkles className="w-3 h-3 mr-1" /> Paling Laris
                 </span>
              </div>
            )}

            <h2 className="text-2xl font-bold mb-2">{plan.name}</h2>
            <p className="text-slate-500 mb-6 min-h-12">{plan.description}</p>

            <div className="mb-8">
              <span className="text-4xl font-black">{plan.price}</span>
              {plan.period && <span className="text-slate-500 font-medium">{plan.period}</span>}
            </div>

            <ul className="mb-8 space-y-4 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-3 shrink-0" />
                  <span className="text-slate-700">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={() => handleUpgrade(plan.id)}
              disabled={loading !== null || plan.id === 'free' || activePro}
              variant={plan.buttonVariant}
              className={`w-full rounded-2xl py-6 text-lg font-bold shadow-md ${plan.popular && !activePro ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {loading === plan.id ? <Loader2 className="w-6 h-6 animate-spin" /> : plan.buttonText}
            </Button>
          </div>
        ))}
      </div>

      {/* Billing History */}
      {user && (
        <div className="max-w-4xl mx-auto mt-16">
          <div className="flex items-center gap-2 mb-6">
            <Receipt className="w-5 h-5 text-slate-600" />
            <h2 className="text-xl font-bold text-slate-900">Riwayat Pembayaran</h2>
          </div>

          {ordersLoading ? (
            <div className="text-center py-8 text-slate-500">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Memuat riwayat...
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-slate-200">
              <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500">Belum ada riwayat pembayaran.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Invoice</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Tanggal</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Jumlah</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Metode</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-50 last:border-0">
                      <td className="px-6 py-4 text-sm font-mono text-slate-700">{order.id}</td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {new Date(order.paid_at || order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                        Rp {(order.amount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 uppercase">{order.payment_method}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          Lunas
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
