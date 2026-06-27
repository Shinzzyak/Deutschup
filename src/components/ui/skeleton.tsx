import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-[#0a0a0a]/5", className)}
      {...props}
    />
  )
}

export { Skeleton }
