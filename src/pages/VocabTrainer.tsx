import { useState, useMemo } from 'react';
import { allVocab } from '../data/course';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { ChevronRight, RotateCcw, Brain, Check, X, Volume2, Search, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export default function VocabTrainer() {
  const { user } = useAuthStore();
  const { vocab, updateVocab } = useProgressStore();
  
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardsReviewed, setCardsReviewed] = useState(0);
  
  const [examplesLoading, setExamplesLoading] = useState(false);
  const [examples, setExamples] = useState<{german: string, indonesian: string}[] | null>(null);
  
  const [pronunciationLoading, setPronunciationLoading] = useState(false);
  const [pronunciation, setPronunciation] = useState<{phonetic: string, tip: string} | null>(null);

  // Simple logic to pick cards due for review or new cards
  const dueCards = useMemo(() => {
    const now = Date.now();
    return allVocab.filter(word => {
      const v = vocab[word.id];
      if (!v) return true; // new
      return v.nextReview <= now; // due
    }).sort(() => Math.random() - 0.5); // shuffle
  }, [vocab]);

  const currentCard = dueCards[0];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleAnswer = async (known: boolean) => {
    if (!currentCard || !user) return;
    
    await updateVocab(user.uid, currentCard.id, known ? 'known' : 'learning');
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
       const resp = await fetch('/api/vocab-examples', {
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
       const resp = await fetch('/api/pronunciation', {
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

  if (!currentCard) {
    return (
      <div className="max-w-2xl mx-auto pb-20 text-center">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-green-500" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Selesai untuk saat ini!</h1>
        <p className="text-slate-500 text-lg">Kamu telah ulas {cardsReviewed} kata. Silakan kembali besok.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pb-20">
      <div className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">Latihan Kosakata</h1>
        <p className="text-slate-500">Tersisa {dueCards.length} kata untuk diulas hari ini.</p>
      </div>

      <div className="relative perspective-1000 h-80 w-full cursor-pointer group" onClick={handleFlip}>
        <div className={cn(
          "w-full h-full transition-all duration-500 preserve-3d absolute inset-0",
          isFlipped ? "rotate-y-180" : ""
        )}>
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center shadow-lg hover:border-slate-300 transition-colors">
            {currentCard.article && (
               <span className={cn(
                 "text-sm font-bold px-3 py-1.5 rounded-lg text-white mb-4 uppercase tracking-widest",
                 currentCard.article === 'der' ? 'bg-blue-500' : 
                 currentCard.article === 'die' ? 'bg-red-500' : 'bg-green-500'
               )}>{currentCard.article}</span>
            )}
            <h2 className="text-5xl font-extrabold text-slate-900">{currentCard.word}</h2>
            <p className="text-slate-400 mt-8 flex items-center"><RotateCcw className="w-4 h-4 mr-2" /> Ketuk untuk membalik</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col items-center justify-center shadow-xl overflow-y-auto">
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-2">{currentCard.translation}</h2>
            <p className="text-slate-400 text-lg mb-6">Level: {currentCard.level}</p>
            
            <div className="w-full space-y-4 text-left">
              {!pronunciation && (
                 <Button onClick={fetchPronunciation} variant="outline" className="w-full rounded-2xl border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white" disabled={pronunciationLoading}>
                   {pronunciationLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Volume2 className="w-4 h-4 mr-2" />}
                   Cara Baca
                 </Button>
              )}
              {pronunciation && (
                 <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-white">
                   <p className="text-sm text-slate-400 mb-1">Ejaan IPA / Fonetik:</p>
                   <p className="text-xl font-mono text-yellow-400 mb-2">{pronunciation.phonetic}</p>
                   <p className="text-sm italic text-slate-300">💡 {pronunciation.tip}</p>
                 </div>
              )}

              {!examples && (
                 <Button onClick={fetchExamples} variant="outline" className="w-full rounded-2xl border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white" disabled={examplesLoading}>
                   {examplesLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
                   Lihat Contoh Kalimat
                 </Button>
              )}
              {examples && (
                 <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl text-white space-y-4">
                   {examples.map((ex, i) => (
                      <div key={i} className="space-y-1">
                         <p className="font-medium text-blue-300">"{ex.german}"</p>
                         <p className="text-sm text-slate-400">{ex.indonesian}</p>
                      </div>
                   ))}
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={cn("mt-12 grid grid-cols-2 gap-4 transition-opacity duration-300", isFlipped ? "opacity-100" : "opacity-0 pointer-events-none")}>
        <Button 
          onClick={() => handleAnswer(false)} 
          size="lg" 
          className="h-16 rounded-2xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-lg border border-red-200"
        >
          <X className="w-6 h-6 mr-2" />
          Lupa
        </Button>
        <Button 
          onClick={() => handleAnswer(true)} 
          size="lg" 
          className="h-16 rounded-2xl bg-green-100 hover:bg-green-200 text-green-700 font-bold text-lg border border-green-200"
        >
          <Check className="w-6 h-6 mr-2" />
          Ingat
        </Button>
      </div>
    </div>
  );
}
