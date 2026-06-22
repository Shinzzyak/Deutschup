import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useSearch, SearchResult } from './useSearch';
import { cn } from '../../lib/utils';

const typeLabels = {
  vocabulary: 'Kosakata',
  lesson: 'Pelajaran',
  verb: 'Verba',
};

const typeColors = {
  vocabulary: 'bg-blue-100 text-blue-700',
  lesson: 'bg-green-100 text-green-700',
  verb: 'bg-purple-100 text-purple-700',
};

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { search, recentSearches, addRecent } = useSearch();

  const results = search(query);
  const allResults = results.slice(0, 15);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (open) onClose();
        else onClose(); // parent handles open
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const handleSelect = (item: SearchResult) => {
    addRecent(query || item.primary);
    navigate(item.route);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, allResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && allResults[selectedIndex]) {
      handleSelect(allResults[selectedIndex]);
    }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[10vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari kosakata, pelajaran, atau verba..."
              className="flex-1 text-lg outline-none bg-transparent text-slate-900 placeholder:text-slate-400"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-slate-400 bg-slate-100 rounded-md">
              ESC
            </kbd>
            <button onClick={onClose} className="md:hidden p-1">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query && allResults.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                Tidak ada hasil untuk "{query}"
              </div>
            )}

            {!query && recentSearches.length > 0 && (
              <div className="p-3">
                <p className="text-xs font-medium text-slate-400 px-2 mb-2">Pencarian Terakhir</p>
                {recentSearches.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(r)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 text-left text-sm text-slate-700"
                  >
                    <Clock className="w-4 h-4 text-slate-400" />
                    {r}
                  </button>
                ))}
              </div>
            )}

            {allResults.length > 0 && (
              <div className="p-2">
                {(['vocabulary', 'lesson', 'verb'] as const).map(type => {
                  const items = allResults.filter(r => r.type === type);
                  if (items.length === 0) return null;
                  return (
                    <div key={type} className="mb-2">
                      <p className="text-xs font-medium text-slate-400 px-3 py-1">
                        {typeLabels[type]} ({items.length})
                      </p>
                      {items.map(item => {
                        const idx = allResults.indexOf(item);
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                              idx === selectedIndex ? "bg-amber-50" : "hover:bg-slate-50"
                            )}
                          >
                            {item.article && (
                              <span className={cn(
                                "text-xs font-bold px-1.5 py-0.5 rounded text-white",
                                item.article === 'der' ? 'bg-blue-500' :
                                item.article === 'die' ? 'bg-red-500' : 'bg-green-500'
                              )}>
                                {item.article}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 truncate">{item.primary}</p>
                              <p className="text-sm text-slate-500 truncate">{item.secondary}</p>
                            </div>
                            <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", typeColors[item.type])}>
                              {typeLabels[item.type]}
                            </span>
                            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
