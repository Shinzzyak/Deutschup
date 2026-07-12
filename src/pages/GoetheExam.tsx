import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Trophy, Target, Brain, AlertCircle, Loader2
} from 'lucide-react';
import { goetheExamQuestions, examLevels, type ExamQuestion } from '../data/goethe-exam-questions';
import { extendedExamQuestions } from '../data/goethe-exam-extended';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { ErrorState } from '../components/ui/error-state';
import { cn } from '../lib/utils';

type Level = 'a1' | 'a2' | 'b1' | 'b2';

// Level color mapping using design tokens
const levelColorMap: Record<string, { accent: string; badge: string }> = {
  green: { accent: 'border-l-green-500', badge: 'bg-green-500/15 text-green-700 dark:text-green-400' },
  blue: { accent: 'border-l-blue-500', badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  purple: { accent: 'border-l-purple-500', badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-400' },
  red: { accent: 'border-l-red-500', badge: 'bg-red-500/15 text-red-700 dark:text-red-400' },
};

// Question type styling
const typeStyleMap: Record<string, { label: string; badge: string }> = {
  reading: { label: '📖 Membaca', badge: 'bg-blue-500/15 text-blue-700 dark:text-blue-400' },
  grammar: { label: '📝 Tata bahasa', badge: 'bg-purple-500/15 text-purple-700 dark:text-purple-400' },
  vocab: { label: '💬 Kosakata', badge: 'bg-green-500/15 text-green-700 dark:text-green-400' },
};

export default function GoetheExam() {
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<Record<string, string>>({});
  const [examComplete, setExamComplete] = useState(false);

  const allQuestions = useMemo(() => [...goetheExamQuestions, ...extendedExamQuestions], []);

  const filteredQuestions = useMemo(() => {
    if (!selectedLevel) return [];
    return allQuestions.filter(q => q.level === selectedLevel);
  }, [selectedLevel, allQuestions]);

  const currentQ = filteredQuestions[currentQuestion];

  const totalPoints = useMemo(
    () => filteredQuestions.reduce((sum, q) => sum + q.points, 0),
    [filteredQuestions]
  );
  const percentage = totalPoints > 0 ? Math.round((score / totalPoints) * 100) : 0;

  const handleAnswer = useCallback((answer: string) => {
    if (showResult || !currentQ) return;
    setSelectedAnswer(answer);
    setShowResult(true);
    setAnswered(prev => ({ ...prev, [currentQ.id]: answer }));
    if (answer === currentQ.correctAnswer) {
      setScore(prev => prev + currentQ.points);
    }
  }, [showResult, currentQ]);

  const nextQuestion = useCallback(() => {
    if (!showResult) return;
    if (currentQuestion < filteredQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setExamComplete(true);
    }
  }, [showResult, currentQuestion, filteredQuestions.length]);

  const resetExam = useCallback(() => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setAnswered({});
    setExamComplete(false);
  }, []);

  const changeLevel = useCallback(() => {
    setSelectedLevel(null);
    resetExam();
  }, [resetExam]);

  // ============================================================
  // Empty State — No questions for this level
  // ============================================================
  if (selectedLevel && filteredQuestions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorState
          title="Belum ada soal"
          description={`Soal untuk level ${selectedLevel.toUpperCase()} sedang dalam persiapan. Coba level lain ya!`}
          onRetry={changeLevel}
        />
      </div>
    );
  }

  // ============================================================
  // Level Selection Screen
  // ============================================================
  if (!selectedLevel) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-10 border-l-4 border-[#8b2500] pl-5 md:pl-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8b2500] mb-2">Latihan mandiri</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3 text-foreground">
            Simulasi ujian Goethe
          </h1>
          <p className="text-muted-foreground text-base max-w-xl">
            Pilih level. Soal dan hasil latihan disusun berdasarkan level yang kamu pilih.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {examLevels.map((level, index) => {
            const levelQuestions = allQuestions.filter(q => q.level === level.id);
            const levelPoints = levelQuestions.reduce((sum, question) => sum + question.points, 0);
            const colors = levelColorMap[level.color] || levelColorMap.green;
            return (
              <motion.button
                type="button"
                key={level.id}
                whileHover={{ x: 3 }}
                whileTap={{ x: 0 }}
                onClick={() => setSelectedLevel(level.id as Level)}
                className={cn(
                  "group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-l-4 bg-card px-5 py-5 text-left transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset sm:grid-cols-[3rem_1fr_auto_auto] sm:px-7",
                  index > 0 && "border-t border-t-border",
                  colors.accent
                )}
                aria-label={`Pilih level ${level.name}`}
              >
                <span className="font-serif text-2xl font-bold text-muted-foreground/45 tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden="true">{level.icon}</span>
                    <span className="font-serif text-xl font-bold text-foreground">{level.name}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">{level.description}</span>
                  <span className="mt-3 flex gap-3 text-xs text-muted-foreground">
                    <span>{levelQuestions.length} soal</span>
                    <span aria-hidden="true">·</span>
                    <span>{levelPoints} poin</span>
                  </span>
                </span>
                <span className={cn("hidden px-2 py-1 text-xs font-bold sm:inline-block", colors.badge)}>{level.id.toUpperCase()}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // ============================================================
  // Exam Complete Screen
  // ============================================================
  if (examComplete) {
    const passed = percentage >= 60;
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8 border-2 border-border rounded-lg text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-6"
          >
            <Trophy
              className={cn(
                "w-16 h-16 mx-auto mb-4",
                passed ? "text-amber-500" : "text-muted-foreground"
              )}
              aria-hidden="true"
            />
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
              Selesai!
            </h2>
            <p className="text-muted-foreground">
              Level {selectedLevel.toUpperCase()}
            </p>
          </motion.div>

          <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-muted/40 divide-x divide-border mb-8">
            <div className="p-4">
              <p className="text-2xl md:text-3xl font-bold text-amber-500 font-heading">{score}</p>
              <p className="text-xs text-muted-foreground mt-1">Poin</p>
            </div>
            <div className="p-4">
              <p className={cn(
                "text-2xl md:text-3xl font-bold font-heading",
                passed ? "text-green-500" : "text-red-500"
              )}>
                {percentage}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">Benar</p>
            </div>
            <div className="p-4">
              <p className="text-2xl md:text-3xl font-bold text-blue-500 font-heading">
                {Object.keys(answered).length}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Dijawab</p>
            </div>
          </div>

          {passed && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 rounded-md">
              <p className="text-sm text-green-700 dark:text-green-400">
                Herzlichen Glückwunsch! Du hast bestanden! 🎉
              </p>
            </div>
          )}
          {!passed && (
            <div className="mb-6 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md">
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Übung macht den Meister. Versuche es noch einmal!
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button onClick={resetExam} variant="outline" className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Ulangi
            </Button>
            <Button onClick={changeLevel} className="gap-2">
              <Target className="w-4 h-4" />
              Ganti Level
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ============================================================
  // Question Screen
  // ============================================================
  if (!currentQ) {
    return (
      <div className="max-w-2xl mx-auto">
        <ErrorState
          title="Soal tidak ditemukan"
          description="Terjadi kesalahan saat memuat soal."
          onRetry={changeLevel}
        />
      </div>
    );
  }

  const typeStyle = typeStyleMap[currentQ.type] || typeStyleMap.vocab;
  const progressValue = ((currentQuestion + 1) / filteredQuestions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={changeLevel}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm px-2 py-1"
          aria-label="Kembali ke pilihan level"
        >
          ← Kembali
        </button>
        <div className="flex items-center gap-2 text-foreground">
          <Brain className="w-5 h-5 text-primary" aria-hidden="true" />
          <span className="font-bold">{selectedLevel.toUpperCase()}</span>
        </div>
        <div className="text-sm text-muted-foreground tabular-nums">
          {currentQuestion + 1}/{filteredQuestions.length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progressValue} className="h-2" />
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="p-6 border-2 border-border rounded-lg mb-6">
            {/* Question type badge + points */}
            <div className="flex items-center gap-2 mb-4">
              <span className={cn(
                "px-2.5 py-1 rounded text-xs font-medium",
                typeStyle.badge
              )}>
                {typeStyle.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {currentQ.points} poin
              </span>
            </div>

            {/* Question text */}
            <p className="text-lg text-foreground whitespace-pre-line mb-6 leading-relaxed">
              {currentQ.question}
            </p>

            {/* Options */}
            <div className="space-y-3" role="radiogroup" aria-label="Pilihan jawaban">
              {currentQ.options?.map((option, i) => {
                const isSelected = selectedAnswer === option;
                const isCorrect = option === currentQ.correctAnswer;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;
                const optionLetter = String.fromCharCode(65 + i);

                return (
                  <motion.button
                    key={i}
                    whileHover={!showResult ? { scale: 1.01 } : {}}
                    whileTap={!showResult ? { scale: 0.99 } : {}}
                    onClick={() => handleAnswer(option)}
                    disabled={showResult}
                    role="radio"
                    aria-checked={isSelected || false}
                    aria-label={`Jawaban ${optionLetter}: ${option}`}
                    className={cn(
                      "w-full text-left p-4 rounded-md border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      showCorrect && "border-green-500 bg-green-500/10",
                      showWrong && "border-red-500 bg-red-500/10",
                      !showResult && isSelected && "border-primary bg-primary/5",
                      !showResult && !isSelected && "border-border hover:border-primary/40 bg-card",
                      showResult && !showCorrect && !showWrong && "border-border opacity-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 rounded",
                        showCorrect && "bg-green-500 text-white",
                        showWrong && "bg-red-500 text-white",
                        !showResult && isSelected && "bg-primary text-primary-foreground",
                        !showResult && !isSelected && "bg-muted text-foreground",
                        showResult && !showCorrect && !showWrong && "bg-muted text-muted-foreground"
                      )}>
                        {showCorrect ? <CheckCircle2 className="w-5 h-5" /> :
                         showWrong ? <XCircle className="w-5 h-5" /> :
                         optionLetter}
                      </span>
                      <span className="text-foreground">{option}</span>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {showResult && currentQ.explanation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 bg-muted/50 border border-border rounded-md"
                >
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">💡 {currentQ.explanation}</span>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Next Button */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Button
              onClick={nextQuestion}
              className="w-full py-6 text-base font-bold gap-2"
              size="lg"
            >
              {currentQuestion < filteredQuestions.length - 1 ? (
                <>Soal Berikutnya <ArrowRight className="w-5 h-5" /></>
              ) : (
                <>Lihat Hasil <Trophy className="w-5 h-5" /></>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
