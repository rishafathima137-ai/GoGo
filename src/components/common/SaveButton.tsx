import { Heart } from 'lucide-react'
import { cn } from '../../lib/utils'

type Props = {
  saved: boolean
  onToggle: () => void
  label?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'glass' | 'solid' | 'plain'
  className?: string
}

const sizes = {
  sm: 'size-8 [&_svg]:size-4',
  md: 'size-10 [&_svg]:size-[18px]',
  lg: 'size-12 [&_svg]:size-5',
}

const variants = {
  glass: 'bg-white/85 text-ink backdrop-blur-md hover:bg-white',
  solid: 'bg-white text-ink shadow-card hover:bg-white/90',
  plain: 'bg-transparent text-ink-soft hover:bg-muted',
}

export function SaveButton({
  saved,
  onToggle,
  label = 'Toggle save',
  size = 'md',
  variant = 'glass',
  className,
}: Props) {
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        onToggle()
      }}
      className={cn(
        'grid shrink-0 place-items-center rounded-full transition-all duration-200 active:scale-90',
        sizes[size],
        variants[variant],
        saved && 'text-rose-500',
        className,
      )}
    >
      <Heart className={cn('transition-transform duration-200', saved && 'fill-rose-500 scale-110')} />
    </button>
  )
}
