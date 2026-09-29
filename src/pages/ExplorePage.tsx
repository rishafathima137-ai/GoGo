import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarDays,
  Flame,
  Languages,
  Map as MapIcon,
  Search,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react'
import {
  ALL_CATEGORIES,
  adventureDestinations,
  budgetDestinations,
  destinations,
  featuredDestination,
  getDestination,
  nearbyDestinations,
  popularDestinations,
  recommendedDestinations,
  searchDestinations,
  trendingDestinations,
} from '../data/destinations'
import { initialTrips } from '../data/trips'
import { hotels } from '../data/hotels'
import { restaurants } from '../data/restaurants'
import { useProfile } from '../context/ProfileContext'
import { useSaved } from '../context/SavedContext'
import { formatCompact, formatDateRange, formatPrice } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SectionHeader } from '../components/common/SectionHeader'
import { SmartImage } from '../components/common/SmartImage'
import { Rating } from '../components/common/Rating'
import { EmptyState } from '../components/common/EmptyState'
import { DestinationCard } from '../components/destination/DestinationCard'
import { AttractionCard } from '../components/destination/AttractionCard'

const QUICK_LINKS = [
  { to: '/hotels', label: 'Hotels', icon: 'hotel' },
  { to: '/tickets', label: 'Transport', icon: 'transport' },
  { to: '/map', label: 'Map', icon: 'map' },
  { to: '/translator', label: 'Translator', icon: 'translate' },
] as const

const EXPLORE_TABS = ALL_CATEGORIES
type ExploreTab = (typeof EXPLORE_TABS)[number]

const TABS_META: Record<string, { blurb: string; icon: typeof Flame }> = {
  All: { blurb: 'Everywhere we cover, hand-picked and thoroughly written up.', icon: Sparkles },
  Beach: { blurb: 'Coastlines, island ferries and slow afternoons by the water.', icon: Flame },
  City: { blurb: 'Dense, walkable and loud in the best possible way.', icon: MapIcon },
  Mountain: { blurb: 'High passes, cold air and views worth every switchback.', icon: Flame },
  Adventure: { blurb: 'Routes, rivers and terrain that demand proper kit.', icon: Flame },
  Historical: { blurb: 'Old capitals, ruins and museums worth losing an afternoon in.', icon: CalendarDays },
  Nature: { blurb: 'Trails, wildlife and the kind of quiet that resets you.', icon: Sparkles },
}

export default function ExplorePage() {
  const { user } = useProfile()
  const { saved } = useSaved()
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<ExploreTab>('All')

  const results = useMemo(() => searchDestinations(query, tab), [query, tab])
  const searching = query.trim().length > 0 || tab !== 'All'

  const heroTrip = initialTrips[0]
  const heroDestination = getDestination(heroTrip.destinationId)
  const heroHotelCount = hotels.filter((h) => h.destinationId === heroTrip.destinationId).length
  const heroRestaurantCount = restaurants.filter((r) => r.destinationId === heroTrip.destinationId).length

  const featuredAttractions = useMemo(
    () =>
      recommendedDestinations
        .flatMap((d) => d.thingsToDo.slice(0, 2).map((a) => ({ a, d })))
        .slice(0, 6),
    [],
  )

  return (
    <div id="explore">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-teal-950 via-ink to-ink pb-28 pt-8 sm:pb-32 lg:pb-36">
        <SmartImage
          src={featuredDestination.images[0]}
          alt={`${featuredDestination.name}, ${featuredDestination.country}`}
          priority
          wrapperClassName="absolute inset-0"
          className="opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/70 to-ink" />

        <div className="container relative">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-teal-200">
            <span className="inline-block size-1.5 rounded-full bg-teal-300" />
            {destinations.length} destinations · {hotels.length} stays · {restaurants.length} tables
          </div>

          <h1 className="mt-3 max-w-2xl text-[30px] font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl lg:text-5xl">
            Plan less.
            <br />
            <span className="text-teal-300">Go further.</span>
          </h1>
          <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-white/75">
            Real guides, honest prices and itineraries you can actually follow. Your world, your guide.
          </p>

          <div className="mt-6 max-w-xl">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-ink-muted"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search a city, country or vibe"
                aria-label="Search destinations"
                className="h-14 w-full rounded-2xl border border-white/15 bg-white/95 pl-11 pr-11 text-[15px] font-medium text-ink shadow-lift placeholder:font-normal placeholder:text-ink-muted focus:outline-none focus:ring-4 focus:ring-teal-400/30"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition-colors hover:bg-muted hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              ) : null}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {QUICK_LINKS.map(({ to, label, icon }) => (
                <Link
                  key={to}
                  to={to}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-[13px] font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  {icon === 'hotel' ? (
                    <Wallet className="size-4 text-teal-300" />
                  ) : icon === 'transport' ? (
                    <ArrowRight className="size-4 text-teal-300" />
                  ) : icon === 'map' ? (
                    <MapIcon className="size-4 text-teal-300" />
                  ) : (
                    <Languages className="size-4 text-teal-300" />
                  )}
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="container relative -mt-20 space-y-10 pb-4 sm:-mt-24 lg:-mt-28">
        {/* Upcoming trip nudge */}
        {heroTrip ? (
          <Link
            to={`/trips/${heroTrip.id}`}
            className="group surface-card relative overflow-hidden p-4 transition-shadow hover:shadow-lift sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <SmartImage
                src={heroTrip.cover}
                alt={heroTrip.destinationName}
                wrapperClassName="h-36 w-full shrink-0 rounded-2xl sm:h-28 sm:w-40"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="primary">
                    <CalendarDays className="size-3" />
                    Up next
                  </Badge>
                  <span className="text-xs font-medium text-ink-muted">
                    {formatDateRange(heroTrip.startDate, heroTrip.endDate)}
                  </span>
                </div>
                <h2 className="mt-1.5 truncate text-lg font-extrabold tracking-tight text-ink">
                  {heroTrip.title}
                </h2>
                <p className="mt-1 text-[13px] text-ink-muted">
                  {heroDestination?.name ?? heroTrip.destinationName} · {heroTrip.days.length} days ·{' '}
                  {heroTrip.travelers} travellers
                </p>
                <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-ink-soft">
                  <span>{heroHotelCount} stays</span>
                  <span>{heroRestaurantCount} places to eat</span>
                  <span>{heroTrip.days.reduce((n, d) => n + d.items.length, 0)} planned activities</span>
                </div>
              </div>
              <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-ink px-4 py-2.5 text-[13px] font-semibold text-white transition-transform group-hover:translate-x-0.5 sm:inline-flex">
                Open trip
                <ArrowRight className="size-4" />
              </span>
            </div>
          </Link>
        ) : null}

        {/* Category filter */}
        <section>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {EXPLORE_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-pressed={tab === t}
                className={
                  'shrink-0 rounded-full px-4 py-2 text-[13px] font-semibold transition-all duration-200 ' +
                  (tab === t
                    ? 'bg-primary text-white shadow-teal'
                    : 'border border-border bg-card text-ink-soft hover:border-primary/30 hover:text-ink')
                }
              >
                {t}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[13px] text-ink-muted">
            {TABS_META[tab]?.blurb ?? `Destinations tagged ${tab}.`}
          </p>
        </section>

        {searching ? (
          <section>
            <SectionHeader
              title={query ? `Results for “${query}”` : `${tab} destinations`}
              subtitle={`${results.length} ${results.length === 1 ? 'place' : 'places'} found`}
              actionLabel="Reset"
              onAction={() => {
                setQuery('')
                setTab('All')
              }}
            />
            {results.length === 0 ? (
              <EmptyState
                title="Nothing matches that yet"
                description="Try a broader search, or browse a category. We are writing new guides every week."
                actionLabel="Clear filters"
                onAction={() => {
                  setQuery('')
                  setTab('All')
                }}
              />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {results.map((d, i) => (
                  <DestinationCard key={d.id} destination={d} variant="grid" priority={i < 4} />
                ))}
              </div>
            )}
          </section>
        ) : (
          <>
            <section>
              <SectionHeader
                title="Trending right now"
                subtitle="Where travellers are looking this month"
                actionLabel="See all"
                onAction={() => setTab('All')}
              />
              <div className="no-scrollbar -mx-4 flex snap-x-rail gap-3 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 lg:mx-0 lg:px-0">
                {trendingDestinations.map((d, i) => (
                  <div key={d.id} className="snap-item shrink-0">
                    <DestinationCard destination={d} size="md" priority={i < 3} />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionHeader
                title="Picked for you"
                subtitle={`Based on ${user.travelStyle.slice(0, 2).join(' and ').toLowerCase()} and ${user.interests[0]?.toLowerCase() ?? 'curiosity'}`}
              />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {recommendedDestinations.map((d) => (
                  <DestinationCard key={d.id} destination={d} variant="wide" />
                ))}
              </div>
            </section>

            {nearbyDestinations.length > 0 ? (
              <section>
                <SectionHeader
                  title="Within reach"
                  subtitle={`Short-haul options from ${user.homeBase}`}
                  actionLabel="Open map"
                  actionHref="/map"
                />
                <div className="no-scrollbar -mx-4 flex snap-x-rail gap-3 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 lg:mx-0 lg:px-0">
                  {nearbyDestinations.map((d) => (
                    <div key={d.id} className="snap-item shrink-0">
                      <DestinationCard destination={d} size="sm" />
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            <section>
              <SectionHeader
                title="Things to do"
                subtitle="Book-worthy experiences across our guides"
                actionLabel="View map"
                actionHref="/map"
              />
              <div className="no-scrollbar -mx-4 flex snap-x-rail gap-3 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 lg:mx-0 lg:px-0">
                {featuredAttractions.map(({ a, d }) => (
                  <AttractionCard key={a.id} attraction={a} destinationId={d.id} />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="Great value" subtitle="Long stays, small budgets, big memories" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {budgetDestinations.map((d) => (
                  <DestinationCard key={d.id} destination={d} variant="wide" />
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="For the adrenaline" subtitle="Routes, tides and terrain" />
              <div className="no-scrollbar -mx-4 flex snap-x-rail gap-3 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 lg:mx-0 lg:px-0">
                {adventureDestinations.map((d) => (
                  <div key={d.id} className="snap-item shrink-0">
                    <DestinationCard destination={d} size="sm" />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <SectionHeader
                title="Most read guides"
                subtitle="Ranked by traveller reviews"
                actionLabel="All destinations"
                onAction={() => setTab('All')}
              />
              <div className="divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card">
                {popularDestinations.map((d) => (
                  <DestinationCard
                    key={d.id}
                    destination={d}
                    variant="wide"
                    className="rounded-none border-0 shadow-none"
                  />
                ))}
              </div>
            </section>
          </>
        )}

        {/* Footer stats strip */}
        <section className="grid grid-cols-2 gap-3 pb-6 sm:grid-cols-4">
          {[
            { label: 'Destinations', value: destinations.length },
            { label: 'Stays listed', value: hotels.length },
            { label: 'Places to eat', value: restaurants.length },
            { label: 'Items saved', value: saved.length },
          ].map((s) => (
            <div key={s.label} className="surface-card p-4">
              <p className="text-2xl font-extrabold tracking-tight text-ink">
                {formatCompact(s.value)}
              </p>
              <p className="mt-0.5 text-xs font-medium text-ink-muted">{s.label}</p>
            </div>
          ))}
        </section>

        <section className="surface-card relative overflow-hidden bg-gradient-to-br from-teal-50 to-white p-5 sm:p-7">
          <div className="relative max-w-lg">
            <h2 className="text-xl font-extrabold tracking-tight text-ink">
              Ready when you are, {user.name.split(' ')[0]}.
            </h2>
            <p className="mt-1.5 text-sm text-ink-muted">
              Average daily budget in your next pick:{' '}
              <span className="font-bold text-ink">
                {formatPrice(recommendedDestinations[0]?.averageDailyBudget ?? 0)}
              </span>
              . Build a day-by-day plan in a couple of taps.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/trips">
                <Button size="sm">Open my trips</Button>
              </Link>
              <Link to="/translator">
                <Button size="sm" variant="outline">
                  <Languages className="size-4" />
                  Practice a language
                </Button>
              </Link>
            </div>
          </div>
          <Rating
            value={featuredDestination.rating}
            reviewCount={featuredDestination.reviewCount}
            className="mt-5 sm:absolute sm:bottom-7 sm:right-7 sm:mt-0"
          />
        </section>
      </div>
    </div>
  )
}
