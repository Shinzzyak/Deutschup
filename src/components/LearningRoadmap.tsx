import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import Reveal from './Reveal';

const levels = [
  {
    level: 'A1',
    title: 'Pemula',
    active: true,
    grammar: ['Nomen & Artikel', 'Verb-Position', 'Einfache Sätze'],
    vocab: '500+',
    listening: 'Percakapan sehari-hari',
    speaking: 'Perkenalan diri',
  },
  {
    level: 'A2',
    title: 'Dasar',
    active: false,
    grammar: ['Perfekt Tense', 'Dativ/Akkusativ', 'Nebensätze'],
    vocab: '1,000+',
    listening: 'Dialog pendek',
    speaking: 'Situasi sehari-hari',
  },
  {
    level: 'B1',
    title: 'Menengah',
    active: false,
    grammar: ['Konjunktiv II', 'Passiv', 'Relativsätze'],
    vocab: '2,500+',
    listening: 'Podcast & berita',
    speaking: 'Topik abstrak',
  },
  {
    level: 'B2',
    title: 'Menengah Atas',
    active: false,
    grammar: ['Erweiterte Satzstrukturen', 'Nominalisierung', 'Stilmittel'],
    vocab: '4,000+',
    listening: 'Film & debat',
    speaking: 'Presentasi & argumen',
  },
];

export default function LearningRoadmap() {
  return (
    <section className="py-20 md:py-32 bg-[#f5f0eb] relative" id="roadmap">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 md:mb-24"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-12 bg-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#0a0a0a]/60">
              Kurikulum
            </span>
          </div>
          <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-[#0a0a0a] max-w-3xl">
            Kurikulum{' '}
            <span className="italic text-[#8b2500]">Bahasa Jerman</span>
          </h2>
          <p className="text-lg text-[#0a0a0a]/50 mt-4 max-w-xl font-light">
            Materi A1–B2 untuk persiapan ujian Goethe.
          </p>
        </motion.div>

        {/* Desktop — editorial table */}
        <div className="hidden md:block">
          {/* Header row */}
          <Reveal y={20} delay={0.05} className="grid grid-cols-4 gap-px bg-primary/10 mb-px">
            {levels.map((level) => (
              <div
                key={level.level}
                className={`px-6 py-4 ${level.active ? 'bg-primary' : 'bg-[#f5f0eb] text-[#0a0a0a]'}`}
              >
                <span className="font-serif text-2xl font-bold">{level.level}</span>
                <span className={`block text-xs uppercase tracking-wider mt-1 ${level.active ? 'text-primary-foreground/60' : 'text-[#0a0a0a]/40'}`}>
                  {level.title}
                </span>
              </div>
            ))}
          </Reveal>

          {/* Grammar row */}
          <Reveal y={20} delay={0.12} className="grid grid-cols-4 gap-px bg-primary/10 mb-px">
            {levels.map((level) => (
              <div
                key={`g-${level.level}`}
                className={`px-6 py-5 ${level.active ? 'bg-primary' : 'bg-[#f5f0eb]'}`}
              >
                <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${level.active ? 'text-[#c8956c]' : 'text-[#0a0a0a]/40'}`}>
                  Tata Bahasa
                </p>
                <ul className="space-y-1.5">
                  {level.grammar.map((g) => (
                    <li key={g} className="flex items-start gap-2 text-sm">
                      <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${level.active ? 'text-[#c8956c]' : 'text-[#0a0a0a]/20'}`} />
                      <span className={level.active ? 'text-primary-foreground/80' : 'text-[#0a0a0a]/60'}>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>

          {/* Vocab row */}
          <Reveal y={20} delay={0.19} className="grid grid-cols-4 gap-px bg-primary/10 mb-px">
            {levels.map((level) => (
              <div
                key={`v-${level.level}`}
                className={`px-6 py-4 ${level.active ? 'bg-primary' : 'bg-[#f5f0eb]'}`}
              >
                <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${level.active ? 'text-[#c8956c]' : 'text-[#0a0a0a]/40'}`}>
                  Kosakata
                </p>
                <p className={`font-serif text-xl font-bold ${level.active ? 'text-primary-foreground' : 'text-[#0a0a0a]'}`}>
                  {level.vocab} <span className={`text-sm font-normal ${level.active ? 'text-primary-foreground/50' : 'text-[#0a0a0a]/40'}`}>kata</span>
                </p>
              </div>
            ))}
          </Reveal>

          {/* Skills row */}
          <Reveal y={20} delay={0.26} className="grid grid-cols-4 gap-px bg-primary/10">
            {levels.map((level) => (
              <div
                key={`s-${level.level}`}
                className={`px-6 py-4 ${level.active ? 'bg-primary' : 'bg-[#f5f0eb]'}`}
              >
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${level.active ? 'text-[#c8956c]' : 'text-[#0a0a0a]/40'}`}>
                  Keterampilan
                </p>
                <p className={`text-sm ${level.active ? 'text-primary-foreground/60' : 'text-[#0a0a0a]/50'}`}>
                  {level.listening}
                </p>
                <p className={`text-sm ${level.active ? 'text-primary-foreground/60' : 'text-[#0a0a0a]/50'}`}>
                  {level.speaking}
                </p>
              </div>
            ))}
          </Reveal>
        </div>

        {/* Mobile — editorial list */}
        <div className="md:hidden">
          {levels.map((level, i) => (
            <motion.div
              key={level.level}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className={`border-t-2 border-[#0a0a0a] ${level.active ? 'bg-primary' : 'bg-[#f5f0eb]'} ${i === levels.length - 1 ? 'border-b-2' : ''}`}
            >
              <div className="px-6 py-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-serif text-3xl font-bold">{level.level}</span>
                    <span className={`ml-3 text-xs uppercase tracking-wider ${level.active ? 'text-primary-foreground/50' : 'text-[#0a0a0a]/40'}`}>
                      {level.title}
                    </span>
                  </div>
                  <span className={`font-serif text-xl font-bold ${level.active ? 'text-[#c8956c]' : 'text-[#0a0a0a]'}`}>
                    {level.vocab}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className={`text-sm ${level.active ? 'text-primary-foreground/60' : 'text-[#0a0a0a]/50'}`}>
                    <span className="font-semibold">Tata bahasa:</span> {level.grammar.join(', ')}
                  </p>
                  <p className={`text-sm ${level.active ? 'text-primary-foreground/60' : 'text-[#0a0a0a]/50'}`}>
                    {level.listening} · {level.speaking}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
