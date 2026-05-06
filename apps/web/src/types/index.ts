import type { Garden, Plant, User } from '@patch/core'

export type {
  CareFrequency,
  CareTask,
  CareTaskType,
  DbPlant,
  Garden,
  GardenPlot,
  GrowthStage,
  HealthStatus,
  PaginatedResponse,
  Plant,
  SunRequirement,
  User,
  WikiCategory,
  WikiEntry,
} from '@patch/core'

// Web-only state
export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  hasRestored: boolean
}

export interface PlantState {
  plants: Plant[]
  selectedPlant: Plant | null
  isLoading: boolean
  error: string | null
}

export interface GardenState {
  gardens: Garden[]
  selectedGarden: Garden | null
  isLoading: boolean
  error: string | null
}
