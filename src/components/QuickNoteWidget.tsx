import { useState, useEffect } from 'react';
import { Edit3, Check, Loader2, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLearningStore } from '../stores/learningStore';
import { cn } from '../lib/utils';

export default function QuickNoteWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { quickNote, saveQuickNote } = useLearningStore();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (quickNote) {
      setText(quickNote.text);
    }
  }, [quickNote]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await saveQuickNote(user.id, text);
    setTimeout(() => {
      setSaving(false);
      setIsOpen(false);
    }, 500);
  };

  if (!user) return null;

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "fixed right-6 w-14 h-14 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-40 border-4 border-background",
          isOpen && "hidden"
        )}
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 144px)' }}
        aria-label={isOpen ? "Tutup quick note" : "Buka quick note"}
      >
        <Edit3 className="w-6 h-6" />
      </button>

      <div className={cn(
        "fixed right-6 w-[min(300px,calc(100vw-2rem))] h-[min(300px,calc(100vh-10rem))] bg-yellow-100 rounded-tr-3xl rounded-tl-3xl rounded-bl-3xl shadow-xl flex flex-col z-50 transition-all duration-300 transform",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      )}>
        <div className="bg-yellow-200 p-3 rounded-t-3xl flex justify-between items-center text-yellow-900 font-bold border-b border-yellow-300">
           <span>Quick Note</span>
           <button onClick={() => setIsOpen(false)} className="hover:bg-yellow-300 p-1 rounded-full" aria-label="Tutup quick note"><X className="w-4 h-4" /></button>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Tuliskan coretan cepat di sini..."
          className="flex-1 bg-transparent p-4 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-900 placeholder:text-yellow-700/50 text-sm"
        />
        <div className="p-3 bg-yellow-200/50 rounded-b-3xl border-t border-yellow-300 flex justify-end">
          <button 
             onClick={handleSave}
             disabled={saving}
             className="px-4 py-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-bold rounded-xl flex items-center shadow-sm transition-colors"
             aria-label="Simpan catatan"
          >
             {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
             Simpan
          </button>
        </div>
      </div>
    </>
  );
}
