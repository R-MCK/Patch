import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { logger } from './types.js';

export const db = new sqlite3.Database(path.join(__dirname, 'patch.db'));

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
