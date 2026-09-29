/**
 * Service layer. Every function is a thin, typed wrapper over mock data today.
 * Swap the internals for a `fetch` call later — call sites never change.
 *
 * Naming convention: `src/services/*`  → real API boundary
 */

import { mockTranslate } from '../data/phrases'
import { generateTransportOptions } from '../data/tickets'
import type { TransportMode, TransportOption } from '../types'

export const apiConfig = {
  baseUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? '',
  /** Set to false once a real translation provider is wired in. */
  useMockTranslator: true,
  /** Set to false once a real map SDK is mounted. */
  useMockMap: true,
} as const

/* ------------------------------------------------------------------ */
/* Translation                                                         */
/* ------------------------------------------------------------------ */

export type TranslationResult = {
  source: string
  target: string
  fromCode: string
  toCode: string
  detectedLanguage?: string
  pronunciation?: string
  provider: 'mock' | 'live'
}

export async function translateText(
  text: string,
  fromCode: string,
  toCode: string,
): Promise<TranslationResult> {
  if (!text.trim()) {
    return { source: '', target: '', fromCode, toCode, provider: 'mock' }
  }

  if (!apiConfig.useMockTranslator && apiConfig.baseUrl) {
    // Live path — ready for a real provider.
    // const res = await fetch(`${apiConfig.baseUrl}/translate`, { ... })
    // return res.json()
  }

  return {
    source: text,
    target: mockTranslate(text, toCode),
    fromCode,
    toCode,
    detectedLanguage: fromCode,
    provider: 'mock',
  }
}

/* ------------------------------------------------------------------ */
/* Transport search                                                    */
/* ------------------------------------------------------------------ */

export async function searchTransport(params: {
  mode: TransportMode
  from?: string
  to?: string
  travelers: number
  departureDate: string
  returnDate?: string
}): Promise<TransportOption[]> {
  return Promise.resolve(generateTransportOptions(params.mode, params.from, params.to, params.travelers))
}

/* ------------------------------------------------------------------ */
/* Generic helpers                                                     */
/* ------------------------------------------------------------------ */

export function delay(ms = 350) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function createId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`
}
