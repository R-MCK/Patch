import { PatchApiClient } from '@patch/api'
import type { PatchApiClientOptions } from '@patch/api'
import type {
    CareTask,
    DbPlant,
    GardenZone,
    Note,
    Observation,
    PaginatedResponse,
    Photo,
    PlantingRecord,
    UserProfile,
    WikiEntry,
} from '@/types'

const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '')
const authStorageKey = 'auth-storage'

export interface AuthUserJson {
    id: string
    email: string
    name?: string | null
    created_at?: string | null
}

export interface AuthResponseJson {
    user: AuthUserJson
    accessToken: string
    expiresIn: number
}

type TokenListener = (token: string | null) => void

type PatchAuthApiClient = PatchApiClient & {
    login: (credentials: { email: string; password: string }) => Promise<AuthResponseJson>
    register: (credentials: { email: string; password: string; name?: string }) => Promise<AuthResponseJson>
    me: () => Promise<AuthUserJson | { user: AuthUserJson }>
    refresh: () => Promise<AuthResponseJson>
    logout: () => Promise<void>
}

type PatchAuthApiClientOptions = PatchApiClientOptions & {
    setAuthToken?: (token: string | null) => void
    onAuthTokenChange?: (token: string | null) => void
}

const tokenListeners = new Set<TokenListener>()
let currentAuthToken: string | null | undefined

const getAuthToken = () => {
    if (currentAuthToken !== undefined) return currentAuthToken

    const storedAuth = localStorage.getItem(authStorageKey)
    if (!storedAuth) return null

    try {
        const parsed = JSON.parse(storedAuth) as { state?: { token?: string | null } }
        return parsed.state?.token ?? null
    } catch {
        return null
    }
}

export const setAuthToken = (token: string | null) => {
    currentAuthToken = token
    tokenListeners.forEach((listener) => listener(token))
}

export const onAuthTokenChange = (listener: TokenListener) => {
    tokenListeners.add(listener)
    return () => {
        tokenListeners.delete(listener)
    }
}

const PatchAuthApiClientConstructor = PatchApiClient as unknown as new (
    options: PatchAuthApiClientOptions
) => PatchAuthApiClient

const patchApiClient = new PatchAuthApiClientConstructor({
    baseUrl: apiBaseUrl,
    getAuthToken,
    setAuthToken,
    onAuthTokenChange: setAuthToken,
})

async function authRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')

    if (init.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json')
    }

    const token = getAuthToken()
    if (token) {
        headers.set('Authorization', `Bearer ${token}`)
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        credentials: init.credentials ?? 'include',
        headers,
    })

    if (response.status === 204) {
        return undefined as T
    }

    const payload = await response.json().catch(() => undefined)
    if (!response.ok) {
        const message = typeof payload === 'object' && payload && 'error' in payload
            ? String((payload as { error: unknown }).error)
            : `Patch API request failed: ${response.status} ${response.statusText}`
        throw new Error(message)
    }

    return payload as T
}

async function callAuthMethod<T>(
    method: keyof Pick<PatchAuthApiClient, 'login' | 'register' | 'me' | 'refresh' | 'logout'>,
    fallback: () => Promise<T>,
    payload?: unknown,
): Promise<T> {
    const clientMethod = patchApiClient[method] as unknown
    if (typeof clientMethod === 'function') {
        return payload === undefined
            ? await (clientMethod as () => Promise<T>).call(patchApiClient)
            : await (clientMethod as (payload: unknown) => Promise<T>).call(patchApiClient, payload)
    }

    return fallback()
}

export const api = {
    login: async (credentials: { email: string; password: string }): Promise<AuthResponseJson> => {
        return callAuthMethod(
            'login',
            () => authRequest<AuthResponseJson>('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials),
            }),
            credentials,
        )
    },

    register: async (credentials: { email: string; password: string; name?: string }): Promise<AuthResponseJson> => {
        return callAuthMethod(
            'register',
            () => authRequest<AuthResponseJson>('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(credentials),
            }),
            credentials,
        )
    },

    me: async (): Promise<AuthUserJson | { user: AuthUserJson }> => {
        return callAuthMethod(
            'me',
            () => authRequest<AuthUserJson | { user: AuthUserJson }>('/api/auth/me'),
        )
    },

    refresh: async (): Promise<AuthResponseJson> => {
        return callAuthMethod(
            'refresh',
            () => authRequest<AuthResponseJson>('/api/auth/refresh', { method: 'POST' }),
        )
    },

    logout: async (): Promise<void> => {
        await callAuthMethod(
            'logout',
            () => authRequest<void>('/api/auth/logout', { method: 'POST' }),
        )
    },

    getPlants: async (): Promise<DbPlant[]> => {
        const payload = await patchApiClient.getPlantRows()
        return Array.isArray(payload) ? payload : (payload as PaginatedResponse<DbPlant>).data
    },

    getTasks: async (plantId: string): Promise<CareTask[]> => {
        return patchApiClient.getTasks(plantId)
    },

    getWikiEntries: async (): Promise<WikiEntry[]> => {
        const response = await patchApiClient.getWikiEntries()
        return response.data
    },

    waterPlant: async (plantId: string) => {
        return patchApiClient.waterPlant(plantId)
    },

    createPlant: async (payload: {
        name: string
        species?: string
        variety?: string
        location?: string
        health_status?: string
        growth_stage?: string
        garden_id?: string
    }) => {
        return patchApiClient.createPlant(payload)
    },

    completeTask: async (taskId: string, completedDate?: string): Promise<CareTask> => {
        return patchApiClient.completeTask(taskId, completedDate)
    },

    getProfile: async (): Promise<UserProfile | null> => {
        return patchApiClient.getProfile()
    },

    updateProfile: async (payload: {
        country?: string | null
        region?: string | null
        postcode?: string | null
        units?: 'imperial' | 'metric' | null
        experience_level?: string | null
        goals?: string | null
        climate_notes?: string | null
    }): Promise<UserProfile> => {
        return patchApiClient.updateProfile(payload)
    },

    getPlantNotes: async (plantId: string): Promise<Note[]> => {
        return patchApiClient.getPlantNotes(plantId)
    },

    createPlantNote: async (plantId: string, payload: { title?: string | null; content: string }): Promise<Note> => {
        return patchApiClient.createPlantNote(plantId, payload)
    },

    getPlantPhotos: async (plantId: string): Promise<Photo[]> => {
        return patchApiClient.getPlantPhotos(plantId)
    },

    createPlantPhoto: async (
        plantId: string,
        payload: { image_data: string; thumbnail_data?: string | null; caption?: string | null; captured_at?: string | null },
    ): Promise<Photo> => {
        return patchApiClient.createPlantPhoto(plantId, payload)
    },

    getGardenZones: async (gardenId: string): Promise<GardenZone[]> => {
        return patchApiClient.getGardenZones(gardenId)
    },

    createGardenZone: async (
        gardenId: string,
        payload: {
            name: string
            zone_type?: string | null
            width_feet?: number | null
            length_feet?: number | null
            sort_order?: number | null
            photo_id?: string | null
            notes?: string | null
        },
    ): Promise<GardenZone> => {
        return patchApiClient.createGardenZone(gardenId, payload)
    },

    updateGardenZone: async (
        zoneId: string,
        payload: {
            name?: string
            zone_type?: string | null
            width_feet?: number | null
            length_feet?: number | null
            sort_order?: number | null
            photo_id?: string | null
            notes?: string | null
        },
    ): Promise<GardenZone> => {
        return patchApiClient.updateGardenZone(zoneId, payload)
    },

    deleteGardenZone: async (zoneId: string): Promise<void> => {
        await patchApiClient.deleteGardenZone(zoneId)
    },

    getPlantingRecords: async (filters: { garden_id?: string; zone_id?: string } = {}): Promise<PlantingRecord[]> => {
        return patchApiClient.getPlantingRecords(filters)
    },

    createPlantingRecord: async (payload: {
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
    }): Promise<PlantingRecord> => {
        return patchApiClient.createPlantingRecord(payload)
    },

    updatePlantingRecord: async (
        recordId: string,
        payload: {
            plant_name_snapshot?: string
            species_snapshot?: string | null
            variety_snapshot?: string | null
            garden_id?: string | null
            zone_id?: string | null
            planted_at?: string
            removed_at?: string | null
            harvested_at?: string | null
            source_plant_id?: string | null
            outcome?: string | null
            season?: string | null
            year?: number | null
        },
    ): Promise<PlantingRecord> => {
        return patchApiClient.updatePlantingRecord(recordId, payload)
    },

    getPlantObservations: async (plantId: string): Promise<Observation[]> => {
        return patchApiClient.getPlantObservations(plantId)
    },

    createPlantObservation: async (
        plantId: string,
        payload: {
            observation_type?: 'textNote' | 'photo' | 'audio' | 'taskComplete' | 'general'
            text_content?: string | null
            image_data?: string | null
            thumbnail_data?: string | null
            audio_data?: string | null
            transcript?: string | null
            garden_id?: string | null
            zone_id?: string | null
            planting_record_id?: string | null
            tags?: string[] | null
            observed_at?: string | null
        },
    ): Promise<Observation> => {
        return patchApiClient.createPlantObservation(plantId, payload)
    },

    getZoneHistory: async (zoneId: string): Promise<PlantingRecord[]> => {
        return patchApiClient.getZoneHistory(zoneId)
    },

    getZoneObservations: async (zoneId: string): Promise<Observation[]> => {
        return patchApiClient.getZoneObservations(zoneId)
    },

    getObservations: async (filters: { plant_id?: string; garden_id?: string; zone_id?: string } = {}): Promise<Observation[]> => {
        return patchApiClient.getObservations(filters)
    },

    createObservation: async (payload: {
        observation_type?: 'textNote' | 'photo' | 'audio' | 'taskComplete' | 'general'
        text_content?: string | null
        image_data?: string | null
        thumbnail_data?: string | null
        audio_data?: string | null
        transcript?: string | null
        plant_id?: string | null
        garden_id?: string | null
        zone_id?: string | null
        planting_record_id?: string | null
        tags?: string[] | null
        observed_at?: string | null
    }): Promise<Observation> => {
        return patchApiClient.createObservation(payload)
    },

    updateObservation: async (
        observationId: string,
        payload: {
            observation_type?: 'textNote' | 'photo' | 'audio' | 'taskComplete' | 'general'
            text_content?: string | null
            image_data?: string | null
            thumbnail_data?: string | null
            audio_data?: string | null
            transcript?: string | null
            plant_id?: string | null
            garden_id?: string | null
            zone_id?: string | null
            planting_record_id?: string | null
            tags?: string[] | null
            observed_at?: string | null
        },
    ): Promise<Observation> => {
        return patchApiClient.updateObservation(observationId, payload)
    },

    deleteObservation: async (observationId: string): Promise<void> => {
        await patchApiClient.deleteObservation(observationId)
    },
}
