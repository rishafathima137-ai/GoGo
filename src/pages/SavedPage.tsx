import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BedDouble,
  Bookmark,
  Heart,
  MapPin,
  Sparkles,
  Trash2,
  UtensilsCrossed,
} from 'lucide-react'
import type { SavedEntry } from '../types'
import { useSaved } from '../context/SavedContext'
import { useTrips } from '../context/TripsContext'
import { destinations, getDestination, allAttractions } from '../data/destinations'
import { getHotel } from '../data/hotels'
import { restaurants } from '../data/restaurants'
import { cn, formatPrice } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Segmented } from '../components/ui/Segmented'
import { SmartImage } from '../components/common/SmartImage'
import { Rating } from '../components/common/Rating'
import { EmptyState } from '../components/common/EmptyState'
import { SectionHeader } from '../components/common/SectionHeader'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'destination', label: 'Destinations' },
  { value: 'attraction', label: 'Places' },
  { value: 'hotel', label: 'Hotels' },
  { value: 'restaurant', label: 'Restaurants' },
  { value: 'trip', label: 'Trips' },
] as const

type Filter = (typeof FILTERS)[number]['value']

type Resolved = {
  entry: SavedEntry
  title: string
  subtitle: string
  image: string
  meta: string
  rating?: number
  href: string
}

const TYPE_ICON = {
  destination: MapPin,
  attraction: Sparkles,
  hotel: BedDouble,
  restaurant: UtensilsCrossed,
  trip: MapPin,
} as const

export default function SavedPage() {
  const { saved, remove, clear } = useSaved()
  const { getTrip } = useTrips()
  const [filter, setFilter] = useState<Filter>('all')
  const [confirmClear, setConfirmClear] = useState(false)

  const items = useMemo<Resolved[]>(
    () =>
      saved
        .map((entry): Resolved | null => {
          switch (entry.type) {
            case 'destination': {
              const d = getDestination(entry.id)
              if (!d) return null
              return {
                entry,
                title: d.name,
                subtitle: `${d.country} · ${d.tagline}`,
                image: d.images[0],
                meta: `${formatPrice(d.priceFrom, d.currency)} / day · ${d.recommendedDuration}`,
                rating: d.rating,
                href: `/destination/${d.id}`,
              }
            }
            case 'attraction': {
              const a =
                allAttractions.find((x) => x.id === entry.id) ??
                destinations.flatMap((d) => d.bestPlaces).find((p) => p.id === entry.id)
              if (!a) return null
              return {
                entry,
                title: a.name,
                subtitle: `${'destinationName' in a ? a.destinationName : entry.id}`,
                image: a.image,
                meta: 'price' in a && a.price > 0 ? formatPrice(a.price) : 'Free',
                rating: a.rating,
                href: `/destination/${'destinationName' in a ? destinations.find((d) => d.name === a.destinationName)?.id ?? '' : ''}#place-${a.id}`,
              }
            }
            case 'hotel': {
              const h = getHotel(entry.id)
              if (!h) return null
              const d = getDestination(h.destinationId)
              return {
                entry,
                title: h.name,
                subtitle: `${d?.name ?? ''} · ${h.type}`,
                image: h.image,
                meta: `${formatPrice(h.pricePerNight)} / night`,
                rating: h.guestRating,
                href: `/hotels?destination=${h.destinationId}&hotel=${h.id}`,
              }
            }
            case 'restaurant': {
              const r = restaurants.find((x) => x.id === entry.id)
              if (!r) return null
              const d = getDestination(r.destinationId)
              return {
                entry,
                title: r.name,
                subtitle: `${d?.name ?? ''} · ${r.cuisine}`,
                image: r.image,
                meta: `${formatPrice(r.avgCost)} avg`,
                rating: r.rating,
                href: `/destination/${r.destinationId}`,
              }
            }
            case 'trip': {
              const t = getTrip(entry.id)
              if (!t) return null
              return {
                entry,
                title: t.title,
                subtitle: `${t.destinationName}, ${t.country}`,
                image: t.cover,
                meta: `${t.days.length} days · ${t.travelers} travellers`,
                href: `/trips/${t.id}`,
              }
            }
            default:
              return null
          }
        })
        .filter((x): x is Resolved => x !== null),
    [saved, getTrip],
  )

  const filtered = filter === 'all' ? items : items.filter((i) => i.entry.type === filter)

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length }
    items.forEach((i) => {
      c[i.entry.type] = (c[i.entry.type] ?? 0) + 1
    })
    return c
  }, [items])

  return (
    <div className="container py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Saved</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {items.length} {items.length === 1 ? 'item' : 'items'} kept for later
          </p>
        </div>
        {items.length > 0 ? (
          confirmClear ? (
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-semibold text-rose-600">Remove everything?</span>
              <Button size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>
                Cancel
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => {
                  clear()
                  setConfirmClear(false)
                }}
              >
                Clear all
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setConfirmClear(true)}>
              <Trash2 className="size-4" />
              Clear all
            </Button>
          )
        ) : null}
      </div>

      {items.length > 0 ? (
        <div className="mt-5">
          <Segmented
            ariaLabel="Filter saved items"
            value={filter}
            onChange={setFilter}
            options={FILTERS.filter((f) => f.value === 'all' || counts[f.value]).map((f) => ({
              ...f,
              label: counts[f.value] ? `${f.label} ${counts[f.value]}` : f.label,
            }))}
          />
        </div>
      ) : null}

      <div className="mt-6">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Heart className="size-6" />}
            title={items.length === 0 ? 'Nothing saved yet' : `No ${filter} saved`}
            description={
              items.length === 0
                ? 'Tap the heart on any destination, place, hotel or restaurant and it will show up here for quick access.'
                : 'Try another tab, or save something new from Explore.'
            }
            actionLabel={items.length === 0 ? 'Start exploring' : undefined}
            actionHref={items.length === 0 ? '/' : undefined}
          />
        ) : (
          <div className="space-y-2.5">
            {filtered.map((item) => {
              const Icon = TYPE_ICON[item.entry.type]
              return (
                <article
                  key={`${item.entry.type}-${item.entry.id}`}
                  className="surface-card flex items-center gap-3 p-2.5 transition-shadow hover:shadow-lift"
                >
                  <Link to={item.href} className="min-w-0 flex-1">
                    <div className="flex items-center gap-3">
                      <SmartImage
                        src={item.image}
                        alt={item.title}
                        wrapperClassName="size-20 shrink-0 rounded-xl"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <Badge tone="neutral">
                            <Icon className="size-3" />
                            {item.entry.type}
                          </Badge>
                          {item.rating ? <Rating value={item.rating} size="sm" /> : null}
                        </div>
                        <h2 className="mt-1 truncate text-[15px] font-bold text-ink">{item.title}</h2>
                        <p className="truncate text-[12.5px] text-ink-muted">{item.subtitle}</p>
                        <p className="mt-0.5 truncate text-[11.5px] font-semibold text-ink-soft">
                          {item.meta}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => remove(item.entry.type, item.entry.id)}
                    aria-label={`Remove ${item.title} from saved`}
                    className="grid size-9 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </article>
              )
            })}
          </div>
        )}
      </div>

      {items.length > 0 ? (
        <section className="mt-10">
          <SectionHeader
            title="Build a trip from these"
            subtitle="Saved places make planning much faster"
          />
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {(['kyoto', 'paris', 'bali'] as const).map((id) => {
              const d = getDestination(id)
              if (!d) return null
              return (
                <Link
                  key={id}
                  to={`/destination/${d.id}`}
                  className="group surface-card flex items-center gap-3 p-3 transition-shadow hover:shadow-lift"
                >
                  <SmartImage
                    src={d.images[0]}
                    alt={d.name}
                    wrapperClassName="size-16 shrink-0 rounded-xl"
                    className="transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-bold text-ink">{d.name}</p>
                    <p className="truncate text-[12px] text-ink-muted">
                      {d.recommendedDuration} · {d.categories[0]}
                    </p>
                    <p
                      className={cn(
                        'mt-1 text-[11.5px] font-bold',
                        items.some((i) => i.entry.id === d.id) ? 'text-primary' : 'text-ink-soft',
                      )}
                    >
                      {items.some((i) => i.entry.id === d.id) ? 'Saved' : 'Open guide'}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      <p className="mt-8 flex items-center justify-center gap-1.5 text-[11.5px] text-ink-muted">
        <Bookmark className="size-3.5" />
        Saved items live in this browser only. Nothing is sent anywhere.
      </p>
    </div>
  )
}
