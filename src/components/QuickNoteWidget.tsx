import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, Check, Loader2, X } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useLearningStore } from '../stores/learningStore';

export default function QuickNoteWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { quickNote, saveQuickNote } = useLearningStore();
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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

  // ESC to close
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  // Click outside to close
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setIsOpen(false);
    }
  }, []);

  if (!user) return null;

  return (
    <>
      {/* Floating button — unchanged */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 w-14 h-14 rounded-full bg-yellow-400 text-yellow-900 flex items-center justify-center shadow-xl hover:scale-110 transition-transform z-40 border-4 border-background"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 144px)' }}
        aria-label={isOpen ? "Tutup quick note" : "Buka quick note"}
      >
        <Edit3 className="w-6 h-6" />
      </button>

      {/* Drawer — portal to body */}
      {createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[99998] bg-black/30 backdrop-blur-sm transition-opacity duration-200 ${
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          {/* Drawer panel */}
          <div
            ref={panelRef}
            className={`fixed top-0 right-0 bottom-0 z-[99999] bg-yellow-50 shadow-2xl flex flex-col transition-transform duration-200 ease-out ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{
              width: 'min(90vw, 420px)',
              paddingBottom: 'env(safe-area-inset-bottom, 0px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-yellow-300 shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-yellow-700" />
                <span className="text-sm font-bold text-yellow-900">Quick Note</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-yellow-700 hover:text-yellow-900 transition-colors rounded-lg hover:bg-yellow-200"
                aria-label="Tutup quick note"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Textarea */}
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Tuliskan coretan cepat di sini..."
              className="flex-1 bg-transparent p-4 resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 text-yellow-900 placeholder:text-yellow-700/50 text-sm"
            />

            {/* Footer */}
            <div className="px-4 py-3 border-t border-yellow-300 shrink-0">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-bold rounded-xl flex items-center justify-center shadow-sm transition-colors"
                aria-label="Simpan catatan"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                Simpan
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
