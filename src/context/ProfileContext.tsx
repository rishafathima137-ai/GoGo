import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CurrencyCode, UserProfile } from '../types'
import { currentUser } from '../data/profile'

type ProfileContextValue = {
  user: UserProfile
  updateUser: (patch: Partial<UserProfile>) => void
  toggleNotification: (key: keyof UserProfile['notifications']) => void
  toggleTravelStyle: (style: string) => void
  toggleInterest: (interest: string) => void
  setLanguage: (code: string) => void
  setCurrency: (code: CurrencyCode) => void
}

const ProfileContext = createContext<ProfileContextValue | null>(null)

const STORAGE_KEY = 'travora.profile.v1'

function readInitial(): UserProfile {
  if (typeof window === 'undefined') return currentUser
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return currentUser
    return { ...currentUser, ...(JSON.parse(raw) as Partial<UserProfile>) }
  } catch {
    return currentUser
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(readInitial)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } catch {
      /* ignore */
    }
  }, [user])

  // Patch helper that returns the previous object when nothing actually changed.
  // Without this, effects that call back into the provider re-render forever.
  const patchUser = useCallback((fn: (prev: UserProfile) => UserProfile) => {
    setUser((prev) => {
      const next = fn(prev)
      return next === prev ? prev : next
    })
  }, [])

  const updateUser = useCallback(
    (patch: Partial<UserProfile>) =>
      patchUser((prev) => ({ ...prev, ...patch })),
    [patchUser],
  )

  const toggleNotification = useCallback(
    (key: keyof UserProfile['notifications']) =>
      patchUser((prev) => ({
        ...prev,
        notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
      })),
    [patchUser],
  )

  const toggleTravelStyle = useCallback(
    (style: string) =>
      patchUser((prev) => ({
        ...prev,
        travelStyle: prev.travelStyle.includes(style)
          ? prev.travelStyle.filter((s) => s !== style)
          : [...prev.travelStyle, style],
      })),
    [patchUser],
  )

  const toggleInterest = useCallback(
    (interest: string) =>
      patchUser((prev) => ({
        ...prev,
        interests: prev.interests.includes(interest)
          ? prev.interests.filter((s) => s !== interest)
          : [...prev.interests, interest],
      })),
    [patchUser],
  )

  const setLanguage = useCallback(
    (code: string) =>
      patchUser((prev) =>
        prev.preferredLanguage === code ? prev : { ...prev, preferredLanguage: code },
      ),
    [patchUser],
  )

  const setCurrency = useCallback(
    (code: CurrencyCode) =>
      patchUser((prev) => (prev.currency === code ? prev : { ...prev, currency: code })),
    [patchUser],
  )

  const value = useMemo<ProfileContextValue>(
    () => ({
      user,
      updateUser,
      toggleNotification,
      toggleTravelStyle,
      toggleInterest,
      setLanguage,
      setCurrency,
    }),
    [
      user,
      updateUser,
      toggleNotification,
      toggleTravelStyle,
      toggleInterest,
      setLanguage,
      setCurrency,
    ],
  )

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
}

// oxlint-disable-next-line react/only-export-components
export function useProfile() {
  const ctx = useContext(ProfileContext)
  if (!ctx) throw new Error('useProfile must be used within <ProfileProvider>')
  return ctx
}
