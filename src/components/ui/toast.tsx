import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

import { cn } from '@/lib/utils';

/* ============================================================================
   Toast — the single feedback channel for the whole app.

   Self-contained on purpose: no sonner / react-hot-toast / radix. React context
   + createPortal + `motion` (already a dependency) is all this needs.

   Usage:
     const { toast } = useToast();
     toast({ title: 'Tersimpan', description: 'Kunci API diperbarui.', variant: 'success' });
   ========================================================================== */

export type ToastVariant = 'success' | 'error' | 'info';

export interface ToastOptions {
  /** Short headline, set in the serif display face. Required. */
  title: string;
  /** Optional second line for detail — an error message, a hint, a count. */
  description?: string;
  /** Defaults to 'info'. */
  variant?: ToastVariant;
  /**
   * Override the auto-dismiss delay in ms. Pass 0 (or Infinity) to make the
   * toast sticky — it then only goes away when the user closes it.
   * Defaults: 5000ms, or 8000ms for `variant: 'error'`.
   */
  duration?: number;
}

export interface ToastApi {
  toast: (opts: ToastOptions) => void;
}

/** Auto-dismiss delays. Errors linger — they usually carry text worth reading. */
const DEFAULT_DURATION = 5_000;
const ERROR_DURATION = 8_000;

/** More than three stacked toasts is noise; the oldest gets dropped. */
const MAX_VISIBLE = 3;

/**
 * Bottom offset for the stack. The right edge of the screen is already a column
 * of fixed furniture, so the toasts have to clear all of it:
 *
 *   MobileBottomNav   0        -> ~56px + safe-area   (fixed bottom-0, lg:hidden)
 *   ChatWidget FAB    safe+68  -> safe+124            (w-14 h-14, always on)
 *   QuickNote FAB     safe+144 -> safe+200            (w-14 h-14, always on)
 *
 * 208px puts the stack 8px above the topmost of those on every breakpoint, so
 * nothing that the user might need to tap ever ends up underneath a toast.
 * Keep this in sync if any of those three widgets moves.
 */
const VIEWPORT_BOTTOM = 'calc(env(safe-area-inset-bottom, 0px) + 208px)';

/**
 * Above the ChatWidget panel (z-99999) so feedback stays visible even while the
 * chat or a dialog is open. Nothing else in the app goes higher.
 */
const VIEWPORT_Z = 100_000;

interface ToastRecord {
  id: string;
  /** variant+title+description — identical toasts restart instead of stacking. */
  key: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  /** Bumped when a duplicate arrives; restarts this toast's dismiss timer. */
  seq: number;
}

/* ---------------------------------------------------------------------------
   Variant styling.

   One ink per plate: the type, the icon, the hairline rules between cells and
   the frame all use the SAME colour on a given surface. That is the letterpress
   convention and it also means there is exactly one contrast pair to verify per
   variant instead of five.

   Measured with the WCAG 2.1 relative-luminance formula:
     success  #0a0a0a on #2d8a4e =  4.58:1   (AA)
     error    #f5f0eb on #8b2500 =  7.85:1   (AAA)
     info     #f5f0eb on #0a0a0a = 17.48:1   (AAA)

   Two traps deliberately avoided here:
   - brand-green is a mid-tone. Cream on it is 3.82:1 and pure white is 4.32:1,
     both FAIL. Near-black is the only passing type colour on green, so the
     success plate is dark-on-colour while the other two are light-on-colour.
   - text-cream-muted (#a7a7a7), which is correct on ink (8.23:1), drops to
     3.69:1 on rust and must not be used there. Hence: no dimmed secondary
     colour anywhere. Hierarchy comes from the typeface and the size, not from
     lowering contrast.
   ------------------------------------------------------------------------- */
const VARIANTS: Record<
  ToastVariant,
  {
    icon: typeof Info;
    /** Cell background — the variant colour itself. */
    surface: string;
    /** Type + icon colour on that surface. */
    ink: string;
    /** Grid background: shows through the gap-px hairlines, plus the frame. */
    rule: string;
    /** Inverted block on hover/focus of the close cell. */
    closeHover: string;
    /** Announced by screen readers ahead of the title. */
    label: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    surface: 'bg-brand-green',
    ink: 'text-brand-ink',
    rule: 'bg-brand-ink border-brand-ink',
    closeHover: 'hover:bg-brand-ink hover:text-brand-green focus-visible:bg-brand-ink focus-visible:text-brand-green',
    label: 'Berhasil',
  },
  error: {
    icon: AlertTriangle,
    surface: 'bg-brand-rust',
    ink: 'text-brand-cream',
    rule: 'bg-brand-cream border-brand-cream',
    closeHover: 'hover:bg-brand-cream hover:text-brand-rust focus-visible:bg-brand-cream focus-visible:text-brand-rust',
    label: 'Gagal',
  },
  info: {
    icon: Info,
    surface: 'bg-brand-ink',
    ink: 'text-brand-cream',
    rule: 'bg-brand-cream border-brand-cream',
    closeHover: 'hover:bg-brand-cream hover:text-brand-ink focus-visible:bg-brand-cream focus-visible:text-brand-ink',
    label: 'Info',
  },
};

/* ---------------------------------------------------------------------------
   Context
   ------------------------------------------------------------------------- */

/**
 * Deliberately NOT throwing when the provider is missing. Six different callers
 * use this hook and a thrown error inside a render would white-screen the app —
 * a swallowed notification plus a console warning is the far cheaper failure.
 * It also keeps isolated component tests renderable without extra wrapping.
 */
const NO_PROVIDER: ToastApi = {
  toast: (opts) => {
    console.warn(
      '[toast] useToast() dipanggil di luar <ToastProvider>. Notifikasi diabaikan:',
      opts
    );
  },
};

const ToastContext = createContext<ToastApi | null>(null);

let idCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((opts: ToastOptions) => {
    const variant: ToastVariant = opts.variant ?? 'info';
    // Typed as required, but callers are plain JS at the call site — a blank
    // title would render an empty plate, so drop it rather than show nothing.
    const title = typeof opts.title === 'string' ? opts.title.trim() : '';
    if (!title) return;

    const description = opts.description?.trim() || undefined;

    // 0 and Infinity both mean "sticky, user closes it". Garbage (NaN, negative)
    // falls back to the variant default rather than producing a zombie toast.
    const requested = opts.duration;
    const duration =
      typeof requested !== 'number' || Number.isNaN(requested) || requested < 0
        ? variant === 'error'
          ? ERROR_DURATION
          : DEFAULT_DURATION
        : Number.isFinite(requested)
          ? requested
          : 0;

    // JSON keeps the parts unambiguous: "A B"/undefined and "A"/"B"
    // must not be treated as the same toast.
    const key = JSON.stringify([variant, title, description ?? '']);

    setToasts((prev) => {
      // Rapid double-submits should not print the same slip three times —
      // restart the visible one instead.
      const at = prev.findIndex((t) => t.key === key);
      if (at !== -1) {
        const next = prev.slice();
        next[at] = { ...next[at], duration, seq: next[at].seq + 1 };
        return next;
      }

      idCounter += 1;
      const record: ToastRecord = {
        id: `toast-${idCounter}`,
        key,
        title,
        description,
        variant,
        duration,
        seq: 0,
      };
      const next = [...prev, record];
      return next.length > MAX_VISIBLE ? next.slice(next.length - MAX_VISIBLE) : next;
    });
  }, []);

  // Stable value: `children` is the same element on every state change and the
  // context value never changes identity, so pushing a toast re-renders only
  // the viewport — never the app tree underneath.
  const api = useMemo<ToastApi>(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext) ?? NO_PROVIDER;
}

/* ---------------------------------------------------------------------------
   Viewport
   ------------------------------------------------------------------------- */

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
}) {
  if (typeof document === 'undefined') return null;

  function handleKeyDown(event: React.KeyboardEvent<HTMLOListElement>) {
    // Scoped to the stack: Escape only clears toasts when focus is already
    // inside one, so it never steals Escape from an open dialog.
    if (event.key !== 'Escape' || toasts.length === 0) return;
    event.stopPropagation();
    toasts.forEach((t) => onDismiss(t.id));
  }

  return createPortal(
    <ol
      aria-label="Notifikasi"
      onKeyDown={handleKeyDown}
      style={{ bottom: VIEWPORT_BOTTOM, zIndex: VIEWPORT_Z }}
      className={cn(
        'pointer-events-none fixed inset-x-4 flex flex-col gap-2',
        // Phone: full bleed between the 16px margins. Desktop: a column pinned
        // to the right, still clear of both floating widgets.
        'sm:left-auto sm:right-4 sm:w-full sm:max-w-sm'
      )}
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastItem key={t.id} record={t} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </ol>,
    document.body
  );
}

/* ---------------------------------------------------------------------------
   Item
   ------------------------------------------------------------------------- */

function ToastItem({
  record,
  onDismiss,
}: {
  record: ToastRecord;
  onDismiss: (id: string) => void;
}) {
  const { id, title, description, variant, duration, seq } = record;
  const v = VARIANTS[variant];
  const Icon = v.icon;
  const isError = variant === 'error';
  const reduceMotion = useReducedMotion();

  const [paused, setPaused] = useState(false);
  const remainingRef = useRef(duration);

  // Declared before the timer effect on purpose: React runs every cleanup for a
  // commit before any effect body, so the timer's cleanup (which debits elapsed
  // time) can never undo this reset.
  useEffect(() => {
    remainingRef.current = duration;
  }, [duration, seq]);

  useEffect(() => {
    if (paused || duration <= 0) return;

    const startedAt = Date.now();
    const timer = window.setTimeout(() => onDismiss(id), remainingRef.current);

    return () => {
      window.clearTimeout(timer);
      remainingRef.current = Math.max(0, remainingRef.current - (Date.now() - startedAt));
    };
  }, [paused, duration, seq, id, onDismiss]);

  // Hover-to-pause is gated on a real mouse: on touch, pointerenter fires and
  // pointerleave often never does, which would strand the toast on screen.
  function handlePointerEnter(event: React.PointerEvent) {
    if (event.pointerType === 'mouse') setPaused(true);
  }
  function handlePointerLeave(event: React.PointerEvent) {
    if (event.pointerType === 'mouse') setPaused(false);
  }

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.97 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.26, ease: [0.22, 1, 0.36, 1] }
      }
      // Swipe sideways to dismiss. Constraints of zero width mean motion always
      // springs the card back if the gesture falls short, so it can never get
      // stranded off-centre. drag="x" also sets touch-action: pan-y, leaving
      // vertical page scrolling untouched.
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.5}
      onDragEnd={(_event, info) => {
        if (Math.abs(info.offset.x) > 96 || Math.abs(info.velocity.x) > 600) {
          onDismiss(id);
        }
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      className="pointer-events-auto"
    >
      {/* gap-px over a solid background draws the hairline rules between the
          icon block, the copy and the close block. Square corners throughout. */}
      <div className={cn('grid grid-cols-[auto_1fr_auto] gap-px border', v.rule)}>
        <div className={cn('flex items-start justify-center px-3 pt-3.5', v.surface)}>
          <Icon aria-hidden="true" className={cn('h-5 w-5 shrink-0', v.ink)} />
        </div>

        {/* The live region wraps the copy only — the close button sits outside
            it so screen readers announce the message, not the controls. */}
        <div
          role={isError ? 'alert' : 'status'}
          aria-live={isError ? 'assertive' : 'polite'}
          aria-atomic="true"
          className={cn('min-w-0 px-3.5 py-3', v.surface, v.ink)}
        >
          <span className="sr-only">{v.label}: </span>
          <p className="font-serif text-[15px] leading-tight break-words">{title}</p>
          {description && (
            <p className="mt-1 text-[13px] leading-snug break-words">{description}</p>
          )}
        </div>

        <button
          type="button"
          onClick={() => onDismiss(id)}
          aria-label={`Tutup notifikasi: ${title}`}
          className={cn(
            // w-11 = 44px, the Android/iOS minimum tap target. The cell is full
            // height, so the real target is taller than that.
            'flex w-11 items-start justify-center pt-3.5 transition-colors',
            // index.css has an UNLAYERED `*:focus-visible { border-radius: 4px }`,
            // which outranks any @layer utilities rule no matter the specificity.
            // The `!` is what keeps the corner square while focused.
            'focus-visible:rounded-none!',
            v.surface,
            v.ink,
            v.closeHover
          )}
        >
          <X aria-hidden="true" className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </motion.li>
  );
}
