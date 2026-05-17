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
  if (tier === 'pro' && (level === 'B2')) return true;
  return false;
}

export default function Dashboard() {
  const { currentLevel, unlockedLessons, xp, vocab } = useProgressStore();
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

  const exportPDF = async () => {
    if (tierData.tier === 'free') {
      alert("Fitur Export PDF hanya tersedia untuk paket Pro dan Master.");
      return;
    }
    setExporting(true);
    
    // Simulate slight delay to allow UI to update and ensure dynamic imports (if any later)
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const doc = new jsPDF();
      
      // Header
      doc.setFontSize(24);
      doc.setTextColor(30, 64, 175); // Blue-800
      doc.text("Laporan Progres Belajar DeutschUp", 14, 22);
      
      doc.setFontSize(12);
      doc.setTextColor(100);
      doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 32);
      doc.text(`Nama: ${user?.displayName || 'Siswa'}`, 14, 38);
      doc.text(`Level Saat Ini: ${currentLevel}`, 14, 44);
      doc.text(`Total XP: ${xp}`, 14, 50);
      doc.text(`Penguasaan Kosakata: ${Object.keys(vocab).length} kata`, 14, 56);

      // Mock Test History
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text("Riwayat Simulasi Ujian", 14, 70);

      if (mockTests && mockTests.length > 0) {
        const tableData = mockTests.map(t => [
          new Date(t.createdAt).toLocaleDateString('id-ID'),
          t.level,
          `${t.score} / ${t.total}`,
          `${Math.round((t.score/t.total)*100)}%`
        ]);
        autoTable(doc, {
          startY: 75,
          head: [['Tanggal', 'Level', 'Skor', 'Persentase']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [30, 64, 175] }
        });
      } else {
        doc.setFontSize(12);
        doc.text("Belum ada riwayat ujian.", 14, 78);
      }

      doc.save("DeutschUp-Report.pdf");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-slate-800 dark:text-white">Peta Pembelajaran</h1>
          <p className="text-slate-500 text-lg md:text-xl dark:text-slate-400">Lanjutkan perjalanan belajarmu dari A1 hingga B2.</p>
        </div>
        <Button onClick={exportPDF} disabled={exporting} variant="outline" className="flex items-center space-x-2 rounded-xl dark:border-slate-700 dark:text-slate-300">
          {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
          <span>{exporting ? 'Menyiapkan...' : 'Unduh Laporan'}</span>
        </Button>
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
          const completedInLevel = levelLessons.filter(l => 
            unlockedLessons.includes(l.id) && unlockedLessons.indexOf(l.id) < unlockedLessons.length - 1
          ).length; 
          
          // Rough calculation for progress bar
          const unlockedInLevel = levelLessons.filter(l => unlockedLessons.includes(l.id)).length;
          const isLevelCompleted = unlockedInLevel === levelLessons.length && userLevelIndex > index;
          
          let progressPercent = 0;
          if (isLevelCompleted) progressPercent = 100;
          else if (isLevelUnlocked && levelLessons.length > 0) progressPercent = Math.max(5, (unlockedInLevel / levelLessons.length) * 100);

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
                  const isCompleted = unlockedLessons.indexOf(lesson.id) < unlockedLessons.length - 1 || isLevelCompleted;
                  
                  return (
                    <Link 
                      key={lesson.id} 
                      to={isUnlocked ? `/lesson/${lesson.id}` : '#'}
                      className={cn(
                        "block p-6 rounded-3xl border-2 transition-all duration-200",
                        isCompleted ? "bg-slate-50 border-slate-200 hover:border-slate-300" :
                        isUnlocked ? "bg-white border-blue-500 shadow-lg shadow-blue-100 hover:-translate-y-1" :
                        "bg-slate-50 border-slate-100 cursor-not-allowed"
                      )}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-xs font-bold px-2 py-1 bg-slate-100 rounded-md text-slate-500 uppercase tracking-widest">
                          Pelajaran {idx + 1}
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-6 h-6 text-green-500" />
                        ) : isUnlocked ? (
                          <PlayCircle className="w-6 h-6 text-blue-500" />
                        ) : (
                          <Lock className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <h3 className={cn("text-lg font-bold mb-2", !isUnlocked && "text-slate-400")}>{lesson.title}</h3>
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
