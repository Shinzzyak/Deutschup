import { motion } from 'motion/react';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function CTASection() {
  const { loginWithGoogle } = useAuthStore();

  return (
    <section className="py-20 md:py-28 bg-white relative overflow-hidden">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh-warm pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 md:p-16 text-center overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-amber-400/10 to-transparent rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-blue-400/8 to-transparent rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-gradient-to-r from-rose-500/5 via-amber-500/5 to-transparent rounded-full blur-3xl" />
          </div>

          {/* German flag accent */}
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            <div className="flex-1 bg-slate-600" />
            <div className="flex-1 bg-red-500" />
            <div className="flex-1 bg-amber-400" />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="inline-flex items-center gap-2 bg-white/10 text-amber-300 text-sm font-semibold px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm border border-white/10"
            >
              <Sparkles className="w-4 h-4" />
              Gratis Selamanya
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight tracking-tight">
              Siap Menguasai{' '}
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                Bahasa Jerman?
              </span>
            </h2>
            <p className="text-lg text-white/50 max-w-xl mx-auto mb-10">
              Mulai perjalanan dari A1 hingga B2 dengan bantuan AI Tutor DeutschUp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={loginWithGoogle}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-base px-8 py-6 rounded-2xl font-bold shadow-xl shadow-amber-500/20 transition-all hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-0.5 group"
              >
                Mulai Gratis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <a
                href="#fitur"
                className="inline-flex items-center justify-center text-white/80 hover:text-white font-semibold text-base px-8 py-6 rounded-2xl border border-white/15 hover:border-white/30 hover:bg-white/5 transition-all"
              >
                Pelajari Lebih Lanjut
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
