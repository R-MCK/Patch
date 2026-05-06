import type { CareTask } from '@patch/core'
import { patchApiClient } from './client'

export async function getPlantTasks(plantId: string): Promise<CareTask[]> {
  return patchApiClient.getPlantTasks(plantId)
}
