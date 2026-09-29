import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Trip } from '../types'
import { initialTrips } from '../data/trips'

type TripsContextValue = {
  trips: Trip[]
  upcoming: Trip[]
  past: Trip[]
  getTrip: (id: string) => Trip | undefined
  addTrip: (trip: Trip) => Trip
  updateTrip: (id: string, patch: Partial<Trip>) => void
  deleteTrip: (id: string) => void
}

const TripsContext = createContext<TripsContextValue | null>(null)

const STORAGE_KEY = 'travora.trips.v1'

function readInitial(): Trip[] {
  if (typeof window === 'undefined') return initialTrips
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return initialTrips
    const parsed = JSON.parse(raw) as Trip[]
    return Array.isArray(parsed) ? parsed : initialTrips
  } catch {
    return initialTrips
  }
}

export function TripsProvider({ children }: { children: ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(readInitial)
  const [today] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
    } catch {
      /* ignore quota errors */
    }
  }, [trips])

  const getTrip = useCallback(
    (id: string) => trips.find((t) => t.id === id),
    [trips],
  )

  const addTrip = useCallback((trip: Trip) => {
    setTrips((prev) => [...prev, trip])
    return trip
  }, [])

  const updateTrip = useCallback((id: string, patch: Partial<Trip>) => {
    setTrips((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch } : t)))
  }, [])

  const deleteTrip = useCallback((id: string) => {
    setTrips((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const value = useMemo<TripsContextValue>(() => {
    const sorted = [...trips].sort((a, b) => a.startDate.localeCompare(b.startDate))
    return {
      trips: sorted,
      upcoming: sorted.filter((t) => t.status !== 'completed' && t.endDate >= today),
      past: sorted.filter((t) => t.status === 'completed' || t.endDate < today),
      getTrip,
      addTrip,
      updateTrip,
      deleteTrip,
    }
  }, [trips, today, getTrip, addTrip, updateTrip, deleteTrip])

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useTrips() {
  const ctx = useContext(TripsContext)
  if (!ctx) throw new Error('useTrips must be used within <TripsProvider>')
  return ctx
}
