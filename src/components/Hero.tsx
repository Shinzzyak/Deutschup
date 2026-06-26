import { motion } from 'motion/react';
import { useAuthStore } from '../stores/authStore';
import { Button } from './ui/button';
import { MessageSquare, BookOpen, BarChart3, Check, Sparkles, ArrowRight, Zap } from 'lucide-react';

export default function Hero() {
  const { loginWithGoogle } = useAuthStore();

  return (
    <section className="relative overflow-hidden bg-mesh-blue pt-24 pb-20 md:pt-32 md:pb-28">
      {/* Ambient glow orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-amber-200/20 via-yellow-100/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute -bottom-60 -left-40 w-[400px] h-[400px] bg-gradient-to-tr from-blue-200/15 via-indigo-100/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-rose-100/8 via-amber-100/8 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Text */}
          <div className="max-w-xl">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2.5 glass-strong text-sm font-semibold px-4 py-2 rounded-full mb-8 shadow-sm">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gradient-to-br from-amber-400 to-amber-500">
                  <Sparkles className="w-3 h-3 text-white" />
                </span>
                <span className="text-slate-700">AI-Powered German Learning</span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              </div>

              {/* Headline */}
              <h1 className="text-[2.75rem] sm:text-[3.5rem] lg:text-[4rem] font-extrabold tracking-tight text-slate-900 leading-[1.05] mb-6">
                Belajar Bahasa Jerman{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
                    Lebih Cepat
                  </span>
                  <svg className="absolute -bottom-1 left-0 w-full h-3 text-amber-300/40" viewBox="0 0 200 8" fill="none">
                    <path d="M2 6C40 2 100 2 198 6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </span>
              </h1>

              {/* Subheadline */}
              <p className="text-lg sm:text-xl text-slate-500 leading-relaxed mb-10 max-w-lg">
                Tutor AI yang membantu grammar, vocabulary, speaking, dan persiapan ujian Goethe dari{' '}
                <span className="font-semibold text-slate-700">A1 sampai B2</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Button
                  onClick={loginWithGoogle}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-base px-8 py-6 rounded-2xl font-bold shadow-lg shadow-amber-500/25 transition-all hover:shadow-xl hover:shadow-amber-500/30 hover:-translate-y-0.5 group"
                >
                  Mulai Gratis
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <a
                  href="#roadmap"
                  className="inline-flex items-center justify-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-base px-8 py-6 rounded-2xl glass hover:bg-white/90 transition-all hover:-translate-y-0.5"
                >
                  <Zap className="w-4 h-4" />
                  Lihat Kurikulum
                </a>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {['AI Tutor 24/7', 'Exam Simulation', 'Progress Tracking', 'A1–B2 Roadmap'].map((badge, i) => (
                  <motion.span
                    key={badge}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.1 }}
                    className="flex items-center gap-2 text-sm text-slate-500"
                  >
                    <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-100">
                      <Check className="w-2.5 h-2.5 text-emerald-600" />
                    </span>
                    {badge}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right — Floating Glass Cards */}
          <div className="relative h-[420px] sm:h-[500px] lg:h-[540px]">
            {/* Card 1 — AI Tutor Chat */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-0 right-0 sm:right-8 w-[280px] sm:w-[300px] glass-strong rounded-3xl p-5 shadow-xl shadow-slate-900/5 card-hover"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/20">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Herr Deutsch</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-xs text-slate-400">Online sekarang</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-amber-50 rounded-2xl rounded-tl-sm p-3.5 text-sm text-slate-700 max-w-[85%] border border-amber-100">
                  Wie sagt man "terima kasih" dalam bahasa Jerman?
                </div>
                <div className="bg-slate-100/80 rounded-2xl rounded-tr-sm p-3.5 text-sm text-slate-700 ml-auto max-w-[85%]">
                  Man sagt <span className="font-bold text-amber-600">"Danke"</span> 🇩🇪
                </div>
              </div>
            </motion.div>

            {/* Card 2 — Vocabulary Progress */}
            <motion.div
              initial={{ opacity: 0, x: -20, y: 40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="absolute top-32 left-0 sm:left-4 w-[240px] sm:w-[260px] glass-strong rounded-3xl p-5 shadow-xl shadow-slate-900/5 card-hover"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-red-500 rounded-xl flex items-center justify-center shadow-md shadow-rose-500/20">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Vocabulary</p>
                  <p className="text-xs text-slate-400">Level A2</p>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Progress</span>
                  <span className="font-bold text-emerald-600">78%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '78%' }}
                    transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-400">1,247 / 1,600 kata</p>
            </motion.div>

            {/* Card 3 — Learning Path */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-4 right-4 sm:right-12 w-[260px] sm:w-[280px] glass-strong rounded-3xl p-5 shadow-xl shadow-slate-900/5 card-hover"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-md shadow-slate-900/20">
                  <BarChart3 className="w-5 h-5 text-amber-400" />
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
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        i <= 1
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-amber-500/20'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {level}
                    </div>
                    {i < 3 && (
                      <div className={`w-4 h-0.5 rounded-full ${i < 1 ? 'bg-amber-300' : 'bg-slate-200'}`} />
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
