import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ArrowRight,
  Bus,
  CalendarDays,
  Check,
  Leaf,
  Plane,
  Search,
  Ticket,
  TrainFront,
  Users,
} from 'lucide-react'
import type { TransportMode, TransportOption } from '../types'
import {
  arrivalCities,
  departureCities,
  popularRoutes,
  transportModes,
} from '../data/tickets'
import { searchTransport } from '../services/api'
import { useProfile } from '../context/ProfileContext'
import { cn, formatPrice, toISODate } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Field, Input, Select } from '../components/ui/Input'
import { Sheet } from '../components/ui/Sheet'
import { LoadingState } from '../components/common/LoadingState'
import { EmptyState } from '../components/common/EmptyState'

const MODE_ICON: Record<TransportMode, typeof Plane> = {
  flight: Plane,
  train: TrainFront,
  bus: Bus,
}

const SORTS = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'price-asc', label: 'Cheapest' },
  { id: 'duration', label: 'Fastest' },
  { id: 'emissions', label: 'Lowest emissions' },
] as const

type Sort = (typeof SORTS)[number]['id']

export default function TicketsPage() {
  const [params, setParams] = useSearchParams()
  const { user } = useProfile()

  const [mode, setMode] = useState<TransportMode>('flight')
  const [from, setFrom] = useState('London (LHR)')
  const [to, setTo] = useState(params.get('to') ?? 'Tokyo (HND)')
  const [travelers, setTravelers] = useState(1)
  const [departureDate, setDepartureDate] = useState(toISODate(new Date(Date.now() + 21 * 86_400_000)))
  const [returnDate, setReturnDate] = useState(toISODate(new Date(Date.now() + 28 * 86_400_000)))
  const [roundTrip, setRoundTrip] = useState(false)
  const [sort, setSort] = useState<Sort>('recommended')
  const [selected, setSelected] = useState<TransportOption | null>(null)
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<TransportOption[]>([])

  const runSearch = async () => {
    setLoading(true)
    const results = await searchTransport({
      mode,
      from,
      to,
      travelers,
      departureDate,
      returnDate: roundTrip ? returnDate : undefined,
    })
    setOptions(results)
    setLoading(false)
  }

  useEffect(() => {
    void runSearch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, from, to, travelers, departureDate, roundTrip])

  const sorted = useMemo(() => {
    const list = [...options]
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price)
        break
      case 'duration':
        list.sort((a, b) => durationToMinutes(a.duration) - durationToMinutes(b.duration))
        break
      case 'emissions':
        list.sort((a, b) => a.co2Kg - b.co2Kg)
        break
      default:
        list.sort((a, b) => (a.refundable === b.refundable ? a.price - b.price : a.refundable ? -1 : 1))
    }
    return list
  }, [options, sort])

  const cheapest = options.length ? Math.min(...options.map((o) => o.price)) : 0
  const fastest = options.length
    ? Math.min(...options.map((o) => durationToMinutes(o.duration)))
    : 0
  const greenest = options.length ? Math.min(...options.map((o) => o.co2Kg)) : 0

  const swap = () => {
    setFrom(to)
    setTo(from)
  }

  return (
    <div className="container py-6 sm:py-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Transport & tickets
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Compare routes, fares and carbon impact. Booking happens with the provider, not here.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
        {transportModes.map((m) => {
          const Icon = MODE_ICON[m.key]
          const active = mode === m.key
          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setMode(m.key)}
              aria-pressed={active}
              className={cn(
                'flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all duration-200',
                active
                  ? 'border-primary bg-primary-soft shadow-teal'
                  : 'border-border bg-card hover:border-primary/30',
              )}
            >
              <span
                className={cn(
                  'grid size-10 shrink-0 place-items-center rounded-xl',
                  active ? 'bg-primary text-white' : 'bg-muted text-ink-soft',
                )}
              >
                <Icon className="size-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[14.5px] font-bold text-ink">{m.label}</span>
                <span className="block text-[12px] text-ink-muted">{m.hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Search form */}
      <form
        className="surface-card mt-4 p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault()
          setParams({ to })
          void runSearch()
        }}
      >
        <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr]">
          <Field label="From" htmlFor="transport-from">
            <div className="relative">
              <Select
                id="transport-from"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="pr-9"
              >
                {departureCities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
          </Field>
          <div className="flex items-end justify-center pb-1">
            <button
              type="button"
              onClick={swap}
              aria-label="Swap origin and destination"
              className="grid size-10 place-items-center rounded-full border border-border bg-card text-ink-soft transition-all hover:border-primary/40 hover:text-primary"
            >
              <ArrowRight className="size-4 rotate-90" />
            </button>
          </div>
          <Field label="To" htmlFor="transport-to">
            <div className="relative">
              <Input
                id="transport-to"
                list="arrival-cities"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                placeholder="Where to?"
              />
              <datalist id="arrival-cities">
                {arrivalCities.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </Field>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Departure" htmlFor="transport-departure">
            <Input
              id="transport-departure"
              type="date"
              value={departureDate}
              min={toISODate(new Date())}
              onChange={(e) => setDepartureDate(e.target.value)}
            />
          </Field>
          <Field
            label="Return"
            htmlFor="transport-return"
            hint={roundTrip ? undefined : 'One way'}
          >
            <Input
              id="transport-return"
              type="date"
              value={returnDate}
              min={departureDate}
              disabled={!roundTrip}
              onChange={(e) => setReturnDate(e.target.value)}
              className={cn(!roundTrip && 'opacity-60')}
            />
          </Field>
          <Field label="Travellers" htmlFor="transport-travelers">
            <Select
              id="transport-travelers"
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? 'adult' : 'adults'}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Cabin / class" htmlFor="transport-cabin">
            <Select id="transport-cabin" defaultValue="any">
              <option value="any">Any</option>
              <option value="economy">Economy</option>
              <option value="premium">Premium</option>
              <option value="business">Business</option>
              <option value="first">First</option>
            </Select>
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2.5 text-[13px] font-semibold text-ink-soft">
            <input
              type="checkbox"
              checked={roundTrip}
              onChange={(e) => setRoundTrip(e.target.checked)}
              className="size-4 accent-teal-500"
            />
            Return trip
          </label>
          <Button type="submit" disabled={loading}>
            {loading ? 'Searching…' : 'Search routes'}
          </Button>
        </div>
      </form>

      {/* Popular routes */}
      <section className="mt-4">
        <h2 className="text-[13px] font-bold uppercase tracking-wide text-ink-muted">
          Popular routes
        </h2>
        <div className="mt-2 flex flex-wrap gap-2">
          {popularRoutes.map((r) => (
            <button
              key={`${r.from}-${r.to}`}
              type="button"
              onClick={() => {
                setFrom(departureCities.find((c) => c.startsWith(r.from)) ?? from)
                setTo(arrivalCities.find((c) => c.startsWith(r.to)) ?? r.to)
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft transition-colors hover:border-primary/40 hover:text-ink"
            >
              {r.from}
              <ArrowRight className="size-3.5 text-primary" />
              {r.to}
            </button>
          ))}
        </div>
      </section>

      {/* Results */}
      {loading ? (
        <LoadingState label="Comparing routes…" className="mt-10" />
      ) : sorted.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={<Ticket className="size-6" />}
          title="No routes found"
          description="Try different cities or a different travel mode."
        />
      ) : (
        <section className="mt-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Badge tone="primary">{sorted.length} routes</Badge>
              <Badge tone="neutral">from {formatPrice(cheapest)}</Badge>
              <Badge tone="neutral">fastest {formatDuration(fastest)}</Badge>
              <Badge tone="neutral">
                <Leaf className="size-3" />
                lowest {greenest} kg CO₂
              </Badge>
            </div>
            <label className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
              Sort
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-10 w-auto min-w-[150px] text-[13px]"
                aria-label="Sort routes"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </label>
          </div>

          <div className="mt-4 space-y-2.5">
            {sorted.map((o) => {
              const Icon = MODE_ICON[o.mode]
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setSelected(o)}
                  className="surface-card flex w-full flex-col gap-3 p-3.5 text-left transition-all hover:shadow-lift sm:flex-row sm:items-center sm:gap-4 sm:p-4"
                >
                  <span className="flex shrink-0 items-center gap-2.5 sm:w-40">
                    <span className="grid size-10 place-items-center rounded-xl bg-ink text-[13px] font-extrabold text-white">
                      {o.logoLetter}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13.5px] font-bold text-ink">
                        {o.provider}
                      </span>
                      <span className="flex items-center gap-1 text-[11.5px] text-ink-muted">
                        <Icon className="size-3" />
                        {o.cabin}
                      </span>
                    </span>
                  </span>

                  <span className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="shrink-0 text-center">
                      <span className="block text-[15px] font-extrabold tabular-nums text-ink">
                        {o.departureTime}
                      </span>
                      <span className="block max-w-[92px] truncate text-[11px] text-ink-muted">
                        {o.from}
                      </span>
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col items-center">
                      <span className="text-[11px] font-medium text-ink-muted">{o.duration}</span>
                      <span className="my-0.5 flex w-full items-center gap-1">
                        <span className="size-1.5 shrink-0 rounded-full bg-primary" />
                        <span className="h-px flex-1 bg-border" />
                        <Icon className="size-3.5 shrink-0 text-primary" />
                        <span className="h-px flex-1 bg-border" />
                        <span className="size-1.5 shrink-0 rounded-full bg-border" />
                      </span>
                      <span className="text-[10.5px] font-medium text-ink-muted">
                        {o.stops === 0 ? 'Direct' : `${o.stops} stop${o.stops > 1 ? 's' : ''}`}
                      </span>
                    </span>
                    <span className="shrink-0 text-center">
                      <span className="block text-[15px] font-extrabold tabular-nums text-ink">
                        {o.arrivalTime}
                      </span>
                      <span className="block max-w-[92px] truncate text-[11px] text-ink-muted">
                        {o.to}
                      </span>
                    </span>
                  </span>

                  <span className="shrink-0 sm:w-32 sm:text-right">
                    <span className="block text-[17px] font-extrabold tracking-tight text-ink">
                      {formatPrice(o.price)}
                    </span>
                    <span className="block text-[11px] text-ink-muted">
                      {roundTrip ? 'round trip' : 'per person'}
                    </span>
                    {o.refundable ? (
                      <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                        <Check className="size-2.5" />
                        Refundable
                      </span>
                    ) : null}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <TicketSheet
        option={selected}
        onClose={() => setSelected(null)}
        travelers={travelers}
        currency={user.currency}
        roundTrip={roundTrip}
        departureDate={departureDate}
        returnDate={returnDate}
      />
    </div>
  )
}

function durationToMinutes(duration: string) {
  const m = duration.match(/(\d+)\s*h?\s*(?:(\d+)\s*m)?/i)
  if (!m) return 0
  return Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0)
}

function formatDuration(minutes: number) {
  if (!minutes) return '—'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h${m > 0 ? ` ${m}m` : ''}`
}

function TicketSheet({
  option,
  onClose,
  travelers,
  currency,
  roundTrip,
  departureDate,
  returnDate,
}: {
  option: TransportOption | null
  onClose: () => void
  travelers: number
  currency: string
  roundTrip: boolean
  departureDate: string
  returnDate: string
}) {
  if (!option) return null
  const Icon = MODE_ICON[option.mode]
  const legs = roundTrip ? 2 : 1
  const total = option.price * legs

  return (
    <Sheet
      open={Boolean(option)}
      onClose={onClose}
      title={option.provider}
      description={`${option.from} to ${option.to}`}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Total</p>
            <p className="text-[17px] font-extrabold text-ink">{formatPrice(total, currency)}</p>
          </div>
          <Button>Continue to provider</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-muted/50 p-4">
          <span className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-xl bg-ink text-sm font-extrabold text-white">
              {option.logoLetter}
            </span>
            <span>
              <span className="block text-[15px] font-bold text-ink">{option.provider}</span>
              <span className="block text-[12px] text-ink-muted">{option.cabin}</span>
            </span>
          </span>
          <Icon className="size-5 text-primary" />
        </div>

        <div className="rounded-2xl border border-border/70 p-4">
          {Array.from({ length: legs }, (_, i) => (
            <div key={i} className={cn('flex gap-3', i > 0 && 'mt-4 border-t border-border/60 pt-4')}>
              <span className="shrink-0 text-center">
                <span className="block text-[15px] font-extrabold tabular-nums text-ink">
                  {i === 0 ? option.departureTime : option.arrivalTime}
                </span>
                <span className="block text-[11px] text-ink-muted">
                  {i === 0 ? 'Depart' : 'Arrive'}
                </span>
              </span>
              <span className="flex-1 border-l-2 border-dashed border-border pl-3">
                <span className="block text-[13.5px] font-semibold text-ink">
                  {i === 0 ? option.from : option.to}
                </span>
                <span className="block text-[12px] text-ink-muted">
                  {i === 0
                    ? new Date(departureDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })
                    : new Date(returnDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                </span>
              </span>
            </div>
          ))}
          <div className="mt-3 flex items-center justify-between border-t border-border/60 pt-3 text-[12.5px] text-ink-muted">
            <span>{option.duration}</span>
            <span>{option.stops === 0 ? 'Direct' : `${option.stops} stops`}</span>
          </div>
        </div>

        <div>
          <h3 className="text-[13px] font-bold text-ink">Included</h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {option.amenities.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[11.5px] font-medium text-ink-soft"
              >
                <Check className="size-3 text-primary" />
                {a}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-2xl border border-border/70 p-3.5">
            <CalendarDays className="size-4 text-primary" />
            <p className="mt-1.5 text-[12px] font-semibold text-ink-soft">Fare rules</p>
            <p className="text-[11.5px] text-ink-muted">
              {option.refundable ? 'Refundable up to 24h before' : 'Non-refundable'}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 p-3.5">
            <Leaf className="size-4 text-primary" />
            <p className="mt-1.5 text-[12px] font-semibold text-ink-soft">Emissions</p>
            <p className="text-[11.5px] text-ink-muted">{option.co2Kg} kg CO₂ per traveller</p>
          </div>
          <div className="rounded-2xl border border-border/70 p-3.5">
            <Users className="size-4 text-primary" />
            <p className="mt-1.5 text-[12px] font-semibold text-ink-soft">Travellers</p>
            <p className="text-[11.5px] text-ink-muted">
              {travelers} × {formatPrice(option.price, currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-border/70 p-3.5">
            <Search className="size-4 text-primary" />
            <p className="mt-1.5 text-[12px] font-semibold text-ink-soft">Baggage</p>
            <p className="text-[11.5px] text-ink-muted">Checked bag included</p>
          </div>
        </div>

        <div className="rounded-2xl bg-muted/50 p-3.5">
          <p className="text-[12.5px] leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink-soft">Prototype notice.</span> Fares and schedules
            are generated locally. Continuing hands you to {option.provider} in a real deployment.
          </p>
        </div>
      </div>
    </Sheet>
  )
}
