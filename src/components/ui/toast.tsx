import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react"
import { CheckCircle2, CircleAlert, Info, X } from "lucide-react"

import { cn } from "@/lib/utils"

type ToastVariant = "default" | "success" | "error"

export interface ToastOptions {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  duration?: number
  variant?: ToastVariant
}

interface ToastEntry extends ToastOptions {
  id: string
}

interface ToastContextValue {
  toast: (options: ToastOptions | string) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)
let nextToastId = 0

const variantStyles: Record<ToastVariant, string> = {
  default: "border-border bg-background text-foreground",
  success: "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-50",
  error: "border-destructive/40 bg-destructive/10 text-foreground",
}

const variantIcons: Record<ToastVariant, typeof Info> = {
  default: Info,
  success: CheckCircle2,
  error: CircleAlert,
}

/**
 * App-level notification provider. Keep this mounted once near the React root so
 * route changes do not discard active notifications.
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<ToastEntry[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  const dismiss = useCallback((id: string) => {
    const timer = timers.current.get(id)
    if (timer) clearTimeout(timer)
    timers.current.delete(id)
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const toast = useCallback(
    (options: ToastOptions | string) => {
      const normalized = typeof options === "string" ? { title: options } : options
      const id = `toast-${Date.now()}-${nextToastId++}`
      const duration = normalized.duration ?? 5000

      setToasts((current) => [...current, { ...normalized, id }])
      if (duration > 0) {
        timers.current.set(id, setTimeout(() => dismiss(id), duration))
      }

      return id
    },
    [dismiss],
  )

  useEffect(() => {
    const activeTimers = timers.current
    return () => {
      activeTimers.forEach(clearTimeout)
      activeTimers.clear()
    }
  }, [])

  const value = useMemo(() => ({ toast, dismiss }), [dismiss, toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-label="Notifikasi"
        className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex flex-col items-end gap-2 sm:left-auto sm:w-full sm:max-w-sm"
      >
        {toasts.map((item) => {
          const variant = item.variant ?? "default"
          const Icon = variantIcons[variant]

          return (
            <div
              key={item.id}
              role={variant === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex w-full items-start gap-3 border p-4 shadow-lg",
                variantStyles[variant],
              )}
            >
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold">{item.title}</div>
                {item.description ? (
                  <div className="mt-1 text-sm opacity-80">{item.description}</div>
                ) : null}
                {item.action ? <div className="mt-3">{item.action}</div> : null}
              </div>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                className="shrink-0 opacity-60 transition-opacity hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={() => dismiss(item.id)}
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext)
  if (!context) throw new Error("useToast must be used within ToastProvider")
  return context
}
