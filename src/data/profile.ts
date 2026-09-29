import type { CurrencyCode, TravelHistoryEntry, UserProfile } from '../types'

const img = (id: string, w = 800) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`

export const currentUser: UserProfile = {
  name: 'Aarav Mehta',
  handle: '@aarav.roams',
  avatar: img('photo-1500648767791-00dcc994a43e', 400),
  bio: 'Slow traveller, long walks, small plates. Collecting ferry rides and good tea since 2019.',
  homeBase: 'Bengaluru, India',
  memberSince: '2019',
  level: 'Seasoned Explorer',
  countriesVisited: 24,
  citiesVisited: 87,
  daysTravelled: 214,
  points: 6840,
  preferredLanguage: 'English',
  currency: 'USD',
  travelStyle: ['Slow travel', 'Street food', 'Photography', 'Museums', 'Hiking'],
  interests: ['Ancient history', 'Local markets', 'Night markets', 'Hot springs', 'Train journeys'],
  notifications: {
    priceDrops: true,
    tripReminders: true,
    weeklyDigest: false,
    localDeals: true,
  },
}

export const travelHistory: TravelHistoryEntry[] = [
  {
    id: 'h1',
    destination: 'Kyoto',
    country: 'Japan',
    image: img('photo-1493976040374-85c8e12f0c0e', 900),
    dates: 'April 2024',
    rating: 5,
    highlights: ['Fushimi Inari at dawn', 'Nishiki street food', 'Arashiyama bamboo grove'],
  },
  {
    id: 'h2',
    destination: 'Istanbul',
    country: 'Türkiye',
    image: img('photo-1524231757912-21f4fe3a7200', 900),
    dates: 'September 2024',
    rating: 4,
    highlights: ['Sunset ferry on the Bosphorus', 'Çifte Hamam', 'Kadıköy fish market'],
  },
  {
    id: 'h3',
    destination: 'Reykjavík',
    country: 'Iceland',
    image: img('photo-1504829857797-ddff29c27927', 900),
    dates: 'February 2025',
    rating: 5,
    highlights: ['Sky Lagoon ritual', 'Aurora on the Snæfellsnes route', 'Reynisfjara at low tide'],
  },
  {
    id: 'h4',
    destination: 'Bali',
    country: 'Indonesia',
    image: img('photo-1537996194471-e657df975ab4', 900),
    dates: 'July 2023',
    rating: 4,
    highlights: ['Nusa Penida day trip', 'Tegalalang before sunrise', 'Cooking class in Ubud'],
  },
]

export const currencies = [
  'USD', 'EUR', 'GBP', 'JPY', 'AED', 'CHF', 'IDR', 'TRY', 'INR', 'SGD', 'AUD', 'CAD',
] satisfies CurrencyCode[]

export const allTravelStyles = [
  'Slow travel',
  'Street food',
  'Photography',
  'Museums',
  'Hiking',
  'Beach days',
  'Night markets',
  'Architecture',
  'Festivals',
  'Wellness',
]

export const allInterests = [
  'Ancient history',
  'Local markets',
  'Night markets',
  'Hot springs',
  'Train journeys',
  'Wildlife',
  'Surfing',
  'Design & architecture',
  'Live music',
  'Tea and coffee',
]

export const defaultSaved = [
  { type: 'destination' as const, id: 'kyoto', savedAt: '2026-01-14' },
  { type: 'destination' as const, id: 'reykjavik', savedAt: '2026-02-02' },
  { type: 'hotel' as const, id: 'h-kyoto-2', savedAt: '2026-02-18' },
  { type: 'attraction' as const, id: 'kyoto-at-1', savedAt: '2026-02-18' },
  { type: 'restaurant' as const, id: 'r-kyoto-3', savedAt: '2026-02-18' },
]
