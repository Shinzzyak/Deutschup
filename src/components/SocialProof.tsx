import { motion, useReducedMotion } from 'motion/react';
import { MessageSquare, BookOpen, GraduationCap, BarChart3, PenLine, Check } from 'lucide-react';
import Reveal from './Reveal';

const features = [
  { icon: MessageSquare, label: 'Tutor AI' },
  { icon: BookOpen, label: 'Kurikulum terstruktur' },
  { icon: GraduationCap, label: 'Latihan model Goethe' },
  { icon: BarChart3, label: 'Progres belajar' },
  { icon: PenLine, label: 'Koreksi tata bahasa' },
];

const method = [
  { num: '01', title: 'Tata bahasa dalam konteks', desc: 'Pelajari tata bahasa lewat contoh kalimat dan penggunaan.' },
  { num: '02', title: 'Pengulangan kosakata', desc: 'Ulangi kosakata secara berkala untuk memperkuat ingatan.' },
  { num: '03', title: 'Umpan balik AI', desc: 'Dapatkan koreksi dan penjelasan untuk jawabanmu.' },
];

export default function SocialProof() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative bg-brand-cream py-20 md:py-32">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-20">
          {/* Left — editorial quote/testimonial style */}
          <Reveal>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-12 bg-brand-ink" />
              <span className="text-xs font-bold tracking-[0.2em] text-ink-muted uppercase">
                Mengapa DeutschUp
              </span>
            </div>
            <h2 className="mb-6 font-serif text-4xl leading-[1.05] tracking-tight text-brand-ink sm:text-5xl">
              Materi dan latihan untuk{' '}
              <span className="italic text-brand-rust">belajar terarah</span>
            </h2>
            <p className="mb-8 text-lg leading-relaxed font-light text-ink-muted">
              Pilih materi, kerjakan latihan, lalu pantau progres belajarmu.
            </p>

            {/* Editorial separator */}
            <div className="mb-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-brand-ink/10" />
              <span className="text-xs font-medium tracking-wider text-ink-subtle uppercase">Fitur</span>
              <div className="h-px flex-1 bg-brand-ink/10" />
            </div>

            {/* Feature list — editorial checklist */}
            <div className="space-y-4">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.label}
                    initial={shouldReduceMotion ? false : { opacity: 0, x: -10 }}
                    whileInView={shouldReduceMotion ? undefined : { opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="group flex items-center gap-4"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-brand-ink/25 transition-colors group-hover:border-brand-ink group-hover:bg-brand-ink">
                      <Icon className="h-4 w-4 text-ink-subtle transition-colors group-hover:text-brand-cream" />
                    </div>
                    <span className="text-sm font-medium text-ink-muted transition-colors group-hover:text-brand-ink">
                      {feature.label}
                    </span>
                    <Check className="ml-auto h-3.5 w-3.5 text-brand-green opacity-0 transition-opacity group-hover:opacity-100" />
                  </motion.div>
                );
              })}
            </div>
          </Reveal>

          {/* Right — editorial stat block */}
          <Reveal y={28} delay={0.2} className="lg:pt-12">
            <div className="border-2 border-brand-ink p-8 md:p-10">
              <p className="mb-6 text-xs font-bold tracking-[0.2em] text-ink-subtle uppercase">
                Metode Pembelajaran
              </p>

              <div className="space-y-6">
                {method.map((item) => (
                  <div key={item.num} className="flex gap-4">
                    <span className="font-serif text-2xl font-bold text-ink-subtle">{item.num}</span>
                    <div>
                      <h4 className="mb-1 font-serif font-bold text-brand-ink">{item.title}</h4>
                      <p className="text-sm leading-relaxed text-ink-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom accent */}
              <div className="mt-8 border-t border-brand-ink/10 pt-6">
                <p className="text-xs font-medium tracking-wider text-ink-subtle uppercase">
                  Dirancang oleh pengembang yang memahami kebutuhan belajar bahasa Jerman.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
