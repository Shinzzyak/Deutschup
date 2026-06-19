import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { courseIndex } from '../data/lessonIndex';
import { Button } from '../components/ui/button';
import { CheckCircle2, Lock, PlayCircle, ChevronRight, ArrowLeft, Loader2, BookOpen, Timer, Trophy, Star, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Level } from '../data/course';

const levelMeta: Record<Level, { title: string; color: string; description: string; gradient: string; icon: string; cardBg: string; progressBg: string; badgeBg: string }> = {
  A1: {
    title: 'Pemula A1',
    color: 'bg-green-500',
    description: 'Dasar bahasa Jerman — salam, artikel, angka, kalimat sederhana.',
    gradient: 'from-emerald-500 to-emerald-600',
    icon: '🌱',
    cardBg: 'bg-emerald-50/60',
    progressBg: 'bg-emerald-500',
    badgeBg: 'bg-emerald-100 text-emerald-700',
  },
  A2: {
    title: 'Dasar A2',
    color: 'bg-teal-500',
    description: 'Kasus, modal verben, waktu lampau, preposisi lanjut.',
    gradient: 'from-teal-500 to-teal-600',
    icon: '📚',
    cardBg: 'bg-teal-50/60',
    progressBg: 'bg-teal-500',
    badgeBg: 'bg-teal-100 text-teal-700',
  },
  B1: {
    title: 'Menengah B1',
    color: 'bg-blue-500',
    description: 'Genitiv, relativas, konjunktiv II, passif, futur.',
    gradient: 'from-blue-500 to-blue-600',
    icon: '🎯',
    cardBg: 'bg-blue-50/60',
    progressBg: 'bg-blue-500',
    badgeBg: 'bg-blue-100 text-blue-700',
  },
  B2: {
    title: 'Mahir B2',
    color: 'bg-indigo-500',
    description: 'Partizip, idiome, gaya ilmiah, persiapan ujian Goethe.',
    gradient: 'from-indigo-500 to-indigo-600',
    icon: '🏆',
    cardBg: 'bg-indigo-50/60',
    progressBg: 'bg-indigo-500',
    badgeBg: 'bg-indigo-100 text-indigo-700',
  },
};

// Estimated minutes per lesson type
const getEstimatedTime = (lessonId: string, isCheckpoint: boolean) => {
  return isCheckpoint ? '15-20 min' : '8-12 min';
};

// XP reward based on lesson number
const getXPReward = (lessonIndex: number, isCheckpoint: boolean) => {
  const baseXP = 50;
  const bonusXP = lessonIndex * 10;
  const checkpointBonus = isCheckpoint ? 100 : 0;
  return baseXP + bonusXP + checkpointBonus;
};

function ProgressRing({ percent, size = 80, strokeWidth = 6, className }: { percent: number; size?: number; strokeWidth?: number; className?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-white/20"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="text-white transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
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

  const levelId = (id?.toUpperCase() || 'A1') as Level;
  const meta = levelMeta[levelId] || levelMeta.A1;

  const levelLessons = useMemo(() =>
    courseIndex.filter(l => l.level === levelId),
    [levelId]
  );

  const userLevelIndex = { A1: 0, A2: 1, B1: 2, B2: 3 }[currentLevel] ?? 0;
  const thisLevelIndex = { A1: 0, A2: 1, B1: 2, B2: 3 }[levelId] ?? 0;
  const isLevelUnlocked = thisLevelIndex <= userLevelIndex;

  const completedCount = levelLessons.filter(l => completedLessons.includes(l.id)).length;
  const progressPercent = levelLessons.length > 0 ? Math.round((completedCount / levelLessons.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 px-4 sm:px-6">
      {/* Back nav */}
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-stone-500 hover:text-stone-800 mb-6 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Kembali ke Peta
      </Link>

      {/* ───────── Level Header ───────── */}
      <div
        className={cn(
          "relative rounded-2xl p-6 md:p-8 text-white mb-8 overflow-hidden",
          "bg-gradient-to-br",
          meta.gradient,
          "shadow-lg"
        )}
      >
        {/* Decorative blurs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-8 -right-8 w-36 h-36 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl leading-none">{meta.icon}</span>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-3xl font-extrabold tracking-tight">{levelId}</span>
                  <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-wide uppercase">
                    {meta.title}
                  </span>
                </div>
                <p className="text-white/85 text-sm mt-0.5">{meta.description}</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="mt-5 flex items-center gap-5 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <BookOpen className="w-4 h-4 opacity-80" />
                {completedCount}/{levelLessons.length}
                <span className="opacity-70">Pelajaran</span>
              </span>
              <span className="inline-flex items-center gap-1.5 font-semibold">
                <Trophy className="w-4 h-4 opacity-80" />
                {completedCount * 50}
                <span className="opacity-70">XP</span>
              </span>
            </div>
          </div>

          <ProgressRing percent={progressPercent} size={88} strokeWidth={7} className="shrink-0" />
        </div>
      </div>

      {/* ───────── Locked overlay ───────── */}
      {!isLevelUnlocked && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="w-14 h-14 bg-stone-100 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-stone-400" />
          </div>
          <h2 className="text-lg font-bold text-stone-700 mb-1">Level Terkunci</h2>
          <p className="text-sm text-stone-500 mb-4">
            Selesaikan level sebelumnya untuk membuka {levelId}.
          </p>
          <p className="text-xs font-medium text-stone-400">
            Selesaikan {levelMeta[currentLevel]?.title || 'level saat ini'} terlebih dahulu
          </p>
        </div>
      )}

      {/* ───────── Lesson list ───────── */}
      {isLevelUnlocked && (
        <div className="space-y-3">
          {levelLessons.map((lesson, idx) => {
            const isUnlocked = unlockedLessons.includes(lesson.id);
            const isCompleted = completedLessons.includes(lesson.id);
            const isCheckpoint = lesson.id.includes('checkpoint');
            const estimatedTime = getEstimatedTime(lesson.id, isCheckpoint);
            const xpReward = getXPReward(idx, isCheckpoint);

            return (
              <Link
                key={lesson.id}
                to={isUnlocked ? (isCheckpoint ? `/checkpoint/${lesson.id}` : `/lesson/${lesson.id}`) : ''}
                onClick={(e) => { if (!isUnlocked) e.preventDefault(); }}
                className={cn(
                  "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                  // ── Card styles ──
                  isCompleted
                    ? "bg-white border-l-4 border-l-emerald-500 border-y border-r-stone-100 hover:shadow-md"
                    : isUnlocked && isCheckpoint
                      ? "bg-amber-50/60 border-l-4 border-l-amber-400 border-y border-r-stone-100 hover:shadow-md"
                      : isUnlocked
                        ? "bg-white border-l-4 border-l-stone-300 border-y border-r-stone-100 hover:shadow-md hover:border-l-current"
                        : "bg-stone-50 border-l-4 border-l-stone-200 border-y border-r-stone-100 opacity-55 cursor-not-allowed",
                  // Level-colored left border for unlocked
                  isUnlocked && !isCompleted && !isCheckpoint && cn("hover:border-l-current", meta.color.replace('bg-', 'text-')),
                  isUnlocked && !isCompleted && isCheckpoint && "hover:border-l-amber-500",
                  !isUnlocked && "pointer-events-none"
                )}
                aria-disabled={!isUnlocked}
              >
                {/* Number / Status badge */}
                <div
                  className={cn(
                    "w-11 h-11 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 transition-transform duration-200",
                    isCompleted
                      ? "bg-emerald-100 text-emerald-600"
                      : isUnlocked && isCheckpoint
                        ? "bg-amber-100 text-amber-600 group-hover:scale-105"
                        : isUnlocked
                          ? cn(meta.badgeBg, "group-hover:scale-105")
                          : "bg-stone-100 text-stone-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isCheckpoint ? (
                    <Sparkles className="w-5 h-5" />
                  ) : isUnlocked ? (
                    idx + 1
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-bold truncate",
                        isCompleted ? "text-emerald-700" : isUnlocked ? "text-stone-800" : "text-stone-400"
                      )}
                    >
                      {isCheckpoint ? `Checkpoint ${Math.floor(idx / 4) + 1}` : `Pelajaran ${idx + 1}`}
                    </span>
                    {isCheckpoint && isUnlocked && (
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider">
                        Test
                      </span>
                    )}
                    {isCompleted && (
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-600 text-[10px] font-bold rounded uppercase tracking-wider">
                        Selesai
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-stone-500 truncate mt-0.5">{lesson.title}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-stone-400">
                    <span className="inline-flex items-center gap-1">
                      <Timer className="w-3 h-3" />
                      {estimatedTime}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {xpReward} XP
                    </span>
                  </div>

                  {/* Mini progress bar */}
                  {isUnlocked && !isCompleted && (
                    <div className="mt-2 h-1 bg-stone-100 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", meta.progressBg)}
                        style={{ width: '0%' }}
                      />
                    </div>
                  )}
                </div>

                {/* Chevron */}
                {isUnlocked && (
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 shrink-0 transition-all duration-200",
                      isCompleted ? "text-emerald-400" : cn("text-stone-300 group-hover:text-stone-600", "group-hover:translate-x-0.5")
                    )}
                  />
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* ───────── Completion banner ───────── */}
      {isLevelUnlocked && completedCount === levelLessons.length && levelLessons.length > 0 && (
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center shadow-sm">
          <Trophy className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-amber-800 mb-1">Level Selesai! 🎉</h3>
          <p className="text-sm text-amber-600 mb-4">
            Kamu telah menyelesaikan semua pelajaran di level {levelId}!
          </p>
          <Button
            onClick={() => navigate('/')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl h-11 px-6"
          >
            Kembali ke Peta
          </Button>
        </div>
      )}
    </div>
  );
}
