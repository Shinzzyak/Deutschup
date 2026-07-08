import { motion } from 'motion/react';
import { MessageSquare, BookOpen, GraduationCap, BarChart3, PenLine, Check } from 'lucide-react';

const features = [
  { icon: MessageSquare, label: 'AI Tutor' },
  { icon: BookOpen, label: 'Structured Curriculum' },
  { icon: GraduationCap, label: 'Goethe-style Learning' },
  { icon: BarChart3, label: 'Progress Tracking' },
  { icon: PenLine, label: 'Smart Corrections' },
];

export default function SocialProof() {
  return (
    <section className="py-20 md:py-32 bg-[#f5f0eb] relative">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left — editorial quote/testimonial style */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-primary" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/60">
                Mengapa DeutschUp
              </span>
            </div>
            <h2 className="font-serif text-4xl sm:text-5xl leading-[1.05] tracking-tight text-[#0a0a0a] mb-6">
              Dirancang untuk{' '}
              <span className="italic text-[#8b2500]">Hasil Nyata</span>
            </h2>
            <p className="text-lg text-[#0a0a0a]/50 leading-relaxed font-light mb-8">
              Fitur yang benar-benar membantu kamu belajar — bukan janji kosong.
            </p>

            {/* Editorial separator */}
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1 bg-primary/10" />
              <span className="text-xs text-[#0a0a0a]/30 uppercase tracking-wider font-medium">Fitur</span>
              <div className="h-px flex-1 bg-primary/10" />
            </div>

            {/* Feature list — editorial checklist */}
            <div className="space-y-4">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.label}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                    className="flex items-center gap-4 group"
                  >
                    <div className="w-8 h-8 border border-[#0a0a0a]/15 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:border-[#0a0a0a] transition-all">
                      <Icon className="w-4 h-4 text-[#0a0a0a]/40 group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <span className="text-sm font-medium text-[#0a0a0a]/70 group-hover:text-[#0a0a0a] transition-colors">
                      {feature.label}
                    </span>
                    <Check className="w-3.5 h-3.5 text-[#2d8a4e] ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right — editorial stat block */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:pt-12"
          >
            <div className="border-2 border-[#0a0a0a] p-8 md:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/40 mb-6">
                Metode Pembelajaran
              </p>

              <div className="space-y-6">
                {[
                  { num: '01', title: 'Grammar in Context', desc: 'Belajar tata bahasa melalui konteks nyata, bukan hafalan kaku.' },
                  { num: '02', title: 'Spaced Repetition', desc: 'Kosakata diulang pada interval optimal untuk memori jangka panjang.' },
                  { num: '03', title: 'AI-Powered Feedback', desc: 'Koreksi instan dengan penjelasan yang dipersonalisasi untuk siswa Indonesia.' },
                ].map((item, i) => (
                  <div key={item.num} className="flex gap-4">
                    <span className="font-serif text-2xl font-bold text-[#0a0a0a]/10">{item.num}</span>
                    <div>
                      <h4 className="font-serif font-bold text-[#0a0a0a] mb-1">{item.title}</h4>
                      <p className="text-sm text-[#0a0a0a]/50 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom accent */}
              <div className="mt-8 pt-6 border-t border-[#0a0a0a]/10">
                <p className="text-xs text-[#0a0a0a]/30 uppercase tracking-wider font-medium">
                  Dirancang oleh pengembang yang memahami kebutuhan belajar bahasa Jerman.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
