import { PatchApiClient } from '@patch/api'
import type { PatchApiClientOptions } from '@patch/api'
import type { DbPlant, PaginatedResponse } from '@/types'

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
