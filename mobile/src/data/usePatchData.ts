import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CareTask, Plant, Garden, WikiEntry } from '@patch/core'
import { isDueToday, isOverdue, mapDbPlantToPlant, mapDbCareTaskToCareTask, mapDbGardenToGarden, mapDbWikiEntryToWikiEntry } from '@patch/core'
import type { DbPlant, DbCareTask, DbGarden, DbWikiEntry } from '@patch/core'
import { db, initDatabase } from './db'
import { syncWithBackend } from './sync'
import { randomUUID } from 'crypto'

interface PatchDataState {
  plants: Plant[]
  tasks: CareTask[]
  gardens: Garden[]
  wikiEntries: WikiEntry[]
  isLoading: boolean
  isRefreshing: boolean
  error: string | null
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Something went wrong'
}

let isDbInitialized = false

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

  const loadLocalData = useCallback(() => {
    if (!isDbInitialized) {
      initDatabase()
      isDbInitialized = true
    }

    try {
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
      await syncWithBackend()
      // Reload local data after sync
      loadLocalData()
    } catch (error) {
      console.warn('Sync failed', error)
      // We do not set the error state to block the UI, because we're offline-first!
    } finally {
      setState((current) => ({ ...current, isRefreshing: false, isLoading: false }))
    }
  }, [loadLocalData])

  const waterPlant = useCallback(
    async (plantId: string) => {
      const taskId = crypto.randomUUID()
      db.runSync(`
        INSERT INTO care_tasks (id, plant_id, task_type, scheduled_date, completed_date, sync_status)
        VALUES (?, ?, 'Watering', datetime('now'), datetime('now'), 'pending_create')
      `, [taskId, plantId])
      
      loadLocalData()
      syncWithBackend().then(loadLocalData).catch(console.error)
    },
    [loadLocalData],
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
      const id = crypto.randomUUID()
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
      
      loadLocalData()
      syncWithBackend().then(loadLocalData).catch(console.error)
    },
    [loadLocalData],
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
      const id = crypto.randomUUID()
      db.runSync(`
        INSERT INTO gardens (id, name, garden_type, width, length, climate_zone, soil_type, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending_create')
      `, [
        id, 
        data.name, 
        data.garden_type || null, 
        data.width || null, 
        data.length || null, 
        data.climate_zone || null, 
        data.soil_type || null
      ])
      
      loadLocalData()
      syncWithBackend().then(loadLocalData).catch(console.error)
    },
    [loadLocalData],
  )

  const createCareTask = useCallback(
    async (plantId: string, data: {
      task_type: string
      scheduled_date: string
      is_recurring?: boolean
      frequency?: string
      notes?: string
    }) => {
      const id = crypto.randomUUID()
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
      
      loadLocalData()
      syncWithBackend().then(loadLocalData).catch(console.error)
    },
    [loadLocalData],
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
    ...summary,
    refresh: () => load('refresh'),
    waterPlant,
    createPlant,
    createGarden,
    createCareTask,
  }
}
