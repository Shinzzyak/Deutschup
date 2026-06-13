import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { courseIndex } from '../data/lessonIndex';
import { Button } from '../components/ui/button';
import { CheckCircle2, Lock, PlayCircle, ChevronRight, ArrowLeft, Loader2, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';
import { Progress } from '../components/ui/progress';
import type { Level } from '../data/course';

const levelMeta: Record<Level, { title: string; color: string; description: string }> = {
  A1: { title: 'Pemula A1', color: 'bg-green-500', description: 'Dasar bahasa Jerman — salam, artikel, angka, kalimat sederhana.' },
  A2: { title: 'Dasar A2', color: 'bg-teal-500', description: 'Kasus, modal verben, waktu lampau, preposisi lanjut.' },
  B1: { title: 'Menengah B1', color: 'bg-blue-500', description: 'Genitiv, relativas, konjunktiv II, passif, futur.' },
  B2: { title: 'Mahir B2', color: 'bg-indigo-500', description: 'Partizip, idiome, gaya ilmiah, persiapan ujian Goethe.' },
};

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
    <div className="max-w-3xl mx-auto pb-20">
      {/* Back nav */}
      <Link to="/" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Peta
      </Link>

      {/* Level header */}
      <div className={cn("rounded-3xl p-6 md:p-8 text-white mb-8", meta.color)}>
        <div className="flex items-center space-x-3 mb-2">
          <span className="text-4xl font-black">{levelId}</span>
          <div>
            <h1 className="text-2xl font-bold">{meta.title}</h1>
            <p className="text-white/80 text-sm">{meta.description}</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm font-bold mb-1">
            <span>{completedCount}/{levelLessons.length} Pelajaran</span>
            <span>{progressPercent}%</span>
          </div>
          <Progress value={progressPercent} className="h-2 bg-white/20" />
        </div>
      </div>

      {/* Level locked */}
      {!isLevelUnlocked && (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 text-center">
          <Lock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-600 mb-2">Level Terkunci</h2>
          <p className="text-slate-500">Selesaikan level sebelumnya untuk membuka {levelId}.</p>
        </div>
      )}

      {/* Lesson list */}
      {isLevelUnlocked && (
        <div className="space-y-3">
          {levelLessons.map((lesson, idx) => {
            const isUnlocked = unlockedLessons.includes(lesson.id);
            const isCompleted = completedLessons.includes(lesson.id);
            const isCheckpoint = lesson.id.includes('checkpoint');

            return (
              <Link
                key={lesson.id}
                to={isUnlocked ? (isCheckpoint ? `/checkpoint/${lesson.id}` : `/lesson/${lesson.id}`) : ''}
                onClick={(e) => { if (!isUnlocked) e.preventDefault(); }}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border-2 transition-all",
                  isCompleted ? "bg-green-50 border-green-200" :
                  isUnlocked ? "bg-white border-blue-200 hover:border-blue-400 shadow-sm" :
                  "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed",
                  isCheckpoint && "border-amber-200 bg-amber-50/50"
                )}
                aria-disabled={!isUnlocked}
              >
                <div className="flex items-center space-x-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm",
                    isCompleted ? "bg-green-500 text-white" :
                    isUnlocked ? "bg-blue-500 text-white" :
                    "bg-slate-200 text-slate-400",
                    isCheckpoint && "bg-amber-500 text-white"
                  )}>
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> :
                     isUnlocked ? <PlayCircle className="w-5 h-5" /> :
                     <Lock className="w-4 h-4" />}
                  </div>
                  <div>
                    <p className={cn("font-bold", !isUnlocked && "text-slate-400")}>
                      {isCheckpoint ? `Checkpoint ${idx + 1}` : `Pelajaran ${idx + 1}`}
                    </p>
                    <p className={cn("text-sm", isUnlocked ? "text-slate-600" : "text-slate-400")}>
                      {lesson.title}
                    </p>
                  </div>
                </div>
                {isUnlocked && <ChevronRight className="w-5 h-5 text-slate-400" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
