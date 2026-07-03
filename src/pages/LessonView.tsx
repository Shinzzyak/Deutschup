import { useState, useEffect } from 'react';
import React, { isValidElement } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { courseData } from '../data/lessons';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { useLessonTimer } from '../hooks/useLessonTimer';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CheckCircle2, ChevronRight, Brain, Trophy, Loader2, PlayCircle, Star, AlertTriangle, Target, Mic, Headphones, Globe, MessageSquare, ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';

const grammarGlossary: Record<string, string> = {
  'Akkusativ': 'Kasus objek langsung (contoh: mich, dich, den Hund).',
  'Dativ': 'Kasus objek tidak langsung atau setelah preposisi tertentu (contoh: mir, dir, dem Hund).',
  'Nominativ': 'Kasus subjek kalimat (contoh: ich, du, der Hund).',
  'Genitiv': 'Kasus kepemilikan (contoh: des Mannes).',
  'Präteritum': 'Bentuk lampau tertulis/formal.',
  'Perfekt': 'Bentuk lampau yang paling sering digunakan dalam percakapan.',
  'Verb': 'Kata kerja.',
  'Nomen': 'Kata benda. Selalu diawali huruf kapital di bahasa Jerman.',
  'Adjektiv': 'Kata sifat.',
  'Pronomen': 'Kata ganti.',
  'Präposition': 'Kata depan. Seringkali menentukan kasus setelahnya.',
  'Artikel': 'Kata sandang seperti der, die, das.',
  'Feminin': 'Jenis kelamin kata benda (die).',
  'Maskulin': 'Jenis kelamin kata benda (der).',
  'Neutral': 'Jenis kelamin kata benda (das).',
  'Plural': 'Bentuk jamak.',
};

function processTextNodeWithGlossary(text: string): React.ReactNode[] {
  const keys = Object.keys(grammarGlossary).join('|');
  const regex = new RegExp(`\\b(${keys})\\b`, 'gi');
  
  const parts = text.split(regex);
  if (parts.length === 1) return [text];

  return parts.map((part, i) => {
    // Check if the part is a whole word match (case-insensitive)
    const term = Object.keys(grammarGlossary).find(k => k.toLowerCase() === part.toLowerCase());
    if (term) {
      return (
        <Tooltip key={i}>
          <TooltipTrigger>
            <span className="underline decoration-indigo-300 decoration-dashed cursor-help font-semibold text-indigo-700">
              {part}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-sm bg-[#0a0a0a] z-50 text-[#f5f0eb]">
            <p className="font-bold mb-1">{term}</p>
            <p>{grammarGlossary[term]}</p>
          </TooltipContent>
        </Tooltip>
      );
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function renderChildrenWithGlossary(children: React.ReactNode): React.ReactNode {
  return React.Children.map(children, child => {
    if (typeof child === 'string') {
      return processTextNodeWithGlossary(child);
    }
    if (isValidElement(child) && (child.props as any).children) {
      return React.cloneElement(child as React.ReactElement<any>, {
        ...(child.props as any),
        children: renderChildrenWithGlossary((child.props as any).children)
      });
    }
    return child;
  });
}

type DynamicExercise = {
  question: string;
  type: "multiple_choice" | "free_text";
  options?: string[];
  correctAnswerStr: string;
  hint?: string;
};

export default function LessonView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addXp, unlockLesson, completeLesson, unlockedLessons, completedLessons } = useProgressStore();
  const { endSession } = useLessonTimer(id);
  
  const lesson = courseData.find(l => l.id === id);
  const lessonIndex = courseData.findIndex(l => l.id === id);
  const isLastLesson = lessonIndex === courseData.length - 1;
  const nextLessonId = isLastLesson ? null : courseData[lessonIndex + 1].id;
  
  const [activeTab, setActiveTab] = useState('materi');
  const [quizFinished, setQuizFinished] = useState(completedLessons?.includes(id || '') || false);
  
  // Dynamic exercises state
  const [exercises, setExercises] = useState<DynamicExercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  
  // Answer state
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [checkResult, setCheckResult] = useState<{ isCorrect: boolean, feedback: string, correctedSentence?: string } | null>(null);
  const [checkingAnswer, setCheckingAnswer] = useState(false);

  // Reset state when lesson changes
  useEffect(() => {
    setActiveTab('materi');
    setCurrentQuizIndex(0);
    setSelectedAnswer("");
    setIsAnswerChecked(false);
    setCheckResult(null);
    setExercises([]);
    setQuizFinished(completedLessons?.includes(id || '') || false);
  }, [id, completedLessons]);

  if (!lesson) {
    return <div>Pelajaran tidak ditemukan.</div>;
  }

  const startQuiz = async () => {
    setActiveTab('latihan');
    if (exercises.length > 0) return;
    
    if (lesson.questions && lesson.questions.length > 0) {
      setExercises(lesson.questions.slice(0, 3).map(q => ({
        question: q.question,
        type: 'multiple_choice',
        options: q.options,
        correctAnswerStr: q.options[q.correctAnswer]
      })));
      return;
    }

    if (lesson.exercises && lesson.exercises.length > 0) {
      setExercises(lesson.exercises.slice(0, 3).map(q => ({
        question: q.question,
        type: 'multiple_choice',
        options: q.options,
        correctAnswerStr: q.options[q.correctAnswer]
      })));
      return;
    }
    
    setExercisesLoading(true);
    try {
      const resp = await fetch('/api/ai?action=generate-exercises', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ level: lesson.level, grammarTopic: lesson.grammarDescription, vocabulary: lesson.vocabulary || [] })
      });
      const data = await resp.json();
      setExercises(data.exercises || []);
    } catch(e) {
      console.error(e);
      // Fallback
      setExercises([{
         question: "Network error, please try again.",
         type: "free_text",
         correctAnswerStr: ""
      }]);
    } finally {
      setExercisesLoading(false);
    }
  };

  const handleCheckAnswer = async () => {
    if (!selectedAnswer.trim()) return;
    
    const currentQuestion = exercises[currentQuizIndex];
    setCheckingAnswer(true);

    try {
      if (currentQuestion.type === 'multiple_choice') {
         const isCorrect = selectedAnswer === currentQuestion.correctAnswerStr;
         setCheckResult({
            isCorrect,
            feedback: isCorrect ? "Tepat sekali!" : `Kurang tepat. Jawaban yang benar adalah: ${currentQuestion.correctAnswerStr}`
         });
      } else {
         const resp = await fetch('/api/ai?action=check-answer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: currentQuestion.question, answer: selectedAnswer, level: lesson.level })
         });
         const data = await resp.json();
         setCheckResult(data);
      }
      setIsAnswerChecked(true);
    } catch(e) {
       console.error(e);
    } finally {
       setCheckingAnswer(false);
    }
  };

  const handleNextQuestion = async () => {
    if (checkResult?.isCorrect) {
      if(user) {
         await addXp(user.id, 10);
      }
      if (currentQuizIndex < exercises.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
        setSelectedAnswer("");
        setIsAnswerChecked(false);
        setCheckResult(null);
      } else {
        finishLesson();
      }
    } else {
      // Allow retry if wrong
      setSelectedAnswer("");
      setIsAnswerChecked(false);
      setCheckResult(null);
    }
  };

  const finishLesson = async () => {
    setQuizFinished(true);
    await endSession();
    if(user && lesson) {
       await completeLesson(user.id, lesson.id);
       await addXp(user.id, 50); // Bonus XP
       if (nextLessonId && !unlockedLessons.includes(nextLessonId)) {
         await unlockLesson(user.id, nextLessonId); 
       }
    }
  };

  const currentQuestion = exercises.length > 0 ? exercises[currentQuizIndex] : null;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Back nav */}
      <Link to={lesson?.level ? `/level/${lesson.level}` : '/'} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke {lesson?.level || 'Peta'}
      </Link>

      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm font-bold text-muted-foreground uppercase tracking-wider mb-2">
           <span>{lesson.level}</span>
           <span>•</span>
           <span>Pelajaran</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{lesson.title}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-muted p-1 ">
          <TabsTrigger value="materi" className=" font-bold py-3 data-[state=active]:bg-card data-[state=active]:text-blue-600 data-[state=active]:">
            Materi & Kosakata
          </TabsTrigger>
          <TabsTrigger value="latihan" className=" font-bold py-3 data-[state=active]:bg-card data-[state=active]:text-blue-600 data-[state=active]:">
            Latihan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materi" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="bg-[#f5f0eb] border-2 border-[#0a0a0a] p-6 md:p-8 ">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Brain className="w-6 h-6 text-indigo-500" />
              <span>Tata Bahasa (Grammar)</span>
            </h2>
            <div className="prose prose-[#0a0a0a] max-w-none text-lg">
              <ReactMarkdown
                components={{
                  p: ({ children }) => <p className="mb-4">{renderChildrenWithGlossary(children)}</p>,
                  li: ({ children }) => <li>{renderChildrenWithGlossary(children)}</li>
                }}
              >
                {lesson.grammarDescription}
              </ReactMarkdown>
            </div>
          </div>

          {lesson.canDoGoals && lesson.canDoGoals.length > 0 && (
            <div className=" from-green-50 to-emerald-100 p-6 md:p-8   border border-green-200">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-emerald-800">
                <Target className="w-6 h-6" />
                <span>Setelah pelajaran ini, kamu bisa:</span>
              </h2>
              <ul className="space-y-3">
                {lesson.canDoGoals.map((goal, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 mr-3 mt-0.5 shrink-0" />
                    <span className="text-emerald-900 font-medium text-lg">{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {lesson.indonesianMistakes && (
            <div className="bg-orange-50 p-6 md:p-8   border border-orange-200">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="w-6 h-6" />
                <span>⚠️ Kesalahan Umum Pembelajar Indonesia</span>
              </h2>
              <div className="prose prose-orange max-w-none text-lg">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-4 text-orange-900">{children}</p>,
                    li: ({ children }) => <li className="text-orange-900">{children}</li>
                  }}
                >
                  {lesson.indonesianMistakes}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {lesson.culturalNotes && (
            <div className="bg-blue-50 p-6 md:p-8   border border-blue-200">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-blue-800">
                <Globe className="w-6 h-6" />
                <span>Real-Life Germany Notes</span>
              </h2>
              <div className="text-blue-900 text-lg">
                {lesson.culturalNotes}
              </div>
            </div>
          )}

          {lesson.registerNotes && (
            <div className="bg-indigo-50 p-6 md:p-8   border border-indigo-200">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-indigo-800">
                <MessageSquare className="w-6 h-6" />
                <span>Register Notes (Formal/Informal)</span>
              </h2>
              <div className="text-indigo-900 text-lg prose prose-indigo max-w-none">
                <ReactMarkdown>
                  {lesson.registerNotes}
                </ReactMarkdown>
              </div>
            </div>
          )}

          {lesson.listeningSimulation && (
            <div className="bg-[#f5f0eb] border border-[#0a0a0a]/10 p-6 md:p-8 ">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-foreground">
                <Headphones className="w-6 h-6" />
                <span>Listening Simulation Transcript</span>
              </h2>
              <div className="space-y-4 mb-6">
                {lesson.listeningSimulation.transcript.map((line, idx) => (
                  <div key={idx} className="flex flex-col">
                    <span className="font-bold text-foreground">{line.personA ? 'A' : 'B'}: <span className="font-normal text-foreground">{line.personA || line.personB}</span></span>
                    <span className="text-sm text-muted-foreground italic">{line.translation}</span>
                  </div>
                ))}
              </div>
              {lesson.listeningSimulation.questions && lesson.listeningSimulation.questions.length > 0 && (
                <div className="bg-card p-4  border border-border">
                  <span className="font-bold text-sm uppercase text-muted-foreground mb-2 block">Quick Question</span>
                  <p className="font-medium">{lesson.listeningSimulation.questions[0].question}</p>
                </div>
              )}
            </div>
          )}

          {lesson.vocabulary && lesson.vocabulary.length > 0 && (
            <div className="bg-[#f5f0eb] border-2 border-[#0a0a0a] p-6 md:p-8 ">
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2">
                <Star className="w-6 h-6 text-yellow-500" />
                <span>Kosakata Utama</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lesson.vocabulary?.map((v) => (
                  <div key={v.id} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-muted hover:bg-muted transition-colors  border border-border">
                    <div className="flex items-baseline space-x-2 mb-2 sm:mb-0">
                      {v.article && (
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 text-white",
                          v.article === 'der' ? 'bg-blue-700' : 
                          v.article === 'die' ? 'bg-[#8b2500]' : 'bg-green-700'
                        )}>{v.article}</span>
                      )}
                      <span className="font-bold text-lg">{v.word}</span>
                    </div>
                    <span className="text-muted-foreground font-medium text-center sm:text-right">{v.translation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lesson.pronunciationTips && (
            <div className=" from-indigo-50 to-purple-50 p-6 md:p-8   border border-indigo-100">
              <h2 className="text-xl font-bold mb-4 flex items-center space-x-2 text-indigo-900">
                <Mic className="w-6 h-6 text-indigo-500" />
                <span>Panduan Pengucapan</span>
              </h2>
              <div className="text-indigo-800 text-lg space-y-4 prose prose-indigo max-w-none">
                {Array.isArray(lesson.pronunciationTips) ? (
                  <ul className="list-disc pl-5 space-y-2">
                    {lesson.pronunciationTips.map((tip, idx) => (
                      <li key={idx} className="marker:text-indigo-400">
                        <ReactMarkdown>{tip}</ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ReactMarkdown>{lesson.pronunciationTips}</ReactMarkdown>
                )}
              </div>
            </div>
          )}

          {lesson.reviewLessons && lesson.reviewLessons.length > 0 && (
            <div className="bg-yellow-50 p-6 md:p-8   border border-yellow-200 fade-in-50 duration-500 animate-in">
              <h2 className="text-xl font-bold mb-6 flex items-center space-x-2 text-yellow-800">
                <Brain className="w-6 h-6" />
                <span>Ulas Kembali (Vocabulary Recycling)</span>
              </h2>
              <p className="text-yellow-700 mb-6">Kosakata dari pelajaran sebelumnya yang muncul lagi hari ini agar kamu tidak lupa!</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lesson.reviewLessons.flatMap(id => {
                   const reviewLesson = courseData.find(l => l.id === id);
                   return reviewLesson?.vocabulary?.slice(0, 2) || [];
                }).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).map((v) => (
                  <div key={`review-${v.id}`} className="flex flex-col sm:flex-row items-center justify-between p-4 bg-card  border border-yellow-100 ">
                    <div className="flex items-baseline space-x-2 mb-2 sm:mb-0">
                      {v.article && (
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 text-white",
                          v.article === 'der' ? 'bg-blue-700' : 
                          v.article === 'die' ? 'bg-[#8b2500]' : 'bg-green-700'
                        )}>{v.article}</span>
                      )}
                      <span className="font-bold text-lg text-yellow-900">{v.word}</span>
                    </div>
                    <span className="text-yellow-700 font-medium text-center sm:text-right">{v.translation}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button 
            onClick={startQuiz} 
            className="w-full h-14 text-lg font-bold bg-[#8b2500] hover:bg-[#8b2500]/90 text-[#f5f0eb]"
          >
            Mulai Latihan <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </TabsContent>

        <TabsContent value="latihan" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          {quizFinished ? (
            <div className="bg-[#f5f0eb] border-2 border-[#0a0a0a] p-10  text-center space-y-6">
              <div className="w-24 h-24 bg-green-100  flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-foreground">Pelajaran Selesai!</h2>
              <p className="text-muted-foreground text-lg">Kamu luar biasa. Lanjutkan ke langkah berikutnya.</p>
              
              <div className="pt-8 flex gap-4 justify-center">
                <Button variant="outline" size="lg" className="" onClick={() => navigate(`/level/${lesson?.level || 'A1'}`)}>
                  Kembali ke Level
                </Button>
                {nextLessonId && (
                  <Button size="lg" className="bg-[#8b2500] hover:bg-[#8b2500]/90 text-[#f5f0eb]" onClick={() => navigate(`/lesson/${nextLessonId}`)}>
                    Pelajaran Berikutnya <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          ) : exercisesLoading ? (
            <div className="bg-[#f5f0eb] border-2 border-[#0a0a0a] p-12  flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
               <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
               <h2 className="text-2xl font-bold text-foreground">Meracik Soal Latihan...</h2>
               <p className="text-muted-foreground max-w-sm">Herr Deutsch sedang membuat soal spesial untuk materi ini.</p>
            </div>
          ) : currentQuestion ? (
            <div className="bg-card p-6 md:p-8   border border-border min-h-[400px] flex flex-col">
              <div className="mb-8">
                <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
                  <span>Pertanyaan {currentQuizIndex + 1} dari {exercises.length}</span>
                  <span className="flex items-center text-yellow-500"><Star className="w-4 h-4 mr-1"/> 10 XP</span>
                </div>
                <div className="h-2 bg-muted  w-full overflow-hidden">
                   <div 
                     className="h-full bg-blue-500 transition-all duration-300"
                     style={{ width: `${((currentQuizIndex) / exercises.length) * 100}%` }}
                   ></div>
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-8">{currentQuestion.question}</h2>

              <div className="space-y-4 flex-1">
                {currentQuestion.type === 'multiple_choice' && currentQuestion.options ? (
                  currentQuestion.options.map((opt, idx) => {
                    const isSelected = selectedAnswer === opt;
                    const isCorrectOption = isAnswerChecked && currentQuestion.correctAnswerStr === opt;
                    const isWrongOption = isAnswerChecked && isSelected && !checkResult?.isCorrect;

                    return (
                      <button
                        key={idx}
                        disabled={isAnswerChecked || checkingAnswer}
                        onClick={() => setSelectedAnswer(opt)}
                        className={cn(
                          "w-full text-left p-5  border-2 font-medium text-lg transition-all",
                          isSelected && !isAnswerChecked ? "border-blue-500 bg-blue-50" : "border-border hover:border-border bg-card",
                          isCorrectOption ? "border-green-500 bg-green-50 text-green-700" : isWrongOption ? "border-red-500 bg-red-50 text-red-700" : ""
                        )}
                        aria-label={`Jawaban: ${opt}`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{opt}</span>
                          {isCorrectOption && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <textarea
                    disabled={isAnswerChecked || checkingAnswer}
                    value={selectedAnswer}
                    onChange={(e) => setSelectedAnswer(e.target.value)}
                    placeholder="Tuliskan jawaban bahasa Jermanmu disini..."
                    className="w-full min-h-[120px] bg-muted border-2 border-border  p-4 text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium resize-none"
                  />
                )}
                
                {currentQuestion.hint && !isAnswerChecked && (
                   <p className="text-sm text-muted-foreground italic mt-2">💡 Hint: {currentQuestion.hint}</p>
                )}
              </div>
              
              {isAnswerChecked && checkResult && (
                 <div className={cn(
                    "mt-6 p-4  border-2",
                    checkResult.isCorrect ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                 )}>
                    <p className="font-bold mb-1">{checkResult.isCorrect ? "Benar!" : "Belum Tepat"}</p>
                    <p>{checkResult.feedback}</p>
                    {checkResult.correctedSentence && (
                       <div className="mt-4 p-3 bg-card border border-red-200  ">
                         <span className="text-sm font-semibold text-red-600 block mb-1">Coba gunakan kalimat ini:</span>
                         <p className="font-bold text-foreground text-lg">✨ {checkResult.correctedSentence}</p>
                       </div>
                    )}
                 </div>
              )}

              <div className="mt-8 pt-8 border-t border-border">
                {!isAnswerChecked ? (
                  <Button 
                    size="lg" 
                    className="w-full h-14 text-lg font-bold bg-[#8b2500] hover:bg-[#8b2500]/90 text-[#f5f0eb]"
                    disabled={!selectedAnswer.trim() || checkingAnswer}
                    onClick={handleCheckAnswer}
                  >
                    {checkingAnswer ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Memeriksa...</> : "Cek Jawaban"}
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className={cn(
                      "w-full h-14 text-lg font-bold bg-[#8b2500] text-[#f5f0eb]",
                      checkResult?.isCorrect ? "bg-green-700 hover:bg-green-800 text-white" : "bg-[#8b2500] hover:bg-[#8b2500]/90 text-[#f5f0eb]"
                    )}
                    onClick={handleNextQuestion}
                  >
                    {checkResult?.isCorrect ? 'Lanjut' : 'Coba Lagi'}
                  </Button>
                )}
              </div>
            </div>
          ) : (
             <div className="text-center py-20">
                <Button onClick={startQuiz} size="lg"><PlayCircle className="w-5 h-5 mr-2" /> Mulai Latihan</Button>
             </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
