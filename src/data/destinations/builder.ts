import type { Destination, DestinationCategory } from '../../types'

export type SeedDestination = Omit<Destination, 'quickFacts' | 'galleryTags'> & {
  galleryTags?: string[]
}

export function makeDestination(seed: SeedDestination): Destination {
  const {
    name,
    bestTimeToVisit,
    currency,
    language,
    timeZone,
    averageDailyBudget,
    safetyLevel,
    safetyScore,
    recommendedDuration,
  } = seed

  return {
    ...seed,
    galleryTags: seed.galleryTags ?? seed.bestPlaces.slice(0, 5).map((p) => p.name),
    quickFacts: [
      { label: 'Best time', value: bestTimeToVisit, icon: 'Calendar' },
      { label: 'Currency', value: currency, icon: 'Banknote' },
      { label: 'Language', value: language, icon: 'Languages' },
      { label: 'Time zone', value: timeZone, icon: 'Clock' },
      { label: 'Daily budget', value: `~$${averageDailyBudget}`, icon: 'Wallet' },
      { label: 'Safety', value: `${safetyLevel} (${safetyScore}/100)`, icon: 'ShieldCheck' },
      { label: 'Duration', value: recommendedDuration, icon: 'CalendarRange' },
      { label: 'Destination', value: name, icon: 'MapPin' },
    ],
  }
}

export const ALL_CATEGORIES: Array<'All' | DestinationCategory> = [
  'All',
  'Beach',
  'City',
  'Mountain',
  'Adventure',
  'Historical',
  'Nature',
]
