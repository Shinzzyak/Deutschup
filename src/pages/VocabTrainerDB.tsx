import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Pagination } from '../components/ui/pagination';
import {
  RotateCcw,
  Brain,
  Check,
  X,
  Volume2,
  Search,
  Loader2,
  List,
  LayoutGrid,
  Filter,
  ArrowUpDown,
  BookOpen,
  Target,
  Trophy,
  Database,
  BarChart3,
  Layers,
  Sparkles,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
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

const levelStyles: Record<CefrLevel, { accent: string; dot: string; soft: string; text: string }> = {
  A1: {
    accent: 'from-emerald-500 to-lime-500',
    dot: 'bg-emerald-500',
    soft: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-700 dark:text-emerald-300',
    text: 'text-emerald-600',
  },
  A2: {
    accent: 'from-teal-500 to-cyan-500',
    dot: 'bg-teal-500',
    soft: 'bg-teal-500/10 border-teal-500/25 text-teal-700 dark:text-teal-300',
    text: 'text-teal-600',
  },
  B1: {
    accent: 'from-blue-500 to-indigo-500',
    dot: 'bg-blue-500',
    soft: 'bg-blue-500/10 border-blue-500/25 text-blue-700 dark:text-blue-300',
    text: 'text-blue-600',
  },
  B2: {
    accent: 'from-indigo-500 to-violet-500',
    dot: 'bg-indigo-500',
    soft: 'bg-indigo-500/10 border-indigo-500/25 text-indigo-700 dark:text-indigo-300',
    text: 'text-indigo-600',
  },
};

const articleColors: Record<string, string> = {
  der: 'bg-blue-500',
  die: 'bg-red-500',
  das: 'bg-green-500',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('id-ID').format(value);
}

function statusBadge(status?: 'known' | 'learning') {
  if (status === 'known') return 'st-badge st-badge--success st-badge--soft';
  if (status === 'learning') return 'st-badge st-badge--warning st-badge--soft';
  return 'st-badge st-badge--neutral';
}

export default function VocabTrainerDB() {
  const { user } = useAuthStore();
  const { vocab, updateVocab, loadProgress } = useProgressStore();

  const [activeTab, setActiveTab] = useState<TabType>('flashcard');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('default');
  const [selectedLevel, setSelectedLevel] = useState<CefrLevel>('A1');
  const [searchQuery, setSearchQuery] = useState('');

  const [dbVocab, setDbVocab] = useState<VocabRow[]>([]);
  const [dbLevelCounts, setDbLevelCounts] = useState<LevelCounts>({});
  const [loading, setLoading] = useState(true);
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

  const fetchVocab = async (level: CefrLevel) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('curriculum_vocabulary')
        .select('id, lesson_id, level_id, word, article, translation, example_sentence, phonetic, sort_order')
        .eq('level_id', level)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setDbVocab((data || []) as VocabRow[]);
    } catch (e) {
      console.error('Error fetching vocab:', e);
      setDbVocab([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevelCounts = async () => {
    setCountsLoading(true);
    try {
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
      setDbLevelCounts(Object.fromEntries(entries) as Record<CefrLevel, number>);
    } catch (e) {
      console.error('Error fetching vocab level counts:', e);
    } finally {
      setCountsLoading(false);
    }
  };

  useEffect(() => { setListPage(1); }, [searchQuery, filter, sort, selectedLevel]);

  const filteredVocab = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let result = [...dbVocab];

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
    return filteredVocab
      .filter((v) => {
        const progress = vocab[v.id];
        if (!progress) return true;
        return progress.nextReview <= Date.now();
      })
      .sort(() => Math.random() - 0.5);
  }, [filteredVocab, vocab]);

  const currentCard = dueCards[0];
  const progressPercent = filteredSummary.knownPercent;
  const selectedCount = levelCountSummary.byLevel[selectedLevel]?.total || dbVocab.length;

  const resetCardContext = () => {
    setIsFlipped(false);
    setExamples(null);
    setPronunciation(null);
  };

  const handleLevelChange = (level: CefrLevel) => {
    setSelectedLevel(level);
    setCardsReviewed(0);
    resetCardContext();
  };

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleAnswer = async (known: boolean) => {
    if (!currentCard || !user) return;
    await updateVocab(user.id, currentCard.id, known ? 'known' : 'learning');
    resetCardContext();
    setCardsReviewed((prev) => prev + 1);
  };

  const fetchExamples = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard || examples || examplesLoading) return;
    setExamplesLoading(true);
    try {
      const resp = await authedFetch('/api/ai?action=vocab-examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: currentCard.word, level: currentCard.level_id }),
      });
      const data = await resp.json();
      setExamples(Array.isArray(data.examples) ? data.examples : []);
    } catch (e) {
      console.error(e);
      setExamples([]);
    } finally {
      setExamplesLoading(false);
    }
  };

  const fetchPronunciation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentCard || pronunciation || pronunciationLoading) return;
    setPronunciationLoading(true);
    try {
      const resp = await authedFetch('/api/ai?action=pronunciation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word: currentCard.word }),
      });
      const data = await resp.json();
      setPronunciation(data);
    } catch (e) {
      console.error(e);
    } finally {
      setPronunciationLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="st-page max-w-6xl mx-auto p-4">
        <div className="st-card st-card--hero min-h-[280px] items-center justify-center text-center">
          <Loader2 className="w-10 h-10 text-white animate-spin" />
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/50">Latihan Kosakata</p>
            <p className="text-lg font-bold text-white">Memuat kosakata level...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="st-page max-w-6xl mx-auto p-4 md:p-6">
      {/* Learner-facing vocabulary dashboard */}
      <section className="st-card st-card--hero overflow-hidden">
        <div className="st-flag-accent" aria-hidden="true" />
        <div className="relative z-10 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-white/70">
              <Database className="w-3.5 h-3.5" />
              Kosakata Kurikulum
            </div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                <Brain className="w-9 h-9 text-amber-300" />
                Pusat Latihan Kosakata
              </h1>
              <p className="mt-2 max-w-2xl text-sm md:text-base leading-relaxed text-white/62">
                Latihan kosakata Jerman yang rapi, cepat, dan mengikuti materi level kamu. Pantau kata baru, review, dan progres hafalan dalam satu tempat.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="st-badge st-badge--primary st-badge--soft">
                <Layers className="w-3.5 h-3.5" /> {formatNumber(levelCountSummary.total)} kata tersedia
              </span>
              <span className="st-badge st-badge--success st-badge--soft">
                <Check className="w-3.5 h-3.5" /> {formatNumber(summary.known)} dikuasai di {selectedLevel}
              </span>
              <span className="st-badge st-badge--warning st-badge--soft">
                <Target className="w-3.5 h-3.5" /> {formatNumber(filteredSummary.due)} perlu review
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Level Dipilih', value: selectedLevel, icon: Sparkles },
              { label: 'Kata Level Ini', value: countsLoading ? '...' : formatNumber(selectedCount), icon: Database },
              { label: 'Dikuasai', value: formatNumber(summary.known), icon: Trophy },
              { label: 'Progres', value: `${progressPercent}%`, icon: BarChart3 },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/[0.08] p-4 backdrop-blur-sm">
                <item.icon className="w-4 h-4 text-amber-300 mb-3" />
                <div className="text-2xl font-black text-white">{item.value}</div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white/45">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Level matrix */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {LEVELS.map((level) => {
          const count = levelCountSummary.byLevel[level]?.total || 0;
          const levelProgress = summary.byLevel[level];
          const isActive = selectedLevel === level;
          const progressLabel = isActive ? `${levelProgress.knownPercent}%` : 'pilih';
          return (
            <button
              key={level}
              type="button"
              onClick={() => handleLevelChange(level)}
              data-state={isActive ? 'active' : 'inactive'}
              className={cn('st-level-card text-left', isActive && 'st-level-card--active')}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={cn('h-2.5 w-2.5 rounded-full', levelStyles[level].dot)} />
                    <span className="text-lg font-black">{level}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{formatNumber(count)} kata tersedia</p>
                </div>
                <span className={cn('st-badge border', levelStyles[level].soft)}>{progressLabel}</span>
              </div>
              <div className="mt-4 st-progress" aria-label={isActive ? `${level} dikuasai ${levelProgress.knownPercent}%` : `${level} siap dipelajari`}>
                <span style={{ width: isActive ? `${levelProgress.knownPercent}%` : '0%' }} className={cn('bg-gradient-to-r', levelStyles[level].accent)} />
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                {isActive ? (
                  <>
                    <span>{formatNumber(levelProgress.known)} dikuasai</span>
                    <span>{formatNumber(levelProgress.due)} review</span>
                  </>
                ) : (
                  <>
                    <span>pilih level</span>
                    <span>siap belajar</span>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </section>

      {/* Filter bar */}
      <section className="st-card p-4 md:p-5">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr_0.8fr] gap-3">
          <label className="st-field">
            <span>Cari</span>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                className="st-input pl-9"
                placeholder="Cari kata, arti, artikel, atau contoh kalimat..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </label>

          <label className="st-field">
            <span>Filter progres</span>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select className="st-input pl-9" value={filter} onChange={(e) => setFilter(e.target.value as FilterType)}>
                <option value="all">Semua Kata</option>
                <option value="new">Kata Baru</option>
                <option value="learning">Sedang Dipelajari</option>
                <option value="learned">Sudah Dikuasai</option>
              </select>
            </div>
          </label>

          <label className="st-field">
            <span>Urutkan</span>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select className="st-input pl-9" value={sort} onChange={(e) => setSort(e.target.value as SortType)}>
                <option value="default">Urutan Materi</option>
                <option value="german">Jerman A-Z</option>
                <option value="indonesian">Indonesia A-Z</option>
              </select>
            </div>
          </label>
        </div>
      </section>

      {/* Tab Switcher */}
      <div className="st-segmented w-fit">
        <Button
          variant={activeTab === 'flashcard' ? 'default' : 'ghost'}
          className="px-4"
          aria-pressed={activeTab === 'flashcard'}
          onClick={() => setActiveTab('flashcard')}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Kartu Latihan
        </Button>
        <Button
          variant={activeTab === 'list' ? 'default' : 'ghost'}
          className="px-4"
          aria-pressed={activeTab === 'list'}
          onClick={() => setActiveTab('list')}
        >
          <List className="w-4 h-4 mr-2" />
          Daftar Kata
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {!vocabLoaded ? (
          <div className="st-card flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Memuat progres...</p>
          </div>
        ) : activeTab === 'flashcard' ? (
          <motion.section
            key="flashcards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-5"
          >
            {currentCard ? (
              <>
                <div className="st-card p-4 md:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-2 font-semibold">
                      <Target className="w-4 h-4" />
                      Kartu {cardsReviewed + 1} dari {formatNumber(dueCards.length)} perlu review
                    </span>
                    <span className="font-semibold">{formatNumber(filteredVocab.length)} kata tampil • {progressPercent}% dikuasai</span>
                  </div>
                  <div className="mt-3 st-progress h-2.5">
                    <motion.span
                      className={cn('bg-gradient-to-r', levelStyles[selectedLevel].accent)}
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="relative min-h-[22rem] md:min-h-[24rem] w-full perspective-1000 cursor-pointer" onClick={handleFlip}>
                  <motion.div
                    className="w-full h-full min-h-[22rem] md:min-h-[24rem] transition-all duration-500 preserve-3d relative"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    {/* Front */}
                    <div className="st-study-card absolute inset-0 backface-hidden text-center">
                      <span className={cn('st-badge border mb-5', levelStyles[selectedLevel].soft)}>{selectedLevel}</span>
                      <h2 className="text-5xl md:text-7xl font-black tracking-tight">{currentCard.word}</h2>
                      {currentCard.article && (
                        <div className="mt-5 flex justify-center">
                          <span className="st-badge st-badge--neutral">
                            <span className={cn('h-2 w-2 rounded-full', articleColors[currentCard.article] || 'bg-muted-foreground')} />
                            {currentCard.article}
                          </span>
                        </div>
                      )}
                      {currentCard.phonetic && (
                        <p className="mt-4 font-mono text-sm text-muted-foreground">/{currentCard.phonetic}/</p>
                      )}
                      <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse">Tap untuk lihat arti</p>
                    </div>

                    {/* Back */}
                    <div className="st-study-card st-study-card--answer absolute inset-0 backface-hidden rotate-y-180 text-center">
                      <span className="st-badge st-badge--primary st-badge--soft mb-4">Arti</span>
                      <h2 className="text-4xl md:text-6xl font-black text-primary">{currentCard.translation}</h2>
                      {currentCard.example_sentence && (
                        <p className="mt-4 max-w-2xl text-sm md:text-base text-muted-foreground italic">“{currentCard.example_sentence}”</p>
                      )}

                      <div className="mt-6 flex flex-wrap justify-center gap-3">
                        <Button variant="outline" className="flex items-center gap-2 px-4" onClick={(e) => { e.stopPropagation(); fetchPronunciation(e); }}>
                          {pronunciationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                          Pelafalan
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2 px-4" onClick={(e) => { e.stopPropagation(); fetchExamples(e); }}>
                          {examplesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                          Contoh
                        </Button>
                      </div>

                      {pronunciation && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 st-note text-center w-full">
                          <p className="font-mono font-bold text-primary">{pronunciation.phonetic}</p>
                          <p className="text-muted-foreground italic">{pronunciation.tip}</p>
                        </motion.div>
                      )}

                      {examples && examples.length > 0 && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4 grid gap-2 w-full text-left">
                          {examples.map((ex, i) => (
                            <div key={`${ex.german}-${i}`} className="st-note">
                              <p className="font-semibold">{ex.german}</p>
                              <p className="text-muted-foreground text-xs">{ex.indonesian}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>

                <div className="flex justify-center gap-4 md:gap-6">
                  <Button variant="destructive" size="lg" className="w-36 h-16 text-lg flex flex-col items-center gap-1" onClick={() => handleAnswer(false)}>
                    <X className="w-6 h-6" />
                    <span>Belajar</span>
                  </Button>
                  <Button variant="default" size="lg" className="w-36 h-16 text-lg flex flex-col items-center gap-1 bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => handleAnswer(true)}>
                    <Check className="w-6 h-6" />
                    <span>Bisa</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="st-card flex flex-col items-center justify-center py-20 text-center space-y-4 border-dashed">
                <div className="p-4 rounded-2xl bg-primary/10">
                  <Trophy className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-black">Level selesai!</h3>
                <p className="text-muted-foreground max-w-sm">Tidak ada card due untuk filter ini. Ganti filter/level atau reset session.</p>
                <Button onClick={() => setCardsReviewed(0)} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Ulangi Sesi
                </Button>
              </div>
            )}
          </motion.section>
        ) : (
          <motion.section
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="st-card overflow-hidden"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3 md:px-5">
              <div>
                <h2 className="font-black">Daftar Kosakata</h2>
                <p className="text-xs text-muted-foreground">{formatNumber(filteredVocab.length)} kata dari level {selectedLevel}</p>
              </div>
              <span className="st-badge st-badge--primary st-badge--soft">{formatNumber(filteredSummary.due)} perlu review</span>
            </div>
            <div className="overflow-x-auto">
              <table className="st-table">
                <thead>
                  <tr>
                    <th>Kata</th>
                    <th>Arti</th>
                    <th>Materi</th>
                    <th>Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedVocab.map((v) => {
                    const progress = vocab[v.id];
                    return (
                      <tr key={v.id} data-state={progress?.status === 'known' ? 'active' : undefined}>
                        <td>
                          <div className="flex items-center gap-3">
                            {v.article && <span className={cn('h-2.5 w-2.5 rounded-full', articleColors[v.article] || 'bg-muted-foreground')} />}
                            <div>
                              <span className="font-bold">{v.word}</span>
                              {v.phonetic && <p className="font-mono text-[11px] text-muted-foreground">/{v.phonetic}/</p>}
                            </div>
                          </div>
                        </td>
                        <td className="text-muted-foreground">{v.translation}</td>
                        <td>
                          <span className="st-badge st-badge--neutral">{v.lesson_id || selectedLevel}</span>
                        </td>
                        <td>
                          <span className={statusBadge(progress?.status)}>
                            {progress?.status === 'known' ? 'Dikuasai' : progress?.status === 'learning' ? 'Sedang Dipelajari' : 'Baru'}
                          </span>
                        </td>
                        <td className="text-right">
                          <Button variant="ghost" size="sm" className="opacity-70 transition-opacity hover:opacity-100" onClick={() => updateVocab(user?.id || '', v.id, 'known')}>
                            <Check className="w-4 h-4 text-emerald-500" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredVocab.length === 0 ? (
                <div className="py-20 text-center text-muted-foreground">Tidak ada kosakata untuk filter ini.</div>
              ) : (
                <div className="p-4 flex justify-center border-t border-border">
                  <Pagination page={listPage} pageCount={Math.max(1, Math.ceil(filteredVocab.length / PAGE_SIZE))} onPageChange={setListPage} />
                </div>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
