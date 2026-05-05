export interface Plant {
  id: string;
  name: string;
  species: string | null;
  variety: string | null;
  planting_date: string | null;
  location: string | null;
  health_status: string | null;
  growth_stage: string | null;
  garden_id: string | null;
}

export interface Garden {
  id: string;
  name: string;
  garden_type: string | null;
  width: number | null;
  length: number | null;
  climate_zone: string | null;
  soil_type: string | null;
}

export interface WikiEntry {
  id: string;
  common_name: string;
  scientific_name: string | null;
  category: string | null;
  entry_description: string;
  sunlight: string | null;
  watering: string | null;
  soil: string | null;
  temperature: string | null;
  spacing: string | null;
  planting_depth: string | null;
  germination_time: string | null;
  companion_plants: string | null;
  antagonist_plants: string | null;
}

export interface CareTask {
  id: string;
  plant_id: string;
  task_type: string;
  scheduled_date: string;
  completed_date: string | null;
  is_recurring: boolean | null;
  frequency: string | null;
}

type LogLevel = 'info' | 'error';

function log(level: LogLevel, message: string, error?: unknown): void {
  const ts = new Date().toISOString();
  const detail = error instanceof Error ? `: ${error.message}` : '';
  console[level === 'error' ? 'error' : 'log'](`[${ts}] [${level.toUpperCase()}] ${message}${detail}`);
}

export const logger = {
  info(message: string): void {
    log('info', message);
  },
  error(message: string, error?: unknown): void {
    log('error', message, error);
  },
};
