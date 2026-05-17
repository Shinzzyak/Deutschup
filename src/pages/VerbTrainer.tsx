import { useState } from 'react';
import { Search } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';

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

export default function VerbTrainer() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredVerbs = verbDictionary.filter(v => 
    v.infinitive.toLowerCase().includes(searchTerm.toLowerCase()) || 
    v.translation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Kamus Konjugasi Verba</h1>
        <p className="text-slate-500 text-lg md:text-xl">Cari kata kerja dan temukan konjugasinya</p>
      </div>

      <div className="relative mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400" />
        </div>
        <input 
          type="text" 
          placeholder="Cari kata kerja (misal: machen)..."
          className="w-full bg-white border-2 border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-8">
        {filteredVerbs.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            Kata kerja tidak ditemukan di kamus Mini kami.
          </div>
        ) : (
          filteredVerbs.map(verb => (
            <div key={verb.infinitive} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-3 mb-1">
                    <h2 className="text-3xl font-extrabold text-slate-900">{verb.infinitive}</h2>
                    <span className={cn(
                      "text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider",
                      verb.type === 'irregular' ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    )}>
                      {verb.type === 'irregular' ? 'Kuat / Tidak Beraturan' : 'Lemah / Beraturan'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-lg">{verb.translation}</p>
                </div>
                
                <div className="flex flex-col text-sm border border-slate-100 p-3 rounded-xl bg-slate-50">
                  <span className="text-slate-500 font-medium">Perfekt</span>
                  <span className="font-bold">{verb.perfekt}</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 bg-slate-50">
                <div className="p-6 border-b md:border-b-0 md:border-r border-slate-200">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Präsens</h3>
                  <div className="space-y-3">
                    {Object.entries(verb.present).map(([pronoun, conj]) => (
                      <div key={pronoun} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-500">{pronoun}</span>
                        <span className="font-bold text-slate-900">{conj}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Präteritum (Lampu)</h3>
                  <div className="space-y-3">
                    {Object.entries(verb.prateritum).map(([pronoun, conj]) => (
                      <div key={pronoun} className="flex justify-between items-center border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                        <span className="text-slate-500">{pronoun}</span>
                        <span className="font-bold text-slate-900">{conj}</span>
                      </div>
                    ))}
                    <div className="pt-2 text-xs text-slate-400 italic">
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
