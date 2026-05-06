import {
  mapDbCareTaskToCareTask,
  mapDbPlantToPlant,
  mapDbGardenToGarden,
  mapDbWikiEntryToWikiEntry,
  type CareTask,
  type DbCareTask,
  type DbPlant,
  type DbGarden,
  type DbWikiEntry,
  type PaginatedResponse,
  type Plant,
  type Garden,
  type WikiEntry,
} from '@patch/core'

export type AuthTokenChangeCallback = (token: string | null) => void | Promise<void>

export interface PatchApiClientOptions {
  baseUrl: string
  getAuthToken?: () => string | null | undefined
  setAuthToken?: AuthTokenChangeCallback
  onAuthTokenChange?: AuthTokenChangeCallback
}

export interface AuthUser {
  id: string
  email: string
  name: string | null
  created_at: string
}

export interface AuthResponse {
  user: AuthUser
  accessToken: string
  expiresIn: number
}

export interface WaterPlantResponse {
  success: boolean
  message: string
}

export interface PatchApiErrorOptions {
  status: number
  statusText: string
  path: string
  body?: unknown
}

export class PatchApiError extends Error {
  readonly name = 'PatchApiError'
  readonly status: number
  readonly statusText: string
  readonly path: string
  readonly body?: unknown

  constructor(options: PatchApiErrorOptions) {
    const message = getApiErrorMessage(options)
    super(message)
    this.status = options.status
    this.statusText = options.statusText
    this.path = options.path
    this.body = options.body
  }
}

export class PatchApiNetworkError extends Error {
  readonly name = 'PatchApiNetworkError'
  readonly cause: unknown

  constructor(cause: unknown) {
    super('Patch API request failed before a response was received')
    this.cause = cause
  }
}

export class PatchApiParseError extends Error {
  readonly name = 'PatchApiParseError'
  readonly path: string
  readonly cause: unknown

  constructor(path: string, cause: unknown) {
    super(`Patch API returned invalid JSON for ${path}`)
    this.path = path
    this.cause = cause
  }
}

export class PatchApiClient {
  private readonly baseUrl: string
  private readonly getAuthToken?: () => string | null | undefined
  private readonly setAuthToken?: AuthTokenChangeCallback
  private readonly onAuthTokenChange?: AuthTokenChangeCallback

  init(options: PatchApiClientOptions) {
    return new PatchApiClient(options)
  }

  constructor(options: PatchApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '')
    this.getAuthToken = options.getAuthToken
    this.setAuthToken = options.setAuthToken
    this.onAuthTokenChange = options.onAuthTokenChange
  }

  async register(data: { email: string, password: string, name?: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    await this.updateAuthToken(response.accessToken)
    return response
  }

  async login(data: { email: string, password: string }): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    await this.updateAuthToken(response.accessToken)
    return response
  }

  async me(): Promise<AuthUser> {
    return this.request<AuthUser>('/api/auth/me')
  }

  async refresh(): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/api/auth/refresh', {
      method: 'POST',
    }, {
      skipAuthRefresh: true,
    })
    await this.updateAuthToken(response.accessToken)
    return response
  }

  async logout(): Promise<void> {
    await this.request<unknown>('/api/auth/logout', {
      method: 'POST',
    }, {
      skipAuthRefresh: true,
    })
    await this.updateAuthToken(null)
  }

  async getPlants(limit = 20, offset = 0): Promise<PaginatedResponse<Plant>> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    })
    const response = await this.request<PaginatedResponse<DbPlant>>(`/api/plants?${params}`)

    return {
      ...response,
      data: response.data.map((plant) => mapDbPlantToPlant(plant)),
    }
  }

  async getPlant(id: string): Promise<Plant> {
    const plant = await this.request<DbPlant>(`/api/plants/${encodeURIComponent(id)}`)
    return mapDbPlantToPlant(plant)
  }

  async getPlantTasks(id: string): Promise<CareTask[]> {
    const tasks = await this.request<DbCareTask[]>(`/api/plants/${encodeURIComponent(id)}/tasks`)
    return tasks.map((task) => mapDbCareTaskToCareTask(task))
  }

  async getGardens(limit = 20, offset = 0): Promise<PaginatedResponse<Garden>> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    })
    const response = await this.request<PaginatedResponse<DbGarden>>(`/api/gardens?${params}`)

    return {
      ...response,
      data: response.data.map((garden) => mapDbGardenToGarden(garden)),
    }
  }

  async getGarden(id: string): Promise<Garden> {
    const garden = await this.request<DbGarden>(`/api/gardens/${encodeURIComponent(id)}`)
    return mapDbGardenToGarden(garden)
  }

  async createGarden(data: {
    name: string
    garden_type?: string
    width?: number
    length?: number
    climate_zone?: string
    soil_type?: string
  }): Promise<Garden> {
    const response = await this.request<DbGarden>('/api/gardens', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return mapDbGardenToGarden(response)
  }

  async createCareTask(plantId: string, data: {
    task_type: string
    scheduled_date: string
    is_recurring?: boolean
    frequency?: string
    notes?: string
  }): Promise<CareTask> {
    const response = await this.request<DbCareTask>(`/api/plants/${encodeURIComponent(plantId)}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return mapDbCareTaskToCareTask(response)
  }

  async getWikiEntries(limit = 20, offset = 0): Promise<PaginatedResponse<WikiEntry>> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    })
    const response = await this.request<PaginatedResponse<DbWikiEntry>>(`/api/wiki?${params}`)

    return {
      ...response,
      data: response.data.map((entry) => mapDbWikiEntryToWikiEntry(entry)),
    }
  }

  async getWikiEntry(id: string): Promise<WikiEntry> {
    const entry = await this.request<DbWikiEntry>(`/api/wiki/${encodeURIComponent(id)}`)
    return mapDbWikiEntryToWikiEntry(entry)
  }

  async createPlant(data: {
    name: string
    species?: string
    variety?: string
    location?: string
    health_status?: string
    growth_stage?: string
    garden_id?: string
  }): Promise<Plant> {
    const response = await this.request<DbPlant>('/api/plants', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return mapDbPlantToPlant(response)
  }

  async waterPlant(id: string): Promise<WaterPlantResponse> {
    return this.request(`/api/plants/${encodeURIComponent(id)}/water`, {
      method: 'POST',
    })
  }

  async getPlantRows(limit = 20, offset = 0): Promise<PaginatedResponse<DbPlant>> {
    const params = new URLSearchParams({
      limit: String(limit),
      offset: String(offset),
    })
    return this.request<PaginatedResponse<DbPlant>>(`/api/plants?${params}`)
  }

  async getPlantRow(id: string): Promise<DbPlant> {
    return this.request<DbPlant>(`/api/plants/${encodeURIComponent(id)}`)
  }

  async getPlantTaskRows(id: string): Promise<DbCareTask[]> {
    return this.request<DbCareTask[]>(`/api/plants/${encodeURIComponent(id)}/tasks`)
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    options: { skipAuthRefresh?: boolean, hasRetriedAuth?: boolean } = {},
  ): Promise<T> {
    const token = this.getAuthToken?.()
    const headers = new Headers(init.headers)
    headers.set('Accept', 'application/json')

    if (init.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    let response: Response
    try {
      response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        credentials: init.credentials ?? 'include',
        headers,
      })
    } catch (error) {
      throw new PatchApiNetworkError(error)
    }

    const body = await this.readJson(response, path)

    if (!response.ok) {
      if (response.status === 401 && token && !options.skipAuthRefresh && !options.hasRetriedAuth && !isAuthPath(path)) {
        try {
          await this.refresh()
        } catch {
          throw new PatchApiError({
            status: response.status,
            statusText: response.statusText,
            path,
            body,
          })
        }

        return this.request<T>(path, init, {
          ...options,
          hasRetriedAuth: true,
        })
      }

      throw new PatchApiError({
        status: response.status,
        statusText: response.statusText,
        path,
        body,
      })
    }

    return body as T
  }

  private async updateAuthToken(token: string | null): Promise<void> {
    await this.setAuthToken?.(token)
    await this.onAuthTokenChange?.(token)
  }

  private async readJson(response: Response, path: string): Promise<unknown> {
    if (response.status === 204) {
      return undefined
    }

    const text = await response.text()
    if (!text) {
      return undefined
    }

    try {
      return JSON.parse(text) as unknown
    } catch (error) {
      throw new PatchApiParseError(path, error)
    }
  }
}

function getApiErrorMessage(options: PatchApiErrorOptions): string {
  if (isErrorResponseBody(options.body)) {
    return options.body.error
  }

  return `Patch API request failed: ${options.status} ${options.statusText}`.trim()
}

function isErrorResponseBody(body: unknown): body is { error: string } {
  return typeof body === 'object'
    && body !== null
    && 'error' in body
    && typeof body.error === 'string'
}

function isAuthPath(path: string): boolean {
  return path.split('?')[0]?.startsWith('/api/auth/') ?? false
}
