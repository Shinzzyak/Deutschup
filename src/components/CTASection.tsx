import { motion } from 'motion/react';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export default function CTASection() {
  const { loginWithGoogle } = useAuthStore();

  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-[#FFF8E1]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-br from-[#1F2937] via-slate-800 to-[#1F2937] rounded-3xl p-10 md:p-16 text-center overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-[#F2C94C]/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Siap Menguasai{' '}
              <span className="text-[#F2C94C]">Bahasa Jerman?</span>
            </h2>
            <p className="text-lg text-white/60 max-w-xl mx-auto mb-10">
              Mulai perjalanan dari A1 hingga B2 dengan bantuan AI Tutor DeutschUp.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={loginWithGoogle}
                className="bg-gradient-to-r from-[#F2C94C] to-[#E0B73A] hover:from-[#E0B73A] hover:to-[#F2C94C] text-[#1F2937] text-base px-8 py-6 rounded-2xl font-bold shadow-xl shadow-[#F2C94C]/20 transition-all group"
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
