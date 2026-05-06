import type {
  DbGarden,
  DbGardenDesign,
  DbNote,
  DbPhoto,
  DbWikiEntry,
  Garden,
  GardenDesign,
  GardenType,
  Note,
  Photo,
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
    title: dbNote.title,
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
