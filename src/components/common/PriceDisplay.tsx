import { cn, formatPrice } from '../../lib/utils'

export function PriceDisplay({
  amount,
  currency = 'USD',
  suffix,
  prefix,
  size = 'md',
  className,
  note,
}: {
  amount: number
  currency?: string
  suffix?: string
  prefix?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  note?: string
}) {
  const sizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-[26px] leading-tight',
  }
  return (
    <span className={cn('inline-flex flex-col', className)}>
      <span className={cn('font-bold tracking-tight text-ink', sizes[size])}>
        {prefix}
        {formatPrice(amount, currency)}
        {suffix ? <span className="ml-1 text-sm font-medium text-ink-muted">{suffix}</span> : null}
      </span>
      {note ? <span className="text-xs font-medium text-ink-muted">{note}</span> : null}
    </span>
  )
}
