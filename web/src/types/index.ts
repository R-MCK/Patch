// User & Authentication
export interface User {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: Date
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Plants
export interface Plant {
  id: string
  name: string
  scientificName?: string
  description?: string
  imageUrl?: string
  plantedDate?: Date
  gardenId?: string
  notes?: string
  wateringFrequency?: number // days between watering
  sunRequirement?: 'full' | 'partial' | 'shade'
  location?: string
  healthStatus?: 'excellent' | 'good' | 'fair' | 'poor' | 'critical'
  growthStage?: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'dormant'
  createdAt: Date
  updatedAt: Date
}

export interface PlantState {
  plants: Plant[]
  selectedPlant: Plant | null
  isLoading: boolean
  error: string | null
}

// Gardens
export interface GardenPlot {
  id: string
  x: number
  y: number
  width: number
  height: number
  plantId?: string
  label?: string
}

export interface Garden {
  id: string
  name: string
  description?: string
  imageUrl?: string
  plots: GardenPlot[]
  createdAt: Date
  updatedAt: Date
}

export interface GardenState {
  gardens: Garden[]
  selectedGarden: Garden | null
  isLoading: boolean
  error: string | null
}

// Wiki
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
  categoryId: string
  title: string
  slug: string
  content: string
  imageUrl?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}
