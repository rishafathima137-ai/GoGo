import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: 'neutral' | 'primary' | 'warning' | 'dark' | 'white' }) {
  const tones = {
    neutral: 'bg-muted text-ink-soft',
    primary: 'bg-primary-soft text-accent-foreground',
    warning: 'bg-amber-50 text-amber-700',
    dark: 'bg-ink/80 text-white backdrop-blur-sm',
    white: 'bg-white/95 text-ink shadow-soft',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
