import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Send, Bot, User, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { supabase } from '../lib/supabase';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function ChatWidget() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const { user, profile, tierData } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const clerk = (window as any).Clerk;
      const clerkToken = clerk?.session ? await clerk.session.getToken() : null;
      const chatHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-email': (window as any).__CLERK_USER_EMAIL || '',
      };
      if (clerkToken) chatHeaders['Authorization'] = `Bearer ${clerkToken}`;
      const resp = await fetch('/api/ai?action=chat', {
        method: 'POST',
        headers: chatHeaders,
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-6),
          level: profile?.level || 'A1',
          userTier: tierData?.tier || 'free'
        })
      });

      const data = await resp.json();
      if (resp.ok) {
        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', text: data.error || 'Maaf, ada kesalahan.' }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Gagal terhubung ke server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating button — fixed positioned */}
      <div className="fixed right-4 z-50" style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 68px)' }}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-[#8b2500] flex items-center justify-center hover:bg-[#8b2500]/80 transition-colors"
          aria-label={isOpen ? 'Tutup chat Herr Deutsch' : 'Buka chat Herr Deutsch'}
          aria-expanded={isOpen}
          aria-controls="chat-panel"
        >
          <Bot className="w-6 h-6 text-[#f5f0eb]" />
        </button>
      </div>

      {/* Popup — portal to body */}
      {createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`fixed inset-0 z-[99998] transition-opacity duration-200 ${
              isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
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
                aria-label="Chat dengan Herr Deutsch"
                aria-live="polite"
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="fixed z-[99999] glass-card flex flex-col overflow-hidden"
                style={{
                  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)',
                  right: '16px',
                  width: 'min(95vw, 400px)',
                  height: '500px',
                }}
              >
                {/* Header — German Gold accent */}
                <div className="bg-[#0a0a0a] text-[#f5f0eb] p-3 flex items-center gap-3 shrink-0">
                  {/* Bot avatar — circular, German flag inspired */}
                  <div className="w-9 h-9 bg-[#c8956c] flex items-center justify-center">
                    <Bot className="w-5 h-5 text-[#0a0a0a]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm">Herr Deutsch</h3>
                    <p className="text-[11px] text-[#f5f0eb]/60">Tutor Bahasa Jerman AI</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-[#f5f0eb]/60 hover:text-[#f5f0eb] transition-colors hover:bg-[#f5f0eb]/10"
                    aria-label="Tutup chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3" aria-label="Riwayat chat" role="log">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-6">
                      <div className="w-10 h-10 mx-auto mb-2 bg-[#c8956c]/10 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-[#c8956c]" />
                      </div>
                      <p className="text-sm">Ada yang bisa saya bantu?</p>
                      <p className="text-xs mt-1 text-gray-400/70">Grammar, vocab, atau latihan!</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`} role="article" aria-label={msg.role === 'user' ? 'Pesan Anda' : 'Balasan Herr Deutsch'}>
                      {msg.role === 'model' && (
                        <div className="w-6 h-6 bg-[#c8956c]/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                          <Bot className="w-3 h-3 text-[#c8956c]" />
                        </div>
                      )}
                      <div className={`max-w-[80%] px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-[#0a0a0a] text-[#f5f0eb]'
                          : 'bg-[#f5f0eb] text-[#0a0a0a] border border-[#0a0a0a]/10'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start" role="status" aria-label="Herr Deutsch sedang mengetik">
                      <div className="w-6 h-6 bg-[#c8956c]/10 flex items-center justify-center mr-2 mt-1 shrink-0">
                        <Bot className="w-3 h-3 text-[#c8956c]" />
                      </div>
                      <div className="bg-[#f5f0eb] border border-[#0a0a0a]/10 px-3 py-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#c8956c]" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input — , compact */}
                <div className="p-3 border-t border-[#0a0a0a]/10 border-[#0a0a0a]/10 shrink-0">
                  <form onSubmit={(e) => { e.preventDefault(); sendMessage(); }} className="flex gap-2">
                    <label htmlFor="chat-input" className="sr-only">Ketik pesan ke Herr Deutsch</label>
                    <input
                      id="chat-input"
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ketik pesan..."
                      className="flex-1 px-3 py-2 border-2 border-[#0a0a0a]/20 focus:outline-none focus:ring-2 focus:ring-[#8b2500]/20 bg-[#f5f0eb] text-sm"
                      disabled={isLoading}
                      aria-describedby="chat-hint"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="px-3 py-2 bg-[#8b2500] hover:bg-[#8b2500]/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[#f5f0eb]"
                      aria-label="Kirim pesan"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                  <p id="chat-hint" className="sr-only">Tekan Enter untuk mengirim</p>
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
