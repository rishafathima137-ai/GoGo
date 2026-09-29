export type DestinationCategory =
  | 'Beach'
  | 'City'
  | 'Mountain'
  | 'Adventure'
  | 'Historical'
  | 'Nature'

/**
 * ISO 4217 codes. `Intl.NumberFormat` throws a RangeError for anything outside
 * this set, which unmounts the whole React tree, so the union is enforced at
 * compile time rather than trusted at runtime.
 */
export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'AED'
  | 'CHF'
  | 'IDR'
  | 'TRY'
  | 'INR'
  | 'SGD'
  | 'AUD'
  | 'CAD'
  | 'MAD'
  | 'ISK'
  | 'KRW'
  | 'CNY'
  | 'THB'
  | 'ZAR'
  | 'NZD'
  | 'SEK'
  | 'NOK'
  | 'DKK'
  | 'PLN'
  | 'CZK'
  | 'HUF'
  | 'BRL'
  | 'MXN'
  | 'PHP'
  | 'MYR'
  | 'VND'
  | 'ILS'
  | 'CLP'
  | 'ARS'
  | 'COP'
  | 'PEN'

export type Destination = {
  id: string
  name: string
  country: string
  region: string
  tagline: string
  description: string
  images: string[]
  rating: number
  reviewCount: number
  priceFrom: number
  /** ISO 4217 code, e.g. "JPY". Required by Intl.NumberFormat. */
  currency: CurrencyCode
  language: string
  languageCode: string
  timeZone: string
  categories: DestinationCategory[]
  bestTimeToVisit: string
  averageDailyBudget: number
  safetyLevel: 'Very safe' | 'Safe' | 'Moderate' | 'Caution'
  safetyScore: number
  recommendedDuration: string
  languages: string[]
  emergency: {
    police: string
    ambulance: string
    touristHelpline: string
  }
  quickFacts: { label: string; value: string; icon: string }[]
  highlights: string[]
  bestPlaces: BestPlace[]
  thingsToDo: Attraction[]
  localExperience: LocalExperience
  travelInfo: TravelInfo
  coordinates: { lat: number; lng: number }
  isTrending?: boolean
  isRecommended?: boolean
  isBudget?: boolean
  isAdventure?: boolean
  isNearby?: boolean
  weather: { month: string; high: number; low: number; condition: string }[]
  galleryTags: string[]
}

export type BestPlace = {
  id: string
  name: string
  kind: 'Tourist attraction' | 'Hidden gem' | 'Viewpoint' | 'Historical place' | 'Beach / Nature'
  description: string
  image: string
  rating: number
  entryFee: number
  coordinates: { lat: number; lng: number }
  bestTime: string
}

export type Attraction = {
  id: string
  name: string
  description: string
  image: string
  rating: number
  price: number
  duration: string
  category: string
  coordinates: { lat: number; lng: number }
  openHours: string
}

export type LocalExperience = {
  food: { name: string; description: string; image: string; price: number }[]
  culture: { title: string; description: string }[]
  festivals: { name: string; date: string; description: string }[]
  customs: { title: string; description: string }[]
}

export type TravelInfo = {
  transportation: { mode: string; detail: string; cost: number; icon: string }[]
  visa: { country: string; requirement: string; note: string; fee: number }
  tips: string[]
  connectivity: { sim: string; cost: number; note: string }
}

export type Hotel = {
  id: string
  name: string
  destinationId: string
  location: string
  image: string
  gallery: string[]
  starRating: number
  guestRating: number
  reviewCount: number
  pricePerNight: number
  distanceFromCenterKm: number
  type: 'Hotel' | 'Ryokan' | 'Resort' | 'Boutique' | 'Hostel' | 'Guesthouse'
  amenities: string[]
  description: string
  freeCancellation: boolean
  breakfastIncluded: boolean
}

export type Restaurant = {
  id: string
  name: string
  destinationId: string
  cuisine: string
  image: string
  rating: number
  priceLevel: 1 | 2 | 3 | 4
  avgCost: number
  address: string
  coordinates: { lat: number; lng: number }
  signatureDish: string
  openHours: string
}

export type TransportMode = 'flight' | 'train' | 'bus'

export type TransportOption = {
  id: string
  mode: TransportMode
  provider: string
  logoLetter: string
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  duration: string
  stops: number
  price: number
  currency: CurrencyCode
  cabin: string
  refundable: boolean
  amenities: string[]
  co2Kg: number
}

export type TicketCategory = 'attraction' | 'hotel' | 'restaurant' | 'shopping' | 'emergency' | 'transport'

export type MapPlace = {
  id: string
  name: string
  category: TicketCategory
  destinationId: string
  coordinates: { lat: number; lng: number }
  rating: number
  price: number
  address: string
  openHours: string
}

export type ItineraryCategory =
  | 'sightseeing'
  | 'food'
  | 'shopping'
  | 'hotel'
  | 'transport'
  | 'nature'
  | 'culture'
  | 'adventure'
  | 'relax'
  | 'nightlife'

export type ItineraryItem = {
  id: string
  title: string
  time: string
  category: ItineraryCategory
  cost: number
  duration: string
  location: string
  notes?: string
  image?: string
  placeId?: string
}

export type TripDay = {
  id: string
  date: string
  label: string
  items: ItineraryItem[]
}

export type Trip = {
  id: string
  title: string
  destinationId: string
  destinationName: string
  country: string
  cover: string
  startDate: string
  endDate: string
  travelers: number
  budget: number
  status: 'upcoming' | 'completed' | 'draft'
  days: TripDay[]
  notes?: string
}

export type PhraseCategory = 'Greetings' | 'Dining' | 'Getting around' | 'Shopping' | 'Emergency' | 'Accommodation'

export type Phrase = {
  id: string
  category: PhraseCategory
  english: string
  translations: Record<string, string>
  pronunciation: Record<string, string>
}

export type Language = {
  code: string
  name: string
  nativeName: string
  flag: string
}

export type SavedEntry =
  | { type: 'destination'; id: string; savedAt: string }
  | { type: 'hotel'; id: string; savedAt: string }
  | { type: 'attraction'; id: string; savedAt: string }
  | { type: 'restaurant'; id: string; savedAt: string }
  | { type: 'trip'; id: string; savedAt: string }

export type UserProfile = {
  name: string
  handle: string
  avatar: string
  bio: string
  homeBase: string
  memberSince: string
  level: string
  countriesVisited: number
  citiesVisited: number
  daysTravelled: number
  points: number
  preferredLanguage: string
  currency: CurrencyCode
  travelStyle: string[]
  interests: string[]
  notifications: {
    priceDrops: boolean
    tripReminders: boolean
    weeklyDigest: boolean
    localDeals: boolean
  }
}

export type TravelHistoryEntry = {
  id: string
  destination: string
  country: string
  image: string
  dates: string
  rating: number
  highlights: string[]
}
