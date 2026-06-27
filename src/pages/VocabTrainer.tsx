import { useState, useMemo, useEffect } from 'react';
import { allVocab } from '../data/lessons';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { ChevronRight, RotateCcw, Brain, Check, X, Volume2, Search, Loader2, List, LayoutGrid, Filter, ArrowUpDown } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

type TabType = 'flashcard' | 'list';
type FilterType = 'all' | 'learned' | 'learning' | 'new';
type SortType = 'default' | 'german' | 'indonesian';

const levelColors: Record<string, { bg: string; text: string; border: string }> = {
  A1: { bg: 'bg-emerald-500', text: 'bg-[#0a0a0a]', border: 'border-emerald-500' },
  A2: { bg: 'bg-teal-500', text: 'bg-[#0a0a0a]', border: 'border-teal-500' },
  B1: { bg: 'bg-blue-500', text: 'bg-[#0a0a0a]', border: 'border-blue-500' },
  B2: { bg: 'bg-indigo-500', text: 'bg-[#0a0a0a]', border: 'border-indigo-500' },
};

const articleColors: Record<string, string> = {
  der: 'bg-blue-500',
  die: 'bg-red-500',
  das: 'bg-green-500',
};

export default function VocabTrainer() {
  const { user } = useAuthStore();
  const { vocab, updateVocab, loadProgress } = useProgressStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('flashcard');
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('default');

  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  
  const [examplesLoading, setExamplesLoading] = useState(false);
  const [examples, setExamples] = useState<{german: string, indonesian: string}[] | null>(null);
  
  const [pronunciationLoading, setPronunciationLoading] = useState(false);
  const [pronunciation, setPronunciation] = useState<{phonetic: string, tip: string} | null>(null);

  // Load vocab progress from localStorage on mount
  useEffect(() => {
    if (user?.id) {
      loadProgress(user.id);
    }
  }, [user?.id]);

  const dueCards = useMemo(() => {
    const now = Date.now();
    return allVocab.filter(word => {
      const v = vocab[word.id];
      if (!v) return true;
      return v.nextReview <= now;
    }).sort(() => Math.random() - 0.5);
  }, [vocab]);

  const currentCard = dueCards[0];
  // Calculate from saved vocab data (persists across page navigation)
  const allVocabWords = Object.keys(vocab).length;
  const knownCount = Object.values(vocab).filter(v => v.status === 'known').length;
  const progressPercent = allVocabWords > 0 ? (knownCount / allVocabWords) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

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
          body: JSON.stringify({ word: currentCard.word, level: currentCard.level })
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

  const listData = useMemo(() => {
    let result = [...allVocab];

    if (filter !== 'all') {
      result = result.filter(v => {
        const status = vocab[v.id]?.status;
        if (filter === 'learned') return status === 'known';
        if (filter === 'learning') return status === 'learning';
        if (filter === 'new') return !status;
        return true;
      });
    }

    if (sort === 'german') {
      result.sort((a, b) => a.word.localeCompare(b.word));
    } else if (sort === 'indonesian') {
      result.sort((a, b) => a.translation.localeCompare(b.translation));
    }

    return result;
  }, [vocab, filter, sort]);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">Latihan Kosakata</h1>
          <p className="text-muted-foreground text-lg">Tingkatkan penguasaan kata-kata baru.</p>
        </div>
        
        <div className="flex bg-muted p-1 ">
          <button 
            onClick={() => setActiveTab('flashcard')}
            className={cn(
              "px-4 py-2 flex items-center space-x-2  text-sm font-bold transition-all",
              activeTab === 'flashcard' ? "bg-card text-foreground " : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Brain className="w-4 h-4" />
            <span>Flashcards</span>
          </button>
          <button 
            onClick={() => setActiveTab('list')}
            className={cn(
              "px-4 py-2 flex items-center space-x-2  text-sm font-bold transition-all",
              activeTab === 'list' ? "bg-card text-foreground " : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="w-4 h-4" />
            <span>Daftar</span>
          </button>
        </div>
      </div>

      {activeTab === 'flashcard' && (
        <div className="max-w-xl mx-auto">
          {!currentCard ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-green-100  flex items-center justify-center mx-auto mb-6">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight mb-4">Selesai untuk saat ini!</h2>
              <p className="text-muted-foreground text-lg">Kamu telah ulas {cardsReviewed} kata. Silakan kembali besok.</p>
            </div>
          ) : (
            <>
              <p className="text-muted-foreground text-center mb-6">Tersisa {dueCards.length} kata untuk diulas hari ini.</p>
              
              <div className="relative perspective-1000 h-80 w-full cursor-pointer group" onClick={handleFlip}>
                <div className={cn(
                  "w-full h-full transition-all duration-500 preserve-3d absolute inset-0",
                  isFlipped ? "rotate-y-180" : ""
                )}>
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden bg-card border-2 border-border  p-8 flex flex-col items-center justify-center  hover:border-border transition-colors">
                    {currentCard.article && (
                      <span className={cn(
                        "text-sm font-bold px-3 py-1.5  bg-[#0a0a0a] mb-4 uppercase tracking-widest",
                        articleColors[currentCard.article] || 'bg-gray-500'
                      )}>{currentCard.article}</span>
                    )}
                    <h2 className="text-5xl font-extrabold text-foreground">{currentCard.word}</h2>
                    <p className="text-muted-foreground mt-8 flex items-center"><RotateCcw className="w-4 h-4 mr-2" /> Ketuk untuk membalik</p>
                  </div>

                  {/* Back */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#0a0a0a] border-2 border-slate-800  p-6 md:p-8 flex flex-col items-center justify-center  overflow-y-auto">
                    <h2 className="text-4xl md:text-5xl font-extrabold bg-[#0a0a0a] mb-2">{currentCard.translation}</h2>
                    <p className="text-muted-foreground text-lg mb-6">Level: {currentCard.level}</p>
                    
                    <div className="w-full space-y-4 text-left">
                      {!pronunciation && (
                        <Button onClick={fetchPronunciation} variant="outline" className="w-full  border-slate-700 bg-slate-800 bg-[#0a0a0a] hover:bg-slate-700 hover:bg-[#0a0a0a]" disabled={pronunciationLoading}>
                          {pronunciationLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Volume2 className="w-4 h-4 mr-2" />}
                          Cara Baca
                        </Button>
                      )}
                      {pronunciation && (
                        <div className="bg-slate-800 border border-slate-700 p-4  bg-[#0a0a0a]">
                          <p className="text-sm text-muted-foreground mb-1">Ejaan IPA / Fonetik:</p>
                          <p className="text-xl font-mono text-yellow-400 mb-2">{pronunciation.phonetic}</p>
                          <p className="text-sm italic text-[#0a0a0a]/30">💡 {pronunciation.tip}</p>
                        </div>
                      )}

                      {!examples && (
                        <Button onClick={fetchExamples} variant="outline" className="w-full  border-slate-700 bg-slate-800 bg-[#0a0a0a] hover:bg-slate-700 hover:bg-[#0a0a0a]" disabled={examplesLoading}>
                          {examplesLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                          Lihat Contoh Kalimat
                        </Button>
                      )}
                      {examples && (
                        <div className="bg-slate-800 border border-slate-700 p-4  bg-[#0a0a0a] space-y-4">
                          {examples.map((ex, i) => (
                            <div key={i} className="space-y-1">
                                <p className="font-medium text-blue-300">"{ex.german}"</p>
                                <p className="text-sm text-muted-foreground">{ex.indonesian}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn("mt-8 md:mt-12 grid grid-cols-2 gap-3 md:gap-4 transition-opacity duration-300", isFlipped ? "opacity-100" : "opacity-0 pointer-events-none")}>
                <Button 
                  onClick={() => handleAnswer(false)} 
                  size="lg" 
                  className="h-16  bg-red-100 hover:bg-red-200 text-red-700 font-bold text-lg border border-red-200"
                >
                  <X className="w-6 h-6 mr-2" />
                  Lupa
                </Button>
                <Button 
                  onClick={() => handleAnswer(true)} 
                  size="lg" 
                  className="h-16  bg-green-100 hover:bg-green-200 text-green-700 font-bold text-lg border border-green-200"
                >
                  <Check className="w-6 h-6 mr-2" />
                  Ingat
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'list' && (
        <div>
          <div className="bg-card p-4  border border-border mb-6 flex flex-col sm:flex-row gap-4 items-center">
             <div className="flex-1 flex gap-4 w-full">
               <div className="flex-1 space-y-2">
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center"><Filter className="w-3 h-3 mr-1" /> Filter</label>
                 <select 
                   value={filter}
                   onChange={(e) => setFilter(e.target.value as FilterType)}
                   className="w-full bg-muted border border-border  px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="all">Semua Kata</option>
                   <option value="learned">Sudah Dipelajari</option>
                   <option value="learning">Sedang Dipelajari</option>
                   <option value="new">Belum Dipelajari</option>
                 </select>
               </div>
               
               <div className="flex-1 space-y-2">
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center"><ArrowUpDown className="w-3 h-3 mr-1" /> Urutkan</label>
                 <select 
                   value={sort}
                   onChange={(e) => setSort(e.target.value as SortType)}
                   className="w-full bg-muted border border-border  px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                 >
                   <option value="default">Default</option>
                   <option value="german">Abjad Jerman (A-Z)</option>
                   <option value="indonesian">Abjad Indonesia (A-Z)</option>
                 </select>
               </div>
             </div>
          </div>

          <div className="space-y-3">
             <p className="text-muted-foreground text-sm font-bold mb-4 px-1">Menampilkan {listData.length} kata</p>
             {listData.map(v => {
                const status = vocab[v.id]?.status;
                const lc = levelColors[v.level] || levelColors.A1;
                return (
                  <div key={v.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card  border border-border  hover: transition-shadow gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12  bg-muted flex items-center justify-center border border-border flex-shrink-0">
                         {status === 'known' ? (
                           <Check className="w-6 h-6 text-green-500" />
                         ) : status === 'learning' ? (
                           <RotateCcw className="w-5 h-5 text-amber-500" />
                         ) : (
                           <div className="w-2 h-2  bg-slate-300"></div>
                         )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {v.article && (
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#0a0a0a] uppercase tracking-wider",
                              articleColors[v.article] || 'bg-gray-500'
                            )}>{v.article}</span>
                          )}
                          <span className="font-extrabold text-lg text-foreground">{v.word}</span>
                        </div>
                        <p className="text-muted-foreground">{v.translation}</p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
                       <span className={cn(
                         "px-2 py-1  text-xs font-bold uppercase",
                         lc.bg, lc.text
                       )}>{v.level}</span>
                       <span className="text-xs font-medium text-muted-foreground">
                         {status === 'known' ? 'Dipelajari' : status === 'learning' ? 'Sedang belajar' : 'Baru'}
                       </span>
                    </div>
                  </div>
                )
             })}
             
             {listData.length === 0 && (
                <div className="text-center py-12 bg-card  border border-border border-dashed">
                  <p className="text-muted-foreground">Tidak ada kosakata yang cocok dengan filter.</p>
                </div>
             )}
          </div>
        </div>
      )}
    </div>
  );
}
