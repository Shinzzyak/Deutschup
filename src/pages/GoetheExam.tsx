import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2, XCircle, ArrowRight, RotateCcw,
  Trophy, Target, Brain, Sprout, BookOpen, Library, GraduationCap,
  ScrollText, PenLine, MessageCircle, type LucideIcon
} from 'lucide-react';
import { goetheExamQuestions, examLevels } from '../data/goethe-exam-questions';
import { extendedExamQuestions } from '../data/goethe-exam-extended';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { ErrorState } from '../components/ui/error-state';
import { cn } from '../lib/utils';

type Level = 'a1' | 'a2' | 'b1' | 'b2';

// R38-UI: emoji → Lucide — konsisten dengan Dashboard (GraduationCap, BookOpen,
// Target). Emoji baca sebagai AI-slop; Lucide = vocabulary ikon design system.
const LEVEL_ICONS: Record<string, LucideIcon> = {
  Sprout, BookOpen, Library, GraduationCap,
};
const SECTION_ICONS: Record<string, LucideIcon> = {
  ScrollText, PenLine, MessageCircle,
};

// One accent, four numbered rows. The app is permanently light — every `dark:`
// class that used to live here was dead weight, and the pastel-on-white text it
// replaced (green-500 at 2.3:1, amber-500 at 2.2:1) was unreadable anyway.
const LEVEL_BADGE = 'border border-brand-ink/12 bg-brand-cream text-ink-muted';

// Question type styling — the label already names the section, so the badge
// stays neutral instead of adding a fourth and fifth hue.
const typeStyleMap: Record<string, { label: string; icon: string }> = {
  reading: { label: 'Membaca', icon: 'ScrollText' },
  grammar: { label: 'Tata bahasa', icon: 'PenLine' },
  vocab: { label: 'Kosakata', icon: 'MessageCircle' },
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
        <div className="mb-10 border-l-4 border-brand-rust pl-5 md:pl-6">
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-brand-rust uppercase">Latihan mandiri</p>
          <h1 className="mb-3 font-serif text-3xl font-bold text-brand-ink md:text-4xl">
            Simulasi ujian Goethe
          </h1>
          <p className="max-w-xl text-base text-ink-muted">
            Pilih level. Soal dan hasil latihan disusun berdasarkan level yang kamu pilih.
          </p>
        </div>

        <div className="border border-brand-ink/12 bg-white">
          {examLevels.map((level, index) => {
            const levelQuestions = allQuestions.filter(q => q.level === level.id);
            const levelPoints = levelQuestions.reduce((sum, question) => sum + question.points, 0);
            return (
              <motion.button
                type="button"
                key={level.id}
                whileHover={{ x: 3 }}
                whileTap={{ x: 0 }}
                onClick={() => setSelectedLevel(level.id as Level)}
                className={cn(
                  "group grid w-full grid-cols-[2.5rem_1fr_auto] items-center gap-4 border-l-4 border-l-brand-rust bg-white px-5 py-5 text-left transition-colors hover:bg-brand-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rust focus-visible:ring-inset sm:grid-cols-[3rem_1fr_auto_auto] sm:px-7",
                  index > 0 && "border-t border-t-brand-ink/10"
                )}
                aria-label={`Pilih level ${level.name}`}
              >
                <span className="font-serif text-2xl font-bold text-ink-subtle tabular-nums">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>
                  <span className="flex items-center gap-2">
                    <span className="text-ink-muted" aria-hidden="true">
                      {(() => { const Icon = LEVEL_ICONS[level.icon]; return Icon ? <Icon className="h-5 w-5" /> : null; })()}
                    </span>
                    <span className="font-serif text-xl font-bold text-brand-ink">{level.name}</span>
                  </span>
                  <span className="mt-1 block text-sm text-ink-muted">{level.description}</span>
                  <span className="mt-3 flex gap-3 text-xs text-ink-subtle">
                    <span>{levelQuestions.length} soal</span>
                    <span aria-hidden="true">·</span>
                    <span>{levelPoints} poin</span>
                  </span>
                </span>
                <span className={cn("hidden px-2 py-1 text-xs font-bold sm:inline-block", LEVEL_BADGE)}>{level.id.toUpperCase()}</span>
                <ArrowRight className="h-5 w-5 text-ink-muted transition-transform group-hover:translate-x-1" aria-hidden="true" />
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
        <div className="border border-brand-ink/12 bg-white p-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mb-6"
          >
            <Trophy
              className={cn(
                "w-16 h-16 mx-auto mb-4",
                passed ? "text-brand-green" : "text-ink-subtle"
              )}
              aria-hidden="true"
            />
            <h2 className="mb-2 font-serif text-2xl font-bold text-brand-ink md:text-3xl">
              Selesai!
            </h2>
            <p className="text-ink-muted">
              Level {selectedLevel.toUpperCase()}
            </p>
          </motion.div>

          <div className="mb-8 grid grid-cols-3 gap-px border border-brand-ink/12 bg-brand-ink/12">
            <div className="bg-white p-4">
              <p className="font-serif text-2xl font-bold text-brand-ink md:text-3xl">{score}</p>
              <p className="mt-1 text-xs text-ink-subtle">Poin</p>
            </div>
            <div className="bg-white p-4">
              <p className={cn(
                "font-serif text-2xl font-bold md:text-3xl",
                // #1a6b3d, not brand-green: as *text* brand-green is only 4.32:1
                // on white, which needs the reader to qualify as large text.
                // #1a6b3d is 6.53:1 and passes at any size — the same substitution
                // LessonView / LevelView / CheckpointView already make.
                passed ? "text-[#1a6b3d]" : "text-brand-rust"
              )}>
                {percentage}%
              </p>
              <p className="mt-1 text-xs text-ink-subtle">Benar</p>
            </div>
            <div className="bg-white p-4">
              <p className="font-serif text-2xl font-bold text-brand-ink md:text-3xl">
                {Object.keys(answered).length}
              </p>
              <p className="mt-1 text-xs text-ink-subtle">Dijawab</p>
            </div>
          </div>

          {passed && (
            <div className="mb-6 border border-brand-green/25 border-l-4 border-l-brand-green bg-brand-green/10 p-3 text-left">
              <p className="text-sm font-bold text-brand-ink">
                Herzlichen Glückwunsch! Du hast bestanden!
              </p>
              <p className="mt-1 text-sm text-ink-muted">Selamat, kamu lolos ambang 60%.</p>
            </div>
          )}
          {!passed && (
            <div className="mb-6 border border-brand-rust/25 border-l-4 border-l-brand-rust bg-brand-tan/15 p-3 text-left">
              <p className="text-sm text-brand-ink">
                Übung macht den Meister. Versuche es noch einmal!
              </p>
              <p className="mt-1 text-sm text-ink-muted">Ambang lulus ada di 60% — ulangi levelnya, ya.</p>
            </div>
          )}

          <div className="flex justify-center gap-3">
            <Button onClick={resetExam} variant="outline" className="h-11 gap-2 px-5">
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Ulangi
            </Button>
            <Button onClick={changeLevel} className="h-11 gap-2 bg-brand-ink px-5 font-bold text-brand-cream hover:bg-brand-rust">
              <Target className="w-4 h-4" aria-hidden="true" />
              Ganti level
            </Button>
          </div>
        </div>
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
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={changeLevel}
          className="px-2 py-1 text-sm text-ink-muted transition-colors hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rust"
          aria-label="Kembali ke pilihan level"
        >
          ← Kembali
        </button>
        <div className="flex items-center gap-2 text-brand-ink">
          <Brain className="h-5 w-5 text-brand-rust" aria-hidden="true" />
          <span className="font-bold">{selectedLevel.toUpperCase()}</span>
        </div>
        <div className="text-sm text-ink-muted tabular-nums">
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
          <div className="mb-6 border border-brand-ink/12 bg-white p-6">
            {/* Question type badge + points */}
            <div className="mb-4 flex items-center gap-2">
              <span className="border border-brand-ink/12 bg-brand-cream px-2.5 py-1 text-xs font-bold text-ink-muted">
                {(() => { const Icon = SECTION_ICONS[typeStyle.icon]; return Icon ? <Icon className="mr-1 inline h-3.5 w-3.5 align-[-2px]" aria-hidden="true" /> : null; })()}
                {typeStyle.label}
              </span>
              <span className="text-xs text-ink-subtle">
                {currentQ.points} poin
              </span>
            </div>

            {/* Question text */}
            <p className="mb-6 text-lg leading-relaxed whitespace-pre-line text-brand-ink">
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
                      "w-full border-2 p-4 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rust focus-visible:ring-offset-2",
                      showCorrect && "border-brand-green bg-brand-green/10",
                      showWrong && "border-brand-rust bg-brand-rust/5",
                      !showResult && isSelected && "border-brand-ink bg-brand-cream",
                      !showResult && !isSelected && "border-brand-ink/15 bg-white hover:border-brand-rust/40",
                      // 60% keeps the dimmed text at 5.25:1; 50% dropped it to 3.74:1.
                      showResult && !showCorrect && !showWrong && "border-brand-ink/15 opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className={cn(
                        "flex h-8 w-8 flex-shrink-0 items-center justify-center text-sm font-bold",
                        // text-brand-ink, not text-white: 4.58:1 vs 4.32:1 on
                        // brand-green, and it is the pairing toast.tsx and
                        // VocabTrainerDB already use for this surface.
                        showCorrect && "bg-brand-green text-brand-ink",
                        showWrong && "bg-brand-rust text-brand-cream",
                        !showResult && isSelected && "bg-brand-ink text-brand-cream",
                        !showResult && !isSelected && "border border-brand-ink/20 bg-brand-cream text-brand-ink",
                        showResult && !showCorrect && !showWrong && "bg-brand-cream text-ink-muted"
                      )}>
                        {showCorrect ? <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> :
                         showWrong ? <XCircle className="h-5 w-5" aria-hidden="true" /> :
                         optionLetter}
                      </span>
                      <span className="text-brand-ink">{option}</span>
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
                  className="mt-4 border border-brand-ink/12 border-l-4 border-l-brand-tan bg-brand-cream p-4"
                >
                  <div className="flex items-start gap-2.5">
                    <Brain className="mt-0.5 h-4 w-4 shrink-0 text-brand-rust" aria-hidden="true" />
                    <p className="text-sm leading-relaxed text-brand-ink">
                      {currentQ.explanation}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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
              className="w-full gap-2 bg-brand-ink py-6 text-base font-bold text-brand-cream hover:bg-brand-rust"
              size="lg"
            >
              {currentQuestion < filteredQuestions.length - 1 ? (
                <>Soal berikutnya <ArrowRight className="h-5 w-5" aria-hidden="true" /></>
              ) : (
                <>Lihat hasil <Trophy className="h-5 w-5" aria-hidden="true" /></>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
