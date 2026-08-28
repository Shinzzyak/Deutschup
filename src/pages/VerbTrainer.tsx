import { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Check,
  X,
  RotateCcw,
  Shuffle,
  ArrowRight,
  ArrowLeft,
  PenLine,
  Trophy,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { verbDatabase, VerbConjugation } from '../data/verbs';
import { getAllVocab } from '../lib/lessons-db';
import type { VocabWord } from '../data/course';

/* ------------------------------------------------------------------
   Decision on the orphaned quiz engine (was ~90 lines of state and
   handlers that nothing rendered): CONNECTED, not deleted.

   Reason: conjugation drill is the reason this page exists — the
   onboarding flow sends "Percakapan" learners here under the label
   "Latihan Kata Kerja". A read-only conjugation table teaches
   recognition; only typing the forms teaches production. The engine was
   already 90% correct, so wiring it costs far less than the feature is
   worth. What it was missing is now supplied: a way in, a tense choice,
   per-blank feedback, a result screen, and a way to go again.

   The duplicated pair handleCheckAnswers/handleQuizCheck is gone. There
   is one queue and one grader; a single-verb drill is just a queue of
   length one.
   ------------------------------------------------------------------ */

type Tense = 'present' | 'prateritum' | 'perfekt';
type TypeFilter = 'all' | 'irregular' | 'regular';

const TENSES: { id: Tense; german: string; indonesian: string }[] = [
  { id: 'present', german: 'Präsens', indonesian: 'bentuk sekarang' },
  { id: 'prateritum', german: 'Präteritum', indonesian: 'bentuk lampau' },
  { id: 'perfekt', german: 'Perfekt', indonesian: 'lampau percakapan' },
];

const PRONOUNS = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie'] as const;

const QUIZ_SIZE = 10;
/** allVocab is ~2.000 entries. Rendering every match froze the page on short
 *  queries, so matches are counted in full but drawn in a slice. */
const DICTIONARY_LIMIT = 24;

/* Editorial palette — brand tokens only. The old page mixed raw blue-500 /
   red-500 / green-500 gender chips with white text (2.28:1 for `das`) and
   red-100/green-100 type pills, none of which existed on the landing page. */

/** der/die/das plate. The article is printed inside it, so the colour is a
 *  memory aid, never the sole carrier of meaning.
 *  Measured: ink/cream 17.48:1 · rust/cream 7.85:1 · tan/ink 7.52:1 */
const articlePlate: Record<string, string> = {
  der: 'bg-brand-ink text-brand-cream',
  die: 'bg-brand-rust text-brand-cream',
  das: 'bg-brand-tan text-brand-ink',
};

const FIELD =
  'w-full border border-ink-subtle bg-white px-3 py-2.5 text-sm text-brand-ink ' +
  'placeholder:text-ink-subtle focus:border-brand-rust focus:outline-none ' +
  'focus:ring-2 focus:ring-brand-rust/30';

const EYEBROW = 'text-[10px] font-bold uppercase tracking-[0.16em]';

const BTN_SOLID =
  'inline-flex items-center justify-center gap-2 bg-brand-ink px-4 py-2.5 text-xs font-bold ' +
  'uppercase tracking-[0.12em] text-brand-cream transition-colors hover:bg-brand-rust ' +
  'disabled:cursor-not-allowed disabled:opacity-50';

const BTN_OUTLINE =
  'inline-flex items-center justify-center gap-2 border border-ink-subtle px-4 py-2.5 text-xs ' +
  'font-bold uppercase tracking-[0.12em] text-brand-ink transition-colors hover:bg-brand-ink ' +
  'hover:text-brand-cream disabled:cursor-not-allowed disabled:opacity-50';

/** Accepts the ae/oe/ue/ss transliterations, because most Indonesian keyboards
 *  have no umlaut keys. Dropping the umlaut entirely is still counted wrong —
 *  that is a real spelling error, not a keyboard limitation. */
function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

type Blank = { key: string; label: string; answer: string };

function blanksFor(verb: VerbConjugation, tense: Tense): Blank[] {
  if (tense === 'present') {
    return PRONOUNS.map((p) => ({ key: p, label: p, answer: verb.present[p] }));
  }
  if (tense === 'prateritum') {
    return (Object.keys(verb.prateritum) as (keyof VerbConjugation['prateritum'])[]).map((p) => ({
      key: p,
      label: p,
      answer: verb.prateritum[p],
    }));
  }
  return [{ key: 'perfekt', label: 'Partizip II (lengkap dengan haben/sein)', answer: verb.perfekt }];
}

function shuffled<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function TypeTag({ type }: { type: VerbConjugation['type'] }) {
  return (
    <span
      className={cn(
        'inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]',
        type === 'irregular'
          ? 'bg-brand-rust text-brand-cream' /* 7.85:1 */
          : 'border border-brand-ink/25 text-ink-muted' /* 6.14:1 on cream */,
      )}
    >
      {type === 'irregular' ? 'tidak beraturan' : 'beraturan'}
    </span>
  );
}

/** Read-only conjugation table, shared by the browse detail and the answer key. */
function ConjugationTable({ verb }: { verb: VerbConjugation }) {
  return (
    <div className="grid gap-px bg-brand-ink/15 md:grid-cols-3">
      <div className="bg-brand-cream p-4">
        <h4 className={cn(EYEBROW, 'text-ink-subtle')}>Präsens · sekarang</h4>
        <dl className="mt-3 space-y-1.5">
          {PRONOUNS.map((p) => (
            <div key={p} className="flex items-baseline justify-between gap-3 border-b border-brand-ink/10 pb-1.5 last:border-0">
              <dt className="text-sm text-ink-muted">{p}</dt>
              <dd className="text-sm font-bold text-brand-ink">{verb.present[p]}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="bg-brand-cream p-4">
        <h4 className={cn(EYEBROW, 'text-ink-subtle')}>Präteritum · lampau</h4>
        <dl className="mt-3 space-y-1.5">
          {(Object.keys(verb.prateritum) as (keyof VerbConjugation['prateritum'])[]).map((p) => (
            <div key={p} className="flex items-baseline justify-between gap-3 border-b border-brand-ink/10 pb-1.5 last:border-0">
              <dt className="text-sm text-ink-muted">{p}</dt>
              <dd className="text-sm font-bold text-brand-ink">{verb.prateritum[p]}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 font-serif text-xs italic text-ink-muted">
          Bentuk untuk subjek lain mengikuti pola yang sama.
        </p>
      </div>

      <div className="bg-brand-cream p-4">
        <h4 className={cn(EYEBROW, 'text-ink-subtle')}>Perfekt · lampau percakapan</h4>
        <p className="mt-3 font-serif text-2xl text-brand-ink">{verb.perfekt}</p>
        <p className="mt-2 text-xs text-ink-muted">
          Bentuk inilah yang paling sering dipakai orang Jerman saat bercerita.
        </p>
      </div>
    </div>
  );
}

export default function VerbTrainer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedVerb, setSelectedVerb] = useState<VerbConjugation | null>(null);

  // Practice engine
  const [practicing, setPracticing] = useState(false);
  const [queue, setQueue] = useState<VerbConjugation[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [tense, setTense] = useState<Tense>('present');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [finished, setFinished] = useState(false);

  // Dictionary vocab loads from the DB (lessons-db) — same index search uses.
  const [allVocab, setAllVocab] = useState<VocabWord[]>([]);
  useEffect(() => {
    let alive = true;
    getAllVocab().then(v => { if (alive) setAllVocab(v); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  const query = searchTerm.trim().toLowerCase();

  const visibleVerbs = useMemo(() => {
    return verbDatabase.filter((v) => {
      if (typeFilter !== 'all' && v.type !== typeFilter) return false;
      if (!query) return true;
      return (
        v.infinitive.toLowerCase().includes(query) || v.translation.toLowerCase().includes(query)
      );
    });
  }, [query, typeFilter]);

  const dictionary = useMemo(() => {
    if (query.length < 2) return { items: [] as VocabWord[], total: 0 };
    const matches = allVocab.filter(
      (v) => v.word.toLowerCase().includes(query) || v.translation.toLowerCase().includes(query),
    );
    return { items: matches.slice(0, DICTIONARY_LIMIT), total: matches.length };
  }, [query]);

  const startPractice = (verbs: VerbConjugation[], nextTense: Tense) => {
    if (verbs.length === 0) return;
    setQueue(verbs);
    setQueueIndex(0);
    setTense(nextTense);
    setAnswers({});
    setChecked(false);
    setScore({ correct: 0, total: 0 });
    setFinished(false);
    setPracticing(true);
  };

  const currentVerb = queue[queueIndex];
  const blanks = currentVerb ? blanksFor(currentVerb, tense) : [];

  const checkAnswers = () => {
    if (!currentVerb || checked) return;
    const correct = blanks.reduce(
      (acc, b) => acc + (normalize(answers[b.key] || '') === normalize(b.answer) ? 1 : 0),
      0,
    );
    setScore((prev) => ({ correct: prev.correct + correct, total: prev.total + blanks.length }));
    setChecked(true);
  };

  const goNext = () => {
    if (queueIndex < queue.length - 1) {
      setQueueIndex((i) => i + 1);
      setAnswers({});
      setChecked(false);
    } else {
      setFinished(true);
    }
  };

  const repeatSameSet = () => startPractice(queue, tense);
  const newRandomSet = () => startPractice(shuffled(verbDatabase).slice(0, QUIZ_SIZE), tense);
  const exitPractice = () => {
    setPracticing(false);
    setFinished(false);
  };

  /* ================================================================
     PRACTICE — result screen
     ================================================================ */
  if (practicing && finished) {
    const percent = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const verdict =
      percent >= 85
        ? 'Mantap. Bentuk-bentuk ini sudah kamu kuasai.'
        : percent >= 60
          ? 'Sudah lumayan. Ulangi sekali lagi supaya makin lekat.'
          : 'Belum stabil. Baca dulu tabel konjugasinya, lalu coba lagi.';

    return (
      <div className="mx-auto max-w-3xl pb-10">
        <div className="border-2 border-brand-ink bg-brand-cream px-6 py-12 text-center">
          <Trophy className="mx-auto h-9 w-9 text-brand-rust" aria-hidden="true" />
          <p className={cn(EYEBROW, 'mt-4 text-ink-subtle')}>Hasil latihan konjugasi</p>
          <p className="mt-2 font-serif text-6xl leading-none text-brand-ink">{percent}%</p>
          <p className="mt-3 text-sm text-ink-muted">
            <span className="font-bold text-brand-ink">{score.correct}</span> jawaban benar dari{' '}
            <span className="font-bold text-brand-ink">{score.total}</span> soal ·{' '}
            {queue.length} verba · {TENSES.find((t) => t.id === tense)?.german}
          </p>
          <p className="mx-auto mt-4 max-w-md font-serif text-lg italic text-brand-rust">{verdict}</p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button type="button" className={BTN_SOLID} onClick={repeatSameSet}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Ulangi verba yang sama
            </button>
            {queue.length > 1 && (
              <button type="button" className={BTN_OUTLINE} onClick={newRandomSet}>
                <Shuffle className="h-3.5 w-3.5" aria-hidden="true" />
                Verba acak baru
              </button>
            )}
            <button type="button" className={BTN_OUTLINE} onClick={exitPractice}>
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              Kembali ke daftar
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ================================================================
     PRACTICE — drill screen
     ================================================================ */
  if (practicing && currentVerb) {
    const tenseMeta = TENSES.find((t) => t.id === tense);
    return (
      <div className="mx-auto max-w-3xl pb-10">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-brand-ink pb-3">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="h-px w-8 bg-brand-rust" />
            <span className={cn(EYEBROW, 'text-ink-subtle')}>
              Latihan konjugasi · {tenseMeta?.german}
            </span>
          </div>
          <span className={cn(EYEBROW, 'text-ink-subtle')}>
            Verba {queueIndex + 1} dari {queue.length}
          </span>
        </div>

        {/* Session progress. The number is written out as well, so the bar is
            decoration and never the only source of the information. */}
        <div aria-hidden="true" className="mt-2 h-1 w-full bg-brand-ink/10">
          <div
            className="h-full bg-brand-rust transition-all duration-300"
            style={{ width: `${((queueIndex + (checked ? 1 : 0)) / queue.length) * 100}%` }}
          />
        </div>

        <div className="mt-4 border border-brand-ink/15 bg-brand-cream">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b-2 border-brand-ink px-4 py-3">
            <div>
              <h1 className="font-serif text-3xl leading-none text-brand-ink">{currentVerb.infinitive}</h1>
              <p className="mt-1 text-sm text-ink-muted">{currentVerb.translation}</p>
            </div>
            <TypeTag type={currentVerb.type} />
          </div>

          <form
            className="p-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (checked) goNext();
              else checkAnswers();
            }}
          >
            <p className="text-sm text-ink-muted">
              Tulis bentuk <span className="font-bold text-brand-ink">{tenseMeta?.german}</span> (
              {tenseMeta?.indonesian}) dari <span className="font-bold text-brand-ink">{currentVerb.infinitive}</span>.
              Boleh ketik <span className="font-mono">ae</span>, <span className="font-mono">oe</span>,{' '}
              <span className="font-mono">ue</span>, <span className="font-mono">ss</span> kalau keyboardmu tidak
              punya huruf Jerman.
            </p>

            <div className="mt-4 space-y-2">
              {blanks.map((blank) => {
                const value = answers[blank.key] || '';
                const isCorrect = normalize(value) === normalize(blank.answer);
                return (
                  <div
                    key={blank.key}
                    className={cn(
                      'flex flex-col gap-2 border-l-4 bg-white/60 px-3 py-2 sm:flex-row sm:items-center',
                      !checked
                        ? 'border-brand-ink/20'
                        : isCorrect
                          ? 'border-brand-green'
                          : 'border-brand-rust',
                    )}
                  >
                    <label
                      htmlFor={`blank-${blank.key}`}
                      className="w-full font-serif text-base text-brand-ink sm:w-56 sm:shrink-0"
                    >
                      {blank.label}
                    </label>
                    <input
                      id={`blank-${blank.key}`}
                      name={`blank-${blank.key}`}
                      type="text"
                      autoComplete="off"
                      autoCapitalize="none"
                      spellCheck={false}
                      disabled={checked}
                      className={cn(FIELD, 'sm:flex-1 disabled:bg-brand-cream disabled:text-ink-muted')}
                      placeholder="tulis jawabanmu"
                      value={value}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [blank.key]: e.target.value }))}
                    />
                    {checked && (
                      <div className="flex items-center gap-2 sm:w-56 sm:shrink-0">
                        {isCorrect ? (
                          <>
                            <Check className="h-4 w-4 text-brand-green" aria-hidden="true" />
                            <span className="text-sm font-bold text-brand-ink">Benar</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4 text-brand-rust" aria-hidden="true" />
                            <span className="text-sm text-ink-muted">
                              Jawaban: <span className="font-bold text-brand-ink">{blank.answer}</span>
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {!checked ? (
                <button type="submit" className={BTN_SOLID}>
                  <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  Periksa jawaban
                </button>
              ) : (
                <button type="submit" className={BTN_SOLID}>
                  {queueIndex < queue.length - 1 ? 'Verba berikutnya' : 'Lihat hasil'}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
              <button type="button" className={BTN_OUTLINE} onClick={exitPractice}>
                Hentikan latihan
              </button>
              {score.total > 0 && (
                <span className={cn(EYEBROW, 'ml-auto text-ink-subtle')}>
                  Skor sementara {score.correct}/{score.total}
                </span>
              )}
            </div>
          </form>
        </div>

        {checked && (
          <div className="mt-4">
            <p className={cn(EYEBROW, 'mb-2 text-ink-subtle')}>Tabel lengkap {currentVerb.infinitive}</p>
            <div className="border border-brand-ink/15">
              <ConjugationTable verb={currentVerb} />
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ================================================================
     BROWSE
     ================================================================ */
  return (
    <div className="mx-auto max-w-4xl pb-10">
      {/* Masthead */}
      <header className="border-b-2 border-brand-ink pb-3">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="h-px w-8 bg-brand-rust" />
          <span className={cn(EYEBROW, 'text-ink-subtle')}>Kata Kerja Jerman</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h1 className="font-serif text-3xl leading-none tracking-tight text-brand-ink md:text-4xl">
            Latihan Konjugasi
          </h1>
          <p className="text-sm text-ink-muted">
            <span className="font-bold text-brand-ink">{verbDatabase.length}</span> verba inti · lengkap dengan
            Präsens, Präteritum, dan Perfekt
          </p>
        </div>
      </header>

      {/* Practice entry — the page now has something to do before you type
          anything. Previously the whole screen was blank until a search. */}
      <section className="mt-4 border-2 border-brand-ink bg-brand-ink px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl leading-none text-brand-cream">Mulai latihan konjugasi</h2>
            <p className="mt-1.5 text-sm text-cream-muted">
              {QUIZ_SIZE} verba acak. Ketik bentuknya, langsung dikoreksi, skornya keluar di akhir.
            </p>
          </div>
          <button
            type="button"
            onClick={() => startPractice(shuffled(verbDatabase).slice(0, QUIZ_SIZE), tense)}
            className="inline-flex items-center justify-center gap-2 bg-brand-tan px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-ink transition-colors hover:bg-brand-cream"
          >
            <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
            Mulai · {TENSES.find((t) => t.id === tense)?.german}
          </button>
        </div>

        <fieldset className="mt-4">
          <legend className={cn(EYEBROW, 'text-cream-subtle')}>Pilih bentuk yang mau dilatih</legend>
          <div className="mt-2 flex flex-wrap gap-px bg-brand-cream/20">
            {TENSES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTense(t.id)}
                aria-pressed={tense === t.id}
                className={cn(
                  'px-3 py-2 text-left transition-colors',
                  tense === t.id
                    ? 'bg-brand-cream text-brand-ink'
                    : 'bg-brand-ink text-cream-muted hover:text-brand-cream',
                )}
              >
                <span className="block text-sm font-bold">{t.german}</span>
                <span
                  className={cn(
                    'block text-[10px] uppercase tracking-[0.1em]',
                    tense === t.id ? 'text-ink-subtle' : 'text-cream-subtle',
                  )}
                >
                  {t.indonesian}
                </span>
              </button>
            ))}
          </div>
        </fieldset>
      </section>

      {/* Search + type filter */}
      <section className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <label className="flex flex-col gap-1.5">
          <span className={cn(EYEBROW, 'text-ink-subtle')}>Cari verba atau kata apa pun</span>
          <span className="relative block">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
              aria-hidden="true"
            />
            <input
              id="verb-search"
              name="search"
              type="text"
              autoComplete="off"
              placeholder="misalnya: pergi, gehen, rumah, schön"
              className={cn(FIELD, 'pl-9')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </span>
        </label>

        <div className="flex flex-wrap gap-px bg-brand-ink/15">
          {([
            { id: 'all' as const, label: 'Semua' },
            { id: 'irregular' as const, label: 'Tidak beraturan' },
            { id: 'regular' as const, label: 'Beraturan' },
          ]).map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setTypeFilter(f.id)}
              aria-pressed={typeFilter === f.id}
              className={cn(
                'px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.1em] transition-colors',
                typeFilter === f.id
                  ? 'bg-brand-ink text-brand-cream'
                  : 'bg-brand-cream text-ink-muted hover:bg-brand-ink/[0.06] hover:text-brand-ink',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Selected verb detail */}
      {selectedVerb && (
        <section className="mt-5 border-2 border-brand-ink">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-brand-ink bg-brand-cream px-4 py-3">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="font-serif text-3xl leading-none text-brand-ink">{selectedVerb.infinitive}</h2>
                <TypeTag type={selectedVerb.type} />
              </div>
              <p className="mt-1 text-sm text-ink-muted">{selectedVerb.translation}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={BTN_SOLID}
                onClick={() => startPractice([selectedVerb], tense)}
              >
                <PenLine className="h-3.5 w-3.5" aria-hidden="true" />
                Latih verba ini
              </button>
              <button
                type="button"
                className={BTN_OUTLINE}
                onClick={() => setSelectedVerb(null)}
                aria-label={`Tutup tabel ${selectedVerb.infinitive}`}
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
                Tutup
              </button>
            </div>
          </div>
          <ConjugationTable verb={selectedVerb} />
        </section>
      )}

      {/* Verb grid */}
      <section className="mt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-brand-ink/20 pb-2">
          <h2 className="font-serif text-2xl leading-none text-brand-ink">
            {query ? 'Verba yang cocok' : 'Verba yang paling sering dipakai'}
          </h2>
          <span className={cn(EYEBROW, 'text-ink-subtle')}>{visibleVerbs.length} verba</span>
        </div>

        {visibleVerbs.length === 0 ? (
          <div className="border border-brand-ink/15 bg-brand-cream px-6 py-12 text-center">
            <p className="text-sm text-ink-muted">
              {query
                ? `Tidak ada verba yang cocok dengan “${searchTerm.trim()}”.`
                : 'Tidak ada verba di kelompok ini.'}
            </p>
            <button
              type="button"
              className={cn(BTN_OUTLINE, 'mt-4')}
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
              }}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Tampilkan semua verba
            </button>
          </div>
        ) : (
          <div className="mt-3 grid gap-px border border-brand-ink/15 bg-brand-ink/15 sm:grid-cols-2 lg:grid-cols-3">
            {visibleVerbs.map((verb) => {
              const isOpen = selectedVerb?.infinitive === verb.infinitive;
              return (
                <button
                  key={verb.infinitive}
                  type="button"
                  aria-pressed={isOpen}
                  onClick={() => setSelectedVerb(isOpen ? null : verb)}
                  className={cn(
                    'flex flex-col items-start gap-1 px-3 py-3 text-left transition-colors',
                    isOpen
                      ? 'bg-brand-ink text-brand-cream'
                      : 'bg-brand-cream text-brand-ink hover:bg-brand-ink/[0.06]',
                  )}
                >
                  <span className="font-serif text-xl leading-none">{verb.infinitive}</span>
                  <span className={cn('text-sm', isOpen ? 'text-cream-muted' : 'text-ink-muted')}>
                    {verb.translation}
                  </span>
                  <span
                    className={cn(
                      'mt-1 text-[10px] font-bold uppercase tracking-[0.1em]',
                      isOpen ? 'text-cream-subtle' : 'text-ink-subtle',
                    )}
                  >
                    {verb.type === 'irregular' ? 'tidak beraturan' : 'beraturan'} · {verb.perfekt}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Mini dictionary — secondary to the verb work, so it sits last */}
      {query.length >= 2 && (
        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-brand-ink/20 pb-2">
            <h2 className="font-serif text-2xl leading-none text-brand-ink">Kata lain dari materi</h2>
            <span className={cn(EYEBROW, 'text-ink-subtle')}>
              {dictionary.total > DICTIONARY_LIMIT
                ? `${DICTIONARY_LIMIT} dari ${dictionary.total} kata`
                : `${dictionary.total} kata`}
            </span>
          </div>

          {dictionary.items.length === 0 ? (
            <p className="border border-brand-ink/15 bg-brand-cream px-6 py-10 text-center text-sm text-ink-muted">
              Belum ada kata lain yang cocok dengan “{searchTerm.trim()}” di pelajaran A1–B2.
            </p>
          ) : (
            <div className="mt-3 grid gap-px border border-brand-ink/15 bg-brand-ink/15 sm:grid-cols-2">
              {dictionary.items.map((v, i) => (
                /* allVocab is a concatenation of two sources, so ids are not
                   guaranteed unique across lessons — pair it with the index. */
                <div key={`${v.id}-${i}`} className="bg-brand-cream px-3 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {v.article && (
                      <span
                        className={cn(
                          'px-1.5 py-0.5 text-[10px] font-bold uppercase',
                          articlePlate[v.article] || 'bg-brand-ink text-brand-cream',
                        )}
                      >
                        {v.article}
                      </span>
                    )}
                    <span className="font-serif text-lg leading-none text-brand-ink">{v.word}</span>
                    <span className={cn(EYEBROW, 'ml-auto text-ink-subtle')}>{v.level}</span>
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{v.translation}</p>
                  {v.exampleSentence?.trim() && (
                    <p className="mt-1.5 font-serif text-sm italic text-ink-muted">
                      “{v.exampleSentence.trim()}”
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {dictionary.total > DICTIONARY_LIMIT && (
            <p className="mt-2 text-xs text-ink-subtle">
              Masih ada {dictionary.total - DICTIONARY_LIMIT} kata lain. Persempit pencarianmu untuk
              melihat sisanya.
            </p>
          )}
        </section>
      )}

      {query.length === 1 && (
        <p className="mt-4 text-sm text-ink-muted">Ketik minimal dua huruf untuk mencari di kamus materi.</p>
      )}
    </div>
  );
}
