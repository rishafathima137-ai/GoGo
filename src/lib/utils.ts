import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * ISO 4217 codes we trust. `Intl.NumberFormat` throws a RangeError on anything
 * else, which would take the whole React tree down, so unknown codes fall back
 * to a plain formatted number instead of crashing the app.
 */
const ISO_CURRENCIES = new Set<string>([
  'USD', 'EUR', 'GBP', 'JPY', 'AED', 'CHF', 'IDR', 'TRY', 'INR', 'SGD', 'AUD', 'CAD',
  'MAD', 'ISK', 'KRW', 'CNY', 'THB', 'ZAR', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'CZK',
  'HUF', 'BRL', 'MXN', 'PHP', 'MYR', 'VND', 'ILS', 'CLP', 'ARS', 'COP', 'PEN', 'CZK',
])

export function safeCurrencyCode(currency?: string) {
  if (!currency) return 'USD'
  const code = currency.trim().toUpperCase()
  return ISO_CURRENCIES.has(code) ? code : 'USD'
}

export function formatPrice(value: number, currency = 'USD', maximumFractionDigits = 0) {
  if (!Number.isFinite(value)) return '—'
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: safeCurrencyCode(currency),
      maximumFractionDigits,
    }).format(value)
  } catch {
    return `${maximumFractionDigits > 0 ? value.toFixed(maximumFractionDigits) : Math.round(value)} ${currency}`
  }
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  )
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function daysBetween(start: string | Date, end: string | Date) {
  const a = new Date(start).getTime()
  const b = new Date(end).getTime()
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1)
}

export function toISODate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export function formatDateRange(start: string, end: string) {
  const s = new Date(start)
  const e = new Date(end)
  const fmt = (d: Date, withYear: boolean) =>
    d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      ...(withYear ? { year: 'numeric' as const } : {}),
    })
  const sameYear = s.getFullYear() === e.getFullYear()
  if (sameYear) {
    return `${fmt(s, false)} – ${fmt(e, true)}`
  }
  return `${fmt(s, true)} – ${fmt(e, true)}`
}

export function addDays(iso: string, days: number) {
  const d = new Date(iso)
  d.setDate(d.getDate() + days)
  return toISODate(d)
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** Deterministic pseudo-random number from a string seed — keeps mock data stable. */
export function seeded(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return () => {
    h += 0x6d2b79f5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}
