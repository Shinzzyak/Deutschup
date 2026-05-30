import { Link } from 'react-router';
import { useState } from 'react';
import { courseData, Level } from '../data/course';
import { useProgressStore } from '../stores/progressStore';
import { useLearningStore } from '../stores/learningStore';
import { useAuthStore } from '../stores/authStore';
import { CheckCircle2, Lock, PlayCircle, Download, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { Progress } from '../components/ui/progress';
import { Button } from '../components/ui/button';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

function isLevelLocked(level: string, tier: string) {
  if (tier === 'free' && level !== 'A1') return true;
  return false;
}

export default function Dashboard() {
  const { currentLevel, unlockedLessons, completedLessons, xp, vocab } = useProgressStore();
  const { mockTests } = useLearningStore();
  const { user, tierData } = useAuthStore();
  const [exporting, setExporting] = useState(false);

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
    
    if (tierData.tier === 'free') {
      setErrorMsg("Fitur Export PDF hanya tersedia untuk pengguna Pro.");
      return;
    }
    
    setExporting(true);
    
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
      doc.text(`Nama: ${user?user_metadata.full_name || 'Siswa'}`, 14, yPos);
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
      
      const unlockedCourseData = courseData.filter(l => unlockedLessons.includes(l.id));
      
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

      doc.save(`DeutschUp-Report-${user?user_metadata.full_name || 'Student'}.pdf`);
      
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
            <button onClick={() => setErrorMsg("")} className="opacity-70 hover:opacity-100">✕</button>
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
            <a href={pdfBlobUrl} download={`DeutschUp-Report-${user?user_metadata.full_name || 'Student'}.pdf`} className="text-[12px] font-bold text-indigo-500 mt-2 text-left md:text-right underline">
              Klik di sini untuk mengunduh manual ➔
            </a>
          )}
        </div>
      </div>

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
          <span className="text-4xl font-black text-green-500 mb-2">{unlockedLessons.length}</span>
          <span className="text-sm font-bold text-green-600/80 uppercase tracking-wider">Pelajaran</span>
        </div>
        <div className="bg-pink-500/10 border border-pink-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-pink-500 mb-2">{currentLevel}</span>
          <span className="text-sm font-bold text-pink-600/80 uppercase tracking-wider">Level</span>
        </div>
      </div>

      <div className="space-y-16">
        {levels.map((lvl, index) => {
          const tierLocked = isLevelLocked(lvl.id, tierData.tier);
          const isLevelUnlocked = index <= userLevelIndex && !tierLocked;
          const levelLessons = courseData.filter(l => l.level === lvl.id);
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
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm", lvl.color)}>
                    {lvl.id}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{lvl.title}</h2>
                    {tierLocked ? (
                       <p className="text-amber-500 font-bold flex items-center space-x-1">
                         <Lock className="w-4 h-4 mr-1" /> Premium Only 
                         <Link to="/pricing" className="ml-2 underline text-sm text-blue-600 font-semibold">Upgrade</Link>
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
                      to={isUnlocked ? `/lesson/${lesson.id}` : '#'}
                      className={cn(
                        "flex flex-col p-6 rounded-3xl border-2 transition-all duration-200 relative overflow-hidden",
                        isCompleted ? "bg-slate-50 border-slate-200 hover:border-slate-300" :
                        isUnlocked ? "bg-white border-blue-500 shadow-lg shadow-blue-100 hover:-translate-y-1" :
                        "bg-slate-50 border-slate-100 cursor-not-allowed"
                      )}
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
