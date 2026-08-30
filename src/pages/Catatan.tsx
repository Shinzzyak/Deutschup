import { useEffect, useRef, useState } from 'react';
import { AlertCircle, BookOpen, CalendarCheck2, CheckCircle2, Circle, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useLearningStore, type StudyTask } from '../stores/learningStore';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { Button } from '../components/ui/button';
import { cn } from '../lib/utils';
import { authedFetch } from '../lib/auth-headers';

const TAGS = ['Umum', 'Grammar', 'Kosakata', 'Pengucapan'] as const;
type Tag = (typeof TAGS)[number];

const TAG_LABEL: Record<Tag, string> = {
  Umum: 'Umum',
  Grammar: 'Tata bahasa',
  Kosakata: 'Kosakata',
  Pengucapan: 'Pengucapan',
};

/**
 * api/ai.ts writes its own Indonesian error copy (quota, "Herr Deutsch sedang
 * istirahat sebentar", AI switched off). Show that text; the fallbacks below
 * only cover responses that carry nothing readable.
 */
function messageFromResponse(status: number, payload: any): string {
  const serverMessage = typeof payload?.error === 'string' && payload.error.trim() ? payload.error.trim() : null;
  if (serverMessage) return serverMessage;
  if (status === 401) return 'Sesi kamu sudah berakhir. Muat ulang halaman ini lalu masuk lagi, ya.';
  if (status === 429) return 'Terlalu banyak permintaan berturut-turut. Tunggu sekitar satu menit, lalu coba lagi.';
  return 'Herr Deutsch belum bisa menyusun rencana sekarang. Coba lagi sebentar lagi, ya.';
}

/** Inline failure notice — the message stays next to the thing that failed. */
function Notice({ text, onRetry, retryLabel = 'Coba lagi' }: { text: string; onRetry?: () => void; retryLabel?: string }) {
  return (
    <div className="mb-5 border border-brand-rust/25 border-l-4 border-l-brand-rust bg-brand-rust/5 p-4" role="status">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-rust" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed text-ink-muted">{text}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm font-bold text-brand-rust underline underline-offset-4 hover:text-brand-ink"
            >
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Catatan() {
  const { user } = useAuthStore();
  const { notes, studyPlan, loading, fetchData, addNote, deleteNote, saveStudyPlan } = useLearningStore();
  const { xp, currentLevel, unlockedLessons } = useProgressStore();

  const [newNote, setNewNote] = useState('');
  const [newNoteTag, setNewNoteTag] = useState<Tag>('Umum');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // The store writes the plan straight to the database and never updates its own
  // slice, so a freshly generated plan (and every tick) would stay invisible
  // until a page reload. This local copy is what the screen renders; every
  // change is persisted through saveStudyPlan(), which writes the whole list.
  const [tasks, setTasks] = useState<StudyTask[]>([]);
  const [generatingPlan, setGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [noteError, setNoteError] = useState<string | null>(null);
  const noteFieldRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (user) {
      fetchData(user.id);
    }
  }, [user, fetchData]);

  useEffect(() => {
    setTasks(studyPlan?.tasks ?? []);
  }, [studyPlan]);

  const doneCount = tasks.filter(t => t.completed).length;
  const allTasksDone = tasks.length > 0 && doneCount === tasks.length;

  const handleAddNote = async () => {
    if (!user || !newNote.trim()) return;
    setNoteError(null);
    const countBefore = useLearningStore.getState().notes.length;
    await addNote(user.id, newNote.trim(), newNoteTag);
    // The store swallows its own errors, so success is inferred from the slice.
    if (useLearningStore.getState().notes.length === countBefore) {
      setNoteError('Catatanmu belum tersimpan. Coba tekan Tambah sekali lagi, teksnya masih ada di kotak tulis.');
      return;
    }
    setNewNote('');
    noteFieldRef.current?.focus();
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    setConfirmDeleteId(null);
    setNoteError(null);
    await deleteNote(user.id, noteId);
    if (useLearningStore.getState().notes.some(n => n.id === noteId)) {
      setNoteError('Catatanmu belum terhapus. Coba lagi sebentar lagi, ya.');
    }
  };

  const handleToggleTask = (taskId: string) => {
    if (!user) return;
    const next = tasks.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t));
    setTasks(next);
    void saveStudyPlan(user.id, next);
  };

  /**
   * Always user-initiated. This used to fire by itself the moment the last task
   * was ticked, which replaced a finished checklist — and spent an AI call —
   * without anyone asking for it.
   */
  const handleGeneratePlan = async () => {
    if (!user || generatingPlan) return;
    setGeneratingPlan(true);
    setPlanError(null);
    try {
      const resp = await authedFetch('/api/ai?action=generate-study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: currentLevel, xp, lessonsCompleted: unlockedLessons })
      });
      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        setPlanError(messageFromResponse(resp.status, data));
        return;
      }

      const incoming = Array.isArray(data?.tasks) ? data.tasks : [];
      const stamp = Date.now().toString(36);
      const cleaned: StudyTask[] = incoming
        .filter((t: any) => typeof t?.text === 'string' && t.text.trim())
        .map((t: any, i: number) => ({ id: `${stamp}-${i}`, text: String(t.text).trim(), completed: false }));

      if (cleaned.length === 0) {
        setPlanError('Rencana yang datang kosong, jadi tidak kami simpan. Coba minta sekali lagi, ya.');
        return;
      }

      setTasks(cleaned);
      await saveStudyPlan(user.id, cleaned);
    } catch (e) {
      console.error('[CATATAN] generate plan failed:', e);
      setPlanError('Koneksi terputus saat menyusun rencana. Periksa jaringanmu, lalu coba lagi.');
    } finally {
      setGeneratingPlan(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20">
      {/* Header */}
      <div className="mb-10 border-l-4 border-brand-rust pl-5 md:pl-6">
        <p className="mb-2 text-xs font-bold tracking-[0.18em] text-brand-rust uppercase">Ruang belajarmu</p>
        <h1 className="mb-3 flex items-center gap-3 font-serif text-3xl font-bold tracking-tight text-brand-ink md:text-4xl">
          <BookOpen className="h-7 w-7 shrink-0 text-brand-rust" aria-hidden="true" />
          <span>Catatan &amp; rencana belajar</span>
        </h1>
        <p className="max-w-xl text-lg text-ink-muted">
          Simpan hal yang mudah lupa, dan minta Herr Deutsch menyusun daftar fokus untuk level {currentLevel || 'A1'}.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Column 1 — study plan */}
        <section aria-labelledby="rencana-heading" className="border border-brand-ink/12 bg-white p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 id="rencana-heading" className="flex items-center gap-2 font-serif text-2xl font-bold text-brand-ink">
              <CalendarCheck2 className="h-5 w-5 text-brand-rust" aria-hidden="true" />
              Rencana belajar
            </h2>
            {tasks.length > 0 && (
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={generatingPlan}
                className="flex items-center gap-1.5 text-sm font-bold text-brand-rust underline underline-offset-4 transition-colors hover:text-brand-ink disabled:opacity-50"
              >
                {generatingPlan
                  ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  : <Sparkles className="h-4 w-4" aria-hidden="true" />}
                Susun ulang
              </button>
            )}
          </div>

          <div aria-live="polite">
            {planError && <Notice text={planError} onRetry={handleGeneratePlan} retryLabel="Coba susun lagi" />}
          </div>

          {tasks.length === 0 ? (
            <div className="py-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-brand-ink/12 bg-brand-tan/15">
                <Sparkles className="h-6 w-6 text-brand-rust" aria-hidden="true" />
              </div>
              <h3 className="mb-2 font-serif text-lg font-bold text-brand-ink">Belum ada rencana</h3>
              <p className="mx-auto mb-6 max-w-xs text-sm leading-relaxed text-ink-muted">
                Herr Deutsch akan menyusun sepuluh poin fokus berdasarkan level dan pelajaran yang sudah kamu selesaikan.
              </p>
              <Button
                onClick={handleGeneratePlan}
                disabled={generatingPlan || !user}
                className="h-12 w-full bg-brand-ink font-bold text-brand-cream hover:bg-brand-rust"
              >
                {generatingPlan
                  ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> Sedang disusun…</>
                  : <><Sparkles className="mr-2 h-5 w-5" aria-hidden="true" /> Buat rencana belajar</>}
              </Button>
            </div>
          ) : (
            <div>
              {/* Progress */}
              <div className="mb-4 border border-brand-ink/10 bg-brand-cream px-4 py-3">
                <div className="mb-2 flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-brand-ink">
                    {doneCount} dari {tasks.length} selesai
                  </span>
                  <span className="text-xs tracking-wider text-ink-subtle uppercase">Level {currentLevel || 'A1'}</span>
                </div>
                <div
                  className="h-1.5 w-full bg-brand-ink/10"
                  role="progressbar"
                  aria-valuenow={doneCount}
                  aria-valuemin={0}
                  aria-valuemax={tasks.length}
                  aria-label="Progres rencana belajar"
                >
                  <div
                    className="h-full bg-brand-rust transition-[width] duration-500"
                    style={{ width: `${Math.round((doneCount / tasks.length) * 100)}%` }}
                  />
                </div>
              </div>

              {allTasksDone && (
                <div className="mb-4 border border-brand-green/25 border-l-4 border-l-brand-green bg-brand-green/10 p-4">
                  <p className="mb-1 font-serif text-lg font-bold text-brand-ink">Semua poin sudah kamu tuntaskan</p>
                  <p className="mb-3 text-sm leading-relaxed text-ink-muted">
                    Daftar ini tetap di sini sampai kamu sendiri memintanya diganti.
                  </p>
                  <Button
                    onClick={handleGeneratePlan}
                    disabled={generatingPlan}
                    className="h-10 bg-brand-ink px-4 font-bold text-brand-cream hover:bg-brand-rust"
                  >
                    {generatingPlan
                      ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> Sedang disusun…</>
                      : 'Minta rencana baru'}
                  </Button>
                </div>
              )}

              <ul className="border-t border-brand-ink/10">
                {tasks.map(task => (
                  <li key={task.id} className="border-b border-brand-ink/10">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(task.id)}
                      aria-pressed={task.completed}
                      className="flex w-full items-start gap-3 px-1 py-3 text-left transition-colors hover:bg-brand-cream/70"
                    >
                      {task.completed
                        ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" />
                        : <Circle className="mt-0.5 h-5 w-5 shrink-0 text-ink-subtle" aria-hidden="true" />}
                      <span className={cn('leading-relaxed', task.completed ? 'text-ink-subtle line-through' : 'text-brand-ink')}>
                        {task.text}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Column 2 — personal notes */}
        <section aria-labelledby="catatan-heading" className="flex h-full flex-col border border-brand-ink/12 bg-white p-6 md:p-8">
          <h2 id="catatan-heading" className="mb-6 font-serif text-2xl font-bold text-brand-ink">Catatan pribadi</h2>

          <div className="mb-8">
            <label htmlFor="note-text" className="sr-only">Tulis catatan baru</label>
            {/* border-ink-subtle, not brand-ink/15: the field boundary needs 3:1
                per WCAG 1.4.11 and #dadada was 1.33:1 against the cream/40 fill. */}
            <textarea
              id="note-text"
              ref={noteFieldRef}
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              placeholder="Tulis hal penting untuk diingat…"
              className="mb-3 h-24 w-full resize-none border border-ink-subtle bg-brand-cream/40 p-4 text-sm leading-relaxed text-brand-ink transition-colors placeholder:text-ink-subtle focus:border-brand-rust focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-rust/25"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-px bg-brand-ink/10" role="group" aria-label="Kategori catatan">
                {TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setNewNoteTag(tag)}
                    className={cn(
                      'px-3 py-1.5 text-xs font-bold transition-colors',
                      newNoteTag === tag
                        ? 'bg-brand-ink text-brand-cream'
                        : 'bg-white text-ink-muted hover:bg-brand-cream'
                    )}
                    aria-pressed={newNoteTag === tag}
                  >
                    {TAG_LABEL[tag]}
                  </button>
                ))}
              </div>
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim() || !user}
                className="h-9 bg-brand-ink px-4 font-bold text-brand-cream hover:bg-brand-rust"
              >
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Tambah
              </Button>
            </div>
          </div>

          <div aria-live="polite">
            {noteError && <Notice text={noteError} />}
          </div>

          <div className="flex-1 space-y-px overflow-y-auto bg-brand-ink/10">
            {loading && notes.length === 0 && (
              <div className="bg-white py-10 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-rust" aria-hidden="true" />
                <p className="mt-3 text-sm text-ink-subtle">Mengambil catatanmu…</p>
              </div>
            )}

            {!loading && notes.length === 0 && (
              <div className="bg-white py-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center border border-brand-ink/12 bg-brand-cream">
                  <BookOpen className="h-6 w-6 text-ink-subtle" aria-hidden="true" />
                </div>
                <h3 className="mb-1 font-serif text-lg font-bold text-brand-ink">Belum ada catatan</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-ink-muted">
                  Tulis aturan tata bahasa, kosakata baru, atau pengingat kecil di sini.
                </p>
              </div>
            )}

            {notes.map(note => (
              <article key={note.id} className="group bg-white p-4">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <span className="border border-brand-ink/12 bg-brand-cream px-2 py-1 text-xs font-bold tracking-wide text-ink-muted">
                    {TAG_LABEL[note.tag as Tag] ?? note.tag}
                  </span>

                  {confirmDeleteId === note.id ? (
                    <span className="flex items-center gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleDeleteNote(note.id)}
                        className="font-bold text-brand-rust underline underline-offset-4 hover:text-brand-ink"
                      >
                        Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-ink-muted underline underline-offset-4 hover:text-brand-ink"
                      >
                        Batal
                      </button>
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(note.id)}
                      // Always visible: hover-only controls are unreachable on a
                      // phone and invisible to keyboard users. Full opacity too —
                      // ink-subtle at 60% measured 2.40:1, under the 3:1 floor
                      // for a control that carries meaning.
                      className="p-1 text-ink-subtle transition-colors hover:text-brand-rust"
                      aria-label="Hapus catatan ini"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-brand-ink">{note.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
