import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Luggage, MapPin, Plus, Sparkles, Users } from 'lucide-react'
import type { Trip } from '../types'
import { useTrips } from '../context/TripsContext'
import { destinations, getDestination } from '../data/destinations'
import { createId } from '../services/api'
import { addDays, cn, formatDateRange, formatPrice, toISODate } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Segmented } from '../components/ui/Segmented'
import { Sheet } from '../components/ui/Sheet'
import { Field, Input, Select, Textarea } from '../components/ui/Input'
import { SectionHeader } from '../components/common/SectionHeader'
import { SmartImage } from '../components/common/SmartImage'
import { EmptyState } from '../components/common/EmptyState'

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'completed', label: 'Past' },
] as const

type Filter = (typeof FILTERS)[number]['value']

export default function TripsPage() {
  const { trips, upcoming, past, addTrip } = useTrips()
  const [filter, setFilter] = useState<Filter>('all')
  const [createOpen, setCreateOpen] = useState(false)

  const list = useMemo(() => {
    if (filter === 'upcoming') return upcoming
    if (filter === 'completed') return past
    return trips
  }, [filter, trips, upcoming, past])

  return (
    <div className="container py-6 sm:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">My Trips</h1>
          <p className="mt-1 text-sm text-ink-muted">
            {upcoming.length} upcoming · {past.length} completed
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" />
          New trip
        </Button>
      </div>

      <div className="mt-5">
        <Segmented options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Filter trips" />
      </div>

      <div className="mt-6">
        {list.length === 0 ? (
          <EmptyState
            icon={<Luggage className="size-6" />}
            title={filter === 'all' ? 'No trips yet' : `No ${filter} trips`}
            description="Build an itinerary from any guide. Every day stays editable, and nothing is booked until you say so."
            actionLabel="Plan your first trip"
            onAction={() => setCreateOpen(true)}
          />
        ) : (
          <div className="space-y-3">
            {list.map((trip) => (
              <TripRow key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>

      {upcoming.length > 0 ? (
        <section className="mt-10">
          <SectionHeader title="What people plan next" subtitle="Popular itineraries our travellers build" />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.slice(0, 3).map((d) => (
              <Link
                key={d.id}
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
                  <p className="truncate text-sm font-bold text-ink">{d.name}</p>
                  <p className="truncate text-xs text-ink-muted">{d.recommendedDuration}</p>
                  <p className="mt-1 text-xs font-bold text-accent-foreground">
                    from {formatPrice(d.priceFrom, d.currency)} / day
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <CreateTripSheet
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={(trip) => addTrip(trip)}
      />
    </div>
  )
}

function TripRow({ trip }: { trip: Trip }) {
  const destination = getDestination(trip.destinationId)
  const totalItems = trip.days.reduce((n, d) => n + d.items.length, 0)
  const spent = trip.days.reduce((n, d) => n + d.items.reduce((m, i) => m + i.cost, 0), 0)
  const isPast = trip.status === 'completed'

  return (
    <Link
      to={`/trips/${trip.id}`}
      className="group surface-card flex flex-col gap-4 p-3 transition-all hover:shadow-lift sm:flex-row sm:items-center sm:p-4"
    >
      <div className="relative shrink-0">
        <SmartImage
          src={trip.cover}
          alt={trip.destinationName}
          wrapperClassName="h-40 w-full rounded-2xl sm:h-24 sm:w-32"
          className="transition-transform duration-500 group-hover:scale-105"
        />
        {isPast ? (
          <Badge tone="dark" className="absolute left-2.5 top-2.5">
            Completed
          </Badge>
        ) : trip.status === 'draft' ? (
          <Badge tone="dark" className="absolute left-2.5 top-2.5">
            Draft
          </Badge>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-[16px] font-bold text-ink">{trip.title}</h2>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3" />
            {trip.destinationName}, {trip.country}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="size-3" />
            {formatDateRange(trip.startDate, trip.endDate)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3" />
            {trip.travelers}
          </span>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Badge tone="primary">
            {trip.days.length} {trip.days.length === 1 ? 'day' : 'days'}
          </Badge>
          <Badge tone="neutral">
            <Sparkles className="size-3" />
            {totalItems} activities
          </Badge>
          {destination ? (
            <Badge tone="neutral">{destination.safetyLevel}</Badge>
          ) : null}
        </div>
      </div>

      <div className="shrink-0 text-left sm:w-36 sm:text-right">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Budget</p>
        <p className="text-[15px] font-extrabold text-ink">{formatPrice(trip.budget)}</p>
        <p
          className={cn(
            'text-xs font-semibold',
            spent > trip.budget ? 'text-rose-600' : 'text-ink-muted',
          )}
        >
          {formatPrice(spent)} planned
        </p>
      </div>
    </Link>
  )
}

function CreateTripSheet({
  open,
  onClose,
  onCreate,
}: {
  open: boolean
  onClose: () => void
  onCreate: (trip: Trip) => void
}) {
  const [destinationId, setDestinationId] = useState(destinations[0].id)
  const [title, setTitle] = useState('')
  const [start, setStart] = useState(() => toISODate(new Date(Date.now() + 45 * 86_400_000)))
  const [days, setDays] = useState(4)
  const [travelers, setTravelers] = useState(2)
  const [notes, setNotes] = useState('')
  const [minDate] = useState(() => toISODate(new Date()))

  const destination = getDestination(destinationId)!
  const endISO = useMemo(() => addDays(start, days - 1), [start, days])
  const budget = Math.round(days * destination.averageDailyBudget * travelers)

  const submit = () => {
    const id = createId('trip')
    const dayList = Array.from({ length: days }, (_, i) => {
      const dayDate = new Date(start)
      dayDate.setDate(dayDate.getDate() + i)
      const picks = destination.thingsToDo.slice(i, i + 2)
      return {
        id: `${id}-d${i + 1}`,
        date: toISODate(dayDate),
        label: `Day ${i + 1}`,
        items: picks.map((a, j) => ({
          id: `${id}-d${i + 1}-i${j + 1}`,
          title: a.name,
          time: j === 0 ? '09:30' : '16:00',
          category:
            a.category === 'Food' ? ('food' as const) : a.category === 'Shopping' ? ('shopping' as const) : a.category === 'Nature' ? ('nature' as const) : ('sightseeing' as const),
          cost: a.price,
          duration: a.duration,
          location: a.name,
          image: a.image,
          placeId: a.id,
          notes: a.description,
        })),
      }
    })

    onCreate({
      id,
      title: title.trim() || `${days} days in ${destination.name}`,
      destinationId: destination.id,
      destinationName: destination.name,
      country: destination.country,
      cover: destination.images[0],
      startDate: start,
      endDate: endISO,
      travelers,
      budget,
      status: 'draft',
      days: dayList,
      notes: notes.trim() || undefined,
    })
    setTitle('')
    setNotes('')
    onClose()
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="New trip"
      description="Pick a destination and we will draft a starting itinerary from the guide."
      footer={
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Budget</p>
            <p className="text-[15px] font-extrabold text-ink">{formatPrice(budget)}</p>
          </div>
          <Button onClick={submit}>Create draft</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Destination" htmlFor="new-trip-destination">
          <Select
            id="new-trip-destination"
            value={destinationId}
            onChange={(e) => setDestinationId(e.target.value)}
          >
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}, {d.country}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Trip name" htmlFor="new-trip-title">
          <Input
            id="new-trip-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`${days} days in ${destination.name}`}
          />
        </Field>

        <Field label="Start date" htmlFor="new-trip-start">
          <Input
            id="new-trip-start"
            type="date"
            value={start}
            min={minDate}
            onChange={(e) => setStart(e.target.value)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Length" htmlFor="new-trip-days">
            <Select id="new-trip-days" value={days} onChange={(e) => setDays(Number(e.target.value))}>
              {[2, 3, 4, 5, 6, 7, 10, 14].map((n) => (
                <option key={n} value={n}>
                  {n} days
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Travellers" htmlFor="new-trip-travelers">
            <Select
              id="new-trip-travelers"
              value={travelers}
              onChange={(e) => setTravelers(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="overflow-hidden rounded-2xl">
          <SmartImage
            src={destination.images[0]}
            alt={destination.name}
            wrapperClassName="aspect-[16/7] w-full"
          />
        </div>

        <Field label="Notes" htmlFor="new-trip-notes">
          <Textarea
            id="new-trip-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything we should keep in mind."
          />
        </Field>
      </div>
    </Sheet>
  )
}
