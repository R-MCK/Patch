import { PatchApiClient } from '@patch/api'
import type { DbPlant, PaginatedResponse, User } from '@/types'

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

const patchApiClient = new PatchApiClient({
    baseUrl: apiBaseUrl,
    getAuthToken,
})

// Mock API Service
// TODO: Replace these mock functions with real fetch calls to the backend API once available.

export const api = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    login: async (email: string, _password: string): Promise<{ user: User, token: string }> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // Return mock data
        return {
            user: {
                id: '1',
                email,
                name: 'Demo User',
                createdAt: new Date(),
            },
            token: 'mock-token'
        }
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    register: async (name: string, email: string, _password: string): Promise<{ user: User, token: string }> => {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 800))

        // Return mock data
        return {
            user: {
                id: '2',
                email,
                name,
                createdAt: new Date(),
            },
            token: 'mock-token-new'
        }
    },

    getPlants: async (): Promise<DbPlant[]> => {
        const payload = await patchApiClient.getPlants()
        return Array.isArray(payload) ? payload : (payload as PaginatedResponse<DbPlant>).data
    },

    getTasks: async (plantId: string) => {
        const response = await fetch(`${apiBaseUrl}/api/plants/${encodeURIComponent(plantId)}/tasks`)
        if (!response.ok) throw new Error('Failed to fetch tasks')
        return await response.json()
    },

    waterPlant: async (plantId: string) => {
        return patchApiClient.waterPlant(plantId)
    }
}
