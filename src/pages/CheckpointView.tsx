import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { courseData } from '../data/lessons';
import { courseIndex } from '../data/lessonIndex';
import { resolveCheckpointLesson } from '../lib/checkpointAdapter';
import { Button } from '../components/ui/button';
import { CheckCircle2, Lock, Trophy, ArrowLeft, Loader2, Star, Target, AlertTriangle } from 'lucide-react';
import { cn } from '../lib/utils';

export default function CheckpointView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { submitCheckpoint, checkpointProgress, loading, completedLessons } = useProgressStore();

  const resolvedCheckpoint = resolveCheckpointLesson(courseData, id);
  const checkpoint = resolvedCheckpoint?.lesson;
  const checkpointData = resolvedCheckpoint?.checkpoint;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [quizFinished, setQuizFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if already passed
  const existingProgress = checkpointProgress.find(c => c.checkpointId === id);
  const alreadyPassed = existingProgress?.passed || false;

  // Get level from checkpoint ID (e.g., "a1-checkpoint-1" → "A1")
  const level = id?.split('-')[0]?.toUpperCase() || 'A1';

  // Get review lessons
  const reviewLessonIds = checkpointData?.reviewLessons || [];
  const reviewLessons = reviewLessonIds.map(lessonId => courseData.find(l => l.id === lessonId)).filter(Boolean);

  // Get next checkpoint or next level
  const currentLevelIndex = { A1: 0, A2: 1, B1: 2, B2: 3 }[level] ?? 0;
  const levels = ['A1', 'A2', 'B1', 'B2'];
  const nextLevel = levels[currentLevelIndex + 1];

  useEffect(() => {
    if (alreadyPassed) {
      setQuizFinished(true);
      setPassed(true);
      setFinalScore(existingProgress?.bestScore || 0);
    }
  }, [alreadyPassed, existingProgress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!checkpoint || !checkpointData) {
    return (
      <div className="max-w-3xl mx-auto pb-20 text-center py-20">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Checkpoint Tidak Ditemukan</h1>
        <Link to={`/level/${level}`}>
          <Button>Kembali ke Level {level}</Button>
        </Link>
      </div>
    );
  }

  const questions = checkpointData.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const requiredScore = checkpointData.requiredScore || 0.7;
  const totalQuestions = questions.length;

  const handleAnswer = (answer: string) => {
    if (isAnswerChecked) return;
    setSelectedAnswer(answer);
  };

  const checkAnswer = () => {
    if (!currentQuestion || !selectedAnswer) return;
    const correct = selectedAnswer === currentQuestion.options[currentQuestion.correctAnswer];
    setIsCorrect(correct);
    setIsAnswerChecked(true);
    setAnswers([...answers, correct]);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer("");
      setIsAnswerChecked(false);
      setIsCorrect(false);
    } else {
      finishCheckpoint();
    }
  };

  const finishCheckpoint = async () => {
    const correctCount = answers.filter(a => a).length;
    const score = correctCount / totalQuestions;
    setFinalScore(score);
    setPassed(score >= requiredScore);
    setQuizFinished(true);

    if (user && id) {
      setSubmitting(true);
      await submitCheckpoint(user.id, id, score, totalQuestions);
      setSubmitting(false);
    }
  };

  // Render review lessons
  const renderReviewSection = () => {
    if (reviewLessons.length === 0) return null;
    return (
      <div className="bg-amber-50 p-6  border border-amber-200 mb-6">
        <h3 className="font-bold text-amber-800 mb-4 flex items-center">
          <Star className="w-5 h-5 mr-2" /> Ulasan Pelajaran Sebelumnya
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {reviewLessons.map(lesson => lesson && (
            <div key={lesson.id} className="bg-card p-3  border border-amber-100">
              <p className="font-bold text-sm text-amber-900">{lesson.title}</p>
              <p className="text-xs text-amber-600 mt-1">
                {lesson.vocabulary?.slice(0, 3).map(v => v.word).join(', ')}
              </p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Back nav */}
      <Link to={`/level/${level}`} className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Level {level}
      </Link>

      {/* Header */}
      <div className="bg-primary p-6 md:p-8 mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Target className="w-8 h-8" />
          <div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold">{checkpointData.title}</h1>
            <p className="text-white/80 text-sm">Checkpoint Level {level}</p>
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4 text-sm">
          <span>🎯 Target: {Math.round(requiredScore * 100)}%</span>
          <span>📝 {totalQuestions} Soal</span>
          {alreadyPassed && <span className="bg-card/20 px-2 py-1 ">✅ Sudah Lulus</span>}
        </div>
      </div>

      {/* Quiz or Result */}
      {!quizFinished ? (
        <>
          {/* Review section before quiz */}
          {currentQuestionIndex === 0 && renderReviewSection()}

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm font-bold text-muted-foreground mb-2">
              <span>Soal {currentQuestionIndex + 1} / {totalQuestions}</span>
              <span>{Math.round((currentQuestionIndex / totalQuestions) * 100)}%</span>
            </div>
            <div className="h-2 bg-muted  overflow-hidden">
              <div
                className="h-full bg-amber-500 transition-all duration-300"
                style={{ width: `${(currentQuestionIndex / totalQuestions) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          {currentQuestion && (
            <div className="bg-card p-6 md:p-8   border border-border">
              <p className="text-lg font-bold mb-6">{currentQuestion.question}</p>

              <div className="space-y-3">
                {currentQuestion.options.map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(option)}
                    className={cn(
                      "w-full text-left p-4  border-2 transition-all",
                      selectedAnswer === option
                        ? isAnswerChecked
                          ? option === currentQuestion.options[currentQuestion.correctAnswer]
                            ? "border-green-500 bg-green-50"
                            : "border-red-500 bg-red-50"
                          : "border-blue-500 bg-blue-50"
                        : "border-border hover:border-border"
                    )}
                    disabled={isAnswerChecked}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Feedback */}
              {isAnswerChecked && (
                <div className={cn(
                  "mt-6 p-4 ",
                  isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
                )}>
                  {isCorrect ? "✅ Benar!" : "❌ Salah"}
                </div>
              )}

              {/* Action button */}
              <div className="mt-6">
                {!isAnswerChecked ? (
                  <Button
                    onClick={checkAnswer}
                    disabled={!selectedAnswer}
                    className="w-full h-12  bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    Cek Jawaban
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    className="w-full h-12  bg-amber-500 hover:bg-amber-600 text-[#0a0a0a]"
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? "Soal Berikutnya" : "Lihat Hasil"}
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* Result */
        <div className="bg-card p-8 md:p-10   border border-border text-center">
          <div className={cn(
            "w-24 h-24  flex items-center justify-center mx-auto mb-6",
            passed ? "bg-green-100" : "bg-amber-100"
          )}>
            {passed ? (
              <Trophy className="w-12 h-12 text-green-500" />
            ) : (
              <Target className="w-12 h-12 text-amber-500" />
            )}
          </div>

          <h2 className="text-3xl font-serif font-extrabold mb-2">
            {passed ? "Lulus! 🎉" : "Belum Cukup 😅"}
          </h2>

          <p className="text-muted-foreground text-lg mb-6">
            Skor kamu: <span className="font-bold text-2xl">{Math.round(finalScore * 100)}%</span>
            <br />
            Target: {Math.round(requiredScore * 100)}%
          </p>

          {passed && (
            <div className="bg-green-50 p-4  mb-6 text-green-800">
              <p className="font-bold">Level {level} Selesai!</p>
              {nextLevel && <p className="text-sm mt-1">Level {nextLevel} sudah terbuka.</p>}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to={`/level/${level}`}>
              <Button variant="outline" className="">
                Kembali ke Level {level}
              </Button>
            </Link>
            {passed && nextLevel && (
              <Link to={`/level/${nextLevel}`}>
                <Button className="bg-[#8b2500] hover:bg-[#8b2500]/90 text-primary-foreground">
                  Lanjut ke Level {nextLevel}
                </Button>
              </Link>
            )}
            {!passed && (
              <Button
                onClick={() => {
                  setQuizFinished(false);
                  setCurrentQuestionIndex(0);
                  setSelectedAnswer("");
                  setIsAnswerChecked(false);
                  setAnswers([]);
                  setFinalScore(0);
                  setPassed(false);
                }}
                className=" bg-amber-500 hover:bg-amber-600 text-[#0a0a0a]"
              >
                Coba Lagi
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
