import type { MapPlace, TicketCategory } from '../types'
import { destinations } from './destinations'
import { hotels } from './hotels'
import { restaurants } from './restaurants'

/**
 * Builds a searchable POI list. Real deployment swaps this for a Places/Mapbox
 * API call — the shape of the data is deliberately identical.
 */
export function buildMapPlaces(): MapPlace[] {
  const places: MapPlace[] = []

  for (const d of destinations) {
    d.bestPlaces.forEach((p) => {
      places.push({
        id: `mp-${p.id}`,
        name: p.name,
        category: 'attraction',
        destinationId: d.id,
        coordinates: p.coordinates,
        rating: p.rating,
        price: p.entryFee,
        address: `${d.name}, ${d.country}`,
        openHours: p.bestTime,
      })
    })

    hotels
      .filter((h) => h.destinationId === d.id)
      .forEach((h, i) => {
        const jitter = 0.004 * (i + 1)
        places.push({
          id: `mp-${h.id}`,
          name: h.name,
          category: 'hotel',
          destinationId: d.id,
          coordinates: {
            lat: d.coordinates.lat + jitter,
            lng: d.coordinates.lng + jitter,
          },
          rating: h.guestRating,
          price: h.pricePerNight,
          address: h.location,
          openHours: 'Check-in from 15:00',
        })
      })

    restaurants
      .filter((r) => r.destinationId === d.id)
      .forEach((r, i) => {
        const jitter = -0.004 * (i + 1)
        places.push({
          id: `mp-${r.id}`,
          name: r.name,
          category: 'restaurant',
          destinationId: d.id,
          coordinates: {
            lat: d.coordinates.lat + jitter,
            lng: d.coordinates.lng + jitter,
          },
          rating: r.rating,
          price: r.avgCost,
          address: r.address,
          openHours: r.openHours,
        })
      })

    d.thingsToDo
      .filter((t) => t.category === 'Shopping')
      .forEach((t) => {
        places.push({
          id: `mp-${t.id}`,
          name: t.name,
          category: 'shopping',
          destinationId: d.id,
          coordinates: t.coordinates,
          rating: t.rating,
          price: t.price,
          address: `${d.name}, ${d.country}`,
          openHours: t.openHours,
        })
      })

    const emergency: { label: string; offset: number; hours: string }[] = [
      { label: 'Tourist police', offset: 0.004, hours: '24 hours' },
      { label: 'Pharmacy on call', offset: -0.004, hours: '08:00 \u2013 22:00' },
      { label: 'Ambulance station', offset: 0.007, hours: '24 hours' },
    ]

    emergency.forEach((e, idx) => {
      places.push({
        id: `mp-em-${d.id}-${idx}`,
        name: e.label,
        category: 'emergency',
        destinationId: d.id,
        coordinates: {
          lat: d.coordinates.lat + e.offset,
          lng: d.coordinates.lng - e.offset,
        },
        rating: 4,
        price: 0,
        address: `${d.name} central district`,
        openHours: e.hours,
      })
    })
  }

  destinations.forEach((d) => {
    places.push({
      id: `mp-transit-${d.id}`,
      name: `${d.name} transport hub`,
      category: 'transport',
      destinationId: d.id,
      coordinates: {
        lat: d.coordinates.lat + 0.006,
        lng: d.coordinates.lng - 0.006,
      },
      rating: 4.3,
      price: 4,
      address: `${d.name} central station`,
      openHours: '05:00 \u2013 00:00',
    })
  })

  return places
}

export const mapPlaces = buildMapPlaces()

export const mapCategoryMeta: {
  key: TicketCategory
  label: string
  color: string
  icon: string
}[] = [
  { key: 'attraction', label: 'Attractions', color: '#1faa99', icon: 'Landmark' },
  { key: 'hotel', label: 'Hotels', color: '#3b82f6', icon: 'BedDouble' },
  { key: 'restaurant', label: 'Restaurants', color: '#f59e0b', icon: 'UtensilsCrossed' },
  { key: 'shopping', label: 'Shopping', color: '#ec4899', icon: 'ShoppingBag' },
  { key: 'transport', label: 'Transport', color: '#8b5cf6', icon: 'TrainFront' },
  { key: 'emergency', label: 'Emergency', color: '#ef4444', icon: 'Siren' },
]

export function filterMapPlaces(
  places: MapPlace[],
  categories: TicketCategory[],
  destinationId?: string,
): MapPlace[] {
  return places.filter(
    (p) =>
      categories.includes(p.category) && (!destinationId || p.destinationId === destinationId),
  )
}
