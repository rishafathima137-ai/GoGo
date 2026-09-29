import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Bell,
  CalendarCheck,
  Check,
  Globe2,
  MapPin,
  Pencil,
  Star,
  TrendingUp,
  User as UserIcon,
  Wallet,
} from 'lucide-react'
import type { CurrencyCode } from '../types'
import { useProfile } from '../context/ProfileContext'
import { useSaved } from '../context/SavedContext'
import { useTrips } from '../context/TripsContext'
import { allInterests, allTravelStyles, currencies, travelHistory } from '../data/profile'
import { languages } from '../data/languages'
import { cn, formatNumber, formatPrice } from '../lib/utils'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Field, Input, Select, Textarea } from '../components/ui/Input'
import { Sheet } from '../components/ui/Sheet'
import { SectionHeader } from '../components/common/SectionHeader'
import { SmartImage } from '../components/common/SmartImage'
import { Rating } from '../components/common/Rating'
import { EmptyState } from '../components/common/EmptyState'

const NOTIFICATION_ROWS: {
  key: 'priceDrops' | 'tripReminders' | 'weeklyDigest' | 'localDeals'
  label: string
  description: string
}[] = [
  { key: 'priceDrops', label: 'Price drops', description: 'When a saved hotel or flight gets cheaper.' },
  { key: 'tripReminders', label: 'Trip reminders', description: 'A nudge the day before anything is scheduled.' },
  { key: 'weeklyDigest', label: 'Weekly digest', description: 'New guides and seasonal picks, once a week.' },
  { key: 'localDeals', label: 'Local deals', description: 'Short-lived offers in destinations you follow.' },
]

export default function ProfilePage() {
  const { user, toggleNotification, toggleTravelStyle, toggleInterest, setLanguage, setCurrency } =
    useProfile()
  const { saved } = useSaved()
  const { trips } = useTrips()
  const [editOpen, setEditOpen] = useState(false)

  const nextLevelPoints = 10000
  const progress = Math.min(100, Math.round((user.points / nextLevelPoints) * 100))

  const stats = useMemo(
    () => [
      { label: 'Countries', value: user.countriesVisited, icon: Globe2 },
      { label: 'Cities', value: user.citiesVisited, icon: MapPin },
      { label: 'Days travelled', value: user.daysTravelled, icon: CalendarCheck },
      { label: 'Saved items', value: saved.length, icon: Star },
    ],
    [user, saved.length],
  )

  return (
    <div className="container py-6 sm:py-8">
      {/* Header card */}
      <section className="surface-card relative overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-teal-600 via-primary to-teal-400 sm:h-32" />
        <div className="px-5 pb-5 sm:px-6">
          <div className="-mt-12 flex flex-col gap-4 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <SmartImage
                src={user.avatar}
                alt={`${user.name} avatar`}
                wrapperClassName="size-24 shrink-0 rounded-3xl border-4 border-card sm:size-28"
              />
              <div className="min-w-0 pb-1">
                <h1 className="truncate text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                  {user.name}
                </h1>
                <p className="text-[13px] text-ink-muted">{user.handle}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <Badge tone="primary">
                    <Award className="size-3" />
                    {user.level}
                  </Badge>
                  <Badge tone="neutral">Since {user.memberSince}</Badge>
                </div>
              </div>
            </div>
            <Button variant="outline" size="sm" className="sm:mb-1" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" />
              Edit profile
            </Button>
          </div>

          <p className="mt-4 text-[13.5px] leading-relaxed text-ink-soft">{user.bio}</p>
          <p className="mt-2 flex items-center gap-1.5 text-[12.5px] text-ink-muted">
            <MapPin className="size-3.5" />
            Based in {user.homeBase}
          </p>

          <div className="mt-4 rounded-2xl bg-primary-soft/50 p-3.5">
            <div className="flex items-center justify-between gap-3 text-[12.5px] font-semibold">
              <span className="text-ink-soft">
                {formatNumber(user.points)} / {formatNumber(nextLevelPoints)} pts
              </span>
              <span className="text-accent-foreground">
                {formatNumber(nextLevelPoints - user.points)} to next level
              </span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
              <div
                className="h-full rounded-full bg-primary transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="surface-card p-3.5">
            <s.icon className="size-[18px] text-primary" />
            <p className="mt-2 text-[19px] font-extrabold tracking-tight text-ink">
              {formatNumber(s.value)}
            </p>
            <p className="mt-0.5 text-[11.5px] font-medium text-ink-muted">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Travel preferences */}
      <section className="mt-8">
        <SectionHeader title="How you travel" subtitle="Used to tune recommendations" />
        <div className="space-y-5">
          <div className="surface-card p-5">
            <h3 className="text-[13px] font-bold text-ink">Travel style</h3>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {allTravelStyles.map((s) => {
                const on = user.travelStyle.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleTravelStyle(s)}
                    aria-pressed={on}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
                      on
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-card text-ink-soft hover:border-primary/30',
                    )}
                  >
                    {on ? <Check className="size-3.5" /> : null}
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="surface-card p-5">
            <h3 className="text-[13px] font-bold text-ink">Interests</h3>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {allInterests.map((s) => {
                const on = user.interests.includes(s)
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleInterest(s)}
                    aria-pressed={on}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-[12.5px] font-semibold transition-colors',
                      on
                        ? 'border-primary bg-primary-soft text-accent-foreground'
                        : 'border-border bg-card text-ink-soft hover:border-primary/30',
                    )}
                  >
                    {on ? <Check className="size-3.5" /> : null}
                    {s}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="surface-card p-5">
              <h3 className="flex items-center gap-2 text-[13px] font-bold text-ink">
                <Globe2 className="size-4 text-primary" />
                Language
              </h3>
              <Select
                value={user.preferredLanguage}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-2.5"
                aria-label="Preferred language"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.name}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="surface-card p-5">
              <h3 className="flex items-center gap-2 text-[13px] font-bold text-ink">
                <Wallet className="size-4 text-primary" />
                Currency
              </h3>
              <Select
                value={user.currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="mt-2.5"
                aria-label="Preferred currency"
              >
                {currencies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
              <p className="mt-2 text-[11.5px] text-ink-muted">
                Prototype: prices stay in USD. Conversion is display-only.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trips summary */}
      <section className="mt-8">
        <SectionHeader
          title="Your trips"
          subtitle={`${trips.length} in your account`}
          actionLabel="Manage trips"
          actionHref="/trips"
        />
        {trips.length === 0 ? (
          <EmptyState
            compact
            title="No trips yet"
            description="Plan one from any destination guide."
            actionLabel="Explore"
            actionHref="/"
          />
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {trips.slice(0, 3).map((t) => (
              <Link
                key={t.id}
                to={`/trips/${t.id}`}
                className="group surface-card flex items-center gap-3 p-3 transition-shadow hover:shadow-lift"
              >
                <SmartImage
                  src={t.cover}
                  alt={t.destinationName}
                  wrapperClassName="size-16 shrink-0 rounded-xl"
                  className="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-bold text-ink">{t.title}</p>
                  <p className="truncate text-[12px] text-ink-muted">
                    {t.days.length} days · {t.travelers} travellers
                  </p>
                  <p className="mt-1 text-[11.5px] font-bold text-accent-foreground">
                    {formatPrice(t.budget)} budget
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Travel history */}
      <section className="mt-8">
        <SectionHeader title="Travel history" subtitle="Places you have already been" />
        <div className="no-scrollbar -mx-4 flex snap-x-rail gap-3 overflow-x-auto px-4 pb-1 sm:-mx-5 sm:px-5 lg:mx-0 lg:px-0">
          {travelHistory.map((h) => (
            <article
              key={h.id}
              className="w-[260px] shrink-0 snap-item overflow-hidden rounded-2xl bg-card shadow-card"
            >
              <div className="relative">
                <SmartImage src={h.image} alt={h.destination} wrapperClassName="aspect-[16/10] w-full" />
                <Badge tone="dark" className="absolute left-3 top-3">
                  {h.dates}
                </Badge>
              </div>
              <div className="p-3.5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-[15px] font-bold text-ink">{h.destination}</h3>
                  <Rating value={h.rating} size="sm" />
                </div>
                <p className="text-[12px] text-ink-muted">{h.country}</p>
                <ul className="mt-2 space-y-1">
                  {h.highlights.map((x) => (
                    <li key={x} className="flex items-start gap-1.5 text-[12px] text-ink-soft">
                      <span className="mt-1.5 size-1 shrink-0 rounded-full bg-primary" />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Notifications */}
      <section className="mt-8 pb-4">
        <SectionHeader title="Notifications" subtitle="Stored locally in this browser" />
        <div className="surface-card divide-y divide-border/60 overflow-hidden">
          {NOTIFICATION_ROWS.map((row) => {
            const on = user.notifications[row.key]
            return (
              <label
                key={row.key}
                className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3.5"
              >
                <span className="flex min-w-0 items-start gap-3">
                  <Bell className="mt-0.5 size-4 shrink-0 text-ink-muted" />
                  <span className="min-w-0">
                    <span className="block text-[14px] font-semibold text-ink">{row.label}</span>
                    <span className="block text-[12px] text-ink-muted">{row.description}</span>
                  </span>
                </span>
                <span className="relative shrink-0">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleNotification(row.key)}
                    className="peer sr-only"
                  />
                  <span className="block h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
                  <span className="pointer-events-none absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow-soft transition-transform peer-checked:translate-x-5" />
                </span>
              </label>
            )
          })}
        </div>
      </section>

      <EditProfileSheet open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}

function EditProfileSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, updateUser } = useProfile()
  const [name, setName] = useState(user.name)
  const [handle, setHandle] = useState(user.handle)
  const [bio, setBio] = useState(user.bio)
  const [homeBase, setHomeBase] = useState(user.homeBase)

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Edit profile"
      description="Changes are saved to this browser only."
      footer={
        <Button
          block
          onClick={() => {
            updateUser({
              name: name.trim() || user.name,
              handle: handle.trim() || user.handle,
              bio: bio.trim(),
              homeBase: homeBase.trim() || user.homeBase,
            })
            onClose()
          }}
        >
          Save changes
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <SmartImage
            src={user.avatar}
            alt="Your avatar"
            wrapperClassName="size-16 rounded-2xl"
          />
          <div>
            <p className="text-[14px] font-bold text-ink">{user.name}</p>
            <p className="text-[12px] text-ink-muted">
              Avatar uploads need a real storage service in production.
            </p>
          </div>
        </div>
        <Field label="Name" htmlFor="profile-name">
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Handle" htmlFor="profile-handle">
          <Input id="profile-handle" value={handle} onChange={(e) => setHandle(e.target.value)} />
        </Field>
        <Field label="Home base" htmlFor="profile-home">
          <Input
            id="profile-home"
            value={homeBase}
            onChange={(e) => setHomeBase(e.target.value)}
          />
        </Field>
        <Field label="Bio" htmlFor="profile-bio" hint={`${bio.length}/180`}>
          <Textarea
            id="profile-bio"
            value={bio}
            maxLength={180}
            onChange={(e) => setBio(e.target.value)}
          />
        </Field>
        <div className="flex items-center gap-2 rounded-2xl bg-muted/50 p-3.5 text-[12.5px] text-ink-muted">
          <TrendingUp className="size-4 shrink-0 text-primary" />
          <span>
            You have saved {user.citiesVisited} cities and travelled{' '}
            {formatNumber(user.daysTravelled)} days since {user.memberSince}.
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-2xl bg-muted/50 p-3.5 text-[12.5px] text-ink-muted">
          <UserIcon className="size-4 shrink-0 text-primary" />
          <span>No sign-in exists in this prototype. Data lives in localStorage.</span>
        </div>
      </div>
    </Sheet>
  )
}
