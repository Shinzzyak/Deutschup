import { motion } from 'motion/react';
import { MessageSquare, BookOpen, PenLine, Mic, GraduationCap, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Tutor',
    description: 'Tanya apa saja tentang bahasa Jerman, dapatkan penjelasan instan dari AI tutor kami.',
    gradient: 'from-[#F2C94C] to-[#E0B73A]',
    span: 'md:col-span-2 md:row-span-1',
  },
  {
    icon: BookOpen,
    title: 'Vocabulary Trainer',
    description: '1,600+ kata dengan spaced repetition untuk memori jangka panjang.',
    gradient: 'from-[#D32F2F] to-[#F2C94C]',
    span: 'md:col-span-1',
  },
  {
    icon: PenLine,
    title: 'Smart Grammar',
    description: 'Koreksi instan grammar dengan penjelasan detail dan contoh penggunaan.',
    gradient: 'from-[#1F2937] to-slate-600',
    span: 'md:col-span-1',
  },
  {
    icon: Mic,
    title: 'Speaking Practice',
    description: 'Latihan pronunciation dengan feedback dari AI — dari percakapan sehari-hari hingga formal.',
    gradient: 'from-rose-500 to-orange-500',
    span: 'md:col-span-1',
  },
  {
    icon: GraduationCap,
    title: 'Exam Simulation',
    description: 'Latihan ujian Goethe-style dari A1 sampai B2 dengan skor dan rekomendasi.',
    gradient: 'from-emerald-500 to-teal-500',
    span: 'md:col-span-1',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Dashboard lengkap untuk melihat kemajuan belajar, streak, dan pencapaian.',
    gradient: 'from-amber-500 to-orange-500',
    span: 'md:col-span-2',
  },
];

export default function ProductShowcase() {
  return (
    <section className="py-20 md:py-28 bg-white" id="fitur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Semua yang Dibutuhkan untuk{' '}
            <span className="bg-gradient-to-r from-[#F2C94C] to-[#E0B73A] bg-clip-text text-transparent">
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
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`group relative bg-slate-50 hover:bg-white rounded-3xl p-6 md:p-8 border border-transparent hover:border-slate-200 hover:shadow-xl hover:shadow-slate-100/80 transition-all duration-300 ${feature.span}`}
              >
                {/* Icon */}
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>

                {/* Mini visual preview */}
                <div className={`mt-5 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 transition-opacity`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
