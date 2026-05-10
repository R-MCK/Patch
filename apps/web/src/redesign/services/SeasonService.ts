import type { UserProfile } from '@/types'

export type Hemisphere = 'northern' | 'southern'
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter'

export interface SeasonSummary {
  season: Season
  hemisphere: Hemisphere
  plantingWindow: string
  nudges: string[]
}

const SOUTHERN_COUNTRY_CODES = new Set([
  'au', 'nz', 'za', 'ar', 'cl', 'uy', 'py', 'bo', 'pe', 'br', 'na', 'bw', 'zm', 'zw', 'mg',
])

const SOUTHERN_COUNTRY_NAMES = new Set([
  'australia', 'new zealand', 'south africa', 'argentina', 'chile', 'uruguay', 'paraguay',
  'bolivia', 'peru', 'brazil', 'namibia', 'botswana', 'zambia', 'zimbabwe', 'madagascar',
])

function inferHemisphere(profile: UserProfile | null): Hemisphere {
  if (!profile) return 'northern'

  const country = profile.country?.trim().toLowerCase()
  if (!country) return 'northern'

  if (SOUTHERN_COUNTRY_CODES.has(country) || SOUTHERN_COUNTRY_NAMES.has(country)) {
    return 'southern'
  }

  return 'northern'
}

function monthToSeason(month: number, hemisphere: Hemisphere): Season {
  if (hemisphere === 'northern') {
    if (month >= 2 && month <= 4) return 'Spring'
    if (month >= 5 && month <= 7) return 'Summer'
    if (month >= 8 && month <= 10) return 'Autumn'
    return 'Winter'
  }

  if (month >= 2 && month <= 4) return 'Autumn'
  if (month >= 5 && month <= 7) return 'Winter'
  if (month >= 8 && month <= 10) return 'Spring'
  return 'Summer'
}

function seasonNudges(season: Season): { plantingWindow: string; nudges: string[] } {
  switch (season) {
    case 'Spring':
      return {
        plantingWindow: 'Prime sowing window',
        nudges: [
          'Start warm-season seedlings.',
          'Top up compost before heavy growth.',
          'Check irrigation lines for leaks.',
        ],
      }
    case 'Summer':
      return {
        plantingWindow: 'Growth and maintenance peak',
        nudges: [
          'Water deeply early in the morning.',
          'Mulch exposed soil to retain moisture.',
          'Scout weekly for pest pressure.',
        ],
      }
    case 'Autumn':
      return {
        plantingWindow: 'Cool-season planting window',
        nudges: [
          'Direct sow cool-weather greens.',
          'Clear and compost spent annuals.',
          'Cut back watering as temperatures drop.',
        ],
      }
    case 'Winter':
    default:
      return {
        plantingWindow: 'Planning and protection season',
        nudges: [
          'Protect tender beds from frost.',
          'Sharpen tools and plan rotations.',
          'Review notes to set spring priorities.',
        ],
      }
  }
}

export function getCurrentSeason(profile: UserProfile | null, date = new Date()): SeasonSummary {
  const hemisphere = inferHemisphere(profile)
  const season = monthToSeason(date.getMonth(), hemisphere)
  const seasonal = seasonNudges(season)

  return {
    season,
    hemisphere,
    plantingWindow: seasonal.plantingWindow,
    nudges: seasonal.nudges,
  }
}
