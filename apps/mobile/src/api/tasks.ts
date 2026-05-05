import type { CareFrequency, CareTask, CareTaskType } from '@patch/core'
import { patchApiBaseUrl } from './client'

interface DbCareTask {
  id: string
  plant_id: string
  task_type: string
  scheduled_date: string
  completed_date: string | null
  is_recurring: boolean | number | null
  frequency: string | null
}

const careTaskTypes = new Set<CareTaskType>([
  'Watering',
  'Fertilizing',
  'Pruning',
  'Pest Control',
  'Harvesting',
])

const careFrequencies = new Set<CareFrequency>(['Daily', 'Weekly', 'Biweekly', 'Monthly'])

function toCareTaskType(value: string): CareTaskType {
  return careTaskTypes.has(value as CareTaskType) ? (value as CareTaskType) : 'Watering'
}

function toCareFrequency(value: string | null): CareFrequency | undefined {
  return value && careFrequencies.has(value as CareFrequency) ? (value as CareFrequency) : undefined
}

function mapDbCareTaskToCareTask(task: DbCareTask): CareTask {
  return {
    id: task.id,
    plantId: task.plant_id,
    taskType: toCareTaskType(task.task_type),
    scheduledDate: new Date(task.scheduled_date),
    completedDate: task.completed_date ? new Date(task.completed_date) : undefined,
    isRecurring: Boolean(task.is_recurring),
    frequency: toCareFrequency(task.frequency),
  }
}

export async function getPlantTasks(plantId: string): Promise<CareTask[]> {
  const response = await fetch(`${patchApiBaseUrl}/api/plants/${encodeURIComponent(plantId)}/tasks`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch plant tasks: ${response.status}`)
  }

  const tasks = (await response.json()) as DbCareTask[]
  return tasks.map(mapDbCareTaskToCareTask)
}

