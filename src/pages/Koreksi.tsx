import { useState } from 'react';
import { Sparkles, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

export default function Koreksi() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ isPerfect: boolean, correctedSentence: string, explanation: string } | null>(null);

  const handleKoreksi = async () => {
    if(!input.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const resp = await fetch('/api/ai?action=koreksi-kalimat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence: input.trim() })
      });
      const data = await resp.json();
      setResult(data);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center space-x-3">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          <span>Koreksi Kalimat Pintar</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">Tuliskan kalimat bahasa Jermanmu, AI kami akan memeriksa tata bahasa dan strukturnya.</p>
      </div>

      <div className="bg-card p-6 md:p-8  border border-border  mb-8">
        <label className="block text-foreground font-bold mb-4 text-lg">Kalimat Kamu:</label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Misal: Ich habe einen auto gekauft..."
          className="w-full min-h-[120px] bg-muted border-2 border-border  p-4 text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium resize-none mb-6"
        />
        <Button 
          onClick={handleKoreksi} 
          disabled={loading || !input.trim()}
          size="lg" 
          className="w-full sm:w-auto h-14 px-8  text-lg font-bold bg-[#0a0a0a] hover:bg-slate-800"
        >
          {loading ? (
             <><Loader2 className="w-5 h-5 mr-3 animate-spin"/> Menganalisis...</>
          ) : (
             "Cek Kalimat"
          )}
        </Button>
      </div>

      {result && (
        <div className="animate-in fade-in-50 slide-in-from-bottom-4 duration-500 space-y-6">
          <div className={cn(
            "p-6 md:p-8  border-2  flex flex-col sm:flex-row gap-6",
            result.isPerfect ? "bg-green-50 border-green-200" : "bg-orange-50 border-orange-200"
          )}>
            <div className="flex-shrink-0">
               {result.isPerfect ? (
                 <div className="w-16 h-16 bg-green-100 text-green-600  flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8" />
                 </div>
               ) : (
                 <div className="w-16 h-16 bg-orange-100 text-orange-600  flex items-center justify-center">
                    <AlertCircle className="w-8 h-8" />
                 </div>
               )}
            </div>
            <div className="flex-1">
               <h3 className={cn(
                 "text-xl font-bold mb-2",
                 result.isPerfect ? "text-green-800" : "text-orange-800"
               )}>
                 {result.isPerfect ? "Sempurna!" : "Bisa Diperbaiki"}
               </h3>
               {!result.isPerfect && (
                 <div className="mb-4 text-2xl font-extrabold text-foreground">
                    {result.correctedSentence}
                 </div>
               )}
               <div className="prose prose-slate prose-lg">
                 <ReactMarkdown>{result.explanation}</ReactMarkdown>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
