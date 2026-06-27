import { useEffect, useState } from 'react';
import { useLearningStore } from '../stores/learningStore';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { BookOpen, CheckCircle2, Circle, Loader2, Plus, Sparkles, Trash2, CalendarCheck2 } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Catatan() {
  const { user } = useAuthStore();
  const { notes, studyPlan, loading, fetchData, addNote, deleteNote, saveStudyPlan, toggleTask } = useLearningStore();
  const { xp, currentLevel, unlockedLessons } = useProgressStore();

  const [newNote, setNewNote] = useState('');
  const [newNoteTag, setNewNoteTag] = useState<'Grammar' | 'Kosakata' | 'Pengucapan' | 'Umum'>('Umum');
  
  const [generatingPlan, setGeneratingPlan] = useState(false);

  useEffect(() => {
    if (user) {
      fetchData(user.id);
    }
  }, [user, fetchData]);

  useEffect(() => {
    // Automatically generate new plan if all current tasks are completed
    if (studyPlan && studyPlan.tasks.length > 0 && studyPlan.tasks.every(t => t.completed)) {
      if (!generatingPlan) {
        handleGeneratePlan();
      }
    }
  }, [studyPlan?.tasks]);

  const handleAddNote = async () => {
    if (!user || !newNote.trim()) return;
    await addNote(user.id, newNote.trim(), newNoteTag);
    setNewNote('');
  };

  const handleGeneratePlan = async () => {
    if (!user) return;
    setGeneratingPlan(true);
    try {
      const resp = await fetch('/api/ai?action=generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: currentLevel, xp, lessonsCompleted: unlockedLessons })
      });
      const data = await resp.json();
      if (data.tasks && data.tasks.length > 0) {
        const tasks = data.tasks.map((t: any) => ({ ...t, id: Math.random().toString(36).substring(7), completed: false }));
        await saveStudyPlan(user.id, tasks);
      } else {
        alert("Gagal membuat rencana belajar. Herr Deutsch mungkin sedang sibuk, silakan coba lagi.");
      }
    } catch(e) {
      console.error(e);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">
      <div className="mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-[#F2C94C]" />
          <span>Catatan Belajar & Rencana</span>
        </h1>
        <p className="text-muted-foreground text-lg md:text-xl">Kelola catatan pribadi Anda dan dapatkan rencana belajar AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Kolom 1: Rencana Belajar */}
        <div className="space-y-6">
          <div className="bg-[#f5f0eb] border-2 border-[#0a0a0a] p-6 md:p-8  border border-border ">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center">
                 <CalendarCheck2 className="w-6 h-6 mr-2 text-[#F2C94C]" />
                 Rencana Belajar AI
              </h2>
            </div>
            
            {!studyPlan || studyPlan.tasks.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#FFF8E1]  flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-[#F2C94C]" />
                </div>
                <h3 className="text-lg font-bold mb-2">Belum ada rencana!</h3>
                <p className="text-muted-foreground mb-6">Minta Herr Deutsch membuatkan daftar fokus belajar berdasarkan level pencapaianmu.</p>
                <Button 
                   onClick={handleGeneratePlan} 
                   disabled={generatingPlan}
                   className="w-full  from-[#F2C94C] to-[#E0B73A] hover:from-[#E0B73A] hover:to-[#F2C94C] text-[#1F2937] font-bold  h-12"
                >
                  {generatingPlan ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  Buat Rencana Belajar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-semibold text-muted-foreground bg-muted p-4 ">
                   <span>Progres: {studyPlan.tasks.filter(t => t.completed).length}/{studyPlan.tasks.length} Selesai</span>
                   <Button onClick={handleGeneratePlan} disabled={generatingPlan} variant="ghost" size="sm" className="text-[#F2C94C] hover:text-[#E0B73A] h-8">
                     {generatingPlan ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Sparkles className="w-4 h-4 mr-1" />} Update
                   </Button>
                </div>
                
                <ul className="space-y-3 mt-4">
                  {studyPlan.tasks.map(task => (
                    <li key={task.id} className="flex items-start space-x-3 p-3 bg-card hover:bg-muted  transition-colors cursor-pointer border border-transparent hover:border-border" onClick={() => user && toggleTask(user.id, task.id)}>
                      <button className="flex-shrink-0 mt-0.5" aria-label={task.completed ? "Tandai belum selesai" : "Tandai selesai"}>
                         {task.completed ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <Circle className="w-6 h-6 text-[#0a0a0a]/30" />}
                      </button>
                      <span className={cn("text-foreground leading-relaxed", task.completed && "line-through text-muted-foreground")}>
                        {task.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Kolom 2: Catatan Pribadi */}
        <div className="space-y-6">
          <div className="bg-[#f5f0eb] border-2 border-[#0a0a0a] p-6 md:p-8  border border-border  flex flex-col h-full">
            <h2 className="text-2xl font-bold mb-6">Catatan Pribadi</h2>
            
            <div className="mb-8">
               <textarea
                 value={newNote}
                 onChange={(e) => setNewNote(e.target.value)}
                 placeholder="Tulis hal penting untuk diingat..."
                 className="w-full h-24 bg-muted border-2 border-border  p-4 text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all resize-none mb-3"
               />
               <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                     {(['Umum', 'Grammar', 'Kosakata', 'Pengucapan'] as const).map(tag => (
                        <button
                          key={tag}
                          onClick={() => setNewNoteTag(tag)}
                          className={cn(
                            "px-3 py-1.5  text-xs font-bold transition-colors",
                            newNoteTag === tag ? "bg-[#0a0a0a]/90 bg-[#0a0a0a]" : "bg-muted text-muted-foreground hover:bg-accent"
                          )}
                          aria-pressed={newNoteTag === tag}
                          aria-label={`Tag: ${tag}`}
                        >
                          {tag}
                        </button>
                     ))}
                  </div>
                  <Button onClick={handleAddNote} disabled={!newNote.trim() || !user} size="sm" className="">
                    <Plus className="w-4 h-4 mr-1"/> Tambah
                  </Button>
               </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4">
               {loading && notes.length === 0 && <div className="text-center py-10"><Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" /></div>}
               {!loading && notes.length === 0 && (
                 <div className="text-center py-10 opacity-70">
                   <div className="w-16 h-16 bg-muted  flex items-center justify-center mx-auto mb-4 grayscale">
                     <BookOpen className="w-8 h-8 text-muted-foreground" />
                   </div>
                   <h3 className="text-lg font-bold text-muted-foreground mb-1">Catatan Kosong</h3>
                   <p className="text-muted-foreground text-sm">Tuliskan pengingat, rule grammar, atau kosa kata baru di sini.</p>
                 </div>
               )}
               
               {notes.map(note => (
                 <div key={note.id} className="p-4 bg-muted border border-border  relative group">
                    <div className="flex justify-between items-start mb-2">
                       <span className="px-2 py-1 bg-card border border-border  text-xs font-bold text-muted-foreground">{note.tag}</span>
                       <button onClick={() => user && deleteNote(user.id, note.id)} className="text-[#0a0a0a]/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Hapus catatan">
                         <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                    <p className="text-foreground text-sm whitespace-pre-wrap">{note.text}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </div>
    
    </div>
  )
}
