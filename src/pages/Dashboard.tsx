 import { Link } from 'react-router';
 import { useState, useEffect, useMemo } from 'react';
 import type { Level } from '../data/course';
 import { courseIndex } from '../data/lessonIndex';
 import { useProgressStore } from '../stores/progressStore';
 import { useLearningStore } from '../stores/learningStore';
 import { useAuthStore } from '../stores/authStore';
 import { isUserPro } from '../lib/subscription';
 import { CheckCircle2, Lock, PlayCircle, Download, Loader2, Target, BookOpen, Zap, Trophy, ArrowRight, Clock, Flame, Star, Brain, GraduationCap, Sparkles, Medal, TrendingUp, BarChart3, Award } from 'lucide-react';
 import { cn } from '../lib/utils';
 import { Progress } from '../components/ui/progress';
 import { Button } from '../components/ui/button';
import { DashboardSkeleton } from '../components/skeletons/SkeletonPatterns';

export default function Dashboard() {
  const { currentLevel, unlockedLessons, completedLessons, xp, vocab, checkpointProgress, loading, loadProgress } = useProgressStore();
  const { mockTests } = useLearningStore();
  const { user, tierData } = useAuthStore();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (user?.id && !loading) {
      loadProgress(user.id);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <DashboardSkeleton />
      </div>
    );
  }

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

  const streakData = useMemo(() => ({
    current: 3,
    best: 7,
    todayCompleted: 1,
  }), []);

  const learningStats = useMemo(() => ({
    totalVocab: Object.keys(vocab).length,
    exercisesCompleted: completedLessons.length * 12,
    studyHours: Math.round(completedLessons.length * 0.5 * 10) / 10,
    averageScore: mockTests.length > 0 
      ? Math.round(mockTests.reduce((acc, t) => acc + (t.score / t.total) * 100, 0) / mockTests.length)
      : 0,
  }), [vocab, completedLessons, mockTests]);

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

  const [errorMsg, setErrorMsg] = useState("");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  const exportPDF = async () => {
    setErrorMsg("");
    setPdfBlobUrl(null);
    
    if (!isUserPro(tierData)) {
      setErrorMsg("Fitur Export PDF hanya tersedia untuk pengguna Pro.");
      return;
    }
    
    setExporting(true);
    
    const [{ jsPDF }, autoTable] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable').then(m => m.default)
    ]);

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const doc = new jsPDF();
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text("Laporan Pembelajaran DeutschUp", 14, 25);
      
      let yPos = 50;
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("Profil Siswa", 14, yPos);
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPos + 2, 196, yPos + 2);
      
      yPos += 10;
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.text(`Nama: ${user?.user_metadata?.full_name || 'Siswa'}`, 14, yPos);
      doc.text(`Level Saat Ini: ${currentLevel}`, 105, yPos);
      yPos += 8;
      doc.text(`Tanggal Laporan: ${new Date().toLocaleDateString('id-ID')}`, 14, yPos);
      doc.text(`Total XP: ${xp} XP`, 105, yPos);
      yPos += 8;
      doc.text(`Kosakata Dikuasai: ${Object.keys(vocab).length} kata`, 14, yPos);
      doc.text(`Pelajaran Selesai: ${unlockedLessons.length}`, 105, yPos);
      yPos += 20;

      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("Pelajaran & Kompetensi yang Dicapai", 14, yPos);
      doc.line(14, yPos + 2, 196, yPos + 2);
      yPos += 8;
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      const unlockedCourseData = courseIndex.filter(l => unlockedLessons.includes(l.id));
      
      if (unlockedCourseData.length === 0) {
        doc.text("Belum ada pelajaran yang diselesaikan.", 14, yPos + 5);
        yPos += 15;
      } else {
        const tableBody = unlockedCourseData.map((l, index) => {
          const goalsStr = (l.canDoGoals && l.canDoGoals.length > 0) ? "• " + l.canDoGoals.join("\n• ") : "-";
          return [index + 1, l.level, l.title, goalsStr];
        });
        
        autoTable(doc, {
          startY: yPos + 5,
          head: [['No', 'Level', 'Pelajaran', 'Kompetensi']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 15 }, 2: { cellWidth: 45 }, 3: { cellWidth: 110 } },
          styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' }
        });
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      if (yPos > 250) { doc.addPage(); yPos = 20; }

      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("Riwayat Simulasi Ujian", 14, yPos);
      doc.line(14, yPos + 2, 196, yPos + 2);

      if (mockTests && mockTests.length > 0) {
        const tableData = mockTests.map((t, index) => [
          index + 1, new Date(t.createdAt).toLocaleDateString('id-ID'), t.level, `${t.score} / ${t.total}`, `${Math.round((t.score/t.total)*100)}%`
        ]);
        autoTable(doc, { startY: yPos + 8, head: [['No', 'Tanggal', 'Level', 'Skor Benar/Total', 'Persentase']], body: tableData, theme: 'striped', headStyles: { fillColor: [16, 185, 129] }, styles: { fontSize: 10 } });
      } else {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("Belum ada riwayat simulasi ujian.", 14, yPos + 10);
      }

      const pageCount = (doc.internal as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Dicetak melalui DeutschUp - Halaman ${i} dari ${pageCount}`, 14, doc.internal.pageSize.height - 10);
      }

      doc.save(`DeutschUp-Report-${user?.user_metadata?.full_name || 'Student'}.pdf`);
      const pdfBlob = doc.output('blob');
      setPdfBlobUrl(URL.createObjectURL(pdfBlob));
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
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl p-4 font-medium flex items-center justify-between shadow-sm">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="opacity-70 hover:opacity-100 transition-opacity" aria-label="Tutup pesan error">✕</button>
          </div>
        )}

        {/* SECTION A: WELCOME HEADER */}
        <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 p-6 md:p-8 text-white shadow-xl">
          {/* German Flag Stripe */}
          <div className="absolute top-0 left-0 right-0 flex h-1.5">
            <div className="flex-1 bg-[#1F2937]" />
            <div className="flex-1 bg-[#DC2626]" />
            <div className="flex-1 bg-[#F2C94C]" />
          </div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          </div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <p className="text-blue-200 font-medium text-sm md:text-base">
                  {new Date().getHours() < 12 ? '🌅 Selamat Pagi' : new Date().getHours() < 18 ? '☀️ Selamat Siang' : '🌙 Selamat Malam'}, {user?.user_metadata?.full_name?.split(' ')[0] || 'Siswa'}!
                </p>
                <h1 className="text-2xl md:text-4xl font-bold tracking-tight">Learning Command Center</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-sm font-semibold backdrop-blur-sm">
                    <GraduationCap className="w-4 h-4" />
                    Level {currentLevel}
                  </span>
                  {isUserPro(tierData) && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-100 text-sm font-semibold backdrop-blur-sm">
                      <Sparkles className="w-4 h-4" />
                      Pro
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end w-full md:w-auto">
                <Button onClick={exportPDF} disabled={exporting} variant="secondary" className="flex items-center space-x-2 rounded-xl bg-white/15 hover:bg-white/25 text-white border-0 backdrop-blur-sm w-full md:w-auto">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span>{exporting ? 'Menyiapkan...' : 'Unduh Laporan'}</span>
                </Button>
                {!pdfBlobUrl && (
                  <span className="text-[11px] text-blue-200 mt-2 max-w-[200px] text-left md:text-right">
                    *Buka di tab baru jika unduhan tidak muncul
                  </span>
                )}
                {pdfBlobUrl && (
                  <a href={pdfBlobUrl} download={`DeutschUp-Report-${user?.user_metadata?.full_name || 'Student'}.pdf`} className="text-[12px] font-bold text-white mt-2 text-left md:text-right underline underline-offset-2 hover:text-blue-100 transition-colors" aria-label="Unduh laporan PDF secara manual">
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
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-100 dark:border-blue-800 rounded-3xl p-8 text-center">
            <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Selamat Datang di DeutschUp! 🇩🇪</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">Mulai perjalanan belajar bahasa Jermamu dari A1. Selesaikan pelajaran pertama untuk membuka level berikutnya.</p>
            <Link to="/lesson/a1-1">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg shadow-blue-500/25">
                <PlayCircle className="w-5 h-5 mr-2" /> Mulai Pelajaran Pertama
              </Button>
            </Link>
          </div>
        )}

        {/* SECTION B: STATS GRID */}
        {!loading && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20 p-4 md:p-5 flex flex-col backdrop-blur-sm hover:shadow-md transition-shadow">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-amber-500/10 blur-xl" />
              <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center">
                <div className="w-12 h-12 rounded-xl bg-amber-500/15 flex items-center justify-center mb-2">
                  <Zap className="w-6 h-6 text-amber-500" />
                </div>
                <span className="text-2xl md:text-3xl font-black text-amber-500">{xp}</span>
                <span className="text-[10px] md:text-xs font-bold text-amber-600/80 uppercase tracking-wider mt-1">Total XP</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 p-4 md:p-5 flex flex-col backdrop-blur-sm hover:shadow-md transition-shadow">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-blue-500/10 blur-xl" />
              <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center">
                <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex items-center justify-center mb-2">
                  <BookOpen className="w-6 h-6 text-blue-500" />
                </div>
                <span className="text-2xl md:text-3xl font-black text-blue-500">{learningStats.totalVocab}</span>
                <span className="text-[10px] md:text-xs font-bold text-blue-600/80 uppercase tracking-wider mt-1">Kosakata</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 p-4 md:p-5 flex flex-col backdrop-blur-sm hover:shadow-md transition-shadow">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-green-500/10 blur-xl" />
              <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center">
                <div className="w-12 h-12 rounded-xl bg-green-500/15 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <span className="text-2xl md:text-3xl font-black text-green-500">{completedLessons.length}</span>
                <span className="text-[10px] md:text-xs font-bold text-green-600/80 uppercase tracking-wider mt-1">Selesai</span>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 p-4 md:p-5 flex flex-col backdrop-blur-sm hover:shadow-md transition-shadow">
              <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-purple-500/10 blur-xl" />
              <div className="relative z-10 flex flex-col items-center text-center flex-1 justify-center">
                <div className="w-12 h-12 rounded-xl bg-purple-500/15 flex items-center justify-center mb-2">
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-purple-700 p-6 md:p-8 text-white shadow-xl shadow-purple-500/20 hover:shadow-2xl transition-shadow">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-white/30 blur-3xl" />
              <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-white/20 blur-2xl" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-3">
                <Zap className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-bold uppercase tracking-wider text-blue-200">Lanjutkan Belajar</span>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl md:text-2xl font-bold">{currentLesson.title}</h3>
                  <p className="text-blue-200 text-sm">Level {currentLesson.level} • Pelajaran {courseIndex.findIndex(l => l.id === currentLesson.id) + 1} dari {courseIndex.length}</p>
                </div>
                <Link to={`/lesson/${currentLesson.id}`}>
                  <Button className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold shadow-lg shadow-white/20 transition-all hover:scale-105">
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
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-orange-500/10 border border-orange-500/20 p-5 md:p-6">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-orange-500/10 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4">
                  <Flame className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold text-foreground">Streak Belajar</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-orange-500">{streakData.current}</span>
                      <span className="text-sm font-medium text-muted-foreground">hari</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Hari berturut-turut</p>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center justify-end gap-1.5">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-bold text-muted-foreground">Best: {streakData.best}</span>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5, 6, 7].map(day => (
                        <div key={day} className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold", day <= streakData.current ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground")}>
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-indigo-500/10 border border-indigo-500/20 p-5 md:p-6">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-indigo-500/10 blur-2xl" />
              <div className="relative z-10">
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="w-6 h-6 text-indigo-500" />
                  <h3 className="text-lg font-bold text-foreground">Statistik Belajar</h3>
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
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/5 via-yellow-500/5 to-amber-500/5 border border-amber-500/20 p-5 md:p-6">
            <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center space-x-2 mb-4">
                <Award className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-bold text-foreground">Pencapaian</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {achievements.map(achievement => {
                  const Icon = achievement.icon;
                  return (
                    <div key={achievement.id} className={cn("flex flex-col items-center text-center p-4 rounded-2xl border transition-all", achievement.unlocked ? "bg-card border-amber-500/30 shadow-sm" : "bg-muted/50 border-border opacity-60")}>
                      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-2", achievement.unlocked ? "bg-amber-500/10" : "bg-muted")}>
                        <Icon className={cn("w-6 h-6", achievement.unlocked ? achievement.color : "text-muted-foreground")} />
                      </div>
                      <p className="text-sm font-bold text-foreground">{achievement.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{achievement.description}</p>
                      {achievement.unlocked && <span className="mt-2 text-[10px] font-bold text-amber-500 uppercase tracking-wider">Terbuka</span>}
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
              const tierLocked = !isUserPro(tierData) && lvl.id !== 'A1';
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
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm transition-transform hover:scale-105", lvl.color)}>
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
                            "flex flex-col p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden",
                            isCompleted ? "bg-muted border-border hover:border-border" :
                            isUnlocked ? "bg-card border-blue-500/50 shadow-md hover:-translate-y-1" :
                            "bg-muted border-border opacity-60 cursor-not-allowed"
                          )}
                          aria-label={`Pelajaran: ${lesson.title}${isCompleted ? ' (selesai)' : isUnlocked ? '' : ' (terkunci)'}`}
                          aria-disabled={!isUnlocked}
                        >
                          <div className="absolute top-0 left-0 w-full h-1.5 bg-muted">
                             <div className={cn("h-full transition-all duration-500", isCompleted ? "bg-green-500" : isUnlocked ? "bg-blue-500" : "")} style={{ width: isCompleted ? '100%' : '0%' }} />
                          </div>
                          <div className="flex justify-between items-start mb-4 mt-2">
                            <span className="text-xs font-bold px-2 py-1 bg-muted rounded-md text-muted-foreground uppercase tracking-widest">Pelajaran {idx + 1}</span>
                            {isCompleted ? <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 ml-2" /> : isUnlocked ? <PlayCircle className="w-6 h-6 text-blue-500 flex-shrink-0 ml-2" /> : <Lock className="w-5 h-5 text-slate-300 flex-shrink-0 ml-2" />}
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
                              <div className="flex items-center text-sm font-bold text-slate-400">
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
