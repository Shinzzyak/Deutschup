import { ReactNode } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Check } from 'lucide-react';
import { isUserPro, canAccessFeature, type SubscriptionData } from '../lib/subscription';

interface FeatureGateProps {
  children: ReactNode;
  feature?: string;
  sub: SubscriptionData | null | undefined;
  role?: string;
  fallback?: ReactNode;
  showUpgrade?: boolean;
}

/**
 * Copy per gated feature.
 *
 * The old prompt said "Fitur Premium / Upgrade ke Pro untuk mengakses fitur ini"
 * for everything — a closed door with no reason to open it. Each entry below
 * names the thing the user was reaching for and the two or three concrete
 * things Pro hands over, so the gate sells instead of scolds.
 *
 * Keys match the `proFeatures` list in lib/subscription.ts.
 */
const FEATURE_COPY: Record<string, { title: string; lead: string; perks: string[] }> = {
  pdf_reports: {
    title: 'Laporan belajar dalam PDF',
    lead: 'Rekap progresmu jadi satu dokumen rapi yang bisa disimpan atau dilampirkan ke pendaftaran kursus.',
    perks: [
      'Ringkasan XP, streak, dan pelajaran yang selesai',
      'Bisa diunduh kapan saja, sebanyak yang kamu mau',
      'Format siap cetak',
    ],
  },
  unlimited_herr_deutsch: {
    title: 'Ngobrol tanpa batas dengan Herr Deutsch',
    lead: 'Paket gratis memberi 10 pesan per jam. Pro melepas batas itu, jadi latihan percakapanmu tidak terputus di tengah jalan.',
    perks: [
      'Tanya apa pun sepuasnya, tanpa jeda satu jam',
      'Koreksi kalimat sampai kamu benar-benar paham',
      'Balasan lengkap dengan penjelasan tata bahasa',
    ],
  },
  unlimited_simulations: {
    title: 'Simulasi ujian tanpa batas',
    lead: 'Paket gratis memberi satu simulasi per minggu. Pro membukanya sepenuhnya, jadi kamu bisa mengulang sampai skormu stabil.',
    perks: [
      'Ulang simulasi sebanyak yang kamu butuhkan',
      'Semua paket soal model Goethe',
      'Pembahasan tiap jawaban',
    ],
  },
  b2_material: {
    title: 'Materi A2, B1, dan B2',
    lead: 'Pro membuka seluruh jalur belajar sampai B2 sekaligus, tanpa menunggu.',
    perks: [
      'Semua unit A2 sampai B2',
      'Checkpoint tiap level',
      'Kosakata dan latihan kata kerja tiap level',
    ],
  },
};

const DEFAULT_COPY = {
  title: 'Bagian ini ada di paket Pro',
  lead: 'Paket gratismu tetap jalan seperti biasa. Pro menambahkan ini di atasnya.',
  perks: [
    'Herr Deutsch tanpa batas pesan',
    'Simulasi ujian tanpa batas',
    'Laporan belajar dalam PDF',
  ],
};

/**
 * Wraps content that requires a Pro subscription.
 * Pro → render children. Free → render `fallback`, or the upgrade panel below.
 */
export default function FeatureGate({
  children,
  feature,
  sub,
  role,
  fallback,
  showUpgrade = true,
}: FeatureGateProps) {
  const hasAccess = feature
    ? canAccessFeature(sub, feature, role)
    : isUserPro(sub, role);

  if (hasAccess) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  if (!showUpgrade) return null;

  const copy = (feature && FEATURE_COPY[feature]) || DEFAULT_COPY;

  return (
    /* Opaque cream plate with a solid ink frame. The previous version set only
       Tailwind gradient *stops* (`from-amber-50 to-orange-50`) without
       `bg-gradient-to-*`, so it painted no background at all and inherited
       whatever sat behind it — in Dashboard that is the near-black hero card,
       where amber-900 body copy measured 2.08:1. An opaque surface makes the
       panel legible wherever it is dropped. */
    <div className="w-full max-w-sm border-2 border-brand-ink bg-brand-cream p-6 text-left">
      <div className="mb-3 flex items-center gap-3">
        <div className="h-px w-8 bg-brand-rust" />
        <span className="text-[11px] font-bold tracking-[0.2em] text-brand-rust uppercase">
          Paket Pro
        </span>
      </div>

      <h3 className="font-serif text-xl leading-tight text-brand-ink">{copy.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">{copy.lead}</p>

      <ul className="mt-5 space-y-2 border-t border-brand-ink/15 pt-5">
        {copy.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5">
            <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-brand-rust" />
            <span className="text-sm text-brand-ink">{perk}</span>
          </li>
        ))}
      </ul>

      <Link
        to="/pricing"
        className="group mt-6 inline-flex items-center gap-2 bg-brand-ink px-6 py-3 text-sm font-bold tracking-wide text-brand-cream transition-colors hover:bg-brand-rust"
      >
        Lihat paket Pro
        <ArrowRight aria-hidden="true" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>

      <p className="mt-3 text-xs text-ink-subtle">
        Paket gratis tetap bisa dipakai selamanya — tidak ada masa coba yang habis.
      </p>
    </div>
  );
}

/**
 * Inline badge marking Pro-only entries in navigation.
 *
 * Was `bg-primary text-primary-foreground`; --primary is oklch(0.205 0 0), i.e.
 * plain near-black with no brand colour in it at all. Rust + cream reads as the
 * brand and measures 7.85:1.
 */
export function ProBadge({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center bg-brand-rust px-2 py-0.5 text-[10px] font-bold tracking-[0.12em] text-brand-cream uppercase ${className}`}
    >
      Pro
    </span>
  );
}
