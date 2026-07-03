 import { Link } from 'react-router';
 import { useState, useEffect, useMemo } from 'react';
 import type { Level } from '../data/course';
 import { courseIndex } from '../data/lessonIndex';
 import { useProgressStore } from '../stores/progressStore';
 import { useLearningStore } from '../stores/learningStore';
 import { useAuthStore } from '../stores/authStore';
 import { isUserPro } from '../lib/subscription';
import { generateReportPDF } from '../lib/pdf-report';
import { supabase } from '../lib/supabase';
import { resolveInternalId } from '../lib/clerk/identity';
 import { CheckCircle2, Lock, PlayCircle, Download, Loader2, Target, BookOpen, Zap, Trophy, ArrowRight, Clock, Flame, Star, Brain, GraduationCap, Sparkles, Medal, TrendingUp, BarChart3, Award } from 'lucide-react';
 import { cn } from '../lib/utils';
 import { Progress } from '../components/ui/progress';
 import { Button } from '../components/ui/button';
import { DashboardSkeleton } from '../components/skeletons/SkeletonPatterns';

export default function Dashboard() {
  const { currentLevel, unlockedLessons, completedLessons, xp, vocab, checkpointProgress, loading, loadProgress, streak, lastPracticeDate } = useProgressStore();
  const { mockTests } = useLearningStore();
  const { user, tierData, profileData } = useAuthStore();
  const role = tierData?.role || profileData?.role;
  const [exporting, setExporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && !loading) {
      loadProgress(user.id);
    }
  }, [user?.id]);

  const currentLesson = useMemo(() => {
    const lastUnlocked = [...unlockedLessons].reverse().find(id => !completedLessons.includes(id));
    return lastUnlocked ? courseIndex.find(l => l.id === lastUnlocked) : null;
  }, [unlockedLessons, completedLessons]);

  const nextLesson = useMemo(() => {
    if (!currentLesson) return null;
    const idx = courseIndex.findIndex(l => l.id === currentLesson.id);
    return idx >= 0 && idx < courseIndex.length - 1 ? courseIndex[idx + 1] : null;
  }, [currentLesson]);

  const checkpointStats = useMemo(() => {
    const total = checkpointProgress.length;
    const passed = checkpointProgress.filter(c => c.passed).length;
    const available = courseIndex.filter(l => l.id.includes('checkpoint')).length - total;
    return { total, passed, available: Math.max(0, available) };
  }, [checkpointProgress]);

  const todayTask = useMemo(() => {
    const incomplete = courseIndex.filter(l => !completedLessons.includes(l.id) && unlockedLessons.includes(l.id));
    return incomplete.length > 0 ? incomplete[0] : null;
  }, [completedLessons, unlockedLessons]);

  const overallProgress = useMemo(() => {
    if (courseIndex.length === 0) return 0;
    return Math.round((completedLessons.length / courseIndex.length) * 100);
  }, [completedLessons]);

  const streakData = useMemo(() => {
    // Best streak: persist in localStorage, update when current exceeds
    const bestKey = 'deutschup_best_streak';
    const stored = parseInt(localStorage.getItem(bestKey) || '0', 10);
    const best = Math.max(stored, streak);
    if (streak > stored) localStorage.setItem(bestKey, String(streak));

    // Today completed: check if lastPracticeDate is today
    const today = new Date().toISOString().split('T')[0];
    const todayCompleted = lastPracticeDate === today ? 1 : 0;

    return { current: streak, best, todayCompleted };
  }, [streak, lastPracticeDate]);

  const [studyStats, setStudyStats] = useState({ totalSeconds: 0, sessionCount: 0 });

  // Fetch real study time from DB
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      const internalId = await resolveInternalId(user.id);
      if (!internalId || cancelled) return;
      const { data, error } = await supabase
        .rpc('get_study_time', { p_user_id: internalId });
      if (error || !data || cancelled) return;
      setStudyStats({
        totalSeconds: Number(data[0]?.total_seconds || 0),
        sessionCount: 0,
      });
      // Also get session count (= exercises completed)
      const { count, error: cntErr } = await supabase
        .from('study_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', internalId)
        .gt('duration_seconds', 0);
      if (!cntErr && !cancelled) {
        setStudyStats(prev => ({ ...prev, sessionCount: count || 0 }));
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  const learningStats = useMemo(() => ({
    totalVocab: Object.keys(vocab).length,
    exercisesCompleted: studyStats.sessionCount || completedLessons.length * 12,
    studyHours: Math.round((studyStats.totalSeconds / 3600) * 10) / 10,
    averageScore: mockTests.length > 0 
      ? Math.round(mockTests.reduce((acc, t) => acc + (t.score / t.total) * 100, 0) / mockTests.length)
      : 0,
  }), [vocab, completedLessons, mockTests, studyStats]);

  const achievements = useMemo(() => [
    { id: 'first-lesson', title: 'Pelajaran Pertama', description: 'Selesaikan pelajaran pertama', icon: Star, unlocked: completedLessons.length > 0, color: 'text-yellow-500' },
    { id: 'vocabulary-50', title: 'Kolektor Kata', description: 'Kuasai 50 kosakata', icon: BookOpen, unlocked: learningStats.totalVocab >= 50, color: 'text-blue-500' },
    { id: 'streak-7', title: 'Konsisten', description: '7 hari belajar berturut-turut', icon: Flame, unlocked: streakData.best >= 7, color: 'text-orange-500' },
    { id: 'checkpoint-master', title: 'Master Checkpoint', description: 'Lulus 5 checkpoint', icon: Trophy, unlocked: checkpointStats.passed >= 5, color: 'text-purple-500' },
    { id: 'level-a2', title: 'Level A2', description: 'Capai level A2', icon: GraduationCap, unlocked: currentLevel !== 'A1', color: 'text-emerald-500' },
  ], [completedLessons, learningStats.totalVocab, streakData.best, checkpointStats.passed, currentLevel]);

  const levels: { id: Level, title: string, color: string }[] = [
    { id: 'A1', title: 'Pemula A1', color: 'bg-emerald-500' },
    { id: 'A2', title: 'Dasar A2', color: 'bg-teal-500' },
    { id: 'B1', title: 'Menengah B1', color: 'bg-blue-500' },
    { id: 'B2', title: 'Mahir B2', color: 'bg-indigo-500' },
  ];

  const levelIndexMap = { 'A1': 0, 'A2': 1, 'B1': 2, 'B2': 3 };
  const userLevelIndex = levelIndexMap[currentLevel];

  // SHOW SKELETON AFTER ALL HOOKS (Rules of Hooks compliance)
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  const exportPDF = async () => {
    setErrorMsg("");
    setPdfBlobUrl(null);
    
    if (!isUserPro(tierData, role)) {
      setErrorMsg("Fitur Export PDF hanya tersedia untuk pengguna Pro.");
      return;
    }
    
    setExporting(true);
    
    try {
      const blob = await generateReportPDF({
        userName: user?.user_metadata?.full_name || 'Siswa',
        currentLevel: currentLevel,
        xp: xp,
        vocabCount: Object.keys(vocab).length,
        completedCount: completedLessons.length,
        totalLessons: courseIndex.length,
        overallProgress: overallProgress,
        streak: streakData.current,
        studyHours: learningStats.studyHours,
        averageScore: learningStats.averageScore,
        lessons: courseIndex.map(l => ({
          level: l.level || 'A1',
          title: l.title || l.id,
          goals: l.canDoGoals || [],
          completed: completedLessons.includes(l.id),
        })),
        mockTests: (mockTests || []).map(t => ({
          createdAt: t.createdAt,
          level: t.level,
          score: t.score,
          total: t.total,
        })),
      });

      const pdfUrl = URL.createObjectURL(blob);
      setPdfBlobUrl(pdfUrl);
      // Auto-download
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = `DeutschUp-Report-${user?.user_metadata?.full_name || 'Student'}.pdf`;
      a.click();
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Gagal membuat PDF: " + (e.message || "Error tidak diketahui"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
        {errorMsg && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive  p-4 font-medium flex items-center justify-between ">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Tutup pesan error">✕</button>
          </div>
        )}

        {/* SECTION A: WELCOME HEADER */}
        <header className="relative overflow-hidden bg-[#0a0a0a] p-6 md:p-8 rounded-lg">
          {/* German flag accent */}
          <div className="absolute top-0 left-0 right-0 h-1 flex">
            <div className="flex-1 bg-[#0a0a0a]/70" />
            <div className="flex-1 bg-red-500" />
            <div className="flex-1 bg-amber-400" />
          </div>
          {/* Ambient glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-400/8  blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-60 h-60 bg-blue-400/5  blur-2xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <p className="text-blue-200 font-medium text-sm md:text-base">
                  {new Date().getHours() < 12 ? '🌅 Selamat Pagi' : new Date().getHours() < 18 ? '☀️ Selamat Siang' : '🌙 Selamat Malam'}, {user?.user_metadata?.full_name?.split(' ')[0] || 'Siswa'}!
                </p>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-[#f5f0eb]">Learning Command Center</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1  bg-[#f5f0eb]/15 text-sm font-semibold ">
                    <GraduationCap className="w-4 h-4" />
                    Level {currentLevel}
                  </span>
                  {isUserPro(tierData, role) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1  bg-amber-400/20 text-amber-100 text-sm font-semibold ">
                      <Sparkles className="w-4 h-4" />
                      Pro
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                <Button onClick={exportPDF} disabled={exporting} variant="secondary" className="flex items-center space-x-2  bg-[#f5f0eb]/15 hover:bg-[#f5f0eb]/25 border-0 text-[#f5f0eb]  w-full md:w-auto">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{exporting ? 'Menyiapkan...' : 'Unduh Laporan'}</span>
                </Button>
                {!pdfBlobUrl && (
                  <span className="text-[11px] text-blue-200 mt-2 max-w-[200px] text-left md:text-right">
                    *Buka di tab baru jika unduhan tidak muncul
                  </span>
                )}
                {pdfBlobUrl && (
                  <a href={pdfBlobUrl} download={`DeutschUp-Report-${user?.user_metadata?.full_name || 'Student'}.pdf`} className="text-[12px] font-bold text-[#f5f0eb] mt-2 text-left md:text-right underline underline-offset-2 hover:text-blue-100 transition-colors" aria-label="Unduh laporan PDF secara manual">
                    Klik di sini untuk mengunduh manual ➔
                  </a>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* LOADING STATE */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
            <span className="text-muted-foreground font-medium">Memuat progres belajar...</span>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && completedLessons.length === 0 && (
          <div className="glass-card rounded-lg p-8 text-center">
            <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Selamat Datang di DeutschUp! 🇩🇪</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Mulai perjalanan belajar bahasa Jermamu dari A1. Selesaikan pelajaran pertama untuk membuka level berikutnya.</p>
            <div className="flex justify-center">
              <Link to="/lesson/a1-1">
                <Button className="bg-[#8b2500] hover:bg-[#8b2500]/90 text-[#f5f0eb] px-8 py-3 font-bold text-lg">
                  <PlayCircle className="w-5 h-5 mr-2" /> Mulai Pelajaran Pertama
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* SECTION B: STATS GRID */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

            <div className="relative overflow-hidden  glass-card rounded-lg p-4 md:p-5 flex flex-col card-hover">
              <div className="absolute -right-4 -bottom-4 w-20 h-20  bg-amber-400/10 blur-xl" />
              <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center">
                <div className="w-11 h-11  bg-[#c8956c] flex items-center justify-center mb-2.5  ">
                  <Zap className="w-5 h-5 text-[#f5f0eb]" />
                </div>
                <span className="text-2xl md:text-3xl font-black text-[#0a0a0a]">{xp}</span>
                <span className="text-[10px] md:text-xs font-bold text-[#0a0a0a]/50 uppercase tracking-wider mt-1">Total XP</span>
              </div>
            </div>
            <div className="relative overflow-hidden  glass-card rounded-lg p-4 md:p-5 flex flex-col card-hover">
              <div className="absolute -right-4 -bottom-4 w-20 h-20  bg-blue-400/10 blur-xl" />
              <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center">
                <div className="w-11 h-11 bg-[#0a0a0a] flex items-center justify-center mb-2.5">
                  <BookOpen className="w-5 h-5 text-[#f5f0eb]" />
                </div>
                <span className="text-2xl md:text-3xl font-black text-[#0a0a0a]">{learningStats.totalVocab}</span>
                <span className="text-[10px] md:text-xs font-bold text-[#0a0a0a]/50 uppercase tracking-wider mt-1">Kosakata</span>
              </div>
            </div>
            <div className="relative overflow-hidden  glass-card rounded-lg p-4 md:p-5 flex flex-col card-hover">
              <div className="absolute -right-4 -bottom-4 w-20 h-20  bg-emerald-400/10 blur-xl" />
              <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center">
                <div className="w-11 h-11 bg-[#0a0a0a] flex items-center justify-center mb-2.5">
                  <CheckCircle2 className="w-5 h-5 text-[#f5f0eb]" />
                </div>
                <span className="text-2xl md:text-3xl font-black text-green-500">{completedLessons.length}</span>
                <span className="text-[10px] md:text-xs font-bold text-green-600/80 uppercase tracking-wider mt-1">Selesai</span>
              </div>
            </div>
            <div className="relative overflow-hidden  bg-[#f5f0eb] border border-purple-500/20 rounded-lg p-4 md:p-5 flex flex-col">
              <div className="absolute -right-4 -bottom-4 w-20 h-20  bg-purple-500/10 blur-xl" />
              <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center">
                <div className="w-12 h-12  bg-purple-500/15 flex items-center justify-center mb-2">
                  <TrendingUp className="w-6 h-6 text-purple-500" />
                </div>
                <span className="text-2xl md:text-3xl font-black text-purple-500">{overallProgress}%</span>
                <span className="text-[10px] md:text-xs font-bold text-purple-600/80 uppercase tracking-wider mt-1">Progres</span>
              </div>
            </div>
          </div>
        )}


        {/* SECTION C: CONTINUE LEARNING */}
        {!loading && currentLesson && (
          <div className="relative overflow-hidden  bg-[#0a0a0a] p-6 md:p-8 rounded-lg">
            {/* German flag accent */}
            <div className="absolute top-0 left-0 right-0 h-1 flex">
              <div className="flex-1 bg-[#0a0a0a]/70" />
              <div className="flex-1 bg-red-500" />
              <div className="flex-1 bg-amber-400" />
            </div>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -right-16 -top-16 w-60 h-60 bg-amber-400/8  blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-40 h-40 bg-blue-400/5  blur-2xl" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <div className="w-6 h-6  bg-amber-400 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-[#0a0a0a]" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider text-amber-300">Lanjutkan Belajar</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold text-[#f5f0eb]">{currentLesson.title}</h3>
                  <p className="text-[#f5f0eb]/60 text-sm">Level {currentLesson.level} • Pelajaran {courseIndex.findIndex(l => l.id === currentLesson.id) + 1} dari {courseIndex.length}</p>
                </div>
                <Link to={`/lesson/${currentLesson.id}`}>
                  <Button className="bg-[#c8956c] hover:bg-[#b8854c] text-[#0a0a0a] px-6 py-3 font-bold transition-all hover:scale-105">
                    <PlayCircle className="w-5 h-5 mr-2" /> Lanjutkan Sekarang
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}


        {/* SECTION D: GAMIFICATION */}
        {!loading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="relative overflow-hidden  glass-card rounded-lg p-5 md:p-6 card-hover">
              <div className="absolute -right-8 -top-8 w-32 h-32  bg-orange-400/8 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-9 h-9  bg-[#8b2500] flex items-center justify-center  ">
                    <Flame className="w-5 h-5 text-[#f5f0eb]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0a0a0a]">Streak Belajar</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-orange-500">{streakData.current}</span>
                      <span className="text-sm font-medium text-[#0a0a0a]/50">hari</span>
                    </div>
                    <p className="text-sm text-[#0a0a0a]/50">Hari berturut-turut</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-[#0a0a0a]/50">Best: {streakData.best}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7].map(day => (
                        <div key={day} className={cn("w-6 h-6  flex items-center justify-center text-[10px] font-bold", day <= streakData.current ? "bg-[#8b2500] text-[#f5f0eb] " : "bg-[#0a0a0a]/5 text-[#0a0a0a]/40")}>
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden  glass-card rounded-lg p-5 md:p-6 card-hover">
              <div className="absolute -right-8 -top-8 w-32 h-32  bg-indigo-400/8 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-9 h-9  bg-[#0a0a0a] flex items-center justify-center  ">
                    <BarChart3 className="w-5 h-5 text-[#f5f0eb]" />
                  </div>
                  <h3 className="text-lg font-bold text-[#0a0a0a]">Statistik Belajar</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground"><Clock className="w-4 h-4" /><span className="text-xs font-medium">Waktu Belajar</span></div>
                    <p className="text-xl font-bold text-foreground">{learningStats.studyHours} jam</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground"><Brain className="w-4 h-4" /><span className="text-xs font-medium">Latihan Selesai</span></div>
                    <p className="text-xl font-bold text-foreground">{learningStats.exercisesCompleted}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground"><Target className="w-4 h-4" /><span className="text-xs font-medium">Rata-rata Skor</span></div>
                    <p className="text-xl font-bold text-foreground">{learningStats.averageScore}%</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-muted-foreground"><Medal className="w-4 h-4" /><span className="text-xs font-medium">Checkpoint</span></div>
                    <p className="text-xl font-bold text-foreground">{checkpointStats.passed}/{checkpointStats.total + checkpointStats.available}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* SECTION E: ACHIEVEMENTS */}
        {!loading && achievements.length > 0 && (
          <div className="relative overflow-hidden  glass-card rounded-lg p-5 md:p-6">
            <div className="absolute -right-8 -top-8 w-32 h-32  bg-amber-400/8 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-5">
                <div className="w-9 h-9  bg-[#c8956c] flex items-center justify-center  ">
                  <Award className="w-5 h-5 text-[#f5f0eb]" />
                </div>
                <h3 className="text-lg font-bold text-[#0a0a0a]">Pencapaian</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {achievements.map(achievement => {
                  const Icon = achievement.icon;
                  return (
                    <div key={achievement.id} className={cn("flex flex-col items-center text-center p-4 border transition-all card-hover rounded-md", achievement.unlocked ? "bg-[#f5f0eb] border border-[#0a0a0a]/10 border-amber-200/40" : "bg-[#f5f0eb] border-[#0a0a0a]/10 opacity-50")}>
                      <div className={cn("w-12 h-12  flex items-center justify-center mb-2", achievement.unlocked ? "bg-[#c8956c]  " : "bg-[#0a0a0a]/5")}>
                        <Icon className={cn("w-6 h-6", achievement.unlocked ? "text-[#f5f0eb]" : "text-[#0a0a0a]/40")} />
                      </div>
                      <p className="text-sm font-bold text-[#0a0a0a]">{achievement.title}</p>
                      <p className="text-[10px] text-[#0a0a0a]/50 mt-1">{achievement.description}</p>
                      {achievement.unlocked && <span className="mt-2 text-[10px] font-bold text-amber-600 uppercase tracking-wider">Terbuka</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}


        {/* SECTION F: LEVELS & LESSONS */}
        {!loading && (
          <div className="space-y-12 md:space-y-16">
            {levels.map((lvl, index) => {
              const tierLocked = !isUserPro(tierData, role) && lvl.id !== 'A1';
              const isLevelUnlocked = index <= userLevelIndex && !tierLocked;
              const levelColors: Record<string, string> = { A1: 'emerald', A2: 'teal', B1: 'blue', B2: 'indigo' };
              const levelLessons = courseIndex.filter(l => l.level === lvl.id);
              const actualCompletedInLevel = levelLessons.filter(l => completedLessons.includes(l.id)).length;
              const isLevelCompleted = actualCompletedInLevel === levelLessons.length && userLevelIndex >= index;
              
              let progressPercent = 0;
              if (isLevelCompleted) progressPercent = 100;
              else if (isLevelUnlocked && levelLessons.length > 0) progressPercent = Math.max(0, (actualCompletedInLevel / levelLessons.length) * 100);

              return (
                <div key={lvl.id} className={cn("relative pl-4 border-l-4", !isLevelUnlocked && "opacity-50 grayscale", lvl.id === 'A1' && 'border-emerald-500', lvl.id === 'A2' && 'border-teal-500', lvl.id === 'B1' && 'border-blue-500', lvl.id === 'B2' && 'border-indigo-500')}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                      <Link to={isLevelUnlocked ? `/level/${lvl.id}` : '#'}>
                        <div className={cn("w-14 h-14  flex items-center justify-center bg-[#0a0a0a] text-[#f5f0eb] font-bold text-2xl  transition-transform hover:scale-105", lvl.color)}>
                          {lvl.id}
                        </div>
                      </Link>
                      <div>
                        <Link to={isLevelUnlocked ? `/level/${lvl.id}` : '#'} className="hover:underline">
                          <h2 className="text-2xl font-bold">{lvl.title}</h2>
                        </Link>
                        {tierLocked ? (
                           <p className="text-amber-500 font-bold flex items-center space-x-1">
                             <Lock className="w-4 h-4 mr-1" /> Premium Only 
                             <Link to="/pricing" className="ml-2 underline text-sm text-blue-600 font-semibold" aria-label="Upgrade ke Premium">Upgrade</Link>
                           </p>
                        ) : isLevelUnlocked ? (
                           <p className="text-muted-foreground font-medium">Terbuka • {levelLessons.length} Pelajaran</p>
                        ) : (
                           <p className="text-muted-foreground font-medium flex items-center space-x-1"><Lock className="w-4 h-4" /> <span>Terkunci</span></p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <Progress value={progressPercent} className="h-3 mb-8 bg-muted" />

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {levelLessons.map((lesson, idx) => {
                      const isUnlocked = unlockedLessons.includes(lesson.id) && !tierLocked;
                      const isCompleted = completedLessons.includes(lesson.id);
                      
                      return (
                        <Link 
                          key={lesson.id} 
                          to={isUnlocked ? `/lesson/${lesson.id}` : ''}
                          onClick={(e) => { if (!isUnlocked) e.preventDefault(); }}
                          className={cn(
                            "flex flex-col p-5 border transition-all duration-200 relative overflow-hidden card-hover rounded-lg",
                            isCompleted ? "bg-[#f5f0eb] border border-[#0a0a0a]/10 border-emerald-200/40" :
                            isUnlocked ? "glass-card border-blue-200/40  " :
                            "bg-[#f5f0eb] border-[#0a0a0a]/10 opacity-50 cursor-not-allowed"
                          )}
                          aria-label={`Pelajaran: ${lesson.title}${isCompleted ? ' (selesai)' : isUnlocked ? '' : ' (terkunci)'}`}
                          aria-disabled={!isUnlocked}
                        >
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
                             <div className={cn("h-full transition-all duration-500", isCompleted ? "bg-green-500" : isUnlocked ? "bg-blue-500" : "")} style={{ width: isCompleted ? '100%' : '0%' }} />
                          </div>
                          <div className="flex justify-between items-start mb-4 mt-2">
                            <span className="text-xs font-bold px-2 py-1 bg-muted  text-muted-foreground uppercase tracking-widest">Pelajaran {idx + 1}</span>
                            {isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 ml-2" /> : isUnlocked ? <PlayCircle className="w-6 h-6 text-blue-500 flex-shrink-0 ml-2" /> : <Lock className="w-5 h-5 text-[#0a0a0a]/30 flex-shrink-0 ml-2" />}
                          </div>
                          <h3 className={cn("text-lg font-bold mb-4", !isUnlocked && "text-muted-foreground")}>{lesson.title}</h3>
                          
                          {lesson.canDoGoals && lesson.canDoGoals.length > 0 && (
                            <div className="mb-4">
                              <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider mb-2">Setelah Pelajaran Ini, Kamu Bisa:</p>
                              <ul className="space-y-1.5">
                                {lesson.canDoGoals.slice(0, 3).map((goal, i) => (
                                  <li key={i} className="flex items-start text-sm text-muted-foreground">
                                    <CheckCircle2 className="w-3 h-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                    <span className="line-clamp-2">{goal}</span>
                                  </li>
                                ))}
                                {lesson.canDoGoals.length > 3 && (
                                  <li className="text-xs pt-1 opacity-70 italic font-medium ml-3">+ {lesson.canDoGoals.length - 3} materi lainnya...</li>
                                )}
                              </ul>
                            </div>
                          )}
                          
                          <div className="mt-auto pt-4">
                            {isCompleted ? (
                              <div className="flex items-center text-sm font-bold text-green-600">
                                <CheckCircle2 className="w-4 h-4 mr-2" /> Selesai
                              </div>
                            ) : isUnlocked ? (
                              <div className="flex items-center text-sm font-bold text-blue-600">
                                <ArrowRight className="w-4 h-4 mr-2" /> Mulai Pelajaran
                              </div>
                            ) : (
                              <div className="flex items-center text-sm font-bold text-[#0a0a0a]/40">
                                <Lock className="w-4 h-4 mr-2" /> Terkunci
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
