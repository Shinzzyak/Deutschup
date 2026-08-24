import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useProgressStore } from '../stores/progressStore';
import { courseIndex } from '../data/lessonIndex';
import type { LessonIndex } from '../data/lessonIndex';
import { Button } from '../components/ui/button';
import { CheckCircle2, Lock, ChevronRight, ArrowLeft, Loader2, BookOpen, Timer, Trophy, Star, Target, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Level } from '../data/course';
import { supabase } from '../lib/supabase';
import type { CefrLevel } from '../lib/vocabStats';
import { getCourseUnitRoute, inferCourseUnitLevel, isCheckpointUnit } from '../lib/courseUnitRoutes';

// XP — single source of truth. The complete_lesson RPC credits exactly this much
// when a lesson is marked done (progressStore sends xpEarned: 10). Correct answers
// add another 10 each inside the lesson; checkpoints pay no XP at all, they unlock
// the next step. Nothing on this page may promise a number the server won't pay.
const XP_PER_LESSON_COMPLETE = 10;

const levelMeta: Record<Level, { title: string; description: string; icon: string }> = {
  A1: { title: 'Pemula A1', description: 'Dasar bahasa Jerman — salam, artikel, angka, kalimat sederhana.', icon: '🌱' },
  A2: { title: 'Dasar A2', description: 'Kasus, modal verben, waktu lampau, preposisi lanjut.', icon: '📚' },
  B1: { title: 'Menengah B1', description: 'Genitiv, relativas, konjunktiv II, passif, futur.', icon: '🎯' },
  B2: { title: 'Mahir B2', description: 'Partizip, idiome, gaya ilmiah, persiapan ujian Goethe.', icon: '🏆' },
};

const getEstimatedTime = (isCheckpoint: boolean) => (isCheckpoint ? '15–20 menit' : '8–12 menit');

function ProgressRing({ percent, size = 80, strokeWidth = 6, className }: { percent: number; size?: number; strokeWidth?: number; className?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        {/* The ring sits on the dark hero card. The track used to be ink/10 (1.00:1
            on ink) and the indicator rust (2.23:1) — both invisible. Now cream/30
            track with a tan indicator: 3.10:1 indicator-vs-track, 7.52:1 on ink. */}
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} className="text-brand-cream/30" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="butt" className="text-brand-tan transition-all duration-1000 ease-out" />
      </svg>
      {/* Was text-[#0a0a0a] on a near-black card: 1.00:1, literally unreadable. */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-brand-cream">
        <span className="font-serif text-lg leading-none">{percent}%</span>
      </div>
    </div>
  );
}

type LevelRow = {
  unit: LessonIndex;
  isCheckpoint: boolean;
  /** Position within its own kind: "Pelajaran 5" / "Checkpoint 2". */
  number: number;
  route: string | null;
  isDone: boolean;
  isUnlocked: boolean;
};

export default function LevelView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { unlockedLessons, completedLessons, checkpointProgress, currentLevel, xp, loading } = useProgressStore();
  const [dbWordCount, setDbWordCount] = useState<number | null>(null);

  const levelId = (id?.toUpperCase() || 'A1') as Level;
  const meta = levelMeta[levelId] || levelMeta.A1;

  // Checkpoint entries in courseIndex carry no `level` field, so the old
  // `l.level === levelId` filter dropped every single one of them: the exams
  // existed but never appeared on the map. inferCourseUnitLevel reads the id prefix.
  const levelUnits = useMemo(
    () => courseIndex.filter(u => inferCourseUnitLevel(u) === levelId),
    [levelId]
  );

  useEffect(() => {
    let cancelled = false;
    setDbWordCount(null);
    (async () => {
      const { count, error } = await supabase
        .from('curriculum_vocabulary')
        .select('id', { count: 'exact', head: true })
        .eq('level_id', levelId as CefrLevel);
      if (error) {
        console.error('Error loading level vocabulary count:', error);
        return;
      }
      if (!cancelled) setDbWordCount(count || 0);
    })();
    return () => { cancelled = true; };
  }, [levelId]);

  const userLevelIndex = { A1: 0, A2: 1, B1: 2, B2: 3 }[currentLevel] ?? 0;
  const thisLevelIndex = { A1: 0, A2: 1, B1: 2, B2: 3 }[levelId] ?? 0;
  const isLevelUnlocked = thisLevelIndex <= userLevelIndex;

  const rows = useMemo<LevelRow[]>(() => {
    let lessonCounter = 0;
    let checkpointCounter = 0;
    let previousDone = true; // the first unit is gated by unlockedLessons alone

    return levelUnits.map((unit) => {
      const isCheckpoint = isCheckpointUnit(unit);
      const number = isCheckpoint ? ++checkpointCounter : ++lessonCounter;
      const isDone = isCheckpoint
        ? checkpointProgress.some(c => c.checkpointId === unit.id && c.passed)
        : completedLessons.includes(unit.id);
      const route = getCourseUnitRoute(unit);
      // Lessons are gated by the server-issued unlock list. Checkpoints are not
      // always written into that list, so finishing the step right before one
      // also opens it — otherwise the exam would be unreachable.
      const isUnlocked = Boolean(route) && (
        unlockedLessons.includes(unit.id) || isDone || (isCheckpoint && previousDone)
      );
      previousDone = isDone;
      return { unit, isCheckpoint, number, isDone, isUnlocked, route };
    });
  }, [levelUnits, completedLessons, unlockedLessons, checkpointProgress]);

  const lessonRows = rows.filter(r => !r.isCheckpoint);
  const checkpointRows = rows.filter(r => r.isCheckpoint);
  // Units whose content is not shipped yet can never be finished, so they stay
  // out of the denominator — otherwise the ring would be stuck below 100% for
  // reasons the learner can do nothing about.
  const countableRows = rows.filter(r => r.route || r.isDone);
  const countableCheckpoints = checkpointRows.filter(r => r.route || r.isDone);
  const completedLessonCount = lessonRows.filter(r => r.isDone).length;
  const passedCheckpointCount = countableCheckpoints.filter(r => r.isDone).length;
  const doneCount = completedLessonCount + passedCheckpointCount;
  const progressPercent = countableRows.length > 0 ? Math.round((doneCount / countableRows.length) * 100) : 0;
  // The one step the learner should tap next.
  const resumeId = rows.find(r => r.isUnlocked && !r.isDone)?.unit.id ?? null;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Loader2 className="w-8 h-8 mx-auto animate-spin text-brand-rust" />
        <p className="mt-4 text-ink-muted">Memuat peta level...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4 sm:px-6">
      {/* Back nav */}
      <Link to="/" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-ink-subtle hover:text-brand-ink mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Dashboard
      </Link>

      {/* ───────── Level Header — Editorial ───────── */}
      <div className="st-card st-card--hero mb-8">
        {/* German flag accent — cream/rust/tan so it stays visible on the dark card */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 flex flex-col">
          <div className="flex-1 bg-brand-cream" />
          <div className="flex-1 bg-brand-rust" />
          <div className="flex-1 bg-brand-tan" />
        </div>
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl leading-none">{meta.icon}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif text-3xl tracking-tight text-brand-cream">{levelId}</span>
                  <span className="px-2.5 py-0.5 border border-brand-cream/25 text-xs font-bold tracking-wider uppercase text-brand-cream">
                    {meta.title}
                  </span>
                </div>
                {/* cream-muted on the hero gradient = 5.70:1 at its lightest point */}
                <p className="text-cream-muted text-sm mt-1">{meta.description}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 border border-brand-cream/20 px-3 py-1 text-brand-cream">
                <BookOpen className="w-4 h-4 text-brand-tan" />
                {completedLessonCount}/{lessonRows.length}
                <span className="text-cream-muted">pelajaran</span>
              </span>
              {countableCheckpoints.length > 0 && (
                <span className="inline-flex items-center gap-1.5 border border-brand-cream/20 px-3 py-1 text-brand-cream">
                  <Target className="w-4 h-4 text-brand-tan" />
                  {passedCheckpointCount}/{countableCheckpoints.length}
                  <span className="text-cream-muted">checkpoint</span>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 border border-brand-cream/20 px-3 py-1 text-brand-cream">
                <Trophy className="w-4 h-4 text-brand-tan" />
                {xp.toLocaleString('id-ID')}
                <span className="text-cream-muted">XP total</span>
              </span>
              <span className="inline-flex items-center gap-1.5 border border-brand-cream/20 px-3 py-1 text-brand-cream">
                <Database className="w-4 h-4 text-brand-tan" />
                {dbWordCount === null ? '...' : dbWordCount.toLocaleString('id-ID')}
                <span className="text-cream-muted">kata</span>
              </span>
            </div>
          </div>
          <ProgressRing percent={progressPercent} size={88} strokeWidth={7} className="shrink-0" />
        </div>
      </div>

      {/* ───────── Locked overlay ───────── */}
      {!isLevelUnlocked && (
        <div className="border border-brand-ink/12 bg-white p-8 text-center">
          <div className="w-14 h-14 border-2 border-brand-ink/15 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-ink-subtle" />
          </div>
          <h2 className="font-serif text-xl text-brand-ink mb-2">Level {levelId} masih terkunci</h2>
          <p className="text-ink-muted mb-1">
            Tuntaskan {levelMeta[currentLevel]?.title || 'level yang sedang kamu jalani'} dulu, lalu level ini terbuka sendiri.
          </p>
          <div className="mt-6">
            <Button render={<Link to={`/level/${currentLevel}`} />} className="h-11 px-6 bg-brand-ink text-brand-cream hover:bg-brand-ink/90">
              Lanjutkan di level {currentLevel}
            </Button>
          </div>
        </div>
      )}

      {isLevelUnlocked && (
        <div className="border border-brand-ink/12 bg-white mb-5 p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-ink-subtle">
                <Database className="w-4 h-4" />
                Kosakata Level
              </div>
              <p className="mt-1 text-ink-muted">
                Level {levelId} punya {dbWordCount === null ? '...' : dbWordCount.toLocaleString('id-ID')} kata untuk latihan kosakata.
              </p>
            </div>
            <Button render={<Link to="/vocab" />} variant="outline" className="h-11 px-5 shrink-0">
              Latih vocab {levelId}
            </Button>
          </div>
        </div>
      )}

      {/* ───────── Unit list ───────── */}
      {isLevelUnlocked && (
        <div className="space-y-px">
          {rows.map(({ unit, isCheckpoint, number, isDone, isUnlocked, route }) => {
            const isResume = unit.id === resumeId;
            const routeAvailable = Boolean(route);

            // Checkpoints are the heavier step: an ink block instead of a cream row.
            if (isCheckpoint) {
              return (
                <Link
                  key={unit.id}
                  to={isUnlocked && route ? route : ''}
                  onClick={(e) => { if (!isUnlocked) e.preventDefault(); }}
                  aria-disabled={!isUnlocked}
                  className={cn(
                    'group relative flex items-center gap-4 border-l-4 p-4 transition-colors',
                    // Locked keeps the same ink surface — dimming the block would
                    // drag the cream text under AA. Only the rule and icon change.
                    'bg-brand-ink',
                    isUnlocked ? 'border-l-brand-tan hover:bg-brand-ink/90' : 'border-l-brand-cream/25',
                    !isUnlocked && 'pointer-events-none'
                  )}
                >
                  <div className={cn(
                    'w-11 h-11 flex items-center justify-center shrink-0 font-serif text-lg',
                    isDone ? 'bg-brand-tan text-brand-ink' : 'border border-brand-cream/30 text-brand-cream'
                  )}>
                    {isDone ? <CheckCircle2 className="w-5 h-5" /> : isUnlocked ? <Target className="w-5 h-5" /> : <Lock className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold uppercase tracking-[0.14em] text-brand-tan">
                        Checkpoint {number}
                      </span>
                      {isDone && <span className="bg-brand-tan px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink">Lulus</span>}
                      {isResume && !isDone && <span className="bg-brand-cream px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-ink">Lanjutkan</span>}
                    </div>
                    <p className="mt-0.5 truncate text-brand-cream">
                      {unit.title || 'Ujian ringkas'}
                      {!routeAvailable && <span className="text-cream-muted"> • soalnya belum siap</span>}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-cream-muted">
                      <span className="inline-flex items-center gap-1"><Timer className="w-3 h-3" />{getEstimatedTime(true)}</span>
                      <span className="inline-flex items-center gap-1"><Star className="w-3 h-3" />Lulus untuk buka langkah berikutnya</span>
                    </div>
                  </div>

                  {isUnlocked && <ChevronRight className="w-4 h-4 shrink-0 text-brand-tan transition-transform group-hover:translate-x-0.5" />}
                </Link>
              );
            }

            return (
              <Link
                key={unit.id}
                to={isUnlocked && route ? route : ''}
                onClick={(e) => { if (!isUnlocked) e.preventDefault(); }}
                aria-disabled={!isUnlocked}
                className={cn(
                  'group relative flex items-center gap-4 border p-4 transition-colors',
                  isDone
                    ? 'bg-brand-cream border-brand-ink/10 border-l-4 border-l-brand-green'
                    : isUnlocked
                      ? 'bg-brand-cream border-brand-ink/10 border-l-4 border-l-brand-ink/25 hover:bg-white'
                      // Locked rows keep full-strength text instead of opacity-50,
                      // which used to drag them down to ~1.5:1.
                      : 'bg-white border-brand-ink/8 border-l-4 border-l-brand-ink/10 cursor-not-allowed',
                  !isUnlocked && 'pointer-events-none'
                )}
              >
                <div className={cn(
                  'w-11 h-11 flex items-center justify-center font-bold text-sm shrink-0',
                  isDone ? 'bg-brand-green/10 text-[#1a6b3d]'
                    : isUnlocked ? 'bg-brand-ink/5 text-brand-ink'
                      : 'border border-brand-ink/10 text-ink-subtle'
                )}>
                  {isDone ? <CheckCircle2 className="w-5 h-5" /> : isUnlocked ? number : <Lock className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* #1a6b3d = 5.77:1 on cream; brand-green itself is only 3.82:1 */}
                    <span className={cn('text-sm font-bold', isDone ? 'text-[#1a6b3d]' : isUnlocked ? 'text-brand-ink' : 'text-ink-subtle')}>
                      Pelajaran {number}
                    </span>
                    {isDone && <span className="bg-brand-green/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#1a6b3d]">Selesai</span>}
                    {isResume && !isDone && <span className="bg-brand-rust px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-cream">Lanjutkan</span>}
                  </div>
                  <p className={cn('mt-0.5 truncate', isUnlocked || isDone ? 'text-ink-muted' : 'text-ink-subtle')}>
                    {unit.title}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-ink-subtle">
                    <span className="inline-flex items-center gap-1"><Timer className="w-3 h-3" />{getEstimatedTime(false)}</span>
                    <span className="inline-flex items-center gap-1"><Star className="w-3 h-3" />+{XP_PER_LESSON_COMPLETE} XP saat selesai</span>
                  </div>
                </div>

                {isUnlocked && (
                  <ChevronRight className={cn('w-4 h-4 shrink-0 transition-transform', isDone ? 'text-[#1a6b3d]' : 'text-ink-subtle group-hover:text-brand-ink group-hover:translate-x-0.5')} />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* ───────── Completion banner ───────── */}
      {isLevelUnlocked && countableRows.length > 0 && doneCount === countableRows.length && (
        <div className="mt-8 border-2 border-brand-ink p-6 text-center">
          <Trophy className="w-10 h-10 text-brand-rust mx-auto mb-3" />
          <h3 className="font-serif text-2xl text-brand-ink mb-1">Level {levelId} tuntas</h3>
          <p className="text-ink-muted mb-5">
            Semua pelajaran dan checkpoint di level ini sudah kamu lewati. Rapi sekali.
          </p>
          <Button onClick={() => navigate('/')} className="h-11 px-6 bg-brand-ink text-brand-cream hover:bg-brand-ink/90">
            Kembali ke Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
