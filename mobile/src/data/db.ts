import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabaseSync('patch.db')

export function initDatabase() {
  db.execSync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS gardens (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      garden_type TEXT,
      width REAL,
      length REAL,
      climate_zone TEXT,
      soil_type TEXT,
      sync_status TEXT DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS plants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      species TEXT,
      variety TEXT,
      planting_date TEXT,
      location TEXT,
      health_status TEXT,
      growth_stage TEXT,
      garden_id TEXT,
      sync_status TEXT DEFAULT 'synced',
      FOREIGN KEY(garden_id) REFERENCES gardens(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS care_tasks (
      id TEXT PRIMARY KEY,
      plant_id TEXT NOT NULL,
      task_type TEXT NOT NULL,
      scheduled_date TEXT NOT NULL,
      completed_date TEXT,
      is_recurring INTEGER DEFAULT 0,
      frequency TEXT,
      notes TEXT,
      sync_status TEXT DEFAULT 'synced',
      FOREIGN KEY(plant_id) REFERENCES plants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS wiki_entries (
      id TEXT PRIMARY KEY,
      common_name TEXT NOT NULL,
      scientific_name TEXT,
      category TEXT,
      entry_description TEXT,
      sunlight TEXT,
      watering TEXT,
      soil TEXT,
      temperature TEXT,
      spacing REAL,
      planting_depth REAL,
      germination_time TEXT,
      companion_plants TEXT,
      antagonist_plants TEXT,
      sync_status TEXT DEFAULT 'synced'
    );
  `)
}
