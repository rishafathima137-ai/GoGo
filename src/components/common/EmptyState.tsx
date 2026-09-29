import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/Button'

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionHref,
  className,
  compact = false,
}: {
  icon?: ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  actionHref?: string
  className?: string
  compact?: boolean
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/40 text-center',
        compact ? 'px-5 py-8' : 'px-6 py-14',
        className,
      )}
    >
      <div className="grid size-14 place-items-center rounded-2xl bg-primary-soft text-accent-foreground">
        {icon ?? <Compass className="size-6" />}
      </div>
      <h3 className="mt-4 text-base font-bold text-ink">{title}</h3>
      {description ? (
        <p className="mt-1 max-w-sm text-[13px] leading-relaxed text-ink-muted">{description}</p>
      ) : null}
      {actionLabel && (onAction || actionHref) ? (
        actionHref ? (
          <Link to={actionHref} className="mt-5">
            <Button size="sm">{actionLabel}</Button>
          </Link>
        ) : (
          <Button className="mt-5" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        )
      ) : null}
    </div>
  )
}
