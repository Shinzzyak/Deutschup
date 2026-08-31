import { useState, useEffect, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router';
import { supabase } from '../lib/supabase';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { Pagination } from '../components/ui/pagination';
import { ErrorState } from '../components/ui/error-state';
import {
  Check,
  X,
  Volume2,
  Search,
  Loader2,
  BookOpen,
  SlidersHorizontal,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, useReducedMotion } from 'motion/react';
import { authedFetch } from '../lib/auth-headers';
import {
  LEVELS,
  summarizeLevelCounts,
  summarizeVocabulary,
  type CefrLevel,
} from '../lib/vocabStats';

type TabType = 'flashcard' | 'list';
type FilterType = 'all' | 'learned' | 'learning' | 'new';
type SortType = 'default' | 'german' | 'indonesian';

type VocabRow = {
  id: string;
  lesson_id?: string | null;
  level_id: string;
  word: string;
  article?: string | null;
  translation: string;
  example_sentence?: string | null;
  phonetic?: string | null;
  sort_order?: number | null;
};

type ExamplePair = { german: string; indonesian: string };
type LevelCounts = Partial<Record<CefrLevel, number>>;

/* ------------------------------------------------------------------
   Editorial palette.

   Every value below is a brand token from src/index.css. The previous
   emerald / teal / blue / indigo / amber ramp shared nothing with the
   landing page and several pairings were unreadable on the permanently
   light app shell (white-on-green-500 measured 2.28:1).

   Note on the shadcn tokens: --primary is oklch(0.205 0 0), i.e. black
   with zero chroma. Nothing here uses bg-primary, so there is no
   black-on-black trap left in this file.
   ------------------------------------------------------------------ */

/** Decorative rule that gives each CEFR level its own mark. The level letter is
 *  printed right underneath, so colour never carries meaning on its own —
 *  brand-tan on cream is only 2.33:1 and could not carry it. */
const levelRule: Record<CefrLevel, string> = {
  A1: 'bg-brand-green',
  A2: 'bg-brand-tan',
  B1: 'bg-brand-rust',
  B2: 'bg-brand-ink',
};

/** der/die/das gender plate. The article is printed inside its own plate, so
 *  again colour is redundant. Measured: ink/cream 17.48:1, rust/cream 7.85:1,
 *  tan/ink 7.52:1 — the old bg-green-500 + white plate was 2.28:1. */
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

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value);
}

/** Sharp-cornered editorial tag. Replaces .st-badge, whose pill radius fought
 *  the print language and whose --soft variant rendered near-white on
 *  near-white (1.10:1) for every `--primary` pairing. */
function Tag({
  tone = 'quiet',
  children,
}: {
  tone?: 'quiet' | 'known' | 'learning' | 'accent';
  children: ReactNode;
}) {
  const tones = {
    quiet: 'border border-brand-ink/25 text-ink-muted', // 6.14:1 on cream
    known: 'bg-brand-green text-brand-ink', //             4.58:1
    learning: 'bg-brand-tan text-brand-ink', //            7.52:1
    accent: 'bg-brand-rust text-brand-cream', //           7.85:1
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em]',
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

function Panel({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center border border-brand-ink/15 bg-brand-cream px-6 py-14 text-center">
      {children}
    </div>
  );
}

export default function VocabTrainerDB() {
  const { user } = useAuthStore();
  const { vocab, updateVocab, loadProgress } = useProgressStore();
  const shouldReduceMotion = useReducedMotion();

  const [activeTab, setActiveTab] = useState<TabType>('flashcard');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('default');
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel>('A1');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [dbVocab, setDbVocab] = useState<VocabRow[]>([]);
  const [dbLevelCounts, setDbLevelCounts] = useState<LevelCounts>({});
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [countsLoading, setCountsLoading] = useState(true);
  const [vocabLoaded, setVocabLoaded] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  const [listPage, setListPage] = useState(1);
  const PAGE_SIZE = 50;

  const [examplesLoading, setExamplesLoading] = useState(false);
  const [examples, setExamples] = useState<ExamplePair[] | null>(null);
  const [pronunciationLoading, setPronunciationLoading] = useState(false);
  const [pronunciation, setPronunciation] = useState<{ phonetic: string; tip: string } | null>(null);
  const [helperError, setHelperError] = useState<string | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();

  // Deep-link from global search (?q=...): land on the word directly.
  // List tab (not flashcard) so the match is guaranteed visible; level param
  // jumps first so the word's own level is loaded before the search paints.
  useEffect(() => {
    const q = searchParams.get('q');
    if (!q) return;
    const lvl = searchParams.get('level');
    if (lvl && LEVELS.includes(lvl as CefrLevel) && lvl !== selectedLevel) {
      setSelectedLevel(lvl as CefrLevel);
    }
    setSearchQuery(q);
    setActiveTab('list');
    setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs on ?q arrival only
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (user?.id) {
      loadProgress(user.id).then(() => setVocabLoaded(true));
    } else {
      setVocabLoaded(true);
    }
  }, [user?.id, loadProgress]);

  useEffect(() => {
    fetchVocab(selectedLevel);
  }, [selectedLevel]);

  useEffect(() => {
    fetchLevelCounts();
  }, []);

  // --- client-side cache (localStorage) ---------------------------------
  // Stale-while-revalidate: instant paint from cache, quiet refresh behind it.
  const VOCAB_CACHE_PREFIX = 'du_vocab_cache_v2_';
  const COUNTS_CACHE_KEY = 'du_vocab_counts_cache_v2';
  const readCache = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.rows)) return null;
      return parsed;
    } catch {
      return null;
    }
  };

  const fetchVocab = async (level: CefrLevel) => {
    setLoading(true);
    setLoadFailed(false);

    // 1) instant paint from cache if available
    const cached = readCache(VOCAB_CACHE_PREFIX + level);
    if (cached) {
      setDbVocab(cached.rows as VocabRow[]);
      setLoading(false);
    }

    // 2) revalidate in background (or first cold fetch)
    try {
      const { data, error } = await supabase
        .from('curriculum_vocabulary')
        .select('id, lesson_id, level_id, word, article, translation, example_sentence, phonetic, sort_order')
        .eq('level_id', level)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      const rows = (data || []) as VocabRow[];
      setDbVocab(rows);
      try {
        localStorage.setItem(
          VOCAB_CACHE_PREFIX + level,
          JSON.stringify({ ts: Date.now(), rows }),
        );
      } catch {
        // ponytail: quota exceeded — Safari private mode / full storage. Cache miss silently next time.
      }
    } catch (e) {
      console.error('Error fetching vocab:', e);
      if (!cached) {
        setDbVocab([]);
        setLoadFailed(true);
      }
      // cached path: keep stale rows on screen, network failed quietly
    } finally {
      setLoading(false);
    }
  };

  const fetchLevelCounts = async () => {
    setCountsLoading(true);
    let painted = false;
    try {
      // instant paint from counts cache
      const rawCounts = localStorage.getItem(COUNTS_CACHE_KEY);
      if (rawCounts) {
        try {
          const parsed = JSON.parse(rawCounts);
          if (parsed && typeof parsed === 'object') {
            setDbLevelCounts(parsed as Record<CefrLevel, number>);
            setCountsLoading(false);
            painted = true;
          }
        } catch {
          // corrupt cache — fall through to network
        }
      }
      const entries = await Promise.all(
        LEVELS.map(async (level) => {
          const { count, error } = await supabase
            .from('curriculum_vocabulary')
            .select('id', { count: 'exact', head: true })
            .eq('level_id', level);

          if (error) throw error;
          return [level, count || 0] as const;
        }),
      );
      const next = Object.fromEntries(entries) as Record<CefrLevel, number>;
      setDbLevelCounts(next);
      try {
        localStorage.setItem(COUNTS_CACHE_KEY, JSON.stringify(next));
      } catch {
        // quota — ignore, counts are tiny anyway
      }
    } catch (e) {
      console.error('Error fetching vocab level counts:', e);
      if (!painted) setCountsLoading(false);
      return;
    }
    setCountsLoading(false);
  };

  useEffect(() => { setListPage(1); }, [searchQuery, filter, sort, selectedLevel]);

  const filteredVocab = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    // Dedupe: DB has 201 word+level duplicate groups (e.g. "der Kaffee" ×4 in A1).
    // Keep first occurrence per word — the overlay already dedupes; the list must too.
    const seen = new Set<string>();
    let result = dbVocab.filter((v) => {
      const key = v.word;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (query) {
      result = result.filter((v) =>
        v.word.toLowerCase().includes(query) ||
        v.translation.toLowerCase().includes(query) ||
        (v.article || '').toLowerCase().includes(query) ||
        (v.example_sentence || '').toLowerCase().includes(query),
      );
    }

    if (filter !== 'all') {
      result = result.filter((v) => {
        const progress = vocab[v.id];
        if (filter === 'learned') return progress?.status === 'known';
        if (filter === 'learning') return progress?.status === 'learning';
        if (filter === 'new') return !progress;
        return true;
      });
    }

    if (sort === 'german') result.sort((a, b) => a.word.localeCompare(b.word, 'de'));
    if (sort === 'indonesian') result.sort((a, b) => a.translation.localeCompare(b.translation, 'id'));

    return result;
  }, [dbVocab, searchQuery, filter, sort, vocab]);

  const summary = useMemo(() => summarizeVocabulary(dbVocab, vocab), [dbVocab, vocab]);
  const filteredSummary = useMemo(() => summarizeVocabulary(filteredVocab, vocab), [filteredVocab, vocab]);
  const levelCountSummary = useMemo(() => summarizeLevelCounts(dbLevelCounts), [dbLevelCounts]);
  const pagedVocab = useMemo(() => {
    const start = (listPage - 1) * PAGE_SIZE;
    return filteredVocab.slice(start, start + PAGE_SIZE);
  }, [filteredVocab, listPage]);

  const dueCards = useMemo(() => {
    const due = filteredVocab.filter((v) => {
      const progress = vocab[v.id];
      if (!progress) return true;
      return progress.nextReview <= Date.now();
    });
    // Fisher-Yates. The previous `sort(() => Math.random() - 0.5)` is not a
    // shuffle — it biases heavily toward the original order on V8.
    for (let i = due.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [due[i], due[j]] = [due[j], due[i]];
    }
    return due;
  }, [filteredVocab, vocab]);

  const currentCard = dueCards[0];
  const progressPercent = filteredSummary.knownPercent;
  const hasActiveFilter = filter !== 'all' || searchQuery.trim() !== '';
  const canSaveProgress = Boolean(user?.id);

  // Any change of card wipes the answer side and everything fetched for the
  // previous word. Without this, AI examples from the last card leaked onto the
  // next one whenever the queue changed for a reason other than answering.
  useEffect(() => {
    setIsFlipped(false);
    setExamples(null);
    setPronunciation(null);
    setHelperError(null);
  }, [currentCard?.id]);

  const handleLevelChange = (level: CefrLevel) => {
    setSelectedLevel(level);
    setCardsReviewed(0);
  };

  const clearFilters = () => {
    setFilter('all');
    setSearchQuery('');
    setSort('default');
  };

  const handleFlip = () => setIsFlipped((flipped) => !flipped);

  const handleAnswer = async (known: boolean) => {
    if (!currentCard || !user?.id) return;
    await updateVocab(user.id, currentCard.id, known ? 'known' : 'learning');
    setIsFlipped(false);
    setCardsReviewed((prev) => prev + 1);
  };

  const markKnown = async (wordId: string) => {
    if (!user?.id) return;
    await updateVocab(user.id, wordId, 'known');
  };

  const fetchExamples = async () => {
    if (!currentCard || examples || examplesLoading) return;
    setExamplesLoading(true);
    setHelperError(null);
    try {
      const resp = await authedFetch('/api/ai?action=vocab-examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: currentCard.word, level: currentCard.level_id }),
      });
      if (!resp.ok) throw new Error(String(resp.status));
      const data = await resp.json();
      setExamples(Array.isArray(data.examples) ? data.examples : []);
    } catch (e) {
      console.error(e);
      setHelperError('Contoh kalimat belum bisa dimuat sekarang. Coba lagi sebentar lagi.');
    } finally {
      setExamplesLoading(false);
    }
  };

  const fetchPronunciation = async () => {
    if (!currentCard || pronunciation || pronunciationLoading) return;
    setPronunciationLoading(true);
    setHelperError(null);
    try {
      const resp = await authedFetch('/api/ai?action=pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: currentCard.word }),
      });
      if (!resp.ok) throw new Error(String(resp.status));
      const data = await resp.json();
      if (!data?.phonetic && !data?.tip) throw new Error('empty');
      setPronunciation(data);
    } catch (e) {
      console.error(e);
      setHelperError('Panduan pelafalan belum bisa dimuat sekarang. Coba lagi sebentar lagi.');
    } finally {
      setPronunciationLoading(false);
    }
  };

  const nextLevel = LEVELS[LEVELS.indexOf(selectedLevel) + 1];

  /* ---------------------------------------------------------------
     The whole point of the layout below is that the masthead, the level
     strip and the tab row together stay under ~230px on a phone, so the
     flashcard and its two answer buttons are reachable without scrolling.
     The old dark hero alone was taller than that.
     --------------------------------------------------------------- */

  return (
    <div className="pb-8">
      {/* Masthead */}
      <header className="border-b-2 border-brand-ink pb-3">
        <div className="flex items-center gap-2.5">
          <span aria-hidden="true" className="h-px w-8 bg-brand-rust" />
          <span className={cn(EYEBROW, 'text-ink-subtle')}>Kosakata Kurikulum</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h1 className="font-serif text-3xl leading-none tracking-tight text-brand-ink md:text-4xl">
            Latihan Kosakata
          </h1>
          <p className="text-sm text-ink-muted">
            <span className="font-bold text-brand-ink">{formatNumber(levelCountSummary.total)}</span> kata
            {' · '}
            <span className="font-bold text-brand-ink">{formatNumber(summary.known)}</span> hafal
            {' · '}
            <span className="font-bold text-brand-rust">{formatNumber(filteredSummary.due)}</span> siap diulang
          </p>
        </div>
      </header>

      {/* Level strip — gap-px reads as a hairline rule between cells */}
      <div className="mt-3 grid grid-cols-4 gap-px border border-brand-ink/15 bg-brand-ink/15">
        {LEVELS.map((level) => {
          const count = levelCountSummary.byLevel[level]?.total || 0;
          const levelProgress = summary.byLevel[level];
          const isActive = selectedLevel === level;
          return (
            <button
              key={level}
              type="button"
              onClick={() => handleLevelChange(level)}
              aria-pressed={isActive}
              className={cn(
                'relative px-2 pb-2.5 pt-2.5 text-left transition-colors sm:px-3',
                isActive
                  ? 'bg-brand-ink text-brand-cream'
                  : 'bg-brand-cream text-brand-ink hover:bg-brand-ink/[0.06]',
              )}
            >
              <span aria-hidden="true" className={cn('absolute inset-x-0 top-0 h-[3px]', levelRule[level])} />
              <span className="block font-serif text-xl leading-none sm:text-2xl">{level}</span>
              <span
                className={cn(
                  'mt-1 block text-[10px] font-bold uppercase tracking-[0.1em]',
                  isActive ? 'text-cream-subtle' : 'text-ink-subtle',
                )}
              >
                {countsLoading
                  ? '—'
                  : isActive
                    ? `${formatNumber(count)} · ${levelProgress.knownPercent}%`
                    : `${formatNumber(count)} kata`}
              </span>
              {/* Progress rail. Only the open level has loaded rows, so only it
                  can honestly report a percentage — the others show an empty
                  rail rather than a fake 0%. The number is printed above, so
                  the rail is decoration. */}
              <span
                aria-hidden="true"
                className={cn('mt-2 block h-1 w-full', isActive ? 'bg-brand-cream/25' : 'bg-brand-ink/10')}
              >
                {isActive && (
                  <span className="block h-full bg-brand-tan" style={{ width: `${levelProgress.knownPercent}%` }} />
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tabs + filter toggle share one row so nothing extra is spent on height */}
      <div className="mt-3 flex items-stretch justify-between gap-2 border-b border-brand-ink/20">
        <div className="flex">
          {([
            { id: 'flashcard' as const, label: 'Kartu Latihan' },
            { id: 'list' as const, label: 'Daftar Kata' },
          ]).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isActive}
                className={cn(
                  'relative px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors',
                  isActive ? 'text-brand-ink' : 'text-ink-subtle hover:text-brand-ink',
                )}
              >
                {tab.label}
                {isActive && (
                  <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-rust" />
                )}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="vocab-filters"
          className={cn(
            'flex items-center gap-1.5 px-3 py-2.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors',
            filtersOpen || hasActiveFilter ? 'text-brand-rust' : 'text-ink-subtle hover:text-brand-ink',
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
          Filter
        </button>
      </div>

      {filtersOpen && (
        <div
          id="vocab-filters"
          className="grid gap-3 border-x border-b border-brand-ink/20 bg-brand-cream p-3 sm:grid-cols-3"
        >
          <label className="flex flex-col gap-1.5">
            <span className={cn(EYEBROW, 'text-ink-subtle')}>Cari</span>
            <span className="relative block">
              <Search
                className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle"
                aria-hidden="true"
              />
              <input
                className={cn(FIELD, 'pl-8')}
                placeholder="kata, arti, atau contoh kalimat"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </span>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={cn(EYEBROW, 'text-ink-subtle')}>Tampilkan</span>
            <select className={FIELD} value={filter} onChange={(e) => setFilter(e.target.value as FilterType)}>
              <option value="all">Semua kata</option>
              <option value="new">Kata baru</option>
              <option value="learning">Sedang dipelajari</option>
              <option value="learned">Sudah dikuasai</option>
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={cn(EYEBROW, 'text-ink-subtle')}>Urutkan</span>
            <select className={FIELD} value={sort} onChange={(e) => setSort(e.target.value as SortType)}>
              <option value="default">Urutan materi</option>
              <option value="german">Jerman A–Z</option>
              <option value="indonesian">Indonesia A–Z</option>
            </select>
          </label>
        </div>
      )}

      {hasActiveFilter && !filtersOpen && (
        <div className="flex flex-wrap items-center gap-2 border-x border-b border-brand-ink/20 bg-brand-cream px-3 py-2">
          <span className={cn(EYEBROW, 'text-ink-subtle')}>Sedang disaring:</span>
          {searchQuery.trim() && <Tag>“{searchQuery.trim()}”</Tag>}
          {filter !== 'all' && (
            <Tag>
              {filter === 'new' ? 'kata baru' : filter === 'learning' ? 'sedang dipelajari' : 'sudah dikuasai'}
            </Tag>
          )}
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto text-[11px] font-bold uppercase tracking-[0.12em] text-brand-rust underline underline-offset-2"
          >
            Tampilkan semua
          </button>
        </div>
      )}

      {!canSaveProgress && (
        <p className="mt-3 border-l-2 border-brand-rust bg-brand-cream px-3 py-2 text-sm text-ink-muted">
          Kami belum mengenali akunmu, jadi hasil latihan ini belum bisa disimpan. Coba muat ulang halaman
          atau masuk kembali.
        </p>
      )}

      {/* ---------------- Content ---------------- */}
      <div className="mt-3">
        {loading ? (
          <Panel>
            <Loader2 className="h-7 w-7 animate-spin text-brand-rust" aria-hidden="true" />
            <p className="mt-3 text-sm text-ink-muted">Menyiapkan kosakata level {selectedLevel}…</p>
          </Panel>
        ) : loadFailed ? (
          /* Deliberately on white, not on a cream panel: ErrorState prints its
             description in --muted-foreground (#737373), which measures 4.74:1
             on white but only 4.19:1 on brand-cream — i.e. it would fail AA on
             the surface the rest of this page uses. */
          <div className="border border-brand-ink/15 bg-white">
            <ErrorState
              title="Kosakata belum bisa ditampilkan"
              description="Daftar kata level ini gagal diambil. Periksa koneksi internetmu, lalu coba lagi."
              onRetry={() => fetchVocab(selectedLevel)}
            />
          </div>
        ) : !vocabLoaded ? (
          <Panel>
            <Loader2 className="h-7 w-7 animate-spin text-brand-rust" aria-hidden="true" />
            <p className="mt-3 text-sm text-ink-muted">Mengambil catatan belajarmu…</p>
          </Panel>
        ) : activeTab === 'flashcard' ? (
          currentCard ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-1 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-subtle tabular-nums">
                <span>{formatNumber(dueCards.length)} kata menunggu</span>
                <span>
                  {formatNumber(cardsReviewed)} selesai sesi ini · {progressPercent}% hafal
                </span>
              </div>

              {/* Flip card.
                  The 3D properties are set inline on purpose: this flip has been
                  broken before because the markup depended on utility class names
                  (perspective-1000 / preserve-3d) that were not in the stylesheet.
                  Inline styles cannot silently go missing. */}
              <div
                role="button"
                tabIndex={0}
                aria-pressed={isFlipped}
                aria-label={isFlipped ? 'Kembali ke kata Jerman' : 'Lihat arti kata'}
                onClick={handleFlip}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleFlip();
                  }
                }}
                className="relative min-h-[15rem] w-full cursor-pointer select-none sm:min-h-[17rem] md:min-h-[20rem]"
                style={{ perspective: '1200px' }}
              >
                <motion.div
                  className="relative h-full min-h-[15rem] w-full sm:min-h-[17rem] md:min-h-[20rem]"
                  style={{ transformStyle: 'preserve-3d' }}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 260, damping: 24 }
                  }
                >
                  {/* Front — the word, on paper */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden border-2 border-brand-ink bg-brand-cream px-5 py-8 text-center"
                    style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                  >
                    <span className={cn(EYEBROW, 'text-ink-subtle')}>{selectedLevel}</span>
                    <h2 className="mt-3 font-serif text-4xl leading-none tracking-tight text-brand-ink sm:text-5xl md:text-6xl">
                      {currentCard.word}
                    </h2>
                    {currentCard.article && (
                      <span
                        className={cn(
                          'mt-4 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em]',
                          articlePlate[currentCard.article] || 'bg-brand-ink text-brand-cream',
                        )}
                      >
                        {currentCard.article}
                      </span>
                    )}
                    {currentCard.phonetic && (
                      <p className="mt-3 font-mono text-sm text-ink-muted">/{currentCard.phonetic}/</p>
                    )}
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-brand-rust">
                      Ketuk untuk lihat arti
                    </p>
                  </div>

                  {/* Back — the meaning, on ink */}
                  <div
                    className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden border-2 border-brand-ink bg-brand-ink px-5 py-8 text-center"
                    style={{
                      backfaceVisibility: 'hidden',
                      WebkitBackfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                    }}
                  >
                    <span className={cn(EYEBROW, 'text-cream-subtle')}>Arti</span>
                    <h2 className="mt-3 font-serif text-3xl leading-tight tracking-tight text-brand-tan sm:text-4xl md:text-5xl">
                      {currentCard.translation}
                    </h2>
                    {currentCard.example_sentence && (
                      <p className="mt-4 max-w-xl font-serif text-sm italic leading-relaxed text-cream-muted md:text-base">
                        “{currentCard.example_sentence}”
                      </p>
                    )}
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-cream-subtle">
                      Ketuk untuk kembali
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Answer buttons — the primary action, kept directly under the card */}
              <div className="grid grid-cols-2 gap-px border border-brand-ink/20 bg-brand-ink/20">
                <button
                  type="button"
                  onClick={() => handleAnswer(false)}
                  disabled={!canSaveProgress}
                  className="flex items-center justify-center gap-2 bg-brand-cream px-3 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-brand-rust transition-colors hover:bg-brand-rust hover:text-brand-cream disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Belum hafal
                </button>
                <button
                  type="button"
                  onClick={() => handleAnswer(true)}
                  disabled={!canSaveProgress}
                  className="flex items-center justify-center gap-2 bg-brand-green px-3 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-cream disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Check className="h-4 w-4" aria-hidden="true" />
                  Sudah hafal
                </button>
              </div>

              {/* Helpers appear only once the answer is showing, and they live
                  outside the card so nothing overflows the fixed-height face and
                  no button is nested inside the card's own click target. */}
              {isFlipped && (
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={fetchPronunciation}
                      /* Once loaded the handler short-circuits, so leaving the
                         button enabled would make it a dead control. */
                      disabled={pronunciationLoading || Boolean(pronunciation)}
                      className="inline-flex items-center gap-2 border border-ink-subtle px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-cream disabled:opacity-60"
                    >
                      {pronunciationLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      Cara baca
                    </button>
                    <button
                      type="button"
                      onClick={fetchExamples}
                      disabled={examplesLoading || Boolean(examples)}
                      className="inline-flex items-center gap-2 border border-ink-subtle px-3 py-2 text-xs font-bold uppercase tracking-[0.1em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-cream disabled:opacity-60"
                    >
                      {examplesLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                      ) : (
                        <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
                      )}
                      Contoh kalimat
                    </button>
                  </div>

                  {helperError && (
                    <p className="border-l-2 border-brand-rust bg-brand-cream px-3 py-2 text-sm text-ink-muted">
                      {helperError}
                    </p>
                  )}

                  {pronunciation && (
                    <div className="border-l-2 border-brand-rust bg-brand-cream px-3 py-2">
                      <p className="font-mono text-sm font-bold text-brand-ink">{pronunciation.phonetic}</p>
                      {pronunciation.tip && <p className="text-sm text-ink-muted">{pronunciation.tip}</p>}
                    </div>
                  )}

                  {examples && examples.length === 0 && !helperError && (
                    <p className="border-l-2 border-brand-ink/20 bg-brand-cream px-3 py-2 text-sm text-ink-muted">
                      Belum ada contoh kalimat untuk kata ini.
                    </p>
                  )}

                  {examples && examples.length > 0 && (
                    <div className="grid gap-px border border-brand-ink/15 bg-brand-ink/15">
                      {examples.map((ex, i) => (
                        <div key={`${ex.german}-${i}`} className="bg-brand-cream px-3 py-2 text-left">
                          <p className="text-sm font-semibold text-brand-ink">{ex.german}</p>
                          <p className="text-sm text-ink-muted">{ex.indonesian}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : filteredVocab.length === 0 && hasActiveFilter ? (
            <Panel>
              <Search className="h-8 w-8 text-brand-rust" aria-hidden="true" />
              <h3 className="mt-3 font-serif text-2xl text-brand-ink">Tidak ada kata yang cocok</h3>
              <p className="mt-1 max-w-sm text-sm text-ink-muted">
                Pencarian atau saringan yang aktif menyembunyikan semua kata di level {selectedLevel}.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 inline-flex items-center gap-2 bg-brand-ink px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-cream transition-colors hover:bg-brand-rust"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Tampilkan semua kata
              </button>
            </Panel>
          ) : filteredVocab.length === 0 ? (
            <Panel>
              <h3 className="font-serif text-2xl text-brand-ink">Level ini belum ada isinya</h3>
              <p className="mt-1 max-w-sm text-sm text-ink-muted">
                Kosakata level {selectedLevel} belum tersedia. Coba muat ulang, atau pilih level lain di atas.
              </p>
              <button
                type="button"
                onClick={() => fetchVocab(selectedLevel)}
                className="mt-5 inline-flex items-center gap-2 bg-brand-ink px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-cream transition-colors hover:bg-brand-rust"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Muat ulang
              </button>
            </Panel>
          ) : (
            <Panel>
              <h3 className="font-serif text-2xl text-brand-ink">Sesi hari ini selesai</h3>
              <p className="mt-1 max-w-sm text-sm text-ink-muted">
                Semua kata di level {selectedLevel} sudah kamu ulang. Kata akan muncul lagi di sini kalau
                sudah waktunya diulang, biar ingatannya tahan lama.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="inline-flex items-center gap-2 bg-brand-ink px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-cream transition-colors hover:bg-brand-rust"
                >
                  Lihat semua kata {selectedLevel}
                </button>
                {nextLevel && (
                  <button
                    type="button"
                    onClick={() => handleLevelChange(nextLevel)}
                    className="inline-flex items-center gap-2 border border-ink-subtle px-4 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-cream"
                  >
                    Lanjut ke {nextLevel}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </Panel>
          )
        ) : (
          /* ---------------- List ---------------- */
          <div className="border border-brand-ink/15 bg-brand-cream">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-brand-ink px-3 py-2.5">
              <div>
                <h2 className="font-serif text-xl leading-none text-brand-ink">Daftar Kosakata</h2>
                <p className={cn(EYEBROW, 'mt-1 text-ink-subtle')}>
                  {formatNumber(filteredVocab.length)} kata · level {selectedLevel}
                </p>
              </div>
              <Tag tone="accent">{formatNumber(filteredSummary.due)} siap diulang</Tag>
            </div>

            {filteredVocab.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="text-sm text-ink-muted">
                  {hasActiveFilter
                    ? `Tidak ada kata yang cocok dengan pencarianmu di level ${selectedLevel}.`
                    : `Kosakata level ${selectedLevel} belum tersedia.`}
                </p>
                {hasActiveFilter && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 inline-flex items-center gap-2 border border-ink-subtle px-4 py-2 text-xs font-bold uppercase tracking-[0.12em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-cream"
                  >
                    Tampilkan semua kata
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-brand-ink/20">
                        <th className={cn('px-3 py-2 text-ink-subtle', EYEBROW)}>Kata</th>
                        <th className={cn('px-3 py-2 text-ink-subtle', EYEBROW)}>Arti</th>
                        <th className={cn('hidden px-3 py-2 text-ink-subtle md:table-cell', EYEBROW)}>Materi</th>
                        <th className={cn('px-3 py-2 text-ink-subtle', EYEBROW)}>Status</th>
                        <th className={cn('px-3 py-2 text-right text-ink-subtle', EYEBROW)}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedVocab.map((v) => {
                        const progress = vocab[v.id];
                        const known = progress?.status === 'known';
                        return (
                          <tr key={v.id} className="border-b border-brand-ink/10 align-middle">
                            <td className="px-3 py-2.5">
                              <div className="flex items-center gap-2">
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
                                <span className="text-sm font-bold text-brand-ink">{v.word}</span>
                              </div>
                              {v.phonetic && (
                                <p className="mt-0.5 font-mono text-[11px] text-ink-subtle">/{v.phonetic}/</p>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-sm text-ink-muted">{v.translation}</td>
                            <td className="hidden px-3 py-2.5 md:table-cell">
                              <span className={cn(EYEBROW, 'text-ink-subtle')}>{v.lesson_id || selectedLevel}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              {known ? (
                                <Tag tone="known">Dikuasai</Tag>
                              ) : progress?.status === 'learning' ? (
                                <Tag tone="learning">Dipelajari</Tag>
                              ) : (
                                <Tag>Baru</Tag>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-right">
                              <button
                                type="button"
                                onClick={() => markKnown(v.id)}
                                disabled={known || !canSaveProgress}
                                aria-label={`Tandai ${v.word} sudah hafal`}
                                className="inline-flex items-center gap-1.5 border border-ink-subtle px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-brand-ink transition-colors hover:bg-brand-ink hover:text-brand-cream disabled:cursor-not-allowed disabled:border-brand-ink/15 disabled:text-ink-subtle disabled:hover:bg-transparent disabled:hover:text-ink-subtle"
                              >
                                <Check className="h-3 w-3" aria-hidden="true" />
                                Hafal
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-center border-t border-brand-ink/15 p-3">
                  <Pagination
                    page={listPage}
                    pageCount={Math.max(1, Math.ceil(filteredVocab.length / PAGE_SIZE))}
                    onPageChange={setListPage}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
