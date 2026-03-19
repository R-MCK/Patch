import type { User } from '@/types'

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

    getPlants: async () => {
        const response = await fetch('http://localhost:3000/api/plants');
        if (!response.ok) throw new Error('Failed to fetch plants');
        return await response.json();
    },

    getTasks: async (plantId: string) => {
        const response = await fetch(`http://localhost:3000/api/plants/${plantId}/tasks`);
        if (!response.ok) throw new Error('Failed to fetch tasks');
        return await response.json();
    },

    waterPlant: async (plantId: string) => {
        const response = await fetch(`http://localhost:3000/api/plants/${plantId}/water`, {
            method: 'POST'
        });
        if (!response.ok) throw new Error('Failed to water plant');
        return await response.json();
    }
}
