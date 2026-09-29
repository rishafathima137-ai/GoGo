import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export function SectionHeader({
  title,
  subtitle,
  actionLabel,
  actionHref,
  onAction,
  className,
  size = 'md',
}: {
  title: string
  subtitle?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
  size?: 'md' | 'lg'
}) {
  return (
    <div
      className={cn(
        'mb-3 flex items-end justify-between gap-4 sm:mb-4',
        className,
      )}
    >
      <div className="min-w-0">
        <h2
          className={cn(
            'font-extrabold tracking-tight text-ink',
            size === 'lg' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl',
          )}
        >
          {title}
        </h2>
        {subtitle ? <p className="mt-0.5 text-[13px] text-ink-muted">{subtitle}</p> : null}
      </div>
      {actionHref && actionLabel ? (
        <Link
          to={actionHref}
          className="group inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-primary transition-colors hover:text-teal-700"
        >
          {actionLabel}
          <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </Link>
      ) : actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="group inline-flex shrink-0 items-center gap-0.5 text-[13px] font-semibold text-primary transition-colors hover:text-teal-700"
        >
          {actionLabel}
          <ChevronRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </button>
      ) : null}
    </div>
  )
}
