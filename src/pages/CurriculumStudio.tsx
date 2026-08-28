import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Database,
  GraduationCap,
  Layers,
  Lock,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
} from 'lucide-react';
import { courseIndex } from '../data/lessonIndex';
import { listResolvableCheckpointIds } from '../lib/checkpointAdapter';
import { getAllLessons } from '../lib/lessons-db';
import { useProgressStore } from '../stores/progressStore';
import { supabase } from '../lib/supabase';
import { buildCurriculumOverview, type CurriculumUnit } from '../lib/curriculumOverview';
import { LEVELS, type CefrLevel } from '../lib/vocabStats';
import { cn } from '../lib/utils';

/* ============================================================================
   LIGHT-NATIVE. This page is routed at /curriculum — the "Kurikulum" item in
   the main nav — but it was the one top-level destination the token migration
   skipped, so it still carried the ad-hoc `text-[#0a0a0a]/NN` ramp that the
   brand tokens exist to replace. All of its surfaces are `.st-card` /
   `.st-level-card` / `bg-white/45`, which composite to ~#ffffff over the app's
   white `bg-background`. Measured there with WCAG 2.1 relative luminance:

     text-[#0a0a0a]/20  1.57:1     text-[#0a0a0a]/45  3.16:1
     text-[#0a0a0a]/25  1.79:1     text-[#0a0a0a]/50  3.71:1
     text-[#0a0a0a]/30  2.04:1     text-[#0a0a0a]/55  4.40:1
     text-[#0a0a0a]/40  2.71:1     text-[#0a0a0a]/60  5.25:1  (only one passing)

   21 of them were under AA, including the title of every unit whose data is not
   ready yet (/40, 2.71:1) and the Lock/Arrow icons (/20 and /25, 1.57–1.79:1,
   under the 3:1 floor for graphics). They now use the measured ramp:
   --ink-muted 6.96:1 for copy, --ink-subtle 5.14:1 for the smallest labels and
   the icons.

   Two more, off the opacity ramp:
     completed-unit plate  #2d8a4e on #2d8a4e/10  3.83:1 -> #1a6b3d  5.78:1
     aside footnote        primary-fg/40 on #171717 3.72:1 -> --cream-muted 7.45:1
   Every unit already prints its status in words (statusCopy), so none of these
   states rested on colour alone.
   ========================================================================= */

const formatId = new Intl.NumberFormat('id-ID');

const statusCopy: Record<CurriculumUnit['status'], string> = {
  completed: 'Selesai',
  current: 'Lanjut',
  open: 'Terbuka',
  locked: 'Terkunci',
};

function FlagStripe({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col', className)} aria-hidden="true">
      <div className="flex-1 bg-primary" />
      <div className="flex-1 bg-brand-rust" />
      <div className="flex-1 bg-brand-tan" />
    </div>
  );
}

export default function CurriculumStudio() {
  const { currentLevel, completedLessons, unlockedLessons } = useProgressStore();
  const [dbLevelCounts, setDbLevelCounts] = useState<Partial<Record<CefrLevel, number>>>({});
  const [availableCheckpointIds, setAvailableCheckpointIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    let alive = true;
    getAllLessons().then(lessons => {
      if (alive) setAvailableCheckpointIds(new Set(listResolvableCheckpointIds(lessons)));
    }).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const entries = await Promise.all(
          LEVELS.map(async (level) => {
            const { count, error } = await supabase
              .from('curriculum_vocabulary')
              .select('id', { count: 'exact', head: true })
              .eq('level_id', level);
            if (error) throw error;
            return [level, count || 0] as const;
          }),
        );
        if (!cancelled) setDbLevelCounts(Object.fromEntries(entries) as Partial<Record<CefrLevel, number>>);
      } catch (error) {
        console.error('Error loading curriculum studio counts:', error);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const overview = useMemo(
    () => buildCurriculumOverview(courseIndex, {
      currentLevel: currentLevel as CefrLevel,
      completedLessons,
      unlockedLessons,
      dbLevelCounts,
      availableCheckpointIds,
    }),
    [currentLevel, completedLessons, unlockedLessons, dbLevelCounts, availableCheckpointIds],
  );

  const currentLevelOverview = overview.levels[(currentLevel as CefrLevel) || 'A1'] || overview.levels.A1;
  const featuredUnits = currentLevelOverview.units.slice(0, 8);
  const nextHref = overview.nextUnit?.href || '/level/A1';

  return (
    <div className="space-y-6 pb-28 lg:pb-12">
      <section className="relative min-h-[calc(100svh-8rem)] overflow-hidden st-card p-6 sm:min-h-0 sm:p-8 lg:p-10">
        <FlagStripe className="absolute left-0 top-0 bottom-0 w-1.5" />
        <div
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(#0a0a0a 1px, transparent 1px), linear-gradient(90deg, #0a0a0a 1px, transparent 1px)',
            backgroundSize: '44px 44px',
          }}
        />

        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.9fr] lg:items-end">
          <div>
            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-10 bg-primary" />
              <span className="text-xs font-black uppercase tracking-[0.22em] text-ink-muted">
                Kurikulum A1–B2
              </span>
            </div>
            <h1 className="font-serif text-[clamp(2.35rem,5vw,4.8rem)] leading-[0.95] tracking-tight text-brand-ink">
              Kurikulum Studio
            </h1>
            <p className="mt-5 max-w-2xl text-base sm:text-lg leading-relaxed text-ink-muted">
              Semua unit, checkpoint, kosakata, dan latihan tersedia dalam satu kurikulum untuk belajar harian.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to={nextHref}
                className="inline-flex items-center justify-center gap-2 bg-primary px-5 py-3 text-sm font-black text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Mulai pelajaran berikutnya
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/vocab"
                className="inline-flex items-center justify-center gap-2 border-2 border-brand-ink px-5 py-3 text-sm font-black text-brand-ink transition-colors hover:border-brand-rust hover:text-brand-rust"
              >
                Buka latihan kosakata
                <Database className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.12em] text-ink-muted">
              <span className="border border-brand-ink/10 bg-white/45 px-3 py-2">{overview.availableCheckpointCount} checkpoint siap</span>
              <span className="border border-brand-ink/10 bg-white/45 px-3 py-2">{overview.unavailableCheckpointCount} data belum siap</span>
              <span className="border border-brand-ink/10 bg-white/45 px-3 py-2">{currentLevelOverview.routeReadyCount} unit siap</span>
            </div>
          </div>

          <div className="hidden grid-cols-2 gap-3 sm:grid sm:grid-cols-4 lg:grid-cols-2">
            <div className="st-level-card p-4">
              <Layers className="mb-3 h-5 w-5 text-brand-rust" />
              <span className="sr-only">{overview.totalUnits} unit kurikulum</span>
              <p className="text-2xl font-serif font-bold text-brand-ink">{overview.totalUnits}</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">unit kurikulum</p>
            </div>
            <div className="st-level-card p-4">
              <BookOpen className="mb-3 h-5 w-5 text-brand-rust" />
              <span className="sr-only">{overview.totalLessons} pelajaran</span>
              <p className="text-2xl font-serif font-bold text-brand-ink">{overview.totalLessons}</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">pelajaran</p>
            </div>
            <div className="st-level-card p-4">
              <Trophy className="mb-3 h-5 w-5 text-brand-rust" />
              <span className="sr-only">{overview.totalCheckpoints} evaluasi</span>
              <p className="text-2xl font-serif font-bold text-brand-ink">{overview.totalCheckpoints}</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">evaluasi</p>
            </div>
            <div className="st-level-card p-4">
              <Database className="mb-3 h-5 w-5 text-brand-rust" />
              <span className="sr-only">{formatId.format(overview.totalVocabulary)} kata tersedia</span>
              <p className="text-2xl font-serif font-bold text-brand-ink">{formatId.format(overview.totalVocabulary)}</p>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink-muted">Kata</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overview.orderedLevels.map((level) => (
          <Link
            key={level.level}
            to={`/level/${level.level}`}
            className="group st-level-card transition-colors hover:border-brand-rust/50 hover:bg-brand-cream/80"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-serif text-3xl font-bold text-brand-ink">{level.level}</p>
                <h2 className="mt-1 text-sm font-black uppercase tracking-[0.12em] text-ink-muted">{level.title}</h2>
              </div>
              <div className="flex h-10 w-10 items-center justify-center border border-brand-ink/10" style={{ color: level.accent }}>
                <GraduationCap className="h-5 w-5" />
              </div>
            </div>
            <p className="min-h-[54px] text-sm leading-relaxed text-ink-muted">{level.description}</p>
            <div className="mt-5 grid grid-cols-3 gap-2 text-center">
              <div className="bg-white/45 p-2">
                <p className="text-sm font-black text-brand-ink">{level.lessonCount}</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-ink-subtle">Pelajaran</p>
              </div>
              <div className="bg-white/45 p-2">
                <p className="text-sm font-black text-brand-ink">{level.checkpointCount}</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-ink-subtle">Ujian</p>
              </div>
              <div className="bg-white/45 p-2">
                <p className="text-sm font-black text-brand-ink">{formatId.format(level.vocabularyCount)}</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-ink-subtle">Kata</p>
              </div>
            </div>
            <div className="mt-5 h-1.5 bg-primary/10">
              <div className="h-full transition-all" style={{ width: `${level.progressPercent}%`, backgroundColor: level.accent }} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-ink-muted">
              <span>{level.routeReadyCount} unit siap</span>
              {level.pendingDataCount > 0 && <span>{level.pendingDataCount} data belum siap</span>}
            </div>
            <p className="mt-2 text-xs font-bold text-ink-muted">{level.progressPercent}% selesai • buka level map</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="st-card p-5 sm:p-6">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-ink-muted">Level saat ini</p>
              <h2 className="mt-1 font-serif text-2xl font-bold text-brand-ink">{currentLevelOverview.level}: {currentLevelOverview.title}</h2>
            </div>
            <Link to={`/level/${currentLevelOverview.level}`} className="text-sm font-black text-brand-rust hover:text-brand-ink">
              Lihat semua unit →
            </Link>
          </div>

          <div className="space-y-2">
            {featuredUnits.map((unit, index) => {
              const Icon = unit.type === 'checkpoint' ? Trophy : PlayCircle;
              const content = (
                <>
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center border text-sm font-black',
                    unit.completed ? 'border-brand-green/40 bg-brand-green/10 text-[#1a6b3d]' :
                      unit.status === 'locked' ? 'border-brand-ink/10 text-ink-subtle' : 'border-brand-ink/15 text-brand-ink',
                  )}>
                    {unit.completed ? <CheckCircle2 className="h-5 w-5" /> : unit.status === 'locked' ? <Lock className="h-4 w-4" /> : index + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start gap-2">
                      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', unit.href ? 'text-brand-rust' : 'text-ink-subtle')} />
                      <span className={cn('min-w-0 break-words text-sm font-black leading-snug', unit.href ? 'text-brand-ink' : 'text-ink-subtle')}>
                        {unit.title}
                      </span>
                    </div>
                    <p className="mt-1 break-words text-xs leading-snug text-ink-muted">
                      {unit.type === 'checkpoint' ? 'Latihan soal' : 'Pelajaran dan latihan'} • {statusCopy[unit.status]}
                      {!unit.routeAvailable ? ' • data belum siap' : ''}
                    </p>
                  </div>
                  {unit.href ? (
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-ink-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-brand-rust" />
                  ) : (
                    <Lock className="mt-1 h-4 w-4 shrink-0 text-ink-subtle" />
                  )}
                </>
              );

              if (!unit.href) {
                return (
                  <div
                    key={unit.id}
                    aria-disabled="true"
                    className="flex cursor-not-allowed items-start gap-3 border border-brand-ink/10 bg-white/30 p-3 opacity-80"
                  >
                    {content}
                  </div>
                );
              }

              return (
                <Link
                  key={unit.id}
                  to={unit.href}
                  className="group flex items-start gap-3 border border-brand-ink/10 bg-white/45 p-3 transition-colors hover:border-brand-rust/40 hover:bg-white/70"
                >
                  {content}
                </Link>
              );
            })}
          </div>
        </div>

        <aside className="border border-brand-ink/10 bg-primary p-5 sm:p-6 text-primary-foreground">
          <div className="mb-5 flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-brand-tan" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-cream-muted">Latihan tambahan</p>
              <h2 className="font-serif text-2xl font-bold">Latihan tetap dipakai</h2>
            </div>
          </div>
          <div className="space-y-3">
            <Link to="/vocab" className="flex items-center justify-between gap-3 border border-white/10 bg-white/5 p-3 text-sm font-bold hover:bg-white/10">
              <span className="inline-flex min-w-0 items-center gap-2 break-words"><Database className="h-4 w-4 shrink-0 text-brand-tan" />Latihan kosakata</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link to="/simulasi" className="flex items-center justify-between gap-3 border border-white/10 bg-white/5 p-3 text-sm font-bold hover:bg-white/10">
              <span className="inline-flex min-w-0 items-center gap-2 break-words"><Target className="h-4 w-4 shrink-0 text-brand-tan" />Simulasi soal</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
            <Link to="/goethe" className="flex items-center justify-between gap-3 border border-white/10 bg-white/5 p-3 text-sm font-bold hover:bg-white/10">
              <span className="inline-flex min-w-0 items-center gap-2 break-words"><Trophy className="h-4 w-4 shrink-0 text-brand-tan" />Persiapan Goethe</span>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </Link>
          </div>
          <p className="mt-5 break-words text-sm leading-relaxed text-cream-muted">
            Semua materi dan latihan tersedia di sini. Lanjutkan dari level terakhir yang sudah kamu buka.
          </p>
        </aside>
      </section>
    </div>
  );
}
