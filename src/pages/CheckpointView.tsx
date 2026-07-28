import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { courseData } from '../data/lessons';
import { courseIndex } from '../data/lessonIndex';
import { resolveCheckpointLesson } from '../lib/checkpointAdapter';
import { getCourseUnitRoute, inferCourseUnitLevel, isCheckpointUnit } from '../lib/courseUnitRoutes';
import { Button } from '../components/ui/button';
import { CheckCircle2, Trophy, ArrowLeft, Loader2, Target, AlertTriangle, RotateCcw, ChevronRight, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

// A checkpoint pays no XP of its own — submit_checkpoint only records the score
// and unlocks what comes next. So this page promises unlocking, never XP.

export default function CheckpointView() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const { submitCheckpoint, checkpointProgress, loading, error: progressError, clearError } = useProgressStore();

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
  const level = inferCourseUnitLevel({ id: id || 'a1-checkpoint-1' });

  // Get review lessons
  const reviewLessonIds = checkpointData?.reviewLessons || [];
  const reviewLessons = reviewLessonIds.map(lessonId => courseData.find(l => l.id === lessonId)).filter(Boolean);

  // Position on the level map — the learner should always know which of the
  // level's checkpoints this is, and what comes right after it.
  const { checkpointNumber, totalCheckpoints, nextUnit, nextLevel } = useMemo(() => {
    const levelUnits = courseIndex.filter(u => inferCourseUnitLevel(u) === level);
    const checkpoints = levelUnits.filter(isCheckpointUnit);
    const positionInLevel = levelUnits.findIndex(u => u.id === id);
    const levels = ['A1', 'A2', 'B1', 'B2'];
    const currentLevelIndex = levels.indexOf(level);
    return {
      checkpointNumber: checkpoints.findIndex(u => u.id === id) + 1,
      totalCheckpoints: checkpoints.length,
      nextUnit: positionInLevel >= 0 ? levelUnits[positionInLevel + 1] ?? null : null,
      nextLevel: currentLevelIndex >= 0 ? levels[currentLevelIndex + 1] ?? null : null,
    };
  }, [id, level]);

  const nextUnitRoute = nextUnit ? getCourseUnitRoute(nextUnit) : null;
  const nextUnitIsCheckpoint = nextUnit ? isCheckpointUnit(nextUnit) : false;

  useEffect(() => {
    if (alreadyPassed) {
      setQuizFinished(true);
      setPassed(true);
      setFinalScore(existingProgress?.bestScore || 0);
    }
  }, [alreadyPassed, existingProgress]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-rust" />
        <p className="mt-4 text-ink-muted">Membuka checkpoint...</p>
      </div>
    );
  }

  if (!checkpoint || !checkpointData) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
        <div className="border border-brand-ink/12 bg-white p-8 md:p-10 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-5 text-brand-rust" />
          <h1 className="font-serif text-2xl text-brand-ink">Checkpoint belum tersedia</h1>
          <p className="mt-2 text-ink-muted">
            Soal untuk checkpoint ini belum siap. Lanjutkan dulu ke pelajaran berikutnya — checkpoint-nya menyusul.
          </p>
          <div className="mt-6">
            <Button
              render={<Link to={`/level/${level}`} />}
              className="h-11 px-6 bg-brand-ink text-brand-cream hover:bg-brand-ink/90"
            >
              Kembali ke peta level {level}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const questions = checkpointData.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const requiredScore = checkpointData.requiredScore || 0.7;
  const totalQuestions = questions.length;
  const correctAnswerText = currentQuestion?.options?.[currentQuestion.correctAnswer];
  const answeredCount = answers.length;
  const correctSoFar = answers.filter(Boolean).length;

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
    const score = totalQuestions > 0 ? correctCount / totalQuestions : 0;
    setFinalScore(score);
    setPassed(score >= requiredScore);
    setQuizFinished(true);

    if (user && id) {
      setSubmitting(true);
      await submitCheckpoint(user.id, id, score, totalQuestions);
      setSubmitting(false);
    }
  };

  const restartCheckpoint = () => {
    setQuizFinished(false);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setIsAnswerChecked(false);
    setIsCorrect(false);
    setAnswers([]);
    setFinalScore(0);
    setPassed(false);
  };

  const positionLabel = checkpointNumber > 0
    ? `Checkpoint ${checkpointNumber} dari ${totalCheckpoints}`
    : 'Checkpoint';

  // Lessons worth re-reading before another attempt.
  const renderReviewSection = () => {
    if (reviewLessons.length === 0) return null;
    return (
      <section className="border border-brand-ink/12 bg-white mb-6">
        <header className="flex items-center gap-2.5 border-b border-brand-ink/10 bg-brand-cream px-5 py-3">
          <BookOpen className="w-4 h-4 text-brand-ink" />
          <h2 className="font-serif text-lg text-brand-ink">Yang diuji di sini</h2>
        </header>
        <div className="p-5">
          <p className="mb-4 text-ink-muted">
            Soal-soal berikut diambil dari pelajaran ini. Buka lagi kalau ada yang terasa asing.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-brand-ink/10 bg-brand-ink/10">
            {reviewLessons.map(lesson => lesson && (
              <Link
                key={lesson.id}
                to={`/lesson/${lesson.id}`}
                className="group bg-brand-cream p-4 transition-colors hover:bg-white"
              >
                <p className="font-bold text-sm text-brand-ink">{lesson.title}</p>
                <p className="mt-1 text-xs text-ink-subtle">
                  {lesson.vocabulary?.slice(0, 3).map(v => v.word).join(', ')}
                </p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-rust">
                  Buka <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4 sm:px-6">
      {/* Back nav */}
      <Link
        to={`/level/${level}`}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-subtle hover:text-brand-ink mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Kembali ke peta level {level}
      </Link>

      {/* ───────── Header — ink block, the heavier step ─────────
          Was `bg-primary` with no text colour: --primary is oklch(0.205 0 0) and
          the inherited --foreground is oklch(0.145 0 0), i.e. 1.10:1 — invisible. */}
      <header className="bg-brand-ink p-6 md:p-8 mb-8">
        <div className="flex gap-px mb-6" aria-hidden="true">
          <span className="h-1 flex-1 bg-brand-tan" />
          <span className="h-1 flex-1 bg-brand-rust" />
          <span className="h-1 flex-1 bg-brand-cream/30" />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-cream-muted">
          <Target className="w-4 h-4" />
          <span>Level {level}</span>
          <span aria-hidden="true">•</span>
          <span>{positionLabel}</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl md:text-4xl leading-tight text-brand-cream">{checkpointData.title}</h1>
        <p className="mt-3 max-w-xl text-cream-muted">
          Ujian singkat sebelum kamu lanjut. Lulus di angka {Math.round(requiredScore * 100)}% untuk membuka pelajaran berikutnya.
        </p>
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.14em]">
          <span className="border border-brand-cream/25 px-3 py-1.5 text-brand-cream">{totalQuestions} soal</span>
          <span className="border border-brand-cream/25 px-3 py-1.5 text-brand-cream">Nilai lulus {Math.round(requiredScore * 100)}%</span>
          {alreadyPassed && (
            <span className="bg-brand-tan px-3 py-1.5 text-brand-ink">Sudah lulus</span>
          )}
        </div>
      </header>

      {/* Persistence trouble — the store already phrases this for humans. */}
      {progressError && (
        <div className="mb-6 flex items-start gap-3 border border-brand-rust/30 bg-brand-rust/8 p-4">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-brand-rust" />
          <p className="flex-1 text-sm text-brand-rust">{progressError}</p>
          <button onClick={clearError} className="text-xs font-bold uppercase tracking-wider text-brand-rust hover:underline">
            Tutup
          </button>
        </div>
      )}

      {!quizFinished ? (
        <>
          {/* Review section before the first question */}
          {currentQuestionIndex === 0 && !isAnswerChecked && renderReviewSection()}

          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-xs font-bold uppercase tracking-[0.16em] text-ink-subtle mb-2">
              <span>Soal {currentQuestionIndex + 1} dari {totalQuestions}</span>
              {answeredCount > 0 && <span>{correctSoFar} benar sejauh ini</span>}
            </div>
            <div className="flex gap-px" aria-hidden="true">
              {questions.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1 flex-1',
                    i < answeredCount ? (answers[i] ? 'bg-brand-green' : 'bg-brand-rust') : 'bg-brand-ink/12'
                  )}
                />
              ))}
            </div>
          </div>

          {/* Question */}
          {currentQuestion && (
            <div className="border border-brand-ink/12 bg-white p-6 md:p-8">
              <p className="font-serif text-2xl leading-snug text-brand-ink mb-7">{currentQuestion.question}</p>

              <div className="space-y-px border border-brand-ink/10 bg-brand-ink/10">
                {currentQuestion.options.map((option, idx) => {
                  const isSelected = selectedAnswer === option;
                  const isRightOption = isAnswerChecked && option === correctAnswerText;
                  const isWrongPick = isAnswerChecked && isSelected && !isCorrect;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option)}
                      disabled={isAnswerChecked}
                      className={cn(
                        'w-full text-left p-4 text-lg transition-colors',
                        'bg-white text-brand-ink hover:bg-brand-cream',
                        isSelected && !isAnswerChecked && 'bg-brand-cream font-semibold shadow-[inset_3px_0_0_0_var(--brand-ink)]',
                        // #1a6b3d on green/8 over white = 5.94:1
                        isRightOption && 'bg-brand-green/8 text-[#1a6b3d] font-semibold shadow-[inset_3px_0_0_0_#1a6b3d]',
                        // brand-rust on rust/8 over white = 7.77:1
                        isWrongPick && 'bg-brand-rust/8 text-brand-rust font-semibold shadow-[inset_3px_0_0_0_var(--brand-rust)]'
                      )}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>{option}</span>
                        {isRightOption && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Verdict — stays until the learner moves on */}
              {isAnswerChecked && (
                <div
                  role="status"
                  aria-live="polite"
                  className={cn(
                    'mt-6 border-l-4 p-5',
                    isCorrect ? 'border-l-[#1a6b3d] bg-brand-green/8' : 'border-l-brand-rust bg-brand-rust/8'
                  )}
                >
                  <p className={cn('font-serif text-lg', isCorrect ? 'text-[#1a6b3d]' : 'text-brand-rust')}>
                    {isCorrect ? 'Benar.' : 'Belum tepat.'}
                  </p>
                  {!isCorrect && correctAnswerText && (
                    <p className="mt-2 text-brand-ink">
                      Jawaban yang benar: <span className="font-bold">{correctAnswerText}</span>
                    </p>
                  )}
                  <p className="mt-2 text-ink-muted">
                    {isCorrect
                      ? 'Lanjut ke soal berikutnya kalau sudah siap.'
                      : 'Soal ini dihitung sebagai jawaban salah. Kamu masih boleh mengulang seluruh checkpoint nanti kalau nilainya kurang.'}
                  </p>
                </div>
              )}

              {/* Action */}
              <div className="mt-8 border-t border-brand-ink/10 pt-6">
                {!isAnswerChecked ? (
                  <Button
                    onClick={checkAnswer}
                    disabled={!selectedAnswer}
                    className="w-full h-14 text-base font-bold bg-brand-rust text-brand-cream hover:bg-brand-rust/90"
                  >
                    Cek jawaban
                  </Button>
                ) : (
                  <Button
                    onClick={nextQuestion}
                    className="w-full h-14 text-base font-bold bg-brand-ink text-brand-cream hover:bg-brand-ink/90"
                  >
                    {currentQuestionIndex < totalQuestions - 1 ? 'Soal berikutnya' : 'Lihat hasil'}
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        /* ───────── Result ───────── */
        <div className="border border-brand-ink/12 bg-white">
          <div className={cn('px-6 py-10 text-center', passed ? 'bg-brand-ink' : 'bg-brand-cream')}>
            {passed ? (
              <>
                <Trophy className="w-10 h-10 mx-auto mb-4 text-brand-tan" />
                <h2 className="font-serif text-3xl text-brand-cream">Checkpoint terlewati</h2>
                <p className="mt-2 text-cream-muted">
                  {nextUnit
                    ? 'Langkah berikutnya di level ini sudah terbuka.'
                    : `Kamu sudah menuntaskan checkpoint terakhir level ${level}.`}
                </p>
              </>
            ) : (
              <>
                <Target className="w-10 h-10 mx-auto mb-4 text-brand-rust" />
                <h2 className="font-serif text-3xl text-brand-ink">Belum cukup, tapi dekat</h2>
                <p className="mt-2 text-ink-muted">Ulangi pelajaran di bawah, lalu coba checkpoint ini lagi.</p>
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-px border-b border-brand-ink/10 bg-brand-ink/10">
            <div className="bg-brand-cream p-5 text-center">
              <div className={cn('font-serif text-3xl', passed ? 'text-[#1a6b3d]' : 'text-brand-rust')}>
                {Math.round(finalScore * 100)}%
              </div>
              <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-ink-subtle">Skor kamu</div>
            </div>
            <div className="bg-brand-cream p-5 text-center">
              <div className="font-serif text-3xl text-brand-ink">{Math.round(requiredScore * 100)}%</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-ink-subtle">Nilai lulus</div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            {submitting && (
              <p className="mb-5 flex items-center justify-center gap-2 text-sm text-ink-subtle">
                <Loader2 className="w-4 h-4 animate-spin" /> Menyimpan hasilmu...
              </p>
            )}

            {!passed && reviewLessons.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-ink-subtle">Ulangi dulu</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-px border border-brand-ink/10 bg-brand-ink/10">
                  {reviewLessons.map(lesson => lesson && (
                    <Link
                      key={lesson.id}
                      to={`/lesson/${lesson.id}`}
                      className="bg-brand-cream p-4 transition-colors hover:bg-white"
                    >
                      <p className="font-bold text-sm text-brand-ink">{lesson.title}</p>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-brand-rust">
                        Buka <ChevronRight className="w-3 h-3" />
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button render={<Link to={`/level/${level}`} />} variant="outline" className="h-11 px-6">
                Kembali ke peta level {level}
              </Button>

              {passed && nextUnitRoute && (
                <Button
                  render={<Link to={nextUnitRoute} />}
                  className="h-11 px-6 bg-brand-rust text-brand-cream hover:bg-brand-rust/90"
                >
                  {nextUnitIsCheckpoint ? 'Lanjut ke checkpoint berikutnya' : 'Lanjut ke pelajaran berikutnya'}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {passed && !nextUnit && nextLevel && (
                <Button
                  render={<Link to={`/level/${nextLevel}`} />}
                  className="h-11 px-6 bg-brand-rust text-brand-cream hover:bg-brand-rust/90"
                >
                  Mulai level {nextLevel}
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              )}

              {!passed && (
                <Button
                  onClick={restartCheckpoint}
                  className="h-11 px-6 bg-brand-ink text-brand-cream hover:bg-brand-ink/90"
                >
                  <RotateCcw className="w-4 h-4 mr-2" /> Coba checkpoint lagi
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
