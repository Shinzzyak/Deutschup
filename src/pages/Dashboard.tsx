import { Link } from 'react-router';
import { useState, useEffect, useMemo } from 'react';
import type { Level } from '../data/course';
import { courseIndex } from '../data/lessonIndex';
import { useProgressStore } from '../stores/progressStore';
import { useLearningStore } from '../stores/learningStore';
import { useTheme } from "../hooks/useTheme";
import { useAuthStore } from '../stores/authStore';
import { isUserPro } from '../lib/subscription';
import { CheckCircle2, Lock, PlayCircle, Download, Loader2, Target, BookOpen, Zap, Trophy, ArrowRight, Clock } from 'lucide-react';
import { cn } from '../lib/utils';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';

export default function Dashboard() {
  const { currentLevel, unlockedLessons, completedLessons, xp, vocab, checkpointProgress, loading, loadProgress } = useProgressStore();
  const { mockTests } = useLearningStore();
  const { user, tierData } = useAuthStore();
  const [exporting, setExporting] = useState(false);

  // Load progress on mount
  useEffect(() => {
    if (user?.id && !loading) {
      loadProgress(user.id);
    }
  }, [user?.id]);

  // Find current lesson (last unlocked but not completed)
  const currentLesson = useMemo(() => {
    const lastUnlocked = [...unlockedLessons].reverse().find(id => !completedLessons.includes(id));
    return lastUnlocked ? courseIndex.find(l => l.id === lastUnlocked) : null;
  }, [unlockedLessons, completedLessons]);

  // Find next lesson to unlock
  const nextLesson = useMemo(() => {
    if (!currentLesson) return null;
    const idx = courseIndex.findIndex(l => l.id === currentLesson.id);
    return idx >= 0 && idx < courseIndex.length - 1 ? courseIndex[idx + 1] : null;
  }, [currentLesson]);

  // Checkpoint stats
  const checkpointStats = useMemo(() => {
    const total = checkpointProgress.length;
    const passed = checkpointProgress.filter(c => c.passed).length;
    const available = courseIndex.filter(l => l.id.includes('checkpoint')).length - total;
    return { total, passed, available: Math.max(0, available) };
  }, [checkpointProgress]);

  // Today's tasks: recommend next incomplete lesson
  const todayTask = useMemo(() => {
    const incomplete = courseIndex.filter(l => !completedLessons.includes(l.id) && unlockedLessons.includes(l.id));
    return incomplete.length > 0 ? incomplete[0] : null;
  }, [completedLessons, unlockedLessons]);

  // Overall progress percentage
  const overallProgress = useMemo(() => {
    if (courseIndex.length === 0) return 0;
    return Math.round((completedLessons.length / courseIndex.length) * 100);
  }, [completedLessons]);

  const levels: { id: Level, title: string, color: string }[] = [
    { id: 'A1', title: 'Pemula A1', color: 'bg-green-500' },
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
    
    // Lazy-load PDF libraries (saves ~340KB on initial page load)
    const [{ jsPDF }, autoTable] = await Promise.all([
      import('jspdf'),
      import('jspdf-autotable').then(m => m.default)
    ]);

    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const doc = new jsPDF();
      
      // Header Background
      doc.setFillColor(30, 58, 138); // blue-900
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text("Laporan Pembelajaran DeutschUp", 14, 25);
      
      let yPos = 50;
      
      // Personal Info
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

      // Completed Lessons and Competencies
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
          const goalsStr = (l.canDoGoals && l.canDoGoals.length > 0) 
            ? "• " + l.canDoGoals.join("\n• ") 
            : "-";
          return [index + 1, l.level, l.title, goalsStr];
        });
        
        autoTable(doc, {
          startY: yPos + 5,
          head: [['No', 'Level', 'Pelajaran', 'Kompetensi']],
          body: tableBody,
          theme: 'grid',
          headStyles: { fillColor: [30, 64, 175], textColor: [255, 255, 255], fontStyle: 'bold' },
          columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 15 },
            2: { cellWidth: 45 },
            3: { cellWidth: 110 }
          },
          styles: { fontSize: 9, cellPadding: 3, overflow: 'linebreak' },
          willDrawCell: function (data) {
             if (data.row.section === 'body' && data.column.index === 3) {
                 // You can customize cells conditionally if needed
             }
          }
        });
        
        yPos = (doc as any).lastAutoTable.finalY + 15;
      }

      // Check if we need a new page
      if (yPos > 250) {
         doc.addPage();
         yPos = 20;
      }

      // Mock Test History
      doc.setFontSize(14);
      doc.setTextColor(30, 58, 138);
      doc.text("Riwayat Simulasi Ujian", 14, yPos);
      doc.line(14, yPos + 2, 196, yPos + 2);

      if (mockTests && mockTests.length > 0) {
        const tableData = mockTests.map((t, index) => [
          index + 1,
          new Date(t.createdAt).toLocaleDateString('id-ID'),
          t.level,
          `${t.score} / ${t.total}`,
          `${Math.round((t.score/t.total)*100)}%`
        ]);
        autoTable(doc, {
          startY: yPos + 8,
          head: [['No', 'Tanggal', 'Level', 'Skor Benar/Total', 'Persentase']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [16, 185, 129] }, // Emerald-500 for tests
          styles: { fontSize: 10 }
        });
      } else {
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text("Belum ada riwayat simulasi ujian.", 14, yPos + 10);
      }

      // Footer
      const pageCount = (doc.internal as any).getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Dicetak melalui DeutschUp - Halaman ${i} dari ${pageCount}`, 14, doc.internal.pageSize.height - 10);
      }

      doc.save(`DeutschUp-Report-${user?.user_metadata?.full_name || 'Student'}.pdf`);
      
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(blobUrl);
    } catch (e: any) {
      console.error(e);
      setErrorMsg("Gagal membuat PDF: " + (e.message || "Error tidak diketahui"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 rounded-lg p-4 font-medium flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg("")} className="opacity-70 hover:opacity-100" aria-label="Tutup pesan error">✕</button>
        </div>
      )}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-800 dark:text-white">Peta Pembelajaran</h1>
          <p className="text-slate-500 text-lg md:text-xl dark:text-slate-400">Lanjutkan perjalanan belajarmu dari A1 hingga B2.</p>
        </div>
        <div className="flex flex-col items-start md:items-end w-full md:w-auto">
          <Button onClick={exportPDF} disabled={exporting} variant="outline" className="flex items-center space-x-2 rounded-xl dark:border-slate-700 dark:text-slate-300 w-full md:w-auto">
            {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
            <span>{exporting ? 'Menyiapkan...' : 'Unduh Laporan PDF'}</span>
          </Button>
          {!pdfBlobUrl && (
            <span className="text-[11px] text-slate-400 mt-2 max-w-[200px] text-left md:text-right">
              *Buka aplikasi di <b>tab/jendela baru</b> jika unduhan tidak muncul.
            </span>
          )}
          {pdfBlobUrl && (
            <a href={pdfBlobUrl} download={`DeutschUp-Report-${user?.user_metadata?.full_name || 'Student'}.pdf`} className="text-[12px] font-bold text-indigo-500 mt-2 text-left md:text-right underline" aria-label="Unduh laporan PDF secara manual">
              Klik di sini untuk mengunduh manual ➔
            </a>
          )}
        </div>
      </div>

      {/* LOADING STATE */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
          <span className="text-slate-500 font-medium">Memuat progres belajar...</span>
        </div>
      )}

      {/* EMPTY STATE — new user */}
      {!loading && completedLessons.length === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-3xl p-8 text-center">
          <BookOpen className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Selamat Datang di DeutschUp! 🇩🇪</h2>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">Mulai perjalanan belajar bahasa Jermamu dari A1. Selesaikan pelajaran pertama untuk membuka level berikutnya.</p>
          <Link to="/lesson/a1-1">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold text-lg">
              <PlayCircle className="w-5 h-5 mr-2" /> Mulai Pelajaran Pertama
            </Button>
          </Link>
        </div>
      )}

      {/* CONTINUE LEARNING — only show if user has started */}
      {!loading && currentLesson && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex items-center space-x-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-300" />
            <span className="text-sm font-bold uppercase tracking-wider text-blue-200">Lanjutkan Belajar</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-1">{currentLesson.title}</h3>
              <p className="text-blue-200 text-sm">Level {currentLesson.level} • Pelajaran {courseIndex.findIndex(l => l.id === currentLesson.id) + 1}</p>
            </div>
            <Link to={`/lesson/${currentLesson.id}`}>
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-6 py-3 rounded-xl font-bold">
                <PlayCircle className="w-5 h-5 mr-2" /> Lanjutkan
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* TODAY'S TASKS */}
      {!loading && todayTask && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-emerald-500" />
            <h3 className="text-lg font-bold text-slate-800">Tugas Hari Ini</h3>
          </div>
          <div className="flex items-center justify-between bg-slate-50 rounded-2xl p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{todayTask.title}</p>
                <p className="text-sm text-slate-500">{todayTask.level}</p>
              </div>
            </div>
            <Link to={`/lesson/${todayTask.id}`}>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                Mulai <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* STATS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-amber-500 mb-2">{xp}</span>
          <span className="text-sm font-bold text-amber-600/80 uppercase tracking-wider">Total XP</span>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-blue-500 mb-2">{Object.keys(vocab).length}</span>
          <span className="text-sm font-bold text-blue-600/80 uppercase tracking-wider">Kosakata</span>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-green-500 mb-2">{completedLessons.length}</span>
          <span className="text-sm font-bold text-green-600/80 uppercase tracking-wider">Selesai</span>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-purple-500 mb-2">{overallProgress}%</span>
          <span className="text-sm font-bold text-purple-600/80 uppercase tracking-wider">Progres</span>
        </div>
      </div>

      {/* CHECKPOINT STATUS */}
      {!loading && checkpointProgress.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-bold text-slate-800">Status Checkpoint</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-green-50 rounded-2xl p-4 text-center">
              <span className="text-3xl font-black text-green-600">{checkpointStats.passed}</span>
              <p className="text-sm font-bold text-green-700 mt-1">Lulus</p>
            </div>
            <div className="bg-amber-50 rounded-2xl p-4 text-center">
              <span className="text-3xl font-black text-amber-600">{checkpointStats.total - checkpointStats.passed}</span>
              <p className="text-sm font-bold text-amber-700 mt-1">Dikerjakan</p>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 text-center">
              <span className="text-3xl font-black text-slate-400">{checkpointStats.available}</span>
              <p className="text-sm font-bold text-slate-500 mt-1">Tersedia</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-16">
        {levels.map((lvl, index) => {
          const tierLocked = !isUserPro(tierData) && lvl.id !== 'A1';
          const isLevelUnlocked = index <= userLevelIndex && !tierLocked;
          const levelLessons = courseIndex.filter(l => l.level === lvl.id);
          const actualCompletedInLevel = levelLessons.filter(l => 
            completedLessons?.includes(l.id)
          ).length; 
          
          // Rough calculation for progress bar
          const unlockedInLevel = levelLessons.filter(l => unlockedLessons.includes(l.id)).length;
          const isLevelCompleted = actualCompletedInLevel === levelLessons.length && userLevelIndex >= index;
          
          let progressPercent = 0;
          if (isLevelCompleted) progressPercent = 100;
          else if (isLevelUnlocked && levelLessons.length > 0) progressPercent = Math.max(0, (actualCompletedInLevel / levelLessons.length) * 100);

          return (
            <div key={lvl.id} className={cn("relative", !isLevelUnlocked && "opacity-50 grayscale")}>
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
                       <p className="text-slate-500 font-medium">Terbuka • {levelLessons.length} Pelajaran</p>
                    ) : (
                       <p className="text-slate-500 font-medium flex items-center space-x-1"><Lock className="w-4 h-4" /> <span>Terkunci</span></p>
                    )}
                  </div>
                </div>
              </div>
              
              <Progress value={progressPercent} className="h-3 mb-8 bg-slate-100" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {levelLessons.map((lesson, idx) => {
                  const isUnlocked = unlockedLessons.includes(lesson.id) && !tierLocked;
                  const isCompleted = completedLessons?.includes(lesson.id);
                  
                  return (
                    <Link 
                      key={lesson.id} 
                      to={isUnlocked ? `/lesson/${lesson.id}` : ''}
                      onClick={(e) => { if (!isUnlocked) e.preventDefault(); }}
                      className={cn(
                        "flex flex-col p-6 rounded-3xl border-2 transition-all duration-200 relative overflow-hidden",
                        isCompleted ? "bg-slate-50 border-slate-200 hover:border-slate-300" :
                        isUnlocked ? "bg-white border-blue-500 shadow-lg shadow-blue-100 hover:-translate-y-1" :
                        "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed"
                      )}
                      aria-label={`Pelajaran: ${lesson.title}${isCompleted ? ' (selesai)' : isUnlocked ? '' : ' (terkunci)'}`}
                      aria-disabled={!isUnlocked}
                    >
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                         <div 
                           className={cn("h-full transition-all duration-500", isCompleted ? "bg-green-500" : isUnlocked ? "bg-blue-500" : "")} 
                           style={{ width: isCompleted ? '100%' : '0%' }}
                         />
                      </div>
                      <div className="flex justify-between items-start mb-4 mt-2">
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-md text-slate-500 uppercase tracking-widest">
                          Pelajaran {idx + 1}
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 ml-2" />
                        ) : isUnlocked ? (
                          <PlayCircle className="w-6 h-6 text-blue-500 flex-shrink-0 ml-2" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-300 flex-shrink-0 ml-2" />
                        )}
                      </div>
                      <h3 className={cn("text-lg font-bold mb-4", !isUnlocked && "text-slate-400")}>{lesson.title}</h3>
                      
                      {lesson.canDoGoals && lesson.canDoGoals.length > 0 && (
                        <div className="mt-auto space-y-1 pt-4 border-t border-slate-100/80">
                          <p className={cn("text-[10px] font-bold uppercase tracking-widest mb-2", !isUnlocked ? "text-slate-400" : "text-indigo-500")}>Sub-bab & Kompetensi:</p>
                          <ul className={cn("text-sm space-y-1.5", !isUnlocked ? "text-slate-400" : "text-slate-600")}>
                            {lesson.canDoGoals.slice(0, 3).map((goal, gidx) => (
                              <li key={gidx} className="flex items-start">
                                <span className="mr-2 opacity-50 text-xs mt-0.5">•</span>
                                <span className="line-clamp-2 leading-tight">{goal}</span>
                              </li>
                            ))}
                            {lesson.canDoGoals.length > 3 && (
                              <li className="text-xs pt-1 opacity-70 italic font-medium ml-3">+ {lesson.canDoGoals.length - 3} materi lainnya...</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </Link>
                  )
                })}
              </div>
              
              {/* Optional: Add timeline connecting lines here if desired */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
