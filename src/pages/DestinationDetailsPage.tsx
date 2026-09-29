import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Bus,
  CalendarDays,
  Camera,
  Check,
  Clock,
  ExternalLink,
  Globe2,
  Heart,
  Languages,
  Map as MapIcon,
  MapPin,
  Navigation,
  Plane,
  Plus,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Sun,
  TrainFront,
  UtensilsCrossed,
  Wallet,
} from 'lucide-react'
import type { BestPlace, ItineraryCategory } from '../types'
import { getDestination } from '../data/destinations'
import { hotels } from '../data/hotels'
import { restaurants } from '../data/restaurants'
import { getLanguage, languages } from '../data/languages'
import { useSaved } from '../context/SavedContext'
import { useTrips } from '../context/TripsContext'
import { createId } from '../services/api'
import { addDays, cn, formatDateRange, formatPrice, toISODate } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Segmented } from '../components/ui/Segmented'
import { Sheet } from '../components/ui/Sheet'
import { Field, Input, Select, Textarea } from '../components/ui/Input'
import { SectionHeader } from '../components/common/SectionHeader'
import { SmartImage } from '../components/common/SmartImage'
import { Rating } from '../components/common/Rating'
import { EmptyState } from '../components/common/EmptyState'
import { AttractionCard } from '../components/destination/AttractionCard'

const DETAIL_TABS = ['Overview', 'Things to do', 'Where to stay', 'Eat & drink', 'Getting there', 'Practical'] as const
type DetailTab = (typeof DETAIL_TABS)[number]

const PLACE_TONE: Record<BestPlace['kind'], string> = {
  'Tourist attraction': 'bg-primary-soft text-accent-foreground',
  'Hidden gem': 'bg-violet-50 text-violet-700',
  Viewpoint: 'bg-amber-50 text-amber-700',
  'Historical place': 'bg-stone-200 text-stone-700',
  'Beach / Nature': 'bg-sky-50 text-sky-700',
}

const WEATHER_ICON: Record<string, typeof Sun> = {
  Perfect: Sun,
  Clear: Sun,
  Hot: Sun,
  Warm: Sun,
  Mild: Sun,
  Green: Sparkles,
  Rain: Globe2,
  Wet: Globe2,
  Monsoon: Globe2,
  Snow: Globe2,
  Cool: Globe2,
  Cold: Globe2,
}

function infoTile(icon: string) {
  switch (icon) {
    case 'Sun':
      return Sun
    case 'Clock':
      return Clock
    case 'Languages':
      return Languages
    case 'Wallet':
      return Wallet
    case 'ShieldCheck':
      return ShieldCheck
    case 'CalendarDays':
      return CalendarDays
    case 'Globe2':
      return Globe2
    default:
      return Sparkles
  }
}

export default function DestinationDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isSaved, toggleSave } = useSaved()
  const { addTrip } = useTrips()
  const [tab, setTab] = useState<DetailTab>('Overview')
  const [planOpen, setPlanOpen] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const destination = getDestination(id)
  const destinationHotels = useMemo(
    () => hotels.filter((h) => h.destinationId === id),
    [id],
  )
  const destinationRestaurants = useMemo(
    () => restaurants.filter((r) => r.destinationId === id),
    [id],
  )
  const language = destination ? getLanguage(destination.languageCode) : undefined

  if (!destination) {
    return (
      <div className="container py-16">
        <EmptyState
          title="Guide not found"
          description="That destination does not exist, or it has not been written up yet."
          actionLabel="Back to Explore"
          actionHref="/"
        />
      </div>
    )
  }

  const saved = isSaved('destination', destination.id)
  const bestHotels = destinationHotels
    .slice()
    .sort((a, b) => b.guestRating - a.guestRating)
    .slice(0, 3)
  const topRestaurants = destinationRestaurants
    .slice()
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 4)

  return (
    <div className="pb-6">
      {/* Hero */}
      <div className="relative">
        <SmartImage
          src={destination.images[0]}
          alt={`${destination.name}, ${destination.country}`}
          priority
          wrapperClassName="h-[52vh] min-h-[380px] w-full sm:h-[60vh] lg:h-[68vh]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/10 to-ink/85" />

        <div className="absolute inset-x-0 top-0">
          <div className="container flex items-center justify-between gap-3 py-3 sm:py-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/90 px-3.5 text-[13px] font-semibold text-ink shadow-card backdrop-blur transition-colors hover:bg-white"
            >
              <ArrowLeft className="size-4" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSave('destination', destination.id)}
                aria-pressed={saved}
                aria-label={saved ? 'Remove from saved' : 'Save destination'}
                className="grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur transition-colors hover:bg-white"
              >
                <Heart className={cn('size-[18px]', saved && 'fill-rose-500 text-rose-500')} />
              </button>
              <button
                type="button"
                onClick={() => {
                  if (navigator.share) {
                    void navigator
                      .share({ title: `${destination.name} guide`, url: window.location.href })
                      .catch(() => undefined)
                  } else {
                    void navigator.clipboard?.writeText(window.location.href)
                  }
                }}
                aria-label="Share this guide"
                className="grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur transition-colors hover:bg-white"
              >
                <Share2 className="size-[18px]" />
              </button>
            </div>
          </div>
        </div>

        <div className="container absolute inset-x-0 bottom-0 pb-6 sm:pb-9">
          <div className="flex flex-wrap items-center gap-2">
            {destination.categories.map((c) => (
              <Badge key={c} tone="white">
                {c}
              </Badge>
            ))}
            {destination.isTrending ? <Badge tone="primary">Trending</Badge> : null}
          </div>
          <h1 className="mt-2.5 text-[34px] font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {destination.name}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-white/80">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {destination.region}, {destination.country}
            </span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              {language ? `${language.flag} ` : ''}
              {destination.language}
            </span>
            <span aria-hidden>·</span>
            <span>{destination.timeZone}</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
            <Rating
              value={destination.rating}
              reviewCount={destination.reviewCount}
              tone="light"
              className="[&_*]:text-white"
            />
            <span className="text-sm font-semibold text-white/80">{destination.tagline}</span>
          </div>
        </div>
      </div>

      {/* Quick facts + CTA */}
      <div className="container -mt-6 space-y-5 sm:-mt-8">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
          {destination.quickFacts.map((fact) => {
            const Icon = infoTile(fact.icon)
            return (
              <div key={fact.label} className="surface-card p-3.5">
                <Icon className="size-[18px] text-primary" />
                <p className="mt-2 text-[13px] font-bold leading-tight text-ink">{fact.value}</p>
                <p className="mt-0.5 text-[11px] font-medium text-ink-muted">{fact.label}</p>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => setPlanOpen(true)}>
            <Plus className="size-4" />
            Plan a trip
          </Button>
          <Link to={`/hotels?destination=${destination.id}`}>
            <Button variant="outline">
              <BedIcon />
              Hotels
            </Button>
          </Link>
          <Link to={`/tickets?to=${encodeURIComponent(destination.name)}`}>
            <Button variant="outline">
              <Plane className="size-4" />
              Transport
            </Button>
          </Link>
          <Link to={`/map?destination=${destination.id}`}>
            <Button variant="outline">
              <MapIcon className="size-4" />
              Map
            </Button>
          </Link>
          <Link to={`/translator?language=${destination.languageCode}`}>
            <Button variant="outline">
              <Languages className="size-4" />
              Phrasebook
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 mt-6 border-y border-border/70 bg-background/92 backdrop-blur-xl lg:top-[72px]">
        <div className="container">
          <div className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            {DETAIL_TABS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                aria-current={tab === t}
                className={cn(
                  'relative shrink-0 px-3.5 py-3.5 text-[13.5px] font-semibold transition-colors',
                  tab === t ? 'text-primary' : 'text-ink-muted hover:text-ink',
                )}
              >
                {t}
                {tab === t ? (
                  <span className="absolute inset-x-2 bottom-0 h-[3px] rounded-full bg-primary" />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mt-6 space-y-10 pb-8">
        {tab === 'Overview' ? (
          <>
            <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-ink">
                  Why go to {destination.name}
                </h2>
                <p className="mt-3 text-[15px] leading-[1.75] text-ink-soft">{destination.description}</p>
                <h3 className="mt-6 text-base font-bold text-ink">Highlights</h3>
                <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                  {destination.highlights.map((h) => (
                    <li
                      key={h}
                      className="flex items-start gap-2.5 rounded-2xl border border-border/70 bg-card p-3.5"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-[13.5px] leading-relaxed text-ink-soft">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <aside className="space-y-4">
                <div className="surface-card p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                    <CalendarDays className="size-4 text-primary" />
                    Best time to visit
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">
                    {destination.bestTimeToVisit}
                  </p>
                  <div className="mt-4 border-t border-border/70 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Suggested stay
                    </p>
                    <p className="mt-1 text-[15px] font-bold text-ink">
                      {destination.recommendedDuration}
                    </p>
                  </div>
                  <div className="mt-4 border-t border-border/70 pt-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
                      Daily budget
                    </p>
                    <p className="mt-1 text-[15px] font-bold text-ink">
                      {formatPrice(destination.averageDailyBudget, destination.currency)}
                      <span className="text-xs font-medium text-ink-muted"> / person</span>
                    </p>
                  </div>
                </div>

                <div className="surface-card p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                    <ShieldCheck className="size-4 text-primary" />
                    Safety
                  </h3>
                  <p className="mt-2 text-[13.5px] text-ink-soft">
                    {destination.safetyLevel} · {destination.safetyScore}/100
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${destination.safetyScore}%` }}
                    />
                  </div>
                </div>

                <div className="surface-card p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                    <Globe2 className="size-4 text-primary" />
                    Emergency
                  </h3>
                  <dl className="mt-2 space-y-1.5 text-[13px] text-ink-soft">
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-muted">Police</dt>
                      <dd className="font-semibold">{destination.emergency.police}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-muted">Ambulance</dt>
                      <dd className="font-semibold">{destination.emergency.ambulance}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-muted">Tourist line</dt>
                      <dd className="font-semibold">{destination.emergency.touristHelpline}</dd>
                    </div>
                  </dl>
                </div>
              </aside>
            </section>

            <section>
              <SectionHeader
                title="Weather through the year"
                subtitle="Typical highs and lows in °C"
              />
              <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
                {destination.weather.map((w) => {
                  const Icon = WEATHER_ICON[w.condition] ?? Sun
                  return (
                    <div
                      key={w.month}
                      className="min-w-[104px] flex-1 rounded-2xl border border-border/70 bg-card p-3.5 text-center"
                    >
                      <p className="text-[12px] font-bold text-ink-soft">{w.month}</p>
                      <Icon className="mx-auto my-2 size-5 text-amber-500" />
                      <p className="text-[13px] font-bold text-ink">
                        {w.high}°
                        <span className="text-ink-muted">/{w.low}°</span>
                      </p>
                      <p className="mt-0.5 text-[10.5px] font-medium text-ink-muted">{w.condition}</p>
                    </div>
                  )
                })}
              </div>
            </section>

            <section>
              <SectionHeader title="Gallery" subtitle="Tap to view full size" />
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                {destination.images.slice(0, 8).map((src, i) => (
                  <button
                    key={src + i}
                    type="button"
                    onClick={() => setLightbox(src)}
                    className={cn(
                      'group relative overflow-hidden rounded-2xl',
                      i === 0 && 'col-span-2 row-span-2 aspect-square',
                    )}
                  >
                    <SmartImage
                      src={src}
                      alt={`${destination.name} photo ${i + 1}`}
                      wrapperClassName="aspect-square w-full"
                      className="transition-transform duration-500 group-hover:scale-105"
                    />
                    {i === destination.images.slice(0, 8).length - 1 ? (
                      <span className="absolute inset-0 grid place-items-center bg-ink/55 text-sm font-bold text-white">
                        +{Math.max(0, destination.images.length - 8)} more
                      </span>
                    ) : null}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="Best places" subtitle="The ones we would not skip" />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {destination.bestPlaces.map((p) => (
                  <article key={p.id} className="surface-card flex flex-col">
                    <div className="relative">
                      <SmartImage src={p.image} alt={p.name} wrapperClassName="aspect-[16/10] w-full" />
                      <span
                        className={cn(
                          'absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
                          PLACE_TONE[p.kind],
                        )}
                      >
                        {p.kind}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-[15px] font-bold text-ink">{p.name}</h3>
                      <p className="mt-1.5 flex-1 text-[13px] leading-relaxed text-ink-muted">
                        {p.description}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                        <Rating value={p.rating} size="sm" />
                        <span className="text-[13px] font-bold text-accent-foreground">
                          {p.entryFee > 0 ? formatPrice(p.entryFee) : 'Free entry'}
                        </span>
                      </div>
                      <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-ink-muted">
                        <Clock className="size-3.5" />
                        {p.bestTime}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Link to={`/map?destination=${destination.id}&place=${p.id}`} className="flex-1">
                          <Button size="sm" variant="soft" block>
                            <MapPin className="size-4" />
                            On map
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleSave('attraction', p.id)}
                        >
                          <Heart
                            className={cn('size-4', isSaved('attraction', p.id) && 'fill-rose-500 text-rose-500')}
                          />
                        </Button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section>
              <SectionHeader title="Local experience" subtitle="Eat, festivals and the unwritten rules" />
              <div className="grid gap-5 lg:grid-cols-3">
                <div className="surface-card p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                    <UtensilsCrossed className="size-4 text-primary" />
                    Food worth planning around
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {destination.localExperience.food.map((f) => (
                      <li key={f.name} className="flex gap-3">
                        <SmartImage
                          src={f.image}
                          alt={f.name}
                          wrapperClassName="size-14 shrink-0 rounded-xl"
                        />
                        <div className="min-w-0">
                          <p className="text-[13.5px] font-bold text-ink">{f.name}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{f.description}</p>
                          <p className="mt-1 text-xs font-bold text-accent-foreground">
                            {formatPrice(f.price, destination.currency)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-5">
                  <div className="surface-card p-5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                      <Sparkles className="size-4 text-primary" />
                      Culture
                    </h3>
                    <dl className="mt-3 space-y-3">
                      {destination.localExperience.culture.map((c) => (
                        <div key={c.title}>
                          <dt className="text-[13.5px] font-bold text-ink">{c.title}</dt>
                          <dd className="mt-0.5 text-xs leading-relaxed text-ink-muted">{c.description}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                  <div className="surface-card p-5">
                    <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                      <ShieldAlert className="size-4 text-primary" />
                      Customs
                    </h3>
                    <ul className="mt-3 space-y-2.5">
                      {destination.localExperience.customs.map((c) => (
                        <li key={c.title}>
                          <p className="text-[13.5px] font-bold text-ink">{c.title}</p>
                          <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{c.description}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="surface-card p-5">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
                    <CalendarDays className="size-4 text-primary" />
                    Festivals
                  </h3>
                  <ul className="mt-3 space-y-3">
                    {destination.localExperience.festivals.map((f) => (
                      <li key={f.name} className="rounded-2xl bg-muted/50 p-3.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13.5px] font-bold text-ink">{f.name}</p>
                          <Badge tone="primary">{f.date}</Badge>
                        </div>
                        <p className="mt-1.5 text-xs leading-relaxed text-ink-muted">{f.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          </>
        ) : null}

        {tab === 'Things to do' ? (
          <section>
            <SectionHeader
              title={`Things to do in ${destination.name}`}
              subtitle={`${destination.thingsToDo.length} experiences, ranked by rating`}
            />
            {destination.thingsToDo.length === 0 ? (
              <EmptyState title="Nothing listed yet" description="This guide is still being written." />
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {destination.thingsToDo.map((a) => (
                  <div key={a.id} id={`place-${a.id}`} className="scroll-mt-40">
                    <AttractionCard attraction={a} destinationId={destination.id} width="w-full" />
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {tab === 'Where to stay' ? (
          <section>
            <SectionHeader
              title="Where to stay"
              subtitle={`${destinationHotels.length} properties in ${destination.name}`}
              actionLabel="All hotels"
              actionHref={`/hotels?destination=${destination.id}`}
            />
            {bestHotels.length === 0 ? (
              <EmptyState title="No stays listed" actionLabel="Browse all hotels" actionHref="/hotels" />
            ) : (
              <div className="space-y-3">
                {bestHotels.map((h) => (
                  <article key={h.id} className="surface-card flex flex-col gap-4 p-3 sm:flex-row">
                    <SmartImage
                      src={h.image}
                      alt={h.name}
                      wrapperClassName="h-40 w-full shrink-0 rounded-2xl sm:h-32 sm:w-44"
                    />
                    <div className="min-w-0 flex-1 py-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone="neutral">{h.type}</Badge>
                        <Rating value={h.guestRating} reviewCount={h.reviewCount} size="sm" />
                      </div>
                      <h3 className="mt-1.5 text-[15.5px] font-bold text-ink">{h.name}</h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                        <Navigation className="size-3" />
                        {h.distanceFromCenterKm} km from centre
                      </p>
                      <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-ink-muted">
                        {h.description}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2">
                        <p className="text-[15px] font-bold text-accent-foreground">
                          {formatPrice(h.pricePerNight, destination.currency)}
                          <span className="text-xs font-medium text-ink-muted"> / night</span>
                        </p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleSave('hotel', h.id)}
                          >
                            <Heart
                              className={cn(
                                'size-4',
                                isSaved('hotel', h.id) && 'fill-rose-500 text-rose-500',
                              )}
                            />
                          </Button>
                          <Link to={`/hotels?destination=${destination.id}&hotel=${h.id}`}>
                            <Button size="sm">View</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {tab === 'Eat & drink' ? (
          <section>
            <SectionHeader
              title="Eat & drink"
              subtitle={`${destinationRestaurants.length} tables our editors return to`}
            />
            {topRestaurants.length === 0 ? (
              <EmptyState title="No restaurants listed" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {topRestaurants.map((r) => (
                  <article key={r.id} className="surface-card flex flex-col">
                    <div className="relative">
                      <SmartImage src={r.image} alt={r.name} wrapperClassName="aspect-[16/10] w-full" />
                      <Badge tone="dark" className="absolute left-3 top-3">
                        {'$'.repeat(r.priceLevel)}
                      </Badge>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-[15px] font-bold text-ink">{r.name}</h3>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {r.cuisine} · {r.openHours}
                      </p>
                      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-ink-muted">
                        Known for {r.signatureDish}.
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <Rating value={r.rating} size="sm" />
                        <span className="text-[13px] font-bold text-accent-foreground">
                          {formatPrice(r.avgCost, destination.currency)} avg
                        </span>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          variant="soft"
                          className="flex-1"
                          onClick={() => toggleSave('restaurant', r.id)}
                        >
                          <Heart
                            className={cn(
                              'size-4',
                              isSaved('restaurant', r.id) && 'fill-rose-500 text-rose-500',
                            )}
                          />
                          Save
                        </Button>
                        <Link to={`/map?destination=${destination.id}&place=${r.id}`} className="flex-1">
                          <Button size="sm" variant="outline" block>
                            <MapPin className="size-4" />
                            Map
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {tab === 'Getting there' ? (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="surface-card p-5">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <Navigation className="size-4 text-primary" />
                Getting around {destination.name}
              </h2>
              <ul className="mt-4 space-y-3.5">
                {destination.travelInfo.transportation.map((t) => {
                  const Icon =
                    t.icon === 'Plane'
                      ? Plane
                      : t.icon === 'Train'
                        ? TrainFront
                        : t.icon === 'Bus'
                          ? Bus
                          : Navigation
                  return (
                    <li key={t.mode} className="rounded-2xl border border-border/70 bg-background p-3.5">
                      <div className="flex items-start gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-accent-foreground">
                          <Icon className="size-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className="text-[14px] font-bold text-ink">{t.mode}</p>
                            <span className="text-[13px] font-bold text-accent-foreground">
                              {formatPrice(t.cost, destination.currency)}
                            </span>
                          </div>
                          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{t.detail}</p>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="space-y-5">
              <div className="surface-card p-5">
                <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                  <BadgeCheck className="size-4 text-primary" />
                  Visa & entry
                </h2>
                <p className="mt-2 text-[15px] font-bold text-ink">
                  {destination.travelInfo.visa.country}: {destination.travelInfo.visa.requirement}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  {destination.travelInfo.visa.note}
                </p>
                <p className="mt-3 text-sm font-bold text-accent-foreground">
                  {destination.travelInfo.visa.fee > 0
                    ? `${formatPrice(destination.travelInfo.visa.fee, destination.currency)} fee`
                    : 'No fee for most passports'}
                </p>
              </div>

              <div className="surface-card p-5">
                <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                  <Globe2 className="size-4 text-primary" />
                  Connectivity
                </h2>
                <p className="mt-2 text-[13.5px] font-semibold text-ink-soft">
                  {destination.travelInfo.connectivity.sim}
                </p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-ink-muted">
                  {destination.travelInfo.connectivity.note}
                </p>
                <p className="mt-3 text-sm font-bold text-accent-foreground">
                  {formatPrice(destination.travelInfo.connectivity.cost, destination.currency)} for 10GB
                </p>
              </div>

              <div className="surface-card p-5">
                <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                  <ShoppingBag className="size-4 text-primary" />
                  Local tips
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {destination.travelInfo.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-2.5 text-[13.5px] leading-relaxed text-ink-soft">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        ) : null}

        {tab === 'Practical' ? (
          <section className="grid gap-5 lg:grid-cols-2">
            <div className="surface-card p-5">
              <h2 className="text-base font-bold text-ink">At a glance</h2>
              <dl className="mt-4 divide-y divide-border/60">
                {[
                  ['Region', `${destination.region}, ${destination.country}`],
                  ['Main language', destination.language],
                  ['Languages spoken', destination.languages.join(', ')],
                  ['Time zone', destination.timeZone],
                  ['Currency', destination.currency],
                  ['Best time to visit', destination.bestTimeToVisit],
                  ['Recommended stay', destination.recommendedDuration],
                  ['Daily budget', formatPrice(destination.averageDailyBudget, destination.currency)],
                  ['Starting price', `${formatPrice(destination.priceFrom, destination.currency)} / day`],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-wrap items-baseline justify-between gap-3 py-2.5">
                    <dt className="text-[13px] font-medium text-ink-muted">{label}</dt>
                    <dd className="text-right text-[13.5px] font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="surface-card p-5">
              <h2 className="flex items-center gap-2 text-base font-bold text-ink">
                <Languages className="size-4 text-primary" />
                Useful phrases
              </h2>
              <p className="mt-1.5 text-[13px] text-ink-muted">
                {language ? `${language.flag} ${language.nativeName}` : destination.language}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {languages.slice(0, 8).map((l) => (
                  <Link
                    key={l.code}
                    to={`/translator?language=${l.code}`}
                    className="flex items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2.5 text-[13px] font-semibold text-ink-soft transition-colors hover:border-primary/40 hover:text-ink"
                  >
                    <span aria-hidden>{l.flag}</span>
                    <span className="truncate">{l.name}</span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={`/translator?language=${destination.languageCode}`}>
                  <Button size="sm" variant="soft">
                    <Camera className="size-4" />
                    Open {language?.name ?? 'translator'}
                  </Button>
                </Link>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${destination.coordinates.lat}&mlon=${destination.coordinates.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button size="sm" variant="outline">
                    <ExternalLink className="size-4" />
                    OpenStreetMap
                  </Button>
                </a>
              </div>
            </div>
          </section>
        ) : null}
      </div>

      {/* Sticky mobile CTA */}
      <div className="fixed inset-x-0 bottom-[68px] z-30 border-t border-border/70 bg-white/95 px-4 py-2.5 backdrop-blur-xl lg:hidden">
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-bold text-ink">from {formatPrice(destination.priceFrom, destination.currency)}</p>
            <p className="truncate text-[11px] text-ink-muted">per person, per day</p>
          </div>
          <Button size="sm" onClick={() => setPlanOpen(true)}>
            Plan a trip
          </Button>
        </div>
      </div>

      <PlanTripSheet
        open={planOpen}
        onClose={() => setPlanOpen(false)}
        onCreate={(trip) => {
          addTrip(trip)
          setPlanOpen(false)
          navigate(`/trips/${trip.id}`)
        }}
        destinationId={destination.id}
      />

      {lightbox ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-ink/92 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={() => setLightbox(null)}
        >
          <SmartImage
            src={lightbox}
            alt={`${destination.name} full size photo`}
            wrapperClassName="max-h-[85vh] w-full max-w-4xl rounded-2xl"
            className="object-contain"
          />
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 grid size-11 place-items-center rounded-full bg-white/90 text-ink"
            aria-label="Close photo"
          >
            <ArrowLeft className="size-5 rotate-90" />
          </button>
        </div>
      ) : null}
    </div>
  )
}

function BedIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M2 17v-5h20v5M2 17v3M22 17v3M2 12V7M6 12V9h12v3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const CATEGORY_OPTIONS: { value: ItineraryCategory; label: string }[] = [
  { value: 'sightseeing', label: 'Sightseeing' },
  { value: 'food', label: 'Food' },
  { value: 'culture', label: 'Culture' },
  { value: 'nature', label: 'Nature' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'relax', label: 'Relax' },
  { value: 'nightlife', label: 'Nightlife' },
  { value: 'transport', label: 'Transport' },
  { value: 'hotel', label: 'Hotel' },
]

function PlanTripSheet({
  open,
  onClose,
  onCreate,
  destinationId,
}: {
  open: boolean
  onClose: () => void
  onCreate: (trip: import('../types').Trip) => void
  destinationId: string
}) {
  const destination = getDestination(destinationId)
  const localHotels = useMemo(
    () => hotels.filter((h) => h.destinationId === destinationId),
    [destinationId],
  )
  const [title, setTitle] = useState('')
  const [start, setStart] = useState(() => toISODate(new Date(Date.now() + 30 * 86_400_000)))
  const [days, setDays] = useState(4)
  const [travelers, setTravelers] = useState(2)
  const [category, setCategory] = useState<ItineraryCategory>('sightseeing')
  const [notes, setNotes] = useState('')
  const [minDate] = useState(() => toISODate(new Date()))

  if (!destination) return null

  const endISO = addDays(start, days - 1)
  const budget = days * destination.averageDailyBudget * travelers

  const submit = () => {
    const tripId = createId('trip')
    const dayList = Array.from({ length: days }, (_, i) => {
      const dayDate = new Date(start)
      dayDate.setDate(dayDate.getDate() + i)
      const picks = destination.thingsToDo.slice(i, i + 2)
      const fallback = destination.bestPlaces[i % Math.max(1, destination.bestPlaces.length)]
      return {
        id: `${tripId}-d${i + 1}`,
        date: toISODate(dayDate),
        label: `Day ${i + 1}`,
        items: [
          ...picks.map((a, j) => ({
            id: `${tripId}-d${i + 1}-i${j}`,
            title: a.name,
            time: j === 0 ? '09:30' : '15:00',
            category,
            cost: a.price,
            duration: a.duration,
            location: a.name,
            image: a.image,
            placeId: a.id,
            notes: a.description,
          })),
          ...(i === 0 && fallback
            ? [
                {
                  id: `${tripId}-d1-checkin`,
                  title: `Check in \u00b7 ${localHotels[0]?.name ?? 'Accommodation'}`,
                  time: '16:00',
                  category: 'hotel' as ItineraryCategory,
                  cost: 0,
                  duration: '1h',
                  location: localHotels[0]?.location ?? destination.name,
                  image: localHotels[0]?.image,
                },
              ]
            : []),
        ],
      }
    })

    onCreate({
      id: tripId,
      title: title.trim() || `${destination.recommendedDuration} in ${destination.name}`,
      destinationId: destination.id,
      destinationName: destination.name,
      country: destination.country,
      cover: destination.images[0],
      startDate: start,
      endDate: endISO,
      travelers,
      budget: Math.round(budget),
      status: 'upcoming',
      days: dayList,
      notes:
        notes.trim() ||
        `Built from the ${destination.name} guide. ${days} days, ${travelers} travellers.`,
    })
    setTitle('')
    setNotes('')
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Plan a trip to ${destination.name}`}
      description="We will draft a day-by-day plan from this guide. Everything stays editable."
      footer={
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
              Estimated
            </p>
            <p className="text-[15px] font-extrabold text-ink">{formatPrice(Math.round(budget), destination.currency)}</p>
          </div>
          <Button onClick={submit}>
            Create trip
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Trip name" htmlFor="trip-title" hint="Leave blank to auto-name it.">
          <Input
            id="trip-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`${destination.recommendedDuration} in ${destination.name}`}
          />
        </Field>

        <Field label="Start date" htmlFor="trip-start">
          <Input id="trip-start" type="date" value={start} min={minDate} onChange={(e) => setStart(e.target.value)} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Length" htmlFor="trip-days">
            <Select id="trip-days" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {[2, 3, 4, 5, 6, 7, 10, 14].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'day' : 'days'}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Travellers" htmlFor="trip-travelers">
            <Select
              id="trip-travelers"
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'traveller' : 'travellers'}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Main focus" hint="Sets the category on the activities we pre-fill.">
          <Segmented
            ariaLabel="Main focus"
            size="sm"
            value={category}
            onChange={setCategory}
            options={CATEGORY_OPTIONS.slice(0, 5)}
          />
        </Field>

        <Field label="Notes" htmlFor="trip-notes" hint="Optional — saved with the trip.">
          <Textarea
            id="trip-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="We want a slow pace with time for markets and long lunches."
          />
        </Field>

        <p className="rounded-2xl bg-muted/60 p-3.5 text-[12.5px] leading-relaxed text-ink-muted">
          <span className="font-semibold text-ink-soft">
            {formatDateRange(start, endISO)} · {days} days
          </span>
          <br />
          Using an average of {formatPrice(destination.averageDailyBudget, destination.currency)} per person
          per day, based on {destination.name} prices. Real prices will differ.
        </p>
      </div>
    </Sheet>
  )
}
