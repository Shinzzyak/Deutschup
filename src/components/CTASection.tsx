import { motion, useReducedMotion } from 'motion/react';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const { loginWithGoogle } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative overflow-hidden bg-brand-ink py-20 md:py-32">
      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 28 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl"
        >
          {/* Editorial label */}
          <div className="mb-8 flex items-center gap-3">
            <div className="h-px w-12 bg-brand-tan" />
            <span className="text-xs font-bold tracking-[0.2em] text-brand-tan uppercase">
              Mulai Sekarang
            </span>
          </div>

          {/* Giant headline */}
          <h2 className="mb-6 font-serif text-4xl leading-[1.05] tracking-tight text-brand-cream sm:text-5xl lg:text-6xl">
            Mulai dari A1,
            <br />
            <span className="italic text-brand-tan">sampai B2.</span>
          </h2>

          <p className="mb-10 max-w-xl text-lg leading-relaxed font-light text-cream-muted">
            Mulai dari A1, lanjutkan sesuai progresmu, dan gunakan latihan yang tersedia tanpa biaya.
          </p>

          {/* CTAs — sharp */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              onClick={loginWithGoogle}
              className="group h-auto bg-brand-tan px-10 py-6 text-base font-bold tracking-wide text-brand-ink transition-colors hover:bg-[#b8854c]"
            >
              Mulai Gratis
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <a
              href="#fitur"
              className="inline-flex items-center justify-center border border-brand-cream/30 px-10 py-6 text-base font-semibold text-brand-cream transition-colors hover:border-brand-cream/60 hover:bg-brand-cream/10"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
