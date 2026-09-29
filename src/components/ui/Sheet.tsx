import { X } from 'lucide-react'
import { useEffect, type ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function Sheet({
  open,
  onClose,
  title,
  description,
  children,
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close panel"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] animate-fade-in"
      />
      <div
        className={cn(
          'relative z-10 flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-3xl bg-background shadow-lift sm:max-w-lg sm:rounded-3xl',
          'animate-fade-up',
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border/70 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-ink">{title}</h2>
            {description ? <p className="mt-0.5 text-[13px] text-ink-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-1 -mt-1 grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-muted hover:text-ink"
          >
            <X className="size-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-border/70 px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}
