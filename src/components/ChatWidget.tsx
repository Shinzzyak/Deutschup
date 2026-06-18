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
  const { user, profile } = useAuthStore();

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
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const resp = await fetch('/api/ai?action=chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg,
          history: messages.slice(-6),
          level: profile?.level || 'A1'
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
          className="w-14 h-14 bg-blue-600 rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <Bot className="w-6 h-6 text-white" />
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
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="fixed z-[99999] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden"
                style={{
                  bottom: 'calc(env(safe-area-inset-bottom, 0px) + 140px)',
                  right: '16px',
                  width: 'min(95vw, 400px)',
                  height: '500px',
                }}
              >
                {/* Header — German Gold accent */}
                <div className="bg-gradient-to-r from-[#F2C94C] to-yellow-500 text-[#1F2937] p-3 flex items-center gap-3 shrink-0">
                  {/* Bot avatar — circular, German flag inspired */}
                  <div className="w-9 h-9 rounded-full bg-[#1F2937] flex items-center justify-center ring-2 ring-[#F2C94C]/50">
                    <Bot className="w-5 h-5 text-[#F2C94C]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm">Herr Deutsch</h3>
                    <p className="text-[11px] text-[#1F2937]/60">Tutor Bahasa Jerman AI</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-[#1F2937]/60 hover:text-[#1F2937] transition-colors rounded-lg hover:bg-[#1F2937]/10"
                    aria-label="Tutup chat"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-gray-400 mt-6">
                      <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#F2C94C]/20 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-[#F2C94C]" />
                      </div>
                      <p className="text-sm">Ada yang bisa saya bantu?</p>
                      <p className="text-xs mt-1 text-gray-400/70">Grammar, vocab, atau latihan!</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      {msg.role === 'model' && (
                        <div className="w-6 h-6 rounded-full bg-[#F2C94C]/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                          <Bot className="w-3 h-3 text-[#F2C94C]" />
                        </div>
                      )}
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                        msg.role === 'user'
                          ? 'bg-[#1F2937] text-white rounded-br-md'
                          : 'bg-[#FFF8E1] text-[#1F2937] rounded-bl-md border border-[#F2C94C]/30'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="w-6 h-6 rounded-full bg-[#F2C94C]/20 flex items-center justify-center mr-2 mt-1 shrink-0">
                        <Bot className="w-3 h-3 text-[#F2C94C]" />
                      </div>
                      <div className="bg-[#FFF8E1] border border-[#F2C94C]/30 px-3 py-2 rounded-2xl rounded-bl-md">
                        <Loader2 className="w-4 h-4 animate-spin text-[#F2C94C]" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input — rounded-xl, compact */}
                <div className="p-3 border-t border-slate-200 dark:border-slate-700 shrink-0">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                      placeholder="Ketik pesan..."
                      className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F2C94C]/50 dark:bg-slate-800 dark:text-white text-sm"
                      disabled={isLoading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={isLoading || !input.trim()}
                      className="px-3 py-2 bg-[#1F2937] text-white rounded-xl hover:bg-[#1F2937]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
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
