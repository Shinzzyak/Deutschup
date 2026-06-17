import { motion } from 'motion/react';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const { loginWithGoogle } = useAuthStore();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-10 md:p-16 text-center overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Siap Menguasai{' '}
              <span className="text-indigo-200">Bahasa Jerman?</span>
            </h2>
            <p className="text-lg text-indigo-100/80 max-w-xl mx-auto mb-10">
              Mulai perjalanan dari A1 hingga B2 dengan bantuan AI Tutor DeutschUp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={loginWithGoogle}
                className="bg-white text-indigo-700 hover:bg-indigo-50 text-base px-8 py-6 rounded-2xl font-bold shadow-xl shadow-indigo-900/20 transition-all group"
              >
                Mulai Gratis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <a
                href="#fitur"
                className="inline-flex items-center justify-center text-white/90 hover:text-white font-semibold text-base px-8 py-6 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 transition-all"
              >
                Lihat Dashboard Demo
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
