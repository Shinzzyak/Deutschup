import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { Loader2 } from 'lucide-react';
import Dashboard from './Dashboard';
import { useAuthStore, clearProfileCache } from '../stores/authStore';

export default function DashboardWithPaymentRefresh() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const paymentSuccess = searchParams.get('payment') === 'success';

  useEffect(() => {
    if (paymentSuccess && user) {
      console.log('[PAYMENT-SUCCESS] Clearing profile cache');
      clearProfileCache();
      // Force page reload to trigger fresh profile fetch
      window.location.href = '/dashboard';
    }
  }, [paymentSuccess, user]);

  if (paymentSuccess) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-sm text-center">
          <div className="mx-auto mb-6 flex h-1.5 w-16" aria-hidden="true">
            <div className="flex-1 bg-brand-ink" />
            <div className="flex-1 bg-brand-rust" />
            <div className="flex-1 bg-brand-tan" />
          </div>
          <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-brand-rust" aria-hidden="true" />
          <h1 className="font-serif text-2xl text-brand-ink">Pembayaranmu sedang diproses</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Sebentar lagi akses Pro aktif dan halaman ini terbuka sendiri. Jangan tutup dulu, ya.
          </p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
