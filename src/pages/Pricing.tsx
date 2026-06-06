import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';

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

export default function Pricing() {
  const { user, session, tierData } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);
  
  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 'Rp 0',
      description: 'Mulai belajar bahasa Jerman',
      features: ['Akses materi A1', '10 Pesan Herr Deutsch / hari', '1 Simulasi Ujian / minggu'],
      buttonText: tierData?.tier === 'free' ? 'Sedang Aktif' : 'Gratis',
      buttonVariant: 'outline',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'Rp 49.000',
      period: '/ bulan',
      description: 'Akses penuh ke semua materi',
      features: ['Akses semua materi A1 - B2', 'Pesan Herr Deutsch sepuasnya', 'Simulasi Ujian tak terbatas', 'Unduh laporan PDF'],
      buttonText: tierData?.tier === 'pro' ? 'Sedang Aktif' : 'Pilih Pro',
      buttonVariant: tierData?.tier === 'pro' ? 'outline' : 'default',
      popular: tierData?.tier !== 'pro'
    }
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    if (!user) return alert("Silakan login terlebih dahulu.");
    
    setLoading(planId);
    try {
      if (!session?.access_token) return alert("Sesi tidak valid. Silakan login ulang.");
      const token = session.access_token;

      const res = await fetch('/api/payment?action=create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ userId: user.id, planType: planId, email: user.email, name: user.user_metadata?.full_name || user.email })
      });
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
            
            <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
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
              disabled={loading !== null || plan.id === 'free' || tierData?.tier === plan.id}
              variant={plan.buttonVariant} 
              className={`w-full rounded-2xl py-6 text-lg font-bold shadow-md ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {loading === plan.id ? <Loader2 className="w-6 h-6 animate-spin" /> : plan.buttonText}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
