import { create } from 'zustand'
import { mapDbPlantToPlant } from '@patch/core'
import type { Plant, PlantState } from '@/types'
import type { DbPlant } from '@patch/core'
import { api } from '@/lib/api'

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
      const dbPlants: DbPlant[] = await api.getPlants()

      const mappedPlants: Plant[] = dbPlants.map((dbPlant) => mapDbPlantToPlant(dbPlant))

      set({ plants: mappedPlants, isLoading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), isLoading: false })
    }
  }
}))
