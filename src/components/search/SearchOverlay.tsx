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

/* LIGHT-NATIVE. This overlay is reachable from every authenticated screen
   (TopNav search button, Cmd/Ctrl+K, "/") — a chrome surface, so it may use
   glass per DESIGN-LANGUAGE.md Amandemen 1. Cleaned to brand tokens:
   - panel: bg-surface-0 (solid, not white-on-scrim) + hairline ink/20
   - type labels: neutral, so category is carried by text instead of colored stickers
   - article plates: der/die/das same teaching colours as VocabTrainerDB
   - spacing: full steps only (p-2, gap-2, min-h-11 rows) */
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
        className="fixed inset-0 z-50 bg-brand-ink/60 backdrop-blur-xs flex items-start justify-center overscroll-contain pt-4 sm:pt-[10vh] px-3 sm:px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="w-full max-w-xl overflow-hidden bg-surface-0 border border-brand-ink/20 shadow-2xl"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Cari materi"
        >
          {/* Input */}
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 border-b border-brand-ink/10 bg-brand-cream/30">
            <Search className="w-4 h-4 text-ink-subtle shrink-0" />
            <label htmlFor="site-search" className="sr-only">Cari materi</label>
            <input
              id="site-search"
              ref={inputRef}
              type="text"
              placeholder="Cari kosakata, pelajaran, atau verba..."
              className="flex-1 text-sm md:text-base outline-none bg-transparent text-brand-ink placeholder:text-ink-subtle/70"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <kbd className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-ink-subtle bg-surface-2 border border-brand-ink/10">
              ESC
            </kbd>
            <button onClick={onClose} className="p-1 text-ink-subtle hover:text-brand-ink transition-colors" aria-label="Tutup pencarian">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[60vh] overflow-y-auto">
            {query && allResults.length === 0 && (
              <div className="p-8 text-center text-ink-subtle">
                Tidak ada hasil untuk "{query}"
              </div>
            )}

            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-subtle px-2 mb-2">Pencarian Terakhir</p>
                {recentSearches.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(r)}
                    className="w-full flex items-center gap-2 px-3 min-h-11 text-left text-sm text-ink-muted hover:bg-surface-2"
                  >
                    <Clock className="w-4 h-4 text-ink-subtle" />
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
                      <p className="text-xs font-bold uppercase tracking-[0.2em] text-ink-subtle px-3 py-1">
                        {typeLabels[type]} ({items.length})
                      </p>
                      {items.map(item => {
                        const idx = allResults.indexOf(item);
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleSelect(item)}
                            className={cn(
                              "w-full flex items-center gap-3 px-3 min-h-11 text-left transition-colors",
                              idx === selectedIndex ? "bg-surface-2" : "hover:bg-surface-2"
                            )}
                          >
                            {/* Same der/die/das plate as VocabTrainerDB, so the
                                two screens teach the same colour. The article
                                word is printed inside the plate, so colour is
                                redundant. */}
                            {item.article && (
                              <span className={cn(
                                "text-xs font-bold px-2 py-1",
                                item.article === 'der' ? 'bg-brand-ink text-brand-cream' :
                                item.article === 'die' ? 'bg-brand-rust text-brand-cream' :
                                'bg-brand-tan text-brand-ink'
                              )}>
                                {item.article}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-brand-ink truncate">{item.primary}</p>
                              <p className="text-sm text-ink-muted truncate">{item.secondary}</p>
                            </div>
                            <span className="border border-brand-ink/20 px-2 py-1 text-xs font-medium text-ink-muted">
                              {typeLabels[item.type]}
                            </span>
                            <ArrowRight className="w-4 h-4 text-ink-subtle shrink-0" />
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
