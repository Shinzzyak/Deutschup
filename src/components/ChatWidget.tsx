import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2 } from 'lucide-react';
import { useProgressStore } from '../stores/progressStore';
import { useAuthStore } from '../stores/authStore';
import { cn } from '../lib/utils';
import { supabase } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>([
    { role: 'model', text: 'Guten Tag! Saya Herr Deutsch, tutor bahasa Jerman Anda. Ada yang bisa saya bantu hari ini?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { currentLevel } = useProgressStore();
  const { user } = useAuthStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    if (!user) {
      alert("Silakan login untuk chatting bersama Herr Deutsch.");
      return;
    }
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
           message: userMsg,
           history: messages,
           level: currentLevel
        })
      });
      const data = await resp.json();
      
      if (!resp.ok) {
         setMessages(prev => [...prev, { role: 'model', text: data.error || "Maaf, terjadi kesalahan." }]);
         return;
      }
      
      setMessages(prev => [...prev, { role: 'model', text: data.text || "Maaf, Herr Deutsch sedang istirahat." }]);
    } catch(e) {
      setMessages(prev => [...prev, { role: 'model', text: "Maaf, terjadi kesalahan koneksi." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-2xl hover:scale-110 transition-transform z-40",
          isOpen && "hidden"
        )}
        aria-label="Buka chat Herr Deutsch"
      >
        <Bot className="w-8 h-8 text-yellow-400" />
      </button>

      <div className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[400px] h-[550px] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col z-50 transition-all duration-300 transform border border-slate-200 overflow-hidden",
        isOpen ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0 pointer-events-none"
      )}>
        <div className="bg-slate-900 p-4 flex items-center justify-between text-white border-b-4 border-red-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-bold">Herr Deutsch</h3>
              <p className="text-xs text-slate-400">Tutor Bahasa Jerman</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2" aria-label="Tutup chat">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl p-4 prose prose-sm",
                msg.role === 'user' ? "bg-blue-600 text-white rounded-br-sm" : "bg-white border border-slate-200 text-slate-800 rounded-bl-sm shadow-sm"
              )}>
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 rounded-bl-sm shadow-sm flex space-x-2 items-center">
                 <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                 <span className="text-slate-400 text-sm">Mengetik...</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <div className="flex items-center space-x-2">
            <input 
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Tanya Herr Deutsch..."
              className="flex-1 bg-slate-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
            <button 
              onClick={handleSend}
              disabled={isTyping || !input.trim()}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-colors shadow-md shadow-blue-100"
              aria-label="Kirim pesan"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
