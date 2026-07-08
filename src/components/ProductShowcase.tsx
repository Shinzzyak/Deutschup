import { motion } from 'motion/react';
import { MessageSquare, BookOpen, PenLine, Mic, GraduationCap, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'AI Tutor',
    description: 'Tanya apa saja tentang bahasa Jerman, dapatkan penjelasan instan dari AI tutor kami.',
    number: '01',
  },
  {
    icon: BookOpen,
    title: 'Vocabulary Trainer',
    description: '1,600+ kata dengan spaced repetition untuk memori jangka panjang.',
    number: '02',
  },
  {
    icon: PenLine,
    title: 'Smart Grammar',
    description: 'Koreksi instan grammar dengan penjelasan detail dan contoh penggunaan.',
    number: '03',
  },
  {
    icon: Mic,
    title: 'Speaking Practice',
    description: 'Latihan pronunciation dengan feedback dari AI — dari percakapan sehari-hari hingga formal.',
    number: '04',
  },
  {
    icon: GraduationCap,
    title: 'Exam Simulation',
    description: 'Latihan ujian Goethe-style dari A1 sampai B2 dengan skor dan rekomendasi.',
    number: '05',
  },
  {
    icon: BarChart3,
    title: 'Progress Tracking',
    description: 'Dashboard lengkap untuk melihat kemajuan belajar, streak, dan pencapaian.',
    number: '06',
  },
];

export default function ProductShowcase() {
  return (
    <section className="py-20 md:py-32 bg-primary relative" id="fitur">
      {/* Grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section header — editorial style */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-[#c8956c]" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#c8956c]">
              Fitur Unggulan
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight max-w-3xl">
            Semua yang Dibutuhkan untuk{' '}
            <span className="italic text-[#c8956c]">Belajar Bahasa Jerman</span>
          </h2>
        </motion.div>

        {/* Feature list — editorial grid, NOT bento */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-[#f5f0eb]/10">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group bg-primary p-8 md:p-10 hover:bg-[#111] transition-colors duration-300"
              >
                {/* Number + Icon */}
                <div className="flex items-center justify-between mb-6">
                  <span className="font-serif text-3xl font-bold text-primary-foreground/10 group-hover:text-[#c8956c]/30 transition-colors">
                    {feature.number}
                  </span>
                  <Icon className="w-5 h-5 text-primary-foreground/30 group-hover:text-[#c8956c] transition-colors" />
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-[#c8956c] transition-colors">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-primary-foreground/40 leading-relaxed group-hover:text-primary-foreground/60 transition-colors">
                  {feature.description}
                </p>

                {/* Bottom accent line */}
                <div className="mt-8 h-px bg-[#f5f0eb]/10 group-hover:bg-[#c8956c]/40 transition-colors" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
