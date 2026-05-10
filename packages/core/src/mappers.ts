import type {
  DbGardenZone,
  DbGarden,
  DbGardenDesign,
  DbNote,
  DbObservation,
  DbPlantingRecord,
  DbPhoto,
  DbUserProfile,
  DbWikiEntry,
  GardenZone,
  Garden,
  GardenDesign,
  GardenType,
  Note,
  Observation,
  ObservationType,
  PlantingRecord,
  Photo,
  UserProfile,
  WikiCategoryName,
  WikiEntry,
} from './types'

const gardenTypes = new Set<GardenType>([
  'Raised Bed',
  'In-Ground',
  'Container',
  'Greenhouse',
  'Hydroponic',
])

const wikiCategories = new Set<WikiCategoryName>([
  'Vegetables',
  'Herbs',
  'Flowers',
  'Fruits',
  'Houseplants',
  'Succulents',
])

export function mapDbGardenToGarden(dbGarden: DbGarden, now = new Date()): Garden {
  return {
    id: dbGarden.id,
    name: dbGarden.name,
    plots: [],
    gardenType: toGardenType(dbGarden.garden_type),
    width: dbGarden.width ?? undefined,
    length: dbGarden.length ?? undefined,
    climateZone: dbGarden.climate_zone ?? undefined,
    soilType: dbGarden.soil_type ?? undefined,
    createdAt: dbGarden.created_at ? new Date(dbGarden.created_at) : now,
    updatedAt: dbGarden.updated_at ? new Date(dbGarden.updated_at) : now,
  }
}

export function mapDbWikiEntryToWikiEntry(dbWikiEntry: DbWikiEntry, now = new Date()): WikiEntry {
  return {
    id: dbWikiEntry.id,
    title: dbWikiEntry.common_name,
    commonName: dbWikiEntry.common_name,
    scientificName: dbWikiEntry.scientific_name ?? undefined,
    slug: toSlug(dbWikiEntry.common_name),
    category: toWikiCategoryName(dbWikiEntry.category),
    content: dbWikiEntry.entry_description,
    entryDescription: dbWikiEntry.entry_description,
    tags: [],
    sunlight: dbWikiEntry.sunlight ?? undefined,
    watering: dbWikiEntry.watering ?? undefined,
    soil: dbWikiEntry.soil ?? undefined,
    temperature: dbWikiEntry.temperature ?? undefined,
    spacing: dbWikiEntry.spacing ?? undefined,
    plantingDepth: dbWikiEntry.planting_depth ?? undefined,
    germinationTime: dbWikiEntry.germination_time ?? undefined,
    companionPlants: dbWikiEntry.companion_plants ?? undefined,
    antagonistPlants: dbWikiEntry.antagonist_plants ?? undefined,
    createdAt: dbWikiEntry.created_at ? new Date(dbWikiEntry.created_at) : now,
    updatedAt: dbWikiEntry.updated_at ? new Date(dbWikiEntry.updated_at) : now,
  }
}

export function mapDbNoteToNote(dbNote: DbNote, now = new Date()): Note {
  return {
    id: dbNote.id,
    title: dbNote.title ?? 'Field note',
    content: dbNote.content,
    isArchived: toBoolean(dbNote.is_archived),
    plantId: dbNote.plant_id ?? undefined,
    createdAt: dbNote.created_at ? new Date(dbNote.created_at) : now,
    updatedAt: dbNote.updated_at ? new Date(dbNote.updated_at) : now,
  }
}

export function mapDbPhotoToPhoto(dbPhoto: DbPhoto, now = new Date()): Photo {
  return {
    id: dbPhoto.id,
    plantId: dbPhoto.plant_id,
    imageData: dbPhoto.image_data ?? undefined,
    thumbnailData: dbPhoto.thumbnail_data ?? undefined,
    caption: dbPhoto.caption ?? undefined,
    capturedAt: dbPhoto.captured_at ? new Date(dbPhoto.captured_at) : now,
    createdAt: dbPhoto.created_at ? new Date(dbPhoto.created_at) : now,
    updatedAt: dbPhoto.updated_at ? new Date(dbPhoto.updated_at) : now,
  }
}

export function mapDbUserProfileToUserProfile(
  dbUserProfile: DbUserProfile,
  now = new Date(),
): UserProfile {
  return {
    userId: dbUserProfile.user_id,
    country: dbUserProfile.country ?? undefined,
    region: dbUserProfile.region ?? undefined,
    postcode: dbUserProfile.postcode ?? undefined,
    units: toUnits(dbUserProfile.units),
    experienceLevel: dbUserProfile.experience_level ?? undefined,
    goals: dbUserProfile.goals ?? undefined,
    climateNotes: dbUserProfile.climate_notes ?? undefined,
    createdAt: dbUserProfile.created_at ? new Date(dbUserProfile.created_at) : now,
    updatedAt: dbUserProfile.updated_at ? new Date(dbUserProfile.updated_at) : now,
  }
}

export function mapDbGardenZoneToGardenZone(dbGardenZone: DbGardenZone, now = new Date()): GardenZone {
  return {
    id: dbGardenZone.id,
    gardenId: dbGardenZone.garden_id,
    name: dbGardenZone.name,
    zoneType: dbGardenZone.zone_type ?? undefined,
    widthFeet: dbGardenZone.width_feet ?? undefined,
    lengthFeet: dbGardenZone.length_feet ?? undefined,
    sortOrder: dbGardenZone.sort_order ?? undefined,
    photoId: dbGardenZone.photo_id ?? undefined,
    notes: dbGardenZone.notes ?? undefined,
    createdAt: dbGardenZone.created_at ? new Date(dbGardenZone.created_at) : now,
    updatedAt: dbGardenZone.updated_at ? new Date(dbGardenZone.updated_at) : now,
  }
}

export function mapDbPlantingRecordToPlantingRecord(
  dbPlantingRecord: DbPlantingRecord,
  now = new Date(),
): PlantingRecord {
  return {
    id: dbPlantingRecord.id,
    plantNameSnapshot: dbPlantingRecord.plant_name_snapshot,
    speciesSnapshot: dbPlantingRecord.species_snapshot ?? undefined,
    varietySnapshot: dbPlantingRecord.variety_snapshot ?? undefined,
    gardenId: dbPlantingRecord.garden_id ?? undefined,
    zoneId: dbPlantingRecord.zone_id ?? undefined,
    plantedAt: new Date(dbPlantingRecord.planted_at),
    removedAt: dbPlantingRecord.removed_at ? new Date(dbPlantingRecord.removed_at) : undefined,
    harvestedAt: dbPlantingRecord.harvested_at ? new Date(dbPlantingRecord.harvested_at) : undefined,
    sourcePlantId: dbPlantingRecord.source_plant_id ?? undefined,
    outcome: dbPlantingRecord.outcome ?? undefined,
    season: dbPlantingRecord.season ?? undefined,
    year: dbPlantingRecord.year ?? undefined,
    createdAt: dbPlantingRecord.created_at ? new Date(dbPlantingRecord.created_at) : now,
    updatedAt: dbPlantingRecord.updated_at ? new Date(dbPlantingRecord.updated_at) : now,
  }
}

export function mapDbObservationToObservation(dbObservation: DbObservation, now = new Date()): Observation {
  return {
    id: dbObservation.id,
    observationType: toObservationType(dbObservation.observation_type),
    textContent: dbObservation.text_content ?? undefined,
    imageData: dbObservation.image_data ?? undefined,
    thumbnailData: dbObservation.thumbnail_data ?? undefined,
    audioData: dbObservation.audio_data ?? undefined,
    transcript: dbObservation.transcript ?? undefined,
    plantId: dbObservation.plant_id ?? undefined,
    gardenId: dbObservation.garden_id ?? undefined,
    zoneId: dbObservation.zone_id ?? undefined,
    plantingRecordId: dbObservation.planting_record_id ?? undefined,
    tags: toStringArray(dbObservation.tags),
    observedAt: dbObservation.observed_at ? new Date(dbObservation.observed_at) : now,
    createdAt: dbObservation.created_at ? new Date(dbObservation.created_at) : now,
    updatedAt: dbObservation.updated_at ? new Date(dbObservation.updated_at) : now,
  }
}

export function mapDbGardenDesignToGardenDesign(
  dbGardenDesign: DbGardenDesign,
  now = new Date(),
): GardenDesign {
  return {
    id: dbGardenDesign.id,
    gardenId: dbGardenDesign.garden_id,
    name: dbGardenDesign.name,
    canvasData: dbGardenDesign.canvas_data ?? undefined,
    thumbnailData: dbGardenDesign.thumbnail_data ?? undefined,
    createdAt: dbGardenDesign.created_at ? new Date(dbGardenDesign.created_at) : now,
    updatedAt: dbGardenDesign.updated_at ? new Date(dbGardenDesign.updated_at) : now,
  }
}

export function toGardenType(value: string | null | undefined): GardenType | undefined {
  return value && gardenTypes.has(value as GardenType)
    ? (value as GardenType)
    : undefined
}

export function toWikiCategoryName(value: string | null | undefined): WikiCategoryName | undefined {
  return value && wikiCategories.has(value as WikiCategoryName)
    ? (value as WikiCategoryName)
    : undefined
}

function toBoolean(value: boolean | number | null | undefined): boolean {
  return value === true || value === 1
}

function toSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function toUnits(value: string | null | undefined): UserProfile['units'] {
  return value === 'imperial' || value === 'metric' ? value : undefined
}

function toObservationType(value: string | null | undefined): ObservationType {
  return value === 'textNote'
    || value === 'photo'
    || value === 'audio'
    || value === 'taskComplete'
    || value === 'general'
    ? value
    : 'general'
}

function toStringArray(value: string[] | string | null | undefined): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string')
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as unknown
      return Array.isArray(parsed)
        ? parsed.filter((entry): entry is string => typeof entry === 'string')
        : []
    } catch {
      return []
    }
  }
  return []
}
