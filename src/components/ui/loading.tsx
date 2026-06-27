import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { Skeleton } from "./skeleton"

/** Full page loading spinner */
function PageLoading({ className }: { className?: string }) {
  return (
    <div className={cn("min-h-[400px] flex items-center justify-center", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

/** Section loading spinner */
function SectionLoading({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center py-8", className)}>
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  )
}

/** Button loading spinner (inline) */
function ButtonLoading({ className }: { className?: string }) {
  return <Loader2 className={cn("h-4 w-4 animate-spin", className)} />
}

/** Card skeleton placeholder */
function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn(" border bg-card p-6 space-y-4", className)}>
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

/** Table skeleton placeholder */
function TableSkeleton({ rows = 5, className }: { rows?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/6" />
        </div>
      ))}
    </div>
  )
}

export { PageLoading, SectionLoading, ButtonLoading, CardSkeleton, TableSkeleton }
