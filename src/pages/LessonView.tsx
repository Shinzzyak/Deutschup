import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { courseData } from '../data/course';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { CheckCircle2, ChevronRight, Brain, Trophy, Loader2, PlayCircle, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';

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
  const { addXp, unlockLesson, unlockedLessons } = useProgressStore();
  
  const lesson = courseData.find(l => l.id === id);
  const lessonIndex = courseData.findIndex(l => l.id === id);
  const isLastLesson = lessonIndex === courseData.length - 1;
  const nextLessonId = isLastLesson ? null : courseData[lessonIndex + 1].id;
  
  const [activeTab, setActiveTab] = useState('materi');
  const [quizFinished, setQuizFinished] = useState(unlockedLessons.includes(nextLessonId || '') || false);
  
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
    setQuizFinished(unlockedLessons.includes(nextLessonId || '') || false);
  }, [id, nextLessonId, unlockedLessons]);

  if (!lesson) {
    return <div>Pelajaran tidak ditemukan.</div>;
  }

  const startQuiz = async () => {
    setActiveTab('latihan');
    if (exercises.length > 0) return;
    
    if (lesson.questions && lesson.questions.length > 0) {
      setExercises(lesson.questions.map(q => ({
        question: q.question,
        type: 'multiple_choice',
        options: q.options,
        correctAnswerStr: q.options[q.correctAnswer]
      })));
      return;
    }

    if (lesson.exercises && lesson.exercises.length > 0) {
      setExercises(lesson.exercises.map(q => ({
        question: q.question,
        type: 'multiple_choice',
        options: q.options,
        correctAnswerStr: q.options[q.correctAnswer]
      })));
      return;
    }
    
    setExercisesLoading(true);
    try {
      const resp = await fetch('/api/generate-exercises', {
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
         const resp = await fetch('/api/check-answer', {
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
         await addXp(user.uid, 10);
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
    if(user) {
       await addXp(user.uid, 50); // Bonus XP
       if (nextLessonId && !unlockedLessons.includes(nextLessonId)) {
         await unlockLesson(user.uid, nextLessonId); 
       }
    }
  };

  const currentQuestion = exercises.length > 0 ? exercises[currentQuizIndex] : null;

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
           <span>{lesson.level}</span>
           <span>•</span>
           <span>Pelajaran</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{lesson.title}</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-slate-100 p-1 rounded-2xl">
          <TabsTrigger value="materi" className="rounded-xl font-bold py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
            Materi & Kosakata
          </TabsTrigger>
          <TabsTrigger value="latihan" className="rounded-xl font-bold py-3 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
            Latihan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materi" className="space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Brain className="w-6 h-6 text-indigo-500" />
              <span>Tata Bahasa (Grammar)</span>
            </h3>
            <div className="prose prose-slate max-w-none text-lg">
              <ReactMarkdown>{lesson.grammarDescription}</ReactMarkdown>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-xl font-bold mb-6">Kosakata Baru</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lesson.vocabulary?.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-baseline space-x-2">
                    {v.article && (
                      <span className={cn(
                        "text-xs font-bold px-2 py-1 rounded-md text-white",
                        v.article === 'der' ? 'bg-blue-500' : 
                        v.article === 'die' ? 'bg-red-500' : 'bg-green-500'
                      )}>{v.article}</span>
                    )}
                    <span className="font-bold text-lg">{v.word}</span>
                  </div>
                  <span className="text-slate-500">{v.translation}</span>
                </div>
              ))}
            </div>
          </div>

          <Button 
            onClick={startQuiz} 
            className="w-full h-14 text-lg font-bold rounded-2xl bg-slate-900 hover:bg-slate-800 text-white"
          >
            Mulai Latihan <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </TabsContent>

        <TabsContent value="latihan" className="animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
          {quizFinished ? (
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 text-center space-y-6">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900">Pelajaran Selesai!</h2>
              <p className="text-slate-500 text-lg">Kamu luar biasa. Lanjutkan ke langkah berikutnya.</p>
              
              <div className="pt-8 flex gap-4 justify-center">
                <Button variant="outline" size="lg" className="rounded-2xl" onClick={() => navigate('/')}>
                  Kembali ke Peta
                </Button>
                {nextLessonId && (
                  <Button size="lg" className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white" onClick={() => navigate(`/lesson/${nextLessonId}`)}>
                    Pelajaran Berikutnya <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          ) : exercisesLoading ? (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
               <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
               <h2 className="text-2xl font-bold text-slate-900">Meracik Soal Latihan...</h2>
               <p className="text-slate-500 max-w-sm">Herr Gemini sedang membuat soal spesial untuk materi ini.</p>
            </div>
          ) : currentQuestion ? (
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
              <div className="mb-8">
                <div className="flex justify-between text-sm font-bold text-slate-400 mb-2">
                  <span>Pertanyaan {currentQuizIndex + 1} dari {exercises.length}</span>
                  <span className="flex items-center text-yellow-500"><Star className="w-4 h-4 mr-1"/> 10 XP</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full w-full overflow-hidden">
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
                          "w-full text-left p-5 rounded-2xl border-2 font-medium text-lg transition-all",
                          isSelected && !isAnswerChecked ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300 bg-white",
                          isCorrectOption ? "border-green-500 bg-green-50 text-green-700" : isWrongOption ? "border-red-500 bg-red-50 text-red-700" : ""
                        )}
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
                    className="w-full min-h-[120px] bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 text-lg focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium resize-none"
                  />
                )}
                
                {currentQuestion.hint && !isAnswerChecked && (
                   <p className="text-sm text-slate-500 italic mt-2">💡 Hint: {currentQuestion.hint}</p>
                )}
              </div>
              
              {isAnswerChecked && checkResult && (
                 <div className={cn(
                    "mt-6 p-4 rounded-2xl border-2",
                    checkResult.isCorrect ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"
                 )}>
                    <p className="font-bold mb-1">{checkResult.isCorrect ? "Benar!" : "Belum Tepat"}</p>
                    <p>{checkResult.feedback}</p>
                    {checkResult.correctedSentence && (
                       <p className="mt-2 font-medium">✨ Perbaikan: {checkResult.correctedSentence}</p>
                    )}
                 </div>
              )}

              <div className="mt-8 pt-8 border-t border-slate-100">
                {!isAnswerChecked ? (
                  <Button 
                    size="lg" 
                    className="w-full rounded-2xl h-14 text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white"
                    disabled={!selectedAnswer.trim() || checkingAnswer}
                    onClick={handleCheckAnswer}
                  >
                    {checkingAnswer ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Memeriksa...</> : "Cek Jawaban"}
                  </Button>
                ) : (
                  <Button 
                    size="lg" 
                    className={cn(
                      "w-full rounded-2xl h-14 text-lg font-bold text-white",
                      checkResult?.isCorrect ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 hover:bg-slate-800"
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
