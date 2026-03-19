import { create } from 'zustand'
import type { Plant, PlantState } from '@/types'

interface PlantActions {
  setPlants: (plants: Plant[]) => void
  addPlant: (plant: Plant) => void
  updatePlant: (id: string, updates: Partial<Plant>) => void
  deletePlant: (id: string) => void
  selectPlant: (plant: Plant | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchPlants: () => Promise<void>
}

import { api } from '@/lib/api'

export const usePlantStore = create<PlantState & PlantActions>()((set) => ({
  plants: [],
  selectedPlant: null,
  isLoading: false,
  error: null,

  setPlants: (plants) => set({ plants }),

  addPlant: (plant) =>
    set((state) => ({
      plants: [...state.plants, plant],
    })),

  updatePlant: (id, updates) =>
    set((state) => ({
      plants: state.plants.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
    })),

  deletePlant: (id) =>
    set((state) => ({
      plants: state.plants.filter((p) => p.id !== id),
      selectedPlant: state.selectedPlant?.id === id ? null : state.selectedPlant,
    })),

  selectPlant: (plant) => set({ selectedPlant: plant }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchPlants: async () => {
    set({ isLoading: true, error: null })
    try {
      const dbPlants = await api.getPlants()

      // Map SQLite columns to our application types
      const mappedPlants = dbPlants.map((dp: any) => ({
        id: dp.id,
        name: dp.name,
        scientificName: dp.species,
        description: dp.variety || '',
        sunRequirement: 'full', // defaulting for now
        wateringFrequency: 2,
        location: dp.location || undefined,
        healthStatus: dp.health_status || 'good',
        growthStage: dp.growth_stage || 'seedling',
        plantedDate: dp.planting_date ? new Date(dp.planting_date) : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      }))

      set({ plants: mappedPlants, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  }
}))
