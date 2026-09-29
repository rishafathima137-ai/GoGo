import { cva } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const tabsVariants = cva(
  'relative inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200',
  {
    variants: {
      active: {
        true: 'bg-ink text-white shadow-soft',
        false: 'text-ink-soft hover:bg-muted',
      },
    },
    defaultVariants: { active: false },
  },
)

export type SegmentedProps<T extends string> = {
  options: readonly { value: T; label: string; icon?: React.ReactNode }[]
  value: T
  onChange: (value: T) => void
  className?: string
  size?: 'sm' | 'md'
  ariaLabel: string
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = 'md',
  ariaLabel,
}: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('no-scrollbar inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-muted p-1', className)}
    >
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          type="button"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            tabsVariants({ active: value === option.value }),
            size === 'sm' && 'px-3 py-1.5 text-[13px]',
          )}
        >
          {option.icon}
          <span className="whitespace-nowrap">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
