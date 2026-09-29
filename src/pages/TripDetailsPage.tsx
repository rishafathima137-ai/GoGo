import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  BedDouble,
  Bus,
  CalendarDays,
  Check,
  Circle,
  Clock,
  Coffee,
  Copy,
  Flame,
  Landmark,
  MapPin,
  Moon,
  MoreVertical,
  Palmtree,
  PartyPopper,
  Pencil,
  Plus,
  ShoppingBag,
  Sparkles,
  Store,
  Trash2,
  TrainFront,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react'
import type { ItineraryCategory, ItineraryItem } from '../types'
import { useTrips } from '../context/TripsContext'
import { useSaved } from '../context/SavedContext'
import { getDestination } from '../data/destinations'
import { createId } from '../services/api'
import { cn, formatDateRange, formatPrice } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Sheet } from '../components/ui/Sheet'
import { Field, Input, Select, Textarea } from '../components/ui/Input'
import { SmartImage } from '../components/common/SmartImage'
import { EmptyState } from '../components/common/EmptyState'

const CATEGORY_META: Record<
  ItineraryCategory,
  { label: string; icon: typeof Clock; tone: string }
> = {
  sightseeing: { label: 'Sightseeing', icon: Landmark, tone: 'bg-primary-soft text-accent-foreground' },
  food: { label: 'Food', icon: UtensilsCrossed, tone: 'bg-amber-50 text-amber-700' },
  shopping: { label: 'Shopping', icon: ShoppingBag, tone: 'bg-pink-50 text-pink-700' },
  hotel: { label: 'Stay', icon: BedDouble, tone: 'bg-sky-50 text-sky-700' },
  transport: { label: 'Transport', icon: TrainFront, tone: 'bg-violet-50 text-violet-700' },
  nature: { label: 'Nature', icon: Palmtree, tone: 'bg-emerald-50 text-emerald-700' },
  culture: { label: 'Culture', icon: Sparkles, tone: 'bg-stone-200 text-stone-700' },
  adventure: { label: 'Adventure', icon: Flame, tone: 'bg-orange-50 text-orange-700' },
  relax: { label: 'Relax', icon: Coffee, tone: 'bg-teal-50 text-teal-700' },
  nightlife: { label: 'Nightlife', icon: Moon, tone: 'bg-indigo-50 text-indigo-700' },
}

const NEW_CATEGORIES = Object.keys(CATEGORY_META) as ItineraryCategory[]

export default function TripDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getTrip, updateTrip, deleteTrip } = useTrips()
  const { toggleSave, isSaved } = useSaved()
  const [editingItem, setEditingItem] = useState<{ dayId: string; item: ItineraryItem } | null>(null)
  const [addingTo, setAddingTo] = useState<string | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  const trip = id ? getTrip(id) : undefined
  const destination = trip ? getDestination(trip.destinationId) : undefined

  const totals = trip
    ? {
        spent: trip.days.reduce((n, d) => n + d.items.reduce((m, i) => m + i.cost, 0), 0),
        items: trip.days.reduce((n, d) => n + d.items.length, 0),
      }
    : { spent: 0, items: 0 }

  if (!trip) {
    return (
      <div className="container py-16">
        <EmptyState
          title="Trip not found"
          description="This trip may have been deleted, or the link is out of date."
          actionLabel="Back to trips"
          actionHref="/trips"
        />
      </div>
    )
  }

  const saved = isSaved('trip', trip.id)

  const moveItem = (dayId: string, index: number, direction: -1 | 1) => {
    const target = direction === -1 ? index - 1 : index + 1
    if (target < 0 || target >= (trip.days.find((d) => d.id === dayId)?.items.length ?? 0)) return
    updateTrip(trip.id, {
      days: trip.days.map((day) => {
        if (day.id !== dayId) return day
        const items = [...day.items]
        const [moved] = items.splice(index, 1)
        items.splice(target, 0, moved)
        return { ...day, items }
      }),
    })
  }

  const removeItem = (dayId: string, itemId: string) => {
    updateTrip(trip.id, {
      days: trip.days.map((day) =>
        day.id === dayId ? { ...day, items: day.items.filter((i) => i.id !== itemId) } : day,
      ),
    })
    setEditingItem(null)
  }

  const upsertItem = (dayId: string, item: ItineraryItem) => {
    const exists = trip.days.some((d) => d.items.some((i) => i.id === item.id))
    updateTrip(trip.id, {
      days: trip.days.map((day) => {
        if (day.id !== dayId) return day
        return {
          ...day,
          items: exists
            ? day.items.map((i) => (i.id === item.id ? item : i))
            : [...day.items, item].sort((a, b) => a.time.localeCompare(b.time)),
        }
      }),
    })
    setEditingItem(null)
    setAddingTo(null)
  }

  return (
    <div className="pb-6">
      {/* Cover */}
      <div className="relative">
        <SmartImage
          src={trip.cover}
          alt={trip.destinationName}
          priority
          wrapperClassName="h-[42vh] min-h-[300px] w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/20 to-ink/85" />
        <div className="container absolute inset-x-0 top-0 flex items-center justify-between gap-3 py-3 sm:py-4">
          <button
            type="button"
            onClick={() => navigate('/trips')}
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white/90 px-3.5 text-[13px] font-semibold text-ink shadow-card backdrop-blur transition-colors hover:bg-white"
          >
            <ArrowLeft className="size-4" />
            Trips
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleSave('trip', trip.id)}
              aria-pressed={saved}
              aria-label={saved ? 'Unsave trip' : 'Save trip'}
              className="grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur transition-colors hover:bg-white"
            >
              <Sparkles className={cn('size-[18px]', saved && 'text-primary')} />
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-expanded={menuOpen}
                aria-label="Trip options"
                className="grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-card backdrop-blur transition-colors hover:bg-white"
              >
                <MoreVertical className="size-[18px]" />
              </button>
              {menuOpen ? (
                <div className="absolute right-0 top-12 z-20 w-52 overflow-hidden rounded-2xl border border-border/70 bg-white py-1.5 shadow-lift">
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false)
                      updateTrip(trip.id, {
                        status: trip.status === 'completed' ? 'upcoming' : 'completed',
                      })
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold text-ink-soft hover:bg-muted"
                  >
                    <Check className="size-4" />
                    Mark as {trip.status === 'completed' ? 'upcoming' : 'completed'}
                  </button>
                  <Link
                    to={`/destination/${trip.destinationId}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold text-ink-soft hover:bg-muted"
                  >
                    <MapPin className="size-4" />
                    Open the guide
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void navigator.clipboard?.writeText(window.location.href)
                      setMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold text-ink-soft hover:bg-muted"
                  >
                    <Copy className="size-4" />
                    Copy share link
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm('Delete this trip? This cannot be undone.')) {
                        deleteTrip(trip.id)
                        navigate('/trips')
                      }
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-[13px] font-semibold text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="size-4" />
                    Delete trip
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="container absolute inset-x-0 bottom-0 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="white">{trip.status === 'draft' ? 'Draft' : trip.status === 'completed' ? 'Completed' : 'Upcoming'}</Badge>
            {destination ? <Badge tone="white">{destination.safetyLevel}</Badge> : null}
          </div>
          <h1 className="mt-2.5 text-[28px] font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
            {trip.title}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] font-medium text-white/80">
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" />
              {trip.destinationName}, {trip.country}
            </span>
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {formatDateRange(trip.startDate, trip.endDate)}
            </span>
          </p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="container -mt-6 space-y-5 sm:-mt-8">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {[
            { label: 'Days', value: String(trip.days.length) },
            { label: 'Activities', value: String(totals.items) },
            { label: 'Travellers', value: String(trip.travelers) },
            { label: 'Planned spend', value: formatPrice(totals.spent) },
          ].map((s) => (
            <div key={s.label} className="surface-card p-3.5">
              <p className="text-[19px] font-extrabold tracking-tight text-ink">{s.value}</p>
              <p className="mt-0.5 text-[11px] font-medium text-ink-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="surface-card p-4">
          <div className="flex items-center justify-between text-[13px] font-semibold">
            <span className="text-ink-soft">Budget used</span>
            <span className={cn(totals.spent > trip.budget ? 'text-rose-600' : 'text-ink')}>
              {formatPrice(totals.spent)} of {formatPrice(trip.budget)}
            </span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                totals.spent > trip.budget ? 'bg-rose-500' : 'bg-primary',
              )}
              style={{ width: `${Math.min(100, (totals.spent / Math.max(1, trip.budget)) * 100)}%` }}
            />
          </div>
        </div>

        {trip.notes ? (
          <div className="surface-card flex items-start gap-3 p-4">
            <Pencil className="mt-0.5 size-4 shrink-0 text-primary" />
            <p className="text-[13.5px] leading-relaxed text-ink-soft">{trip.notes}</p>
          </div>
        ) : null}
      </div>

      {/* Days */}
      <div className="container mt-8 space-y-4 pb-8">
        {trip.days.length === 0 ? (
          <EmptyState
            title="No days planned"
            description="Add activities below and Travora will keep them ordered by time."
            actionLabel="Add the first day"
            onAction={() => setAddingTo(trip.days[0]?.id ?? '')}
          />
        ) : null}

        {trip.days.map((day) => (
          <section key={day.id} className="surface-card overflow-hidden">
            <header className="flex items-center justify-between gap-3 border-b border-border/70 bg-muted/40 px-4 py-3">
              <div className="min-w-0">
                <h2 className="text-[15px] font-extrabold text-ink">
                  {day.label}
                  <span className="ml-2 text-[12px] font-medium text-ink-muted">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </h2>
                <p className="text-[11.5px] text-ink-muted">
                  {day.items.length} {day.items.length === 1 ? 'stop' : 'stops'} ·{' '}
                  {formatPrice(day.items.reduce((n, i) => n + i.cost, 0))}
                </p>
              </div>
              <Button size="sm" variant="soft" onClick={() => setAddingTo(day.id)}>
                <Plus className="size-4" />
                Add
              </Button>
            </header>

            {day.items.length === 0 ? (
              <p className="px-4 py-6 text-center text-[13px] text-ink-muted">
                Nothing planned yet. Add your first stop.
              </p>
            ) : (
              <ol className="relative px-4 py-3">
                <span
                  className="absolute bottom-6 left-[34px] top-6 w-px bg-border"
                  aria-hidden
                />
                {day.items.map((item, index) => {
                  const meta = CATEGORY_META[item.category]
                  const Icon = meta.icon
                  return (
                    <li key={item.id} className="relative flex gap-3 py-2.5">
                      <span
                        className={cn(
                          'relative z-10 grid size-9 shrink-0 place-items-center rounded-xl',
                          meta.tone,
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="text-[11.5px] font-bold tabular-nums text-primary">
                            {item.time}
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingItem({ dayId: day.id, item })}
                            className="text-left text-[14.5px] font-bold text-ink hover:text-accent-foreground"
                          >
                            {item.title}
                          </button>
                        </div>
                        <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-ink-muted">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {item.duration}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <MapPin className="size-3" />
                            {item.location}
                          </span>
                          {item.cost > 0 ? (
                            <span className="font-bold text-ink-soft">
                              {formatPrice(item.cost)}
                            </span>
                          ) : (
                            <span className="font-semibold text-emerald-600">Free</span>
                          )}
                        </p>
                        {item.notes ? (
                          <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-muted">
                            {item.notes}
                          </p>
                        ) : null}
                        <div className="mt-1.5 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveItem(day.id, index, -1)}
                            disabled={index === 0}
                            aria-label={`Move ${item.title} earlier`}
                            className="grid size-7 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-muted hover:text-ink disabled:opacity-30"
                          >
                            <ArrowUp className="size-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(day.id, index, 1)}
                            disabled={index === day.items.length - 1}
                            aria-label={`Move ${item.title} later`}
                            className="grid size-7 place-items-center rounded-lg text-ink-muted transition-colors hover:bg-muted hover:text-ink disabled:opacity-30"
                          >
                            <ArrowDown className="size-3.5" />
                          </button>
                          {item.placeId ? (
                            <Link
                              to={`/map?destination=${trip.destinationId}&place=${item.placeId}`}
                              className="ml-1 inline-flex items-center gap-1 text-[11.5px] font-semibold text-primary hover:underline"
                            >
                              <MapPin className="size-3" />
                              Map
                            </Link>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          </section>
        ))}

        {/* Suggestions */}
        {destination && destination.thingsToDo.length > 0 ? (
          <section className="rounded-3xl border border-dashed border-primary/30 bg-primary-soft/40 p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-extrabold text-ink">
              <TrendingUp className="size-4 text-primary" />
              Fill the gaps
            </h2>
            <p className="mt-1 text-[13px] text-ink-muted">
              Tap anything below to drop it into the first day that still has room.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {destination.thingsToDo.slice(0, 8).map((a) => {
                const firstOpenDay = trip.days.find((d) => d.items.length < 4)
                return (
                  <button
                    key={a.id}
                    type="button"
                    disabled={!firstOpenDay}
                    onClick={() =>
                      firstOpenDay &&
                      upsertItem(firstOpenDay.id, {
                        id: `${firstOpenDay.id}-${a.id}`,
                        title: a.name,
                        time: '12:00',
                        category: 'sightseeing',
                        cost: a.price,
                        duration: a.duration,
                        location: a.name,
                        image: a.image,
                        placeId: a.id,
                        notes: a.description,
                      })
                    }
                    className="rounded-full border border-border bg-white px-3.5 py-2 text-[12.5px] font-semibold text-ink-soft transition-all hover:border-primary/40 hover:text-ink disabled:opacity-40"
                  >
                    + {a.name}
                  </button>
                )
              })}
            </div>
          </section>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <Link to={`/hotels?destination=${trip.destinationId}`}>
            <Button variant="outline" size="sm">
              <BedDouble className="size-4" />
              Find a hotel
            </Button>
          </Link>
          <Link to={`/tickets?to=${encodeURIComponent(trip.destinationName)}`}>
            <Button variant="outline" size="sm">
              <Bus className="size-4" />
              Book transport
            </Button>
          </Link>
          <Link to={`/translator?language=${destination?.languageCode ?? 'ja'}`}>
            <Button variant="outline" size="sm">
              <PartyPopper className="size-4" />
              Phrasebook
            </Button>
          </Link>
          <Link to="/map">
            <Button variant="outline" size="sm">
              <Store className="size-4" />
              Open map
            </Button>
          </Link>
        </div>
      </div>

      <EditItemSheet
        editing={editingItem}
        onClose={() => setEditingItem(null)}
        onSave={upsertItem}
        onDelete={removeItem}
      />
      <AddItemSheet
        dayId={addingTo}
        destinationId={trip.destinationId}
        onClose={() => setAddingTo(null)}
        onSave={upsertItem}
      />
    </div>
  )
}

function EditItemSheet({
  editing,
  onClose,
  onSave,
  onDelete,
}: {
  editing: { dayId: string; item: ItineraryItem } | null
  onClose: () => void
  onSave: (dayId: string, item: ItineraryItem) => void
  onDelete: (dayId: string, itemId: string) => void
}) {
  const [draft, setDraft] = useState<ItineraryItem | null>(null)

  const current = editing?.item ?? null
  const value = draft && current && draft.id === current.id ? draft : current

  return (
    <Sheet
      open={Boolean(current)}
      onClose={() => {
        setDraft(null)
        onClose()
      }}
      title="Edit activity"
      description={current?.title}
      footer={
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50"
            onClick={() => current && editing && onDelete(editing.dayId, current.id)}
          >
            <Trash2 className="size-4" />
            Remove
          </Button>
          <Button
            onClick={() => {
              if (editing && value) onSave(editing.dayId, value)
              setDraft(null)
            }}
          >
            Save changes
          </Button>
        </div>
      }
    >
      {value ? (
        <div className="space-y-4">
          <Field label="Title" htmlFor="edit-title">
            <Input
              id="edit-title"
              value={value.title}
              onChange={(e) => setDraft({ ...value, title: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Time" htmlFor="edit-time">
              <Input
                id="edit-time"
                type="time"
                value={value.time}
                onChange={(e) => setDraft({ ...value, time: e.target.value })}
              />
            </Field>
            <Field label="Duration" htmlFor="edit-duration">
              <Input
                id="edit-duration"
                value={value.duration}
                onChange={(e) => setDraft({ ...value, duration: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Category" htmlFor="edit-category">
            <Select
              id="edit-category"
              value={value.category}
              onChange={(e) => setDraft({ ...value, category: e.target.value as ItineraryCategory })}
            >
              {NEW_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_META[c].label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Location" htmlFor="edit-location">
            <Input
              id="edit-location"
              value={value.location}
              onChange={(e) => setDraft({ ...value, location: e.target.value })}
            />
          </Field>
          <Field label="Cost" htmlFor="edit-cost" hint="0 marks it as free.">
            <Input
              id="edit-cost"
              type="number"
              min={0}
              value={value.cost}
              onChange={(e) => setDraft({ ...value, cost: Number(e.target.value) })}
            />
          </Field>
          <Field label="Notes" htmlFor="edit-notes">
            <Textarea
              id="edit-notes"
              value={value.notes ?? ''}
              onChange={(e) => setDraft({ ...value, notes: e.target.value })}
            />
          </Field>
        </div>
      ) : null}
    </Sheet>
  )
}

function AddItemSheet({
  dayId,
  destinationId,
  onClose,
  onSave,
}: {
  dayId: string | null
  destinationId: string
  onClose: () => void
  onSave: (dayId: string, item: ItineraryItem) => void
}) {
  const destination = getDestination(destinationId)
  const [title, setTitle] = useState('')
  const [time, setTime] = useState('10:00')
  const [category, setCategory] = useState<ItineraryCategory>('sightseeing')
  const [cost, setCost] = useState(0)
  const [location, setLocation] = useState('')

  const suggestions = destination?.thingsToDo ?? []

  const submit = () => {
    if (!dayId || !title.trim()) return
    onSave(dayId, {
      id: createId('item'),
      title: title.trim(),
      time,
      category,
      cost,
      duration: '1h 30m',
      location: location.trim() || destination?.name || '',
      notes: '',
    })
    setTitle('')
    setCost(0)
    setLocation('')
  }

  return (
    <Sheet
      open={Boolean(dayId)}
      onClose={onClose}
      title="Add an activity"
      description={destination ? `Anything from the ${destination.name} guide, or your own idea.` : undefined}
      footer={
        <Button block onClick={submit} disabled={!title.trim()}>
          Add to day
        </Button>
      }
    >
      <div className="space-y-4">
        {suggestions.length > 0 ? (
          <div>
            <p className="mb-2 text-[13px] font-semibold text-ink-soft">From the guide</p>
            <div className="space-y-2">
              {suggestions.slice(0, 5).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => {
                    setTitle(a.name)
                    setLocation(a.name)
                    setCost(a.price)
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-background p-2.5 text-left transition-colors hover:border-primary/40"
                >
                  <SmartImage
                    src={a.image}
                    alt={a.name}
                    wrapperClassName="size-12 shrink-0 rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13.5px] font-bold text-ink">{a.name}</p>
                    <p className="truncate text-[11.5px] text-ink-muted">
                      {a.duration} · {a.price > 0 ? formatPrice(a.price) : 'Free'}
                    </p>
                  </div>
                  <Circle className="size-4 shrink-0 text-ink-muted" />
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <Field label="What are you doing?" htmlFor="add-title">
          <Input
            id="add-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Coffee at a rooftop bar"
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Time" htmlFor="add-time">
            <Input id="add-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Field>
          <Field label="Category" htmlFor="add-category">
            <Select
              id="add-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as ItineraryCategory)}
            >
              {NEW_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_META[c].label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Where" htmlFor="add-location">
            <Input
              id="add-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={destination?.name}
            />
          </Field>
          <Field label="Cost" htmlFor="add-cost">
            <Input
              id="add-cost"
              type="number"
              min={0}
              value={cost}
              onChange={(e) => setCost(Number(e.target.value))}
            />
          </Field>
        </div>
      </div>
    </Sheet>
  )
}
