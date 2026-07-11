import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useLearningStore } from '../stores/learningStore';
import { isUserPro } from '../lib/subscription';
import { useProgressStore } from '../stores/progressStore';
import { Button } from '../components/ui/button';
import { FileText, Loader2, PlayCircle, Timer, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { authedFetch } from '../lib/auth-headers';

type MockQuestion = {
  id: string;
  category: string;
  context?: string;
  question: string;
  options: string[];
  correctAnswer: string;
};

type UserAnswerInfo = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
};

export default function MockTest() {
  const { user, tierData, profileData } = useAuthStore();
  const { mockTests, saveMockTest } = useLearningStore();
  const { addXp } = useProgressStore();

  const [level, setLevel] = useState<'A1'|'A2'|'B1'|'B2'>('A1');
  const [testState, setTestState] = useState<'SETUP' | 'LOADING' | 'ONGOING' | 'EVALUATING' | 'RESULT'>('SETUP');
  
  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30 * 60);

  const [scoreInfo, setScoreInfo] = useState<{score: number, total: number}>({ score: 0, total: 0 });
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  useEffect(() => {
    let timer: any;
    if (testState === 'ONGOING' && targetTime) {
      timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((targetTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          clearInterval(timer);
          submitTest();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testState, targetTime]);

  const startTest = async () => {
    if (!isUserPro(tierData, tierData?.role || profileData?.role)) {
      const now = Date.now();
      const oneWeek = 7 * 24 * 60 * 60 * 1000;
      const recentTests = mockTests?.filter(t => (now - t.createdAt) < oneWeek) || [];
      if (recentTests.length >= 1) {
        alert("Pengguna Gratis hanya dapat satu kali Simulasi Ujian per minggu. Silakan tingkatkan langganan Anda ke Pro.");
        return;
      }
    }

    setTestState('LOADING');
    try {
      const resp = await authedFetch('/api/ai?action=generate-mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level })
      });
      const data = await resp.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        setAnswers({});
        setCurrentIdx(0);
        setTimeLeft(30 * 60);
        setTargetTime(Date.now() + 30 * 60 * 1000);
        setTestState('ONGOING');
      } else {
         alert("Gagal memuat soal. Silakan coba lagi.");
         setTestState('SETUP');
      }
    } catch(e) {
      console.error(e);
      setTestState('SETUP');
    }
  };

  const submitTest = async () => {
    setTestState('EVALUATING');
    const wrongAnswers: UserAnswerInfo[] = [];
    let correctCount = 0;

    questions.forEach(q => {
      const uAns = answers[q.id] || '';
      if (uAns === q.correctAnswer) {
        correctCount++;
      } else {
        wrongAnswers.push({
          question: q.question,
          userAnswer: uAns || '(Tidak dijawab)',
          correctAnswer: q.correctAnswer
        });
      }
    });

    setScoreInfo({ score: correctCount, total: questions.length });

    if (user) {
      await saveMockTest(user.id, {
         level,
         score: correctCount,
         total: questions.length,
         createdAt: Date.now()
      });
      await addXp(user.id, correctCount * 10);
    }

    try {
       const resp = await authedFetch('/api/ai?action=check-mock-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level, wrongAnswers })
       });
       const data = await resp.json();
       
       const feedbackMap: Record<string, string> = {};
       if (data.feedback && data.feedback.length > 0) {
          data.feedback.forEach((f: any) => {
             // Map back to question ID by string matching (approx)
             const q = questions.find(qItem => qItem.question === f.question);
             if (q) feedbackMap[q.id] = f.explanation;
          });
       } else if (wrongAnswers.length > 0) {
          alert("Gagal mendapatkan penjelasan koreksi dari AI.");
       }
       setFeedbacks(feedbackMap);
    } catch(e) {
       console.error(e);
       alert("Terjadi kesalahan jaringan saat mendapatkan koreksi.");
    } finally {
       setTestState('RESULT');
    }
  };

  if (testState === 'SETUP') {
    return (
      <div className="max-w-3xl mx-auto pb-20 text-center space-y-8">
        <div className="st-card p-12  border border-border ">
           <FileText className="w-16 h-16 mx-auto mb-6 text-blue-600" />
           <h1 className="text-4xl font-serif font-extrabold mb-4">Simulasi Ujian (Mock Test)</h1>
           <p className="text-muted-foreground text-lg mb-8 max-w-lg mx-auto">
             Ikuti simulasi ujian berstandar TELC/Goethe. Terdiri dari sesi Reading, Grammar, dan Vocabulary. 
             Waktu pengerjaan: 30 menit.
           </p>

           <div className="grid grid-cols-2 gap-3 md:gap-4 mb-8">
              {(['A1', 'A2', 'B1', 'B2'] as const).map(l => {
                 const levelColors: Record<string, { border: string; bg: string; text: string; activeBorder: string }> = {
                   A1: { border: 'border-emerald-300', bg: 'bg-emerald-50', text: 'text-emerald-700', activeBorder: 'border-emerald-500' },
                   A2: { border: 'border-teal-300', bg: 'bg-teal-50', text: 'text-teal-700', activeBorder: 'border-teal-500' },
                   B1: { border: 'border-blue-300', bg: 'bg-blue-50', text: 'text-blue-700', activeBorder: 'border-blue-500' },
                   B2: { border: 'border-indigo-300', bg: 'bg-indigo-50', text: 'text-indigo-700', activeBorder: 'border-indigo-500' },
                 };
                 const c = levelColors[l];
                 return (
                   <button 
                     key={l}
                     onClick={() => setLevel(l)}
                     className={cn(
                        "w-full py-4  text-2xl font-bold border-2 transition-all hover:scale-[1.02]",
                        level === l ? [c.activeBorder, c.bg, c.text, ""] : ["border-border", "text-muted-foreground", "hover:border-gray-300", "hover:bg-muted"]
                     )}
                   >
                     {l}
                   </button>
                 );
              })}
           </div>
           
           <Button onClick={startTest} size="lg" className="h-14 px-8 text-lg font-bold  w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
             <PlayCircle className="w-6 h-6 mr-2" /> Mulai Simulasi
           </Button>
        </div>
      </div>
    );
  }

  if (testState === 'LOADING') {
    return (
       <div className="max-w-2xl mx-auto text-center py-20 px-6">
         <Loader2 className="w-16 h-16 mx-auto mb-6 text-blue-600 animate-spin" />
         <h2 className="text-3xl font-bold mb-4">Merakit Ujian...</h2>
         <p className="text-muted-foreground">Herr Deutsch sedang menyiapkan pertanyaan berstandar untuk tingkat {level}.</p>
       </div>
    );
  }

  if (testState === 'ONGOING') {
    const q = questions[currentIdx];
    const formatTime = (sec: number) => {
       const m = Math.floor(sec / 60);
       const s = sec % 60;
       return `${m}:${s < 10 ? '0':''}${s}`;
    };

    return (
       <div className="max-w-3xl mx-auto pb-20">
         <div className="flex items-center justify-between mb-6 bg-card p-4   border border-border">
            <div className="flex space-x-2">
               <span className="bg-[#f5f0eb] border border-[#0a0a0a]/10 text-foreground font-bold px-3 py-1  text-sm">{q.category}</span>
               <span className="text-muted-foreground font-medium px-3 py-1 text-sm">Soal {currentIdx + 1} dari {questions.length}</span>
            </div>
            <div className="flex items-center text-orange-700 font-bold  from-orange-50 to-amber-50 px-4 py-2  border border-orange-200 ">
               <Timer className="w-5 h-5 mr-2" /> <span className="font-mono text-lg tabular-nums">{formatTime(timeLeft)}</span>
            </div>
         </div>

         <div className="st-card p-6 md:p-8  border border-border  flex flex-col min-h-[400px]">
            {q.context && (
               <div className="bg-blue-50 p-4  mb-6 text-blue-900 border border-blue-100 italic">
                  {q.context}
               </div>
            )}
            <h3 className="text-2xl font-bold mb-8 text-foreground">{q.question}</h3>

            <div className="space-y-3 flex-1">
               {q.options.map((opt, i) => {
                  const isSelected = answers[q.id] === opt;
                  return (
                     <button
                       key={i}
                       onClick={() => setAnswers({...answers, [q.id]: opt})}
                       className={cn(
                          "w-full text-left p-4  border-2 font-medium transition-all hover:scale-[1.01]",
                          isSelected ? "border-blue-600 bg-blue-50 text-blue-800 " : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 text-foreground bg-card"
                       )}
                     >
                       {opt}
                     </button>
                  )
               })}
            </div>
            
            <div className="mt-8 pt-6 border-t border-border flex justify-between">
               <Button variant="outline" disabled={currentIdx === 0} onClick={() => setCurrentIdx(prev => prev - 1)}>Sebelumnya</Button>
               {currentIdx === questions.length - 1 ? (
                 <Button onClick={submitTest} className="bg-green-600 hover:bg-green-700 text-white font-bold">Kumpulkan</Button>
               ) : (
                 <Button onClick={() => setCurrentIdx(prev => prev + 1)}>Selanjutnya</Button>
               )}
            </div>
         </div>
       </div>
    );
  }

  // EVALUATING & RESULT
  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="st-card p-8 md:p-12  border border-border  text-center mb-8">
        {testState === 'EVALUATING' ? (
           <>
             <Loader2 className="w-16 h-16 mx-auto mb-6 text-blue-600 animate-spin" />
             <h2 className="text-3xl font-bold mb-2">Mengevaluasi Hasil...</h2>
             <p className="text-muted-foreground">Menilai jawaban kamu dan membuat penjelasan koreksi.</p>
           </>
        ) : (
           <>
             <div className="relative w-28 h-28 mx-auto mb-6">
               <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
                 <circle cx="50" cy="50" r="42" fill="none" stroke="#E5E7EB" strokeWidth="8" />
                 <circle cx="50" cy="50" r="42" fill="none" stroke={scoreInfo.score / scoreInfo.total >= 0.5 ? '#22C55E' : '#EF4444'} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(scoreInfo.score / scoreInfo.total) * 264} 264`} className="transition-all duration-1000" />
               </svg>
               <div className="absolute inset-0 flex items-center justify-center">
                 <span className="text-2xl font-black text-foreground">{Math.round((scoreInfo.score / scoreInfo.total) * 100)}%</span>
               </div>
             </div>
             <h2 className="text-4xl font-extrabold mb-2">Skor Kamu: {scoreInfo.score} / {scoreInfo.total}</h2>
             <p className="text-muted-foreground font-medium text-lg mb-8">
                ({Math.round((scoreInfo.score / scoreInfo.total) * 100)}%) Tingkat {level}
             </p>
             <Button onClick={() => setTestState('SETUP')} variant="outline" size="lg">Kembali ke Menu Awal</Button>
           </>
        )}
      </div>

      {testState === 'RESULT' && (
         <div className="space-y-6">
            <h3 className="text-2xl font-bold mb-4 px-4">Review Jawaban</h3>
            {questions.map((q, i) => {
               const uAns = answers[q.id];
               const isAccurate = uAns === q.correctAnswer;
               return (
                  <div key={q.id} className={cn(
                     "p-6  border-2",
                     isAccurate ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                  )}>
                     <div className="flex space-x-3 mb-2">
                        {isAccurate ? <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" /> : <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />}
                        <h4 className="font-bold text-lg">{i+1}. {q.question}</h4>
                     </div>
                     <div className="pl-9 space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">Kategori: {q.category}</p>
                        <p className={cn("font-medium", isAccurate ? "text-green-800" : "text-red-800 line-through opacity-70")}>
                           Kamu: {uAns || '(Kosong)'}
                        </p>
                        {!isAccurate && (
                           <p className="font-bold text-green-700">Benar: {q.correctAnswer}</p>
                        )}
                        {!isAccurate && feedbacks[q.id] && (
                           <div className="mt-4 p-4 bg-card/70  border border-red-100 flex items-start space-x-3 text-red-900">
                             <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                             <div className="text-sm prose prose-sm prose-red"><ReactMarkdown>{feedbacks[q.id]}</ReactMarkdown></div>
                           </div>
                        )}
                     </div>
                  </div>
               )
            })}
         </div>
      )}
    </div>
  )
}

function TrophyIcon({score, total}: {score: number, total: number}) {
   const ratio = score/total;
   if (ratio > 0.8) return <span className="text-6xl">🏆</span>;
   if (ratio >= 0.5) return <span className="text-6xl">👍</span>;
   return <span className="text-6xl">💪</span>;
}
