import { Star } from 'lucide-react'
import { cn, formatCompact } from '../../lib/utils'

type Size = 'sm' | 'md' | 'lg'

const sizes: Record<Size, { star: string; text: string }> = {
  sm: { star: 'size-3', text: 'text-xs' },
  md: { star: 'size-3.5', text: 'text-[13px]' },
  lg: { star: 'size-4', text: 'text-sm' },
}

export function Rating({
  value,
  reviewCount,
  size = 'md',
  className,
  tone = 'dark',
}: {
  value: number
  reviewCount?: number
  size?: Size
  className?: string
  tone?: 'dark' | 'light'
}) {
  const { star, text } = sizes[size]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-semibold',
        text,
        tone === 'light' ? 'text-white' : 'text-ink',
        className,
      )}
    >
      <Star className={cn(star, 'fill-amber-400 text-amber-400')} aria-hidden />
      <span>{value.toFixed(1)}</span>
      {reviewCount !== undefined ? (
        <span className={cn('font-medium', tone === 'light' ? 'text-white/70' : 'text-ink-muted')}>
          ({formatCompact(reviewCount)})
        </span>
      ) : null}
      <span className="sr-only">out of 5, {reviewCount ? `${reviewCount} reviews` : 'no review count'}</span>
    </span>
  )
}
