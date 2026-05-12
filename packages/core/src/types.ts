export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: Date
}

export interface UserProfile {
  userId: string
  country?: string
  region?: string
  postcode?: string
  units?: 'imperial' | 'metric'
  experienceLevel?: string
  goals?: string
  climateNotes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Plant {
  id: string
  name: string
  scientificName?: string
  species?: string
  variety?: string
  description?: string
  imageUrl?: string
  plantedDate?: Date
  plantingDate?: Date
  gardenId?: string
  notes?: string
  wateringFrequency?: number
  sunRequirement?: SunRequirement
  location?: string
  healthStatus?: HealthStatus
  growthStage?: GrowthStage
  createdAt: Date
  updatedAt: Date
}

export interface GardenPlot {
  id: string
  x: number
  y: number
  width: number
  height: number
  plantId?: string
  label?: string
}

export type GardenType = 'Raised Bed' | 'In-Ground' | 'Container' | 'Greenhouse' | 'Hydroponic'

export interface Garden {
  id: string
  name: string
  description?: string
  imageUrl?: string
  plots: GardenPlot[]
  gardenType?: GardenType
  width?: number
  length?: number
  climateZone?: string
  soilType?: string
  createdAt: Date
  updatedAt: Date
}

export interface WikiCategory {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  entryCount: number
}

export interface WikiEntry {
  id: string
  categoryId?: string
  title: string
  commonName?: string
  scientificName?: string
  slug?: string
  category?: WikiCategoryName
  content: string
  entryDescription?: string
  imageUrl?: string
  tags: string[]
  sunlight?: string
  watering?: string
  soil?: string
  temperature?: string
  spacing?: string
  plantingDepth?: string
  germinationTime?: string
  companionPlants?: string
  antagonistPlants?: string
  createdAt: Date
  updatedAt: Date
}

export type HealthStatus = 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
export type GrowthStage = 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'dormant' | 'harvesting'
export type SunRequirement = 'full' | 'partial' | 'shade'
export type WikiCategoryName = 'Vegetables' | 'Herbs' | 'Flowers' | 'Fruits' | 'Houseplants' | 'Succulents'

export interface Note {
  id: string
  title: string
  content: string
  isArchived: boolean
  plantId?: string
  createdAt: Date
  updatedAt: Date
}

export interface Photo {
  id: string
  plantId: string
  imageData?: ArrayBuffer | string
  thumbnailData?: ArrayBuffer | string
  imageUrl?: string
  thumbnailUrl?: string
  caption?: string
  capturedAt: Date
  createdAt: Date
  updatedAt: Date
}

export type ObservationType = 'textNote' | 'photo' | 'audio' | 'taskComplete' | 'general'

export interface Observation {
  id: string
  observationType: ObservationType
  textContent?: string
  imageData?: string
  thumbnailData?: string
  audioData?: string
  transcript?: string
  plantId?: string
  gardenId?: string
  zoneId?: string
  plantingRecordId?: string
  tags: string[]
  observedAt: Date
  createdAt: Date
  updatedAt: Date
}

export interface GardenZone {
  id: string
  gardenId: string
  name: string
  zoneType?: string
  widthFeet?: number
  lengthFeet?: number
  sortOrder?: number
  photoId?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface PlantingRecord {
  id: string
  plantNameSnapshot: string
  speciesSnapshot?: string
  varietySnapshot?: string
  gardenId?: string
  zoneId?: string
  plantedAt: Date
  removedAt?: Date
  harvestedAt?: Date
  sourcePlantId?: string
  outcome?: string
  season?: string
  year?: number
  createdAt: Date
  updatedAt: Date
}

export interface GardenDesign {
  id: string
  gardenId: string
  name: string
  canvasData?: ArrayBuffer
  thumbnailData?: ArrayBuffer
  createdAt: Date
  updatedAt: Date
}

export interface DbPlant {
  id: string
  name: string
  species?: string | null
  variety?: string | null
  planting_date?: string | null
  location?: string | null
  health_status?: string | null
  growth_stage?: string | null
  garden_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DbGarden {
  id: string
  name: string
  garden_type?: string | null
  width?: number | null
  length?: number | null
  climate_zone?: string | null
  soil_type?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DbWikiEntry {
  id: string
  common_name: string
  scientific_name?: string | null
  category?: string | null
  entry_description: string
  sunlight?: string | null
  watering?: string | null
  soil?: string | null
  temperature?: string | null
  spacing?: string | null
  planting_depth?: string | null
  germination_time?: string | null
  companion_plants?: string | null
  antagonist_plants?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DbNote {
  id: string
  user_id?: string | null
  title?: string | null
  content: string
  is_archived?: boolean | number | null
  plant_id?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DbPhoto {
  id: string
  user_id?: string | null
  plant_id: string
  image_data?: ArrayBuffer | string | null
  thumbnail_data?: ArrayBuffer | string | null
  caption?: string | null
  captured_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DbUserProfile {
  user_id: string
  country?: string | null
  region?: string | null
  postcode?: string | null
  units?: string | null
  experience_level?: string | null
  goals?: string | null
  climate_notes?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DbGardenZone {
  id: string
  user_id?: string | null
  garden_id: string
  name: string
  zone_type?: string | null
  width_feet?: number | null
  length_feet?: number | null
  sort_order?: number | null
  photo_id?: string | null
  notes?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DbPlantingRecord {
  id: string
  user_id?: string | null
  plant_name_snapshot: string
  species_snapshot?: string | null
  variety_snapshot?: string | null
  garden_id?: string | null
  zone_id?: string | null
  planted_at: string
  removed_at?: string | null
  harvested_at?: string | null
  source_plant_id?: string | null
  outcome?: string | null
  season?: string | null
  year?: number | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DbObservation {
  id: string
  user_id?: string | null
  observation_type: string
  text_content?: string | null
  image_data?: string | null
  thumbnail_data?: string | null
  audio_data?: string | null
  transcript?: string | null
  plant_id?: string | null
  garden_id?: string | null
  zone_id?: string | null
  planting_record_id?: string | null
  tags?: string[] | string | null
  observed_at?: string | null
  created_at?: string | null
  updated_at?: string | null
}

export interface DbGardenDesign {
  id: string
  garden_id: string
  name: string
  canvas_data?: ArrayBuffer | null
  thumbnail_data?: ArrayBuffer | null
  created_at?: string | null
  updated_at?: string | null
}

export interface PaginatedResponse<T> {
  data: T[]
  limit: number
  offset: number
}
