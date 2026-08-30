import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router';
import { AlertCircle, ArrowRight, Bot, Loader2, Lock, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../stores/authStore';
import { useProgressStore } from '../stores/progressStore';
import { isUserPro } from '../lib/subscription';
import { authedFetch } from '../lib/auth-headers';

interface Message {
  role: 'user' | 'model';
  text: string;
}

/** Free tier: 10 chat turns per rolling hour (mirrors checkQuota in lib/api-utils.ts). */
const FREE_CHAT_PER_HOUR = 10;
const QUOTA_WINDOW_MS = 60 * 60 * 1000;

const usageKey = (uid?: string) => `deutschup_chat_usage_${uid || 'anon'}`;

/**
 * Local echo of the free-tier chat count.
 *
 * The API only reports the quota once it has already been exceeded, and there is
 * no endpoint that answers "how many do I have left". Counting sent turns on the
 * device is the only way to say something useful *before* the student types —
 * the server stays the authority, and a 402 immediately corrects this counter.
 */
function readUsage(uid?: string): number[] {
  try {
    const raw = localStorage.getItem(usageKey(uid));
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    const cutoff = Date.now() - QUOTA_WINDOW_MS;
    return parsed.filter((t: unknown): t is number => typeof t === 'number' && t > cutoff);
  } catch {
    return [];
  }
}

function writeUsage(uid: string | undefined, list: number[]) {
  try {
    localStorage.setItem(usageKey(uid), JSON.stringify(list));
  } catch {
    // Private mode / full storage: the counter is a courtesy, not a gate.
  }
}

/** Wall-clock label for a quota reset timestamp, in Indonesian. */
function formatReset(resetAt?: number): string | null {
  if (typeof resetAt !== 'number' || !Number.isFinite(resetAt)) return null;
  const at = new Date(resetAt);
  if (Number.isNaN(at.getTime())) return null;
  const time = at.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  if (at.toDateString() === new Date().toDateString()) return `pukul ${time}`;
  const day = at.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
  return `${day} pukul ${time}`;
}

/**
 * api/ai.ts writes its own warm Indonesian copy for the failures it knows about.
 * Show that text; these fallbacks only cover responses with nothing readable.
 */
function messageFromResponse(status: number, payload: any): string {
  const serverMessage = typeof payload?.error === 'string' && payload.error.trim() ? payload.error.trim() : null;
  if (serverMessage) return serverMessage;
  if (status === 401) return 'Sesi kamu sudah berakhir. Muat ulang halaman ini lalu masuk lagi, ya.';
  if (status === 429) return 'Terlalu banyak pesan berturut-turut. Tunggu sekitar satu menit, lalu kirim lagi.';
  return 'Herr Deutsch belum bisa menjawab sekarang. Coba kirim lagi sebentar lagi, ya.';
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);
  const [paywall, setPaywall] = useState<{ message: string; resetAt?: number } | null>(null);
  const [usage, setUsage] = useState<number[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { user, profileData, tierData } = useAuthStore();
  const { currentLevel } = useProgressStore();

  const isPro = isUserPro(tierData, tierData?.role || profileData?.role);
  const remaining = Math.max(0, FREE_CHAT_PER_HOUR - usage.length);
  const blocked = !isPro && !!paywall;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, failure, paywall]);

  // Refresh the local counter whenever the panel opens — the hour may have rolled over.
  useEffect(() => {
    if (!isOpen) return;
    setUsage(readUsage(user?.id));
    const t = window.setTimeout(() => inputRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, [isOpen, user?.id]);

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

  const send = async (text: string, retry = false) => {
    const message = text.trim();
    if (!message || isLoading || blocked) return;

    // On a retry the failed turn is already in the transcript; don't repeat it.
    const history = (retry ? messages.slice(0, -1) : messages).slice(-6);

    setFailure(null);
    if (!retry) {
      setMessages(prev => [...prev, { role: 'user', text: message }]);
      setInput('');
    }
    setIsLoading(true);

    try {
      const resp = await authedFetch('/api/ai?action=chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, level: currentLevel || 'A1' })
      });
      const data = await resp.json().catch(() => null);

      if (!resp.ok) {
        const isQuota = resp.status === 402 || data?.code === 'QUOTA_EXCEEDED';
        if (isQuota) {
          const headerReset = Number(resp.headers.get('X-Quota-Reset'));
          const resetAt = typeof data?.resetAt === 'number'
            ? data.resetAt
            : Number.isFinite(headerReset) && headerReset > 0 ? headerReset * 1000 : undefined;
          setPaywall({ message: messageFromResponse(resp.status, data), resetAt });
          // The server just told us the window is full; make the counter agree.
          const spent = Array.from({ length: FREE_CHAT_PER_HOUR }, () => Date.now());
          setUsage(spent);
          writeUsage(user?.id, spent);
        } else {
          setFailure(messageFromResponse(resp.status, data));
        }
        return;
      }

      const reply = typeof data?.text === 'string' ? data.text.trim() : '';
      if (!reply) {
        setFailure('Jawaban dari Herr Deutsch datang kosong. Coba kirim pesanmu sekali lagi, ya.');
        return;
      }

      setMessages(prev => [...prev, { role: 'model', text: reply }]);
      if (!isPro) {
        const next = [...readUsage(user?.id), Date.now()];
        setUsage(next);
        writeUsage(user?.id, next);
      }
    } catch (error) {
      console.error('[CHAT] request failed:', error);
      setFailure('Koneksi ke Herr Deutsch terputus. Periksa jaringanmu, lalu coba kirim lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.text ?? '';

  return (
    <>
      {/* Floating button — fixed positioned */}
      <div className="fixed right-4 z-50" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 68px)' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex h-14 w-14 items-center justify-center bg-brand-rust transition-colors hover:bg-brand-ink"
          aria-label={isOpen ? 'Tutup chat Herr Deutsch' : 'Buka chat Herr Deutsch'}
          aria-expanded={isOpen}
          aria-controls="chat-panel"
        >
          <Bot className="h-6 w-6 text-brand-cream" aria-hidden="true" />
        </button>
      </div>

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

          {/* Floating chat window — anchored above button */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={panelRef}
                id="chat-panel"
                role="dialog"
                aria-modal="true"
                aria-label="Chat dengan Herr Deutsch"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="fixed z-[99999] flex flex-col overflow-hidden overscroll-contain border border-brand-ink/15 bg-white shadow-[0_20px_60px_-30px_rgba(10,10,10,0.55)]"
                style={{
                  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)',
                  right: '16px',
                  width: 'min(95vw, 400px)',
                  height: '500px',
                }}
              >
                {/* Header */}
                <div className="flex shrink-0 items-center gap-3 bg-brand-ink p-3 text-brand-cream">
                  <div className="flex h-9 w-9 items-center justify-center bg-brand-tan">
                    <Bot className="h-5 w-5 text-brand-ink" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="font-serif text-base font-bold">Herr Deutsch</h2>
                    <p className="text-[11px] text-cream-muted">Tutor bahasa Jerman · level {currentLevel || 'A1'}</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-cream-muted transition-colors hover:bg-brand-cream/10 hover:text-brand-cream"
                    aria-label="Tutup chat"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                {/* Quota — stated before anyone starts typing */}
                {!isPro && !paywall && (
                  <div
                    className={`flex shrink-0 items-baseline justify-between gap-2 border-b px-3 py-2 text-[11px] ${
                      remaining <= 2
                        ? 'border-brand-rust/20 bg-brand-rust/5 text-brand-rust'
                        : 'border-brand-ink/10 bg-brand-cream text-ink-muted'
                    }`}
                  >
                    <span className="font-bold tracking-wide uppercase">Paket gratis</span>
                    <span>
                      sisa {remaining} dari {FREE_CHAT_PER_HOUR} pesan jam ini
                    </span>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 space-y-3 overflow-y-auto p-3" aria-label="Riwayat chat" role="log" aria-live="polite">
                  {messages.length === 0 && (
                    <div className="mt-6 text-center">
                      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center bg-brand-tan/20">
                        <Bot className="h-5 w-5 text-brand-rust" aria-hidden="true" />
                      </div>
                      <p className="text-sm text-brand-ink">Ada yang mau ditanyakan?</p>
                      <p className="mx-auto mt-1 max-w-[16rem] text-xs leading-relaxed text-ink-muted">
                        Tata bahasa, kosakata, atau minta contoh kalimat. Jawabannya dalam bahasa Indonesia.
                      </p>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      role="article"
                      aria-label={msg.role === 'user' ? 'Pesan Anda' : 'Balasan Herr Deutsch'}
                    >
                      {msg.role === 'model' && (
                        <div className="mt-1 mr-2 flex h-6 w-6 shrink-0 items-center justify-center bg-brand-tan/20">
                          <Bot className="h-3 w-3 text-brand-rust" aria-hidden="true" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] px-3 py-2 text-sm ${
                          msg.role === 'user'
                            ? 'bg-brand-ink text-brand-cream'
                            : 'border border-brand-ink/10 bg-brand-cream text-brand-ink'
                        }`}
                      >
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start" role="status" aria-label="Herr Deutsch sedang mengetik">
                      <div className="mt-1 mr-2 flex h-6 w-6 shrink-0 items-center justify-center bg-brand-tan/20">
                        <Bot className="h-3 w-3 text-brand-rust" aria-hidden="true" />
                      </div>
                      <div className="border border-brand-ink/10 bg-brand-cream px-3 py-2">
                        <Loader2 className="h-4 w-4 animate-spin text-brand-rust" aria-hidden="true" />
                      </div>
                    </div>
                  )}

                  {/* A failed send is a failure, not a reply from the tutor. */}
                  {failure && (
                    <div className="border border-brand-rust/25 border-l-4 border-l-brand-rust bg-brand-rust/5 p-3">
                      <div className="flex gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-rust" aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs leading-relaxed text-ink-muted">{failure}</p>
                          {lastUserMessage && (
                            <button
                              type="button"
                              onClick={() => send(lastUserMessage, true)}
                              disabled={isLoading}
                              className="mt-2 text-xs font-bold text-brand-rust underline underline-offset-4 hover:text-brand-ink disabled:opacity-50"
                            >
                              Kirim ulang pesan terakhir
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Paywall — an explicit state with a way out, not a chat bubble */}
                {blocked ? (
                  <div className="shrink-0 border-t border-brand-ink/10 bg-brand-cream p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-brand-rust" aria-hidden="true" />
                      <h3 className="font-serif text-base font-bold text-brand-ink">Kuota chat gratis habis</h3>
                    </div>
                    <p className="text-xs leading-relaxed text-ink-muted">{paywall?.message}</p>
                    {formatReset(paywall?.resetAt) && (
                      <p className="mt-1 text-xs text-ink-subtle">Bisa mengobrol lagi {formatReset(paywall?.resetAt)}.</p>
                    )}
                    <Link
                      to="/pricing"
                      onClick={() => setIsOpen(false)}
                      className="mt-3 inline-flex h-10 w-full items-center justify-center bg-brand-rust px-4 text-sm font-bold text-brand-cream transition-colors hover:bg-brand-ink"
                    >
                      Lihat paket Pro <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                ) : (
                  <div className="shrink-0 border-t border-brand-ink/10 p-3">
                    <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
                      <label htmlFor="chat-input" className="sr-only">Ketik pesan ke Herr Deutsch</label>
                      {/* border-ink-subtle, not brand-ink/20: WCAG 1.4.11 wants 3:1
                          for the boundary that identifies a control, and #cecece
                          was 1.50:1 against the cream/40 fill. */}
                      <input
                        id="chat-input"
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ketik pertanyaanmu…"
                        className="flex-1 border border-ink-subtle bg-brand-cream/40 px-3 py-2 text-sm text-brand-ink placeholder:text-ink-subtle focus:border-brand-rust focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-rust/25"
                        disabled={isLoading}
                        aria-describedby="chat-hint"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-brand-ink px-3 py-2 text-brand-cream transition-colors hover:bg-brand-rust disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Kirim pesan"
                      >
                        <Send className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </form>
                    <p id="chat-hint" className="sr-only">Tekan Enter untuk mengirim</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>,
        document.body
      )}
    </>
  );
}
