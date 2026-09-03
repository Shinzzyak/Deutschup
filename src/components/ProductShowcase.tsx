import { motion, useReducedMotion, type Variants } from 'motion/react';
import { MessageSquare, BookOpen, PenLine, Mic, GraduationCap, BarChart3 } from 'lucide-react';

const EASE = [0.22, 1, 0.36, 1] as const;

/* Bento layout.

   NOTE: the previous version was a uniform 3-column grid, explicitly commented
   "editorial grid, NOT bento" — so this asymmetry is a deliberate reversal of
   an earlier decision, made on request. If the flat rhythm was wanted for a
   reason, drop the `span` fields and every cell returns to equal weight.

   `span` is the desktop column span. Two features are promoted to double-width
   so the eye has somewhere to land first; the rest stay single. */
const features = [
  {
    icon: MessageSquare,
    title: 'Tutor AI',
    description:
      'Ajukan pertanyaan tentang bahasa Jerman dan dapatkan penjelasan langsung, kapan pun kamu butuh.',
    number: '01',
    span: 'lg:col-span-2',
    feature: true,
  },
  {
    icon: BookOpen,
    title: 'Latihan Kosakata',
    description: 'Lebih dari 1.600 kata dengan pengulangan terjadwal.',
    number: '02',
    span: 'lg:col-span-1',
  },
  {
    icon: PenLine,
    title: 'Koreksi Tata Bahasa',
    description: 'Periksa tata bahasa beserta penjelasan dan contoh penggunaan.',
    number: '03',
    span: 'lg:col-span-1',
  },
  {
    icon: Mic,
    title: 'Latihan Berbicara',
    description: 'Latih pengucapan untuk percakapan sehari-hari dan situasi formal.',
    number: '04',
    span: 'lg:col-span-1',
  },
  {
    icon: GraduationCap,
    title: 'Simulasi Ujian',
    description:
      'Latihan model ujian Goethe dari A1 sampai B2, lengkap dengan hasil skor dan pembahasan.',
    number: '05',
    span: 'lg:col-span-2',
    feature: true,
  },
  {
    icon: BarChart3,
    title: 'Progres Belajar',
    description: 'Lihat pelajaran selesai, hari belajar beruntun, dan pencapaian.',
    number: '06',
    span: 'lg:col-span-1',
  },
];

const grid: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const cell: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

export default function ProductShowcase() {
  const shouldReduceMotion = useReducedMotion();

  const gridProps = shouldReduceMotion
    ? {}
    : {
        variants: grid,
        initial: 'hidden' as const,
        whileInView: 'show' as const,
        viewport: { once: true, margin: '-80px' },
      };

  return (
    <section className="relative bg-brand-ink py-20 md:py-32" id="fitur">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden="true"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-16 md:mb-24"
        >
          <h2 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-brand-cream sm:text-5xl lg:text-6xl">
            Semua yang Dibutuhkan untuk{' '}
            <span className="italic text-brand-tan">Belajar Bahasa Jerman</span>
          </h2>
        </motion.div>

        {/* Bento grid — 1px gaps read as hairline rules between cells */}
        <motion.div
          className="grid gap-px bg-brand-cream/10 md:grid-cols-2 lg:grid-cols-3"
          {...gridProps}
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                variants={shouldReduceMotion ? undefined : cell}
                className={`group flex flex-col bg-brand-ink transition-colors duration-300 hover:bg-[#111] ${f.span} ${
                  f.feature ? 'p-8 md:p-12' : 'p-8 md:p-10'
                }`}
              >
                <div className="mb-6 flex items-center justify-between">
                  {/* Numerals are decorative, so they may sit below text contrast
                      minimums — but they are marked aria-hidden accordingly. */}
                  <span
                    aria-hidden="true"
                    className={`font-serif font-bold text-brand-cream/15 transition-colors group-hover:text-brand-tan/40 ${
                      f.feature ? 'text-5xl' : 'text-3xl'
                    }`}
                  >
                    {f.number}
                  </span>
                  <Icon
                    aria-hidden="true"
                    className="h-5 w-5 text-cream-subtle transition-colors group-hover:text-brand-tan"
                  />
                </div>

                <h3
                  className={`mb-3 font-serif font-bold text-brand-cream transition-colors group-hover:text-brand-tan ${
                    f.feature ? 'text-2xl md:text-3xl' : 'text-xl'
                  }`}
                >
                  {f.title}
                </h3>

                <p
                  className={`leading-relaxed text-cream-muted ${
                    f.feature ? 'max-w-md text-base' : 'text-sm'
                  }`}
                >
                  {f.description}
                </p>

                {/* Accent rule grows in from the left on hover */}
                <div className="mt-auto pt-8">
                  <div className="h-px w-full origin-left scale-x-100 bg-brand-cream/10 transition-colors duration-300 group-hover:bg-brand-tan/50" />
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
