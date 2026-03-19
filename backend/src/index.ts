import express from 'express';
import cors from 'cors';
import { dbAll, dbRun, initDatabase } from './db.js';
import { startMcpServer } from './mcp-server.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- REST API ENDPOINTS --- //

// Get all plants
app.get('/api/plants', async (req, res) => {
    try {
        const plants = await dbAll('SELECT * FROM plants');
        res.json(plants);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch plants' });
    }
});

// Get tasks for a plant
app.get('/api/plants/:id/tasks', async (req, res) => {
    try {
        const tasks = await dbAll('SELECT * FROM care_tasks WHERE plant_id = ?', [req.params.id]);
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks' });
    }
});

// Water a plant
app.post('/api/plants/:id/water', async (req, res) => {
    try {
        const taskId = Math.random().toString(36).substring(7);
        await dbRun(`
      INSERT INTO care_tasks (id, plant_id, task_type, scheduled_date, completed_date)
      VALUES (?, ?, 'Watering', datetime('now'), datetime('now'))
    `, [taskId, req.params.id]);
        res.json({ success: true, message: 'Plant watered successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to log watering task' });
    }
});

// Initialize database, then start servers
async function start() {
    await initDatabase();
    console.log("Database initialized.");

    // For testing purposes, we're exposing the API on port 3000
    // and starting the MCP Server on Stdio concurrently.
    // In a real production deployment, the MCP server might run separately!

    app.listen(port, () => {
        console.log(`Rest API listening on http://localhost:${port}`);
    });

    // Start the MCP Stdio Server
    await startMcpServer();
}

start().catch(console.error);
