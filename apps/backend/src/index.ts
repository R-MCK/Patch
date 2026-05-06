import express from 'express';
import cors from 'cors';
import { createHash, createHmac, randomBytes, randomUUID, scrypt as cryptoScrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
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

const registerSchema = z.object({
  email: z.email().trim().toLowerCase(),
  name: z.string().trim().min(1).max(120).optional(),
  password: z.string().min(8).max(200),
});

const loginSchema = z.object({
  email: z.email().trim().toLowerCase(),
  password: z.string().min(1).max(200),
});

type AuthUser = {
  id: string;
  email: string;
  name: string;
  created_at: string;
};

type UserWithPassword = AuthUser & {
  password_hash: string;
};

type AuthenticatedRequest = express.Request & {
  authUserId?: string;
};

type JwtPayload = {
  sub: string;
  email: string;
  name: string;
  exp: number;
};

type RefreshTokenRow = {
  id: string;
  user_id: string;
  expires_at: string;
  revoked_at: string | null;
};

const scrypt = promisify(cryptoScrypt) as (
  password: string,
  salt: string,
  keylen: number,
) => Promise<Buffer>;

const ACCESS_TOKEN_EXPIRES_IN_SECONDS = 15 * 60;
const REFRESH_TOKEN_EXPIRES_IN_DAYS = 30;
const REFRESH_COOKIE_NAME = 'patch_refresh_token';

export const app = express();
const port = process.env.PORT || 3000;
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) ?? ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
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

function serializeAuthUser(user: AuthUser): AuthUser {
  return {
    ...user,
    created_at: serializeSqliteDate(user.created_at) ?? user.created_at,
  };
}

function getDefaultUserName(email: string): string {
  return email.split('@')[0] || 'Patch Gardener';
}

function getConfiguredJwtSecret(): string | undefined {
  return process.env.JWT_SECRET;
}

function getJwtSecretForSigning(): string | undefined {
  if (process.env.JWT_SECRET) {
    return process.env.JWT_SECRET;
  }

  if (process.env.NODE_ENV === 'development') {
    return 'patch-development-jwt-secret';
  }

  return undefined;
}

function base64UrlJson(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function signJwtPayload(payload: JwtPayload, secret: string): string {
  const header = base64UrlJson({ alg: 'HS256', typ: 'JWT' });
  const body = base64UrlJson(payload);
  const signature = createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

function createAccessToken(user: AuthUser): string {
  const secret = getJwtSecretForSigning();
  if (!secret) {
    throw new Error('JWT_SECRET is required for auth token issuance');
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRES_IN_SECONDS;
  return signJwtPayload({
    sub: user.id,
    email: user.email,
    name: user.name,
    exp: expiresAt,
  }, secret);
}

function verifyAccessToken(token: string): JwtPayload | null {
  const secret = getJwtSecretForSigning();
  if (!secret) {
    return null;
  }

  const parts = token.split('.');
  if (parts.length !== 3 || !parts[0] || !parts[1] || !parts[2]) {
    return null;
  }

  const expectedSignature = createHmac('sha256', secret)
    .update(`${parts[0]}.${parts[1]}`)
    .digest('base64url');
  const receivedSignature = parts[2];
  const expected = Buffer.from(expectedSignature);
  const received = Buffer.from(receivedSignature);

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')) as Partial<JwtPayload>;
    if (
      typeof payload.sub !== 'string'
      || typeof payload.email !== 'string'
      || typeof payload.name !== 'string'
      || typeof payload.exp !== 'number'
      || payload.exp <= Math.floor(Date.now() / 1000)
    ) {
      return null;
    }

    return payload as JwtPayload;
  } catch {
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('base64url');
  const hash = await scrypt(password, salt, 64);
  return `scrypt:${salt}:${hash.toString('base64url')}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [algorithm, salt, hash] = storedHash.split(':');
  if (algorithm !== 'scrypt' || !salt || !hash) {
    return false;
  }

  const expected = Buffer.from(hash, 'base64url');
  const actual = await scrypt(password, salt, expected.length);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function hashRefreshToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function createRefreshToken(userId: string): Promise<string> {
  const token = randomBytes(48).toString('base64url');
  const tokenHash = hashRefreshToken(token);
  const tokenId = randomUUID();

  await dbRun(`
    INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
    VALUES (?, ?, ?, datetime('now', ?))
  `, [tokenId, userId, tokenHash, `+${REFRESH_TOKEN_EXPIRES_IN_DAYS} days`]);

  return token;
}

function setRefreshCookie(res: express.Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth',
    maxAge: REFRESH_TOKEN_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res: express.Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/api/auth',
  });
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(';').reduce<Record<string, string>>((cookies, cookie) => {
    const separatorIndex = cookie.indexOf('=');
    if (separatorIndex === -1) {
      return cookies;
    }

    const name = cookie.slice(0, separatorIndex).trim();
    const value = cookie.slice(separatorIndex + 1).trim();
    if (name) {
      cookies[name] = decodeURIComponent(value);
    }

    return cookies;
  }, {});
}

function getRefreshTokenFromRequest(req: express.Request): string | undefined {
  return parseCookies(req.headers.cookie)[REFRESH_COOKIE_NAME];
}

async function findActiveRefreshToken(token: string): Promise<RefreshTokenRow | undefined> {
  return dbGet<RefreshTokenRow>(`
    SELECT id, user_id, expires_at, revoked_at
    FROM refresh_tokens
    WHERE token_hash = ?
      AND revoked_at IS NULL
      AND expires_at > datetime('now')
  `, [hashRefreshToken(token)]);
}

async function sendAuthResponse(res: express.Response, user: AuthUser, status = 200): Promise<void> {
  const serializedUser = serializeAuthUser(user);
  const accessToken = createAccessToken(serializedUser);
  const refreshToken = await createRefreshToken(user.id);

  setRefreshCookie(res, refreshToken);
  res.status(status).json({
    user: serializedUser,
    accessToken,
    expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
  });
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
  return process.env.NODE_ENV === 'development' && !process.env.API_TOKEN && !getConfiguredJwtSecret();
}

function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const apiToken = process.env.API_TOKEN;
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    if (isDevelopmentAuthBypassEnabled()) {
      next();
      return;
    }

    sendJsonError(res, 401, 'Unauthorized');
    return;
  }

  const bearerToken = authHeader.slice(7);
  if (apiToken && bearerToken === apiToken) {
    next();
    return;
  }

  const payload = verifyAccessToken(bearerToken);
  if (!payload) {
    sendJsonError(res, 401, 'Unauthorized');
    return;
  }

  (req as AuthenticatedRequest).authUserId = payload.sub;
  next();
}

// --- REST API ENDPOINTS --- //

app.post('/api/auth/register', async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existingUser = await dbGet<{ id: string }>('SELECT id FROM users WHERE email = ?', [data.email]);
    if (existingUser) {
      sendJsonError(res, 409, 'Email already registered');
      return;
    }

    const id = randomUUID();
    const passwordHash = await hashPassword(data.password);
    await dbRun(`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (?, ?, ?, ?)
    `, [id, data.email, data.name ?? getDefaultUserName(data.email), passwordHash]);

    const user = await dbGet<AuthUser>('SELECT id, email, name, created_at FROM users WHERE id = ?', [id]);
    if (!user) {
      throw new Error('Failed to retrieve created user');
    }

    await sendAuthResponse(res, user, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid registration data', { details: err.issues });
      return;
    }
    logger.error('Failed to register user', err);
    sendJsonError(res, 500, 'Failed to register user');
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await dbGet<UserWithPassword>(
      'SELECT id, email, name, password_hash, created_at FROM users WHERE email = ?',
      [data.email],
    );

    if (!user || !(await verifyPassword(data.password, user.password_hash))) {
      sendJsonError(res, 401, 'Invalid email or password');
      return;
    }

    await sendAuthResponse(res, user);
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid login data', { details: err.issues });
      return;
    }
    logger.error('Failed to log in user', err);
    sendJsonError(res, 500, 'Failed to log in user');
  }
});

app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).authUserId;
    if (!userId) {
      sendJsonError(res, 401, 'User authentication required');
      return;
    }

    const user = await dbGet<AuthUser>(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [userId],
    );
    if (!user) {
      sendJsonError(res, 401, 'User authentication required');
      return;
    }

    res.json(serializeAuthUser(user));
  } catch (err) {
    logger.error('Failed to fetch authenticated user', err);
    sendJsonError(res, 500, 'Failed to fetch authenticated user');
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (!refreshToken) {
      sendJsonError(res, 401, 'Refresh token required');
      return;
    }

    const tokenRow = await findActiveRefreshToken(refreshToken);
    if (!tokenRow) {
      clearRefreshCookie(res);
      sendJsonError(res, 401, 'Invalid refresh token');
      return;
    }

    const user = await dbGet<AuthUser>(
      'SELECT id, email, name, created_at FROM users WHERE id = ?',
      [tokenRow.user_id],
    );
    if (!user) {
      await dbRun('UPDATE refresh_tokens SET revoked_at = datetime(\'now\') WHERE id = ?', [tokenRow.id]);
      clearRefreshCookie(res);
      sendJsonError(res, 401, 'Invalid refresh token');
      return;
    }

    await dbRun('UPDATE refresh_tokens SET revoked_at = datetime(\'now\') WHERE id = ?', [tokenRow.id]);
    await sendAuthResponse(res, user);
  } catch (err) {
    logger.error('Failed to refresh auth token', err);
    sendJsonError(res, 500, 'Failed to refresh auth token');
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const refreshToken = getRefreshTokenFromRequest(req);
    if (refreshToken) {
      await dbRun(`
        UPDATE refresh_tokens
        SET revoked_at = datetime('now')
        WHERE token_hash = ? AND revoked_at IS NULL
      `, [hashRefreshToken(refreshToken)]);
    }

    clearRefreshCookie(res);
    res.json({ success: true });
  } catch (err) {
    logger.error('Failed to log out user', err);
    sendJsonError(res, 500, 'Failed to log out user');
  }
});

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
