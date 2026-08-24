import { Skeleton } from '@/components/ui/skeleton';

/**
 * Dashboard skeleton — deliberately traces the real Dashboard: the dark
 * "continue learning" block, the four-cell number strip, then the four level
 * rows. Anything else shifts the layout the moment data lands.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8 md:space-y-12" aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat progres belajar…</span>

      {/* 1. Continue-learning block */}
      <section className="bg-brand-ink">
        <div className="flex h-1.5 w-full" aria-hidden="true">
          <div className="flex-1 bg-brand-cream" />
          <div className="flex-1 bg-brand-rust" />
          <div className="flex-1 bg-brand-tan" />
        </div>
        <div className="p-6 md:p-10">
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <Skeleton className="h-4 w-40 bg-brand-cream/15" />
            <Skeleton className="h-6 w-24 bg-brand-cream/15" />
          </div>
          <Skeleton className="h-4 w-32 bg-brand-cream/15" />
          <Skeleton className="mt-4 h-10 w-4/5 bg-brand-cream/15 md:h-14" />
          <Skeleton className="mt-3 h-4 w-52 bg-brand-cream/15" />
          <Skeleton className="mt-8 h-14 w-56 bg-brand-cream/15" />
          <div className="mt-8 max-w-md">
            <Skeleton className="h-3 w-full bg-brand-cream/15" />
          </div>
        </div>
      </section>

      {/* 2. Number strip */}
      <div className="grid grid-cols-2 gap-px bg-brand-ink/10 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-brand-cream p-4 md:p-5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-8 w-16" />
            <Skeleton className="mt-3 h-3 w-24" />
          </div>
        ))}
      </div>

      {/* 3. Level rows */}
      <div>
        <div className="mb-5 border-b border-brand-ink/10 pb-3">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="mt-2 h-3 w-64" />
        </div>
        <div className="grid gap-px bg-brand-ink/10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-4 bg-brand-cream p-5">
              <Skeleton className="h-12 w-12 shrink-0" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 h-3 w-full max-w-xs" />
                <Skeleton className="mt-4 h-1.5 w-full" />
                <Skeleton className="mt-3 h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Vocab trainer skeleton — search + word cards
export function VocabSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full " />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-5 bg-brand-cream border border-brand-ink/10">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48 mb-3" />
            <Skeleton className="h-3 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

// Verb trainer skeleton — verb table + conjugation
export function VerbSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-12 w-full " />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-6 bg-brand-cream border border-brand-ink/10">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-5 w-16 " />
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(18)].map((_, j) => (
              <div key={j} className="flex justify-between">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Level view skeleton — lesson cards + progress
export function LevelSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full " />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 bg-brand-cream border border-brand-ink/10">
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 " />
              <div className="flex-1">
                <Skeleton className="h-5 w-40 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Pricing skeleton — pricing cards
export function PricingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-8 bg-brand-cream border border-brand-ink/10">
          <Skeleton className="h-6 w-24 mb-2" />
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-6" />
          <Skeleton className="h-12 w-full " />
        </div>
      ))}
    </div>
  );
}
