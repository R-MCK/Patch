import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CareTask, Plant, Garden, WikiEntry } from '@patch/core'
import { isDueToday, isOverdue, mapDbPlantToPlant, mapDbCareTaskToCareTask, mapDbGardenToGarden, mapDbWikiEntryToWikiEntry } from '@patch/core'
import type { DbPlant, DbCareTask, DbGarden, DbWikiEntry } from '@patch/core'
import { db, initDatabase } from './db'
import { syncWithBackend } from './sync'

interface PatchDataState {
  plants: Plant[]
  tasks: CareTask[]
  gardens: Garden[]
  wikiEntries: WikiEntry[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
}

interface SharedSyncState {
  isSyncing: boolean
  lastSyncedAt: number | null
  lastSyncError: string | null
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong'
}

const SHARED_SYNC_COOLDOWN_MS = 30_000

function createLocalId() {
  const randomUuid = globalThis.crypto?.randomUUID
  if (typeof randomUuid === 'function') {
    return randomUuid.call(globalThis.crypto)
  }

  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

let isDbInitialized = false
let inFlightSync: Promise<void> | null = null
let lastSuccessfulSharedSyncAt = 0
const dataChangeListeners = new Set<() => void>()
const syncStateListeners = new Set<(state: SharedSyncState) => void>()
const sharedSyncState: SharedSyncState = {
  isSyncing: false,
  lastSyncedAt: null,
  lastSyncError: null,
}

function subscribeToDataChanges(listener: () => void) {
  dataChangeListeners.add(listener)
  return () => {
    dataChangeListeners.delete(listener)
  }
}

function notifyDataChanged() {
  dataChangeListeners.forEach((listener) => {
    listener()
  })
}

function subscribeToSyncState(listener: (state: SharedSyncState) => void) {
  syncStateListeners.add(listener)
  return () => {
    syncStateListeners.delete(listener)
  }
}

function notifySyncStateChanged() {
  syncStateListeners.forEach((listener) => {
    listener(sharedSyncState)
  })
}

function updateSyncState(next: Partial<SharedSyncState>) {
  Object.assign(sharedSyncState, next)
  notifySyncStateChanged()
}

async function runSharedSync(force = false) {
  const now = Date.now()
  const recentlySynced = now - lastSuccessfulSharedSyncAt < SHARED_SYNC_COOLDOWN_MS

  if (!force && recentlySynced) {
    return
  }

  if (!inFlightSync) {
    updateSyncState({
      isSyncing: true,
      lastSyncError: null,
    })

    inFlightSync = (async () => {
      try {
        await syncWithBackend()
        lastSuccessfulSharedSyncAt = Date.now()
        updateSyncState({
          lastSyncedAt: lastSuccessfulSharedSyncAt,
          lastSyncError: null,
        })
      } catch (error) {
        updateSyncState({
          lastSyncError: getErrorMessage(error),
        })
        throw error
      } finally {
        updateSyncState({
          isSyncing: false,
        })
      }
    })().finally(() => {
      inFlightSync = null
    })
  }

  await inFlightSync
}

export function usePatchData() {
  const [state, setState] = useState<PatchDataState>({
    plants: [],
    tasks: [],
    gardens: [],
    wikiEntries: [],
    isLoading: true,
    isRefreshing: false,
    error: null,
  })
  const [syncState, setSyncState] = useState<SharedSyncState>(sharedSyncState)

  const loadLocalData = useCallback(() => {
    try {
      if (!isDbInitialized) {
        initDatabase()
        isDbInitialized = true
      }

      const dbPlants = db.getAllSync<DbPlant>('SELECT * FROM plants')
      const dbTasks = db.getAllSync<DbCareTask>('SELECT * FROM care_tasks')
      const dbGardens = db.getAllSync<DbGarden>('SELECT * FROM gardens')
      const dbWikis = db.getAllSync<DbWikiEntry>('SELECT * FROM wiki_entries')

      setState(current => ({
        ...current,
        plants: dbPlants.map(p => mapDbPlantToPlant(p)),
        tasks: dbTasks.map(t => mapDbCareTaskToCareTask(t)),
        gardens: dbGardens.map(g => mapDbGardenToGarden(g)),
        wikiEntries: dbWikis.map(w => mapDbWikiEntryToWikiEntry(w)),
        isLoading: false,
        error: null,
      }))
    } catch (err) {
      setState(current => ({
        ...current,
        isLoading: false,
        error: getErrorMessage(err),
      }))
    }
  }, [])

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    setState((current) => ({
      ...current,
      error: null,
      isLoading: mode === 'initial' && current.plants.length === 0,
      isRefreshing: mode === 'refresh',
    }))

    // Load instantly from SQLite
    loadLocalData()

    // Trigger background sync
    try {
      await runSharedSync(mode === 'refresh')
      // Reload local data after sync
      loadLocalData()
    } catch (error) {
      console.warn('Sync failed', error)
      // We do not set the error state to block the UI, because we're offline-first!
    } finally {
      setState((current) => ({ ...current, isRefreshing: false, isLoading: false }))
    }
  }, [loadLocalData])

  useEffect(() => {
    return subscribeToDataChanges(() => {
      loadLocalData()
    })
  }, [loadLocalData])

  useEffect(() => {
    return subscribeToSyncState((nextState) => {
      setSyncState({ ...nextState })
    })
  }, [])

  const waterPlant = useCallback(
    async (plantId: string) => {
      const taskId = createLocalId()
      db.runSync(`
        INSERT INTO care_tasks (id, plant_id, task_type, scheduled_date, completed_date, sync_status)
        VALUES (?, ?, 'Watering', datetime('now'), datetime('now'), 'pending_create')
      `, [taskId, plantId])

      notifyDataChanged()
      runSharedSync(true).then(notifyDataChanged).catch(console.error)
    },
    [],
  )

  const createPlant = useCallback(
    async (data: {
      name: string
      species?: string
      variety?: string
      location?: string
      health_status?: string
      growth_stage?: string
      garden_id?: string
    }) => {
      const id = createLocalId()
      db.runSync(`
        INSERT INTO plants (id, name, species, variety, location, health_status, growth_stage, garden_id, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending_create')
      `, [
        id, 
        data.name, 
        data.species || null, 
        data.variety || null, 
        data.location || null, 
        data.health_status || null, 
        data.growth_stage || null, 
        data.garden_id || null
      ])

      notifyDataChanged()
      runSharedSync(true).then(notifyDataChanged).catch(console.error)
    },
    [],
  )

  const createGarden = useCallback(
    async (data: {
      name: string
      garden_type?: string
      width?: number
      length?: number
      climate_zone?: string
      soil_type?: string
    }) => {
      const id = createLocalId()
      db.runSync(`
        INSERT INTO gardens (id, name, garden_type, width, length, climate_zone, soil_type, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_create')
      `, [
        id, 
        data.name, 
        data.garden_type || null, 
        data.width ?? null, 
        data.length ?? null, 
        data.climate_zone || null, 
        data.soil_type || null
      ])

      notifyDataChanged()
      runSharedSync(true).then(notifyDataChanged).catch(console.error)
    },
    [],
  )

  const createCareTask = useCallback(
    async (plantId: string, data: {
      task_type: string
      scheduled_date: string
      is_recurring?: boolean
      frequency?: string
      notes?: string
    }) => {
      const id = createLocalId()
      db.runSync(`
        INSERT INTO care_tasks (id, plant_id, task_type, scheduled_date, is_recurring, frequency, notes, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_create')
      `, [
        id,
        plantId,
        data.task_type,
        data.scheduled_date,
        data.is_recurring ? 1 : 0,
        data.frequency || null,
        data.notes || null
      ])

      notifyDataChanged()
      runSharedSync(true).then(notifyDataChanged).catch(console.error)
    },
    [],
  )

  const completeCareTask = useCallback(
    async (taskId: string) => {
      db.runSync(`
        UPDATE care_tasks
        SET
          completed_date = datetime('now'),
          sync_status = CASE
            WHEN sync_status = 'pending_create' THEN 'pending_create'
            ELSE 'pending_update'
          END
        WHERE id = ?
      `, [taskId])

      notifyDataChanged()
      runSharedSync(true).then(notifyDataChanged).catch(console.error)
    },
    [],
  )

  useEffect(() => {
    void load()
  }, [load])

  const summary = useMemo(() => {
    const dueToday = state.tasks.filter((task) => isDueToday(task))
    const overdue = state.tasks.filter((task) => isOverdue(task))
    const upcoming = state.tasks.filter((task) => !task.completedDate && !isDueToday(task) && !isOverdue(task))

    return {
      dueToday,
      overdue,
      upcoming,
      completed: state.tasks.filter((task) => task.completedDate),
    }
  }, [state.tasks])

  return {
    ...state,
    ...syncState,
    ...summary,
    refresh: () => load('refresh'),
    waterPlant,
    createPlant,
    createGarden,
    createCareTask,
    completeCareTask,
  }
}
