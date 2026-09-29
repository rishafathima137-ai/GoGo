import type { Destination } from '../../types'
import { kyoto } from './kyoto'
import { santorini } from './santorini'
import { paris } from './paris'
import { dubai } from './dubai'
import { bali } from './bali'
import { switzerland } from './switzerland'
import { tokyo } from './tokyo'
import { istanbul } from './istanbul'
import { london } from './london'
import { kerala } from './kerala'
import { reykjavik } from './reykjavik'
import { marrakech } from './marrakech'

export { ALL_CATEGORIES } from './builder'

export const destinations: Destination[] = [
  kyoto,
  santorini,
  paris,
  dubai,
  bali,
  switzerland,
  tokyo,
  istanbul,
  london,
  kerala,
  reykjavik,
  marrakech,
]

export const destinationById = new Map(destinations.map((d) => [d.id, d]))

export function getDestination(id?: string): Destination | undefined {
  return id ? destinationById.get(id) : undefined
}

export const trendingDestinations = destinations.filter((d) => d.isTrending)
export const recommendedDestinations = destinations.filter((d) => d.isRecommended)
export const budgetDestinations = destinations.filter((d) => d.isBudget)
export const adventureDestinations = destinations.filter((d) => d.isAdventure)
export const nearbyDestinations = destinations.filter((d) => d.isNearby)

export const featuredDestination = kyoto

export const popularDestinations = [...destinations].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 6)

export function searchDestinations(query: string, category: string) {
  const q = query.trim().toLowerCase()
  return destinations.filter((d) => {
    const matchesCategory = category === 'All' || d.categories.includes(category as never)
    if (!matchesCategory) return false
    if (!q) return true
    return [
      d.name,
      d.country,
      d.region,
      d.tagline,
      d.description,
      ...d.categories,
      ...d.highlights,
    ]
      .join(' ')
      .toLowerCase()
      .includes(q)
  })
}

export const allAttractions = destinations.flatMap((d) =>
  d.thingsToDo.map((a) => ({ ...a, destinationName: d.name, country: d.country })),
)

export const allBestPlaces = destinations.flatMap((d) =>
  d.bestPlaces.map((p) => ({ ...p, destinationName: d.name, country: d.country })),
)
