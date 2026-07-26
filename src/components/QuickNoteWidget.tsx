import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Check, Edit3, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../stores/authStore';
import { useLearningStore } from '../stores/learningStore';

const draftKey = (uid: string) => `deutschup_quicknote_draft_${uid}`;

type Draft = { text: string; at: number };

/**
 * On-device draft.
 *
 * The store writes the quick note straight to the database and reports neither
 * success nor failure, so a lost save would otherwise take the text with it.
 * The draft is kept until the server copy is demonstrably newer.
 */
function readDraft(uid?: string): Draft | null {
  if (!uid) return null;
  try {
    const raw = localStorage.getItem(draftKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.text !== 'string' || typeof parsed?.at !== 'number') return null;
    return parsed as Draft;
  } catch {
    return null;
  }
}

function writeDraft(uid: string, text: string) {
  try {
    localStorage.setItem(draftKey(uid), JSON.stringify({ text, at: Date.now() }));
  } catch {
    // Private mode / storage full: the draft is a safety net, not a requirement.
  }
}

export default function QuickNoteWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuthStore();
  const { quickNote, saveQuickNote, fetchData } = useLearningStore();

  const [text, setText] = useState('');
  const [savedText, setSavedText] = useState('');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLTextAreaElement>(null);
  const hydratedRef = useRef(false);
  const fetchedRef = useRef(false);
  const closeTimerRef = useRef<number | null>(null);
  /** Once the user has typed, nothing arriving late may overwrite the field. */
  const typedRef = useRef(false);

  const dirty = text !== savedText;

  // Nothing else on the page pulls the learning data, so the note would stay
  // empty until the user happened to visit /catatan. Fetch once, on first open.
  useEffect(() => {
    if (!isOpen || !user || fetchedRef.current) return;
    fetchedRef.current = true;
    fetchData(user.id);
  }, [isOpen, user, fetchData]);

  // Restore an unsaved draft before the server copy arrives.
  useEffect(() => {
    const draft = readDraft(user?.id);
    if (draft?.text && !typedRef.current) setText(draft.text);
  }, [user?.id]);

  // Server copy wins unless the on-device draft is newer (i.e. a save was lost).
  useEffect(() => {
    if (hydratedRef.current || !quickNote) return;
    hydratedRef.current = true;
    const server = quickNote.text ?? '';
    setSavedText(server);
    setText(prev => {
      if (typedRef.current) return prev;
      const draft = readDraft(user?.id);
      if (draft?.text.trim() && draft.at > (quickNote.updatedAt ?? 0)) return draft.text;
      return server;
    });
  }, [quickNote, user?.id]);

  // Keep the draft current while typing.
  useEffect(() => {
    if (!user || !dirty) return;
    writeDraft(user.id, text);
  }, [text, dirty, user]);

  useEffect(() => {
    if (!isOpen) return;
    const t = window.setTimeout(() => fieldRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  useEffect(() => () => {
    if (closeTimerRef.current) window.clearTimeout(closeTimerRef.current);
  }, []);

  const handleSave = async () => {
    if (!user || saving) return;
    setSaving(true);
    await saveQuickNote(user.id, text);
    setSavedText(text);
    setSaving(false);
    setJustSaved(true);
    closeTimerRef.current = window.setTimeout(() => {
      setJustSaved(false);
      setIsOpen(false);
    }, 900);
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
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed right-6 z-[100] flex h-14 w-14 items-center justify-center border border-brand-ink bg-brand-tan text-brand-ink transition-transform hover:scale-105"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 144px)' }}
        aria-label={isOpen ? 'Tutup catatan cepat' : 'Buka catatan cepat'}
        aria-expanded={isOpen}
      >
        <Edit3 className="h-6 w-6" aria-hidden="true" />
        {dirty && (
          <span
            className="absolute -top-1 -right-1 h-3 w-3 border border-white bg-brand-rust"
            aria-hidden="true"
          />
        )}
      </button>

      {/* Popup — portal to body */}
      {createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[99998] bg-brand-ink/10 transition-opacity duration-200 ${
              isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
            }`}
            onClick={handleBackdropClick}
            aria-hidden="true"
          />

          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={panelRef}
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="fixed z-[99999] flex flex-col overflow-hidden overscroll-contain border border-brand-ink/15 bg-white shadow-[0_20px_60px_-30px_rgba(10,10,10,0.55)]"
                role="dialog"
                aria-modal="true"
                aria-label="Catatan cepat"
                style={{
                  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 220px)',
                  right: '16px',
                  width: 'min(90vw, 360px)',
                  height: 'min(420px, calc(100vh - 280px))',
                }}
              >
                {/* Header */}
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-brand-ink/10 px-4">
                  <div className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-brand-rust" aria-hidden="true" />
                    <h2 className="font-serif text-base font-bold text-brand-ink">Catatan cepat</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-ink-muted transition-colors hover:bg-brand-cream hover:text-brand-ink"
                    aria-label="Tutup catatan cepat"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Textarea */}
                <label htmlFor="quick-note" className="sr-only">Isi catatan cepat</label>
                <textarea
                  id="quick-note"
                  ref={fieldRef}
                  value={text}
                  onChange={(e) => { typedRef.current = true; setText(e.target.value); }}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder="Tuliskan coretan cepat di sini…"
                  className="flex-1 resize-none bg-transparent p-4 text-sm leading-relaxed text-brand-ink placeholder:text-ink-subtle focus:bg-brand-cream/40 focus:outline-none"
                />

                {/* Footer */}
                <div className="shrink-0 border-t border-brand-ink/10 px-4 py-3">
                  <p className="mb-2 text-xs text-ink-subtle" aria-live="polite">
                    {justSaved
                      ? 'Tersimpan.'
                      : dirty
                        ? 'Ada perubahan yang belum disimpan.'
                        : 'Tidak ada perubahan.'}
                  </p>
                  <button
                    onClick={handleSave}
                    disabled={saving || !dirty}
                    className="flex w-full items-center justify-center bg-brand-ink px-4 py-2.5 text-sm font-bold text-brand-cream transition-colors hover:bg-brand-rust disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {saving
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Menyimpan…</>
                      : <><Check className="mr-2 h-4 w-4" aria-hidden="true" /> Simpan</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
}
