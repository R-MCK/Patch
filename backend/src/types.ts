export interface Plant {
  id: string
  name: string
  species?: string
  variety?: string
  planting_date?: string
  location?: string
  health_status?: string
  growth_stage?: string
  garden_id?: string
}

export interface CareTask {
  id: string
  plant_id: string
  task_type: string
  scheduled_date: string
  completed_date?: string
  is_recurring?: boolean
  frequency?: string
}
