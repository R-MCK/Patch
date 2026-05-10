import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './types.js';
import { migrateLegacyNotesAndPhotosToObservations } from './migrations/2026-10-observations.js';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const db = new sqlite3.Database(path.join(dirname, 'patch.db'));

type SqlParams = readonly unknown[];
type DbRunResult = sqlite3.RunResult;

// Promisify SQLite methods for async/await
export const dbRun = promisify(db.run.bind(db)) as unknown as (
    sql: string,
    params?: SqlParams,
) => Promise<DbRunResult>;
export const dbGet = promisify(db.get.bind(db)) as unknown as <T = Record<string, unknown>>(
    sql: string,
    params?: SqlParams,
) => Promise<T | undefined>;
export const dbAll = promisify(db.all.bind(db)) as unknown as <T = Record<string, unknown>>(
    sql: string,
    params?: SqlParams,
) => Promise<T[]>;

export async function initDatabase() {
    await dbRun('PRAGMA foreign_keys = ON');

    await dbRun(`
    CREATE TABLE IF NOT EXISTS gardens (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      garden_type TEXT,
      width REAL,
      length REAL,
      climate_zone TEXT,
      soil_type TEXT
    )
  `);

    await dbRun(`
    CREATE TABLE IF NOT EXISTS plants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      species TEXT,
      variety TEXT,
      planting_date DATETIME,
      location TEXT,
      health_status TEXT,
      growth_stage TEXT,
      garden_id TEXT,
      FOREIGN KEY (garden_id) REFERENCES gardens(id)
    )
  `);

    await dbRun(`
    CREATE TABLE IF NOT EXISTS care_tasks (
      id TEXT PRIMARY KEY,
      plant_id TEXT NOT NULL,
      task_type TEXT NOT NULL,
      scheduled_date DATETIME NOT NULL,
      completed_date DATETIME,
      is_recurring BOOLEAN,
      frequency TEXT,
      FOREIGN KEY (plant_id) REFERENCES plants(id)
    )
  `);

    await dbRun(`
    CREATE TABLE IF NOT EXISTS wiki_entries (
      id TEXT PRIMARY KEY,
      common_name TEXT NOT NULL,
      scientific_name TEXT,
      category TEXT,
      entry_description TEXT NOT NULL,
      sunlight TEXT,
      watering TEXT,
      soil TEXT,
      temperature TEXT,
      spacing TEXT,
      planting_depth TEXT,
      germination_time TEXT,
      companion_plants TEXT,
      antagonist_plants TEXT
    )
  `);

    await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

    await dbRun(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token_hash TEXT NOT NULL UNIQUE,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      revoked_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    await dbRun(`
    CREATE TABLE IF NOT EXISTS user_profiles (
      user_id TEXT PRIMARY KEY,
      country TEXT,
      region TEXT,
      postcode TEXT,
      units TEXT,
      experience_level TEXT,
      goals TEXT,
      climate_notes TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

    await dbRun(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plant_id TEXT,
      title TEXT,
      content TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL
    )
  `);

    await dbRun(`
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plant_id TEXT,
      image_data TEXT,
      thumbnail_data TEXT,
      caption TEXT,
      captured_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL
    )
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash
    ON refresh_tokens(token_hash)
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id
    ON refresh_tokens(user_id)
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_notes_user_id
    ON notes(user_id)
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_notes_plant_id
    ON notes(plant_id)
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_photos_user_id
    ON photos(user_id)
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_photos_plant_id
    ON photos(plant_id)
  `);

    await dbRun(`
    CREATE TABLE IF NOT EXISTS garden_zones (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      garden_id TEXT NOT NULL,
      name TEXT NOT NULL,
      zone_type TEXT,
      width_feet REAL,
      length_feet REAL,
      sort_order INTEGER,
      photo_id TEXT,
      notes TEXT,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE CASCADE
    )
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_garden_zones_garden_id
    ON garden_zones(garden_id)
  `);

    await dbRun(`
    CREATE TABLE IF NOT EXISTS planting_records (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      plant_name_snapshot TEXT NOT NULL,
      species_snapshot TEXT,
      variety_snapshot TEXT,
      garden_id TEXT,
      zone_id TEXT,
      planted_at DATETIME NOT NULL,
      removed_at DATETIME,
      harvested_at DATETIME,
      source_plant_id TEXT,
      outcome TEXT,
      season TEXT,
      year INTEGER,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE SET NULL,
      FOREIGN KEY (zone_id) REFERENCES garden_zones(id) ON DELETE SET NULL,
      FOREIGN KEY (source_plant_id) REFERENCES plants(id) ON DELETE SET NULL
    )
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_planting_records_garden_id
    ON planting_records(garden_id)
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_planting_records_zone_id
    ON planting_records(zone_id)
  `);

    await dbRun(`
    CREATE TABLE IF NOT EXISTS observations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      observation_type TEXT NOT NULL,
      text_content TEXT,
      image_data TEXT,
      thumbnail_data TEXT,
      audio_data TEXT,
      transcript TEXT,
      plant_id TEXT,
      garden_id TEXT,
      zone_id TEXT,
      planting_record_id TEXT,
      tags TEXT,
      observed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plant_id) REFERENCES plants(id) ON DELETE SET NULL,
      FOREIGN KEY (garden_id) REFERENCES gardens(id) ON DELETE SET NULL,
      FOREIGN KEY (zone_id) REFERENCES garden_zones(id) ON DELETE SET NULL,
      FOREIGN KEY (planting_record_id) REFERENCES planting_records(id) ON DELETE SET NULL
    )
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_observations_user_id
    ON observations(user_id)
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_observations_plant_id
    ON observations(plant_id)
  `);

    await dbRun(`
    CREATE INDEX IF NOT EXISTS idx_observations_zone_id
    ON observations(zone_id)
  `);

    await migrateLegacyNotesAndPhotosToObservations(dbRun, dbGet);

    // Insert seed data if empty
    const gardenCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM gardens');
    if (gardenCount?.count === 0) {
        logger.info('Seeding initial database with gardens...');
        await dbRun(`
      INSERT INTO gardens (id, name, garden_type, width, length, climate_zone, soil_type)
      VALUES 
      ('g1', 'Backyard Raised Bed', 'Raised Bed', 4.0, 8.0, 'Zone 8b', 'Loam'),
      ('g2', 'Front Porch Pots', 'Container', NULL, NULL, 'Zone 8b', 'Potting Mix')
    `);
    }

    const plantCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM plants');
    if (plantCount?.count === 0) {
        logger.info('Seeding initial database with plants...');
        await dbRun(`
      INSERT INTO plants (id, name, species, health_status, growth_stage, garden_id)
      VALUES 
      ('1', 'Tomato', 'Solanum lycopersicum', 'good', 'vegetative', 'g1'),
      ('2', 'Basil', 'Ocimum basilicum', 'excellent', 'vegetative', 'g2'),
      ('3', 'Rosemary', 'Salvia rosmarinus', 'good', 'vegetative', 'g2')
    `);

        // Add some random tasks
        await dbRun(`
      INSERT INTO care_tasks (id, plant_id, task_type, scheduled_date, is_recurring, frequency)
      VALUES 
      ('t1', '1', 'Watering', datetime('now', '+1 day'), true, 'Daily'),
      ('t2', '2', 'Watering', datetime('now', '+2 days'), true, 'Biweekly')
    `);
    }

    const wikiCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM wiki_entries');
    if (wikiCount?.count === 0) {
        logger.info('Seeding initial database with wiki entries...');
        await dbRun(`
      INSERT INTO wiki_entries (id, common_name, scientific_name, category, entry_description, sunlight, watering, soil, temperature)
      VALUES 
      ('w1', 'Tomato', 'Solanum lycopersicum', 'Vegetables', 'A popular, versatile fruit usually treated as a vegetable in cooking.', 'Full Sun', 'Keep evenly moist', 'Well-draining, slightly acidic', '65-85°F'),
      ('w2', 'Basil', 'Ocimum basilicum', 'Herbs', 'A fragrant herb commonly used in Italian and Southeast Asian cuisines.', 'Full Sun to Partial Shade', 'Keep soil moist but not soggy', 'Rich, well-draining', '70-80°F')
    `);
    }
}
