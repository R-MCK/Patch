import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

export const db = new sqlite3.Database(path.join(__dirname, 'patch.db'));

// Promisify SQLite methods for async/await
export const dbRun = promisify(db.run.bind(db)) as (sql: string, params?: any[]) => Promise<any>;
export const dbGet = promisify(db.get.bind(db)) as <T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T | undefined>;
export const dbAll = promisify(db.all.bind(db)) as <T = Record<string, unknown>>(sql: string, params?: unknown[]) => Promise<T[]>;

export async function initDatabase() {
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
      garden_id TEXT
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

    // Insert seed data if empty
    const plantCount = await dbGet<{ count: number }>('SELECT COUNT(*) as count FROM plants');
    if (plantCount?.count === 0) {
        console.log("Seeding initial database...");
        await dbRun(`
      INSERT INTO plants (id, name, species, health_status, growth_stage)
      VALUES 
      ('1', 'Tomato', 'Solanum lycopersicum', 'good', 'vegetative'),
      ('2', 'Basil', 'Ocimum basilicum', 'excellent', 'vegetative'),
      ('3', 'Rosemary', 'Salvia rosmarinus', 'good', 'vegetative')
    `);

        // Add some random tasks
        await dbRun(`
      INSERT INTO care_tasks (id, plant_id, task_type, scheduled_date, is_recurring, frequency)
      VALUES 
      ('t1', '1', 'Watering', datetime('now', '+1 day'), true, 'Daily'),
      ('t2', '2', 'Watering', datetime('now', '+2 days'), true, 'Biweekly')
    `);
    }
}
