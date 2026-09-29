import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Navbar } from './Navbar'
import { BottomNavigation } from './BottomNavigation'
import { ErrorBoundary } from '../common/ErrorBoundary'
import { useSaved } from '../../context/SavedContext'

export function AppLayout() {
  const location = useLocation()
  const { saved } = useSaved()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [location.pathname])

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main" className="flex-1 pb-24 lg:pb-0">
        <ErrorBoundary label="This page">
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="hidden border-t border-border/70 bg-white lg:block">
        <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
          <div>
            <p className="text-sm font-bold text-ink">Travora</p>
            <p className="text-xs text-ink-muted">Your world. Your guide.</p>
          </div>
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-muted">
            <a className="hover:text-ink" href="#explore">Explore</a>
            <a className="hover:text-ink" href="#hotels">Hotels</a>
            <a className="hover:text-ink" href="#transport">Transport</a>
            <a className="hover:text-ink" href="#translator">Translator</a>
            <a className="hover:text-ink" href="#map">Map</a>
          </nav>
          <p className="text-xs text-ink-muted">Prototype data. No bookings are made.</p>
        </div>
      </footer>
      <BottomNavigation badgeCount={saved.length} />
    </div>
  )
}
