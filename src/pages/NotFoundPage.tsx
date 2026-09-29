import { Link } from 'react-router-dom'
import { Compass, MapPinned } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <div className="grid size-16 place-items-center rounded-3xl bg-primary-soft text-accent-foreground">
        <MapPinned className="size-8" />
      </div>
      <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-ink-muted">Error 404</p>
      <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
        This route goes nowhere
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        The page you were looking for has moved or never existed. Let us get you back to somewhere
        worth seeing.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
        <Link to="/">
          <Button>
            <Compass className="size-4" />
            Back to Explore
          </Button>
        </Link>
        <Link to="/map">
          <Button variant="outline">Open the map</Button>
        </Link>
      </div>
    </div>
  )
}
