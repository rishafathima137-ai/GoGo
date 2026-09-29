import { Link } from 'react-router-dom'
import { Clock, MapPin } from 'lucide-react'
import type { Destination } from '../../types'
import { cn, formatPrice } from '../../lib/utils'
import { SmartImage } from '../common/SmartImage'
import { Rating } from '../common/Rating'
import { SaveButton } from '../common/SaveButton'
import { Badge } from '../ui/Badge'
import { useSaved } from '../../context/SavedContext'

type Props = {
  destination: Destination
  className?: string
  size?: 'sm' | 'md' | 'lg'
  priority?: boolean
  showSave?: boolean
  variant?: 'rail' | 'grid' | 'wide'
}

const railWidths = {
  sm: 'w-[168px]',
  md: 'w-[220px] sm:w-[240px]',
  lg: 'w-[268px] sm:w-[300px]',
}

const imageRatios = {
  sm: 'aspect-[4/5]',
  md: 'aspect-[4/5]',
  lg: 'aspect-[4/5]',
}

export function DestinationCard({
  destination: d,
  className,
  size = 'md',
  priority = false,
  showSave = true,
  variant = 'rail',
}: Props) {
  const { isSaved, toggleSave } = useSaved()
  const saved = isSaved('destination', d.id)

  if (variant === 'wide') {
    return (
      <Link
        to={`/destination/${d.id}`}
        className={cn(
          'group flex items-stretch gap-3 overflow-hidden rounded-2xl border border-border/70 bg-card p-2.5 transition-all duration-200 hover:border-primary/30 hover:shadow-card',
          className,
        )}
      >
        <SmartImage
          src={d.images[0]}
          alt={`${d.name}, ${d.country}`}
          priority={priority}
          wrapperClassName="size-[86px] shrink-0 rounded-xl"
        />
        <div className="min-w-0 flex-1 py-1 pr-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-bold text-ink group-hover:text-accent-foreground">
                {d.name}
              </h3>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-muted">
                <MapPin className="size-3 shrink-0" />
                {d.country}
              </p>
            </div>
            {showSave ? (
              <SaveButton
                saved={saved}
                onToggle={() => toggleSave('destination', d.id)}
                size="sm"
                variant="plain"
                label={saved ? `Remove ${d.name} from saved` : `Save ${d.name}`}
              />
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <Rating value={d.rating} reviewCount={d.reviewCount} size="sm" />
            <span className="text-xs font-semibold text-ink-soft">
              from {formatPrice(d.priceFrom, d.currency)}
            </span>
          </div>
          <p className="mt-1.5 line-clamp-1 text-xs text-ink-muted">{d.tagline}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link
      to={`/destination/${d.id}`}
      className={cn(
        'group block overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift',
        variant === 'rail' ? railWidths[size] : 'w-full',
        className,
      )}
    >
      <div className="relative">
        <SmartImage
          src={d.images[0]}
          alt={`${d.name}, ${d.country}`}
          priority={priority}
          wrapperClassName={cn('w-full', imageRatios[size])}
          className="transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
        {d.isTrending ? (
          <Badge tone="dark" className="absolute left-3 top-3">
            Trending
          </Badge>
        ) : d.isBudget ? (
          <Badge tone="dark" className="absolute left-3 top-3">
            Great value
          </Badge>
        ) : null}
        {showSave ? (
          <SaveButton
            saved={saved}
            onToggle={() => toggleSave('destination', d.id)}
            size="sm"
            label={saved ? `Remove ${d.name} from saved` : `Save ${d.name}`}
            className="absolute right-3 top-3"
          />
        ) : null}
        <div className="absolute inset-x-3 bottom-3">
          <Rating value={d.rating} reviewCount={d.reviewCount} size="sm" tone="light" />
        </div>
      </div>
      <div className="p-3.5">
        <h3 className="truncate text-[15px] font-bold text-ink">{d.name}</h3>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
          <MapPin className="size-3 shrink-0" />
          <span className="truncate">
            {d.country} · {d.region}
          </span>
        </p>
        <div className="mt-2.5 flex items-end justify-between gap-2">
          <span className="text-sm font-bold text-accent-foreground">
            {formatPrice(d.priceFrom, d.currency)}
            <span className="text-[11px] font-medium text-ink-muted"> /day</span>
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-ink-muted">
            <Clock className="size-3" />
            {d.recommendedDuration}
          </span>
        </div>
      </div>
    </Link>
  )
}
