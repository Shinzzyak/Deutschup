import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import Dashboard from './Dashboard';
import { useAuthStore } from '../stores/authStore';

export default function DashboardWithPaymentRefresh() {
  const [searchParams] = useSearchParams();
  const { user } = useAuthStore();
  const paymentSuccess = searchParams.get('payment') === 'success';

  useEffect(() => {
    if (paymentSuccess && user) {
      console.log('[PAYMENT-SUCCESS] Clearing profile cache');
      localStorage.removeItem(`deutschup_profile_${user.id}`);
      // Force page reload to trigger fresh profile fetch
      window.location.href = '/dashboard';
    }
  }, [paymentSuccess, user]);

  if (paymentSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memproses pembayaran...</p>
        </div>
      </div>
    );
  }

  return <Dashboard />;
}
