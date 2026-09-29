import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import {
  Bell,
  Bookmark,
  Compass,
  Languages,
  Luggage,
  Map as MapIcon,
  Menu,
  Search,
  Ticket,
  User,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useSaved } from '../../context/SavedContext'
import { useProfile } from '../../context/ProfileContext'
import { SmartImage } from '../common/SmartImage'

const links = [
  { to: '/', label: 'Explore', icon: Compass, end: true },
  { to: '/hotels', label: 'Hotels', icon: Bookmark },
  { to: '/tickets', label: 'Transport', icon: Ticket },
  { to: '/map', label: 'Map', icon: MapIcon },
  { to: '/trips', label: 'My Trips', icon: Luggage },
  { to: '/translator', label: 'Translator', icon: Languages },
  { to: '/saved', label: 'Saved', icon: Bookmark },
]

export function Navbar() {
  const [open, setOpen] = useState(false)
  const { saved } = useSaved()
  const { user } = useProfile()
  const location = useLocation()

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/85 backdrop-blur-xl">
      <div className="container flex h-16 items-center gap-4 lg:h-[72px]">
        <Link to="/" className="flex items-center gap-2.5" aria-label="Travora home">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-white shadow-teal">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" aria-hidden>
              <path
                d="M12 2.5c4.2 0 7.5 2.9 7.5 6.6 0 4.4-3.6 6.7-7.5 12.4C8.1 15.8 4.5 13.5 4.5 9.1 4.5 5.4 7.8 2.5 12 2.5Z"
                fill="currentColor"
                opacity="0.95"
              />
              <circle cx="12" cy="9" r="2.6" fill="white" />
            </svg>
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-[17px] font-extrabold tracking-tight text-ink">Travora</span>
            <span className="text-[10px] font-medium text-ink-muted">Your world. Your guide.</span>
          </span>
        </Link>

        <nav aria-label="Sections" className="ml-2 hidden flex-1 items-center gap-1 lg:flex">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-semibold transition-all duration-200',
                  isActive
                    ? 'bg-primary-soft text-accent-foreground'
                    : 'text-ink-soft hover:bg-muted hover:text-ink',
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <Link
            to="/hotels"
            aria-label="Search hotels"
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-muted hover:text-ink"
          >
            <Search className="size-[19px]" />
          </Link>
          <Link
            to="/saved"
            aria-label={`Saved items, ${saved.length} total`}
            className="relative hidden size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-muted hover:text-ink sm:grid"
          >
            <Bookmark className="size-[19px]" />
            {saved.length > 0 ? (
              <span className="absolute right-1.5 top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-white">
                {saved.length}
              </span>
            ) : null}
          </Link>
          <button
            type="button"
            aria-label="Notifications"
            className="hidden size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-muted hover:text-ink sm:grid"
          >
            <Bell className="size-[19px]" />
          </button>
          <Link
            to="/profile"
            aria-label="Your profile"
            className="ml-0.5 grid size-9 place-items-center overflow-hidden rounded-full ring-2 ring-white transition-shadow hover:ring-primary/40 sm:size-10"
          >
            <SmartImage src={user.avatar} alt={`${user.name} avatar`} className="size-full object-cover" />
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-muted lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/70 bg-white lg:hidden">
          <nav aria-label="Mobile sections" className="container grid grid-cols-2 gap-2 py-3">
            {[...links, { to: '/profile', label: 'Profile', icon: User, end: false }].map(
              ({ to, label, icon: Icon, end }) => {
                const active = end ? location.pathname === to : location.pathname.startsWith(to)
                return (
                  <Link
                    key={to}
                    to={to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 rounded-2xl px-3.5 py-3 text-sm font-semibold transition-colors',
                      active ? 'bg-primary-soft text-accent-foreground' : 'text-ink-soft hover:bg-muted',
                    )}
                  >
                    <Icon className="size-[18px]" />
                    {label}
                  </Link>
                )
              },
            )}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
