import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { dbProxy, supabase } from '../lib/supabase';
import { isUserPro, getProDaysRemaining } from '../lib/subscription';
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Info,
  Loader2,
  LogOut,
  Mail,
  Save,
  Trash2,
  X,
} from 'lucide-react';
import { GOALS, GOAL_STORAGE_KEY, getStoredGoal, type LearningGoal } from '../components/OnboardingFlow';

/* ============================================================================
   Profile — account, subscription, and the two exits every account page owes
   the user: a way to sign out, and a way to get the account deleted.

   All four alert() calls are gone. Feedback now lands in the inline <Notice>
   under the page header, in Indonesian, phrased as an instruction rather than
   an error dump.
   ========================================================================== */

const SUPPORT_EMAIL = 'avresixx@gmail.com';

type NoticeVariant = 'success' | 'error' | 'info';

interface NoticeState {
  variant: NoticeVariant;
  title: string;
  body?: string;
}

/* Measured on the WCAG 2.1 formula:
   ink on green 4.58:1 · cream on rust 7.85:1 · cream on ink 17.48:1 */
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

/** Section frame: hairline rule + eyebrow, then the content. */
function Section({
  title,
  children,
  tone = 'default',
}: {
  title: string;
  children: React.ReactNode;
  tone?: 'default' | 'danger';
}) {
  return (
    <section className={`border-2 p-6 sm:p-8 ${tone === 'danger' ? 'border-brand-rust' : 'border-brand-ink'}`}>
      <div className="mb-6 flex items-center gap-3">
        <div className={`h-px w-8 ${tone === 'danger' ? 'bg-brand-rust' : 'bg-brand-ink'}`} />
        <h2
          className={`text-xs font-bold tracking-[0.2em] uppercase ${
            tone === 'danger' ? 'text-brand-rust' : 'text-ink-muted'
          }`}
        >
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/* The `free` column states the limit that is actually enforced today, from
   checkQuota() in lib/api-utils.ts. Nothing here promises more than the code
   delivers — this page sits next to a payment button. */
const PERKS = [
  { text: 'Herr Deutsch tanpa batas pesan', free: '10 pesan per jam' },
  { text: 'Simulasi ujian tanpa batas', free: '1 simulasi per minggu' },
  { text: 'Laporan belajar dalam PDF', free: 'Belum tersedia' },
  { text: 'Seluruh materi A1 sampai B2', free: 'Terbuka bertahap lewat checkpoint' },
];

function formatDate(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Profile() {
  const { user, profileData, tierData, logout } = useAuthStore();
  const [fullName, setFullName] = useState(profileData?.full_name || '');
  const [savedName, setSavedName] = useState(profileData?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profileData?.avatar_url || '');
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [goal, setGoal] = useState<LearningGoal | null>(() => getStoredGoal());
  const [confirmLogout, setConfirmLogout] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const role = tierData?.role || profileData?.role;
  const sub = { subscription: tierData?.subscription, pro_expires_at: tierData?.pro_expires_at };
  const activePro = isUserPro(sub, role);
  const daysRemaining = getProDaysRemaining(sub, role);
  const expiryLabel = formatDate(tierData?.pro_expires_at);
  // Admins are Pro by role and carry no expiry date; do not print a countdown at them.
  const adminAccess = role === 'admin' && !expiryLabel;

  useEffect(() => {
    if (profileData?.full_name) {
      setFullName(profileData.full_name);
      setSavedName(profileData.full_name);
    }
    if (profileData?.avatar_url) setAvatarUrl(profileData.avatar_url);
  }, [profileData?.full_name, profileData?.avatar_url]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input so picking the same file twice still fires onChange.
    e.target.value = '';
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      setNotice({
        variant: 'error',
        title: 'Filenya bukan gambar.',
        body: 'Pilih file berformat JPG, PNG, atau WEBP.',
      });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setNotice({
        variant: 'error',
        title: 'Fotonya terlalu besar.',
        body: 'Ukuran maksimal 2 MB. Coba perkecil dulu, atau pilih foto lain.',
      });
      return;
    }

    setUploadingAvatar(true);
    setNotice(null);
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const newAvatarUrl = urlData.publicUrl;

      const result = await dbProxy('upsert-profile', { userId: user.id, avatar_url: newAvatarUrl });
      if (result.error) throw new Error(result.error);

      setAvatarUrl(newAvatarUrl);
      setNotice({ variant: 'success', title: 'Foto profilmu sudah diganti.' });
    } catch (err) {
      // Server text is English and technical — keep it in the console.
      console.error('[PROFILE] Avatar upload failed:', err);
      setNotice({
        variant: 'error',
        title: 'Fotonya belum berhasil diunggah.',
        body: 'Coba lagi sebentar lagi. Kalau tetap gagal, lewati saja — foto profil tidak memengaruhi progres belajarmu.',
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    setNotice(null);
    try {
      const result = await dbProxy('upsert-profile', { userId: user.id, full_name: fullName.trim() });
      if (result.error) throw new Error(result.error);
      setSavedName(fullName.trim());
      setFullName(fullName.trim());
      setNotice({ variant: 'success', title: 'Nama kamu sudah tersimpan.' });
    } catch (e) {
      console.error('[PROFILE] upsert-profile failed:', e);
      setNotice({
        variant: 'error',
        title: 'Perubahannya belum tersimpan.',
        body: 'Periksa koneksimu lalu tekan Simpan sekali lagi.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSelectGoal = (next: LearningGoal) => {
    setGoal(next);
    try {
      localStorage.setItem(GOAL_STORAGE_KEY, next.id);
    } catch {
      // Private-mode storage; the choice simply will not persist.
    }
    setNotice({
      variant: 'success',
      title: `Tujuan belajarmu sekarang: ${next.label}.`,
      body: `Latihan yang kami sarankan: ${next.startLabel}.`,
    });
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 sm:px-6">
        <div className="mb-6 flex items-center gap-3">
          <div className="h-px w-12 bg-brand-rust" />
          <span className="text-xs font-bold tracking-[0.2em] text-brand-rust uppercase">Sesi Berakhir</span>
        </div>
        <h1 className="font-serif text-3xl leading-tight text-brand-ink sm:text-4xl">
          Kamu sudah keluar dari akun
        </h1>
        <p className="mt-4 text-base leading-relaxed text-ink-muted">
          Masuk lagi untuk melihat profil dan status langgananmu. Semua progres belajarmu
          tetap tersimpan.
        </p>
        <Link
          to="/sign-in"
          className="group mt-8 inline-flex items-center gap-2 bg-brand-ink px-8 py-4 text-base font-bold tracking-wide text-brand-cream transition-colors hover:bg-brand-rust"
        >
          Masuk kembali
          <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    );
  }

  const initial =
    fullName?.trim()?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?';
  const nameChanged = fullName.trim() !== savedName.trim();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 md:py-16">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-12 bg-brand-rust" />
            <span className="text-xs font-bold tracking-[0.2em] text-brand-rust uppercase">Akun</span>
          </div>
          <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
            Profil
          </h1>
          <p className="mt-4 max-w-md text-lg leading-relaxed font-light text-ink-muted">
            Identitas, langganan, dan pengaturan akunmu.
          </p>
        </div>
        <span
          className={`px-4 py-2 text-xs font-bold tracking-[0.15em] uppercase ${
            activePro ? 'bg-brand-tan text-brand-ink' : 'bg-brand-ink text-brand-cream'
          }`}
        >
          {activePro ? 'Member Pro' : 'Member Free'}
        </span>
      </div>

      {notice && <Notice notice={notice} onClose={() => setNotice(null)} />}

      <div className="grid gap-8 lg:grid-cols-3">
        {/* ── Identity ─────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="border-2 border-brand-ink bg-brand-cream p-8 lg:sticky lg:top-24">
            <div className="flex flex-col items-center text-center">
              <div className="group relative mb-6">
                <div className="flex h-32 w-32 items-center justify-center overflow-hidden border-2 border-brand-ink bg-brand-tan font-serif text-5xl text-brand-ink">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      width="128"
                      height="128"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  aria-label="Ganti foto profil"
                  className="absolute inset-0 flex items-center justify-center bg-brand-ink/80 text-brand-cream opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-100"
                >
                  {uploadingAvatar ? (
                    <Loader2 aria-hidden="true" className="h-8 w-8 animate-spin" />
                  ) : (
                    <span className="flex flex-col items-center gap-1">
                      <Camera aria-hidden="true" className="h-7 w-7" />
                      <span className="text-xs font-bold">Ganti Foto</span>
                    </span>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>

              <h2 className="font-serif text-2xl leading-tight text-brand-ink">
                {savedName || 'Belum ada nama'}
              </h2>
              <p className="mt-2 flex items-center justify-center gap-2 text-sm break-all text-ink-muted">
                <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                {user.email}
              </p>
            </div>

            <dl className="mt-8 grid gap-px border border-brand-ink bg-brand-ink">
              <div className="bg-brand-cream px-4 py-3">
                <dt className="text-[11px] font-bold tracking-[0.15em] text-ink-subtle uppercase">
                  Status akun
                </dt>
                <dd className="mt-1 font-serif text-lg text-brand-ink">
                  {activePro ? 'Pro' : 'Free'}
                </dd>
              </div>
              <div className="bg-brand-cream px-4 py-3">
                <dt className="text-[11px] font-bold tracking-[0.15em] text-ink-subtle uppercase">
                  Berlaku sampai
                </dt>
                <dd className="mt-1 font-serif text-lg text-brand-ink">
                  {adminAccess ? 'Tanpa batas' : activePro ? expiryLabel || 'Tidak tercatat' : '—'}
                </dd>
                {activePro && !adminAccess && (
                  <dd className="mt-1 text-xs text-ink-muted">
                    {daysRemaining > 0 ? `${daysRemaining} hari lagi` : 'Kurang dari sehari lagi'}
                  </dd>
                )}
              </div>
            </dl>
          </div>
        </div>

        {/* ── Details ──────────────────────────────────────────── */}
        <div className="space-y-8 lg:col-span-2">
          <Section title="Informasi Dasar">
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="full-name"
                  className="mb-2 block text-xs font-bold tracking-[0.15em] text-ink-muted uppercase"
                >
                  Nama lengkap
                </label>
                <input
                  id="full-name"
                  name="name"
                  autoComplete="name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Tulis namamu di sini"
                  className="w-full border border-brand-ink bg-brand-cream px-4 py-3 text-brand-ink transition-colors placeholder:text-ink-subtle focus:border-brand-rust focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-xs font-bold tracking-[0.15em] text-ink-muted uppercase"
                >
                  Alamat email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full cursor-not-allowed border border-brand-ink/20 bg-brand-ink/5 px-4 py-3 text-ink-muted"
                />
                <p className="mt-2 text-xs text-ink-subtle">
                  Email terkunci karena dipakai untuk masuk. Butuh menggantinya? Hubungi kami
                  lewat bagian Bantuan di bawah.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !nameChanged}
                  className="inline-flex items-center gap-2 bg-brand-ink px-6 py-3 text-sm font-bold tracking-wide text-brand-cream transition-colors hover:bg-brand-rust disabled:opacity-40"
                >
                  {saving ? (
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save aria-hidden="true" className="h-4 w-4" />
                  )}
                  Simpan perubahan
                </button>
              </div>
            </div>
          </Section>

          {/* Closes the loop on the onboarding question: the answer is stored,
              shown here, and changeable — not collected and forgotten. */}
          <Section title="Tujuan Belajar">
            <p className="mb-6 text-sm leading-relaxed text-ink-muted">
              {goal ? (
                <>
                  Tujuanmu saat ini <span className="font-bold text-brand-ink">{goal.label}</span>,
                  jadi latihan yang kami sarankan adalah{' '}
                  <Link
                    to={goal.startPath}
                    className="font-bold text-brand-rust underline-offset-4 hover:underline"
                  >
                    {goal.startLabel}
                  </Link>
                  . Ganti kapan saja.
                </>
              ) : (
                'Pilih satu tujuan, dan kami tunjukkan latihan mana yang paling cocok dijadikan titik mulai.'
              )}
            </p>

            <div className="grid gap-px border border-brand-ink bg-brand-ink sm:grid-cols-2">
              {GOALS.map((g) => {
                const Icon = g.icon;
                const selected = goal?.id === g.id;
                return (
                  <button
                    key={g.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handleSelectGoal(g)}
                    className={`group p-4 text-left transition-colors ${
                      selected ? 'bg-brand-ink' : 'bg-brand-cream hover:bg-brand-ink'
                    }`}
                  >
                    <Icon
                      aria-hidden="true"
                      className={`mb-2 h-5 w-5 transition-colors ${
                        selected ? 'text-brand-tan' : 'text-brand-rust group-hover:text-brand-tan'
                      }`}
                    />
                    <div
                      className={`font-serif text-base leading-tight transition-colors ${
                        selected ? 'text-brand-cream' : 'text-brand-ink group-hover:text-brand-cream'
                      }`}
                    >
                      {g.label}
                    </div>
                    <div
                      className={`mt-0.5 text-xs transition-colors ${
                        selected ? 'text-cream-muted' : 'text-ink-subtle group-hover:text-cream-muted'
                      }`}
                    >
                      {g.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>

          <Section title="Isi Langganan">
            <ul className="grid gap-px border border-brand-ink bg-brand-ink sm:grid-cols-2">
              {PERKS.map((perk) => (
                <li
                  key={perk.text}
                  className={`p-4 ${activePro ? 'bg-brand-cream' : 'bg-white'}`}
                >
                  <div className="flex items-start gap-2.5">
                    {activePro ? (
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-rust" />
                    ) : (
                      <span
                        aria-hidden="true"
                        className="mt-2 h-px w-4 shrink-0 bg-ink-subtle"
                      />
                    )}
                    <div className="min-w-0">
                      <div
                        className={`text-sm leading-snug ${
                          activePro ? 'font-bold text-brand-ink' : 'text-ink-subtle'
                        }`}
                      >
                        {perk.text}
                      </div>
                      {!activePro && (
                        <div className="mt-1 text-xs text-ink-muted">
                          Paketmu sekarang: {perk.free}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {!activePro && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-ink-muted">
                  Paket gratis tetap bisa dipakai selamanya. Pro melepas batasnya.
                </p>
                <Link
                  to="/pricing"
                  className="group inline-flex items-center gap-2 bg-brand-ink px-6 py-3 text-sm font-bold tracking-wide text-brand-cream transition-colors hover:bg-brand-rust"
                >
                  Lihat paket Pro
                  <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </Section>

          <Section title="Bantuan">
            <p className="text-sm leading-relaxed text-ink-muted">
              Ada kendala, pertanyaan soal pembayaran, atau butuh mengganti alamat email?
              Tulis ke kami dan sebutkan alamat email akunmu supaya lebih cepat kami temukan.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('[DeutschUp] Bantuan')}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-rust underline-offset-4 hover:underline"
            >
              <Mail aria-hidden="true" className="h-4 w-4" />
              {SUPPORT_EMAIL}
            </a>
          </Section>

          {/* ── Exits ──────────────────────────────────────────── */}
          <Section title="Keluar & Hapus Akun" tone="danger">
            <div className="space-y-8">
              <div>
                <h3 className="font-serif text-lg text-brand-ink">Keluar dari akun</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Kamu akan dikembalikan ke halaman depan. Progres belajarmu tetap tersimpan
                  dan akan muncul lagi begitu kamu masuk.
                </p>

                {confirmLogout ? (
                  <div className="mt-4 flex flex-wrap items-center gap-3 border border-brand-rust bg-brand-cream p-4">
                    <span className="text-sm font-bold text-brand-ink">Yakin mau keluar sekarang?</span>
                    <div className="ml-auto flex gap-3">
                      <button
                        type="button"
                        onClick={() => setConfirmLogout(false)}
                        className="border border-brand-ink px-4 py-2 text-sm font-bold text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-cream"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        onClick={() => logout()}
                        className="inline-flex items-center gap-2 bg-brand-rust px-4 py-2 text-sm font-bold text-brand-cream transition-opacity hover:opacity-90"
                      >
                        <LogOut aria-hidden="true" className="h-4 w-4" />
                        Ya, keluar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmLogout(true)}
                    className="mt-4 inline-flex items-center gap-2 border-2 border-brand-rust px-6 py-3 text-sm font-bold text-brand-rust transition-colors hover:bg-brand-rust hover:text-brand-cream"
                  >
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Keluar dari akun
                  </button>
                )}
              </div>

              <div className="border-t border-brand-ink/15 pt-8">
                <h3 className="font-serif text-lg text-brand-ink">Hapus akun dan datamu</h3>
                {/* There is no self-service delete endpoint: api/db-proxy.ts
                    whitelists no destructive action, and the Clerk user lives
                    outside this app's database. Until one exists, the honest
                    thing is to publish the manual route rather than hide it —
                    which is also what the OAuth providers require. */}
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  Penghapusan akun masih kami proses manual. Kirim email dari alamat yang
                  kamu pakai untuk masuk, dan tulis "Hapus akun" di judulnya. Kami akan
                  menghapus profil, progres belajar, catatan, dan riwayat pembayaranmu.
                  Setelah dihapus, datanya tidak bisa dikembalikan.
                </p>
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                    '[DeutschUp] Hapus akun'
                  )}&body=${encodeURIComponent(
                    `Halo DeutschUp,\n\nSaya ingin menghapus akun saya beserta seluruh datanya.\n\nEmail akun: ${
                      user.email || ''
                    }\n\nTerima kasih.`
                  )}`}
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-brand-rust underline-offset-4 hover:underline"
                >
                  <Trash2 aria-hidden="true" className="h-4 w-4" />
                  Kirim permintaan penghapusan akun
                </a>
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
