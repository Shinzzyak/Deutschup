import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Smallest page count at which the control is shown */
  className?: string;
  'aria-label'?: string;
};

/** Build a compact page list with ellipsis, e.g. 1 … 4 5 6 … 20 */
function buildPages(page: number, pageCount: number): (number | '…')[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  const pages: (number | '…')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) pages.push('…');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < pageCount - 1) pages.push('…');
  pages.push(pageCount);
  return pages;
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
  className,
  'aria-label': ariaLabel = 'Navigasi halaman',
}: PaginationProps) {
  if (pageCount <= 1) return null;

  const pages = buildPages(page, pageCount);
  const go = (next: number) => {
    const clamped = Math.min(pageCount, Math.max(1, next));
    if (clamped !== page) onPageChange(clamped);
  };

  const baseBtn =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-sm font-bold transition-colors disabled:opacity-40 disabled:pointer-events-none';

  return (
    <nav
      className={cn('flex items-center justify-center gap-1.5 flex-wrap', className)}
      role="navigation"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className={cn(baseBtn, 'border-border bg-card text-foreground hover:bg-muted')}
        onClick={() => go(page - 1)}
        disabled={page <= 1}
        aria-label="Halaman sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="px-1.5 text-muted-foreground select-none" aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={cn(
              baseBtn,
              p === page
                ? 'border-[#8b2500] bg-[#8b2500] text-[#f5f0eb] hover:bg-[#8b2500]/90'
                : 'border-border bg-card text-foreground hover:bg-muted',
            )}
            onClick={() => go(p)}
            aria-current={p === page ? 'page' : undefined}
            aria-label={`Halaman ${p}`}
          >
            {p}
          </button>
        ),
      )}

      <button
        type="button"
        className={cn(baseBtn, 'border-border bg-card text-foreground hover:bg-muted')}
        onClick={() => go(page + 1)}
        disabled={page >= pageCount}
        aria-label="Halaman berikutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}

export default Pagination;
