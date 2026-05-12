import {
  mapDbGardenZoneToGardenZone,
  mapDbNoteToNote,
  mapDbObservationToObservation,
  mapDbPhotoToPhoto,
  mapDbPlantingRecordToPlantingRecord,
  mapDbUserProfileToUserProfile,
  mapDbCareTaskToCareTask,
  mapDbPlantToPlant,
  mapDbGardenToGarden,
  mapDbWikiEntryToWikiEntry,
  type CareTask,
  type DbCareTask,
  type DbPlant,
  type DbGarden,
  type DbGardenZone,
  type DbNote,
  type DbObservation,
  type DbPhoto,
  type DbPlantingRecord,
  type DbUserProfile,
  type DbWikiEntry,
  type GardenZone,
  type Note,
  type Observation,
  type PaginatedResponse,
  type PlantingRecord,
  type Photo,
  type Plant,
  type UserProfile,
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

export interface UpsertUserProfileInput {
  country?: string | null
  region?: string | null
  postcode?: string | null
  units?: 'imperial' | 'metric' | null
  experience_level?: string | null
  goals?: string | null
  climate_notes?: string | null
}

export interface CreateGardenZoneInput {
  name: string
  zone_type?: string | null
  width_feet?: number | null
  length_feet?: number | null
  sort_order?: number | null
  photo_id?: string | null
  notes?: string | null
}

export interface CreatePlantingRecordInput {
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
}

export interface CreateObservationInput {
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

  async getTasks(id: string): Promise<CareTask[]> {
    return this.getPlantTasks(id)
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

  async completeTask(taskId: string, completedDate?: string): Promise<CareTask> {
    const response = await this.request<DbCareTask>(`/api/tasks/${encodeURIComponent(taskId)}/complete`, {
      method: 'POST',
      body: JSON.stringify({
        completed_date: completedDate ?? null,
      }),
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

  async getProfile(): Promise<UserProfile | null> {
    const response = await this.request<{ profile: DbUserProfile | null } | DbUserProfile | null>('/api/profile')
    const profile = response && 'profile' in response ? response.profile : response
    return profile ? mapDbUserProfileToUserProfile(profile) : null
  }

  async updateProfile(data: UpsertUserProfileInput): Promise<UserProfile> {
    const profile = await this.request<DbUserProfile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return mapDbUserProfileToUserProfile(profile)
  }

  async getPlantNotes(plantId: string): Promise<Note[]> {
    const notes = await this.request<DbNote[]>(`/api/plants/${encodeURIComponent(plantId)}/notes`)
    return notes.map((note) => mapDbNoteToNote(note))
  }

  async createPlantNote(plantId: string, data: {
    title?: string | null
    content: string
  }): Promise<Note> {
    const note = await this.request<DbNote>(`/api/plants/${encodeURIComponent(plantId)}/notes`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return mapDbNoteToNote(note)
  }

  async getPlantPhotos(plantId: string): Promise<Photo[]> {
    const photos = await this.request<DbPhoto[]>(`/api/plants/${encodeURIComponent(plantId)}/photos`)
    return photos.map((photo) => mapDbPhotoToPhoto(photo))
  }

  async createPlantPhoto(plantId: string, data: {
    image_data: string
    thumbnail_data?: string | null
    caption?: string | null
    captured_at?: string | null
  }): Promise<Photo> {
    const photo = await this.request<DbPhoto>(`/api/plants/${encodeURIComponent(plantId)}/photos`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return mapDbPhotoToPhoto(photo)
  }

  async getGardenZones(gardenId: string): Promise<GardenZone[]> {
    const rows = await this.request<DbGardenZone[]>(`/api/gardens/${encodeURIComponent(gardenId)}/zones`)
    return rows.map((row) => mapDbGardenZoneToGardenZone(row))
  }

  async createGardenZone(gardenId: string, data: CreateGardenZoneInput): Promise<GardenZone> {
    const row = await this.request<DbGardenZone>(`/api/gardens/${encodeURIComponent(gardenId)}/zones`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return mapDbGardenZoneToGardenZone(row)
  }

  async updateGardenZone(zoneId: string, data: Partial<CreateGardenZoneInput>): Promise<GardenZone> {
    const row = await this.request<DbGardenZone>(`/api/zones/${encodeURIComponent(zoneId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return mapDbGardenZoneToGardenZone(row)
  }

  async deleteGardenZone(zoneId: string): Promise<void> {
    await this.request<void>(`/api/zones/${encodeURIComponent(zoneId)}`, {
      method: 'DELETE',
    })
  }

  async getZoneHistory(zoneId: string): Promise<PlantingRecord[]> {
    const rows = await this.request<DbPlantingRecord[]>(`/api/zones/${encodeURIComponent(zoneId)}/history`)
    return rows.map((row) => mapDbPlantingRecordToPlantingRecord(row))
  }

  async getZoneObservations(zoneId: string): Promise<Observation[]> {
    const rows = await this.request<DbObservation[]>(`/api/zones/${encodeURIComponent(zoneId)}/observations`)
    return rows.map((row) => mapDbObservationToObservation(row))
  }

  async getPlantObservations(plantId: string): Promise<Observation[]> {
    const rows = await this.request<DbObservation[]>(`/api/plants/${encodeURIComponent(plantId)}/observations`)
    return rows.map((row) => mapDbObservationToObservation(row))
  }

  async createPlantObservation(plantId: string, data: CreateObservationInput): Promise<Observation> {
    const row = await this.request<DbObservation>(`/api/plants/${encodeURIComponent(plantId)}/observations`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return mapDbObservationToObservation(row)
  }

  async getObservations(filters: { plant_id?: string; garden_id?: string; zone_id?: string } = {}): Promise<Observation[]> {
    const params = new URLSearchParams()
    if (filters.plant_id) params.set('plant_id', filters.plant_id)
    if (filters.garden_id) params.set('garden_id', filters.garden_id)
    if (filters.zone_id) params.set('zone_id', filters.zone_id)
    const query = params.toString()
    const rows = await this.request<DbObservation[]>(`/api/observations${query ? `?${query}` : ''}`)
    return rows.map((row) => mapDbObservationToObservation(row))
  }

  async createObservation(data: CreateObservationInput): Promise<Observation> {
    const row = await this.request<DbObservation>('/api/observations', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return mapDbObservationToObservation(row)
  }

  async getPlantingRecords(filters: { garden_id?: string; zone_id?: string } = {}): Promise<PlantingRecord[]> {
    const params = new URLSearchParams()
    if (filters.garden_id) params.set('garden_id', filters.garden_id)
    if (filters.zone_id) params.set('zone_id', filters.zone_id)
    const query = params.toString()
    const rows = await this.request<DbPlantingRecord[]>(`/api/planting-records${query ? `?${query}` : ''}`)
    return rows.map((row) => mapDbPlantingRecordToPlantingRecord(row))
  }

  async createPlantingRecord(data: CreatePlantingRecordInput): Promise<PlantingRecord> {
    const row = await this.request<DbPlantingRecord>('/api/planting-records', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return mapDbPlantingRecordToPlantingRecord(row)
  }

  async updatePlantingRecord(recordId: string, data: Partial<CreatePlantingRecordInput>): Promise<PlantingRecord> {
    const row = await this.request<DbPlantingRecord>(`/api/planting-records/${encodeURIComponent(recordId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return mapDbPlantingRecordToPlantingRecord(row)
  }

  async updateObservation(observationId: string, data: Partial<CreateObservationInput>): Promise<Observation> {
    const row = await this.request<DbObservation>(`/api/observations/${encodeURIComponent(observationId)}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return mapDbObservationToObservation(row)
  }

  async deleteObservation(observationId: string): Promise<void> {
    await this.request<void>(`/api/observations/${encodeURIComponent(observationId)}`, {
      method: 'DELETE',
    })
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
