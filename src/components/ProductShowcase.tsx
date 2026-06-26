import { motion } from 'motion/react';
import { MessageSquare, BookOpen, PenLine, Mic, GraduationCap, BarChart3, ArrowUpRight } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Tutor',
    description: 'Tanya apa saja tentang bahasa Jerman, dapatkan penjelasan instan dari AI tutor kami.',
    gradient: 'from-amber-400 to-orange-500',
    bgGlow: 'bg-amber-50',
    span: 'md:col-span-2 md:row-span-1',
  },
  {
    icon: BookOpen,
    title: 'Vocabulary Trainer',
    description: '1,600+ kata dengan spaced repetition untuk memori jangka panjang.',
    gradient: 'from-rose-500 to-red-500',
    bgGlow: 'bg-rose-50',
    span: 'md:col-span-1',
  },
  {
    icon: PenLine,
    title: 'Smart Grammar',
    description: 'Koreksi instan grammar dengan penjelasan detail dan contoh penggunaan.',
    gradient: 'from-slate-700 to-slate-900',
    bgGlow: 'bg-slate-50',
    span: 'md:col-span-1',
  },
  {
    icon: Mic,
    title: 'Speaking Practice',
    description: 'Latihan pronunciation dengan feedback dari AI.',
    gradient: 'from-pink-500 to-rose-500',
    bgGlow: 'bg-pink-50',
    span: 'md:col-span-1',
  },
  {
    icon: GraduationCap,
    title: 'Exam Simulation',
    description: 'Latihan ujian Goethe-style dari A1 sampai B2 dengan skor dan rekomendasi.',
    gradient: 'from-emerald-500 to-teal-500',
    bgGlow: 'bg-emerald-50',
    span: 'md:col-span-1',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Dashboard lengkap untuk melihat kemajuan belajar, streak, dan pencapaian.',
    gradient: 'from-amber-500 to-orange-500',
    bgGlow: 'bg-amber-50',
    span: 'md:col-span-2',
  },
];

export default function ProductShowcase() {
  return (
    <section className="py-20 md:py-28 bg-white relative" id="fitur">
      {/* Subtle top fade */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-slate-50/50 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full mb-4">
            Fitur Unggulan
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Semua yang Dibutuhkan untuk{' '}
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Belajar Bahasa Jerman
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Fitur lengkap yang dirancang untuk membantu kamu mencapai level B2 dengan efektif.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={`group relative ${feature.bgGlow} hover:bg-white rounded-3xl p-6 md:p-8 border border-transparent hover:border-slate-200/80 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 cursor-pointer card-hover ${feature.span}`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg shadow-slate-900/10`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
                  {feature.title}
                  <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>

                {/* Decorative gradient bar */}
                <div className={`mt-6 h-1 w-16 rounded-full bg-gradient-to-r ${feature.gradient} opacity-20 group-hover:opacity-40 group-hover:w-24 transition-all duration-300`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
