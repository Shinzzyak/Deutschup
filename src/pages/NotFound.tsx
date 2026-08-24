import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';

/** The places worth offering someone who took a wrong turn. */
const DESTINATIONS = [
  { to: '/dashboard', label: 'Dashboard', desc: 'Progres, streak, dan lanjutan belajarmu' },
  { to: '/curriculum', label: 'Kurikulum', desc: 'Semua unit dari A1 sampai B2' },
  { to: '/vocab', label: 'Kosakata', desc: 'Latihan kartu kata harian' },
  { to: '/simulasi', label: 'Simulasi Ujian', desc: 'Latihan soal model Goethe' },
  { to: '/profile', label: 'Profil', desc: 'Akun, langganan, dan bantuan' },
];

export default function NotFound() {
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Only offer "kembali" when there is somewhere in-app to go back to.
   * react-router's BrowserRouter keeps its position in `history.state.idx`;
   * at idx 0 this page IS the entry point, and a back button there would throw
   * the user out of DeutschUp entirely. When the signal is missing we simply
   * do not render the button — a lost affordance beats a trapdoor.
   */
  const [canGoBack] = useState(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    return typeof idx === 'number' && idx > 0;
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      {/* Editorial label */}
      <div className="mb-8 flex items-center gap-3">
        <div className="h-px w-12 bg-brand-rust" />
        <span className="text-xs font-bold tracking-[0.2em] text-brand-rust uppercase">
          Error 404
        </span>
      </div>

      <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
        Halaman ini tidak ada
      </h1>

      <p className="mt-5 max-w-xl text-lg leading-relaxed font-light text-ink-muted">
        Alamatnya mungkin salah ketik, atau halamannya sudah dipindahkan. Belajarmu
        tidak terganggu — semua progres tetap tersimpan.
      </p>

      {location.pathname && location.pathname !== '/' && (
        <p className="mt-4 text-sm text-ink-subtle">
          Alamat yang dituju:{' '}
          <span className="font-mono text-brand-ink break-all">{location.pathname}</span>
        </p>
      )}

      {/* Destination grid — gap-px over ink draws the hairline rules */}
      <div className="mt-12 mb-8 flex items-center gap-4">
        <div className="h-px flex-1 bg-brand-ink/15" />
        <span className="text-xs font-medium tracking-wider text-ink-subtle uppercase">
          Lanjutkan ke
        </span>
        <div className="h-px flex-1 bg-brand-ink/15" />
      </div>

      <nav aria-label="Halaman utama DeutschUp">
        <ul className="grid gap-px border border-brand-ink bg-brand-ink sm:grid-cols-2">
          {DESTINATIONS.map((item) => (
            <li key={item.to} className="bg-brand-cream">
              <Link
                to={item.to}
                className="group flex h-full items-center justify-between gap-4 p-5 transition-colors hover:bg-brand-ink"
              >
                <span className="min-w-0">
                  <span className="block font-serif text-lg text-brand-ink transition-colors group-hover:text-brand-cream">
                    {item.label}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-muted transition-colors group-hover:text-cream-muted">
                    {item.desc}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-ink-subtle transition-all group-hover:translate-x-1 group-hover:text-brand-tan"
                />
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {canGoBack && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-brand-rust transition-colors hover:text-brand-ink"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Kembali ke halaman sebelumnya
        </button>
      )}
    </div>
  );
}
