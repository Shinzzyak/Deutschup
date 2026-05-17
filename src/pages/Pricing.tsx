import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Check, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function Pricing() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState<string | null>(null);
  
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'Rp 0',
      description: 'Mulai belajar bahasa Jerman',
      features: ['Akses materi A1', '10 Pesan Herr Gemini / hari', '1 Simulasi Ujian / minggu'],
      buttonText: 'Sedang Aktif',
      buttonVariant: 'outline' as const,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 'Rp 49.000',
      period: '/ bulan',
      description: 'Lanjutkan ke tingkat menengah',
      features: ['Akses materi A1 - B1', 'Pesan Herr Gemini sepuasnya', 'Simulasi Ujian tak terbatas', 'Unduh laporan PDF'],
      buttonText: 'Pilih Pro',
      buttonVariant: 'default' as const,
    },
    {
      id: 'master',
      name: 'Master',
      price: 'Rp 99.000',
      period: '/ bulan',
      description: 'Lulus ujian B2 dengan mudah',
      features: ['Akses semua materi A1 - B2', 'Pesan Herr Gemini sepuasnya', 'Simulasi Ujian tak terbatas', 'Unduh laporan PDF', 'Sertifikat kelulusan digital'],
      buttonText: 'Pilih Master',
      buttonVariant: 'default' as const,
      popular: true
    }
  ];

  const handleUpgrade = async (planId: string) => {
    if (planId === 'free') return;
    if (!user) return alert("Silakan login terlebih dahulu.");
    
    setLoading(planId);
    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, planType: planId, email: user.email, name: user.displayName })
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

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
              disabled={loading !== null || plan.id === 'free'}
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
