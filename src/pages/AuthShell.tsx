// Shared auth page shell — DeutschUp editorial style: cream page, eyebrow +
// rust rule, serif headline (≥24px, weight 400), hairline card on surface-1.
// Zero radius, zero shadow per docs/DESIGN-LANGUAGE.md.
import { Loader2 } from 'lucide-react';

export function AuthPage({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="h-px w-8 bg-brand-rust" aria-hidden="true" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-brand-rust">
              {eyebrow}
            </span>
          </div>
          <h1 className="font-serif text-2xl text-brand-ink">{title}</h1>
          <p className="text-ink-muted mt-2 text-sm">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-xs text-ink-subtle">
          Dengan melanjutkan, kamu setuju pada Ketentuan &amp; Privasi DeutschUp.
        </p>
      </div>
    </div>
  );
}

export function AuthLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream">
      <Loader2 className="w-8 h-8 animate-spin text-brand-rust" aria-hidden="true" />
    </div>
  );
}
