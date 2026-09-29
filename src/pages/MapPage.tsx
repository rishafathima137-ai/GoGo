import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  BedDouble,
  Crosshair,
  Layers,
  MapPin,
  Search,
  Shield,
  Siren,
  ShoppingBag,
  TrainFront,
  UtensilsCrossed,
  X,
} from 'lucide-react'
import type { MapPlace, TicketCategory } from '../types'
import { destinations, getDestination } from '../data/destinations'
import { filterMapPlaces, mapCategoryMeta, mapPlaces } from '../data/mapPlaces'
import { cn, formatPrice } from '../lib/utils'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { SmartImage } from '../components/common/SmartImage'
import { EmptyState } from '../components/common/EmptyState'
import { Rating } from '../components/common/Rating'

const CATEGORY_ICON: Record<TicketCategory, typeof MapPin> = {
  attraction: MapPin,
  hotel: BedDouble,
  restaurant: UtensilsCrossed,
  shopping: ShoppingBag,
  transport: TrainFront,
  emergency: Siren,
}

const ALL_CATEGORIES: TicketCategory[] = [
  'attraction',
  'hotel',
  'restaurant',
  'shopping',
  'transport',
  'emergency',
]

export default function MapPage() {
  const [params, setParams] = useSearchParams()
  const destinationId = params.get('destination') ?? 'all'
  const focusPlace = params.get('place')

  const [active, setActive] = useState<TicketCategory[]>([
    'attraction',
    'restaurant',
    'hotel',
    'transport',
  ])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<MapPlace | null>(null)
  const [listOpen, setListOpen] = useState(false)

  const visible = useMemo(() => {
    const base = filterMapPlaces(
      mapPlaces,
      active,
      destinationId === 'all' ? undefined : destinationId,
    )
    const q = query.trim().toLowerCase()
    if (!q) return base
    return base.filter((p) =>
      [p.name, p.address, p.category].join(' ').toLowerCase().includes(q),
    )
  }, [active, destinationId, query])

  const focusedPlace = useMemo(
    () => (focusPlace ? mapPlaces.find((p) => p.id === focusPlace || p.id.endsWith(focusPlace)) : undefined),
    [focusPlace],
  )

  const destination = useMemo(() => {
    if (focusedPlace) return getDestination(focusedPlace.destinationId)
    return destinationId === 'all' ? undefined : getDestination(destinationId)
  }, [focusedPlace, destinationId])

  const bounds = useMemo(() => {
    if (visible.length === 0) return null
    const lats = visible.map((p) => p.coordinates.lat)
    const lngs = visible.map((p) => p.coordinates.lng)
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    }
  }, [visible])

  const project = (p: MapPlace) => {
    if (!bounds) return { x: 50, y: 50 }
    const spanLat = Math.max(0.0001, bounds.maxLat - bounds.minLat)
    const spanLng = Math.max(0.0001, bounds.maxLng - bounds.minLng)
    return {
      x: 6 + ((p.coordinates.lng - bounds.minLng) / spanLng) * 88,
      y: 88 - ((p.coordinates.lat - bounds.minLat) / spanLat) * 82,
    }
  }

  const toggleCategory = (c: TicketCategory) =>
    setActive((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))

  return (
    <div className="relative">
      <div className="container py-5 sm:py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Map</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {visible.length} places plotted · {destination ? destination.name : 'All destinations'}
            </p>
          </div>
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setListOpen((v) => !v)}
          >
            <Layers className="size-4" />
            {listOpen ? 'Hide list' : 'Show list'}
          </Button>
        </div>

        {/* Controls */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search this map"
              aria-label="Search map places"
              className="h-12 w-full rounded-full border border-input bg-white pl-10 pr-10 text-[14.5px] placeholder:text-ink-muted/70 focus:border-primary/60 focus:outline-none focus:ring-4 focus:ring-primary/12"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear"
                className="absolute right-3 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </div>

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <button
              type="button"
              onClick={() => setParams({})}
              aria-pressed={destinationId === 'all'}
              className={cn(
                'shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
                destinationId === 'all'
                  ? 'bg-primary text-white'
                  : 'border border-border bg-card text-ink-soft hover:border-primary/30',
              )}
            >
              Everywhere
            </button>
            {destinations.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setParams({ destination: d.id })}
                aria-pressed={destinationId === d.id}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
                  destinationId === d.id
                    ? 'bg-primary text-white'
                    : 'border border-border bg-card text-ink-soft hover:border-primary/30',
                )}
              >
                {d.name}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {mapCategoryMeta.map((c) => {
              const on = active.includes(c.key)
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => toggleCategory(c.key)}
                  aria-pressed={on}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-all',
                    on
                      ? 'border-transparent text-white'
                      : 'border-border bg-card text-ink-soft hover:border-primary/30',
                  )}
                  style={on ? { backgroundColor: c.color } : undefined}
                >
                  {c.label}
                </button>
              )
            })}
            {active.length !== ALL_CATEGORIES.length ? (
              <button
                type="button"
                onClick={() => setActive(ALL_CATEGORIES)}
                className="rounded-full border border-border bg-card px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft hover:border-primary/30"
              >
                Show all
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="container pb-8">
        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          {/* Mock map canvas */}
          <div className="relative">
            <div className="relative h-[380px] overflow-hidden rounded-3xl border border-border/70 bg-[#e8f1ee] sm:h-[460px] lg:h-[560px]">
              <div
                className="absolute inset-0 opacity-70"
                style={{
                  backgroundImage:
                    'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
                  backgroundSize: '48px 48px',
                }}
                aria-hidden
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'radial-gradient(circle at 22% 28%, rgba(26,168,152,0.16), transparent 42%), radial-gradient(circle at 78% 72%, rgba(26,168,152,0.12), transparent 46%)',
                }}
                aria-hidden
              />
              <svg className="absolute inset-0 h-full w-full" aria-hidden>
                <path
                  d="M0 62% C 22% 54%, 34% 70%, 52% 58% S 78% 40%, 100% 50%"
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="10"
                  strokeLinecap="round"
                />
                <path
                  d="M0 62% C 22% 54%, 34% 70%, 52% 58% S 78% 40%, 100% 50%"
                  fill="none"
                  stroke="#cfe0db"
                  strokeWidth="2"
                  strokeDasharray="6 8"
                />
              </svg>

              {visible.map((p) => {
                const { x, y } = project(p)
                const meta = mapCategoryMeta.find((m) => m.key === p.category)
                const Icon = CATEGORY_ICON[p.category]
                const isSelected = selected?.id === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelected(p)}
                    aria-label={`${p.name}, ${p.category}`}
                    className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-150 hover:scale-110 focus-visible:scale-110"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    <span
                      className={cn(
                        'grid place-items-center rounded-full text-white shadow-card transition-all',
                        isSelected ? 'size-9 ring-4 ring-white' : 'size-7',
                      )}
                      style={{ backgroundColor: meta?.color ?? '#1faa99' }}
                    >
                      <Icon className={isSelected ? 'size-4' : 'size-3.5'} />
                    </span>
                    <span
                      className={cn(
                        'pointer-events-none absolute left-1/2 top-full mt-0.5 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/92 px-2 py-0.5 text-[10px] font-bold text-ink shadow-soft backdrop-blur',
                        isSelected ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      {p.name}
                    </span>
                  </button>
                )
              })}

              {visible.length === 0 ? (
                <div className="absolute inset-0 grid place-items-center p-6 text-center">
                  <p className="max-w-xs text-[13px] text-ink-muted">
                    No places match the current filters. Turn a category back on to see pins.
                  </p>
                </div>
              ) : null}

              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/92 px-3 py-1.5 text-[11px] font-semibold text-ink-soft shadow-soft backdrop-blur">
                  <Crosshair className="size-3.5 text-primary" />
                  Prototype map · {destination ? destination.name : 'world view'}
                </span>
              </div>
              {destination ? (
                <div className="absolute bottom-3 right-3 overflow-hidden rounded-xl border border-border/70">
                  <SmartImage
                    src={destination.images[0]}
                    alt=""
                    wrapperClassName="size-16"
                    className="opacity-90"
                  />
                </div>
              ) : null}
            </div>

            {selected ? (
              <div className="surface-card mt-3 flex gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      tone="primary"
                      style={{
                        backgroundColor: mapCategoryMeta.find((m) => m.key === selected.category)?.color,
                        color: '#fff',
                      }}
                    >
                      {selected.category}
                    </Badge>
                    <Rating value={selected.rating} size="sm" />
                  </div>
                  <h2 className="mt-1.5 text-[15.5px] font-bold text-ink">{selected.name}</h2>
                  <p className="mt-0.5 text-[12.5px] text-ink-muted">
                    {selected.address} · {selected.openHours}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-extrabold text-ink">
                      {selected.price > 0 ? formatPrice(selected.price) : 'Free'}
                    </span>
                    <Link to={`/destination/${selected.destinationId}`}>
                      <Button size="sm" variant="soft">
                        Open guide
                      </Button>
                    </Link>
                    <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                      Dismiss
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Place list */}
          <div className={cn('lg:block', listOpen ? 'block' : 'hidden')}>
            <div className="flex items-center justify-between gap-2 pb-2">
              <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-muted">
                {visible.length} places
              </h2>
              {selected ? (
                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="text-[12.5px] font-semibold text-primary hover:underline"
                >
                  Clear selection
                </button>
              ) : null}
            </div>

            {visible.length === 0 ? (
              <EmptyState
                compact
                title="Nothing on the map"
                description="Change the filters above to see more places."
              />
            ) : (
              <ul className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
                {visible.map((p) => {
                  const meta = mapCategoryMeta.find((m) => m.key === p.category)
                  const Icon = CATEGORY_ICON[p.category]
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSelected(p)}
                        className={cn(
                          'flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-all',
                          selected?.id === p.id
                            ? 'border-primary bg-primary-soft/50 shadow-card'
                            : 'border-border/70 bg-card hover:border-primary/30',
                        )}
                      >
                        <span
                          className="grid size-9 shrink-0 place-items-center rounded-xl text-white"
                          style={{ backgroundColor: meta?.color ?? '#1faa99' }}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[14px] font-bold text-ink">
                            {p.name}
                          </span>
                          <span className="mt-0.5 block truncate text-[12px] text-ink-muted">
                            {p.address}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px]">
                            <span className="font-bold text-ink-soft">
                              {p.price > 0 ? formatPrice(p.price) : 'Free'}
                            </span>
                            <span className="text-ink-muted">{p.openHours}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}

            <div className="mt-4 rounded-2xl border border-dashed border-border bg-muted/40 p-3.5">
              <p className="flex items-start gap-2 text-[12.5px] leading-relaxed text-ink-muted">
                <Shield className="mt-0.5 size-3.5 shrink-0 text-primary" />
                Emergency numbers are stored on every destination guide. In a real deployment this
                canvas is replaced by a Mapbox or Google Maps instance with live tiles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
