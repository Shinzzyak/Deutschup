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

// Active column sits on brand-ink, the rest on brand-cream. Every pairing below
// uses the measured text ramps (ink-muted / cream-muted …) instead of opacity
// modifiers, which is what dropped these labels under AA.
const cellBg = (active: boolean) => (active ? 'bg-brand-ink' : 'bg-brand-cream');
const bodyText = (active: boolean) => (active ? 'text-cream-muted' : 'text-ink-muted');
const labelText = (active: boolean) => (active ? 'text-brand-tan' : 'text-ink-subtle');

export default function LearningRoadmap() {
  return (
    <section className="relative bg-brand-cream py-20 md:py-32" id="roadmap">
      <div className="mx-auto max-w-[1400px] px-6 sm:px-10 lg:px-16">
        {/* Section header */}
        <Reveal y={0} className="mb-16 md:mb-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-px w-12 bg-brand-ink" />
            <span className="text-xs font-bold tracking-[0.2em] text-ink-muted uppercase">
              Kurikulum
            </span>
          </div>
          <h2 className="max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight text-brand-ink sm:text-5xl lg:text-6xl">
            Kurikulum{' '}
            <span className="italic text-brand-rust">Bahasa Jerman</span>
          </h2>
          <p className="mt-4 max-w-xl text-lg font-light text-ink-muted">
            Materi A1–B2 untuk persiapan ujian Goethe.
          </p>
        </Reveal>

        {/* Desktop — editorial table */}
        <div className="hidden md:block">
          {/* Header row */}
          <Reveal y={20} delay={0.05} className="mb-px grid grid-cols-4 gap-px bg-brand-ink/10">
            {levels.map((level) => (
              <div
                key={level.level}
                className={`px-4 py-4 lg:px-6 ${cellBg(level.active)} ${level.active ? 'text-brand-cream' : 'text-brand-ink'}`}
              >
                <span className="font-serif text-2xl font-bold">{level.level}</span>
                <span className={`mt-1 block text-xs tracking-wider uppercase ${bodyText(level.active)}`}>
                  {level.title}
                </span>
              </div>
            ))}
          </Reveal>

          {/* Grammar row */}
          <Reveal y={20} delay={0.12} className="mb-px grid grid-cols-4 gap-px bg-brand-ink/10">
            {levels.map((level) => (
              <div
                key={`g-${level.level}`}
                className={`px-4 py-5 lg:px-6 ${cellBg(level.active)}`}
              >
                <p className={`mb-3 text-xs font-bold tracking-wider uppercase ${labelText(level.active)}`}>
                  Tata Bahasa
                </p>
                <ul className="space-y-1.5">
                  {level.grammar.map((g) => (
                    <li key={g} className="flex items-start gap-2 text-sm">
                      <Check className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${level.active ? 'text-brand-tan' : 'text-ink-subtle'}`} />
                      <span className={bodyText(level.active)}>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </Reveal>

          {/* Vocab row */}
          <Reveal y={20} delay={0.19} className="mb-px grid grid-cols-4 gap-px bg-brand-ink/10">
            {levels.map((level) => (
              <div
                key={`v-${level.level}`}
                className={`px-4 py-4 lg:px-6 ${cellBg(level.active)}`}
              >
                <p className={`mb-1 text-xs font-bold tracking-wider uppercase ${labelText(level.active)}`}>
                  Kosakata
                </p>
                <p className={`font-serif text-xl font-bold ${level.active ? 'text-brand-cream' : 'text-brand-ink'}`}>
                  {level.vocab} <span className={`text-sm font-normal ${bodyText(level.active)}`}>kata</span>
                </p>
              </div>
            ))}
          </Reveal>

          {/* Skills row */}
          <Reveal y={20} delay={0.26} className="grid grid-cols-4 gap-px bg-brand-ink/10">
            {levels.map((level) => (
              <div
                key={`s-${level.level}`}
                className={`px-4 py-4 lg:px-6 ${cellBg(level.active)}`}
              >
                <p className={`mb-2 text-xs font-bold tracking-wider uppercase ${labelText(level.active)}`}>
                  Keterampilan
                </p>
                <p className={`text-sm ${bodyText(level.active)}`}>{level.listening}</p>
                <p className={`text-sm ${bodyText(level.active)}`}>{level.speaking}</p>
              </div>
            ))}
          </Reveal>
        </div>

        {/* Mobile — editorial list */}
        <div className="md:hidden">
          {levels.map((level, i) => (
            <Reveal
              key={level.level}
              y={0}
              delay={i * 0.08}
              className={`border-t-2 border-brand-ink ${cellBg(level.active)} ${
                level.active ? 'text-brand-cream' : 'text-brand-ink'
              } ${i === levels.length - 1 ? 'border-b-2' : ''}`}
            >
              <div className="px-6 py-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-serif text-3xl font-bold">{level.level}</span>
                    <span className={`ml-3 text-xs tracking-wider uppercase ${bodyText(level.active)}`}>
                      {level.title}
                    </span>
                  </div>
                  <span className={`shrink-0 font-serif text-xl font-bold ${level.active ? 'text-brand-tan' : 'text-brand-ink'}`}>
                    {level.vocab}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className={`text-sm ${bodyText(level.active)}`}>
                    <span className="font-semibold">Tata bahasa:</span> {level.grammar.join(', ')}
                  </p>
                  <p className={`text-sm ${bodyText(level.active)}`}>
                    {level.listening} · {level.speaking}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
