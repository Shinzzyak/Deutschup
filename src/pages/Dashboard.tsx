import { Link } from 'react-router';
import { useState, useEffect, useMemo } from 'react';
import type { Level } from '../data/course';
import { courseIndex } from '../data/lessonIndex';
import { useProgressStore } from '../stores/progressStore';
import { useLearningStore } from '../stores/learningStore';
import { useAuthStore } from '../stores/authStore';
import { isUserPro } from '../lib/subscription';
import { generateReportPDF } from '../lib/pdf-report';
import { supabase, dbProxy } from '../lib/supabase';
import {
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Download,
  Flame,
  GraduationCap,
  Loader2,
  Lock,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Star,
  Target,
  Trophy,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import FeatureGate from '../components/FeatureGate';
import { DashboardSkeleton } from '../components/skeletons/SkeletonPatterns';
import type { CefrLevel } from '../lib/vocabStats';
import {
  getCourseUnitContextCopy,
  getCourseUnitRoute,
  inferCourseUnitLevel,
  isCheckpointUnit,
  isCourseUnitRouteAvailable,
} from '../lib/courseUnitRoutes';

// ────────────────────────────────────────────────────────────────
// Static course metadata
// ────────────────────────────────────────────────────────────────

const LEVEL_META: { id: Level; name: string; blurb: string }[] = [
  { id: 'A1', name: 'Pemula', blurb: 'Salam, artikel, angka, dan kalimat sederhana.' },
  { id: 'A2', name: 'Dasar', blurb: 'Kasus, kata kerja modal, dan cerita masa lampau.' },
  { id: 'B1', name: 'Menengah', blurb: 'Kalimat relatif, kalimat pasif, dan Konjunktiv II.' },
  { id: 'B2', name: 'Mahir', blurb: 'Partizip, idiom, dan persiapan ujian Goethe.' },
];

const LEVEL_ORDER: Record<Level, number> = { A1: 0, A2: 1, B1: 2, B2: 3 };

const TOTAL_UNITS = courseIndex.length;
const TOTAL_CHECKPOINTS = courseIndex.filter((unit) => isCheckpointUnit(unit) && isCourseUnitRouteAvailable(unit)).length;

const nf = new Intl.NumberFormat('id-ID');

/** Every lucide icon shares this type; derived from a value so it can't drift. */
type IconComponent = typeof Zap;

function greetingFor(hour: number): string {
  if (hour < 11) return 'Selamat pagi';
  if (hour < 15) return 'Selamat siang';
  if (hour < 19) return 'Selamat sore';
  return 'Selamat malam';
}

/** Study seconds -> the shortest phrase a person would actually say. */
function formatStudyTime(seconds: number): string {
  if (seconds <= 0) return 'Belum tercatat';
  if (seconds < 60) return 'Kurang dari 1 menit';
  if (seconds < 3600) return `${Math.round(seconds / 60)} menit`;
  const hours = seconds / 3600;
  return `${nf.format(Math.round(hours * 10) / 10)} jam`;
}

// ────────────────────────────────────────────────────────────────
// Small presentational pieces
// ────────────────────────────────────────────────────────────────

/**
 * Hairline progress meter. Rendered as a real progressbar so screen readers
 * announce the number instead of reading nothing.
 */
function Meter({
  value,
  label,
  trackClass = 'bg-brand-ink/10',
  fillClass = 'bg-brand-rust',
}: {
  value: number;
  label: string;
  trackClass?: string;
  fillClass?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn('h-1.5 w-full', trackClass)}
    >
      <div className={cn('h-full transition-[width] duration-500', fillClass)} style={{ width: `${pct}%` }} />
    </div>
  );
}

/** One cell of the headline number strip. `value` is already formatted. */
function StatCell({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: IconComponent;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="bg-brand-cream p-4 md:p-5">
      <div className="flex items-center gap-2 text-ink-muted">
        <Icon className="h-4 w-4" aria-hidden="true" />
        <span className="text-[11px] font-bold tracking-[0.14em] uppercase">{label}</span>
      </div>
      <p className="mt-2 font-serif text-3xl leading-none text-brand-ink md:text-4xl">{value}</p>
      {hint && <p className="mt-2 text-xs text-ink-muted">{hint}</p>}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const {
    currentLevel,
    unlockedLessons,
    completedLessons,
    xp,
    vocab,
    checkpointProgress,
    loading,
    initialized,
    error,
    streak,
    lastPracticeDate,
    loadProgress,
    refreshProgress,
    clearError,
  } = useProgressStore();
  const { mockTests } = useLearningStore();
  const { user, tierData, profileData } = useAuthStore();
  const role = tierData?.role || profileData?.role;
  const isPro = isUserPro(tierData, role);

  const [exporting, setExporting] = useState(false);
  const [reportError, setReportError] = useState('');
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [levelWords, setLevelWords] = useState<{ status: 'loading' | 'ready' | 'error'; count: number }>({
    status: 'loading',
    count: 0,
  });
  const [studyTime, setStudyTime] = useState<{ status: 'loading' | 'ready' | 'error'; seconds: number }>({
    status: 'loading',
    seconds: 0,
  });

  useEffect(() => {
    if (user?.id && !loading) {
      loadProgress(user.id);
    }
  }, [user?.id]);

  // Vocabulary count for the active level only. The previous version fired one
  // request per CEFR level on every mount just to draw a four-cell table.
  useEffect(() => {
    let cancelled = false;
    setLevelWords({ status: 'loading', count: 0 });
    (async () => {
      const { count, error: countError } = await supabase
        .from('curriculum_vocabulary')
        .select('id', { count: 'exact', head: true })
        .eq('level_id', currentLevel as CefrLevel);
      if (cancelled) return;
      if (countError) {
        console.error('[DASHBOARD] curriculum vocabulary count failed:', countError);
        setLevelWords({ status: 'error', count: 0 });
        return;
      }
      setLevelWords({ status: 'ready', count: count || 0 });
    })();
    return () => {
      cancelled = true;
    };
  }, [currentLevel]);

  // Study time goes through the db proxy: the browser only holds the anon key,
  // so a direct RPC / table read is rejected by RLS and would silently render 0.
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    setStudyTime({ status: 'loading', seconds: 0 });
    (async () => {
      const { data, error: proxyError } = await dbProxy('get-study-time');
      if (cancelled) return;
      if (proxyError) {
        console.error('[DASHBOARD] study time request failed:', proxyError);
        setStudyTime({ status: 'error', seconds: 0 });
        return;
      }
      // get_study_time is a set-returning RPC; tolerate row / object / scalar.
      const row = Array.isArray(data) ? data[0] : data;
      const seconds = Number(typeof row === 'number' ? row : (row?.total_seconds ?? row?.totalSeconds ?? 0));
      setStudyTime({ status: 'ready', seconds: Number.isFinite(seconds) ? seconds : 0 });
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Blob URLs survive navigation unless we hand them back.
  useEffect(() => {
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [pdfBlobUrl]);

  const currentLesson = useMemo(() => {
    const lastUnlocked = [...unlockedLessons]
      .reverse()
      .find((id) => !completedLessons.includes(id) && isCourseUnitRouteAvailable({ id }));
    return lastUnlocked ? courseIndex.find((l) => l.id === lastUnlocked) : null;
  }, [unlockedLessons, completedLessons]);

  const currentLessonRoute = useMemo(
    () => (currentLesson ? getCourseUnitRoute(currentLesson) : null),
    [currentLesson],
  );

  const currentLessonContext = useMemo(() => {
    if (!currentLesson) return '';
    const position = courseIndex.findIndex((l) => l.id === currentLesson.id) + 1;
    return getCourseUnitContextCopy(currentLesson, position, courseIndex.length);
  }, [currentLesson]);

  const checkpointStats = useMemo(() => {
    const passed = checkpointProgress.filter((c) => c.passed).length;
    return { passed, total: TOTAL_CHECKPOINTS };
  }, [checkpointProgress]);

  const overallProgress = useMemo(() => {
    if (TOTAL_UNITS === 0) return 0;
    return Math.round((completedLessons.length / TOTAL_UNITS) * 100);
  }, [completedLessons]);

  const bestStreak = useMemo(() => {
    // Best streak lives on the device; the server only tracks the current one.
    const bestKey = 'deutschup_best_streak';
    let stored = 0;
    try {
      stored = parseInt(localStorage.getItem(bestKey) || '0', 10) || 0;
      if (streak > stored) localStorage.setItem(bestKey, String(streak));
    } catch {
      // Private mode / storage disabled — fall back to the live streak.
    }
    return Math.max(stored, streak);
  }, [streak, lastPracticeDate]);

  const averageScore = useMemo(() => {
    if (mockTests.length === 0) return null;
    return Math.round(mockTests.reduce((acc, t) => acc + (t.score / t.total) * 100, 0) / mockTests.length);
  }, [mockTests]);

  const levelRows = useMemo(() => {
    return LEVEL_META.map((meta) => {
      const units = courseIndex.filter((unit) => inferCourseUnitLevel(unit) === meta.id);
      // LevelView lists lessons only, so the counts here have to match it.
      const lessons = units.filter((unit) => !isCheckpointUnit(unit));
      const checkpoints = units.filter((unit) => isCheckpointUnit(unit) && isCourseUnitRouteAvailable(unit));
      const doneLessons = lessons.filter((unit) => completedLessons.includes(unit.id)).length;
      const passedCheckpoints = checkpoints.filter((unit) =>
        checkpointProgress.some((c) => c.checkpointId === unit.id && c.passed),
      ).length;
      const needsPro = !isPro && meta.id !== 'A1';
      const reached = LEVEL_ORDER[meta.id] <= LEVEL_ORDER[currentLevel];
      // Name the gate the learner actually has to pass first. Buying Pro does
      // not open a level they have not reached yet, so progress wins.
      const lockReason: 'progress' | 'pro' | null = !reached ? 'progress' : needsPro ? 'pro' : null;
      return {
        ...meta,
        lessonCount: lessons.length,
        checkpointCount: checkpoints.length,
        doneLessons,
        passedCheckpoints,
        percent: lessons.length > 0 ? (doneLessons / lessons.length) * 100 : 0,
        lockReason,
        locked: lockReason !== null,
      };
    });
  }, [completedLessons, checkpointProgress, currentLevel, isPro]);

  // Only the first Pro-gated level gets an upgrade link; three of them in a
  // row turns a progress map into a sales page.
  const firstProLockedLevel = levelRows.find((row) => row.lockReason === 'pro')?.id ?? null;

  const achievements = useMemo(
    () => [
      {
        id: 'first-lesson',
        title: 'Pelajaran Pertama',
        description: 'Selesaikan satu pelajaran',
        icon: Star,
        unlocked: completedLessons.length > 0,
      },
      {
        id: 'vocabulary-50',
        title: 'Kolektor Kata',
        description: 'Latih 50 kosakata',
        icon: BookOpen,
        unlocked: Object.keys(vocab).length >= 50,
      },
      {
        id: 'streak-7',
        title: 'Konsisten',
        description: 'Belajar 7 hari berturut-turut',
        icon: Flame,
        unlocked: bestStreak >= 7,
      },
      {
        id: 'checkpoint-master',
        title: 'Penakluk Checkpoint',
        description: 'Lulus 5 checkpoint',
        icon: Trophy,
        unlocked: checkpointStats.passed >= 5,
      },
      {
        id: 'level-a2',
        title: 'Naik ke A2',
        description: 'Capai level A2',
        icon: GraduationCap,
        unlocked: currentLevel !== 'A1',
      },
    ],
    [completedLessons, vocab, bestStreak, checkpointStats.passed, currentLevel],
  );

  // SHOW SKELETON AFTER ALL HOOKS (Rules of Hooks compliance).
  // `!initialized && !error` covers the gap between mount and the first
  // response — without it the store defaults (0 XP, 0 selesai) flash on screen
  // and read as "your progress is gone".
  if (loading || (!initialized && !error)) {
    return <DashboardSkeleton />;
  }

  // The store starts at zero. Rendering those zeros after a failed load tells
  // the learner their progress is gone, so every server-derived number is
  // withheld until we know we actually have data.
  const loadFailed = Boolean(error) && !initialized;
  const isNewLearner = initialized && completedLessons.length === 0;
  const vocabTrained = Object.keys(vocab).length;
  const firstName =
    (profileData?.full_name || user?.user_metadata?.full_name || '').trim().split(' ')[0] || 'Pelajar';
  const greeting = greetingFor(new Date().getHours());

  const handleRetry = async () => {
    setRetrying(true);
    await refreshProgress();
    setRetrying(false);
  };

  const exportPDF = async () => {
    setReportError('');
    // The cleanup effect revokes whatever URL we drop here.
    setPdfBlobUrl(null);

    if (!isPro) {
      setReportError('Laporan PDF tersedia untuk pengguna Pro.');
      return;
    }

    setExporting(true);

    try {
      const blob = await generateReportPDF({
        userName: profileData?.full_name || user?.user_metadata?.full_name || 'Siswa',
        currentLevel: currentLevel,
        xp: xp,
        vocabCount: vocabTrained,
        completedCount: completedLessons.length,
        totalLessons: TOTAL_UNITS,
        overallProgress: overallProgress,
        streak: streak,
        studyHours: studyTime.status === 'ready' ? Math.round((studyTime.seconds / 3600) * 10) / 10 : 0,
        averageScore: averageScore ?? 0,
        lessons: courseIndex.map((l) => ({
          level: inferCourseUnitLevel(l),
          title: l.title || l.id,
          goals: l.canDoGoals || [],
          completed: completedLessons.includes(l.id),
        })),
        mockTests: (mockTests || []).map((t) => ({
          createdAt: t.createdAt,
          level: t.level,
          score: t.score,
          total: t.total,
        })),
      });

      const pdfUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(pdfUrl);
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `DeutschUp-Laporan-${profileData?.full_name || 'Siswa'}.pdf`;
      a.click();
    } catch (e) {
      console.error('[DASHBOARD] report generation failed:', e);
      setReportError('Laporan belum bisa dibuat sekarang. Coba lagi sebentar lagi.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      {/* A save failed while the page already had real data — warn, don't wipe. */}
      {!loadFailed && error && (
        <div className="flex flex-wrap items-center gap-3 border border-brand-rust/25 bg-brand-rust/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-brand-rust" aria-hidden="true" />
          <p className="min-w-0 flex-1 text-sm font-medium text-brand-ink">{error}</p>
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-rust underline underline-offset-4 disabled:opacity-60"
          >
            {retrying ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Coba lagi
          </button>
          <button
            onClick={clearError}
            className="text-ink-muted transition-colors hover:text-brand-ink"
            aria-label="Tutup pemberitahuan"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── 1. THE ONE THING TO DO NEXT ─────────────────────────── */}
      <section className="bg-brand-ink" aria-labelledby="lanjutkan-heading">
        <div className="flex h-1.5 w-full" aria-hidden="true">
          <div className="flex-1 bg-brand-cream" />
          <div className="flex-1 bg-brand-rust" />
          <div className="flex-1 bg-brand-tan" />
        </div>

        <div className="p-6 md:p-10">
          <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-xs font-bold tracking-[0.18em] text-cream-subtle uppercase">
              {greeting}, {firstName}
            </span>
            <span className="hidden h-px w-8 bg-brand-cream/30 sm:block" aria-hidden="true" />
            <span className="inline-flex items-center gap-1.5 border border-brand-cream/25 px-2.5 py-1 text-xs font-bold text-brand-cream">
              <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
              Level {currentLevel}
            </span>
            {isPro && (
              <span className="inline-flex items-center gap-1.5 bg-brand-tan px-2.5 py-1 text-xs font-bold text-brand-ink">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Pro
              </span>
            )}
          </div>

          {loadFailed ? (
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold tracking-[0.18em] text-cream-subtle uppercase">Progres belum termuat</p>
              <h1 id="lanjutkan-heading" className="font-serif text-3xl leading-[1.08] text-brand-cream md:text-5xl">
                Kami belum bisa membuka catatan belajarmu
              </h1>
              <p className="mt-4 text-base text-cream-muted">
                Catatanmu aman di server, hanya sambungannya yang bermasalah. Angka progres di halaman ini
                sengaja dikosongkan biar tidak menyesatkan.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button
                  onClick={handleRetry}
                  disabled={retrying}
                  className="h-auto bg-brand-tan px-8 py-4 text-base font-bold text-brand-ink hover:bg-brand-cream"
                >
                  {retrying ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-5 w-5" />
                  )}
                  Muat ulang
                </Button>
                <Link
                  to="/curriculum"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-tan underline-offset-4 hover:text-brand-cream hover:underline"
                >
                  Buka daftar materi
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : currentLesson && currentLessonRoute ? (
            <div className="max-w-3xl">
              <p className="mb-3 text-xs font-bold tracking-[0.18em] text-cream-subtle uppercase">
                {isNewLearner ? 'Mulai dari sini' : 'Lanjutkan belajar'}
              </p>
              <h1 id="lanjutkan-heading" className="font-serif text-3xl leading-[1.08] text-brand-cream md:text-5xl">
                {currentLesson.title || currentLesson.id}
              </h1>
              <p className="mt-4 text-sm text-cream-muted">{currentLessonContext}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button
                  render={<Link to={currentLessonRoute} />}
                  className="h-auto bg-brand-tan px-8 py-4 text-base font-bold text-brand-ink hover:bg-brand-cream"
                >
                  <PlayCircle className="mr-2 h-5 w-5" aria-hidden="true" />
                  {isNewLearner ? 'Mulai pelajaran pertama' : 'Lanjutkan'}
                </Button>
                <Link
                  to="/curriculum"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-tan underline-offset-4 hover:text-brand-cream hover:underline"
                >
                  Lihat semua materi
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              {!isNewLearner && (
                <div className="mt-8 max-w-md">
                  <div className="mb-2 flex items-baseline justify-between gap-3">
                    <span className="text-xs font-bold tracking-[0.14em] text-cream-subtle uppercase">
                      Progres keseluruhan
                    </span>
                    <span className="text-xs font-bold text-cream-muted tabular-nums">
                      {completedLessons.length} dari {TOTAL_UNITS} materi
                    </span>
                  </div>
                  <Meter
                    value={overallProgress}
                    label={`Progres keseluruhan ${overallProgress} persen`}
                    trackClass="bg-brand-cream/20"
                    fillClass="bg-brand-tan"
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-2xl">
              <p className="mb-3 text-xs font-bold tracking-[0.18em] text-cream-subtle uppercase">Kerja bagus</p>
              <h1 id="lanjutkan-heading" className="font-serif text-3xl leading-[1.08] text-brand-cream md:text-5xl">
                Semua materi yang terbuka sudah kamu selesaikan
              </h1>
              <p className="mt-4 text-base text-cream-muted">
                Uji hasilnya lewat simulasi ujian, atau ulangi pelajaran yang ingin kamu perdalam.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <Button
                  render={<Link to="/simulasi" />}
                  className="h-auto bg-brand-tan px-8 py-4 text-base font-bold text-brand-ink hover:bg-brand-cream"
                >
                  <Target className="mr-2 h-5 w-5" aria-hidden="true" />
                  Coba simulasi ujian
                </Button>
                <Link
                  to="/curriculum"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-tan underline-offset-4 hover:text-brand-cream hover:underline"
                >
                  Lihat semua materi
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. HEADLINE NUMBERS ─────────────────────────────────── */}
      <section aria-label="Ringkasan angka">
        <div className="grid grid-cols-2 gap-px bg-brand-ink/10 md:grid-cols-4">
          <StatCell
            icon={Flame}
            label="Streak"
            value={loadFailed ? '—' : `${streak}`}
            hint={loadFailed ? 'Belum bisa dimuat' : `Rekor ${bestStreak} hari`}
          />
          <StatCell
            icon={Zap}
            label="XP"
            value={loadFailed ? '—' : nf.format(xp)}
            hint={loadFailed ? 'Belum bisa dimuat' : 'Total sejak awal'}
          />
          <StatCell
            icon={CheckCircle2}
            label="Materi selesai"
            value={loadFailed ? '—' : `${completedLessons.length}`}
            hint={loadFailed ? 'Belum bisa dimuat' : `dari ${TOTAL_UNITS} materi`}
          />
          <StatCell
            icon={BookOpen}
            label="Kosakata"
            value={nf.format(vocabTrained)}
            hint={vocabTrained === 0 ? 'Belum ada yang dilatih' : 'Tersimpan di perangkat ini'}
          />
        </div>
      </section>

      {/* ── 3. LEVEL OVERVIEW (replaces the 86-card catalogue) ──── */}
      <section aria-labelledby="perjalanan-heading">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-brand-ink/10 pb-3">
          <div>
            <h2 id="perjalanan-heading" className="font-serif text-2xl text-brand-ink md:text-3xl">
              Level belajarmu
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Empat level, {TOTAL_UNITS} materi, {TOTAL_CHECKPOINTS} checkpoint.
            </p>
          </div>
          <Link
            to="/curriculum"
            className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-rust underline-offset-4 hover:underline"
          >
            Kurikulum lengkap
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-px bg-brand-ink/10">
          {levelRows.map((row) => {
            const body = (
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center font-serif text-xl',
                    row.locked ? 'bg-brand-ink/10 text-ink-muted' : 'bg-brand-ink text-brand-cream',
                  )}
                >
                  {row.id}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-serif text-lg text-brand-ink md:text-xl">
                      {row.name} {row.id}
                    </h3>
                    {row.locked ? (
                      <Lock className="mt-1 h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                    ) : (
                      <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
                    )}
                  </div>

                  <p className="mt-1 text-sm text-ink-muted">{row.blurb}</p>

                  {row.locked ? (
                    <p className="mt-3 text-sm font-semibold text-brand-rust">
                      {row.lockReason === 'pro'
                        ? 'Terbuka dengan langganan Pro'
                        : `Selesaikan level sebelumnya untuk membuka ${row.id}`}
                    </p>
                  ) : (
                    <>
                      <div className="mt-3 flex items-center gap-3">
                        <Meter
                          value={row.percent}
                          label={`Progres level ${row.id}: ${row.doneLessons} dari ${row.lessonCount} pelajaran`}
                        />
                        <span className="shrink-0 text-xs font-bold text-ink-muted tabular-nums">
                          {loadFailed ? '—' : `${row.doneLessons}/${row.lessonCount}`}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-ink-muted">
                        {row.lessonCount} pelajaran
                        {row.checkpointCount > 0 &&
                          ` • ${loadFailed ? '—' : row.passedCheckpoints}/${row.checkpointCount} checkpoint lulus`}
                      </p>
                    </>
                  )}
                </div>
              </div>
            );

            if (row.locked) {
              return (
                <div key={row.id} className="bg-white p-5">
                  {body}
                  {row.id === firstProLockedLevel && (
                    <Link
                      to="/pricing"
                      className="mt-4 ml-16 inline-flex items-center gap-1.5 text-sm font-bold text-brand-rust underline underline-offset-4"
                    >
                      Lihat paket Pro
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={row.id}
                to={`/level/${row.id}`}
                className="group block bg-brand-cream"
                aria-label={`Buka level ${row.id} ${row.name}`}
              >
                {/* The tint sits on an inner layer so it composites over the
                    cream instead of replacing it with a cold grey. */}
                <div className="p-5 transition-colors group-hover:bg-brand-ink/5">{body}</div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── 4. SECONDARY NUMBERS + PRACTICE ENTRY POINTS ────────── */}
      <section aria-labelledby="ringkasan-heading">
        <h2 id="ringkasan-heading" className="mb-5 border-b border-brand-ink/10 pb-3 font-serif text-2xl text-brand-ink">
          Ringkasan latihan
        </h2>

        <div className="grid grid-cols-1 gap-px bg-brand-ink/10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-brand-cream p-5">
            <div className="flex items-center gap-2 text-ink-muted">
              <Clock className="h-4 w-4" aria-hidden="true" />
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase">Waktu belajar</span>
            </div>
            <p className="mt-2 text-xl font-bold text-brand-ink">
              {studyTime.status === 'loading' && 'Menghitung…'}
              {studyTime.status === 'error' && '—'}
              {studyTime.status === 'ready' && formatStudyTime(studyTime.seconds)}
            </p>
            {studyTime.status === 'error' && <p className="mt-1 text-xs text-ink-muted">Belum bisa dimuat</p>}
          </div>

          <div className="bg-brand-cream p-5">
            <div className="flex items-center gap-2 text-ink-muted">
              <Trophy className="h-4 w-4" aria-hidden="true" />
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase">Checkpoint lulus</span>
            </div>
            <p className="mt-2 text-xl font-bold text-brand-ink">
              {loadFailed ? '—' : `${checkpointStats.passed} dari ${checkpointStats.total}`}
            </p>
            {loadFailed && <p className="mt-1 text-xs text-ink-muted">Belum bisa dimuat</p>}
          </div>

          <div className="bg-brand-cream p-5">
            <div className="flex items-center gap-2 text-ink-muted">
              <Target className="h-4 w-4" aria-hidden="true" />
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase">Rata-rata simulasi</span>
            </div>
            <p className="mt-2 text-xl font-bold text-brand-ink">{averageScore === null ? '—' : `${averageScore}%`}</p>
            {averageScore === null && (
              <Link to="/simulasi" className="mt-1 inline-block text-xs font-semibold text-brand-rust underline-offset-4 hover:underline">
                Belum pernah ikut simulasi
              </Link>
            )}
          </div>

          <div className="bg-brand-cream p-5">
            <div className="flex items-center gap-2 text-ink-muted">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              <span className="text-[11px] font-bold tracking-[0.14em] uppercase">Kosakata {currentLevel}</span>
            </div>
            <p className="mt-2 text-xl font-bold text-brand-ink">
              {levelWords.status === 'loading' && 'Memuat…'}
              {levelWords.status === 'error' && '—'}
              {levelWords.status === 'ready' && `${nf.format(levelWords.count)} kata`}
            </p>
            {levelWords.status === 'error' ? (
              <p className="mt-1 text-xs text-ink-muted">Belum bisa dimuat</p>
            ) : (
              <Link to="/vocab" className="mt-1 inline-block text-xs font-semibold text-brand-rust underline-offset-4 hover:underline">
                Latih kosakata
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* ── 5. ACHIEVEMENTS ─────────────────────────────────────── */}
      <section aria-labelledby="pencapaian-heading">
        <div className="mb-5 flex items-center gap-2 border-b border-brand-ink/10 pb-3">
          <Award className="h-5 w-5 text-brand-rust" aria-hidden="true" />
          <h2 id="pencapaian-heading" className="font-serif text-2xl text-brand-ink">
            Pencapaian
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-px bg-brand-ink/10 sm:grid-cols-3 lg:grid-cols-5">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            const unlocked = achievement.unlocked && !loadFailed;
            return (
              <div key={achievement.id} className={cn('p-4', unlocked ? 'bg-brand-cream' : 'bg-white')}>
                <div
                  className={cn(
                    'flex h-10 w-10 items-center justify-center',
                    unlocked ? 'bg-brand-ink text-brand-cream' : 'bg-brand-ink/10 text-ink-muted',
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-3 text-sm font-bold text-brand-ink">{achievement.title}</p>
                <p className="mt-1 text-xs text-ink-muted">{achievement.description}</p>
                <p
                  className={cn(
                    'mt-2 text-[10px] font-bold tracking-[0.14em] uppercase',
                    unlocked ? 'text-brand-rust' : 'text-ink-muted',
                  )}
                >
                  {unlocked ? 'Terbuka' : 'Belum'}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── 6. REPORT (quiet, bottom of the page) ───────────────── */}
      <section aria-labelledby="laporan-heading" className="border border-brand-ink/10 p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl">
            <h2 id="laporan-heading" className="font-serif text-xl text-brand-ink">
              Laporan belajar
            </h2>
            <p className="mt-1 text-sm text-ink-muted">
              Rekap progres, kosakata, dan hasil simulasi dalam satu berkas PDF. Enak dibagikan ke guru atau
              lembaga kursus.
            </p>
          </div>

          <FeatureGate
            feature="pdf_reports"
            sub={{ subscription: tierData?.subscription, pro_expires_at: tierData?.pro_expires_at }}
            role={role}
            fallback={
              <Link
                to="/pricing"
                className="inline-flex shrink-0 items-center gap-1.5 text-sm font-bold text-brand-rust underline underline-offset-4"
              >
                Tersedia untuk pengguna Pro
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          >
            <Button
              onClick={exportPDF}
              disabled={exporting}
              className="h-auto shrink-0 bg-brand-ink px-6 py-3 text-sm font-bold text-brand-cream hover:bg-brand-rust"
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              {exporting ? 'Menyiapkan…' : 'Unduh laporan'}
            </Button>
          </FeatureGate>
        </div>

        {reportError && (
          <p className="mt-4 border-l-2 border-brand-rust bg-brand-rust/10 px-3 py-2 text-sm font-medium text-brand-ink">
            {reportError}
          </p>
        )}

        {pdfBlobUrl && (
          <p className="mt-4 text-sm text-ink-muted">
            Unduhan tidak muncul?{' '}
            <a
              href={pdfBlobUrl}
              download={`DeutschUp-Laporan-${profileData?.full_name || 'Siswa'}.pdf`}
              className="font-bold text-brand-rust underline underline-offset-4"
            >
              Buka laporan secara manual
            </a>
          </p>
        )}
      </section>
    </div>
  );
}
