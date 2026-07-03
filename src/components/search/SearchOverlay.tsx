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
  vocabulary: 'bg-[#0a0a0a]/5 text-blue-700',
  lesson: 'bg-[#2d8a4e]/10 text-green-700',
  verb: 'bg-[#0a0a0a]/5 text-purple-700',
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
        className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-start justify-center pt-[10vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          className="glass-heavy w-full max-w-xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-[#0a0a0a]/10">
            <Search className="w-5 h-5 text-[#0a0a0a]/40 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Cari kosakata, pelajaran, atau verba..."
              className="flex-1 text-lg outline-none bg-transparent text-[#0a0a0a] placeholder:text-[#0a0a0a]/40"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <kbd className="glass-subtle hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-[#0a0a0a]/40">
              ESC
            </kbd>
            <button onClick={onClose} className="md:hidden p-1">
              <X className="w-5 h-5 text-[#0a0a0a]/40" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query && allResults.length === 0 && (
              <div className="p-8 text-center text-[#0a0a0a]/40">
                Tidak ada hasil untuk "{query}"
              </div>
            )}

            {!query && recentSearches.length > 0 && (
              <div className="p-3">
                <p className="text-xs font-medium text-[#0a0a0a]/40 px-2 mb-2">Pencarian Terakhir</p>
                {recentSearches.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(r)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#0a0a0a]/5 text-left text-sm text-[#0a0a0a]/70"
                  >
                    <Clock className="w-4 h-4 text-[#0a0a0a]/40" />
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
                      <p className="text-xs font-medium text-[#0a0a0a]/40 px-3 py-1">
                        {typeLabels[type]} ({items.length})
                      </p>
                      {items.map(item => {
                        const idx = allResults.indexOf(item);
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                              idx === selectedIndex ? "bg-[#c8956c]/10" : "hover:bg-[#0a0a0a]/5"
                            )}
                          >
                            {item.article && (
                              <span className={cn(
                                "text-xs font-bold px-1.5 py-0.5 rounded bg-[#0a0a0a] text-[#f5f0eb]",
                                item.article === 'der' ? 'bg-[#0a0a0a]/70' :
                                item.article === 'die' ? 'bg-[#8b2500]' : 'bg-[#2d8a4e]'
                              )}>
                                {item.article}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-[#0a0a0a] truncate">{item.primary}</p>
                              <p className="text-sm text-[#0a0a0a]/50 truncate">{item.secondary}</p>
                            </div>
                            <span className={cn("text-xs font-medium px-2 py-0.5 ", typeColors[item.type])}>
                              {typeLabels[item.type]}
                            </span>
                            <ArrowRight className="w-4 h-4 text-[#0a0a0a]/30 shrink-0" />
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
