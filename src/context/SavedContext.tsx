import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { SavedEntry } from '../types'
import { defaultSaved } from '../data/profile'

type SavedContextValue = {
  saved: SavedEntry[]
  isSaved: (type: SavedEntry['type'], id: string) => boolean
  toggleSave: (type: SavedEntry['type'], id: string) => void
  remove: (type: SavedEntry['type'], id: string) => void
  clear: () => void
  countFor: (type: SavedEntry['type']) => number
}

const SavedContext = createContext<SavedContextValue | null>(null)

const STORAGE_KEY = 'travora.saved.v1'

const today = () => new Date().toISOString().slice(0, 10)

function readInitial(): SavedEntry[] {
  if (typeof window === 'undefined') return defaultSaved
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSaved
    const parsed = JSON.parse(raw) as SavedEntry[]
    return Array.isArray(parsed) ? parsed : defaultSaved
  } catch {
    return defaultSaved
  }
}

export function SavedProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<SavedEntry[]>(readInitial)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      /* storage unavailable — keep in-memory state only */
    }
  }, [saved])

  const isSaved = useCallback(
    (type: SavedEntry['type'], id: string) => saved.some((s) => s.type === type && s.id === id),
    [saved],
  )

  const toggleSave = useCallback((type: SavedEntry['type'], id: string) => {
    setSaved((prev) =>
      prev.some((s) => s.type === type && s.id === id)
        ? prev.filter((s) => !(s.type === type && s.id === id))
        : [{ type, id, savedAt: today() }, ...prev],
    )
  }, [])

  const remove = useCallback((type: SavedEntry['type'], id: string) => {
    setSaved((prev) => prev.filter((s) => !(s.type === type && s.id === id)))
  }, [])

  const clear = useCallback(() => setSaved([]), [])

  const countFor = useCallback(
    (type: SavedEntry['type']) => saved.filter((s) => s.type === type).length,
    [saved],
  )

  const value = useMemo<SavedContextValue>(
    () => ({ saved, isSaved, toggleSave, remove, clear, countFor }),
    [saved, isSaved, toggleSave, remove, clear, countFor],
  )

  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useSaved() {
  const ctx = useContext(SavedContext)
  if (!ctx) throw new Error('useSaved must be used within <SavedProvider>')
  return ctx
}

