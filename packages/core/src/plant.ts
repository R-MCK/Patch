import type { DbPlant, GrowthStage, HealthStatus, Plant } from './types'

export const healthStatuses = new Set<HealthStatus>([
  'excellent',
  'good',
  'fair',
  'poor',
  'critical',
])

export const growthStages = new Set<GrowthStage>([
  'seedling',
  'vegetative',
  'flowering',
  'fruiting',
  'dormant',
  'harvesting',
])

export function toHealthStatus(value: string | null | undefined): HealthStatus {
  return value && healthStatuses.has(value as HealthStatus)
    ? (value as HealthStatus)
    : 'good'
}

export function toGrowthStage(value: string | null | undefined): GrowthStage {
  return value && growthStages.has(value as GrowthStage)
    ? (value as GrowthStage)
    : 'seedling'
}

export function mapDbPlantToPlant(dbPlant: DbPlant, now = new Date()): Plant {
  const plantedDate = dbPlant.planting_date ? new Date(dbPlant.planting_date) : undefined

  return {
    id: dbPlant.id,
    name: dbPlant.name,
    scientificName: dbPlant.species ?? undefined,
    species: dbPlant.species ?? undefined,
    variety: dbPlant.variety ?? undefined,
    description: dbPlant.variety ?? undefined,
    sunRequirement: 'full',
    wateringFrequency: 2,
    location: dbPlant.location || undefined,
    healthStatus: toHealthStatus(dbPlant.health_status),
    growthStage: toGrowthStage(dbPlant.growth_stage),
    plantedDate,
    plantingDate: plantedDate,
    gardenId: dbPlant.garden_id ?? undefined,
    createdAt: dbPlant.created_at ? new Date(dbPlant.created_at) : now,
    updatedAt: dbPlant.updated_at ? new Date(dbPlant.updated_at) : now,
  }
}
