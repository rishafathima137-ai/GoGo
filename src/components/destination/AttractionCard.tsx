import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import type { Attraction } from '../../types'
import { cn, formatPrice } from '../../lib/utils'
import { SmartImage } from '../common/SmartImage'
import { Rating } from '../common/Rating'
import { SaveButton } from '../common/SaveButton'
import { useSaved } from '../../context/SavedContext'

export function AttractionCard({
  attraction: a,
  destinationId,
  className,
  width = 'w-[240px]',
}: {
  attraction: Attraction
  destinationId: string
  className?: string
  width?: string
}) {
  const { isSaved, toggleSave } = useSaved()
  const saved = isSaved('attraction', a.id)

  return (
    <Link
      to={`/destination/${destinationId}#place-${a.id}`}
      className={cn(
        'group block overflow-hidden rounded-2xl bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift',
        width,
        className,
      )}
    >
      <div className="relative">
        <SmartImage
          src={a.image}
          alt={a.name}
          wrapperClassName="aspect-[16/11] w-full"
          className="transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <SaveButton
          saved={saved}
          onToggle={() => toggleSave('attraction', a.id)}
          size="sm"
          label={saved ? `Remove ${a.name} from saved` : `Save ${a.name}`}
          className="absolute right-2.5 top-2.5"
        />
        {a.category ? (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white/92 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-ink backdrop-blur">
            <Compass className="size-3 text-primary" />
            {a.category}
          </span>
        ) : null}
      </div>
      <div className="p-3.5">
        <h3 className="line-clamp-1 text-[14.5px] font-bold text-ink">{a.name}</h3>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">{a.description}</p>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <Rating value={a.rating} size="sm" />
          <span className="text-[13px] font-bold text-accent-foreground">
            {a.price > 0 ? formatPrice(a.price) : 'Free'}
          </span>
        </div>
      </div>
    </Link>
  )
}
