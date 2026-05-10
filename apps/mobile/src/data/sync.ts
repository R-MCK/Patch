import { db } from './db'
import { patchApiClient } from '../api/client'
import type { DbPlant, DbGarden, DbCareTask, DbWikiEntry } from '@patch/core'

export async function syncPull() {
  try {
    // 1. Pull Gardens
    const gardens = await patchApiClient.getGardens(1000, 0)
    gardens.data.forEach((g) => {
      db.runSync(`
        INSERT INTO gardens (id, name, garden_type, width, length, climate_zone, soil_type, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, 'synced')
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          garden_type = excluded.garden_type,
          width = excluded.width,
          length = excluded.length,
          climate_zone = excluded.climate_zone,
          soil_type = excluded.soil_type,
          sync_status = 'synced'
        WHERE gardens.sync_status = 'synced'
      `, [
        g.id,
        g.name,
        g.gardenType || null,
        g.width ?? null,
        g.length ?? null,
        g.climateZone || null,
        g.soilType || null,
      ])
    })

    // 2. Pull Plants
    const plants = await patchApiClient.getPlantRows(1000, 0)
    plants.data.forEach((p) => {
      db.runSync(`
        INSERT INTO plants (id, name, species, variety, planting_date, location, health_status, growth_stage, garden_id, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')
        ON CONFLICT(id) DO UPDATE SET
          name = excluded.name,
          species = excluded.species,
          variety = excluded.variety,
          planting_date = excluded.planting_date,
          location = excluded.location,
          health_status = excluded.health_status,
          growth_stage = excluded.growth_stage,
          garden_id = excluded.garden_id,
          sync_status = 'synced'
        WHERE plants.sync_status = 'synced'
      `, [
        p.id,
        p.name,
        p.species || null,
        p.variety || null,
        p.planting_date || null,
        p.location || null,
        p.health_status || null,
        p.growth_stage || null,
        p.garden_id || null,
      ])
    })

    // 3. Pull Tasks
    for (const plant of plants.data) {
      const tasks = await patchApiClient.getPlantTaskRows(plant.id)
      tasks.forEach((t) => {
        db.runSync(`
          INSERT INTO care_tasks (id, plant_id, task_type, scheduled_date, completed_date, is_recurring, frequency, notes, sync_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'synced')
          ON CONFLICT(id) DO UPDATE SET
            plant_id = excluded.plant_id,
            task_type = excluded.task_type,
            scheduled_date = excluded.scheduled_date,
            completed_date = excluded.completed_date,
            is_recurring = excluded.is_recurring,
            frequency = excluded.frequency,
            notes = excluded.notes,
            sync_status = 'synced'
          WHERE care_tasks.sync_status = 'synced'
        `, [
          t.id,
          t.plant_id,
          t.task_type,
          t.scheduled_date,
          t.completed_date || null,
          t.is_recurring ? 1 : 0,
          t.frequency || null,
          (t as any).notes || null,
        ])
      })
    }

    // 4. Pull Wiki Entries
    const wikis = await patchApiClient.getWikiEntries(1000, 0)
    wikis.data.forEach((w) => {
      db.runSync(`
        INSERT INTO wiki_entries (id, common_name, scientific_name, category, entry_description, sunlight, watering, soil, temperature, spacing, planting_depth, germination_time, companion_plants, antagonist_plants, sync_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')
        ON CONFLICT(id) DO UPDATE SET
          common_name = excluded.common_name,
          scientific_name = excluded.scientific_name,
          category = excluded.category,
          entry_description = excluded.entry_description,
          sunlight = excluded.sunlight,
          watering = excluded.watering,
          soil = excluded.soil,
          temperature = excluded.temperature,
          spacing = excluded.spacing,
          planting_depth = excluded.planting_depth,
          germination_time = excluded.germination_time,
          companion_plants = excluded.companion_plants,
          antagonist_plants = excluded.antagonist_plants,
          sync_status = 'synced'
        WHERE wiki_entries.sync_status = 'synced'
      `, [
        w.id,
        w.commonName || w.title,
        w.scientificName || null,
        w.category || null,
        w.entryDescription || null,
        w.sunlight || null,
        w.watering || null,
        w.soil || null,
        w.temperature || null,
        w.spacing || null,
        w.plantingDepth || null,
        w.germinationTime || null,
        w.companionPlants || null,
        w.antagonistPlants || null,
      ])
    })
  } catch (error) {
    console.error('Failed to pull from remote', error)
  }
}

export async function syncPush() {
  try {
    // 1. Push Gardens
    const pendingGardens = db.getAllSync<DbGarden & { sync_status: string }>("SELECT * FROM gardens WHERE sync_status = 'pending_create'")
    for (const g of pendingGardens) {
      try {
        const created = await patchApiClient.createGarden({
          name: g.name,
          garden_type: g.garden_type || undefined,
          width: g.width ?? undefined,
          length: g.length ?? undefined,
          climate_zone: g.climate_zone || undefined,
          soil_type: g.soil_type || undefined,
        })

        if (created.id === g.id) {
          db.runSync("UPDATE gardens SET sync_status = 'synced' WHERE id = ?", [g.id])
          continue
        }

        db.runSync(`
          INSERT OR REPLACE INTO gardens (id, name, garden_type, width, length, climate_zone, soil_type, sync_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'synced')
        `, [
          created.id,
          created.name,
          created.gardenType || null,
          created.width ?? null,
          created.length ?? null,
          created.climateZone || null,
          created.soilType || null,
        ])
        db.runSync("UPDATE plants SET garden_id = ? WHERE garden_id = ?", [created.id, g.id])
        db.runSync("DELETE FROM gardens WHERE id = ?", [g.id])
      } catch (err) {
        console.error('Failed to push garden', g.id, err)
      }
    }

    // 2. Push Plants
    const pendingPlants = db.getAllSync<DbPlant & { sync_status: string }>("SELECT * FROM plants WHERE sync_status = 'pending_create'")
    for (const p of pendingPlants) {
      try {
        const created = await patchApiClient.createPlant({
          name: p.name,
          species: p.species || undefined,
          variety: p.variety || undefined,
          location: p.location || undefined,
          health_status: p.health_status || undefined,
          growth_stage: p.growth_stage || undefined,
          garden_id: p.garden_id || undefined,
        })

        if (created.id === p.id) {
          db.runSync("UPDATE plants SET sync_status = 'synced' WHERE id = ?", [p.id])
          continue
        }

        db.runSync(`
          INSERT OR REPLACE INTO plants (id, name, species, variety, planting_date, location, health_status, growth_stage, garden_id, sync_status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'synced')
        `, [
          created.id,
          created.name,
          created.species || null,
          created.variety || null,
          created.plantingDate?.toISOString() || null,
          created.location || null,
          created.healthStatus || null,
          created.growthStage || null,
          created.gardenId || null,
        ])
        db.runSync("UPDATE care_tasks SET plant_id = ? WHERE plant_id = ?", [created.id, p.id])
        db.runSync("DELETE FROM plants WHERE id = ?", [p.id])
      } catch (err) {
        console.error('Failed to push plant', p.id, err)
      }
    }

    // 3. Push Tasks
    const pendingTasks = db.getAllSync<DbCareTask & { sync_status: string, notes?: string }>("SELECT * FROM care_tasks WHERE sync_status = 'pending_create'")
    for (const t of pendingTasks) {
      try {
        const createdTask = await patchApiClient.createCareTask(t.plant_id, {
          task_type: t.task_type,
          scheduled_date: t.scheduled_date,
          is_recurring: !!t.is_recurring,
          frequency: t.frequency || undefined,
          notes: t.notes || undefined,
        })

        if (t.completed_date) {
          await patchApiClient.completeTask(createdTask.id, t.completed_date)
        }

        if (createdTask.id === t.id) {
          db.runSync("UPDATE care_tasks SET sync_status = 'synced' WHERE id = ?", [t.id])
          continue
        }

        db.runSync("UPDATE care_tasks SET id = ?, sync_status = 'synced' WHERE id = ?", [createdTask.id, t.id])
      } catch (err) {
        console.error('Failed to push task', t.id, err)
      }
    }

    // 4. Push task updates (e.g. complete actions)
    const pendingTaskUpdates = db.getAllSync<DbCareTask & { sync_status: string }>(`
      SELECT * FROM care_tasks
      WHERE sync_status = 'pending_update'
    `)
    for (const t of pendingTaskUpdates) {
      try {
        if (t.completed_date) {
          await patchApiClient.completeTask(t.id, t.completed_date)
        }
        db.runSync("UPDATE care_tasks SET sync_status = 'synced' WHERE id = ?", [t.id])
      } catch (err) {
        console.error('Failed to push task update', t.id, err)
      }
    }

  } catch (error) {
    console.error('Failed to push to remote', error)
  }
}

export async function syncWithBackend() {
  await syncPush() // Push local changes first
  await syncPull() // Pull updates
}
