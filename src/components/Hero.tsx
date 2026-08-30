import { motion, useReducedMotion, type Variants } from 'motion/react';
import { Link } from 'react-router';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import Magnetic from './ui/magnetic';

/* Motion language for the hero.

   Entrance is orchestrated by the parent rather than by hand-tuned `delay`
   props on each child. That keeps the rhythm editable in one place and means
   inserting a new line can't silently desynchronise everything below it.

   Easing [0.22, 1, 0.36, 1] is the same curve used by <Reveal>, so scroll
   reveals further down the page feel like the same hand. */
const EASE = [0.22, 1, 0.36, 1] as const;

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.15 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/* Headline lines rise out from behind a clipping mask instead of merely
   fading. The mask is what makes it read as typeset rather than animated. */
const line: Variants = {
  hidden: { y: '110%' },
  show: { y: '0%', transition: { duration: 0.9, ease: EASE } },
};

const HEADLINE_LINES = [
  <>Belajar Bahasa</>,
  <>
    Jerman, <span className="italic text-brand-rust">Lebih Cepat.</span>
  </>,
];

const LEVELS = ['A1', 'A2', 'B1', 'B2'] as const;

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  // With reduced motion we skip orchestration entirely — content is present at
  // full opacity from first paint, no transform, no stagger.
  const motionProps = shouldReduceMotion
    ? {}
    : { variants: container, initial: 'hidden' as const, animate: 'show' as const };

  const childProps = shouldReduceMotion ? {} : { variants: item };

  return (
    <section className="relative flex min-h-[92svh] items-center overflow-hidden bg-brand-cream">
      {/* German flag reinterpreted as a vertical edge stripe */}
      <div className="absolute top-0 bottom-0 left-0 flex w-1.5 flex-col" aria-hidden="true">
        <div className="flex-1 bg-brand-ink" />
        <div className="flex-1 bg-brand-rust" />
        <div className="flex-1 bg-brand-tan" />
      </div>

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(var(--brand-ink) 1px, transparent 1px), linear-gradient(90deg, var(--brand-ink) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative mx-auto w-full max-w-[1400px] px-6 py-20 sm:px-10 lg:px-16">
        <div className="grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Left — 7 cols */}
          <motion.div className="lg:col-span-7" {...motionProps}>
            {/* Eyebrow */}
            <motion.div className="mb-8 flex items-center gap-3" {...childProps}>
              <div className="h-px w-12 bg-brand-rust" />
              <span className="text-xs font-bold tracking-[0.2em] text-ink-muted uppercase">
                Belajar bahasa Jerman
              </span>
            </motion.div>

            {/* Headline — one masked line at a time */}
            <h1 className="mb-8 font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-brand-ink">
              {HEADLINE_LINES.map((content, i) => (
                <span key={i} className="block overflow-hidden pb-[0.08em]">
                  <motion.span className="block" variants={shouldReduceMotion ? undefined : line}>
                    {content}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="mb-10 max-w-xl text-lg leading-relaxed font-light text-ink-muted sm:text-xl"
              {...childProps}
            >
              Latihan tata bahasa, kosakata, dan persiapan ujian Goethe untuk level A1 sampai B2.
            </motion.p>

            {/* CTAs */}
            <motion.div className="mb-12 flex flex-col gap-4 sm:flex-row" {...childProps}>
              <Magnetic glow strength={10}>
                <Button
                  render={<Link to="/sign-up" />}
                  className="group h-auto bg-brand-ink px-10 py-6 text-base font-bold tracking-wide text-brand-cream transition-colors hover:bg-brand-rust"
                >
                  Mulai Gratis
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Magnetic>

              <Magnetic strength={6}>
                <a
                  href="#roadmap"
                  className="inline-flex items-center justify-center gap-2 border-2 border-brand-ink px-10 py-6 text-base font-semibold text-brand-ink transition-colors hover:border-brand-rust hover:text-brand-rust"
                >
                  Lihat Kurikulum
                </a>
              </Magnetic>
            </motion.div>

            {/* Trust line. The separators were text-brand-tan, but brand-tan is
                the accent for DARK surfaces (7.52:1 on ink) — on this cream
                section it measured 2.33:1. brand-rust is the light-surface
                accent: 7.85:1 on cream, and it matches the rule above. */}
            <motion.div
              className="flex flex-wrap items-center gap-x-1 text-xs font-medium tracking-[0.15em] text-ink-subtle uppercase"
              {...childProps}
            >
              <span>Tutor AI</span>
              <span className="text-brand-rust">—</span>
              <span>Simulasi ujian</span>
              <span className="text-brand-rust">—</span>
              <span>Progres belajar</span>
              <span className="text-brand-rust">—</span>
              <span>Kurikulum A1–B2</span>
            </motion.div>
          </motion.div>

          {/* Right — 5 cols. Bottom padding reserves room for the offset stat
              card so it can't collide with the section below on narrow screens. */}
          <div className="pb-20 lg:col-span-5 lg:pb-0">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, x: 30 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
              className="relative"
            >
              <div className="st-card p-6 sm:p-8">
                <div className="mb-6 flex items-center justify-between border-b border-brand-ink/10 pb-4">
                  <div>
                    <p className="font-serif text-lg font-bold text-brand-ink">Herr Deutsch</p>
                    <p className="text-xs tracking-wider text-ink-subtle uppercase">Tutor AI, online</p>
                  </div>
                  <span className="relative flex h-3 w-3" aria-hidden="true">
                    {!shouldReduceMotion && (
                      <span className="absolute inline-flex h-full w-full animate-ping bg-brand-green opacity-60" />
                    )}
                    <span className="relative inline-flex h-3 w-3 bg-brand-green" />
                  </span>
                </div>

                <div className="mb-6 space-y-4">
                  <div className="max-w-[85%] border border-brand-ink/10 bg-brand-cream px-4 py-3">
                    <p className="text-sm text-brand-ink">
                      Wie sagt man &quot;terima kasih&quot; dalam bahasa Jerman?
                    </p>
                  </div>
                  <div className="ml-auto max-w-[85%] bg-brand-ink px-4 py-3">
                    <p className="text-sm text-brand-cream">
                      Man sagt <span className="font-bold text-brand-tan">&quot;Danke&quot;</span>
                    </p>
                  </div>
                </div>

                <div className="border-t border-brand-ink/10 pt-4">
                  <p className="mb-3 text-xs font-medium tracking-wider text-ink-subtle uppercase">
                    Progres level
                  </p>
                  <div className="flex items-center gap-3">
                    {LEVELS.map((level, i) => (
                      <div key={level} className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center border-2 text-xs font-bold ${
                            i === 0
                              ? 'border-brand-ink bg-brand-ink text-brand-cream'
                              : 'border-brand-ink/20 bg-transparent text-ink-subtle'
                          }`}
                        >
                          {level}
                        </div>
                        {i < LEVELS.length - 1 && (
                          <div className={`h-px w-6 ${i === 0 ? 'bg-brand-ink' : 'bg-brand-ink/15'}`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <motion.div
                initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.75, ease: EASE }}
                className="absolute -bottom-10 left-6 bg-brand-rust px-6 py-4 text-brand-cream"
              >
                <p className="font-serif text-2xl font-bold">1.600+</p>
                <p className="text-xs tracking-wider text-brand-cream/80 uppercase">Kosakata</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
