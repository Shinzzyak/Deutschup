import { motion } from 'motion/react';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { MessageSquare, BookOpen, BarChart3, Check } from 'lucide-react';

export default function Hero() {
  const { loginWithGoogle } = useAuthStore();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-[#FFF8E1]/30 to-white pt-24 pb-16 md:pt-32 md:pb-24">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#F2C94C]/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#F2C94C]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left — Text */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 bg-[#FFF8E1] text-[#1F2937] text-sm font-semibold px-4 py-1.5 rounded-full mb-6 border border-[#F2C94C]/30">
                <span className="w-2 h-2 bg-[#F2C94C] rounded-full animate-pulse" />
                AI-Powered Learning
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#1F2937] leading-[1.1] mb-6">
                Belajar Bahasa Jerman{' '}
                <span className="bg-gradient-to-r from-[#F2C94C] to-[#E0B73A] bg-clip-text text-transparent">
                  Lebih Cepat
                </span>
              </h1>

              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Tutor AI yang membantu grammar, vocabulary, speaking, dan persiapan ujian Goethe dari A1 sampai B2.
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <Button
                  onClick={loginWithGoogle}
                  className="bg-gradient-to-r from-[#F2C94C] to-[#E0B73A] hover:from-[#E0B73A] hover:to-[#F2C94C] text-[#1F2937] text-base px-8 py-6 rounded-2xl font-bold shadow-lg shadow-[#F2C94C]/30 transition-all"
                >
                  Mulai Gratis
                </Button>
                <a
                  href="#roadmap"
                  className="inline-flex items-center justify-center text-slate-600 hover:text-slate-900 font-semibold text-base px-8 py-6 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all"
                >
                  Lihat Kurikulum
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
                {['AI Tutor', 'Exam Simulation', 'Progress Tracking', 'A1–B2 Roadmap'].map((badge) => (
                  <span key={badge} className="flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#F2C94C]" />
                    {badge}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — Floating Cards Mockup */}
          <div className="relative h-[400px] sm:h-[480px] lg:h-[520px]">
            {/* Card 1 — AI Tutor Chat */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute top-0 right-0 sm:right-8 w-[280px] sm:w-[300px] bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-xl shadow-[#F2C94C]/15 border border-white/60"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-[#F2C94C] to-[#E0B73A] rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#1F2937]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">AI Tutor</p>
                  <p className="text-xs text-slate-400">Online sekarang</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-[#FFF8E1] rounded-2xl rounded-tl-sm p-3 text-sm text-slate-700 max-w-[85%] border border-[#F2C94C]/20">
                  Wie sagt man "terima kasih" dalam bahasa Jerman?
                </div>
                <div className="bg-slate-100 rounded-2xl rounded-tr-sm p-3 text-sm text-slate-700 ml-auto max-w-[85%]">
                  Man sagt <span className="font-semibold text-[#1F2937]">"Danke"</span> 🇩🇪
                </div>
              </div>
            </motion.div>

            {/* Card 2 — Vocabulary Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="absolute top-32 left-0 sm:left-4 w-[240px] sm:w-[260px] bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-xl shadow-[#F2C94C]/10 border border-white/60"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-[#D32F2F] to-[#F2C94C] rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Vocabulary</p>
                  <p className="text-xs text-slate-400">Level A2</p>
                </div>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-slate-500 mb-1">
                  <span>Progress</span>
                  <span className="font-semibold text-[#1F2937]">78%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full w-[78%] bg-gradient-to-r from-[#F2C94C] to-[#E0B73A] rounded-full" />
                </div>
              </div>
              <p className="text-xs text-slate-400">1,247 / 1,600 kata</p>
            </motion.div>

            {/* Card 3 — Learning Path */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute bottom-4 right-4 sm:right-12 w-[260px] sm:w-[280px] bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-xl shadow-slate-100/50 border border-white/60"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-[#1F2937] to-slate-700 rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-[#F2C94C]" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Learning Path</p>
                  <p className="text-xs text-slate-400">Roadmap kamu</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(['A1', 'A2', 'B1', 'B2'] as const).map((level, i) => (
                  <div key={level} className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
                        i <= 1
                          ? 'bg-gradient-to-br from-[#F2C94C] to-[#E0B73A] text-[#1F2937] shadow-md shadow-[#F2C94C]/30'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {level}
                    </div>
                    {i < 3 && (
                      <div className={`w-4 h-0.5 ${i < 1 ? 'bg-[#F2C94C]/60' : 'bg-slate-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
