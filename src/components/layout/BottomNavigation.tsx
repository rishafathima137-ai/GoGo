import { Compass, Map as MapIcon, Heart, Luggage, User, type LucideIcon } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'

type NavItem = {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'Explore', icon: Compass, end: true },
  { to: '/trips', label: 'Trips', icon: Luggage },
  { to: '/map', label: 'Map', icon: MapIcon },
  { to: '/saved', label: 'Saved', icon: Heart },
  { to: '/profile', label: 'Profile', icon: User },
]

export function BottomNavigation({ badgeCount = 0 }: { badgeCount?: number }) {
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/92 pb-safe backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1.5">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'relative flex h-[58px] flex-col items-center justify-center gap-1 rounded-2xl text-[10.5px] font-semibold transition-all duration-200',
                  isActive ? 'text-primary' : 'text-ink-muted hover:text-ink-soft',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'grid h-8 w-12 place-items-center rounded-full transition-all duration-300',
                      isActive ? 'bg-primary-soft' : 'bg-transparent',
                    )}
                  >
                    <Icon className={cn('size-[19px]', isActive && 'stroke-[2.4]')} />
                  </span>
                  <span className={cn(isActive && 'text-primary')}>{label}</span>
                  {label === 'Saved' && badgeCount > 0 ? (
                    <span className="absolute right-[22%] top-1.5 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold leading-4 text-white">
                      {badgeCount > 9 ? '9+' : badgeCount}
                    </span>
                  ) : null}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
