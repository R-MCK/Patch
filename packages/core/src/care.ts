export type CareTaskType =
  | 'Watering'
  | 'Fertilizing'
  | 'Pruning'
  | 'Pest Control'
  | 'Harvesting'
  | 'Transplanting'
  | 'Weeding'
  | 'Mulching'
  | 'Monitoring'

export type CareFrequency = 'Daily' | 'Weekly' | 'Biweekly' | 'Monthly'

export interface CareTask {
  id: string
  plantId: string
  taskType: CareTaskType
  scheduledDate: Date
  completedDate?: Date
  isRecurring: boolean
  frequency?: CareFrequency
}

export interface DbCareTask {
  id: string
  plant_id: string
  task_type: string
  scheduled_date: string
  completed_date?: string | null
  is_recurring?: boolean | number | null
  frequency?: string | null
}

export const careTaskTypes = new Set<CareTaskType>([
  'Watering',
  'Fertilizing',
  'Pruning',
  'Pest Control',
  'Harvesting',
  'Transplanting',
  'Weeding',
  'Mulching',
  'Monitoring',
])

export const careFrequencies = new Set<CareFrequency>([
  'Daily',
  'Weekly',
  'Biweekly',
  'Monthly',
])

export function toCareTaskType(value: string | null | undefined): CareTaskType {
  return value && careTaskTypes.has(value as CareTaskType)
    ? (value as CareTaskType)
    : 'Watering'
}

export function toCareFrequency(value: string | null | undefined): CareFrequency | undefined {
  return value && careFrequencies.has(value as CareFrequency)
    ? (value as CareFrequency)
    : undefined
}

export function mapDbCareTaskToCareTask(dbCareTask: DbCareTask): CareTask {
  return {
    id: dbCareTask.id,
    plantId: dbCareTask.plant_id,
    taskType: toCareTaskType(dbCareTask.task_type),
    scheduledDate: new Date(dbCareTask.scheduled_date),
    completedDate: dbCareTask.completed_date ? new Date(dbCareTask.completed_date) : undefined,
    isRecurring: Boolean(dbCareTask.is_recurring),
    frequency: toCareFrequency(dbCareTask.frequency),
  }
}

export function isOverdue(task: CareTask, now = new Date()): boolean {
  return !task.completedDate && task.scheduledDate < now
}

export function isDueToday(task: CareTask, now = new Date()): boolean {
  const start = new Date(now)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(end.getDate() + 1)

  return !task.completedDate && task.scheduledDate >= start && task.scheduledDate < end
}
