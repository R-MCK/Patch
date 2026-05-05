import express from 'express';
import cors from 'cors';
import { randomUUID } from 'crypto';
import { pathToFileURL } from 'url';
import { z } from 'zod';
import { dbAll, dbGet, dbRun, initDatabase } from './db.js';
import { startMcpServer } from './mcp-server.js';
import { logger, type CareTask, type Plant, type Garden, type WikiEntry } from './types.js';

type JsonErrorOptions = {
  details?: unknown;
};

const plantIdSchema = z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid plant ID');
const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const createPlantSchema = z.object({
  name: z.string().min(1),
  species: z.string().nullable().optional(),
  variety: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  health_status: z.string().nullable().optional(),
  growth_stage: z.string().nullable().optional(),
  garden_id: z.string().nullable().optional(),
});

const createGardenSchema = z.object({
  name: z.string().min(1),
  garden_type: z.string().nullable().optional(),
  width: z.number().nullable().optional(),
  length: z.number().nullable().optional(),
  climate_zone: z.string().nullable().optional(),
  soil_type: z.string().nullable().optional(),
});

const createTaskSchema = z.object({
  task_type: z.string().min(1),
  scheduled_date: z.string().min(1),
  is_recurring: z.boolean().default(false),
  frequency: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
}));
app.use(express.json());

export function sendJsonError(
  res: express.Response,
  status: number,
  error: string,
  options: JsonErrorOptions = {},
): void {
  res.status(status).json({
    error,
    ...(options.details === undefined ? {} : { details: options.details }),
  });
}

function serializeSqliteDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalizedValue = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value;
  const date = new Date(normalizedValue);

  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

function serializeSqliteBoolean(value: boolean | number | string | null): boolean | null {
  if (value === null) {
    return null;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return value === '1' || value.toLowerCase() === 'true';
}

export function serializePlant(plant: Plant): Plant {
  return {
    ...plant,
    planting_date: serializeSqliteDate(plant.planting_date),
  };
}

export function serializeCareTask(task: CareTask): CareTask {
  return {
    ...task,
    scheduled_date: serializeSqliteDate(task.scheduled_date) ?? task.scheduled_date,
    completed_date: serializeSqliteDate(task.completed_date),
    is_recurring: serializeSqliteBoolean(task.is_recurring),
  };
}

function isDevelopmentAuthBypassEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && !process.env.API_TOKEN;
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const apiToken = process.env.API_TOKEN;
  if (!apiToken) {
    if (isDevelopmentAuthBypassEnabled()) {
      next();
      return;
    }

    sendJsonError(res, 401, 'Unauthorized');
    return;
  }

  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ') || authHeader.slice(7) !== apiToken) {
    sendJsonError(res, 401, 'Unauthorized');
    return;
  }
  next();
}

// --- REST API ENDPOINTS --- //

// Get all plants
app.get('/api/plants', async (req, res) => {
    try {
        const { limit, offset } = paginationSchema.parse(req.query);
        const plants = await dbAll<Plant>('SELECT * FROM plants LIMIT ? OFFSET ?', [limit, offset]);
        res.json({ data: plants.map(serializePlant), limit, offset });
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid query params', { details: err.issues });
            return;
        }
        logger.error('Failed to fetch plants', err);
        sendJsonError(res, 500, 'Failed to fetch plants');
    }
});

// Get a single plant
app.get('/api/plants/:id', async (req, res) => {
    try {
        const id = plantIdSchema.parse(req.params.id);
        const plant = await dbGet<Plant>('SELECT * FROM plants WHERE id = ?', [id]);
        if (!plant) {
            sendJsonError(res, 404, 'Plant not found');
            return;
        }
        res.json(serializePlant(plant));
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid plant ID');
            return;
        }
        logger.error('Failed to fetch plant', err);
        sendJsonError(res, 500, 'Failed to fetch plant');
    }
});

// Create a new plant
app.post('/api/plants', requireAuth, async (req, res) => {
    try {
        const data = createPlantSchema.parse(req.body);
        const id = randomUUID();
        
        await dbRun(`
            INSERT INTO plants (id, name, species, variety, location, health_status, growth_stage, garden_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            data.name,
            data.species || null,
            data.variety || null,
            data.location || null,
            data.health_status || null,
            data.growth_stage || null,
            data.garden_id || null
        ]);
        
        const newPlant = await dbGet<Plant>('SELECT * FROM plants WHERE id = ?', [id]);
        if (!newPlant) {
            throw new Error('Failed to retrieve created plant');
        }
        res.status(201).json(serializePlant(newPlant));
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid plant data', { details: err.issues });
            return;
        }
        logger.error('Failed to create plant', err);
        sendJsonError(res, 500, 'Failed to create plant');
    }
});

// Get tasks for a plant
app.get('/api/plants/:id/tasks', async (req, res) => {
    try {
        const id = plantIdSchema.parse(req.params.id);
        const tasks = await dbAll<CareTask>('SELECT * FROM care_tasks WHERE plant_id = ?', [id]);
        res.json(tasks.map(serializeCareTask));
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid plant ID');
            return;
        }
        logger.error('Failed to fetch tasks', err);
        sendJsonError(res, 500, 'Failed to fetch tasks');
    }
});

// Create a task for a plant
app.post('/api/plants/:id/tasks', requireAuth, async (req, res) => {
    try {
        const id = plantIdSchema.parse(req.params.id);
        const plant = await dbGet<{ id: string }>('SELECT id FROM plants WHERE id = ?', [id]);
        if (!plant) {
            sendJsonError(res, 404, 'Plant not found');
            return;
        }

        const data = createTaskSchema.parse(req.body);
        const taskId = randomUUID();
        
        await dbRun(`
            INSERT INTO care_tasks (id, plant_id, task_type, scheduled_date, is_recurring, frequency, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            taskId,
            id,
            data.task_type,
            data.scheduled_date,
            data.is_recurring ? 1 : 0,
            data.frequency || null,
            data.notes || null
        ]);
        
        const newTask = await dbGet<CareTask>('SELECT * FROM care_tasks WHERE id = ?', [taskId]);
        if (!newTask) {
            throw new Error('Failed to retrieve created task');
        }
        res.status(201).json(serializeCareTask(newTask));
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid task data', { details: err.issues });
            return;
        }
        logger.error('Failed to create task', err);
        sendJsonError(res, 500, 'Failed to create task');
    }
});

const idSchema = z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid ID');

// Get all gardens
app.get('/api/gardens', async (req, res) => {
    try {
        const { limit, offset } = paginationSchema.parse(req.query);
        const gardens = await dbAll<Garden>('SELECT * FROM gardens LIMIT ? OFFSET ?', [limit, offset]);
        res.json({ data: gardens, limit, offset });
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid query params', { details: err.issues });
            return;
        }
        logger.error('Failed to fetch gardens', err);
        sendJsonError(res, 500, 'Failed to fetch gardens');
    }
});

// Get a single garden
app.get('/api/gardens/:id', async (req, res) => {
    try {
        const id = idSchema.parse(req.params.id);
        const garden = await dbGet<Garden>('SELECT * FROM gardens WHERE id = ?', [id]);
        if (!garden) {
            sendJsonError(res, 404, 'Garden not found');
            return;
        }
        res.json(garden);
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid garden ID');
            return;
        }
        logger.error('Failed to fetch garden', err);
        sendJsonError(res, 500, 'Failed to fetch garden');
    }
});

// Create a new garden
app.post('/api/gardens', requireAuth, async (req, res) => {
    try {
        const data = createGardenSchema.parse(req.body);
        const id = randomUUID();
        
        await dbRun(`
            INSERT INTO gardens (id, name, garden_type, width, length, climate_zone, soil_type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
            id,
            data.name,
            data.garden_type || null,
            data.width || null,
            data.length || null,
            data.climate_zone || null,
            data.soil_type || null
        ]);
        
        const newGarden = await dbGet<Garden>('SELECT * FROM gardens WHERE id = ?', [id]);
        if (!newGarden) {
            throw new Error('Failed to retrieve created garden');
        }
        res.status(201).json(newGarden);
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid garden data', { details: err.issues });
            return;
        }
        logger.error('Failed to create garden', err);
        sendJsonError(res, 500, 'Failed to create garden');
    }
});

// Get all wiki entries
app.get('/api/wiki', async (req, res) => {
    try {
        const { limit, offset } = paginationSchema.parse(req.query);
        const entries = await dbAll<WikiEntry>('SELECT * FROM wiki_entries LIMIT ? OFFSET ?', [limit, offset]);
        res.json({ data: entries, limit, offset });
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid query params', { details: err.issues });
            return;
        }
        logger.error('Failed to fetch wiki entries', err);
        sendJsonError(res, 500, 'Failed to fetch wiki entries');
    }
});

// Get a single wiki entry
app.get('/api/wiki/:id', async (req, res) => {
    try {
        const id = idSchema.parse(req.params.id);
        const entry = await dbGet<WikiEntry>('SELECT * FROM wiki_entries WHERE id = ?', [id]);
        if (!entry) {
            sendJsonError(res, 404, 'Wiki entry not found');
            return;
        }
        res.json(entry);
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid wiki entry ID');
            return;
        }
        logger.error('Failed to fetch wiki entry', err);
        sendJsonError(res, 500, 'Failed to fetch wiki entry');
    }
});

// Water a plant
app.post('/api/plants/:id/water', requireAuth, async (req, res) => {
    try {
        const id = plantIdSchema.parse(req.params.id);
        const plant = await dbGet<{ id: string }>('SELECT id FROM plants WHERE id = ?', [id]);
        if (!plant) {
            sendJsonError(res, 404, 'Plant not found');
            return;
        }

        const taskId = randomUUID();
        await dbRun(`
      INSERT INTO care_tasks (id, plant_id, task_type, scheduled_date, completed_date)
      VALUES (?, ?, 'Watering', datetime('now'), datetime('now'))
    `, [taskId, id]);
        res.json({ success: true, message: 'Plant watered successfully' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid plant ID');
            return;
        }
        logger.error('Failed to log watering task', err);
        sendJsonError(res, 500, 'Failed to log watering task');
    }
});

// Initialize database, then start servers
export async function start() {
    await initDatabase();
    logger.info('Database initialized.');

    // For testing purposes, we're exposing the API on port 3000
    // and starting the MCP Server on Stdio concurrently.
    // In a real production deployment, the MCP server might run separately!

    app.listen(port, () => {
        logger.info(`REST API listening on http://localhost:${port}`);
    });

    // Start the MCP Stdio Server
    await startMcpServer();
}

function shouldStartAutomatically(): boolean {
    const entrypoint = process.argv[1];
    return entrypoint ? import.meta.url === pathToFileURL(entrypoint).href : false;
}

if (shouldStartAutomatically()) {
  start().catch((err: unknown) => {
    logger.error('Failed to start backend', err);
    process.exit(1);
  });
}
