import { motion } from 'motion/react';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  const { loginWithGoogle } = useAuthStore();

  return (
    <section className="relative min-h-[92vh] flex items-center bg-[#f5f0eb] overflow-hidden">
      {/* German flag — bold vertical stripe on the left */}
      <div className="absolute left-0 top-0 bottom-0 w-1.5 flex flex-col">
        <div className="flex-1 bg-primary" />
        <div className="flex-1 bg-[#8b2500]" />
        <div className="flex-1 bg-[#c8956c]" />
      </div>

      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#0a0a0a 1px, transparent 1px), linear-gradient(90deg, #0a0a0a 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative w-full max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-20">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left — 7 cols */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              {/* Top label — editorial style */}
              <div className="flex items-center gap-3 mb-8">
                <div className="h-px w-12 bg-primary" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/60">
                  Plattform für Deutschlernen
                </span>
              </div>

              {/* Giant headline — editorial serif */}
              <h1 className="font-serif text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95] tracking-tight text-[#0a0a0a] mb-8">
                Belajar Bahasa<br />
                Jerman, <span className="italic text-[#8b2500]">Lebih Cepat.</span>
              </h1>

              {/* Body — clean, editorial */}
              <p className="text-lg sm:text-xl text-[#0a0a0a]/60 leading-relaxed max-w-xl mb-10 font-light">
                Tutor AI yang membantu grammar, vocabulary, speaking, dan persiapan ujian Goethe — dari A1 sampai B2.
              </p>

              {/* CTAs — sharp, minimal */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Button
                  onClick={loginWithGoogle}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-base px-10 py-6  font-bold tracking-wide transition-all group"
                >
                  Mulai Gratis
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <a
                  href="#roadmap"
                  className="inline-flex items-center justify-center gap-2 text-[#0a0a0a] hover:text-[#8b2500] font-semibold text-base px-10 py-6 border-2 border-[#0a0a0a] hover:border-[#8b2500]  transition-all"
                >
                  Lihat Kurikulum
                </a>
              </div>

              {/* Trust line — editorial style, separated by em dashes */}
              <div className="flex flex-wrap items-center gap-x-1 text-xs text-[#0a0a0a]/40 uppercase tracking-[0.15em] font-medium">
                <span>AI Tutor 24/7</span>
                <span className="text-[#c8956c]">—</span>
                <span>Exam Simulation</span>
                <span className="text-[#c8956c]">—</span>
                <span>Progress Tracking</span>
                <span className="text-[#c8956c]">—</span>
                <span>A1–B2 Roadmap</span>
              </div>
            </motion.div>
          </div>

          {/* Right — 5 cols: editorial "chat preview" */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Chat card — NOT glass, sharp editorial style */}
              <div className="st-card p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#0a0a0a]/10">
                  <div>
                    <p className="font-serif text-lg font-bold text-[#0a0a0a]">Herr Deutsch</p>
                    <p className="text-xs text-[#0a0a0a]/40 uppercase tracking-wider">AI Tutor — Online</p>
                  </div>
                  <div className="w-3 h-3 bg-[#2d8a4e] " />
                </div>

                {/* Messages */}
                <div className="space-y-4 mb-6">
                  <div className="bg-[#f5f0eb] border border-[#0a0a0a]/10 px-4 py-3 max-w-[85%]">
                    <p className="text-sm text-[#0a0a0a]">Wie sagt man &quot;terima kasih&quot; dalam bahasa Jerman?</p>
                  </div>
                  <div className="bg-primary px-4 py-3 max-w-[85%] ml-auto text-primary-foreground">
                    <p className="text-sm text-primary-foreground">Man sagt <span className="font-bold text-[#c8956c]">&quot;Danke&quot;</span></p>
                  </div>
                </div>

                {/* Level indicator — simple, editorial */}
                <div className="pt-4 border-t border-[#0a0a0a]/10">
                  <p className="text-xs text-[#0a0a0a]/40 uppercase tracking-wider mb-3 font-medium">Level Progress</p>
                  <div className="flex items-center gap-3">
                    {(['A1', 'A2', 'B1', 'B2'] as const).map((level, i) => (
                      <div key={level} className="flex items-center gap-3">
                        <div className={`w-10 h-10 flex items-center justify-center text-xs font-bold border-2 ${
                          i === 0
                            ? 'bg-primary text-primary-foreground border-[#0a0a0a]'
                            : 'bg-transparent text-[#0a0a0a]/40 border-[#0a0a0a]/20'
                        }`}>
                          {level}
                        </div>
                        {i < 3 && <div className={`w-6 h-px ${i === 0 ? 'bg-primary' : 'bg-primary/15'}`} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Floating stat — editorial style, offset */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="absolute -bottom-6 -left-6 bg-[#8b2500] text-primary-foreground px-6 py-4 "
              >
                <p className="text-2xl font-serif font-bold">1,600+</p>
                <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Kosakata</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
