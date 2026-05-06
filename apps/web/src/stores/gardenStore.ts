import { create } from 'zustand'
import { PatchApiClient } from '@patch/api'
import type { Garden, GardenPlot, GardenState } from '@/types'

interface GardenActions {
  setGardens: (gardens: Garden[]) => void
  addGarden: (garden: Garden) => void
  updateGarden: (id: string, updates: Partial<Garden>) => void
  deleteGarden: (id: string) => void
  selectGarden: (garden: Garden | null) => void
  addPlot: (gardenId: string, plot: GardenPlot) => void
  updatePlot: (gardenId: string, plotId: string, updates: Partial<GardenPlot>) => void
  removePlot: (gardenId: string, plotId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  fetchGardens: () => Promise<void>
}

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')

const getAuthToken = () => {
  const storedAuth = localStorage.getItem('auth-storage')
  if (!storedAuth) return null
  try {
    const parsed = JSON.parse(storedAuth) as { state?: { token?: string | null } }
    return parsed.state?.token ?? null
  } catch {
    return null
  }
}

const gardenApiClient = new PatchApiClient({ baseUrl: apiBaseUrl, getAuthToken })

// Mock data for initial development
const mockGardens: Garden[] = [
  {
    id: '1',
    name: 'Backyard Garden',
    description: 'Main vegetable garden in the backyard',
    plots: [
      { id: 'p1', x: 0, y: 0, width: 2, height: 2, label: 'Tomatoes' },
      { id: 'p2', x: 2, y: 0, width: 1, height: 2, label: 'Herbs' },
    ],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'Front Yard Flowers',
    description: 'Decorative flower bed',
    plots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export const useGardenStore = create<GardenState & GardenActions>()((set) => ({
  gardens: mockGardens,
  selectedGarden: null,
  isLoading: false,
  error: null,

  setGardens: (gardens) => set({ gardens }),

  addGarden: (garden) =>
    set((state) => ({
      gardens: [...state.gardens, garden],
    })),

  updateGarden: (id, updates) =>
    set((state) => ({
      gardens: state.gardens.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: new Date() } : g
      ),
    })),

  deleteGarden: (id) =>
    set((state) => ({
      gardens: state.gardens.filter((g) => g.id !== id),
      selectedGarden: state.selectedGarden?.id === id ? null : state.selectedGarden,
    })),

  selectGarden: (garden) => set({ selectedGarden: garden }),

  addPlot: (gardenId, plot) =>
    set((state) => ({
      gardens: state.gardens.map((g) =>
        g.id === gardenId
          ? { ...g, plots: [...g.plots, plot], updatedAt: new Date() }
          : g
      ),
    })),

  updatePlot: (gardenId, plotId, updates) =>
    set((state) => ({
      gardens: state.gardens.map((g) =>
        g.id === gardenId
          ? {
              ...g,
              plots: g.plots.map((p) =>
                p.id === plotId ? { ...p, ...updates } : p
              ),
              updatedAt: new Date(),
            }
          : g
      ),
    })),

  removePlot: (gardenId, plotId) =>
    set((state) => ({
      gardens: state.gardens.map((g) =>
        g.id === gardenId
          ? {
              ...g,
              plots: g.plots.filter((p) => p.id !== plotId),
              updatedAt: new Date(),
            }
          : g
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  fetchGardens: async () => {
    set({ isLoading: true, error: null })
    try {
      const response = await gardenApiClient.getGardens()
      set({ gardens: response.data, isLoading: false })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), isLoading: false })
    }
  },
}))
