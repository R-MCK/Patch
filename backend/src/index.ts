import express from 'express';
import cors from 'cors';
import { z } from 'zod';
import { dbAll, dbRun, initDatabase } from './db.js';
import { startMcpServer } from './mcp-server.js';
import type { Plant, CareTask } from './types.js';

const plantIdSchema = z.string().min(1).regex(/^[a-zA-Z0-9_-]+$/, 'Invalid plant ID');
const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

function log(level: 'info' | 'error', message: string) {
  const ts = new Date().toISOString()
  console.log(`[${ts}] [${level.toUpperCase()}] ${message}`)
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'],
}));
app.use(express.json());

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const apiToken = process.env.API_TOKEN;
  if (!apiToken) {
    next();
    return;
  }
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ') || authHeader.slice(7) !== apiToken) {
    res.status(401).json({ error: 'Unauthorized' });
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
        res.json({ data: plants, limit, offset });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid query params', details: err.issues });
            return;
        }
        res.status(500).json({ error: 'Failed to fetch plants' });
    }
});

// Get a single plant
app.get('/api/plants/:id', async (req, res) => {
    try {
        const id = plantIdSchema.parse(req.params.id);
        const plant = await dbAll<Plant>('SELECT * FROM plants WHERE id = ?', [id]);
        if (!plant.length) {
            res.status(404).json({ error: 'Plant not found' });
            return;
        }
        res.json(plant[0]);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid plant ID' });
            return;
        }
        res.status(500).json({ error: 'Failed to fetch plant' });
    }
});

// Get tasks for a plant
app.get('/api/plants/:id/tasks', async (req, res) => {
    try {
        const id = plantIdSchema.parse(req.params.id);
        const tasks = await dbAll<CareTask>('SELECT * FROM care_tasks WHERE plant_id = ?', [id]);
        res.json(tasks);
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid plant ID' });
            return;
        }
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Water a plant
app.post('/api/plants/:id/water', requireAuth, async (req, res) => {
    try {
        const id = plantIdSchema.parse(req.params.id);
        const taskId = crypto.randomUUID();
        await dbRun(`
      INSERT INTO care_tasks (id, plant_id, task_type, scheduled_date, completed_date)
      VALUES (?, ?, 'Watering', datetime('now'), datetime('now'))
    `, [taskId, id]);
        res.json({ success: true, message: 'Plant watered successfully' });
    } catch (err) {
        if (err instanceof z.ZodError) {
            res.status(400).json({ error: 'Invalid plant ID' });
            return;
        }
        res.status(500).json({ error: 'Failed to log watering task' });
    }
});

// Initialize database, then start servers
async function start() {
    await initDatabase();
    log('info', 'Database initialized.');

    // For testing purposes, we're exposing the API on port 3000
    // and starting the MCP Server on Stdio concurrently.
    // In a real production deployment, the MCP server might run separately!

    app.listen(port, () => {
        log('info', `REST API listening on http://localhost:${port}`);
    });

    // Start the MCP Stdio Server
    await startMcpServer();
}

start().catch(console.error);
