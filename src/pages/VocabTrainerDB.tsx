import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { 
  ChevronRight, RotateCcw, Brain, Check, X, Volume2, 
  Search, Loader2, List, LayoutGrid, Filter, ArrowUpDown,
  BookOpen, Target, Trophy
} from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

type TabType = 'flashcard' | 'list';
type FilterType = 'all' | 'learned' | 'learning' | 'new';
type SortType = 'default' | 'german' | 'indonesian';

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  A1: { bg: 'bg-emerald-500', text: 'text-white', border: 'border-emerald-500' },
  A2: { bg: 'bg-teal-500', text: 'text-white', border: 'border-teal-500' },
  B1: { bg: 'bg-blue-500', text: 'text-white', border: 'border-blue-500' },
  B2: { bg: 'bg-indigo-500', text: 'text-white', border: 'border-indigo-500' },
};

const articleColors: Record<string, string> = {
  der: 'bg-blue-500',
  die: 'bg-red-500',
  das: 'bg-green-500',
};

export default function VocabTrainerDB() {
  const { user } = useAuthStore();
  const { vocab, updateVocab } = useProgressStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('flashcard');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('default');
  const [selectedLevel, setSelectedLevel] = useState<string>('A1');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [dbVocab, setDbVocab] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  
  const [examplesLoading, setExamplesLoading] = useState(false);
  const [examples, setExamples] = useState<{german: string, indonesian: string}[] | null>(null);
  const [pronunciationLoading, setPronunciationLoading] = useState(false);
  const [pronunciation, setPronunciation] = useState<{phonetic: string, tip: string} | null>(null);

  useEffect(() => {
    fetchVocab();
  }, [selectedLevel]);

  const fetchVocab = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('curriculum_vocabulary')
        .select('*')
        .eq('level_id', selectedLevel)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      setDbVocab(data || []);
    } catch (e) {
      console.error('Error fetching vocab:', e);
    } finally {
      setLoading(false);
    }
  };

  const filteredVocab = useMemo(() => {
    let result = [...dbVocab];

    if (searchQuery) {
      result = result.filter(v => 
        v.word.toLowerCase().includes(searchQuery.toLowerCase()) || 
        v.translation.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filter !== 'all') {
      result = result.filter(v => {
        const progress = vocab[v.id];
        if (filter === 'learned') return progress?.status === 'known';
        if (filter === 'learning') return progress?.status === 'learning';
        if (filter === 'new') return !progress;
        return true;
      });
    }

    if (sort === 'german') result.sort((a, b) => a.word.localeCompare(b.word));
    if (sort === 'indonesian') result.sort((a, b) => a.translation.localeCompare(b.translation));

    return result;
  }, [dbVocab, searchQuery, filter, sort, vocab]);

  const dueCards = useMemo(() => {
    return filteredVocab.filter(v => {
      const progress = vocab[v.id];
      if (!progress) return true;
      return progress.nextReview <= Date.now();
    }).sort(() => Math.random() - 0.5);
  }, [filteredVocab, vocab]);

  const currentCard = dueCards[0];
  // Calculate from saved vocab data (persists across page navigation)
  const knownCount = filteredVocab.filter(v => vocab[v.id]?.status === 'known').length;
  const progressPercent = filteredVocab.length > 0 ? (knownCount / filteredVocab.length) * 100 : 0;

  const handleFlip = () => setIsFlipped(!isFlipped);

  const handleAnswer = async (known: boolean) => {
    if (!currentCard || !user) return;
    await updateVocab(user.id, currentCard.id, known ? 'known' : 'learning');
    setIsFlipped(false);
    setExamples(null);
    setPronunciation(null);
    setCardsReviewed(prev => prev + 1);
  };
  
  const fetchExamples = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (examples || examplesLoading) return;
    setExamplesLoading(true);
    try {
       const resp = await fetch('/api/ai?action=vocab-examples', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word: currentCard.word, level: currentCard.level_id })
       });
       const data = await resp.json();
       setExamples(data.examples);
    } catch(e) {
       console.error(e);
    } finally {
       setExamplesLoading(false);
    }
  }

  const fetchPronunciation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (pronunciation || pronunciationLoading) return;
    setPronunciationLoading(true);
    try {
       const resp = await fetch('/api/ai?action=pronunciation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word: currentCard.word })
       });
       const data = await resp.json();
       setPronunciation(data);
    } catch(e) {
       console.error(e);
    } finally {
       setPronunciationLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground animate-pulse">Loading vocabulary from database...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            Vocab Trainer
          </h1>
          <p className="text-muted-foreground">Master German vocabulary with spaced repetition</p>
        </div>
        
        <div className="flex items-center gap-2 bg-muted p-1 rounded-lg">
          {['A1', 'A2', 'B1', 'B2'].map(lvl => (
            <Button 
              key={lvl} 
              variant={selectedLevel === lvl ? 'default' : 'ghost'} 
              size="sm" 
              onClick={() => { setSelectedLevel(lvl); setCardsReviewed(0); }}
              className="h-8 px-3"
            >
              {lvl}
            </Button>
          ))}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-md focus:ring-2 focus:ring-primary outline-none transition-all"
            placeholder="Search words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select 
            className="flex-1 bg-card border border-border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-primary"
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterType)}
          >
            <option value="all">All Words</option>
            <option value="new">New Words</option>
            <option value="learning">Learning</option>
            <option value="learned">Learned</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
          <select 
            className="flex-1 bg-card border border-border rounded-md py-2 px-3 outline-none focus:ring-2 focus:ring-primary"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortType)}
          >
            <option value="default">Default Sort</option>
            <option value="german">Sort by German</option>
            <option value="indonesian">Sort by Indonesian</option>
          </select>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit">
        <Button 
          variant={activeTab === 'flashcard' ? 'default' : 'ghost'} 
          className="rounded-lg px-4"
          onClick={() => setActiveTab('flashcard')}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Flashcards
        </Button>
        <Button 
          variant={activeTab === 'list' ? 'default' : 'ghost'} 
          className="rounded-lg px-4"
          onClick={() => setActiveTab('list')}
        >
          <List className="w-4 h-4 mr-2" />
          Vocabulary List
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'flashcard' ? (
          <motion.div 
            key="flashcards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {dueCards.length > 0 ? (
              <>
                <div className="flex items-center justify-between text-sm text-muted-foreground px-1">
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    Card {cardsReviewed + 1} of {dueCards.length}
                  </span>
                  <span>{Math.round(progressPercent)}% complete</span>
                </div>
                
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary" 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div 
                  className="relative h-80 w-full perspective-1000 cursor-pointer"
                  onClick={handleFlip}
                >
                  <motion.div 
                    className="w-full h-full transition-all duration-500 preserve-3d relative"
                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  >
                    {/* Front */}
                    <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 bg-card border-2 border-border rounded-3xl shadow-xl text-center">
                      <div className={cn("px-3 py-1 rounded-full text-xs font-bold mb-6", levelColors[selectedLevel].bg, levelColors[selectedLevel].text)}>
                        {selectedLevel}
                      </div>
                      <h2 className="text-5xl font-bold mb-4 tracking-tight">
                        {currentCard.word}
                      </h2>
                      {currentCard.article && (
                        <div className={cn("px-3 py-1 rounded-full text-xs font-medium mb-4", articleColors[currentCard.article])}>
                          {currentCard.article}
                        </div>
                      )}
                      <p className="text-muted-foreground animate-pulse">Click to flip</p>
                    </div>

                    {/* Back */}
                    <div className="absolute inset-0 backface-hidden rotate-y-180 flex flex-col items-center justify-center p-8 bg-card border-2 border-primary rounded-3xl shadow-xl text-center">
                      <h2 className="text-4xl font-bold mb-6 text-primary">
                        {currentCard.translation}
                      </h2>
                      
                      <div className="flex gap-3">
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2 px-4"
                          onClick={(e) => { e.stopPropagation(); fetchPronunciation(e); }}
                        >
                          {pronunciationLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
                          Pronunciation
                        </Button>
                        <Button 
                          variant="outline" 
                          className="flex items-center gap-2 px-4"
                          onClick={(e) => { e.stopPropagation(); fetchExamples(e); }}
                        >
                          {examplesLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                          Examples
                        </Button>
                      </div>

                      {pronunciation && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 p-3 bg-muted rounded-lg text-sm text-center w-full"
                        >
                          <p className="font-mono font-bold text-primary">{pronunciation.phonetic}</p>
                          <p className="text-muted-foreground italic">{pronunciation.tip}</p>
                        </motion.div>
                      )}

                      {examples && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-4 space-y-2 w-full text-left"
                        >
                          {examples.map((ex, i) => (
                            <div key={i} className="p-2 bg-muted/50 rounded border border-border text-sm">
                              <p className="font-medium">{ex.german}</p>
                              <p className="text-muted-foreground text-xs">{ex.indonesian}</p>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>

                <div className="flex justify-center gap-6">
                  <Button 
                    variant="destructive" 
                    size="lg" 
                    className="w-32 h-16 rounded-2xl text-xl flex flex-col items-center gap-1"
                    onClick={() => handleAnswer(false)}
                  >
                    <X className="w-6 h-6" />
                    <span>Learning</span>
                  </Button>
                  <Button 
                    variant="default" 
                    size="lg" 
                    className="w-32 h-16 rounded-2xl text-xl flex flex-col items-center gap-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleAnswer(true)}
                  >
                    <Check className="w-6 h-6" />
                    <span>Known</span>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 bg-card border border-dashed border-border rounded-3xl">
                <div className="p-4 bg-primary/10 rounded-full">
                  <Trophy className="w-12 h-12 text-primary" />
                </div>
                <h3 className="text-2xl font-bold">Level Cleared!</h3>
                <p className="text-muted-foreground max-w-sm">
                  You've reviewed all words for this level. Try changing the level or filter!
                </p>
                <Button onClick={() => setCardsReviewed(0)} variant="outline">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Session
                </Button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 text-muted-foreground text-sm uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Word</th>
                    <th className="px-6 py-4 font-semibold">Translation</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredVocab.map((v) => (
                    <tr key={v.id} className="hover:bg-muted/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {v.article && (
                            <span className={cn("w-2 h-2 rounded-full", articleColors[v.article])} />
                          )}
                          <span className="font-medium">{v.word}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{v.translation}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {vocab[v.id]?.status === 'known' ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">KNOWN</span>
                          ) : vocab[v.id]?.status === 'learning' ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">LEARNING</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">NEW</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => updateVocab(user?.id || '', v.id, 'known')}
                        >
                          <Check className="w-4 h-4 text-emerald-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredVocab.length === 0 && (
                <div className="py-20 text-center text-muted-foreground">
                  No vocabulary found for these filters.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
