import { useState, useMemo } from 'react';
import { Search, Check, X, RotateCcw, ChevronRight, BookOpen, Zap, Shuffle, Trophy } from 'lucide-react';
import { cn } from '../lib/utils';
import { verbDatabase, VerbConjugation } from '../data/verbs';
import { allVocab } from '../data/lessons';

const tenseLabels: Record<string, string> = {
  present: 'Präsens',
  perfekt: 'Perfekt',
  prateritum: 'Präteritum',
};

const pronouns = ['ich', 'du', 'er/sie/es', 'wir', 'ihr', 'sie'];

const articleColors: Record<string, string> = {
  der: 'bg-blue-500',
  die: 'bg-red-500',
  das: 'bg-green-500',
};

export default function VerbTrainer() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVerb, setSelectedVerb] = useState<VerbConjugation | null>(null);
  const [activeTense, setActiveTense] = useState<'present' | 'perfekt' | 'prateritum'>('present');
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [quizMode, setQuizMode] = useState(false);
  const [quizVerbs, setQuizVerbs] = useState<VerbConjugation[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);

  const filteredVerbs = useMemo(() => {
    return verbDatabase.filter(v => 
      v.infinitive.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const filteredVocab = useMemo(() => {
    return allVocab.filter(v => 
      v.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.translation.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handleSelectVerb = (verb: VerbConjugation) => {
    setSelectedVerb(verb);
    setActiveTense('present');
    setUserAnswers({});
    setShowAnswers(false);
  };

  const handleAnswerChange = (pronoun: string, value: string) => {
    setUserAnswers(prev => ({ ...prev, [pronoun]: value }));
  };

  const handleCheckAnswers = () => {
    if (!selectedVerb) return;
    
    let correct = 0;
    let total = 0;
    
    const conjugations = activeTense === 'present' 
      ? selectedVerb.present 
      : activeTense === 'prateritum' 
        ? selectedVerb.prateritum 
        : null;
    
    if (activeTense === 'present') {
      Object.entries(selectedVerb.present).forEach(([pronoun, correctAnswer]) => {
        total++;
        if (userAnswers[pronoun]?.toLowerCase().trim() === correctAnswer.toLowerCase()) {
          correct++;
        }
      });
    } else if (activeTense === 'prateritum') {
      Object.entries(selectedVerb.prateritum).forEach(([pronoun, correctAnswer]) => {
        total++;
        if (userAnswers[pronoun]?.toLowerCase().trim() === correctAnswer.toLowerCase()) {
          correct++;
        }
      });
    } else {
      // Perfekt is a single form
      total = 1;
      if (userAnswers['perfekt']?.toLowerCase().trim() === selectedVerb.perfekt.toLowerCase()) {
        correct = 1;
      }
    }
    
    setScore({ correct, total });
    setShowAnswers(true);
  };

  const handleReset = () => {
    setUserAnswers({});
    setShowAnswers(false);
    setScore({ correct: 0, total: 0 });
  };

  const handleStartQuiz = () => {
    const shuffled = [...verbDatabase].sort(() => Math.random() - 0.5).slice(0, 10);
    setQuizVerbs(shuffled);
    setQuizIndex(0);
    setQuizMode(true);
    setUserAnswers({});
    setShowAnswers(false);
    setScore({ correct: 0, total: 0 });
  };

  const handleQuizAnswer = (pronoun: string, value: string) => {
    setUserAnswers(prev => ({ ...prev, [pronoun]: value }));
  };

  const handleQuizCheck = () => {
    const verb = quizVerbs[quizIndex];
    if (!verb) return;
    let correct = 0;
    let total = 0;
    
    if (activeTense === 'present') {
      Object.entries(verb.present).forEach(([pronoun, correctAnswer]) => {
        total++;
        if (userAnswers[pronoun]?.toLowerCase().trim() === correctAnswer.toLowerCase()) correct++;
      });
    } else if (activeTense === 'prateritum') {
      Object.entries(verb.prateritum).forEach(([pronoun, correctAnswer]) => {
        total++;
        if (userAnswers[pronoun]?.toLowerCase().trim() === correctAnswer.toLowerCase()) correct++;
      });
    } else {
      total = 1;
      if (userAnswers['perfekt']?.toLowerCase().trim() === verb.perfekt.toLowerCase()) correct = 1;
    }
    setScore(prev => ({ correct: prev.correct + correct, total: prev.total + total }));
    setShowAnswers(true);
  };

  const handleQuizNext = () => {
    if (quizIndex < quizVerbs.length - 1) {
      setQuizIndex(quizIndex + 1);
      setUserAnswers({});
      setShowAnswers(false);
    } else {
      setQuizMode(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-serif font-extrabold tracking-tight mb-4">Kamus Mini (Semua Kata)</h1>
        <p className="text-muted-foreground text-lg md:text-xl">Cari kata sifat, kata benda, maupun kata kerja. Bahasa Indonesia atau Jerman!</p>
      </div>

      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <input 
          type="text" 
          placeholder="Cari kata (misal: rumah, gehen, schön)..."
          className="w-full glass-card/20 py-4 pl-12 pr-4 text-lg focus:outline-none focus:border-[#8b2500] focus:ring-2 focus:ring-[#8b2500]/20 transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchTerm && (filteredVerbs.length > 0 || filteredVocab.length > 0) && (
         <div className="mb-8">
            <h2 className="text-2xl font-serif font-bold mb-6 text-[#0a0a0a] border-b border-[#0a0a0a]/10 pb-4">Hasil Pencarian ({filteredVerbs.length + filteredVocab.length})</h2>
            
            <div className="space-y-4">
              {filteredVocab.map(v => (
                <div key={v.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-[#f5f0eb] border border-[#0a0a0a]/10 hover:bg-[#0a0a0a]/3 transition-colors">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      {v.article && (
                        <span className={cn(
                          "text-xs font-bold px-2 py-1  bg-[#0a0a0a] text-[#f5f0eb] ",
                          articleColors[v.article] || 'bg-gray-500'
                        )}>{v.article}</span>
                      )}
                      <span className="font-bold text-xl text-foreground">{v.word}</span>
                    </div>
                    <p className="text-muted-foreground text-lg mb-2">{v.translation}</p>
                    <p className="text-muted-foreground italic font-medium whitespace-pre-wrap">{v.exampleSentence}</p>
                  </div>
                  <div className="mt-3 sm:mt-0 text-left sm:text-right">
                    <span className="bg-muted text-muted-foreground px-3 py-1  text-xs font-bold uppercase">{v.level}</span>
                  </div>
                </div>
              ))}
            </div>
         </div>
      )}

      {searchTerm && filteredVerbs.length > 0 && (
          <div className="mb-8 mt-12">
            <h2 className="text-2xl font-serif font-bold mb-6 text-[#0a0a0a] border-b border-[#0a0a0a]/10 pb-4">Tabel Konjugasi Verba Terkait</h2>
          </div>
      )}

      <div className="space-y-8">
        {!searchTerm && (
          <div className="text-center py-12 text-muted-foreground">
            Ketik kata di kotak pencarian untuk melihat hasil dari pelajaran A1 sampai B2.
          </div>
        )}
        {(searchTerm && filteredVerbs.map(verb => (
            <div key={verb.infinitive} className="glass-card overflow-hidden">
              <div className="p-6 md:p-8 border-b border-[#0a0a0a]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-3xl font-serif font-extrabold text-[#0a0a0a]">{verb.infinitive}</h2>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1  uppercase tracking-wider",
                      verb.type === 'irregular' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    )}>
                      {verb.type === 'irregular' ? 'Kuat / Tidak Beraturan' : 'Lemah / Beraturan'}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-lg">{verb.translation}</p>
                </div>
                
                <div className="flex flex-col text-sm border border-border p-3  bg-muted">
                  <span className="text-muted-foreground font-medium">Perfekt</span>
                  <span className="font-bold">{verb.perfekt}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
                <div className="p-6 border-b md:border-b-0 md:border-r border-border">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Präsens</h3>
                  <div className="space-y-3">
                    {Object.entries(verb.present).map(([pronoun, conj]) => (
                      <div key={pronoun} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                        <span className="text-muted-foreground">{pronoun}</span>
                        <span className="font-bold text-foreground">{conj}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Präteritum (Lampu)</h3>
                  <div className="space-y-3">
                    {Object.entries(verb.prateritum).map(([pronoun, conj]) => (
                      <div key={pronoun} className="flex justify-between items-center border-b border-border pb-2 last:border-0 last:pb-0">
                        <span className="text-muted-foreground">{pronoun}</span>
                        <span className="font-bold text-foreground">{conj}</span>
                      </div>
                    ))}
                    <div className="pt-2 text-xs text-muted-foreground italic">
                      Bentuk untuk subjek lain dapat diturunkan.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
