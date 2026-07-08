import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { courseIndex } from '../data/lessonIndex';
import { Button } from '../components/ui/button';
import { CheckCircle2, Lock, PlayCircle, ChevronRight, ArrowLeft, Loader2, BookOpen, Timer, Trophy, Star, Sparkles, Database } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Level } from '../data/course';
import { supabase } from '../lib/supabase';
import type { CefrLevel } from '../lib/vocabStats';
import { getCourseUnitRoute } from '../lib/courseUnitRoutes';

const levelMeta: Record<Level, { title: string; color: string; description: string; icon: string }> = {
  A1: { title: 'Pemula A1', color: 'bg-emerald-500', description: 'Dasar bahasa Jerman — salam, artikel, angka, kalimat sederhana.', icon: '🌱' },
  A2: { title: 'Dasar A2', color: 'bg-teal-500', description: 'Kasus, modal verben, waktu lampau, preposisi lanjut.', icon: '📚' },
  B1: { title: 'Menengah B1', color: 'bg-blue-500', description: 'Genitiv, relativas, konjunktiv II, passif, futur.', icon: '🎯' },
  B2: { title: 'Mahir B2', color: 'bg-indigo-500', description: 'Partizip, idiome, gaya ilmiah, persiapan ujian Goethe.', icon: '🏆' },
};

const getEstimatedTime = (lessonId: string, isCheckpoint: boolean) => isCheckpoint ? '15-20 min' : '8-12 min';
const getXPReward = (lessonIndex: number, isCheckpoint: boolean) => 50 + lessonIndex * 10 + (isCheckpoint ? 100 : 0);

function ProgressRing({ percent, size = 80, strokeWidth = 6, className }: { percent: number; size?: number; strokeWidth?: number; className?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} className="text-[#0a0a0a]/10" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="transparent" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="text-[#8b2500] transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-[#0a0a0a]">
        <span className="text-lg font-bold">{percent}%</span>
      </div>
    </div>
  );
}

export default function LevelView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { unlockedLessons, completedLessons, currentLevel, loading } = useProgressStore();
  const [dbWordCount, setDbWordCount] = useState<number | null>(null);

  const levelId = (id?.toUpperCase() || 'A1') as Level;
  const meta = levelMeta[levelId] || levelMeta.A1;
  const levelLessons = useMemo(() => courseIndex.filter(l => l.level === levelId), [levelId]);

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
  const completedCount = levelLessons.filter(l => completedLessons.includes(l.id)).length;
  const progressPercent = levelLessons.length > 0 ? Math.round((completedCount / levelLessons.length) * 100) : 0;

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#0a0a0a]" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4 sm:px-6">
      {/* Back nav */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0a0a0a]/40 hover:text-[#0a0a0a] mb-6 transition-colors group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Dashboard
      </Link>

      {/* ───────── Level Header — Editorial ───────── */}
      <div className="st-card st-card--hero mb-8">
        {/* German flag accent */}
        <div className="absolute top-0 left-0 bottom-0 w-1.5 flex flex-col">
          <div className="flex-1 bg-primary" />
          <div className="flex-1 bg-[#8b2500]" />
          <div className="flex-1 bg-[#c8956c]" />
        </div>
        {/* Grid texture */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl leading-none">{meta.icon}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-serif text-3xl font-extrabold tracking-tight">{levelId}</span>
                  <span className="px-2.5 py-0.5 bg-[#f5f0eb]/10 border border-white/20 text-xs font-bold tracking-wider uppercase">
                    {meta.title}
                  </span>
                </div>
                <p className="text-white/50 text-sm mt-0.5">{meta.description}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/80">
                <BookOpen className="w-4 h-4 opacity-60" />
                {completedCount}/{levelLessons.length}
                <span className="opacity-50">Pelajaran</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/80">
                <Trophy className="w-4 h-4 opacity-60" />
                {completedCount * 50}
                <span className="opacity-50">XP</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold rounded-full border border-white/15 bg-white/10 px-3 py-1 text-white/80">
                <Database className="w-4 h-4 opacity-60" />
                {dbWordCount === null ? '...' : dbWordCount.toLocaleString('id-ID')}
                <span className="opacity-50">kata</span>
              </span>
            </div>
          </div>
          <ProgressRing percent={progressPercent} size={88} strokeWidth={7} className="shrink-0" />
        </div>
      </div>

      {/* ───────── Locked overlay ───────── */}
      {!isLevelUnlocked && (
        <div className="st-card p-8 text-center">
          <div className="w-14 h-14 border-2 border-[#0a0a0a]/15 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-[#0a0a0a]/30" />
          </div>
          <h2 className="font-serif text-lg font-bold text-[#0a0a0a] mb-1">Level Terkunci</h2>
          <p className="text-sm text-[#0a0a0a]/50 mb-4">
            Selesaikan level sebelumnya untuk membuka {levelId}.
          </p>
          <p className="text-xs font-medium text-[#0a0a0a]/30">
            Selesaikan {levelMeta[currentLevel]?.title || 'level saat ini'} terlebih dahulu
          </p>
        </div>
      )}

      {isLevelUnlocked && (
        <div className="st-card mb-5 p-4 md:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
                <Database className="w-4 h-4" />
                Kosakata Level
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Level {levelId} punya {dbWordCount === null ? '...' : dbWordCount.toLocaleString('id-ID')} kata untuk latihan kosakata.</p>
            </div>
            <Link to="/vocab" className="shrink-0">
              <Button variant="outline" className="w-full sm:w-auto">Latih vocab {levelId}</Button>
            </Link>
          </div>
        </div>
      )}

      {/* ───────── Lesson list ───────── */}
      {isLevelUnlocked && (
        <div className="space-y-px">
          {levelLessons.map((lesson, idx) => {
            const route = getCourseUnitRoute(lesson);
            const routeAvailable = Boolean(route);
            const isUnlocked = unlockedLessons.includes(lesson.id) && routeAvailable;
            const isCompleted = completedLessons.includes(lesson.id);
            const isCheckpoint = lesson.id.includes('checkpoint');
            const estimatedTime = getEstimatedTime(lesson.id, isCheckpoint);
            const xpReward = getXPReward(idx, isCheckpoint);

            return (
              <Link
                key={lesson.id}
                to={isUnlocked && route ? route : ''}
                onClick={(e) => { if (!isUnlocked) e.preventDefault(); }}
                className={cn(
                  "group relative flex items-center gap-4 p-4 border transition-colors",
                  isCompleted
                    ? "bg-[#f5f0eb] border-[#0a0a0a]/10 border-l-4 border-l-[#2d8a4e]"
                    : isUnlocked && isCheckpoint
                      ? "bg-[#f5f0eb] border-[#0a0a0a]/10 border-l-4 border-l-[#c8956c] hover:bg-[#f5f0eb]"
                      : isUnlocked
                        ? "bg-[#f5f0eb] border-[#0a0a0a]/10 border-l-4 border-l-[#0a0a0a]/20 hover:bg-[#f5f0eb]"
                        : "bg-[#f5f0eb]/50 border-[#0a0a0a]/5 border-l-4 border-l-[#0a0a0a]/10 opacity-50 cursor-not-allowed",
                  !isUnlocked && "pointer-events-none"
                )}
                aria-disabled={!isUnlocked}
              >
                {/* Number / Status */}
                <div className={cn(
                  "w-11 h-11 flex items-center justify-center font-bold text-sm shrink-0",
                  isCompleted ? "bg-[#2d8a4e]/10 text-[#2d8a4e]"
                  : isUnlocked && isCheckpoint ? "bg-[#c8956c]/10 text-[#c8956c]"
                  : isUnlocked ? "bg-primary/5 text-[#0a0a0a]"
                  : "bg-primary/5 text-[#0a0a0a]/20"
                )}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" />
                  : isCheckpoint ? <Sparkles className="w-5 h-5" />
                  : isUnlocked ? idx + 1
                  : <Lock className="w-4 h-4" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm font-bold truncate", isCompleted ? "text-[#2d8a4e]" : isUnlocked ? "text-[#0a0a0a]" : "text-[#0a0a0a]/30")}>
                      {isCheckpoint ? `Checkpoint ${Math.floor(idx / 4) + 1}` : `Pelajaran ${idx + 1}`}
                    </span>
                    {isCheckpoint && isUnlocked && <span className="px-1.5 py-0.5 bg-[#c8956c]/10 text-[#c8956c] text-[10px] font-bold uppercase tracking-wider">Test</span>}
                    {isCompleted && <span className="px-1.5 py-0.5 bg-[#2d8a4e]/10 text-[#2d8a4e] text-[10px] font-bold uppercase tracking-wider">Selesai</span>}
                  </div>
                  <p className="text-sm text-[#0a0a0a]/50 truncate mt-0.5">
                    {lesson.title}{!routeAvailable ? ' • data belum siap' : ''}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-[#0a0a0a]/30">
                    <span className="inline-flex items-center gap-1"><Timer className="w-3 h-3" />{estimatedTime}</span>
                    <span className="inline-flex items-center gap-1"><Star className="w-3 h-3" />{xpReward} XP</span>
                  </div>
                </div>

                {/* Chevron */}
                {isUnlocked && (
                  <ChevronRight className={cn("w-4 h-4 shrink-0 transition-transform", isCompleted ? "text-[#2d8a4e]/40" : "text-[#0a0a0a]/20 group-hover:text-[#0a0a0a]/60 group-hover:translate-x-0.5")} />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* ───────── Completion banner ───────── */}
      {isLevelUnlocked && completedCount === levelLessons.length && levelLessons.length > 0 && (
        <div className="mt-8 border-2 border-[#0a0a0a] p-6 text-center">
          <Trophy className="w-10 h-10 text-[#c8956c] mx-auto mb-3" />
          <h3 className="font-serif text-lg font-bold text-[#0a0a0a] mb-1">Level Selesai!</h3>
          <p className="text-sm text-[#0a0a0a]/50 mb-4">
            Kamu telah menyelesaikan semua pelajaran di level {levelId}!
          </p>
          <Button onClick={() => navigate('/')} className="bg-primary hover:bg-primary/90 font-bold h-11 px-6">
            Kembali ke Dashboard
          </Button>
        </div>
      )}
    </div>
  );
}
