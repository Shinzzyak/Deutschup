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
   (TopNav search button, Cmd/Ctrl+K, "/") but it never got the token sweep the
   pages did, so it still carried the ad-hoc `text-[#0a0a0a]/NN` ramp the brand
   tokens exist to replace. Measured on the white panel with WCAG 2.1:
     text-[#0a0a0a]/20  1.57:1   text-[#0a0a0a]/40  2.71:1
     text-[#0a0a0a]/25  1.79:1   text-[#0a0a0a]/50  3.71:1
     text-[#0a0a0a]/30  2.04:1   text-[#0a0a0a]/70  7.63:1  (the only one passing)
   Replacements: --ink-muted 6.96:1 for copy, --ink-subtle 5.14:1 for the
   smallest labels and for icons (3:1 floor).

   The type chips used raw Tailwind ramps (blue-700 / green-700 / purple-700);
   green-700 on its own tint measured 4.38:1, under AA. They now use the same
   measured tone ramp as the admin surfaces, each on its own tint:
     Kosakata  #1e40af on #e8eefb  7.50:1
     Pelajaran #1a6b3d on #e6f4ec  5.76:1
     Verba     #8b2500 on #f6e8e3  7.44:1
   The chip always prints its Indonesian label, so colour is never the carrier. */
const typeColors = {
  vocabulary: 'bg-[#e8eefb] text-[#1e40af]',
  lesson: 'bg-[#e6f4ec] text-[#1a6b3d]',
  verb: 'bg-[#f6e8e3] text-[#8b2500]',
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
        className="fixed inset-0 z-50 bg-black/35 backdrop-blur-sm flex items-start justify-center overscroll-contain pt-[10vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          /* `.glass-heavy` is rgba(255,255,255,0.55) with brightness(1.08) on its
             backdrop. Over the bg-black/35 scrim above, that composites to
             #dddddd — not white — and --ink-subtle drops to 3.77:1 there. Every
             other dialog in this app already pins `bg-white!` for exactly this
             reason (AdminUI, AddSecretModal, ValidateSecretModal, Simulasi);
             the `!` is needed because .glass-heavy is declared outside every
             cascade layer and outranks a plain utility. On real white
             --ink-subtle is 5.14:1 and --ink-muted 6.96:1.
             `rounded-none!` keeps the square corner the brand asks for. */
          className="glass-heavy bg-white! rounded-none! w-full max-w-xl overflow-hidden"
          onClick={e => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Cari materi"
        >
          {/* Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-brand-ink/10">
            <Search className="w-5 h-5 text-ink-subtle shrink-0" />
            <label htmlFor="site-search" className="sr-only">Cari materi</label>
            <input
              id="site-search"
              ref={inputRef}
              type="text"
              placeholder="Cari kosakata, pelajaran, atau verba..."
              className="flex-1 text-lg outline-none bg-transparent text-brand-ink placeholder:text-ink-subtle"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <kbd className="glass-subtle hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs text-ink-subtle">
              ESC
            </kbd>
            <button onClick={onClose} className="md:hidden p-1" aria-label="Tutup pencarian">
              <X className="w-5 h-5 text-ink-subtle" />
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
              <div className="p-3">
                <p className="text-xs font-medium text-ink-subtle px-2 mb-2">Pencarian Terakhir</p>
                {recentSearches.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => setQuery(r)}
                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-primary/5 text-left text-sm text-ink-muted"
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
                      <p className="text-xs font-medium text-ink-subtle px-3 py-1">
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
                              idx === selectedIndex ? "bg-brand-tan/15" : "hover:bg-primary/5"
                            )}
                          >
                            {/* Same der/die/das plate as VocabTrainerDB, so the
                                two screens teach the same colour. The old `das`
                                plate was #fafafa on #2d8a4e = 4.14:1, under AA;
                                these are ink/cream 17.48:1, rust/cream 7.85:1,
                                tan/ink 7.52:1. The article word is printed
                                inside the plate, so colour is redundant. */}
                            {item.article && (
                              <span className={cn(
                                "text-xs font-bold px-1.5 py-0.5",
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
                            <span className={cn("text-xs font-medium px-2 py-0.5 ", typeColors[item.type])}>
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
