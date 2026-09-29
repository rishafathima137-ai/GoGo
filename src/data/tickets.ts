import type { TransportMode, TransportOption } from '../types'

const providers: Record<TransportMode, { name: string; letter: string; amenities: string[]; refundable: boolean }[]> = {
  flight: [
    {
      name: 'Singapore Airlines',
      letter: 'SQ',
      amenities: ['Wi-Fi', 'Meals', 'Power', 'Seatback screens'],
      refundable: true,
    },
    {
      name: 'Emirates',
      letter: 'EK',
      amenities: ['Wi-Fi', 'Meals', 'Power', 'Lie-flat seats'],
      refundable: true,
    },
    {
      name: 'Japan Airlines',
      letter: 'JL',
      amenities: ['Wi-Fi', 'Meals', 'Power'],
      refundable: true,
    },
    {
      name: 'IndiGo',
      letter: '6E',
      amenities: ['Meals', 'Power'],
      refundable: false,
    },
    {
      name: 'Turkish Airlines',
      letter: 'TK',
      amenities: ['Wi-Fi', 'Meals', 'Lie-flat seats'],
      refundable: true,
    },
  ],
  train: [
    {
      name: 'JR Central (Shinkansen)',
      letter: 'JR',
      amenities: ['Reserved seat', 'Luggage space', 'Onboard food'],
      refundable: true,
    },
    { name: 'Trenitalia', letter: 'TI', amenities: ['Power', 'Wi-Fi'], refundable: true },
    { name: 'SBB Swiss Federal', letter: 'SBB', amenities: ['Power', 'Wi-Fi', 'Panoramic cars'], refundable: true },
    { name: 'Eurostar', letter: 'ES', amenities: ['Power', 'Wi-Fi', 'Cafe bar'], refundable: true },
    { name: 'Golden Mountain Express', letter: 'GME', amenities: ['Reserved seat', 'Luggage space'], refundable: false },
  ],
  bus: [
    { name: 'FlixBus', letter: 'FL', amenities: ['Power', 'Wi-Fi', 'Reclining seats'], refundable: true },
    { name: 'Eurolines', letter: 'EL', amenities: ['Power', 'Air conditioning'], refundable: true },
    { name: 'Local Coach Lines', letter: 'LC', amenities: ['Air conditioning'], refundable: false },
    { name: 'Bolt Coach', letter: 'BC', amenities: ['Power', 'Wi-Fi'], refundable: true },
  ],
}

const cityDefaults: Record<TransportMode, { from: string; to: string; price: number; stops: number; duration: string }> = {
  flight: { from: 'London (LHR)', to: 'Tokyo (HND)', price: 780, stops: 0, duration: '13h 25m' },
  train: { from: 'Paris Gare de Lyon', to: 'Zermatt', price: 178, stops: 2, duration: '7h 40m' },
  bus: { from: 'Istanbul', to: 'Cappadocia', price: 32, stops: 1, duration: '8h 15m' },
}

const timesByMode: Record<TransportMode, string[]> = {
  flight: ['06:15', '09:40', '11:25', '14:50', '18:30', '21:05'],
  train: ['07:09', '09:33', '11:47', '14:21', '16:56', '19:12'],
  bus: ['06:30', '09:00', '12:15', '15:45', '19:00', '22:10'],
}

function addHours(time: string, duration: string) {
  const [h, m] = time.split(':').map(Number)
  const match = duration.match(/(\d+)\s*h?\s*(?:(\d+)\s*m)?/i)
  const dh = match?.[1] ? Number(match[1]) : 0
  const dm = match?.[2] ? Number(match[2]) : 0
  const total = h * 60 + m + dh * 60 + dm
  const next = total % (24 * 60)
  const dayShift = Math.floor(total / (24 * 60))
  return {
    time: `${String(Math.floor(next / 60)).padStart(2, '0')}:${String(next % 60).padStart(2, '0')}`,
    dayShift,
  }
}

export function generateTransportOptions(
  mode: TransportMode,
  from?: string,
  to?: string,
  travelerCount = 1,
): TransportOption[] {
  const defaults = cityDefaults[mode]
  const list = providers[mode]
  const times = timesByMode[mode]

  return list.map((provider, index) => {
    const departureTime = times[index % times.length]
    const { time: rawArrival, dayShift } = addHours(departureTime, defaults.duration)
    const arrivalTime = dayShift > 0 ? `${rawArrival} +${dayShift}` : rawArrival
    const variance = 1 + (index % 3) * 0.16
    const price = Math.round(defaults.price * variance)
    const stops = defaults.stops + (index % 2 === 1 ? 1 : 0)

    const option: TransportOption = {
      id: `${mode}-${provider.letter}-${index}`,
      mode,
      provider: provider.name,
      logoLetter: provider.letter,
      from: from || defaults.from,
      to: to || defaults.to,
      departureTime,
      arrivalTime,
      duration: defaults.duration,
      stops,
      price,
      currency: 'USD',
      cabin: mode === 'flight' ? (index % 3 === 0 ? 'Business' : 'Economy') : 'Standard',
      refundable: provider.refundable,
      amenities: provider.amenities,
      co2Kg: mode === 'flight' ? Math.round(price * 0.62) : mode === 'train' ? Math.round(price * 0.06) : Math.round(price * 0.03),
    }
    return option
  }).map((o) => ({ ...o, price: o.price * travelerCount }))
}

export const transportModes: { key: TransportMode; label: string; icon: string; hint: string }[] = [
  { key: 'flight', label: 'Flights', icon: 'Plane', hint: 'Fastest for long distances' },
  { key: 'train', label: 'Trains', icon: 'TrainFront', hint: 'Scenic and city-centre to city-centre' },
  { key: 'bus', label: 'Buses', icon: 'Bus', hint: 'Cheapest, best for short hops' },
]

export const popularRoutes = [
  { from: 'London', to: 'Tokyo' },
  { from: 'New York', to: 'Paris' },
  { from: 'Paris', to: 'Zermatt' },
  { from: 'Istanbul', to: 'Cappadocia' },
  { from: 'Dubai', to: 'Baku' },
  { from: 'Bangkok', to: 'Chiang Mai' },
]

export const departureCities = [
  'London (LHR)',
  'Paris (CDG)',
  'New York (JFK)',
  'Dubai (DXB)',
  'Tokyo (HND)',
  'Singapore (SIN)',
  'Istanbul (IST)',
  'Zurich (ZRH)',
  'Bangkok (BKK)',
  'Rome (FCO)',
]

export const arrivalCities = [
  'Tokyo (HND)',
  'Kyoto (KIX)',
  'Paris (CDG)',
  'Santorini (JTR)',
  'Bali (DPS)',
  'Zurich (ZRH)',
  'Cappadocia (ASR)',
  'London (LHR)',
  'Paris Gare de Lyon',
  'Zermatt',
  'Chiang Mai (CNX)',
]
