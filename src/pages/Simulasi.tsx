import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuthStore } from '../stores/authStore';
import { useLearningStore } from '../stores/learningStore';
import { isUserPro } from '../lib/subscription';
import { useProgressStore } from '../stores/progressStore';
import { Button } from '../components/ui/button';
import { ErrorState } from '../components/ui/error-state';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { AlertCircle, ArrowRight, CheckCircle2, Loader2, PlayCircle, Timer, XCircle, Trophy, Target } from 'lucide-react';
import { cn } from '../lib/utils';
import ReactMarkdown from 'react-markdown';
import { authedFetch } from '../lib/auth-headers';

// No correctAnswer here on purpose: the answer key stays on the server and is
// only revealed by /api/ai?action=score-mock-test after the attempt is submitted.
type MockQuestion = {
  id: string;
  category: string;
  context?: string;
  question: string;
  options: string[];
};

type ScoredQuestion = {
  id: string;
  correctAnswer: string;
  userAnswer: string;
  isCorrect: boolean;
};

type UserAnswerInfo = {
  question: string;
  userAnswer: string;
  correctAnswer: string;
};

/** Free tier: one attempt per rolling week (mirrors checkQuota in lib/api-utils.ts). */
const FREE_TESTS_PER_WEEK = 1;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const TEST_MINUTES = 30;
const WARN_SECONDS = 5 * 60;
const CRITICAL_SECONDS = 60;

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
};

/** Wall-clock label for a timestamp, in Indonesian. */
function formatMoment(at?: number | null): string | null {
  if (typeof at !== 'number' || !Number.isFinite(at)) return null;
  const d = new Date(at);
  if (Number.isNaN(d.getTime())) return null;
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (d.toDateString() === new Date().toDateString()) return `hari ini pukul ${time}`;
  const day = d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  return `${day} pukul ${time}`;
}

/**
 * api/ai.ts already writes warm Indonesian copy for every failure it knows about
 * (quota text, "Herr Deutsch sedang istirahat sebentar", the AI-off notice).
 * Read it and show it; our own wording only fills the gaps.
 */
function messageFromResponse(status: number, payload: any): string {
  const serverMessage = typeof payload?.error === 'string' && payload.error.trim() ? payload.error.trim() : null;
  if (serverMessage) return serverMessage;
  if (status === 401) return 'Sesi kamu sudah berakhir. Muat ulang halaman ini lalu masuk lagi, ya.';
  if (status === 429) return 'Terlalu banyak permintaan berturut-turut. Tunggu sekitar satu menit, lalu coba lagi.';
  return 'Soal simulasi belum bisa disiapkan sekarang. Coba lagi sebentar lagi, ya.';
}

export default function MockTest() {
  const { user, tierData, profileData } = useAuthStore();
  const { mockTests, saveMockTest, fetchData } = useLearningStore();
  const { addXp } = useProgressStore();
  const navigate = useNavigate();

  const [level, setLevel] = useState<'A1' | 'A2' | 'B1' | 'B2'>('A1');
  const [testState, setTestState] = useState<'SETUP' | 'LOADING' | 'ONGOING' | 'EVALUATING' | 'RESULT' | 'ERROR'>('SETUP');

  const [questions, setQuestions] = useState<MockQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptToken, setAttemptToken] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [targetTime, setTargetTime] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(TEST_MINUTES * 60);

  const [scoreInfo, setScoreInfo] = useState<{ score: number; total: number }>({ score: 0, total: 0 });
  const [scored, setScored] = useState<Record<string, ScoredQuestion>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [feedbackNotice, setFeedbackNotice] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');

  /** Start-up failure shown on the setup screen. `paywall` swaps retry for /pricing. */
  const [startFailure, setStartFailure] = useState<{ message: string; paywall: boolean; resetAt?: number } | null>(null);

  /** Confirmations. Only one can be open at a time. */
  const [pendingHref, setPendingHref] = useState<string | null>(null);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // The auto-submit fires from inside a setInterval closure created once per
  // attempt. Reading through refs keeps it on the latest answers without
  // restarting the interval on every click (which would break the countdown).
  const answersRef = useRef<Record<string, string>>({});
  const questionsRef = useRef<MockQuestion[]>([]);
  const attemptTokenRef = useRef<string | null>(null);
  const submittingRef = useRef(false);

  useEffect(() => { answersRef.current = answers; }, [answers]);
  useEffect(() => { questionsRef.current = questions; }, [questions]);
  useEffect(() => { attemptTokenRef.current = attemptToken; }, [attemptToken]);

  // Past attempts drive the weekly-quota line on the setup screen, so they have
  // to be loaded here too — this page never asked for them before.
  useEffect(() => {
    if (user) fetchData(user.id);
  }, [user, fetchData]);

  // ---------------------------------------------------------------- quota ---
  const isPro = isUserPro(tierData, tierData?.role || profileData?.role);
  const now = Date.now();
  const testsThisWeek = (mockTests || []).filter(t => now - t.createdAt < WEEK_MS);
  const attemptsLeft = isPro ? Infinity : Math.max(0, FREE_TESTS_PER_WEEK - testsThisWeek.length);
  const nextAttemptAt = testsThisWeek.length
    ? Math.min(...testsThisWeek.map(t => t.createdAt)) + WEEK_MS
    : null;

  const answeredCount = questions.filter(q => answers[q.id]).length;

  // ------------------------------------------------------------- submitting --
  const submitTest = useCallback(async () => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setConfirmSubmit(false);

    const submittedAnswers = answersRef.current;
    const activeQuestions = questionsRef.current;
    const token = attemptTokenRef.current;

    if (!token) {
      submittingRef.current = false;
      setSubmitError('Sesi simulasi ini sudah tidak berlaku. Kamu perlu memulai simulasi baru.');
      setTestState('ERROR');
      return;
    }

    setSubmitError('');
    setFeedbackNotice('');
    setTestState('EVALUATING');

    // 1. Server-side scoring — the browser never holds the answer key.
    let scoreData: { score: number; total: number; results: ScoredQuestion[] };
    try {
      const resp = await authedFetch('/api/ai?action=score-mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ attemptToken: token, answers: submittedAnswers })
      });
      const data = await resp.json().catch(() => null);
      if (!resp.ok || typeof data?.score !== 'number' || !Array.isArray(data?.results)) {
        throw new Error(messageFromResponse(resp.status, data));
      }
      scoreData = data;
    } catch (e: any) {
      console.error('[SIMULASI] scoring failed:', e);
      submittingRef.current = false;
      setSubmitError(
        typeof e?.message === 'string' && e.message
          ? e.message
          : 'Jawabanmu belum sampai ke penilai. Periksa jaringanmu, lalu kumpulkan lagi.'
      );
      setTestState('ERROR');
      return;
    }

    const scoredMap: Record<string, ScoredQuestion> = {};
    scoreData.results.forEach(r => { scoredMap[r.id] = r; });
    setScored(scoredMap);
    setScoreInfo({ score: scoreData.score, total: scoreData.total || activeQuestions.length });

    const wrongAnswers: UserAnswerInfo[] = activeQuestions
      .filter(q => scoredMap[q.id] && !scoredMap[q.id].isCorrect)
      .map(q => ({
        question: q.question,
        userAnswer: scoredMap[q.id].userAnswer || '(Tidak dijawab)',
        correctAnswer: scoredMap[q.id].correctAnswer
      }));

    if (user) {
      await saveMockTest(user.id, {
        level,
        score: scoreData.score,
        total: scoreData.total || activeQuestions.length,
        createdAt: Date.now()
      });
      await addXp(user.id, scoreData.score * 10);
    }

    // 2. AI explanations for the wrong answers — a bonus, never a blocker.
    //    A failure here used to raise an alert() on top of the result screen.
    try {
      if (wrongAnswers.length === 0) {
        setFeedbacks({});
      } else {
        const resp = await authedFetch('/api/ai?action=check-mock-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ level, wrongAnswers })
        });
        const data = await resp.json().catch(() => null);

        const feedbackMap: Record<string, string> = {};
        if (resp.ok && Array.isArray(data?.feedback) && data.feedback.length > 0) {
          data.feedback.forEach((f: any) => {
            // Map back to question ID by string matching (approx)
            const q = activeQuestions.find(qItem => qItem.question === f.question);
            if (q && typeof f.explanation === 'string') feedbackMap[q.id] = f.explanation;
          });
        } else {
          setFeedbackNotice('Penjelasan dari Herr Deutsch belum bisa dimuat kali ini. Jawaban yang benar tetap tercantum di bawah.');
        }
        setFeedbacks(feedbackMap);
      }
    } catch (e) {
      console.error('[SIMULASI] feedback failed:', e);
      setFeedbackNotice('Penjelasan dari Herr Deutsch belum bisa dimuat kali ini. Jawaban yang benar tetap tercantum di bawah.');
    } finally {
      setTestState('RESULT');
    }
  }, [addXp, level, saveMockTest, user]);

  // ----------------------------------------------------------------- timer ---
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
    // submitTest only reads refs + stable setters, so it is safe to keep it out
    // of the deps: adding `answers` here would restart the interval on each click.
  }, [testState, targetTime]);

  // ------------------------------------------------ leaving a live attempt ---
  // A free account gets one attempt a week, and the attempt is already spent on
  // the server the moment the questions load. One stray tap on the bottom nav
  // used to throw it away without a word.
  const attemptIsLive = testState === 'ONGOING' || testState === 'EVALUATING';

  useEffect(() => {
    if (!attemptIsLive) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    // Capture phase on `document` runs before React's root listener, so the
    // router never sees the click and the page stays put until the student says so.
    const onCapturedClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.hasAttribute('download')) return;
      if (anchor.target && anchor.target !== '_self') return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;               // external: let it go
      const here = window.location.pathname + window.location.search;
      const there = url.pathname + url.search;
      if (there === here) return;                                      // same page or in-page anchor

      e.preventDefault();
      e.stopPropagation();
      setPendingHref(there + url.hash);
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    document.addEventListener('click', onCapturedClick, true);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      document.removeEventListener('click', onCapturedClick, true);
    };
  }, [attemptIsLive]);

  // ----------------------------------------------------------------- start ---
  const startTest = async () => {
    setStartFailure(null);

    if (!isPro && attemptsLeft <= 0) {
      setStartFailure({
        message: 'Paket Gratis memberi satu simulasi setiap minggu, dan jatah minggu ini sudah kamu pakai.',
        paywall: true,
        resetAt: nextAttemptAt ?? undefined,
      });
      return;
    }

    setTestState('LOADING');
    try {
      const resp = await authedFetch('/api/ai?action=generate-mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level })
      });
      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        const paywall = resp.status === 402 || data?.code === 'QUOTA_EXCEEDED';
        setStartFailure({
          message: messageFromResponse(resp.status, data),
          paywall,
          resetAt: typeof data?.resetAt === 'number' ? data.resetAt : undefined,
        });
        setTestState('SETUP');
        return;
      }

      const incoming: MockQuestion[] = Array.isArray(data?.questions) ? data.questions : [];
      if (incoming.length === 0 || !data?.attemptToken) {
        setStartFailure({
          message: 'Soal yang datang belum lengkap, jadi simulasi tidak kami mulai. Coba lagi sebentar lagi, ya.',
          paywall: false,
        });
        setTestState('SETUP');
        return;
      }

      submittingRef.current = false;
      setQuestions(incoming);
      setAttemptToken(data.attemptToken);
      setAnswers({});
      setScored({});
      setFeedbacks({});
      setFeedbackNotice('');
      setSubmitError('');
      setCurrentIdx(0);
      setTimeLeft(TEST_MINUTES * 60);
      setTargetTime(Date.now() + TEST_MINUTES * 60 * 1000);
      setTestState('ONGOING');
    } catch (e) {
      console.error('[SIMULASI] start failed:', e);
      setStartFailure({
        message: 'Koneksi terputus saat menyiapkan soal. Periksa jaringanmu, lalu coba lagi.',
        paywall: false,
      });
      setTestState('SETUP');
    }
  };

  const backToSetup = () => {
    submittingRef.current = false;
    setAttemptToken(null);
    setTargetTime(null);
    setTestState('SETUP');
  };

  /** Abandon a live attempt on purpose, then follow the link that triggered it. */
  const leaveExam = () => {
    const href = pendingHref;
    setPendingHref(null);
    submittingRef.current = false;
    setAttemptToken(null);
    setTargetTime(null);
    setTestState('SETUP');
    if (href) navigate(href);
  };

  // =========================================================== SETUP screen ==
  if (testState === 'SETUP') {
    const nextLabel = formatMoment(nextAttemptAt);

    return (
      <div className="mx-auto max-w-3xl space-y-8 pb-20">
        <div className="border-l-4 border-brand-rust pl-5 md:pl-6">
          <p className="mb-2 text-xs font-bold tracking-[0.18em] text-brand-rust uppercase">Latihan mandiri</p>
          <h1 className="mb-3 font-serif text-3xl font-bold tracking-tight text-brand-ink md:text-4xl">Simulasi ujian</h1>
          <p className="max-w-lg text-lg text-ink-muted">
            Dua puluh soal membaca, tata bahasa, dan kosakata. Waktumu {TEST_MINUTES} menit, dan hitung mundur berjalan
            sejak soal pertama muncul.
          </p>
        </div>

        {/* Quota — stated before anyone commits 30 menit */}
        {!isPro && (
          <div
            className={cn(
              'border border-l-4 p-4 md:p-5',
              attemptsLeft > 0
                ? 'border-brand-ink/12 border-l-brand-ink bg-brand-cream'
                : 'border-brand-rust/25 border-l-brand-rust bg-brand-rust/5'
            )}
          >
            <p className="mb-1 text-xs font-bold tracking-[0.16em] text-ink-subtle uppercase">Paket gratis</p>
            {attemptsLeft > 0 ? (
              <p className="text-base text-brand-ink">
                Kamu punya <strong className="font-bold">{attemptsLeft} simulasi</strong> minggu ini. Setelah dipakai,
                jatah berikutnya terbuka tujuh hari kemudian.
              </p>
            ) : (
              <>
                <p className="text-base text-brand-ink">Jatah simulasi minggu ini sudah terpakai.</p>
                {nextLabel && <p className="mt-1 text-sm text-ink-muted">Jatah berikutnya terbuka {nextLabel}.</p>}
                <Button
                  render={<Link to="/pricing" />}
                  className="mt-4 h-11 bg-brand-rust px-6 font-bold text-brand-cream hover:bg-brand-ink"
                >
                  Lihat paket Pro <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Button>
              </>
            )}
          </div>
        )}

        {/* Level picker — hairline grid */}
        <div>
          <p className="mb-3 text-xs font-bold tracking-[0.16em] text-ink-subtle uppercase">Pilih level</p>
          <div className="grid grid-cols-2 gap-px border border-brand-ink/12 bg-brand-ink/12 sm:grid-cols-4">
            {(['A1', 'A2', 'B1', 'B2'] as const).map(l => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                aria-pressed={level === l}
                className={cn(
                  'w-full py-5 font-serif text-2xl font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-rust focus-visible:ring-inset',
                  level === l
                    ? 'bg-brand-ink text-brand-cream'
                    : 'bg-white text-ink-muted hover:bg-brand-cream hover:text-brand-ink'
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Failure from the last start attempt */}
        <div aria-live="polite">
          {startFailure && (
            <div className="border border-brand-rust/25 border-l-4 border-l-brand-rust bg-brand-rust/5 p-5">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-rust" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <h2 className="mb-1 font-serif text-lg font-bold text-brand-ink">
                    {startFailure.paywall ? 'Jatah gratismu sudah habis' : 'Simulasi belum bisa dimulai'}
                  </h2>
                  <p className="text-sm leading-relaxed text-ink-muted">{startFailure.message}</p>
                  {formatMoment(startFailure.resetAt) && (
                    <p className="mt-1 text-sm text-ink-subtle">Jatah berikutnya terbuka {formatMoment(startFailure.resetAt)}.</p>
                  )}
                  {startFailure.paywall && (
                    <Button
                      render={<Link to="/pricing" />}
                      className="mt-4 h-11 bg-brand-rust px-6 font-bold text-brand-cream hover:bg-brand-ink"
                    >
                      Lihat paket Pro <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            onClick={startTest}
            size="lg"
            disabled={!isPro && attemptsLeft <= 0}
            className="h-14 w-full bg-brand-ink px-8 text-base font-bold tracking-wide text-brand-cream transition-colors hover:bg-brand-rust sm:w-auto"
          >
            <PlayCircle className="mr-2 h-5 w-5" aria-hidden="true" /> Mulai simulasi {level}
          </Button>
          <p className="text-sm text-ink-subtle">
            Sekali dimulai, hitung mundur {TEST_MINUTES} menit tidak bisa dijeda.
          </p>
        </div>
      </div>
    );
  }

  // ========================================================= LOADING screen ==
  if (testState === 'LOADING') {
    return (
      <div className="mx-auto max-w-2xl px-6 py-20 text-center">
        <Loader2 className="mx-auto mb-6 h-12 w-12 animate-spin text-brand-rust" aria-hidden="true" />
        <h2 className="mb-3 font-serif text-2xl font-bold text-brand-ink">Menyiapkan soal level {level}</h2>
        <p className="text-ink-muted">Biasanya butuh beberapa detik. Jangan tutup halaman ini, ya.</p>
      </div>
    );
  }

  // =========================================================== ERROR screen ==
  if (testState === 'ERROR') {
    return (
      <div className="mx-auto max-w-2xl">
        <ErrorState
          title="Jawabanmu belum sempat dinilai"
          description={submitError || 'Penilaian tidak sampai ke server. Jawabanmu masih tersimpan di halaman ini.'}
          onRetry={submitTest}
        />
        <div className="flex flex-col justify-center gap-3 px-6 pb-12 sm:flex-row">
          {/* Only offered while the clock still has time on it — otherwise the
              countdown would resubmit the moment the questions reappear. */}
          {timeLeft > 0 && (
            <Button
              onClick={() => { submittingRef.current = false; setTestState('ONGOING'); }}
              className="h-11 bg-brand-ink px-6 font-bold text-brand-cream hover:bg-brand-rust"
            >
              Kembali ke soal
            </Button>
          )}
          <Button variant="ghost" onClick={backToSetup} className="h-11 px-4 text-ink-muted hover:text-brand-ink">
            Keluar ke menu awal
          </Button>
        </div>
      </div>
    );
  }

  // ========================================================= ONGOING screen ==
  if (testState === 'ONGOING') {
    const q = questions[currentIdx];
    if (!q) {
      // Defensive: an empty question list would otherwise blank the screen mid-attempt.
      return (
        <div className="mx-auto max-w-2xl">
          <ErrorState
            title="Soal tidak bisa ditampilkan"
            description="Daftar soal untuk sesi ini kosong. Mulai simulasi baru, ya."
            onRetry={backToSetup}
          />
        </div>
      );
    }
    const critical = timeLeft <= CRITICAL_SECONDS;
    const warning = !critical && timeLeft <= WARN_SECONDS;
    const unanswered = questions.length - answeredCount;

    return (
      <div className="mx-auto max-w-3xl pb-20">
        {/* Status bar */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-brand-ink/12 bg-white p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="border border-brand-ink/12 bg-brand-cream px-3 py-1 text-sm font-bold text-brand-ink">
              {q.category}
            </span>
            <span className="text-sm text-ink-muted">Soal {currentIdx + 1} dari {questions.length}</span>
          </div>

          <div
            className={cn(
              'flex items-center gap-2 border px-4 py-2 transition-colors',
              critical
                ? 'border-brand-rust bg-brand-rust text-brand-cream'
                : warning
                  ? 'border-brand-rust/40 bg-brand-tan/20 text-brand-rust'
                  : 'border-brand-ink/15 bg-brand-cream text-brand-ink'
            )}
          >
            <Timer className={cn('h-5 w-5', critical && 'animate-pulse')} aria-hidden="true" />
            <span className="font-mono text-lg font-bold tabular-nums" aria-hidden="true">{formatTime(timeLeft)}</span>
            <span className="sr-only">Sisa waktu {Math.floor(timeLeft / 60)} menit {timeLeft % 60} detik</span>
          </div>
        </div>

        {/* Time warnings — announced, not just coloured */}
        <div aria-live="assertive">
          {critical && (
            <p className="mb-4 border border-brand-rust/25 border-l-4 border-l-brand-rust bg-brand-rust/5 px-4 py-3 text-sm font-bold text-brand-rust">
              Kurang dari satu menit. Jawaban akan dikumpulkan otomatis saat waktu habis.
            </p>
          )}
          {warning && (
            <p className="mb-4 border border-brand-rust/20 border-l-4 border-l-brand-rust/60 bg-brand-tan/15 px-4 py-3 text-sm text-brand-ink">
              Sisa waktu di bawah lima menit. Pastikan soal yang belum terjawab sudah kamu isi.
            </p>
          )}
        </div>

        {/* Progress + navigator */}
        <div className="mb-4 border border-brand-ink/12 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <span className="text-sm text-ink-muted">
              <strong className="font-bold text-brand-ink">{answeredCount}</strong> dari {questions.length} terjawab
            </span>
            <button
              type="button"
              onClick={() => (unanswered > 0 ? setConfirmSubmit(true) : submitTest())}
              className="text-sm font-bold text-brand-rust underline underline-offset-4 hover:text-brand-ink"
            >
              Kumpulkan sekarang
            </button>
          </div>
          <div className="flex flex-wrap gap-px bg-brand-ink/12 p-px">
            {questions.map((item, i) => {
              const done = !!answers[item.id];
              const active = i === currentIdx;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCurrentIdx(i)}
                  aria-label={`Soal ${i + 1}${done ? ', sudah dijawab' : ', belum dijawab'}`}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'h-8 w-8 text-xs font-bold tabular-nums transition-colors',
                    active
                      ? 'bg-brand-rust text-brand-cream'
                      : done
                        ? 'bg-brand-ink text-brand-cream'
                        : 'bg-white text-ink-muted hover:bg-brand-cream'
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question */}
        <div className="flex min-h-[400px] flex-col border border-brand-ink/12 bg-white p-6 md:p-8">
          {q.context && (
            <div className="mb-6 border-l-2 border-brand-ink/20 bg-brand-cream px-4 py-3 text-brand-ink italic">
              {q.context}
            </div>
          )}
          <h2 className="mb-8 font-serif text-2xl font-bold text-brand-ink">{q.question}</h2>

          <div className="flex-1 space-y-px bg-brand-ink/10" role="radiogroup" aria-label="Pilihan jawaban">
            {(q.options || []).map((opt, i) => {
              const isSelected = answers[q.id] === opt;
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt }))}
                  className={cn(
                    'flex w-full items-center gap-3 p-4 text-left font-medium transition-colors',
                    isSelected
                      ? 'bg-brand-ink text-brand-cream'
                      : 'bg-white text-brand-ink hover:bg-brand-cream'
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 shrink-0 items-center justify-center border text-xs font-bold',
                      isSelected ? 'border-brand-cream/40 text-brand-cream' : 'border-brand-ink/25 text-ink-muted'
                    )}
                    aria-hidden="true"
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex justify-between gap-3 border-t border-brand-ink/12 pt-6">
            <Button
              variant="outline"
              disabled={currentIdx === 0}
              onClick={() => setCurrentIdx(prev => prev - 1)}
              className="h-11 px-5"
            >
              Sebelumnya
            </Button>
            {currentIdx === questions.length - 1 ? (
              <Button
                onClick={() => (unanswered > 0 ? setConfirmSubmit(true) : submitTest())}
                className="h-11 bg-brand-ink px-6 font-bold text-brand-cream hover:bg-brand-rust"
              >
                Kumpulkan
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIdx(prev => prev + 1)}
                className="h-11 bg-brand-ink px-6 font-bold text-brand-cream hover:bg-brand-rust"
              >
                Selanjutnya
              </Button>
            )}
          </div>
        </div>

        <LeaveGuard
          open={!!pendingHref}
          onStay={() => setPendingHref(null)}
          onLeave={leaveExam}
          isPro={isPro}
        />
        <SubmitGuard
          open={confirmSubmit}
          unanswered={unanswered}
          onCancel={() => setConfirmSubmit(false)}
          onConfirm={submitTest}
        />
      </div>
    );
  }

  // =============================================== EVALUATING & RESULT screen =
  const totalForRatio = scoreInfo.total || 1;
  const ratio = scoreInfo.score / totalForRatio;
  const percentage = Math.round(ratio * 100);
  const passed = ratio >= 0.6;

  return (
    <div className="mx-auto max-w-4xl pb-20">
      <div className="mb-8 border border-brand-ink/12 bg-white p-8 text-center md:p-12">
        {testState === 'EVALUATING' ? (
          <>
            <Loader2 className="mx-auto mb-6 h-12 w-12 animate-spin text-brand-rust" aria-hidden="true" />
            <h2 className="mb-2 font-serif text-2xl font-bold text-brand-ink">Menilai jawabanmu</h2>
            <p className="text-ink-muted">Sebentar lagi selesai. Jangan tutup halaman ini, ya.</p>
          </>
        ) : (
          <>
            <div className="mb-4 flex justify-center" aria-hidden="true">
              <ScoreMark score={scoreInfo.score} total={scoreInfo.total} />
            </div>

            <div className="relative mx-auto mb-6 h-28 w-28">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-brand-ink/10" />
                <circle
                  cx="50" cy="50" r="42" fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeDasharray={`${ratio * 264} 264`}
                  className={cn('transition-all duration-1000', passed ? 'text-brand-green' : 'text-brand-rust')}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-serif text-2xl font-bold text-brand-ink tabular-nums">{percentage}%</span>
              </div>
            </div>

            <h2 className="mb-2 font-serif text-3xl font-bold text-brand-ink md:text-4xl">
              {scoreInfo.score} dari {scoreInfo.total} benar
            </h2>
            <p className="mb-2 text-lg text-ink-muted">
              Level {level} · {passed ? 'di atas ambang kelulusan Goethe (60%)' : 'ambang kelulusan Goethe ada di 60%'}
            </p>
            <p className="mb-8 text-sm text-ink-subtle">Kamu mendapat {scoreInfo.score * 10} XP dari simulasi ini.</p>

            <Button
              onClick={backToSetup}
              className="h-12 bg-brand-ink px-6 font-bold text-brand-cream hover:bg-brand-rust"
            >
              Kembali ke menu awal
            </Button>
          </>
        )}
      </div>

      {testState === 'RESULT' && (
        <div className="space-y-6">
          <h3 className="px-1 font-serif text-2xl font-bold text-brand-ink">Review jawaban</h3>

          {feedbackNotice && (
            <p className="border border-brand-ink/12 border-l-4 border-l-brand-ink/40 bg-brand-cream px-4 py-3 text-sm text-ink-muted">
              {feedbackNotice}
            </p>
          )}

          {questions.map((q, i) => {
            const result = scored[q.id];
            const uAns = result?.userAnswer || answers[q.id];
            const isAccurate = !!result?.isCorrect;
            return (
              <div
                key={q.id}
                className={cn(
                  'border border-l-4 p-6',
                  isAccurate
                    ? 'border-brand-green/25 border-l-brand-green bg-brand-green/10'
                    : 'border-brand-rust/25 border-l-brand-rust bg-brand-rust/5'
                )}
              >
                <div className="mb-3 flex gap-3">
                  {isAccurate
                    ? <CheckCircle2 className="h-6 w-6 shrink-0 text-brand-green" aria-hidden="true" />
                    : <XCircle className="h-6 w-6 shrink-0 text-brand-rust" aria-hidden="true" />}
                  <h4 className="text-lg font-bold text-brand-ink">{i + 1}. {q.question}</h4>
                </div>
                <div className="space-y-2 pl-9">
                  <p className="text-xs font-bold tracking-[0.14em] text-ink-subtle uppercase">{q.category}</p>
                  <p className="text-brand-ink">
                    <span className="text-ink-muted">Jawabanmu: </span>
                    <span className={cn('font-medium', !isAccurate && 'line-through')}>{uAns || '(kosong)'}</span>
                  </p>
                  {!isAccurate && result?.correctAnswer && (
                    <p className="font-bold text-brand-ink">
                      <span className="font-normal text-ink-muted">Jawaban benar: </span>
                      {result.correctAnswer}
                    </p>
                  )}
                  {!isAccurate && feedbacks[q.id] && (
                    <div className="mt-4 flex items-start gap-3 border border-brand-ink/10 bg-white p-4">
                      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-rust" aria-hidden="true" />
                      <div className="text-sm leading-relaxed text-ink-muted [&_code]:bg-brand-ink/5 [&_code]:px-1 [&_code]:font-mono [&_code]:text-brand-ink [&_p:last-child]:mb-0 [&_p]:mb-2 [&_strong]:font-bold [&_strong]:text-brand-ink">
                        <ReactMarkdown>{feedbacks[q.id]}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scoring is still in flight while EVALUATING, so the same guard applies here. */}
      <LeaveGuard
        open={!!pendingHref}
        onStay={() => setPendingHref(null)}
        onLeave={leaveExam}
        isPro={isPro}
      />
    </div>
  );
}

/** Celebration mark for the result screen — score band, not a bare percentage. */
function ScoreMark({ score, total }: { score: number; total: number }) {
  const ratio = total > 0 ? score / total : 0;
  if (ratio > 0.8) return <Trophy className="h-12 w-12 text-brand-rust" aria-hidden="true" />;
  if (ratio >= 0.5) return <CheckCircle2 className="h-12 w-12 text-brand-tan" aria-hidden="true" />;
  return <Target className="h-12 w-12 text-brand-ink" aria-hidden="true" />;
}

function LeaveGuard({
  open, onStay, onLeave, isPro,
}: { open: boolean; onStay: () => void; onLeave: () => void; isPro: boolean }) {
  return (
    <Dialog open={open} onOpenChange={(next: boolean) => { if (!next) onStay(); }}>
      {/* `.glass-heavy` on DialogContent sits outside every cascade layer, so the
          plain utilities below need `!` to win — same trick as AdminUI. */}
      <DialogContent showCloseButton={false} className="z-[100001] bg-white! rounded-none! border-brand-ink/15! sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-brand-ink">Tinggalkan ujian yang sedang berjalan?</DialogTitle>
          <DialogDescription className="text-ink-muted">
            {isPro
              ? 'Jawaban yang sudah kamu isi akan hilang dan hitung mundurnya berhenti di sini.'
              : 'Jawaban yang sudah kamu isi akan hilang. Jatah simulasi mingguanmu sudah terpakai untuk ujian ini, jadi tidak bisa diulang minggu ini.'}
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-ink-muted">
          Kalau tinggal beberapa soal lagi, lebih baik kumpulkan dulu supaya skormu tetap tercatat.
        </p>
        <DialogFooter>
          <Button variant="ghost" onClick={onLeave} className="h-11 px-4 text-brand-rust hover:text-brand-ink">
            Keluar &amp; buang jawaban
          </Button>
          <Button onClick={onStay} className="h-11 bg-brand-ink px-6 font-bold text-brand-cream hover:bg-brand-rust">
            Lanjut mengerjakan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubmitGuard({
  open, unanswered, onCancel, onConfirm,
}: { open: boolean; unanswered: number; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={open} onOpenChange={(next: boolean) => { if (!next) onCancel(); }}>
      <DialogContent showCloseButton={false} className="z-[100001] bg-white! rounded-none! border-brand-ink/15! sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-brand-ink">Kumpulkan sekarang?</DialogTitle>
          <DialogDescription className="text-ink-muted">
            Masih ada {unanswered} soal yang belum kamu jawab. Soal kosong dihitung salah.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel} className="h-11 px-4 text-ink-muted hover:text-brand-ink">
            Periksa lagi
          </Button>
          <Button onClick={onConfirm} className="h-11 bg-brand-ink px-6 font-bold text-brand-cream hover:bg-brand-rust">
            Ya, kumpulkan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
