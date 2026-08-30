import React, { isValidElement, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { findLesson, getLessonVocabulary, getLessonExercises, getAllLessons } from '../lib/lessons-db';
import type { Lesson, VocabWord } from '../data/course';
import { courseIndex } from '../data/lessonIndex';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { useLessonTimer } from '../hooks/useLessonTimer';
import { Button } from '../components/ui/button';
import { CheckCircle2, ChevronRight, Brain, Trophy, Loader2, Star, AlertTriangle, Target, Mic, Headphones, Globe, MessageSquare, ArrowLeft, BookOpen, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { Tooltip, TooltipContent, TooltipTrigger } from '../components/ui/tooltip';
import { authedFetch } from '../lib/auth-headers';
import { dbProxy } from '../lib/supabase';
import { getCourseUnitRoute, isCheckpointUnit, inferCourseUnitLevel } from '../lib/courseUnitRoutes';

// ============================================================
// XP — single source of truth
// ------------------------------------------------------------
// Only two server RPCs ever hand out XP for a lesson:
//   add_xp          -> +10, granted once per correct answer
//   complete_lesson -> +10, granted once when the lesson is marked done
//                      (progressStore sends xpEarned: 10, matching the RPC default)
// Every number shown to the learner is derived from these two constants, so the
// promise on screen and the XP actually credited can never drift apart again.
// ============================================================
const XP_PER_CORRECT_ANSWER = 10;
const XP_PER_LESSON_COMPLETE = 10;

// The @tailwindcss/typography plugin is not installed in this project, so the
// `prose` classes that used to wrap every markdown block styled nothing at all —
// lists lost their bullets to Preflight. These plain-utility variants bring the
// formatting back without adding a dependency.
const MARKDOWN_STYLES = [
  '[&_p]:mb-4',
  '[&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5',
  '[&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5',
  '[&_li]:mb-1.5',
  '[&_strong]:font-bold [&_strong]:text-brand-ink',
  '[&_em]:italic',
  '[&_code]:bg-brand-ink/5 [&_code]:px-1 [&_code]:py-0.5',
  '[&_h2]:font-serif [&_h2]:text-brand-ink [&_h2]:text-xl [&_h2]:mt-6 [&_h2]:mb-2',
  '[&_h3]:font-serif [&_h3]:text-brand-ink [&_h3]:text-lg [&_h3]:mt-5 [&_h3]:mb-2',
  '[&_a]:text-brand-rust [&_a]:underline',
].join(' ');

// The generator is asked for 3 questions; hand-authored sets are sliced to match.
const MAX_QUESTIONS_PER_LESSON = 3;

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
            {/* brand-rust on white = 8.89:1 */}
            <span className="font-semibold text-brand-rust underline decoration-brand-rust/40 decoration-dashed underline-offset-4 cursor-help">
              {part}
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs bg-brand-ink text-brand-cream text-sm z-50">
            <p className="font-bold mb-1">{term}</p>
            <p className="text-cream-muted">{grammarGlossary[term]}</p>
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

/** What the learner sees after pressing "Cek Jawaban". Stays on screen until they move on. */
type AnswerResult = {
  isCorrect: boolean;
  /** Headline verdict. */
  feedback: string;
  /** The answer that was expected — shown whenever we know it. */
  correctAnswer?: string;
  /** Why it was wrong, when the data exists (lesson hint or AI explanation). */
  reason?: string;
  correctedSentence?: string;
};

// Server-verified access state. Content is rendered only on 'allowed'.
type AccessState = 'checking' | 'allowed' | 'denied' | 'error';

const ACCENT_HEADER: Record<'neutral' | 'rust' | 'green', string> = {
  // brand-ink on brand-cream = 17.48:1
  neutral: 'bg-brand-cream text-brand-ink',
  // brand-rust on rust/8 over white (#f6eeeb) = 7.77:1
  rust: 'bg-brand-rust/8 text-brand-rust',
  // #1a6b3d on green/8 over white (#eef6f1) = 5.94:1 — brand-green itself is
  // only 4.32:1 on white, so text uses the measured darker shade.
  green: 'bg-brand-green/8 text-[#1a6b3d]',
};

/** Editorial section: hairline frame, tinted label bar, sharp corners. */
function Section({
  icon: Icon,
  title,
  accent = 'neutral',
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  accent?: 'neutral' | 'rust' | 'green';
  children: React.ReactNode;
}) {
  return (
    <section className="border border-brand-ink/12 bg-white">
      <header className={cn('flex items-center gap-2.5 border-b border-brand-ink/10 px-5 py-3', ACCENT_HEADER[accent])}>
        <Icon className="w-4 h-4 shrink-0" />
        <h2 className="font-serif text-lg leading-tight">{title}</h2>
      </header>
      <div className="p-5 md:p-6">{children}</div>
    </section>
  );
}

/** Full-page state (loading / blocked / redirecting) in the editorial voice. */
function LessonNotice({
  icon: Icon,
  title,
  description,
  children,
  spinning = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  children?: React.ReactNode;
  spinning?: boolean;
}) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20">
      <div className="border border-brand-ink/12 bg-white p-8 md:p-10 text-center">
        <Icon className={cn('w-8 h-8 mx-auto mb-5 text-brand-rust', spinning && 'animate-spin')} />
        <h1 className="font-serif text-2xl text-brand-ink">{title}</h1>
        {description && <p className="mt-2 text-ink-muted">{description}</p>}
        {children && <div className="mt-6 flex flex-wrap gap-3 justify-center">{children}</div>}
      </div>
    </div>
  );
}

/** der / die / das chips — three brand colours, each measured against its own fill. */
function articleChipClass(article: string): string {
  const a = article.trim().toLowerCase();
  if (a.startsWith('der')) return 'bg-brand-ink text-brand-cream';   // 17.48:1
  if (a.startsWith('die')) return 'bg-brand-rust text-brand-cream';  //  7.85:1
  return 'bg-brand-tan text-brand-ink';                              //  7.52:1
}

export default function LessonView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addXp, unlockLesson, completeLesson, completedLessons, error: progressError, clearError } = useProgressStore();

  // Bound to the lesson id it was resolved for, so a lesson switch can never
  // reuse the previous verdict for even one frame.
  const [accessResult, setAccessResult] = useState<{ lessonId: string | null; state: AccessState }>({
    lessonId: null,
    state: 'checking',
  });
  const [accessRetry, setAccessRetry] = useState(0);
  const access: AccessState = accessResult.lessonId === id ? accessResult.state : 'checking';

  // Only clock study time once access is granted.
  const { endSession } = useLessonTimer(access === 'allowed' ? id : undefined);

  // Lesson content loads from the DB (lessons-db). findLesson covers content +
  // grammar; exercises & vocabulary are fetched alongside and merged so the
  // rest of the component keeps its original shape.
  const [lesson, setLesson] = useState<Lesson | undefined>(undefined);
  const [lessonsLoaded, setLessonsLoaded] = useState(false);
  useEffect(() => {
    let alive = true;
    setLesson(undefined);
    setLessonsLoaded(false);
    (async () => {
      try {
        const [l, vocab, exercises] = await Promise.all([
          findLesson(id || ''),
          getLessonVocabulary(id || ''),
          getLessonExercises(id || ''),
        ]);
        if (!alive) return;
        if (l) {
          setLesson({ ...l, vocabulary: vocab.length ? vocab : l.vocabulary, exercises: exercises.length ? exercises : l.exercises });
        }
      } finally {
        if (alive) setLessonsLoaded(true);
      }
    })();
    return () => { alive = false; };
  }, [id]);

  // "Ulas Kembali" shows vocab from the lessons this one reviews — load those
  // review lessons once the current lesson is known.
  const [reviewVocabIndex, setReviewVocabIndex] = useState<Map<string, Lesson>>(new Map());
  useEffect(() => {
    if (!lesson?.reviewLessons?.length) return;
    let alive = true;
    getAllLessons().then(all => {
      if (!alive) return;
      const map = new Map<string, Lesson>();
      for (const rid of lesson.reviewLessons!) {
        const hit = all.find(l => l.id === rid);
        if (hit) map.set(rid, hit);
      }
      setReviewVocabIndex(map);
    }).catch(() => {});
    return () => { alive = false; };
  }, [lesson?.reviewLessons]);

  // Sequencing comes from courseIndex — the same ordered map LevelView renders,
  // so "Pelajaran 4 dari 26" and "Pelajaran berikutnya" agree with the level page.
  // courseData is content only (and contains duplicate ids, so its order is not
  // safe to walk).
  const levelId = lesson?.level || inferCourseUnitLevel({ id: id || 'a1-1' });

  const { position, totalLessons, nextUnit } = useMemo(() => {
    const levelUnits = courseIndex.filter(u => inferCourseUnitLevel(u) === levelId);
    const lessonUnits = levelUnits.filter(u => !isCheckpointUnit(u));
    const indexPos = courseIndex.findIndex(u => u.id === id);
    return {
      position: lessonUnits.findIndex(u => u.id === id) + 1, // 0 when the lesson is not on the map
      totalLessons: lessonUnits.length,
      nextUnit: indexPos >= 0 ? courseIndex[indexPos + 1] ?? null : null,
    };
  }, [id, levelId]);

  const nextUnitId = nextUnit?.id ?? null;
  // Checkpoints live on their own route (scoring + requiredScore gate), lessons on /lesson.
  const nextUnitRoute = nextUnit ? getCourseUnitRoute(nextUnit) : null;
  const nextUnitIsCheckpoint = nextUnit ? isCheckpointUnit(nextUnit) : false;

  // A checkpoint id opened through /lesson/:id must never be rendered as a plain lesson quiz.
  const isCheckpointId = id ? isCheckpointUnit({ id }) : false;
  const checkpointRoute = id && isCheckpointId ? getCourseUnitRoute({ id }) : null;

  useEffect(() => {
    if (checkpointRoute) navigate(checkpointRoute, { replace: true });
  }, [checkpointRoute, navigate]);

  // Paywall / progression gate — RPC can_access_lesson via the server-side db proxy.
  useEffect(() => {
    if (!id || isCheckpointId) return;
    let cancelled = false;
    setAccessResult({ lessonId: id, state: 'checking' });

    (async () => {
      const { data, error } = await dbProxy('can-access', { lessonId: id });
      if (cancelled) return;
      if (error) {
        console.error('[LESSON] can-access failed:', error);
        setAccessResult({ lessonId: id, state: 'error' });
        return;
      }
      setAccessResult({ lessonId: id, state: data?.allowed === true ? 'allowed' : 'denied' });
    })();

    return () => { cancelled = true; };
  }, [id, isCheckpointId, accessRetry]);

  useEffect(() => {
    if (access === 'denied') navigate('/pricing', { replace: true });
  }, [access, navigate]);

  const lessonAlreadyCompleted = completedLessons?.includes(id || '') || false;

  const [activeTab, setActiveTab] = useState<'materi' | 'latihan'>('materi');
  const [quizFinished, setQuizFinished] = useState(lessonAlreadyCompleted);

  // Dynamic exercises state
  const [exercises, setExercises] = useState<DynamicExercise[]>([]);
  const [exercisesLoading, setExercisesLoading] = useState(false);
  const [exercisesError, setExercisesError] = useState<string | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);

  // Answer state
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [checkResult, setCheckResult] = useState<AnswerResult | null>(null);
  const [checkingAnswer, setCheckingAnswer] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  /** One entry per answered question — drives the score on the finish screen. */
  const [answerLog, setAnswerLog] = useState<boolean[]>([]);
  /** Question indexes already paid for, so a retry can never double-grant XP. */
  const awardedQuestions = useRef<Set<number>>(new Set());

  // Reset only when the lesson itself changes. This used to also depend on the
  // completedLessons array, whose identity is replaced on every progress refresh
  // — a background refresh mid-quiz threw the learner back to the Materi tab and
  // wiped the feedback they were still reading.
  useEffect(() => {
    setActiveTab('materi');
    setCurrentQuizIndex(0);
    setSelectedAnswer("");
    setIsAnswerChecked(false);
    setCheckResult(null);
    setExercises([]);
    setExercisesError(null);
    setAnswerLog([]);
    awardedQuestions.current = new Set();
    setQuizFinished(useProgressStore.getState().completedLessons?.includes(id || '') || false);
  }, [id]);

  // Primitive dependency: only flips when this lesson's completion actually changes.
  useEffect(() => {
    if (lessonAlreadyCompleted) setQuizFinished(true);
  }, [lessonAlreadyCompleted]);

  if (isCheckpointId) {
    if (checkpointRoute) {
      return <LessonNotice icon={Loader2} spinning title="Membuka checkpoint" description="Sebentar ya, kami sedang menyiapkan soal ujiannya." />;
    }
    return (
      <LessonNotice
        icon={AlertTriangle}
        title="Checkpoint belum tersedia"
        description="Soal untuk checkpoint ini belum siap. Lanjutkan dulu ke pelajaran berikutnya, checkpoint-nya menyusul."
      >
        <Button render={<Link to={`/level/${levelId}`} />} className="h-11 px-6 bg-brand-ink text-brand-cream hover:bg-brand-ink/90">
          Kembali ke peta level
        </Button>
      </LessonNotice>
    );
  }

  if (!lesson && !lessonsLoaded) {
    return <LessonNotice icon={Loader2} spinning title="Membuka pelajaran" description="Kami sedang menyiapkan materi pelajaran ini." />;
  }

  if (!lesson) {
    return (
      <LessonNotice
        icon={AlertTriangle}
        title="Pelajaran tidak ditemukan"
        description="Alamat halaman ini tidak cocok dengan pelajaran mana pun. Mungkin tautannya sudah berubah."
      >
        <Button render={<Link to="/" />} className="h-11 px-6 bg-brand-ink text-brand-cream hover:bg-brand-ink/90">
          Kembali ke dashboard
        </Button>
      </LessonNotice>
    );
  }

  if (access === 'checking') {
    return <LessonNotice icon={Loader2} spinning title="Membuka pelajaran" description="Kami sedang memastikan pelajaran ini sudah terbuka untukmu." />;
  }

  if (access === 'error') {
    return (
      <LessonNotice
        icon={AlertTriangle}
        title="Pelajaran belum bisa dibuka"
        description="Sambungan ke server sedang tersendat, jadi kami belum bisa memastikan pelajaran ini terbuka untukmu. Coba sebentar lagi."
      >
        <Button onClick={() => setAccessRetry(n => n + 1)} className="h-11 px-6 bg-brand-rust text-brand-cream hover:bg-brand-rust/90">
          Coba lagi
        </Button>
        <Button variant="outline" className="h-11 px-6" onClick={() => navigate(`/level/${levelId}`)}>
          Kembali ke peta level
        </Button>
      </LessonNotice>
    );
  }

  if (access !== 'allowed') {
    // 'denied' — the effect above is redirecting to /pricing.
    return <LessonNotice icon={Loader2} spinning title="Mengalihkan" description="Pelajaran ini bagian dari paket berbayar. Kami antar kamu ke halaman paket." />;
  }

  const normalizeExercise = (raw: any): DynamicExercise | null => {
    if (!raw || typeof raw.question !== 'string' || !raw.question.trim()) return null;
    const options = Array.isArray(raw.options) ? raw.options.filter((o: unknown) => typeof o === 'string') : [];
    const correctAnswerStr = typeof raw.correctAnswerStr === 'string' ? raw.correctAnswerStr : '';
    // A multiple choice question without options is unanswerable — fall back to free text.
    const type: DynamicExercise['type'] = options.length >= 2 ? 'multiple_choice' : 'free_text';
    if (type === 'multiple_choice' && !options.includes(correctAnswerStr)) return null;
    return {
      question: raw.question,
      type,
      options: type === 'multiple_choice' ? options : undefined,
      correctAnswerStr,
      hint: typeof raw.hint === 'string' && raw.hint.trim() ? raw.hint : undefined,
    };
  };

  const startQuiz = async () => {
    setActiveTab('latihan');
    setExercisesError(null);
    if (exercises.length > 0) return;

    const authored = (lesson.questions?.length ? lesson.questions : lesson.exercises) || [];
    if (authored.length > 0) {
      setExercises(authored.slice(0, MAX_QUESTIONS_PER_LESSON).map(q => ({
        question: q.question,
        type: 'multiple_choice',
        options: q.options,
        correctAnswerStr: q.options[q.correctAnswer],
      })));
      return;
    }

    setExercisesLoading(true);
    try {
      const resp = await authedFetch('/api/ai?action=generate-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: lesson.level, grammarTopic: lesson.grammarDescription, vocabulary: lesson.vocabulary || [] })
      });
      if (!resp.ok) throw new Error(`generate-exercises ${resp.status}`);
      const data = await resp.json();
      const usable = (Array.isArray(data?.exercises) ? data.exercises : [])
        .map(normalizeExercise)
        .filter(Boolean) as DynamicExercise[];
      if (usable.length === 0) {
        setExercisesError('Soal latihan untuk pelajaran ini belum berhasil disiapkan. Coba lagi sebentar lagi.');
        return;
      }
      setExercises(usable.slice(0, MAX_QUESTIONS_PER_LESSON));
    } catch (e) {
      console.error('[LESSON] generate-exercises failed:', e);
      setExercisesError('Terjadi gangguan jaringan, silakan coba lagi.');
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
          feedback: isCorrect
            ? 'Tepat sekali. Pola ini sudah kamu kuasai.'
            : 'Belum tepat. Tidak apa-apa, ini bagian dari belajar.',
          correctAnswer: isCorrect ? undefined : currentQuestion.correctAnswerStr,
          reason: isCorrect ? undefined : currentQuestion.hint,
        });
      } else {
        const resp = await authedFetch('/api/ai?action=check-answer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: currentQuestion.question, answer: selectedAnswer, level: lesson.level })
        });
        if (!resp.ok) throw new Error(`check-answer ${resp.status}`);
        const data = await resp.json();
        const isCorrect = data?.isCorrect === true;
        setCheckResult({
          isCorrect,
          feedback: isCorrect ? 'Tepat sekali.' : 'Belum tepat. Tidak apa-apa, ini bagian dari belajar.',
          reason: typeof data?.feedback === 'string' && data.feedback.trim()
            ? data.feedback
            : currentQuestion.hint,
          correctedSentence: typeof data?.correctedSentence === 'string' && data.correctedSentence.trim()
            ? data.correctedSentence
            : undefined,
        });
      }
      setIsAnswerChecked(true);
    } catch (e) {
      console.error('[LESSON] check-answer failed:', e);
      setCheckResult({
        isCorrect: false,
        feedback: 'Jawabanmu belum bisa diperiksa',
        reason: 'Sambungan ke pemeriksa jawaban sedang tersendat. Coba tekan "Cek Jawaban" sekali lagi.',
      });
      setIsAnswerChecked(true);
    } finally {
      setCheckingAnswer(false);
    }
  };

  /** Move to the next question (or finish). Wrong answers move on too — the
   *  explanation stays on screen until the learner presses this. */
  const advance = async (wasCorrect: boolean) => {
    if (advancing) return;
    setAdvancing(true);
    try {
      if (wasCorrect && user && !awardedQuestions.current.has(currentQuizIndex)) {
        awardedQuestions.current.add(currentQuizIndex);
        await addXp(user.id, XP_PER_CORRECT_ANSWER);
      }
      setAnswerLog(prev => [...prev, wasCorrect]);

      if (currentQuizIndex < exercises.length - 1) {
        setCurrentQuizIndex(prev => prev + 1);
        setSelectedAnswer("");
        setIsAnswerChecked(false);
        setCheckResult(null);
      } else {
        await finishLesson();
      }
    } finally {
      setAdvancing(false);
    }
  };

  /** Clear the verdict and let the learner answer this same question again. */
  const retryQuestion = () => {
    setSelectedAnswer("");
    setIsAnswerChecked(false);
    setCheckResult(null);
  };

  const finishLesson = async () => {
    setQuizFinished(true);
    await endSession();
    if (user && lesson) {
      // complete_lesson credits XP_PER_LESSON_COMPLETE and unlocks the next unit
      // server-side; progressStore re-reads the authoritative snapshot after.
      await completeLesson(user.id, lesson.id);
      const unlockedNow = useProgressStore.getState().unlockedLessons;
      if (nextUnitId && !unlockedNow.includes(nextUnitId)) {
        await unlockLesson(user.id, nextUnitId);
      }
    }
  };

  const currentQuestion = exercises.length > 0 ? exercises[currentQuizIndex] : null;
  const correctCount = answerLog.filter(Boolean).length;
  const earnedXp = correctCount * XP_PER_CORRECT_ANSWER + XP_PER_LESSON_COMPLETE;
  const positionLabel = position > 0 ? `Pelajaran ${position} dari ${totalLessons}` : 'Pelajaran';
  const answeredSoFar = Math.min(currentQuizIndex, exercises.length);

  const tabClass = (tab: 'materi' | 'latihan') => cn(
    'px-4 py-3 text-sm font-semibold tracking-wide transition-colors',
    activeTab === tab
      ? 'bg-brand-ink text-brand-cream'            // 17.48:1
      : 'bg-brand-cream text-ink-muted hover:text-brand-ink' // 6.14:1
  );

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4 sm:px-6">
      {/* Back nav */}
      <Link
        to={`/level/${levelId}`}
        className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-subtle hover:text-brand-ink mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
        Kembali ke peta level {levelId}
      </Link>

      {/* ───────── Lesson header — where am I? ───────── */}
      <header className="mb-8 border-b-2 border-brand-ink pb-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-subtle">
          <span className="bg-brand-ink px-2 py-0.5 text-brand-cream">{levelId}</span>
          <span>{positionLabel}</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl md:text-5xl leading-[1.05] text-brand-ink">{lesson.title}</h1>

        {position > 0 && (
          <div className="mt-5">
            {/* Hairline position strip: one cell per lesson in this level */}
            <div className="flex gap-px" aria-hidden="true">
              {Array.from({ length: totalLessons }).map((_, i) => (
                <span
                  key={i}
                  className={cn('h-1 flex-1', i < position ? 'bg-brand-ink' : 'bg-brand-ink/12')}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-ink-subtle">
              Kamu ada di pelajaran ke-{position} dari {totalLessons} pelajaran level {levelId}.
            </p>
          </div>
        )}
      </header>

      {/* Persistence trouble — the store already phrases this for humans. */}
      {progressError && (
        <div className="mb-6 flex items-start gap-3 border border-brand-rust/30 bg-brand-rust/8 p-4">
          <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-brand-rust" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-brand-rust">{progressError}</p>
          </div>
          <button onClick={clearError} className="text-xs font-bold uppercase tracking-wider text-brand-rust hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* ───────── Materi / Latihan switch ───────── */}
      <div
        role="tablist"
        aria-label="Bagian pelajaran"
        className="grid grid-cols-2 gap-px border border-brand-ink/15 bg-brand-ink/15 mb-8"
      >
        <button
          role="tab"
          id="tab-materi"
          aria-selected={activeTab === 'materi'}
          aria-controls="panel-materi"
          onClick={() => setActiveTab('materi')}
          className={tabClass('materi')}
        >
          Materi & Kosakata
        </button>
        <button
          role="tab"
          id="tab-latihan"
          aria-selected={activeTab === 'latihan'}
          aria-controls="panel-latihan"
          onClick={() => setActiveTab('latihan')}
          className={tabClass('latihan')}
        >
          Latihan
        </button>
      </div>

      {activeTab === 'materi' && (
        <div id="panel-materi" role="tabpanel" aria-labelledby="tab-materi" className="space-y-6 animate-in fade-in-50 duration-300">
          {lesson.grammarDescription && (
            <Section icon={Brain} title="Tata Bahasa">
              <div className={cn(MARKDOWN_STYLES, "max-w-none text-lg text-ink-muted")}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-4">{renderChildrenWithGlossary(children)}</p>,
                    li: ({ children }) => <li>{renderChildrenWithGlossary(children)}</li>
                  }}
                >
                  {lesson.grammarDescription}
                </ReactMarkdown>
              </div>
            </Section>
          )}

          {lesson.canDoGoals && lesson.canDoGoals.length > 0 && (
            <Section icon={Target} title="Setelah pelajaran ini, kamu bisa:" accent="green">
              <ul className="space-y-3">
                {lesson.canDoGoals.map((goal, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0 text-[#1a6b3d]" />
                    <span className="text-lg text-brand-ink">{goal}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {lesson.indonesianMistakes && (
            <Section icon={AlertTriangle} title="Kesalahan Umum Pembelajar Indonesia" accent="rust">
              <div className={cn(MARKDOWN_STYLES, "max-w-none text-lg text-ink-muted [&_strong]:text-brand-rust")}>
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-4">{children}</p>,
                    li: ({ children }) => <li>{children}</li>
                  }}
                >
                  {lesson.indonesianMistakes}
                </ReactMarkdown>
              </div>
            </Section>
          )}

          {lesson.culturalNotes && (
            <Section icon={Globe} title="Catatan Kehidupan Nyata di Jerman">
              <p className="text-lg text-ink-muted">{lesson.culturalNotes}</p>
            </Section>
          )}

          {lesson.registerNotes && (
            <Section icon={MessageSquare} title="Catatan Ragam Bahasa (Formal/Nonformal)">
              <div className={cn(MARKDOWN_STYLES, "max-w-none text-lg text-ink-muted")}>
                <ReactMarkdown>{lesson.registerNotes}</ReactMarkdown>
              </div>
            </Section>
          )}

          {lesson.listeningSimulation && (
            <Section icon={Headphones} title="Transkrip Simulasi Mendengarkan">
              <div className="space-y-4">
                {lesson.listeningSimulation.transcript.map((line, idx) => (
                  <div key={idx} className="border-l-2 border-brand-ink/15 pl-4">
                    {line.personA && (
                      <p className="text-brand-ink">
                        <span className="font-bold text-ink-subtle mr-2">A</span>{line.personA}
                      </p>
                    )}
                    {line.personB && (
                      <p className="text-brand-ink">
                        <span className="font-bold text-ink-subtle mr-2">B</span>{line.personB}
                      </p>
                    )}
                    {line.translation && (
                      <p className="mt-1 text-sm italic text-ink-subtle">{line.translation}</p>
                    )}
                  </div>
                ))}
              </div>
              {lesson.listeningSimulation.questions && lesson.listeningSimulation.questions.length > 0 && (
                <div className="mt-6 border border-brand-ink/12 bg-brand-cream p-4">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-ink-subtle">Pertanyaan Singkat</span>
                  <ul className="space-y-1">
                    {lesson.listeningSimulation.questions.map((q, idx) => (
                      <li key={idx} className="text-brand-ink">{q.question}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}

          {lesson.vocabulary && lesson.vocabulary.length > 0 && (
            <Section icon={BookOpen} title="Kosakata Utama">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-brand-ink/10 border border-brand-ink/10">
                {lesson.vocabulary?.map((v) => (
                  <div key={v.id} className="flex flex-col gap-1 bg-brand-cream p-4">
                    <div className="flex items-baseline gap-2">
                      {v.article && (
                        <span className={cn('px-2 py-0.5 text-xs font-bold', articleChipClass(v.article))}>
                          {v.article}
                        </span>
                      )}
                      <span className="font-bold text-lg text-brand-ink">{v.word}</span>
                    </div>
                    <span className="text-ink-muted">{v.translation}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {lesson.pronunciationTips && (
            <Section icon={Mic} title="Panduan Pengucapan">
              <div className={cn(MARKDOWN_STYLES, "max-w-none text-lg text-ink-muted")}>
                {Array.isArray(lesson.pronunciationTips) ? (
                  <ul className="list-disc pl-5 space-y-2 marker:text-brand-rust">
                    {lesson.pronunciationTips.map((tip, idx) => (
                      <li key={idx}>
                        <ReactMarkdown>{tip}</ReactMarkdown>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ReactMarkdown>{lesson.pronunciationTips}</ReactMarkdown>
                )}
              </div>
            </Section>
          )}

          {lesson.reviewLessons && lesson.reviewLessons.length > 0 && (
            <Section icon={Sparkles} title="Ulas Kembali">
              <p className="mb-5 text-ink-muted">
                Kosakata dari pelajaran sebelumnya yang muncul lagi hari ini, supaya tidak cepat lupa.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-brand-ink/10 border border-brand-ink/10">
                {lesson.reviewLessons.flatMap(reviewId => {
                  const reviewLesson = reviewVocabIndex.get(reviewId);
                  return reviewLesson?.vocabulary?.slice(0, 2) || [];
                }).filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).map((v) => (
                  <div key={`review-${v.id}`} className="flex flex-col gap-1 bg-white p-4">
                    <div className="flex items-baseline gap-2">
                      {v.article && (
                        <span className={cn('px-2 py-0.5 text-xs font-bold', articleChipClass(v.article))}>
                          {v.article}
                        </span>
                      )}
                      <span className="font-bold text-lg text-brand-ink">{v.word}</span>
                    </div>
                    <span className="text-ink-muted">{v.translation}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <Button
            onClick={startQuiz}
            className="w-full h-14 text-base font-bold bg-brand-rust text-brand-cream hover:bg-brand-rust/90"
          >
            Mulai latihan <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}

      {activeTab === 'latihan' && (
        <div id="panel-latihan" role="tabpanel" aria-labelledby="tab-latihan" className="animate-in fade-in-50 duration-300">
          {quizFinished ? (
            <div className="border border-brand-ink/12 bg-white">
              <div className="bg-brand-ink px-6 py-10 text-center">
                <Trophy className="w-10 h-10 mx-auto mb-4 text-brand-tan" />
                <h2 className="font-serif text-3xl text-brand-cream">Pelajaran selesai</h2>
                <p className="mt-2 text-cream-muted">
                  {answerLog.length > 0
                    ? `${correctCount} dari ${answerLog.length} soal kamu jawab benar.`
                    : 'Pelajaran ini sudah kamu tuntaskan sebelumnya.'}
                </p>
              </div>

              {answerLog.length > 0 && (
                <div className="grid grid-cols-2 gap-px border-b border-brand-ink/10 bg-brand-ink/10">
                  <div className="bg-brand-cream p-5 text-center">
                    <div className="font-serif text-3xl text-brand-ink">+{earnedXp}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-ink-subtle">XP diperoleh</div>
                  </div>
                  <div className="bg-brand-cream p-5 text-center">
                    <div className="font-serif text-3xl text-brand-ink">{correctCount}/{answerLog.length}</div>
                    <div className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-ink-subtle">Jawaban benar</div>
                  </div>
                </div>
              )}

              <div className="p-6 md:p-8">
                <p className="mb-6 text-center text-ink-muted">
                  {correctCount === answerLog.length || answerLog.length === 0
                    ? 'Rapi. Lanjutkan selagi ingatannya masih hangat.'
                    : 'Bagian yang belum tepat akan muncul lagi di pelajaran berikutnya, santai saja.'}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button variant="outline" className="h-11 px-6" onClick={() => navigate(`/level/${levelId}`)}>
                    Kembali ke peta level
                  </Button>
                  {nextUnitRoute && (
                    <Button
                      className="h-11 px-6 bg-brand-rust text-brand-cream hover:bg-brand-rust/90"
                      onClick={() => navigate(nextUnitRoute)}
                    >
                      {nextUnitIsCheckpoint ? 'Lanjut ke checkpoint' : 'Pelajaran berikutnya'}
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : exercisesLoading ? (
            <div className="border border-brand-ink/12 bg-white p-12 text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-5 animate-spin text-brand-rust" />
              <h2 className="font-serif text-2xl text-brand-ink">Menyiapkan soal latihan</h2>
              <p className="mt-2 text-ink-muted">Herr Deutsch sedang meracik soal khusus untuk materi ini.</p>
            </div>
          ) : exercisesError ? (
            <div className="border border-brand-rust/30 bg-white p-10 text-center">
              <AlertTriangle className="w-8 h-8 mx-auto mb-5 text-brand-rust" />
              <h2 className="font-serif text-2xl text-brand-ink">Latihan belum bisa dimulai</h2>
              <p className="mt-2 text-ink-muted">{exercisesError}</p>
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <Button onClick={startQuiz} className="h-11 px-6 bg-brand-rust text-brand-cream hover:bg-brand-rust/90">
                  Coba lagi
                </Button>
                <Button variant="outline" className="h-11 px-6" onClick={() => setActiveTab('materi')}>
                  Baca materinya dulu
                </Button>
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="border border-brand-ink/12 bg-white">
              {/* Quiz meta */}
              <div className="flex items-center justify-between border-b border-brand-ink/10 bg-brand-cream px-5 py-3">
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-ink-subtle">
                  Soal {currentQuizIndex + 1} dari {exercises.length}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-brand-rust">
                  <Star className="w-3.5 h-3.5" /> +{XP_PER_CORRECT_ANSWER} XP
                </span>
              </div>
              <div className="flex gap-px" aria-hidden="true">
                {exercises.map((_, i) => (
                  <span key={i} className={cn('h-1 flex-1', i < answeredSoFar ? 'bg-brand-rust' : 'bg-brand-ink/12')} />
                ))}
              </div>

              <div className="p-6 md:p-8">
                <h2 className="font-serif text-2xl leading-snug text-brand-ink mb-7">{currentQuestion.question}</h2>

                <div className="space-y-px bg-brand-ink/10 border border-brand-ink/10">
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
                            'w-full text-left p-4 text-lg transition-colors',
                            'bg-white text-brand-ink hover:bg-brand-cream',
                            isSelected && !isAnswerChecked && 'bg-brand-cream font-semibold shadow-[inset_3px_0_0_0_var(--brand-ink)]',
                            // #1a6b3d on green/8 = 5.94:1
                            isCorrectOption && 'bg-brand-green/8 text-[#1a6b3d] font-semibold shadow-[inset_3px_0_0_0_#1a6b3d]',
                            // brand-rust on rust/8 = 7.77:1
                            isWrongOption && 'bg-brand-rust/8 text-brand-rust font-semibold shadow-[inset_3px_0_0_0_var(--brand-rust)]'
                          )}
                          aria-label={`Jawaban: ${opt}`}
                        >
                          <span className="flex items-center justify-between gap-3">
                            <span>{opt}</span>
                            {isCorrectOption && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                          </span>
                        </button>
                      );
                    })
                  ) : (
                    <>
                      <label htmlFor="lesson-answer" className="sr-only">Jawaban dalam bahasa Jerman</label>
                      <textarea
                        id="lesson-answer"
                        name="lesson-answer"
                        disabled={isAnswerChecked || checkingAnswer}
                        value={selectedAnswer}
                        onChange={(e) => setSelectedAnswer(e.target.value)}
                        placeholder="Tulis jawabanmu dalam bahasa Jerman di sini..."
                        className="block w-full min-h-[120px] resize-none bg-white p-4 text-lg text-brand-ink placeholder:text-ink-subtle focus:outline-none focus:bg-brand-cream"
                      />
                    </>
                  )}
                </div>

                {currentQuestion.hint && !isAnswerChecked && (
                  <p className="mt-3 text-sm text-ink-subtle">Petunjuk: {currentQuestion.hint}</p>
                )}

                {/* Verdict — stays put until the learner chooses to move on. */}
                {isAnswerChecked && checkResult && (
                  <div
                    role="status"
                    aria-live="polite"
                    className={cn(
                      'mt-6 border-l-4 p-5',
                      checkResult.isCorrect
                        ? 'border-l-[#1a6b3d] bg-brand-green/8'
                        : 'border-l-brand-rust bg-brand-rust/8'
                    )}
                  >
                    <p className={cn('font-serif text-lg', checkResult.isCorrect ? 'text-[#1a6b3d]' : 'text-brand-rust')}>
                      {checkResult.feedback}
                    </p>
                    {checkResult.correctAnswer && (
                      <p className="mt-2 text-brand-ink">
                        Jawaban yang benar: <span className="font-bold">{checkResult.correctAnswer}</span>
                      </p>
                    )}
                    {checkResult.reason && (
                      <p className="mt-2 text-ink-muted">{checkResult.reason}</p>
                    )}
                    {checkResult.correctedSentence && (
                      <div className="mt-4 border border-brand-ink/12 bg-white p-4">
                        <span className="block text-xs font-bold uppercase tracking-[0.16em] text-ink-subtle mb-1">
                          Kalimat yang lebih tepat
                        </span>
                        <p className="text-lg font-bold text-brand-ink">{checkResult.correctedSentence}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-8 border-t border-brand-ink/10 pt-6">
                  {!isAnswerChecked ? (
                    <Button
                      className="w-full h-14 text-base font-bold bg-brand-rust text-brand-cream hover:bg-brand-rust/90"
                      disabled={!selectedAnswer.trim() || checkingAnswer}
                      onClick={handleCheckAnswer}
                    >
                      {checkingAnswer ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Memeriksa...</> : 'Cek jawaban'}
                    </Button>
                  ) : (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {!checkResult?.isCorrect && (
                        <Button variant="outline" className="h-14 flex-1 text-base font-bold" onClick={retryQuestion}>
                          Coba soal ini lagi
                        </Button>
                      )}
                      <Button
                        className="h-14 flex-1 text-base font-bold bg-brand-ink text-brand-cream hover:bg-brand-ink/90"
                        disabled={advancing}
                        onClick={() => advance(checkResult?.isCorrect === true)}
                      >
                        {advancing ? <><Loader2 className="w-5 h-5 mr-3 animate-spin" /> Menyimpan...</>
                          : currentQuizIndex < exercises.length - 1 ? 'Soal berikutnya' : 'Selesaikan pelajaran'}
                        {!advancing && <ChevronRight className="w-4 h-4 ml-2" />}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-brand-ink/12 bg-white p-10 text-center">
              <Target className="w-8 h-8 mx-auto mb-5 text-brand-rust" />
              <h2 className="font-serif text-2xl text-brand-ink">Siap berlatih?</h2>
              <p className="mt-2 text-ink-muted">
                Tiga soal singkat untuk memastikan materinya benar-benar nempel.
                Setiap jawaban benar bernilai {XP_PER_CORRECT_ANSWER} XP.
              </p>
              <Button onClick={startQuiz} className="mt-6 h-12 px-8 bg-brand-rust text-brand-cream hover:bg-brand-rust/90">
                Mulai latihan <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
