import * as React from 'react';
import { AlertTriangle, CheckCircle2, Info, Loader2, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';

/* ============================================================================
   Admin design tokens — LIGHT-NATIVE.
   ---------------------------------------------------------------------------
   The admin panel was authored for a dark theme that never ships: useTheme()
   is imported nowhere, so `.dark` never lands on <html> and every dark-mode
   colour (emerald-400, amber-400, blue-300 …) rendered on a WHITE card at
   1.3–2.8:1. Every value below is measured against the surface it actually
   sits on, using the WCAG 2.1 relative-luminance formula:

     text on white card            text on its own tinted surface
     ok    #1a6b3d  6.53:1         on #e6f4ec  5.76:1
     warn  #7a5200  6.92:1         on #fdf1dc  6.19:1
     bad   #8b2500  8.89:1         on #f6e8e3  7.44:1   (= brand-rust)
     info  #1e40af  8.72:1         on #e8eefb  7.50:1
     idle  #5c5956  6.96:1         on #f1efed  6.07:1   (= --ink-muted)

   Borders are decorative only and are never relied on to carry meaning: every
   state also carries an icon and a written label.
   ========================================================================= */

export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'idle';

interface ToneStyle {
  /** tinted surface + hairline border, for banners and chips */
  surface: string;
  /** text colour that passes AA on both white and the tinted surface */
  text: string;
  /** border colour on its own, for cards that keep a white interior */
  edge: string;
}

export const TONE: Record<Tone, ToneStyle> = {
  ok: {
    surface: 'bg-[#e6f4ec] border border-[#b7dcc6]',
    text: 'text-[#1a6b3d]',
    edge: 'border-[#b7dcc6]',
  },
  warn: {
    surface: 'bg-[#fdf1dc] border border-[#e9cf9a]',
    text: 'text-[#7a5200]',
    edge: 'border-[#e9cf9a]',
  },
  bad: {
    surface: 'bg-[#f6e8e3] border border-[#e0bfb2]',
    text: 'text-[#8b2500]',
    edge: 'border-[#e0bfb2]',
  },
  info: {
    surface: 'bg-[#e8eefb] border border-[#bcd0f4]',
    text: 'text-[#1e40af]',
    edge: 'border-[#bcd0f4]',
  },
  idle: {
    surface: 'bg-[#f1efed] border border-[#dcd8d4]',
    text: 'text-ink-muted',
    edge: 'border-[#dcd8d4]',
  },
};

const TONE_ICON: Record<Tone, typeof CheckCircle2> = {
  ok: CheckCircle2,
  warn: AlertTriangle,
  bad: AlertTriangle,
  info: Info,
  idle: Info,
};

/** Panel surface: white, hairline rule, square corners. */
export const PANEL = 'bg-white border border-brand-ink/12';

/**
 * Quiet button. Deliberately `variant="ghost"` rather than `variant="outline"`:
 * the outline variant carries `.glass-subtle`, which is declared outside any
 * cascade layer and therefore overrides Tailwind's `rounded-none`, re-rounding
 * the corner. Ghost has no radius of its own, so it stays square for free.
 */
export const BTN_QUIET =
  'border border-brand-ink/15 bg-white text-brand-ink hover:bg-brand-cream';

/* ============================================================================
   Section heading — serif, with a rust rule above it.
   ========================================================================= */

export function SectionHeading({
  children,
  hint,
  icon: Icon,
  className,
}: {
  children: React.ReactNode;
  hint?: string;
  icon?: typeof CheckCircle2;
  className?: string;
}) {
  return (
    <div className={cn('mb-4', className)}>
      <div className="h-px w-10 bg-brand-rust mb-3" aria-hidden="true" />
      <h2 className="font-heading text-2xl leading-tight text-brand-ink flex items-center gap-2">
        {Icon ? <Icon className="w-5 h-5 text-brand-rust shrink-0" aria-hidden="true" /> : null}
        {children}
      </h2>
      {hint ? <p className="text-sm text-ink-muted mt-1">{hint}</p> : null}
    </div>
  );
}

/* ============================================================================
   Status chip — icon + word, never colour alone.
   ========================================================================= */

export function StatusChip({
  tone,
  children,
  className,
}: {
  tone: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
        TONE[tone].surface,
        TONE[tone].text,
        className
      )}
    >
      {children}
    </span>
  );
}

/* ============================================================================
   Inline notice — persistent, in-flow explanation.
   ========================================================================= */

export function AdminNotice({
  tone = 'info',
  title,
  children,
  className,
}: {
  tone?: Tone;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const Icon = TONE_ICON[tone];
  return (
    <div className={cn('flex items-start gap-3 p-3', TONE[tone].surface, className)}>
      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', TONE[tone].text)} aria-hidden="true" />
      <div className="min-w-0 text-sm">
        {title ? <p className={cn('font-semibold', TONE[tone].text)}>{title}</p> : null}
        {children ? <div className="text-ink-muted break-words">{children}</div> : null}
      </div>
    </div>
  );
}

/* ============================================================================
   Feedback stack — every action reports back.
   ---------------------------------------------------------------------------
   Self-contained on purpose: it owns its state and its markup, so a fault in
   any shared notification layer cannot silence the admin panel.
   ========================================================================= */

export interface FeedbackItem {
  id: number;
  tone: Tone;
  title: string;
  detail?: string;
}

export interface FeedbackApi {
  items: FeedbackItem[];
  notify: (tone: Tone, title: string, detail?: string) => void;
  dismiss: (id: number) => void;
}

const AUTO_DISMISS_MS: Record<Tone, number> = {
  ok: 4500,
  info: 5000,
  idle: 5000,
  warn: 9000,
  bad: 12000,
};

export function useAdminFeedback(): FeedbackApi {
  const [items, setItems] = React.useState<FeedbackItem[]>([]);
  const nextId = React.useRef(1);
  const timers = React.useRef<number[]>([]);

  React.useEffect(
    () => () => {
      timers.current.forEach(t => window.clearTimeout(t));
      timers.current = [];
    },
    []
  );

  const dismiss = React.useCallback((id: number) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const notify = React.useCallback(
    (tone: Tone, title: string, detail?: string) => {
      const id = nextId.current++;
      // Keep the stack short — on a phone more than three is a wall of text.
      setItems(prev => [...prev.slice(-2), { id, tone, title, detail }]);
      const timer = window.setTimeout(() => dismiss(id), AUTO_DISMISS_MS[tone]);
      timers.current.push(timer);
    },
    [dismiss]
  );

  return { items, notify, dismiss };
}

export function AdminFeedbackStack({ feedback }: { feedback: FeedbackApi }) {
  const { items, dismiss } = feedback;
  if (items.length === 0) return null;

  return (
    <div
      className="fixed inset-x-3 bottom-3 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-96"
      role="status"
      aria-live="polite"
    >
      {items.map(item => {
        const Icon = TONE_ICON[item.tone];
        return (
          <div
            key={item.id}
            className={cn(
              'flex items-start gap-3 p-3 shadow-[0_12px_32px_-12px_rgba(10,10,10,0.45)]',
              TONE[item.tone].surface
            )}
          >
            <Icon
              className={cn('w-4 h-4 mt-0.5 shrink-0', TONE[item.tone].text)}
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className={cn('text-sm font-semibold', TONE[item.tone].text)}>{item.title}</p>
              {item.detail ? (
                <p className="text-xs text-ink-muted mt-0.5 break-words">{item.detail}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="shrink-0 text-ink-muted hover:text-brand-ink p-0.5"
              aria-label="Tutup pemberitahuan"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ============================================================================
   Confirmation for destructive actions.
   ========================================================================= */

export interface ConfirmRequest {
  title: string;
  body: string;
  confirmLabel: string;
  /** Repeat the exact thing being destroyed so the owner can double-check. */
  target?: string;
  onConfirm: () => void | Promise<void>;
}

export interface ConfirmApi {
  request: ConfirmRequest | null;
  busy: boolean;
  ask: (request: ConfirmRequest) => void;
  close: () => void;
  run: () => Promise<void>;
}

export function useConfirm(): ConfirmApi {
  const [request, setRequest] = React.useState<ConfirmRequest | null>(null);
  const [busy, setBusy] = React.useState(false);
  // Mirrored in a ref so `close` can read it without depending on it, which
  // keeps the callback identity stable across renders.
  const busyRef = React.useRef(false);

  const ask = React.useCallback((next: ConfirmRequest) => setRequest(next), []);

  const close = React.useCallback(() => {
    if (busyRef.current) return; // never yank the dialog out mid-delete
    setRequest(null);
  }, []);

  const run = React.useCallback(async () => {
    if (!request || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    try {
      await request.onConfirm();
      setRequest(null);
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }, [request]);

  return { request, busy, ask, close, run };
}

export function ConfirmDialog({ control }: { control: ConfirmApi }) {
  const { request, busy, close, run } = control;

  return (
    <Dialog
      open={!!request}
      onOpenChange={(open: boolean) => {
        if (!open) close();
      }}
    >
      <DialogContent
        showCloseButton={false}
        /* `.glass-heavy` on DialogContent is declared outside every cascade
           layer, so a plain `bg-white` utility loses to it. The `!` postfix is
           the only way to win that specificity fight without editing the
           shared stylesheet. */
        className="bg-white! rounded-none! border-brand-ink/15! sm:max-w-md"
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-xl text-brand-ink">
            {request?.title ?? ''}
          </DialogTitle>
          <DialogDescription className="text-ink-muted">
            {request?.body ?? ''}
          </DialogDescription>
        </DialogHeader>

        {request?.target ? (
          <p className="bg-[#f6e8e3] border border-[#e0bfb2] px-3 py-2 text-sm font-mono text-[#8b2500] break-all">
            {request.target}
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="ghost" className={BTN_QUIET} onClick={close} disabled={busy}>
            Batal
          </Button>
          <Button variant="destructive" onClick={run} disabled={busy}>
            {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : null}
            {request?.confirmLabel ?? 'Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ============================================================================
   Turning a failed request into a sentence a human can act on.
   ---------------------------------------------------------------------------
   Server payloads leak Postgres codes and stack fragments. None of that helps
   the person holding the phone, so responses are read for a message and then
   translated; anything unrecognised falls back to a plain instruction.
   ========================================================================= */

export async function readError(res: Response, fallback: string): Promise<string> {
  let raw = '';
  try {
    const data = await res.clone().json();
    raw = String(data?.error || data?.message || '');
  } catch {
    try {
      raw = (await res.clone().text()).slice(0, 200);
    } catch {
      raw = '';
    }
  }

  if (res.status === 401 || res.status === 403) {
    return 'Sesi admin tidak diterima. Coba muat ulang halaman lalu masuk lagi.';
  }
  if (res.status === 404) {
    return 'Data yang dituju tidak ditemukan lagi. Muat ulang daftarnya.';
  }
  if (res.status === 429) {
    return 'Terlalu banyak permintaan beruntun. Tunggu sebentar, lalu ulangi.';
  }
  if (res.status >= 500) {
    return 'Server sedang bermasalah saat memproses permintaan ini.';
  }

  const looksTechnical = /^[A-Z0-9_]{3,}$|error:|Error:|undefined|null|\bat\s.+:\d+/.test(raw);
  if (!raw || looksTechnical) return fallback;
  return raw;
}

/** Network-level failure (offline, DNS, CORS) never reaches the server at all. */
export function networkMessage(): string {
  return 'Tidak bisa menghubungi server. Periksa koneksi internet, lalu coba lagi.';
}
