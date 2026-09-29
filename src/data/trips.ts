import type { Trip, TripDay, ItineraryItem } from '../types'
import { destinations } from './destinations'
import { addDays, toISODate } from '../lib/utils'

/** Start dates are anchored relative to today so the app never looks stale. */
const future = (offsetDays: number) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return toISODate(date)
}

const past = (offsetDays: number) => {
  const date = new Date()
  date.setDate(date.getDate() - offsetDays)
  return toISODate(date)
}

const byId = (id: string) => destinations.find((x) => x.id === id)!

function buildDays(startDate: string, count: number, plans: Record<number, ItineraryItem[]>, labels: string[]): TripDay[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `day-${i + 1}`,
    date: addDays(startDate, i),
    label: labels[i] ?? `Day ${i + 1}`,
    items: plans[i] ?? [],
  }))
}

const kyotoStart = future(24)

export const initialTrips: Trip[] = [
  {
    id: 'trip-kyoto-7',
    title: '7 Day Trip to Kyoto',
    destinationId: 'kyoto',
    destinationName: 'Kyoto',
    country: 'Japan',
    cover: byId('kyoto').images[0],
    startDate: kyotoStart,
    endDate: addDays(kyotoStart, 6),
    travelers: 2,
    budget: 2600,
    status: 'upcoming',
    notes: 'Cherry blossom timing looks right this year. Book the ryokan early.',
    days: buildDays(
      kyotoStart,
      7,
      {
        0: [
          {
            id: 'k-1-1',
            title: 'Arrive at Kansai International (KIX)',
            time: '09:40',
            category: 'transport',
            cost: 88,
            duration: '1h 15m',
            location: 'Kansai International Airport',
            notes: 'Haruka express to Kyoto station, 80 minutes.',
          },
          {
            id: 'k-1-2',
            title: 'Hotel check-in at The Shinmonzen',
            time: '13:00',
            category: 'hotel',
            cost: 520,
            duration: '45m',
            location: 'Gion, Higashiyama Ward',
            placeId: 'h-kyoto-2',
            image: byId('kyoto').images[1],
          },
          {
            id: 'k-1-3',
            title: 'Gion & Pontocho evening walk',
            time: '16:30',
            category: 'sightseeing',
            cost: 0,
            duration: '2h',
            location: 'Gion, Kyoto',
          },
          {
            id: 'k-1-4',
            title: 'Kaiseki dinner at Gion Karyo',
            time: '18:30',
            category: 'food',
            cost: 190,
            duration: '2h',
            location: '570-235 Gionmachi',
            placeId: 'r-kyoto-1',
          },
        ],
        1: [
          {
            id: 'k-2-1',
            title: 'Fushimi Inari before the crowds',
            time: '06:30',
            category: 'sightseeing',
            cost: 0,
            duration: '2h 30m',
            location: 'Fushimi Inari Taisha',
            image: byId('kyoto').images[2],
          },
          {
            id: 'k-2-2',
            title: 'Breakfast at Vermillion Cafe',
            time: '09:30',
            category: 'food',
            cost: 9,
            duration: '45m',
            location: 'Fushimi Inari',
          },
          {
            id: 'k-2-3',
            title: 'Nishiki Market food crawl',
            time: '12:00',
            category: 'food',
            cost: 25,
            duration: '2h',
            location: 'Nishiki Market',
            placeId: 'r-kyoto-2',
          },
          {
            id: 'k-2-4',
            title: 'Pontocho lantern-lit alley & izakaya',
            time: '19:30',
            category: 'nightlife',
            cost: 30,
            duration: '2h 30m',
            location: 'Pontocho, Nakagyo Ward',
          },
        ],
        2: [
          {
            id: 'k-3-1',
            title: 'Arashiyama bamboo grove at dawn',
            time: '07:00',
            category: 'nature',
            cost: 6,
            duration: '2h',
            location: 'Arashiyama Bamboo Grove',
            image: byId('kyoto').images[3],
          },
          {
            id: 'k-3-2',
            title: 'Iwatayama monkey park',
            time: '10:00',
            category: 'nature',
            cost: 6,
            duration: '1h 30m',
            location: 'Iwatayama, Arashiyama',
          },
          {
            id: 'k-3-3',
            title: 'Tenryu-ji garden & rickshaw',
            time: '13:00',
            category: 'culture',
            cost: 12,
            duration: '1h 30m',
            location: 'Tenryu-ji, Arashiyama',
          },
          {
            id: 'k-3-4',
            title: 'Tea ceremony workshop',
            time: '16:00',
            category: 'culture',
            cost: 55,
            duration: '1h 30m',
            location: 'Gion',
            placeId: 'kyoto-at-1',
          },
        ],
        3: [
          {
            id: 'k-4-1',
            title: "Kinkaku-ji golden pavilion",
            time: '08:30',
            category: 'sightseeing',
            cost: 4,
            duration: '1h 30m',
            location: 'Kinkaku-ji, Kita Ward',
          },
          {
            id: 'k-4-2',
            title: 'Ryoan-ji rock garden',
            time: '11:00',
            category: 'sightseeing',
            cost: 4,
            duration: '1h',
            location: 'Ryoan-ji, Ukyo Ward',
          },
          {
            id: 'k-4-3',
            title: 'Shugetsu-do shopping & matcha',
            time: '14:00',
            category: 'shopping',
            cost: 30,
            duration: '2h',
            location: 'Kitano-tenmangu, Kyoto',
          },
          {
            id: 'k-4-4',
            title: 'Tofu temple dinner in Gokokuji',
            time: '18:30',
            category: 'food',
            cost: 38,
            duration: '2h',
            location: 'Gokokuji, Ukyo Ward',
            placeId: 'r-kyoto-3',
          },
        ],
        4: [
          {
            id: 'k-5-1',
            title: "Philosopher's Path cycling",
            time: '08:00',
            category: 'nature',
            cost: 8,
            duration: '2h 30m',
            location: "Philosopher's Path, Sakyo",
          },
          {
            id: 'k-5-2',
            title: 'Heian Shrine & Okazaki canal',
            time: '11:30',
            category: 'sightseeing',
            cost: 0,
            duration: '1h',
            location: 'Heian Shrine, Higashiyama',
          },
          {
            id: 'k-5-3',
            title: 'Vegan lunch at Komorebi Tei',
            time: '13:00',
            category: 'food',
            cost: 18,
            duration: '1h',
            location: 'Okazaki, Kyoto',
          },
          {
            id: 'k-5-4',
            title: 'Kurama Onsen evening soak',
            time: '15:30',
            category: 'relax',
            cost: 22,
            duration: '4h',
            location: 'Kurama, Kyoto',
            image: byId('kyoto').images[3],
          },
        ],
        5: [
          {
            id: 'k-6-1',
            title: 'Nishiki Market revisit for souvenirs',
            time: '09:00',
            category: 'shopping',
            cost: 20,
            duration: '1h 30m',
            location: 'Nishiki Market',
          },
          {
            id: 'k-6-2',
            title: 'Kintsugi workshop',
            time: '11:30',
            category: 'culture',
            cost: 45,
            duration: '2h',
            location: 'Kyoto Station area',
          },
          {
            id: 'k-6-3',
            title: 'Kiyomizu-dera late afternoon',
            time: '15:30',
            category: 'sightseeing',
            cost: 3,
            duration: '1h 30m',
            location: 'Kiyomizu-dera, Higashiyama',
            image: byId('kyoto').images[2],
          },
          {
            id: 'k-6-4',
            title: 'Final dinner at Ramen Nagi',
            time: '19:00',
            category: 'food',
            cost: 14,
            duration: '1h',
            location: 'Kyoto Station',
          },
        ],
        6: [
          {
            id: 'k-7-1',
            title: 'Slow morning & onsen',
            time: '08:30',
            category: 'relax',
            cost: 0,
            duration: '2h',
            location: 'Gion',
          },
          {
            id: 'k-7-2',
            title: 'Shinkansen to Tokyo (optional day trip)',
            time: '11:15',
            category: 'transport',
            cost: 135,
            duration: '2h 20m',
            location: 'Kyoto Station',
          },
          {
            id: 'k-7-3',
            title: 'Haruka express to KIX',
            time: '14:20',
            category: 'transport',
            cost: 30,
            duration: '1h 20m',
            location: 'Kyoto Station',
          },
        ],
      },
      ['Arrival & Gion', 'Fushimi & Nishiki', 'Arashiyama', 'North Kyoto', 'East Kyoto', 'Crafts & Kiyomizu', 'Departure'],
    ),
  },
  {
    id: 'trip-santorini-5',
    title: '5 Day Santorini Escape',
    destinationId: 'santorini',
    destinationName: 'Santorini',
    country: 'Greece',
    cover: byId('santorini').images[0],
    startDate: future(52),
    endDate: addDays(future(52), 4),
    travelers: 2,
    budget: 1900,
    status: 'upcoming',
    days: buildDays(
      future(52),
      5,
      {
        0: [
          { id: 's-1-1', title: 'Fly into Santorini (JTR)', time: '11:20', category: 'transport', cost: 340, duration: '4h', location: 'Santorini Airport' },
          { id: 's-1-2', title: 'Check in at Ammoudi Bay Apartments', time: '15:00', category: 'hotel', cost: 135, duration: '30m', location: 'Ammoudi Bay, Oia', placeId: 'h-santorini-2' },
          { id: 's-1-3', title: 'Sunset at Oia Castle', time: '19:30', category: 'sightseeing', cost: 8, duration: '1h 30m', location: 'Oia Castle', image: byId('santorini').images[0] },
        ],
        1: [
          { id: 's-2-1', title: 'Catamaran caldera cruise', time: '10:00', category: 'adventure', cost: 95, duration: '5h', location: 'Vlychada Marina' },
          { id: 's-2-2', title: 'Dinner in Ammoudi Bay', time: '20:00', category: 'food', cost: 45, duration: '2h', location: 'Ammoudi Bay', placeId: 'r-santorini-2' },
        ],
        2: [
          { id: 's-3-1', title: 'Fira to Oia caldera hike', time: '08:00', category: 'adventure', cost: 0, duration: '3h', location: 'Fira' },
          { id: 's-3-2', title: 'Assyrtiko tasting at Santo Wines', time: '15:00', category: 'food', cost: 32, duration: '2h', location: 'Pyrgos', image: byId('santorini').images[1] },
        ],
        3: [
          { id: 's-4-1', title: 'Akrotiri Bronze Age ruins', time: '10:00', category: 'culture', cost: 15, duration: '2h', location: 'Akrotiri' },
          { id: 's-4-2', title: 'Perissa black sand beach', time: '14:00', category: 'relax', cost: 0, duration: '3h', location: 'Perissa' },
        ],
        4: [
          { id: 's-5-1', title: 'Pyrgos village & last swim', time: '09:00', category: 'sightseeing', cost: 0, duration: '3h', location: 'Pyrgos' },
          { id: 's-5-2', title: 'Ferry back to Athens or flight home', time: '15:00', category: 'transport', cost: 220, duration: '4h', location: 'Santorini Port' },
        ],
      },
      ['Arrival & Oia', 'Caldera cruise', 'Caldera hike', 'Akrotiri & beach', 'Departure'],
    ),
  },
  {
    id: 'trip-paris-4',
    title: '4 Days in Paris',
    destinationId: 'paris',
    destinationName: 'Paris',
    country: 'France',
    cover: byId('paris').images[0],
    startDate: future(11),
    endDate: addDays(future(11), 3),
    travelers: 2,
    budget: 1500,
    status: 'upcoming',
    days: buildDays(
      future(11),
      4,
      {
        0: [
          { id: 'p-1-1', title: 'Eurostar to Paris Gare de Lyon', time: '07:13', category: 'transport', cost: 178, duration: '2h 20m', location: 'Paris Gare de Lyon' },
          { id: 'p-1-2', title: 'Check in at Hôtel du Louvre', time: '11:00', category: 'hotel', cost: 285, duration: '30m', location: '1st arrondissement', placeId: 'h-paris-2' },
          { id: 'p-1-3', title: 'Musée de l’Orangerie & Tuileries', time: '14:00', category: 'culture', cost: 0, duration: '2h', location: 'Jardin des Tuileries' },
          { id: 'p-1-4', title: 'Seine sunset cruise', time: '18:30', category: 'sightseeing', cost: 22, duration: '1h', location: 'Port de la Conférence' },
        ],
        1: [
          { id: 'p-2-1', title: 'Louvre highlights route', time: '09:00', category: 'culture', cost: 26, duration: '3h', location: 'Musée du Louvre' },
          { id: 'p-2-2', title: 'Le Marais courtyards & falafel lunch', time: '13:00', category: 'food', cost: 18, duration: '2h', location: 'Le Marais' },
          { id: 'p-2-3', title: 'Canal Saint-Martin evening walk', time: '18:00', category: 'sightseeing', cost: 0, duration: '2h', location: 'Canal Saint-Martin' },
        ],
        2: [
          { id: 'p-3-1', title: 'Versailles half-day', time: '08:00', category: 'culture', cost: 34, duration: '5h', location: 'Versailles' },
          { id: 'p-3-2', title: 'Montmartre & street art at dusk', time: '16:30', category: 'sightseeing', cost: 0, duration: '3h', location: 'Montmartre' },
        ],
        3: [
          { id: 'p-4-1', title: 'Bastille & Marché des Enfants Rouges', time: '09:30', category: 'food', cost: 20, duration: '2h', location: 'Bastille' },
          { id: 'p-4-2', title: 'Eurostar back to London', time: '16:04', category: 'transport', cost: 178, duration: '2h 20m', location: 'Paris Gare du Nord' },
        ],
      },
      ['Arrival & Tuileries', 'Louvre & Marais', 'Versailles', 'Markets & departure'],
    ),
  },
  {
    id: 'trip-tokyo-6',
    title: '6 Day Tokyo Deep Dive',
    destinationId: 'tokyo',
    destinationName: 'Tokyo',
    country: 'Japan',
    cover: byId('tokyo').images[0],
    startDate: future(78),
    endDate: addDays(future(78), 5),
    travelers: 1,
    budget: 2100,
    status: 'draft',
    days: buildDays(future(78), 6, {}, ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6']),
  },
  {
    id: 'trip-past-1',
    title: 'Istanbul in 4 Days',
    destinationId: 'istanbul',
    destinationName: 'Istanbul',
    country: 'Türkiye',
    cover: byId('istanbul').images[0],
    startDate: past(120),
    endDate: addDays(past(120), 3),
    travelers: 2,
    budget: 900,
    status: 'completed',
    days: buildDays(past(120), 4, {}, ['Arrival', 'Peninsula', 'Bosphorus', 'Departure']),
  },
  {
    id: 'trip-past-2',
    title: 'Bali Slow Month',
    destinationId: 'bali',
    destinationName: 'Bali',
    country: 'Indonesia',
    cover: byId('bali').images[0],
    startDate: past(400),
    endDate: addDays(past(400), 21),
    travelers: 2,
    budget: 1400,
    status: 'completed',
    days: buildDays(past(400), 22, {}, []),
  },
]

export const tripSuggestions = destinations
  .filter((x) => x.isRecommended || x.isTrending)
  .map((x) => {
    const parsedDays = Number(x.recommendedDuration.split('\u2013')[0].replace(/\D/g, '')) || 5
    return {
      destinationId: x.id,
      name: x.name,
      country: x.country,
      image: x.images[0],
      suggestedDays: String(parsedDays),
      budget: Math.round((x.priceFrom * parsedDays) / 100) * 100,
    }
  })
