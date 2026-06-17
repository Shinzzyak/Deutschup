import { motion } from 'motion/react';
import { Check } from 'lucide-react';

const levels = [
  {
    level: 'A1',
    title: 'Pemula',
    active: true,
    grammar: ['Nomen & Artikel', 'Verb-Position', 'Einfache Sätze'],
    vocab: '500+ kata',
    listening: 'Percakapan sehari-hari',
    speaking: 'Perkenalan diri',
  },
  {
    level: 'A2',
    title: 'Elementary',
    active: false,
    grammar: ['Perfekt Tense', 'Dativ/Akkusativ', 'Nebensätze'],
    vocab: '1,000+ kata',
    listening: 'Dialog pendek',
    speaking: 'Situasi sehari-hari',
  },
  {
    level: 'B1',
    title: 'Intermediate',
    active: false,
    grammar: ['Konjunktiv II', 'Passiv', 'Relativsätze'],
    vocab: '2,500+ kata',
    listening: 'Podcast & berita',
    speaking: 'Topik abstrak',
  },
  {
    level: 'B2',
    title: 'Upper-Intermediate',
    active: false,
    grammar: ['Erweiterte Satzstrukturen', 'Nominalisierung', 'Stilmittel'],
    vocab: '4,000+ kata',
    listening: 'Film & debat',
    speaking: 'Presentasi & argumen',
  },
];

export default function LearningRoadmap() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-br from-slate-50 to-indigo-50/30" id="roadmap">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">
            Roadmap Belajar{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Bahasa Jerman
            </span>
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Kurikulum terstruktur dari A1 hingga B2 — persiapan ujian Goethe.
          </p>
        </motion.div>

        {/* Desktop — Horizontal Timeline */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connecting line */}
            <div className="absolute top-12 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-200 via-purple-200 to-slate-200" />

            <div className="grid grid-cols-4 gap-6 relative">
              {levels.map((level, i) => (
                <motion.div
                  key={level.level}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="flex flex-col items-center"
                >
                  {/* Level indicator */}
                  <div
                    className={`w-24 h-24 rounded-3xl flex flex-col items-center justify-center z-10 shadow-lg transition-all ${
                      level.active
                        ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-indigo-200/50 scale-110'
                        : 'bg-white text-slate-400 shadow-slate-100 border border-slate-100'
                    }`}
                  >
                    <span className="text-2xl font-extrabold">{level.level}</span>
                    <span className={`text-xs font-medium ${level.active ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {level.title}
                    </span>
                  </div>

                  {/* Card */}
                  <div
                    className={`mt-6 w-full rounded-3xl p-5 border transition-all ${
                      level.active
                        ? 'bg-white shadow-xl shadow-indigo-100/50 border-indigo-100'
                        : 'bg-white/60 border-slate-100 hover:bg-white hover:shadow-lg hover:shadow-slate-100/50'
                    }`}
                  >
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Grammar</p>
                        <ul className="space-y-1">
                          {level.grammar.map((g) => (
                            <li key={g} className="flex items-start gap-1.5 text-sm text-slate-600">
                              <Check className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${level.active ? 'text-indigo-500' : 'text-slate-300'}`} />
                              {g}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-400">
                          <span className="font-semibold text-slate-600">{level.vocab}</span> kosakata
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile — Vertical Timeline */}
        <div className="md:hidden space-y-6">
          {levels.map((level, i) => (
            <motion.div
              key={level.level}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex gap-4"
            >
              {/* Vertical line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    level.active
                      ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-200/50'
                      : 'bg-white text-slate-400 border border-slate-200'
                  }`}
                >
                  <span className="text-sm font-bold">{level.level}</span>
                </div>
                {i < levels.length - 1 && (
                  <div className="w-0.5 flex-1 bg-gradient-to-b from-indigo-200 to-slate-200 my-1" />
                )}
              </div>

              {/* Card */}
              <div
                className={`flex-1 rounded-2xl p-4 border mb-2 ${
                  level.active
                    ? 'bg-white shadow-lg shadow-indigo-100/50 border-indigo-100'
                    : 'bg-white/60 border-slate-100'
                }`}
              >
                <p className={`text-xs font-semibold mb-2 ${level.active ? 'text-indigo-600' : 'text-slate-400'}`}>
                  {level.title}
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">Grammar:</span> {level.grammar.join(', ')}
                  </p>
                  <p className="text-sm text-slate-600">
                    <span className="font-semibold">Vocab:</span> {level.vocab}
                  </p>
                  <p className="text-sm text-slate-500">
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
