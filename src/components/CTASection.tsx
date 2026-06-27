import { motion } from 'motion/react';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const { loginWithGoogle } = useAuthStore();

  return (
    <section className="py-20 md:py-32 bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-3xl"
        >
          {/* Editorial label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-12 bg-[#c8956c]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8956c]">
              Mulai Sekarang
            </span>
          </div>

          {/* Giant headline */}
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight mb-6">
            Siap Menguasai<br />
            <span className="italic text-[#c8956c]">Bahasa Jerman?</span>
          </h2>

          <p className="text-lg text-white/40 leading-relaxed mb-10 max-w-xl font-light">
            Mulai perjalanan dari A1 hingga B2 dengan bantuan AI Tutor DeutschUp. Gratis selamanya.
          </p>

          {/* CTAs — sharp */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={loginWithGoogle}
              className="bg-[#c8956c] hover:bg-[#b8854c] text-white text-base px-10 py-6 rounded-none font-bold tracking-wide transition-all group"
            >
              Mulai Gratis
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <a
              href="#fitur"
              className="inline-flex items-center justify-center text-white/60 hover:text-white font-semibold text-base px-10 py-6 border border-white/20 hover:border-white/40 rounded-none transition-all"
            >
              Pelajari Lebih Lanjut
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
