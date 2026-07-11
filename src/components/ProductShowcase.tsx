import { motion } from 'motion/react';
import { MessageSquare, BookOpen, PenLine, Mic, GraduationCap, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: MessageSquare,
    title: 'Tutor AI',
    description: 'Ajukan pertanyaan tentang bahasa Jerman dan dapatkan penjelasan langsung.',
    number: '01',
  },
  {
    icon: BookOpen,
    title: 'Latihan Kosakata',
    description: 'Lebih dari 1.600 kata dengan pengulangan terjadwal.',
    number: '02',
  },
  {
    icon: PenLine,
    title: 'Koreksi Tata Bahasa',
    description: 'Periksa tata bahasa beserta penjelasan dan contoh penggunaan.',
    number: '03',
  },
  {
    icon: Mic,
    title: 'Latihan Berbicara',
    description: 'Latih pengucapan untuk percakapan sehari-hari dan situasi formal.',
    number: '04',
  },
  {
    icon: GraduationCap,
    title: 'Simulasi Ujian',
    description: 'Latihan model ujian Goethe dari A1 sampai B2 dengan hasil skor.',
    number: '05',
  },
  {
    icon: BarChart3,
    title: 'Progres Belajar',
    description: 'Lihat pelajaran selesai, hari belajar beruntun, dan pencapaian.',
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
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
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
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
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
