import { cn } from '../../lib/utils'

export function LoadingState({ label = 'Loading…', className }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}
    >
      <div className="relative flex size-10 items-center justify-center">
        <span className="absolute size-10 animate-ping rounded-full bg-primary/20" />
        <span className="size-2.5 rounded-full bg-primary" />
      </div>
      <p className="text-sm font-medium text-ink-muted">{label}</p>
    </div>
  )
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton rounded-2xl', className)} aria-hidden />
}
