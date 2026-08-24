import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertTriangle } from "lucide-react"
import { Button } from "./button"

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}

function ErrorState({
  title = "Terjadi kesalahan",
  description = "Gagal memuat data. Silakan coba lagi.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <div className="bg-[#8b2500]/10 border border-[#8b2500]/20 p-4 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Coba Lagi
        </Button>
      )}
    </div>
  )
}

export { ErrorState }
