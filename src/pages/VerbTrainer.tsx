import { useState, useMemo } from 'react';
import { Search, Check, X, RotateCcw, ChevronRight, BookOpen, Zap } from 'lucide-react';
import { cn } from '../lib/utils';
import { allVocab } from '../data/lessons';

export interface VerbConjugation {
  infinitive: string;
  translation: string;
  type: 'regular' | 'irregular';
  present: {
    ich: string;
    du: string;
    'er/sie/es': string;
    wir: string;
    ihr: string;
    sie: string;
  };
  perfekt: string;
  prateritum: {
    ich: string;
    'er/sie/es': string;
  };
}

const verbDictionary: VerbConjugation[] = [
  {
    infinitive: 'sein',
    translation: 'adalah (to be)',
    type: 'irregular',
    present: { ich: 'bin', du: 'bist', 'er/sie/es': 'ist', wir: 'sind', ihr: 'seid', sie: 'sind' },
    perfekt: 'ist gewesen',
    prateritum: { ich: 'war', 'er/sie/es': 'war' }
  },
  {
    infinitive: 'haben',
    translation: 'memiliki',
    type: 'irregular',
    present: { ich: 'habe', du: 'hast', 'er/sie/es': 'hat', wir: 'haben', ihr: 'habt', sie: 'haben' },
    perfekt: 'hat gehabt',
    prateritum: { ich: 'hatte', 'er/sie/es': 'hatte' }
  },
  {
    infinitive: 'machen',
    translation: 'melakukan/membuat',
    type: 'regular',
    present: { ich: 'mache', du: 'machst', 'er/sie/es': 'macht', wir: 'machen', ihr: 'macht', sie: 'machen' },
    perfekt: 'hat gemacht',
    prateritum: { ich: 'machte', 'er/sie/es': 'machte' }
  },
  {
    infinitive: 'gehen',
    translation: 'pergi',
    type: 'irregular',
    present: { ich: 'gehe', du: 'gehst', 'er/sie/es': 'geht', wir: 'gehen', ihr: 'geht', sie: 'gehen' },
    perfekt: 'ist gegangen',
    prateritum: { ich: 'ging', 'er/sie/es': 'ging' }
  }
];

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

  const filteredVerbs = useMemo(() => {
    return verbDictionary.filter(v => 
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

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Kamus Mini (Semua Kata)</h1>
        <p className="text-muted-foreground text-lg md:text-xl">Cari kata sifat, kata benda, maupun kata kerja. Bahasa Indonesia atau Jerman!</p>
      </div>

      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-muted-foreground" />
        </div>
        <input 
          type="text" 
          placeholder="Cari kata (misal: rumah, gehen, schön)..."
          className="w-full bg-card border-2 border-border rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {searchTerm && (filteredVerbs.length > 0 || filteredVocab.length > 0) && (
         <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-border pb-4">Hasil Pencarian ({filteredVerbs.length + filteredVocab.length})</h2>
            
            <div className="space-y-4">
              {filteredVocab.map(v => (
                <div key={v.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-card rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-center space-x-3 mb-1">
                      {v.article && (
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-md text-white shadow-sm",
                          articleColors[v.article] || 'bg-gray-500'
                        )}>{v.article}</span>
                      )}
                      <span className="font-bold text-xl text-foreground">{v.word}</span>
                    </div>
                    <p className="text-muted-foreground text-lg mb-2">{v.translation}</p>
                    <p className="text-muted-foreground italic font-medium whitespace-pre-wrap">{v.exampleSentence}</p>
                  </div>
                  <div className="mt-3 sm:mt-0 text-left sm:text-right">
                    <span className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-xs font-bold uppercase">{v.level}</span>
                  </div>
                </div>
              ))}
            </div>
         </div>
      )}

      {searchTerm && filteredVerbs.length > 0 && (
          <div className="mb-8 mt-12">
            <h2 className="text-2xl font-bold mb-6 text-foreground border-b border-border pb-4">Tabel Konjugasi Verba Terkait</h2>
          </div>
      )}

      <div className="space-y-8">
        {!searchTerm && (
          <div className="text-center py-12 text-muted-foreground">
            Ketik kata di kotak pencarian untuk melihat hasil dari pelajaran A1 sampai B2.
          </div>
        )}
        {(searchTerm && filteredVerbs.map(verb => (
            <div key={verb.infinitive} className="bg-card rounded-3xl border border-border overflow-hidden shadow-sm">
              <div className="p-6 md:p-8 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-3xl font-extrabold text-foreground">{verb.infinitive}</h2>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                      verb.type === 'irregular' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    )}>
                      {verb.type === 'irregular' ? 'Kuat / Tidak Beraturan' : 'Lemah / Beraturan'}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-lg">{verb.translation}</p>
                </div>
                
                <div className="flex flex-col text-sm border border-border p-3 rounded-xl bg-muted">
                  <span className="text-muted-foreground font-medium">Perfekt</span>
                  <span className="font-bold">{verb.perfekt}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 bg-muted">
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
