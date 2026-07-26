import { useRef, type ReactNode } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'motion/react';
import { cn } from '@/lib/utils';

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** How far the element may drift toward the cursor, in px. */
  strength?: number;
  /** Adds a soft radial glow that follows the cursor. */
  glow?: boolean;
  /** Glow colour — any CSS colour. Defaults to the tan brand accent. */
  glowColor?: string;
}

/**
 * Magnetic hover wrapper.
 *
 * The element leans toward the cursor while it is inside, then springs back on
 * exit. Pointer position is tracked through motion values rather than React
 * state, so the drift never triggers a re-render.
 *
 * Honours `prefers-reduced-motion`: when set, this renders a plain wrapper with
 * no listeners and no transform at all.
 */
export default function Magnetic({
  children,
  className,
  strength = 12,
  glow = false,
  glowColor = 'var(--brand-tan)',
}: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Pointer position in percent, used to place the glow.
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);

  const spring = { stiffness: 260, damping: 18, mass: 0.4 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  const background = useTransform(
    [gx, gy],
    ([px, py]: number[]) =>
      `radial-gradient(120px circle at ${px}% ${py}%, ${glowColor}, transparent 70%)`
  );

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;

    // -1..1 from the centre, scaled by strength.
    x.set(((relX - rect.width / 2) / (rect.width / 2)) * strength);
    y.set(((relY - rect.height / 2) / (rect.height / 2)) * strength);

    gx.set((relX / rect.width) * 100);
    gy.set((relY / rect.height) * 100);
  }

  function handlePointerLeave() {
    x.set(0);
    y.set(0);
    gx.set(50);
    gy.set(50);
  }

  return (
    <motion.div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ x: sx, y: sy }}
      className={cn('group/magnetic relative inline-flex', className)}
    >
      {glow && (
        <motion.span
          aria-hidden="true"
          style={{ background }}
          className="pointer-events-none absolute -inset-4 -z-10 opacity-0 blur-xl transition-opacity duration-300 group-hover/magnetic:opacity-60"
        />
      )}
      {children}
    </motion.div>
  );
}
