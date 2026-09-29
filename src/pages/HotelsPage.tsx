import { useCallback, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { BedDouble, Building2, Check, MapPin, Search, SlidersHorizontal, X } from 'lucide-react'
import type { Hotel } from '../types'
import { hotels, hotelTypes } from '../data/hotels'
import { destinations, getDestination } from '../data/destinations'
import { useSaved } from '../context/SavedContext'
import { useProfile } from '../context/ProfileContext'
import { cn, formatPrice, pluralize } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input, Select } from '../components/ui/Input'
import { Sheet } from '../components/ui/Sheet'
import { SmartImage } from '../components/common/SmartImage'
import { Rating } from '../components/common/Rating'
import { PriceDisplay } from '../components/common/PriceDisplay'
import { EmptyState } from '../components/common/EmptyState'
import { SectionHeader } from '../components/common/SectionHeader'

const AMENITIES = [
  { label: 'Breakfast included', keywords: ['breakfast included', 'breakfast option', 'all meals', 'half board'] },
  { label: 'Free cancellation', keywords: [], flag: 'freeCancellation' as const },
  { label: 'Pool', keywords: ['pool', 'infinity pool', 'private plunge pool', 'waterpark'] },
  { label: 'Gym', keywords: ['gym'] },
  { label: 'Wi-Fi', keywords: ['wi-fi', 'wlan'] },
  { label: 'Airport transfer', keywords: ['airport shuttle', 'airport transfer'] },
  { label: 'Spa', keywords: ['spa', 'hammam', 'public bath', 'onsen'] },
  { label: 'Kitchen', keywords: ['kitchenette'] },
  { label: 'Restaurant', keywords: ['restaurant', 'room service', 'in-room dining', 'bar'] },
  { label: 'Family friendly', keywords: ['family rooms', 'kids club'] },
  { label: '24h reception', keywords: ['24h reception', 'concierge'] },
]

const PRICE_BANDS = [
  { id: 'any', label: 'Any price', min: 0, max: Infinity },
  { id: 'budget', label: 'Under $120', min: 0, max: 120 },
  { id: 'mid', label: '$120 – $260', min: 120, max: 260 },
  { id: 'upscale', label: '$260 – $500', min: 260, max: 500 },
  { id: 'lux', label: '$500+', min: 500, max: Infinity },
] as const

const SORTS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
  { id: 'rating', label: 'Top rated' },
  { id: 'distance', label: 'Closest to centre' },
] as const

type Sort = (typeof SORTS)[number]['id']
type Band = (typeof PRICE_BANDS)[number]['id']

export default function HotelsPage() {
  const [params, setParams] = useSearchParams()
  const { isSaved, toggleSave } = useSaved()
  const { user } = useProfile()

  const destinationId = params.get('destination') ?? 'all'
  const [query, setQuery] = useState('')
  const [type, setType] = useState('all')
  const [amenities, setAmenities] = useState<string[]>([])
  const [band, setBand] = useState<Band>('any')
  const [sort, setSort] = useState<Sort>('recommended')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selected, setSelected] = useState<Hotel | null>(null)

  const activePriceBand = PRICE_BANDS.find((b) => b.id === band) ?? PRICE_BANDS[0]

  const matchesAmenities = useCallback(
    (h: Hotel) =>
      amenities.every((label) => {
        const rule = AMENITIES.find((a) => a.label === label)
        if (!rule) return true
        if (rule.flag === 'freeCancellation') return h.freeCancellation
        const haystack = [...h.amenities, h.breakfastIncluded ? 'breakfast included' : '']
          .join(' ')
          .toLowerCase()
        return rule.keywords.some((k) => haystack.includes(k))
      }),
    [amenities],
  )

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = hotels.filter((h) => {
      if (destinationId !== 'all' && h.destinationId !== destinationId) return false
      if (type !== 'all' && h.type !== type) return false
      if (h.pricePerNight < activePriceBand.min || h.pricePerNight > activePriceBand.max) {
        return false
      }
      if (amenities.length > 0 && !matchesAmenities(h)) {
        return false
      }
      if (!q) return true
      const d = getDestination(h.destinationId)
      return [h.name, h.location, h.type, h.description, d?.name ?? '', d?.country ?? '']
        .join(' ')
        .toLowerCase()
        .includes(q)
    })

    const sorted = [...filtered]
    switch (sort) {
      case 'price-asc':
        sorted.sort((a, b) => a.pricePerNight - b.pricePerNight)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.pricePerNight - a.pricePerNight)
        break
      case 'rating':
        sorted.sort((a, b) => b.guestRating - a.guestRating)
        break
      case 'distance':
        sorted.sort((a, b) => a.distanceFromCenterKm - b.distanceFromCenterKm)
        break
      default:
        sorted.sort(
          (a, b) =>
            b.guestRating * Math.log10(b.reviewCount + 10) -
            a.guestRating * Math.log10(a.reviewCount + 10),
        )
    }
    return sorted
  }, [destinationId, query, type, amenities, activePriceBand, sort, matchesAmenities])

  const activeFilterCount =
    (destinationId !== 'all' ? 1 : 0) +
    (type !== 'all' ? 1 : 0) +
    amenities.length +
    (band === 'any' ? 0 : 1)

  const clearAll = () => {
    setParams({})
    setQuery('')
    setType('all')
    setAmenities([])
    setBand('any')
    setSort('recommended')
  }

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]))

  const selectedDestination = getDestination(destinationId)

  return (
    <div className="container py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            {selectedDestination ? `Stays in ${selectedDestination.name}` : 'Hotels everywhere'}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {pluralize(results.length, 'property')} · prices shown in {user.currency}
          </p>
        </div>
        <Button variant="outline" onClick={() => setFiltersOpen(true)} className="lg:hidden">
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilterCount > 0 ? (
            <span className="ml-0.5 grid size-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          ) : null}
        </Button>
      </div>

      {/* Search + destination chips */}
      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ink-muted" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, area or landmark"
            aria-label="Search hotels"
            className="pl-10"
          />
          {query ? (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
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
            All
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
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Desktop filters */}
        <aside className="hidden lg:block">
          <FilterPanel
            type={type}
            setType={setType}
            amenities={amenities}
            toggleAmenity={toggleAmenity}
            band={band}
            setBand={setBand}
            onClear={clearAll}
            activeCount={activeFilterCount}
          />
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-[13px] font-medium text-ink-muted">
              Showing {results.length} of {hotels.length}
            </p>
            <label className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
              <span className="hidden sm:inline">Sort</span>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-10 w-auto min-w-[170px] text-[13px]"
                aria-label="Sort hotels"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          {results.length === 0 ? (
            <EmptyState
              icon={<BedDouble className="size-6" />}
              title="No stays match those filters"
              description="Try widening the price band or removing an amenity."
              actionLabel="Clear all filters"
              onAction={clearAll}
            />
          ) : (
            <div className="space-y-3">
              {results.map((h) => {
                const d = getDestination(h.destinationId)
                return (
                  <HotelCard
                    key={h.id}
                    hotel={h}
                    destinationName={d?.name ?? ''}
                    country={d?.country ?? ''}
                    saved={isSaved('hotel', h.id)}
                    onToggleSave={() => toggleSave('hotel', h.id)}
                    onOpen={() => setSelected(h)}
                  />
                )
              })}
            </div>
          )}

          {results.length > 0 ? (
            <section className="mt-8">
              <SectionHeader title="How we pick" subtitle="No pay-to-play placement" />
              <p className="max-w-2xl text-[13.5px] leading-relaxed text-ink-muted">
                We list what we would actually book: independent properties with strong recent
                reviews, honest descriptions and prices we have checked. We do not sell placement and
                we do not filter out cheap stays just to look premium.
              </p>
            </section>
          ) : null}
        </div>
      </div>

      <Sheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filters"
        description={`${activeFilterCount} active`}
        footer={
          <div className="flex gap-2">
            <Button variant="outline" block onClick={clearAll}>
              Clear all
            </Button>
            <Button block onClick={() => setFiltersOpen(false)}>
              Show {results.length}
            </Button>
          </div>
        }
      >
        <FilterPanel
          type={type}
          setType={setType}
          amenities={amenities}
          toggleAmenity={toggleAmenity}
          band={band}
          setBand={setBand}
          onClear={clearAll}
          activeCount={activeFilterCount}
        />
      </Sheet>

      <HotelDetailSheet
        hotel={selected}
        onClose={() => setSelected(null)}
        saved={selected ? isSaved('hotel', selected.id) : false}
        onToggleSave={() => selected && toggleSave('hotel', selected.id)}
      />
    </div>
  )
}

function FilterPanel({
  type,
  setType,
  amenities,
  toggleAmenity,
  band,
  setBand,
  onClear,
  activeCount,
}: {
  type: string
  setType: (v: string) => void
  amenities: string[]
  toggleAmenity: (a: string) => void
  band: Band
  setBand: (v: Band) => void
  onClear: () => void
  activeCount: number
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-muted">Refine</h2>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={onClear}
            className="text-[12.5px] font-semibold text-primary hover:underline"
          >
            Clear ({activeCount})
          </button>
        ) : null}
      </div>

      <div>
        <h3 className="mb-2 text-[13px] font-bold text-ink">Property type</h3>
        <div className="space-y-1">
          {['all', ...hotelTypes].map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-[13px] text-ink-soft hover:text-ink"
            >
              <input
                type="radio"
                name="hotel-type"
                checked={type === t}
                onChange={() => setType(t)}
                className="size-4 accent-teal-500"
              />
              {t === 'all' ? 'Any type' : t}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-[13px] font-bold text-ink">Price per night</h3>
        <div className="space-y-1">
          {PRICE_BANDS.map((b) => (
            <label
              key={b.id}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5 text-[13px] text-ink-soft hover:text-ink"
            >
              <input
                type="radio"
                name="price-band"
                checked={band === b.id}
                onChange={() => setBand(b.id)}
                className="size-4 accent-teal-500"
              />
              {b.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-2 text-[13px] font-bold text-ink">Amenities</h3>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map((a) => {
            const on = amenities.includes(a.label)
            return (
              <button
                key={a.label}
                type="button"
                onClick={() => toggleAmenity(a.label)}
                aria-pressed={on}
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors',
                  on
                    ? 'border-primary bg-primary text-white'
                    : 'border-border bg-card text-ink-soft hover:border-primary/30',
                )}
              >
                {on ? <Check className="size-3" /> : null}
                {a.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function HotelCard({
  hotel: h,
  destinationName,
  country,
  saved,
  onToggleSave,
  onOpen,
}: {
  hotel: Hotel
  destinationName: string
  country: string
  saved: boolean
  onToggleSave: () => void
  onOpen: () => void
}) {
  return (
    <article className="surface-card flex flex-col gap-4 p-3 transition-shadow hover:shadow-lift sm:flex-row">
      <button type="button" onClick={onOpen} className="relative shrink-0 text-left">
        <SmartImage
          src={h.image}
          alt={h.name}
          wrapperClassName="h-48 w-full rounded-2xl sm:h-36 sm:w-52"
        />
        {h.breakfastIncluded ? (
          <Badge tone="dark" className="absolute left-2.5 top-2.5">
            Breakfast
          </Badge>
        ) : null}
      </button>

      <div className="min-w-0 flex-1 py-1">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">
            <Building2 className="size-3" />
            {h.type}
          </Badge>
          <Rating value={h.guestRating} reviewCount={h.reviewCount} size="sm" />
        </div>
        <h2 className="mt-1.5 text-[16px] font-bold text-ink">{h.name}</h2>
        <p className="mt-0.5 flex items-center gap-1 text-[12.5px] text-ink-muted">
          <MapPin className="size-3.5" />
          {h.location} · {destinationName}, {country} · {h.distanceFromCenterKm} km from centre
        </p>
        <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">{h.description}</p>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {h.amenities.slice(0, 4).map((a) => (
            <span
              key={a}
              className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-ink-soft"
            >
              {a}
            </span>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <PriceDisplay amount={h.pricePerNight} suffix="/ night" note="Taxes included" />
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onToggleSave}>
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button size="sm" onClick={onOpen}>
              View rooms
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

function HotelDetailSheet({
  hotel,
  onClose,
  saved,
  onToggleSave,
}: {
  hotel: Hotel | null
  onClose: () => void
  saved: boolean
  onToggleSave: () => void
}) {
  const [active, setActive] = useState(0)
  const d = hotel ? getDestination(hotel.destinationId) : undefined

  return (
    <Sheet
      open={Boolean(hotel)}
      onClose={onClose}
      title={hotel?.name ?? ''}
      description={hotel ? `${hotel.type} · ${hotel.location}` : undefined}
      footer={
        hotel ? (
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">From</p>
              <p className="text-[16px] font-extrabold text-ink">
                {formatPrice(hotel.pricePerNight)}
                <span className="text-xs font-medium text-ink-muted"> / night</span>
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onToggleSave}>
                {saved ? 'Saved' : 'Save'}
              </Button>
              <Button>Check availability</Button>
            </div>
          </div>
        ) : null
      }
    >
      {hotel ? (
        <div className="space-y-5">
          <div>
            <SmartImage
              src={hotel.gallery[active] ?? hotel.image}
              alt={`${hotel.name} photo ${active + 1}`}
              wrapperClassName="aspect-[16/10] w-full rounded-2xl"
            />
            <div className="mt-2 flex gap-2">
              {hotel.gallery.slice(0, 6).map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActive(i)}
                  aria-label={`Photo ${i + 1}`}
                  className={cn(
                    'overflow-hidden rounded-lg ring-2 transition-all',
                    active === i ? 'ring-primary' : 'ring-transparent opacity-70',
                  )}
                >
                  <SmartImage src={src} alt="" wrapperClassName="size-14" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="primary">{hotel.starRating}-star</Badge>
              <Rating value={hotel.guestRating} reviewCount={hotel.reviewCount} size="sm" />
            </div>
            <p className="mt-2.5 text-[14px] leading-relaxed text-ink-soft">{hotel.description}</p>
          </div>

          <div>
            <h3 className="text-[13px] font-bold text-ink">Amenities</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[...hotel.amenities, ...(hotel.breakfastIncluded ? ['Breakfast included'] : []), ...(hotel.freeCancellation ? ['Free cancellation'] : [])].map(
                (a) => (
                  <span
                    key={a}
                    className="rounded-full bg-muted px-2.5 py-1 text-[11.5px] font-medium text-ink-soft"
                  >
                    {a}
                  </span>
                ),
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-muted/50 p-3.5">
            <p className="text-[12.5px] leading-relaxed text-ink-muted">
              <span className="font-semibold text-ink-soft">Prototype notice.</span> Availability and
              rates are mock data. Nothing is reserved and no card is charged.
            </p>
          </div>

          {d ? (
            <a
              href={`/map?destination=${d.id}`}
              className="block text-[13px] font-semibold text-primary hover:underline"
            >
              Show {hotel.name} on the map
            </a>
          ) : null}
        </div>
      ) : null}
    </Sheet>
  )
}
