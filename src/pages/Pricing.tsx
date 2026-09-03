import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useAuthStore, clearProfileCache } from '../stores/authStore';
import { resolveInternalId } from '../lib/clerk/identity';
import { isUserPro, getProDaysRemaining, type SubscriptionData } from '../lib/subscription';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  RefreshCw,
  X,
} from 'lucide-react';
import { dbProxy } from '../lib/supabase';
import { getAuthHeaders } from '../lib/auth-headers';

/* ============================================================================
   Pricing — the money path.

   Two rules govern this file:

   1. No alert(). A browser modal on a failed payment reads as "the app broke".
      Every outcome now lands in the inline <Notice> below the header, in
      Indonesian, phrased as something the user can act on. Raw server strings
      and HTTP codes stay in the console where they belong.

   2. Say what actually happens. The gateway grants 30 days (api/payment.ts,
      `expiry = now + 30 days`) and nothing renews it automatically. That is
      stated on the card instead of being discovered when access disappears.
   ========================================================================== */

/** Matches PROD_PRICE in api/payment.ts. Test mode charges Rp 1.000. */
const PRO_PRICE_LABEL = 'Rp 49.000';
const PRO_PERIOD_LABEL = '/ 30 hari';

type NoticeVariant = 'success' | 'error' | 'info';

interface NoticeState {
  variant: NoticeVariant;
  title: string;
  body?: string;
}

/* Same ink-per-plate convention as the toast layer. Measured on the WCAG 2.1
   formula: ink on green 4.58:1, cream on rust 7.85:1, cream on ink 17.48:1. */
const NOTICE_STYLES: Record<NoticeVariant, { surface: string; icon: typeof Info }> = {
  success: { surface: 'bg-brand-green text-brand-ink', icon: CheckCircle2 },
  error: { surface: 'bg-brand-rust text-brand-cream', icon: AlertTriangle },
  info: { surface: 'bg-brand-ink text-brand-cream', icon: Info },
};

function Notice({ notice, onClose }: { notice: NoticeState; onClose: () => void }) {
  const style = NOTICE_STYLES[notice.variant];
  const Icon = style.icon;
  const isError = notice.variant === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={`mb-10 flex items-start gap-3 px-5 py-4 ${style.surface}`}
    >
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-serif text-[15px] leading-tight">{notice.title}</p>
        {notice.body && <p className="mt-1 text-sm leading-snug">{notice.body}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup pesan"
        className="-my-1 -mr-2 shrink-0 p-2 transition-opacity hover:opacity-70 focus-visible:rounded-none!"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}

interface OrderHistory {
  id: string;
  status: string;
  amount: number;
  payment_method: string;
  paid_at: string;
  created_at: string;
}

/* Both lists describe what the code actually does today.
   The quotas are the ones in lib/api-utils.ts checkQuota():
   chat = 10 per 60 minutes for free, mock test = 1 per 7 days for free,
   both unlimited for pro. */
const FREE_FEATURES = [
  'Materi dan latihan mulai dari level A1',
  '10 pesan Herr Deutsch per jam',
  '1 simulasi ujian per minggu',
  'Latihan kosakata dan kata kerja',
  'Catatan dan koreksi tulisan',
];

const PRO_FEATURES = [
  'Herr Deutsch tanpa batas pesan',
  'Simulasi ujian tanpa batas, ulang sepuasnya',
  'Laporan belajar dalam PDF',
  'Seluruh materi A1, A2, B1, dan B2',
  'Semua latihan yang ada di paket gratis',
];

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Pricing() {
  const { user, tierData, profileData } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersFailed, setOrdersFailed] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  const subData: SubscriptionData = {
    subscription: tierData?.subscription || 'free',
    pro_expires_at: tierData?.pro_expires_at || null,
  };
  const role = tierData?.role || profileData?.role;
  const activePro = isUserPro(subData, role);
  const daysRemaining = getProDaysRemaining(subData, role);
  const expiryLabel = formatDate(tierData?.pro_expires_at);
  /* Admins are Pro by role with no expiry date at all, so getProDaysRemaining
     returns 0 for them. Printing "kurang dari sehari" at an admin would be a
     lie — they get their own line instead. */
  const adminAccess = role === 'admin' && !expiryLabel;

  // The gateway sends the user to /dashboard?payment=success, but a manual
  // reload or a bookmarked link can land them back here — acknowledge it.
  useEffect(() => {
    if (searchParams.get('payment') === 'success') {
      setNotice({
        variant: 'success',
        title: 'Pembayaranmu sudah kami terima.',
        body: 'Akses Pro biasanya aktif dalam satu menit. Kalau statusnya masih Free, tekan "Perbarui status" di bawah.',
      });
    }
  }, [searchParams]);

  const fetchOrders = useCallback(async () => {
    if (!user) {
      setOrdersLoading(false);
      return;
    }
    setOrdersLoading(true);
    setOrdersFailed(false);
    try {
      const userId = await resolveInternalId(user.id);
      if (!userId) {
        setOrdersFailed(true);
        return;
      }
      const result = await dbProxy('get-orders', { userId });
      if (result.error) {
        console.error('[PRICING] get-orders failed:', result.status, result.error);
        setOrdersFailed(true);
        return;
      }
      setOrders(Array.isArray(result.data) ? result.data : []);
    } catch (e) {
      console.error('[PRICING] get-orders threw:', e);
      setOrdersFailed(true);
    } finally {
      setOrdersLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  /**
   * The "I paid but I am still Free" escape hatch.
   *
   * authStore caches the profile in localStorage for 24 hours, so a tier that
   * changed server-side can stay hidden for a long time. Dropping the cached
   * copy and reloading is exactly what DashboardWithPaymentRefresh does after a
   * successful checkout; this exposes it as something the user can trigger.
   * Both key shapes are cleared: setUser() writes under the Clerk id while
   * fetchProfile() caches under the resolved internal UUID.
   */
  const handleRefreshStatus = async () => {
    if (!user || refreshing) return;
    setRefreshing(true);
    try {
      clearProfileCache();
    } catch (e) {
      console.warn('[PRICING] Could not clear cached profile:', e);
    }
    window.location.reload();
  };

  const handleUpgrade = async () => {
    if (!user || activePro || loading) return;

    setLoading(true);
    setNotice(null);
    try {
      const internalUserId = await resolveInternalId(user.id);
      if (!internalUserId) {
        setNotice({
          variant: 'error',
          title: 'Sesi kamu sudah berakhir.',
          body: 'Masuk sekali lagi, lalu ulangi dari tombol ini. Tidak ada biaya yang terpotong.',
        });
        return;
      }

      const res = await fetch('/api/payment?action=create', {
        method: 'POST',
        headers: await getAuthHeaders(true),
        body: JSON.stringify({
          // Legacy request shape only; the server ignores userId/email and uses
          // the verified Bearer identity.
          userId: internalUserId,
          planType: 'pro',
          email: user.email,
          name: profileData?.full_name || user.email,
        }),
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        console.error('[PRICING] payment/create returned non-JSON:', res.status, contentType);
        setNotice({
          variant: 'error',
          title: 'Halaman pembayaran sedang tidak bisa dibuka.',
          body: 'Coba lagi beberapa menit lagi. Kalau tetap begini, hubungi kami lewat halaman Profil. Belum ada biaya apa pun yang tercatat.',
        });
        return;
      }

      const data = await res.json();
      if (data?.url) {
        setNotice({
          variant: 'info',
          title: 'Membuka halaman pembayaran...',
          body: 'Kamu akan diarahkan ke penyedia pembayaran. Jangan tutup halaman ini.',
        });
        window.location.href = data.url;
        return;
      }

      // Idempotent reuse (audit fix): a pending order already exists for this
      // user. No new charge was created — surface the existing invoice so the
      // user isn't left staring at a generic error.
      if (data?.reused) {
        setNotice({
          variant: 'info',
          title: 'Pembayaran sebelumnya masih aktif.',
          body: 'Kamu sudah punya pesanan yang belum dibayar. Lanjutkan dari halaman Profil, atau tunggu sampai pesanan itu kedaluwarsa lalu coba lagi.',
        });
        return;
      }

      // Server messages are English and technical; log them, show something usable.
      console.error('[PRICING] payment/create rejected:', data?.error);
      setNotice({
        variant: 'error',
        title: 'Pesanan pembayaran belum bisa dibuat.',
        body: 'Coba ulangi sebentar lagi. Kalau masih gagal, hubungi kami lewat halaman Profil.',
      });
    } catch (e) {
      console.error('[PRICING] payment/create threw:', e);
      setNotice({
        variant: 'error',
        title: 'Koneksi ke halaman pembayaran terputus.',
        body: 'Periksa jaringanmu lalu coba lagi. Tidak ada biaya yang terpotong.',
      });
    } finally {
      setLoading(false);
    }
  };

  const paidOrders = orders.filter((o) => o.status === 'paid' || !o.status);
  const stuckAfterPayment = Boolean(user) && !activePro && paidOrders.length > 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
      {/* Signed-out visitors reach /pricing through PublicRoutes, which renders
          this page without the app shell — so there is no nav at all. Give them
          a way back and a way in. */}
      {!user && (
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-brand-ink/15 pb-5">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-ink-muted transition-colors hover:text-brand-ink"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Kembali ke beranda
          </Link>
          <Link
            to="/sign-in"
            className="text-sm font-bold text-brand-rust underline-offset-4 hover:underline"
          >
            Masuk ke akunmu
          </Link>
        </div>
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px w-12 bg-brand-rust" />
          <span className="text-xs font-bold tracking-[0.2em] text-brand-rust uppercase">
            Paket Belajar
          </span>
        </div>
        <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
          Belajar gratis selamanya,
          <br />
          <span className="text-brand-rust italic">atau tanpa batas.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed font-light text-ink-muted">
          Paket gratis sudah cukup untuk belajar setiap hari. Pro melepas batas jumlah
          pesan Herr Deutsch dan simulasi ujian, lalu menambahkan laporan belajar PDF.
        </p>
      </div>

      {notice && <Notice notice={notice} onClose={() => setNotice(null)} />}

      {/* ── Active Pro status ──────────────────────────────────── */}
      {activePro && (
        <div className="mb-10 border-2 border-brand-ink">
          <div className="flex flex-wrap items-center gap-3 bg-brand-green px-5 py-3 text-brand-ink">
            <CheckCircle2 aria-hidden="true" className="h-5 w-5 shrink-0" />
            <span className="font-serif text-lg leading-none">Pro kamu aktif</span>
          </div>
          {adminAccess ? (
            <p className="bg-brand-cream px-5 py-4 text-sm text-ink-muted">
              Akses penuh melekat pada akun admin, tanpa tanggal berakhir.
            </p>
          ) : (
            <>
              <div className="grid gap-px bg-brand-ink sm:grid-cols-2">
                <div className="bg-brand-cream px-5 py-4">
                  <div className="text-xs font-bold tracking-[0.15em] text-ink-subtle uppercase">
                    Berlaku sampai
                  </div>
                  <div className="mt-1 font-serif text-xl text-brand-ink">
                    {expiryLabel || 'Tidak tercatat'}
                  </div>
                </div>
                <div className="bg-brand-cream px-5 py-4">
                  <div className="text-xs font-bold tracking-[0.15em] text-ink-subtle uppercase">
                    Sisa waktu
                  </div>
                  <div className="mt-1 font-serif text-xl text-brand-ink">
                    {daysRemaining > 0 ? `${daysRemaining} hari lagi` : 'Kurang dari sehari'}
                  </div>
                </div>
              </div>
              {/* api/payment.ts sets pro_expires_at = now + 30 days on every
                  successful callback — it overwrites, it does not stack. Saying
                  otherwise on a payment page would be a straight lie, so this
                  tells people to wait until the date above passes. The Pro
                  button is disabled while access is active, which matches. */}
              <p className="border-t border-brand-ink bg-brand-cream px-5 py-4 text-sm text-ink-muted">
                Langganan <span className="font-bold text-brand-ink">tidak diperpanjang otomatis</span>.
                Kalau mau lanjut, beli lagi setelah tanggal di atas lewat. Setiap pembelian
                menghitung 30 hari baru sejak tanggal pembayaran, jadi tidak perlu buru-buru
                membeli lebih awal.
              </p>
            </>
          )}
        </div>
      )}

      {/* ── Plans ──────────────────────────────────────────────── */}
      <div className="grid gap-px border border-brand-ink bg-brand-ink md:grid-cols-2">
        {/* Free — cream plate */}
        <div className="flex flex-col bg-brand-cream p-8">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl text-brand-ink">Free</h2>
            {!activePro && (
              <span className="bg-brand-ink px-2 py-0.5 text-[10px] font-bold tracking-[0.15em] text-brand-cream uppercase">
                Paket kamu
              </span>
            )}
          </div>
          <p className="text-sm text-ink-muted">Cukup untuk belajar rutin setiap hari.</p>

          <div className="mt-6 mb-8">
            <span className="font-serif text-4xl text-brand-ink">Rp 0</span>
            <span className="ml-2 text-sm text-ink-subtle">selamanya</span>
          </div>

          <ul className="mb-8 flex-1 space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-rust" />
                <span className="text-sm text-brand-ink">{feature}</span>
              </li>
            ))}
          </ul>

          <div className="border border-brand-ink/20 px-5 py-3 text-center text-sm font-bold text-ink-muted">
            {activePro ? 'Sudah termasuk di Pro' : 'Sedang kamu pakai'}
          </div>
        </div>

        {/* Pro — ink plate. Inverted on purpose: the featured tier is the one
            printed in reverse, the way a display ad is set. */}
        <div className="flex flex-col bg-brand-ink p-8">
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <h2 className="font-serif text-2xl text-brand-cream">Pro</h2>
            <span className="bg-brand-tan px-2 py-0.5 text-[10px] font-bold tracking-[0.15em] text-brand-ink uppercase">
              {activePro ? 'Aktif' : 'Paling lengkap'}
            </span>
          </div>
          <p className="text-sm text-cream-muted">Semua latihan, tanpa batas jumlah harian.</p>

          <div className="mt-6 mb-2">
            <span className="font-serif text-4xl text-brand-cream">{PRO_PRICE_LABEL}</span>
            <span className="ml-2 text-sm text-cream-subtle">{PRO_PERIOD_LABEL}</span>
          </div>
          <p className="mb-8 text-xs text-cream-subtle">
            Sekali bayar untuk 30 hari. Tidak ada perpanjangan otomatis.
          </p>

          <ul className="mb-8 flex-1 space-y-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-tan" />
                <span className="text-sm text-brand-cream">{feature}</span>
              </li>
            ))}
          </ul>

          {activePro ? (
            <div className="border border-brand-tan px-5 py-3 text-center text-sm font-bold text-brand-tan">
              Sedang kamu pakai
            </div>
          ) : user ? (
            <button
              type="button"
              onClick={handleUpgrade}
              disabled={loading}
              className="group inline-flex items-center justify-center gap-2 bg-brand-tan px-6 py-4 text-base font-bold tracking-wide text-brand-ink transition-colors hover:bg-[#b8854c] disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
                  Menyiapkan pembayaran...
                </>
              ) : (
                <>
                  Ambil Pro
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          ) : (
            <Link
              to="/sign-in"
              className="group inline-flex items-center justify-center gap-2 bg-brand-tan px-6 py-4 text-base font-bold tracking-wide text-brand-ink transition-colors hover:bg-[#b8854c]"
            >
              Masuk dulu untuk berlangganan
              <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          )}

          {!activePro && (
            <p className="mt-3 text-center text-xs text-cream-subtle">
              Pembayaran diproses oleh penyedia pembayaran. Kami tidak menyimpan data kartumu.
            </p>
          )}
        </div>
      </div>

      {/* ── Stuck after paying ─────────────────────────────────── */}
      {stuckAfterPayment && (
        <div className="mt-10 border-2 border-brand-rust bg-brand-cream p-6">
          <h2 className="font-serif text-xl text-brand-ink">
            Sudah bayar tapi status masih Free?
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Konfirmasi dari penyedia pembayaran kadang butuh satu sampai dua menit.
            Tekan tombol di bawah untuk memuat ulang status akunmu.
          </p>
          <button
            type="button"
            onClick={handleRefreshStatus}
            disabled={refreshing}
            className="mt-5 inline-flex items-center gap-2 bg-brand-ink px-6 py-3 text-sm font-bold tracking-wide text-brand-cream transition-colors hover:bg-brand-rust disabled:opacity-70"
          >
            <RefreshCw aria-hidden="true" className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Memuat ulang...' : 'Perbarui status'}
          </button>
          <p className="mt-4 text-sm text-ink-muted">
            Masih belum aktif setelah beberapa menit? Kirimkan nomor invoice di bawah ke{' '}
            <a
              href="mailto:avresixx@gmail.com?subject=Pembayaran%20Pro%20belum%20aktif"
              className="font-bold text-brand-rust underline-offset-4 hover:underline"
            >
              avresixx@gmail.com
            </a>{' '}
            dan kami aktifkan manual.
          </p>
        </div>
      )}

      {/* ── Billing history ────────────────────────────────────── */}
      {user && (
        <div className="mt-16">
          <div className="mb-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-brand-ink/15" />
            <span className="text-xs font-medium tracking-wider text-ink-subtle uppercase">
              Riwayat Pembayaran
            </span>
            <div className="h-px flex-1 bg-brand-ink/15" />
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center gap-3 border border-brand-ink/15 py-10 text-sm text-ink-muted">
              <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
              Memuat riwayat...
            </div>
          ) : ordersFailed ? (
            <div className="border border-brand-ink/15 px-6 py-10 text-center">
              <p className="text-sm text-ink-muted">
                Riwayat pembayaranmu belum bisa ditampilkan sekarang. Ini tidak
                memengaruhi status langgananmu.
              </p>
              <button
                type="button"
                onClick={fetchOrders}
                className="mt-4 inline-flex items-center gap-2 border border-brand-ink px-5 py-2.5 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-cream"
              >
                <RefreshCw aria-hidden="true" className="h-4 w-4" />
                Coba lagi
              </button>
            </div>
          ) : orders.length === 0 ? (
            <div className="border border-brand-ink/15 px-6 py-10 text-center">
              <p className="font-serif text-lg text-brand-ink">Belum ada pembayaran</p>
              <p className="mt-1 text-sm text-ink-muted">
                Setiap pembelian Pro akan tercatat di sini lengkap dengan nomor invoicenya.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-brand-ink">
              <table className="w-full min-w-[42rem] border-collapse text-left">
                <thead>
                  <tr className="bg-brand-cream">
                    {['Invoice', 'Tanggal', 'Jumlah', 'Metode', 'Status'].map((head) => (
                      <th
                        key={head}
                        scope="col"
                        className="border-b border-brand-ink px-5 py-3 text-xs font-bold tracking-[0.15em] text-ink-subtle uppercase"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="bg-brand-cream">
                      <td className="border-b border-brand-ink/10 px-5 py-4 font-mono text-xs break-all text-brand-ink">
                        {order.id}
                      </td>
                      <td className="border-b border-brand-ink/10 px-5 py-4 text-sm whitespace-nowrap text-ink-muted">
                        {formatDate(order.paid_at || order.created_at) || '-'}
                      </td>
                      <td className="border-b border-brand-ink/10 px-5 py-4 text-sm font-bold whitespace-nowrap text-brand-ink">
                        Rp {(order.amount || 0).toLocaleString('id-ID')}
                      </td>
                      <td className="border-b border-brand-ink/10 px-5 py-4 text-sm text-ink-muted uppercase">
                        {order.payment_method || '-'}
                      </td>
                      <td className="border-b border-brand-ink/10 px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 bg-brand-green px-2.5 py-1 text-xs font-bold text-brand-ink">
                          <Check aria-hidden="true" className="h-3 w-3" />
                          Lunas
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 text-sm text-ink-muted">
            Butuh bukti pembayaran resmi? Kirim nomor invoice ke{' '}
            <a
              href="mailto:avresixx@gmail.com?subject=Permintaan%20bukti%20pembayaran%20DeutschUp"
              className="font-bold text-brand-rust underline-offset-4 hover:underline"
            >
              avresixx@gmail.com
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}
