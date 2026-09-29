import { type RefObject } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'motion/react';

interface ProgressRailProps {
  /**
   * The element that scrolls this column. Pass `null` to track the document —
   * the mobile shell is `min-h-screen` with an inner `<main>` that has no
   * `overflow`, so the window is what scrolls there.
   */
  containerRef: RefObject<HTMLElement | null> | null;
  className?: string;
}

/**
 * Reading-progress rail: a 2px bar pinned to the top of the content column.
 *
 * Uses motion's `useScroll` (which reads scroll position on the animation
 * frame) rather than a hand-rolled `addEventListener('scroll')`, per this app's
 * own design contract. The spring only smooths the drawn value; nothing reads
 * it back, so it can never delay navigation or layout.
 *
 * Decorative by construction: `aria-hidden`, and removed entirely under
 * `prefers-reduced-motion` (a bar that grows with scroll is motion).
 */
export default function ProgressRail({ containerRef, className }: ProgressRailProps) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll(
    containerRef ? { container: containerRef } : undefined
  );
  const smooth = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.4 });

  if (reduceMotion) return null;

  return (
    <div
      className={`sticky top-0 z-30 h-0.5 w-full bg-brand-ink/10 ${className ?? ''}`}
      aria-hidden="true"
      role="presentation"
    >
      <motion.div className="h-full origin-left bg-brand-rust" style={{ scaleX: smooth }} />
    </div>
  );
}
