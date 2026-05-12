import express from 'express';
import cors from 'cors';
import { createHash, randomBytes, randomUUID } from 'crypto';
import { pathToFileURL } from 'url';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
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

const completeTaskSchema = z.object({
  completed_date: z.string().trim().nullable().optional(),
});

const upsertProfileSchema = z.object({
  country: z.string().trim().max(120).nullable().optional(),
  region: z.string().trim().max(120).nullable().optional(),
  postcode: z.string().trim().max(40).nullable().optional(),
  units: z.enum(['imperial', 'metric']).nullable().optional(),
  experience_level: z.string().trim().max(80).nullable().optional(),
  goals: z.string().trim().max(4000).nullable().optional(),
  climate_notes: z.string().trim().max(4000).nullable().optional(),
});

const createNoteSchema = z.object({
  plant_id: z.string().min(1).nullable().optional(),
  title: z.string().trim().max(200).nullable().optional(),
  content: z.string().trim().min(1).max(8000),
});

const createPhotoSchema = z.object({
  plant_id: z.string().min(1).nullable().optional(),
  image_data: z.string().trim().min(1),
  thumbnail_data: z.string().trim().nullable().optional(),
  caption: z.string().trim().max(500).nullable().optional(),
  captured_at: z.string().trim().nullable().optional(),
});

const createGardenZoneSchema = z.object({
  name: z.string().trim().min(1).max(160),
  zone_type: z.string().trim().max(80).nullable().optional(),
  width_feet: z.number().nullable().optional(),
  length_feet: z.number().nullable().optional(),
  sort_order: z.number().int().nullable().optional(),
  photo_id: z.string().trim().min(1).nullable().optional(),
  notes: z.string().trim().max(4000).nullable().optional(),
});

const updateGardenZoneSchema = createGardenZoneSchema.partial();

const createPlantingRecordSchema = z.object({
  plant_name_snapshot: z.string().trim().min(1).max(200),
  species_snapshot: z.string().trim().max(200).nullable().optional(),
  variety_snapshot: z.string().trim().max(200).nullable().optional(),
  garden_id: z.string().trim().min(1).nullable().optional(),
  zone_id: z.string().trim().min(1).nullable().optional(),
  planted_at: z.string().trim().min(1),
  removed_at: z.string().trim().nullable().optional(),
  harvested_at: z.string().trim().nullable().optional(),
  source_plant_id: z.string().trim().min(1).nullable().optional(),
  outcome: z.string().trim().max(1000).nullable().optional(),
  season: z.string().trim().max(40).nullable().optional(),
  year: z.number().int().nullable().optional(),
});

const updatePlantingRecordSchema = createPlantingRecordSchema.partial();

const observationTypeSchema = z.enum(['textNote', 'photo', 'audio', 'taskComplete', 'general']);

const createObservationSchema = z.object({
  observation_type: observationTypeSchema.default('general'),
  text_content: z.string().trim().max(10000).nullable().optional(),
  image_data: z.string().trim().nullable().optional(),
  thumbnail_data: z.string().trim().nullable().optional(),
  audio_data: z.string().trim().nullable().optional(),
  transcript: z.string().trim().max(10000).nullable().optional(),
  plant_id: z.string().trim().min(1).nullable().optional(),
  garden_id: z.string().trim().min(1).nullable().optional(),
  zone_id: z.string().trim().min(1).nullable().optional(),
  planting_record_id: z.string().trim().min(1).nullable().optional(),
  tags: z.array(z.string().trim().min(1)).max(50).nullable().optional(),
  observed_at: z.string().trim().nullable().optional(),
});

const updateObservationSchema = createObservationSchema.partial();

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
};

type RefreshTokenRow = {
  id: string;
  user_id: string;
  expires_at: string;
  revoked_at: string | null;
};

type UserProfileRow = {
  user_id: string;
  country: string | null;
  region: string | null;
  postcode: string | null;
  units: string | null;
  experience_level: string | null;
  goals: string | null;
  climate_notes: string | null;
  created_at: string;
  updated_at: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  plant_id: string | null;
  title: string | null;
  content: string;
  created_at: string;
  updated_at: string;
};

type PhotoRow = {
  id: string;
  user_id: string;
  plant_id: string | null;
  image_data: string;
  thumbnail_data: string | null;
  caption: string | null;
  captured_at: string;
  created_at: string;
  updated_at: string;
};

type GardenZoneRow = {
  id: string;
  user_id: string;
  garden_id: string;
  name: string;
  zone_type: string | null;
  width_feet: number | null;
  length_feet: number | null;
  sort_order: number | null;
  photo_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

type PlantingRecordRow = {
  id: string;
  user_id: string;
  plant_name_snapshot: string;
  species_snapshot: string | null;
  variety_snapshot: string | null;
  garden_id: string | null;
  zone_id: string | null;
  planted_at: string;
  removed_at: string | null;
  harvested_at: string | null;
  source_plant_id: string | null;
  outcome: string | null;
  season: string | null;
  year: number | null;
  created_at: string;
  updated_at: string;
};

type ObservationRow = {
  id: string;
  user_id: string;
  observation_type: string;
  text_content: string | null;
  image_data: string | null;
  thumbnail_data: string | null;
  audio_data: string | null;
  transcript: string | null;
  plant_id: string | null;
  garden_id: string | null;
  zone_id: string | null;
  planting_record_id: string | null;
  tags: string | null;
  observed_at: string;
  created_at: string;
  updated_at: string;
};

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

function serializeUserProfile(profile: UserProfileRow): UserProfileRow {
  return {
    ...profile,
    created_at: serializeSqliteDate(profile.created_at) ?? profile.created_at,
    updated_at: serializeSqliteDate(profile.updated_at) ?? profile.updated_at,
  };
}

function serializeNote(note: NoteRow): NoteRow {
  return {
    ...note,
    created_at: serializeSqliteDate(note.created_at) ?? note.created_at,
    updated_at: serializeSqliteDate(note.updated_at) ?? note.updated_at,
  };
}

function serializePhoto(photo: PhotoRow): PhotoRow {
  return {
    ...photo,
    captured_at: serializeSqliteDate(photo.captured_at) ?? photo.captured_at,
    created_at: serializeSqliteDate(photo.created_at) ?? photo.created_at,
    updated_at: serializeSqliteDate(photo.updated_at) ?? photo.updated_at,
  };
}

function serializeGardenZone(zone: GardenZoneRow): GardenZoneRow {
  return {
    ...zone,
    created_at: serializeSqliteDate(zone.created_at) ?? zone.created_at,
    updated_at: serializeSqliteDate(zone.updated_at) ?? zone.updated_at,
  };
}

function serializePlantingRecord(record: PlantingRecordRow): PlantingRecordRow {
  return {
    ...record,
    planted_at: serializeSqliteDate(record.planted_at) ?? record.planted_at,
    removed_at: serializeSqliteDate(record.removed_at),
    harvested_at: serializeSqliteDate(record.harvested_at),
    created_at: serializeSqliteDate(record.created_at) ?? record.created_at,
    updated_at: serializeSqliteDate(record.updated_at) ?? record.updated_at,
  };
}

function serializeObservation(observation: ObservationRow): ObservationRow {
  return {
    ...observation,
    observed_at: serializeSqliteDate(observation.observed_at) ?? observation.observed_at,
    created_at: serializeSqliteDate(observation.created_at) ?? observation.created_at,
    updated_at: serializeSqliteDate(observation.updated_at) ?? observation.updated_at,
  };
}

function parseObservationTags(tags: string | null | undefined): string[] {
  if (!tags) {
    return [];
  }

  try {
    const parsed = JSON.parse(tags) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

function toObservationResponse(observation: ObservationRow) {
  const serialized = serializeObservation(observation);
  return {
    ...serialized,
    tags: parseObservationTags(serialized.tags),
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

  return 'patch-local-jwt-secret';
}

function createAccessToken(user: AuthUser): string {
  const secret = getJwtSecretForSigning();
  if (!secret) {
    throw new Error('JWT_SECRET is required for auth token issuance');
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
    },
    secret,
    {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN_SECONDS,
      algorithm: 'HS256',
    },
  );
}

function verifyAccessToken(token: string): JwtPayload | null {
  const secret = getJwtSecretForSigning();
  if (!secret) {
    return null;
  }

  try {
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] }) as jwt.JwtPayload & Partial<JwtPayload>;
    if (
      typeof payload.sub !== 'string'
      || typeof payload.email !== 'string'
      || typeof payload.name !== 'string'
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch {
    return null;
  }
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, storedHash);
  } catch {
    return false;
  }
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

function getRequiredAuthUserId(req: express.Request, res: express.Response): string | null {
  const userId = (req as AuthenticatedRequest).authUserId;
  if (!userId) {
    sendJsonError(res, 401, 'User authentication required');
    return null;
  }

  return userId;
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
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
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

app.get('/api/profile', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const profile = await dbGet<UserProfileRow>(`
      SELECT
        user_id,
        country,
        region,
        postcode,
        units,
        experience_level,
        goals,
        climate_notes,
        created_at,
        updated_at
      FROM user_profiles
      WHERE user_id = ?
    `, [userId]);

    res.json({
      profile: profile ? serializeUserProfile(profile) : null,
    });
  } catch (err) {
    logger.error('Failed to fetch user profile', err);
    sendJsonError(res, 500, 'Failed to fetch user profile');
  }
});

app.put('/api/profile', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const data = upsertProfileSchema.parse(req.body);
    await dbRun(`
      INSERT INTO user_profiles (
        user_id,
        country,
        region,
        postcode,
        units,
        experience_level,
        goals,
        climate_notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        country = excluded.country,
        region = excluded.region,
        postcode = excluded.postcode,
        units = excluded.units,
        experience_level = excluded.experience_level,
        goals = excluded.goals,
        climate_notes = excluded.climate_notes,
        updated_at = datetime('now')
    `, [
      userId,
      data.country ?? null,
      data.region ?? null,
      data.postcode ?? null,
      data.units ?? null,
      data.experience_level ?? null,
      data.goals ?? null,
      data.climate_notes ?? null,
    ]);

    const profile = await dbGet<UserProfileRow>(`
      SELECT
        user_id,
        country,
        region,
        postcode,
        units,
        experience_level,
        goals,
        climate_notes,
        created_at,
        updated_at
      FROM user_profiles
      WHERE user_id = ?
    `, [userId]);

    if (!profile) {
      throw new Error('Failed to retrieve saved profile');
    }

    res.json(serializeUserProfile(profile));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid profile data', { details: err.issues });
      return;
    }
    logger.error('Failed to update user profile', err);
    sendJsonError(res, 500, 'Failed to update user profile');
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

app.get('/api/plants/:id/notes', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const plantId = plantIdSchema.parse(req.params.id);
    const notes = await dbAll<ObservationRow>(`
      SELECT
        id,
        user_id,
        observation_type,
        text_content,
        image_data,
        thumbnail_data,
        audio_data,
        transcript,
        plant_id,
        garden_id,
        zone_id,
        planting_record_id,
        tags,
        observed_at,
        created_at,
        updated_at
      FROM observations
      WHERE user_id = ? AND plant_id = ?
        AND observation_type = 'textNote'
      ORDER BY observed_at DESC
    `, [userId, plantId]);

    res.json(notes.map((row) => {
      const observation = serializeObservation(row);
      return serializeNote({
        id: observation.id,
        user_id: observation.user_id,
        plant_id: observation.plant_id,
        title: 'Field note',
        content: observation.text_content ?? '',
        created_at: observation.created_at,
        updated_at: observation.updated_at,
      });
    }));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid plant ID');
      return;
    }
    logger.error('Failed to fetch notes', err);
    sendJsonError(res, 500, 'Failed to fetch notes');
  }
});

app.post('/api/plants/:id/notes', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const plantId = plantIdSchema.parse(req.params.id);
    const plant = await dbGet<{ id: string }>('SELECT id FROM plants WHERE id = ?', [plantId]);
    if (!plant) {
      sendJsonError(res, 404, 'Plant not found');
      return;
    }

    const data = createNoteSchema.parse(req.body);
    const noteId = randomUUID();
    await dbRun(`
      INSERT INTO observations (
        id,
        user_id,
        observation_type,
        text_content,
        plant_id
      )
      VALUES (?, ?, 'textNote', ?, ?)
    `, [
      noteId,
      userId,
      (data.title?.trim() ? `${data.title.trim()}\n\n${data.content}` : data.content),
      plantId,
    ]);

    const note = await dbGet<ObservationRow>(`
      SELECT
        id,
        user_id,
        observation_type,
        text_content,
        image_data,
        thumbnail_data,
        audio_data,
        transcript,
        plant_id,
        garden_id,
        zone_id,
        planting_record_id,
        tags,
        observed_at,
        created_at,
        updated_at
      FROM observations
      WHERE id = ?
    `, [noteId]);
    if (!note) {
      throw new Error('Failed to retrieve created note');
    }

    const serialized = serializeObservation(note);
    res.status(201).json(serializeNote({
      id: serialized.id,
      user_id: serialized.user_id,
      plant_id: serialized.plant_id,
      title: 'Field note',
      content: serialized.text_content ?? '',
      created_at: serialized.created_at,
      updated_at: serialized.updated_at,
    }));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid note data', { details: err.issues });
      return;
    }
    logger.error('Failed to create note', err);
    sendJsonError(res, 500, 'Failed to create note');
  }
});

app.get('/api/plants/:id/photos', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const plantId = plantIdSchema.parse(req.params.id);
    const photos = await dbAll<ObservationRow>(`
      SELECT
        id,
        user_id,
        observation_type,
        text_content,
        image_data,
        thumbnail_data,
        audio_data,
        transcript,
        plant_id,
        garden_id,
        zone_id,
        planting_record_id,
        tags,
        observed_at,
        created_at,
        updated_at
      FROM observations
      WHERE user_id = ? AND plant_id = ?
        AND observation_type = 'photo'
      ORDER BY observed_at DESC
    `, [userId, plantId]);

    res.json(photos.map((row) => {
      const observation = serializeObservation(row);
      return serializePhoto({
        id: observation.id,
        user_id: observation.user_id,
        plant_id: observation.plant_id,
        image_data: observation.image_data ?? '',
        thumbnail_data: observation.thumbnail_data,
        caption: observation.text_content,
        captured_at: observation.observed_at,
        created_at: observation.created_at,
        updated_at: observation.updated_at,
      });
    }));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid plant ID');
      return;
    }
    logger.error('Failed to fetch photos', err);
    sendJsonError(res, 500, 'Failed to fetch photos');
  }
});

app.post('/api/plants/:id/photos', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const plantId = plantIdSchema.parse(req.params.id);
    const plant = await dbGet<{ id: string }>('SELECT id FROM plants WHERE id = ?', [plantId]);
    if (!plant) {
      sendJsonError(res, 404, 'Plant not found');
      return;
    }

    const data = createPhotoSchema.parse(req.body);
    const photoId = randomUUID();
    await dbRun(`
      INSERT INTO observations (
        id,
        user_id,
        observation_type,
        text_content,
        image_data,
        thumbnail_data,
        plant_id,
        observed_at
      )
      VALUES (?, ?, 'photo', ?, ?, ?, ?, COALESCE(?, datetime('now')))
    `, [
      photoId,
      userId,
      data.caption ?? null,
      data.image_data,
      data.thumbnail_data ?? null,
      plantId,
      data.captured_at ?? null,
    ]);

    const photo = await dbGet<ObservationRow>(`
      SELECT
        id,
        user_id,
        observation_type,
        text_content,
        image_data,
        thumbnail_data,
        audio_data,
        transcript,
        plant_id,
        garden_id,
        zone_id,
        planting_record_id,
        tags,
        observed_at,
        created_at,
        updated_at
      FROM observations
      WHERE id = ?
    `, [photoId]);
    if (!photo) {
      throw new Error('Failed to retrieve created photo');
    }

    const serialized = serializeObservation(photo);
    res.status(201).json(serializePhoto({
      id: serialized.id,
      user_id: serialized.user_id,
      plant_id: serialized.plant_id,
      image_data: serialized.image_data ?? '',
      thumbnail_data: serialized.thumbnail_data,
      caption: serialized.text_content,
      captured_at: serialized.observed_at,
      created_at: serialized.created_at,
      updated_at: serialized.updated_at,
    }));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid photo data', { details: err.issues });
      return;
    }
    logger.error('Failed to create photo', err);
    sendJsonError(res, 500, 'Failed to create photo');
  }
});

app.get('/api/plants/:id/observations', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const plantId = plantIdSchema.parse(req.params.id);
    const rows = await dbAll<ObservationRow>(`
      SELECT
        id, user_id, observation_type, text_content, image_data, thumbnail_data, audio_data, transcript,
        plant_id, garden_id, zone_id, planting_record_id, tags, observed_at, created_at, updated_at
      FROM observations
      WHERE user_id = ? AND plant_id = ?
      ORDER BY observed_at DESC
    `, [userId, plantId]);

    res.json(rows.map(toObservationResponse));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid plant ID');
      return;
    }
    logger.error('Failed to fetch observations', err);
    sendJsonError(res, 500, 'Failed to fetch observations');
  }
});

app.post('/api/plants/:id/observations', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const plantId = plantIdSchema.parse(req.params.id);
    const plant = await dbGet<{ id: string; garden_id: string | null }>(
      'SELECT id, garden_id FROM plants WHERE id = ?',
      [plantId],
    );
    if (!plant) {
      sendJsonError(res, 404, 'Plant not found');
      return;
    }

    const data = createObservationSchema.parse(req.body);
    const observationId = randomUUID();
    await dbRun(`
      INSERT INTO observations (
        id,
        user_id,
        observation_type,
        text_content,
        image_data,
        thumbnail_data,
        audio_data,
        transcript,
        plant_id,
        garden_id,
        zone_id,
        planting_record_id,
        tags,
        observed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')))
    `, [
      observationId,
      userId,
      data.observation_type,
      data.text_content ?? null,
      data.image_data ?? null,
      data.thumbnail_data ?? null,
      data.audio_data ?? null,
      data.transcript ?? null,
      plantId,
      data.garden_id ?? plant.garden_id ?? null,
      data.zone_id ?? null,
      data.planting_record_id ?? null,
      JSON.stringify(data.tags ?? []),
      data.observed_at ?? null,
    ]);

    const row = await dbGet<ObservationRow>(`
      SELECT
        id, user_id, observation_type, text_content, image_data, thumbnail_data, audio_data, transcript,
        plant_id, garden_id, zone_id, planting_record_id, tags, observed_at, created_at, updated_at
      FROM observations
      WHERE id = ?
    `, [observationId]);
    if (!row) {
      throw new Error('Failed to retrieve created observation');
    }

    res.status(201).json(toObservationResponse(row));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid observation data', { details: err.issues });
      return;
    }
    logger.error('Failed to create observation', err);
    sendJsonError(res, 500, 'Failed to create observation');
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
            INSERT INTO care_tasks (id, plant_id, task_type, scheduled_date, is_recurring, frequency)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            taskId,
            id,
            data.task_type,
            data.scheduled_date,
            data.is_recurring ? 1 : 0,
            data.frequency || null
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

app.post('/api/tasks/:id/complete', requireAuth, async (req, res) => {
    try {
        const userId = getRequiredAuthUserId(req, res);
        if (!userId) {
            return;
        }

        const taskId = idSchema.parse(req.params.id);
        const data = completeTaskSchema.parse(req.body ?? {});
        const task = await dbGet<CareTask>('SELECT * FROM care_tasks WHERE id = ?', [taskId]);
        if (!task) {
            sendJsonError(res, 404, 'Task not found');
            return;
        }

        await dbRun(`
          UPDATE care_tasks
          SET completed_date = COALESCE(?, datetime('now'))
          WHERE id = ?
        `, [data.completed_date ?? null, taskId]);

        const updatedTask = await dbGet<CareTask>('SELECT * FROM care_tasks WHERE id = ?', [taskId]);
        if (!updatedTask) {
            throw new Error('Failed to retrieve updated task');
        }

        const plant = await dbGet<Plant>('SELECT * FROM plants WHERE id = ?', [updatedTask.plant_id]);
        const latestRecord = await dbGet<PlantingRecordRow>(`
          SELECT
            id, user_id, plant_name_snapshot, species_snapshot, variety_snapshot, garden_id, zone_id, planted_at,
            removed_at, harvested_at, source_plant_id, outcome, season, year, created_at, updated_at
          FROM planting_records
          WHERE user_id = ? AND source_plant_id = ?
          ORDER BY planted_at DESC
          LIMIT 1
        `, [userId, updatedTask.plant_id]);

        const observationId = randomUUID();
        await dbRun(`
          INSERT INTO observations (
            id, user_id, observation_type, text_content, plant_id, garden_id, zone_id, planting_record_id, tags, observed_at
          )
          VALUES (?, ?, 'taskComplete', ?, ?, ?, ?, ?, ?, datetime('now'))
        `, [
          observationId,
          userId,
          `${updatedTask.task_type} completed`,
          updatedTask.plant_id,
          plant?.garden_id ?? latestRecord?.garden_id ?? null,
          latestRecord?.zone_id ?? null,
          latestRecord?.id ?? null,
          JSON.stringify(['task', 'completion']),
        ]);

        res.json(serializeCareTask(updatedTask));
    } catch (err) {
        if (err instanceof z.ZodError) {
            sendJsonError(res, 400, 'Invalid task completion payload', { details: err.issues });
            return;
        }
        logger.error('Failed to complete task', err);
        sendJsonError(res, 500, 'Failed to complete task');
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

app.get('/api/gardens/:id/zones', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const gardenId = idSchema.parse(req.params.id);
    const rows = await dbAll<GardenZoneRow>(`
      SELECT id, user_id, garden_id, name, zone_type, width_feet, length_feet, sort_order, photo_id, notes, created_at, updated_at
      FROM garden_zones
      WHERE user_id = ? AND garden_id = ?
      ORDER BY sort_order ASC, created_at ASC
    `, [userId, gardenId]);

    res.json(rows.map(serializeGardenZone));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid garden ID');
      return;
    }
    logger.error('Failed to fetch garden zones', err);
    sendJsonError(res, 500, 'Failed to fetch garden zones');
  }
});

app.post('/api/gardens/:id/zones', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const gardenId = idSchema.parse(req.params.id);
    const garden = await dbGet<{ id: string }>('SELECT id FROM gardens WHERE id = ?', [gardenId]);
    if (!garden) {
      sendJsonError(res, 404, 'Garden not found');
      return;
    }

    const data = createGardenZoneSchema.parse(req.body);
    const zoneId = randomUUID();
    await dbRun(`
      INSERT INTO garden_zones (
        id, user_id, garden_id, name, zone_type, width_feet, length_feet, sort_order, photo_id, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      zoneId,
      userId,
      gardenId,
      data.name,
      data.zone_type ?? null,
      data.width_feet ?? null,
      data.length_feet ?? null,
      data.sort_order ?? null,
      data.photo_id ?? null,
      data.notes ?? null,
    ]);

    const row = await dbGet<GardenZoneRow>(`
      SELECT id, user_id, garden_id, name, zone_type, width_feet, length_feet, sort_order, photo_id, notes, created_at, updated_at
      FROM garden_zones
      WHERE id = ?
    `, [zoneId]);
    if (!row) {
      throw new Error('Failed to retrieve created garden zone');
    }

    res.status(201).json(serializeGardenZone(row));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid zone data', { details: err.issues });
      return;
    }
    logger.error('Failed to create garden zone', err);
    sendJsonError(res, 500, 'Failed to create garden zone');
  }
});

app.get('/api/zones/:id', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const zoneId = idSchema.parse(req.params.id);
    const row = await dbGet<GardenZoneRow>(`
      SELECT id, user_id, garden_id, name, zone_type, width_feet, length_feet, sort_order, photo_id, notes, created_at, updated_at
      FROM garden_zones
      WHERE id = ? AND user_id = ?
    `, [zoneId, userId]);
    if (!row) {
      sendJsonError(res, 404, 'Zone not found');
      return;
    }

    res.json(serializeGardenZone(row));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid zone ID');
      return;
    }
    logger.error('Failed to fetch zone', err);
    sendJsonError(res, 500, 'Failed to fetch zone');
  }
});

app.put('/api/zones/:id', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const zoneId = idSchema.parse(req.params.id);
    const existing = await dbGet<{ id: string }>('SELECT id FROM garden_zones WHERE id = ? AND user_id = ?', [zoneId, userId]);
    if (!existing) {
      sendJsonError(res, 404, 'Zone not found');
      return;
    }

    const data = updateGardenZoneSchema.parse(req.body);
    await dbRun(`
      UPDATE garden_zones
      SET
        name = COALESCE(?, name),
        zone_type = COALESCE(?, zone_type),
        width_feet = COALESCE(?, width_feet),
        length_feet = COALESCE(?, length_feet),
        sort_order = COALESCE(?, sort_order),
        photo_id = COALESCE(?, photo_id),
        notes = COALESCE(?, notes),
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `, [
      data.name ?? null,
      data.zone_type ?? null,
      data.width_feet ?? null,
      data.length_feet ?? null,
      data.sort_order ?? null,
      data.photo_id ?? null,
      data.notes ?? null,
      zoneId,
      userId,
    ]);

    const row = await dbGet<GardenZoneRow>(`
      SELECT id, user_id, garden_id, name, zone_type, width_feet, length_feet, sort_order, photo_id, notes, created_at, updated_at
      FROM garden_zones
      WHERE id = ?
    `, [zoneId]);
    if (!row) {
      throw new Error('Failed to retrieve updated zone');
    }

    res.json(serializeGardenZone(row));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid zone update payload', { details: err.issues });
      return;
    }
    logger.error('Failed to update zone', err);
    sendJsonError(res, 500, 'Failed to update zone');
  }
});

app.delete('/api/zones/:id', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const zoneId = idSchema.parse(req.params.id);
    await dbRun('DELETE FROM garden_zones WHERE id = ? AND user_id = ?', [zoneId, userId]);
    res.status(204).send();
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid zone ID');
      return;
    }
    logger.error('Failed to delete zone', err);
    sendJsonError(res, 500, 'Failed to delete zone');
  }
});

app.get('/api/zones/:id/history', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const zoneId = idSchema.parse(req.params.id);
    const rows = await dbAll<PlantingRecordRow>(`
      SELECT
        id, user_id, plant_name_snapshot, species_snapshot, variety_snapshot, garden_id, zone_id, planted_at,
        removed_at, harvested_at, source_plant_id, outcome, season, year, created_at, updated_at
      FROM planting_records
      WHERE user_id = ? AND zone_id = ?
      ORDER BY planted_at DESC
    `, [userId, zoneId]);

    res.json(rows.map(serializePlantingRecord));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid zone ID');
      return;
    }
    logger.error('Failed to fetch zone history', err);
    sendJsonError(res, 500, 'Failed to fetch zone history');
  }
});

app.get('/api/zones/:id/observations', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const zoneId = idSchema.parse(req.params.id);
    const rows = await dbAll<ObservationRow>(`
      SELECT
        id, user_id, observation_type, text_content, image_data, thumbnail_data, audio_data, transcript,
        plant_id, garden_id, zone_id, planting_record_id, tags, observed_at, created_at, updated_at
      FROM observations
      WHERE user_id = ? AND zone_id = ?
      ORDER BY observed_at DESC
    `, [userId, zoneId]);

    res.json(rows.map(toObservationResponse));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid zone ID');
      return;
    }
    logger.error('Failed to fetch zone observations', err);
    sendJsonError(res, 500, 'Failed to fetch zone observations');
  }
});

app.get('/api/planting-records', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const gardenId = typeof req.query.garden_id === 'string' ? req.query.garden_id : undefined;
    const zoneId = typeof req.query.zone_id === 'string' ? req.query.zone_id : undefined;
    const sql = `
      SELECT
        id, user_id, plant_name_snapshot, species_snapshot, variety_snapshot, garden_id, zone_id, planted_at,
        removed_at, harvested_at, source_plant_id, outcome, season, year, created_at, updated_at
      FROM planting_records
      WHERE user_id = ?
        AND (? IS NULL OR garden_id = ?)
        AND (? IS NULL OR zone_id = ?)
      ORDER BY planted_at DESC
    `;
    const rows = await dbAll<PlantingRecordRow>(sql, [userId, gardenId ?? null, gardenId ?? null, zoneId ?? null, zoneId ?? null]);
    res.json(rows.map(serializePlantingRecord));
  } catch (err) {
    logger.error('Failed to fetch planting records', err);
    sendJsonError(res, 500, 'Failed to fetch planting records');
  }
});

app.post('/api/planting-records', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const data = createPlantingRecordSchema.parse(req.body);
    const recordId = randomUUID();
    await dbRun(`
      INSERT INTO planting_records (
        id, user_id, plant_name_snapshot, species_snapshot, variety_snapshot, garden_id, zone_id, planted_at,
        removed_at, harvested_at, source_plant_id, outcome, season, year
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      recordId,
      userId,
      data.plant_name_snapshot,
      data.species_snapshot ?? null,
      data.variety_snapshot ?? null,
      data.garden_id ?? null,
      data.zone_id ?? null,
      data.planted_at,
      data.removed_at ?? null,
      data.harvested_at ?? null,
      data.source_plant_id ?? null,
      data.outcome ?? null,
      data.season ?? null,
      data.year ?? null,
    ]);

    const row = await dbGet<PlantingRecordRow>(`
      SELECT
        id, user_id, plant_name_snapshot, species_snapshot, variety_snapshot, garden_id, zone_id, planted_at,
        removed_at, harvested_at, source_plant_id, outcome, season, year, created_at, updated_at
      FROM planting_records
      WHERE id = ?
    `, [recordId]);
    if (!row) {
      throw new Error('Failed to retrieve created planting record');
    }

    res.status(201).json(serializePlantingRecord(row));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid planting record data', { details: err.issues });
      return;
    }
    logger.error('Failed to create planting record', err);
    sendJsonError(res, 500, 'Failed to create planting record');
  }
});

app.put('/api/planting-records/:id', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const recordId = idSchema.parse(req.params.id);
    const data = updatePlantingRecordSchema.parse(req.body);
    await dbRun(`
      UPDATE planting_records
      SET
        plant_name_snapshot = COALESCE(?, plant_name_snapshot),
        species_snapshot = COALESCE(?, species_snapshot),
        variety_snapshot = COALESCE(?, variety_snapshot),
        garden_id = COALESCE(?, garden_id),
        zone_id = COALESCE(?, zone_id),
        planted_at = COALESCE(?, planted_at),
        removed_at = COALESCE(?, removed_at),
        harvested_at = COALESCE(?, harvested_at),
        source_plant_id = COALESCE(?, source_plant_id),
        outcome = COALESCE(?, outcome),
        season = COALESCE(?, season),
        year = COALESCE(?, year),
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `, [
      data.plant_name_snapshot ?? null,
      data.species_snapshot ?? null,
      data.variety_snapshot ?? null,
      data.garden_id ?? null,
      data.zone_id ?? null,
      data.planted_at ?? null,
      data.removed_at ?? null,
      data.harvested_at ?? null,
      data.source_plant_id ?? null,
      data.outcome ?? null,
      data.season ?? null,
      data.year ?? null,
      recordId,
      userId,
    ]);

    const row = await dbGet<PlantingRecordRow>(`
      SELECT
        id, user_id, plant_name_snapshot, species_snapshot, variety_snapshot, garden_id, zone_id, planted_at,
        removed_at, harvested_at, source_plant_id, outcome, season, year, created_at, updated_at
      FROM planting_records
      WHERE id = ? AND user_id = ?
    `, [recordId, userId]);
    if (!row) {
      sendJsonError(res, 404, 'Planting record not found');
      return;
    }

    res.json(serializePlantingRecord(row));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid planting record update payload', { details: err.issues });
      return;
    }
    logger.error('Failed to update planting record', err);
    sendJsonError(res, 500, 'Failed to update planting record');
  }
});

app.post('/api/observations', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const data = createObservationSchema.parse(req.body);
    const observationId = randomUUID();
    await dbRun(`
      INSERT INTO observations (
        id, user_id, observation_type, text_content, image_data, thumbnail_data, audio_data, transcript,
        plant_id, garden_id, zone_id, planting_record_id, tags, observed_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, datetime('now')))
    `, [
      observationId,
      userId,
      data.observation_type,
      data.text_content ?? null,
      data.image_data ?? null,
      data.thumbnail_data ?? null,
      data.audio_data ?? null,
      data.transcript ?? null,
      data.plant_id ?? null,
      data.garden_id ?? null,
      data.zone_id ?? null,
      data.planting_record_id ?? null,
      JSON.stringify(data.tags ?? []),
      data.observed_at ?? null,
    ]);

    const row = await dbGet<ObservationRow>(`
      SELECT
        id, user_id, observation_type, text_content, image_data, thumbnail_data, audio_data, transcript,
        plant_id, garden_id, zone_id, planting_record_id, tags, observed_at, created_at, updated_at
      FROM observations
      WHERE id = ?
    `, [observationId]);
    if (!row) {
      throw new Error('Failed to retrieve created observation');
    }
    res.status(201).json(toObservationResponse(row));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid observation data', { details: err.issues });
      return;
    }
    logger.error('Failed to create observation', err);
    sendJsonError(res, 500, 'Failed to create observation');
  }
});

app.get('/api/observations', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const plantId = typeof req.query.plant_id === 'string' ? req.query.plant_id : undefined;
    const gardenId = typeof req.query.garden_id === 'string' ? req.query.garden_id : undefined;
    const zoneId = typeof req.query.zone_id === 'string' ? req.query.zone_id : undefined;
    const rows = await dbAll<ObservationRow>(`
      SELECT
        id, user_id, observation_type, text_content, image_data, thumbnail_data, audio_data, transcript,
        plant_id, garden_id, zone_id, planting_record_id, tags, observed_at, created_at, updated_at
      FROM observations
      WHERE user_id = ?
        AND (? IS NULL OR plant_id = ?)
        AND (? IS NULL OR garden_id = ?)
        AND (? IS NULL OR zone_id = ?)
      ORDER BY observed_at DESC
    `, [
      userId,
      plantId ?? null, plantId ?? null,
      gardenId ?? null, gardenId ?? null,
      zoneId ?? null, zoneId ?? null,
    ]);
    res.json(rows.map(toObservationResponse));
  } catch (err) {
    logger.error('Failed to fetch observations', err);
    sendJsonError(res, 500, 'Failed to fetch observations');
  }
});

app.put('/api/observations/:id', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const observationId = idSchema.parse(req.params.id);
    const data = updateObservationSchema.parse(req.body);
    await dbRun(`
      UPDATE observations
      SET
        observation_type = COALESCE(?, observation_type),
        text_content = COALESCE(?, text_content),
        image_data = COALESCE(?, image_data),
        thumbnail_data = COALESCE(?, thumbnail_data),
        audio_data = COALESCE(?, audio_data),
        transcript = COALESCE(?, transcript),
        plant_id = COALESCE(?, plant_id),
        garden_id = COALESCE(?, garden_id),
        zone_id = COALESCE(?, zone_id),
        planting_record_id = COALESCE(?, planting_record_id),
        tags = COALESCE(?, tags),
        observed_at = COALESCE(?, observed_at),
        updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `, [
      data.observation_type ?? null,
      data.text_content ?? null,
      data.image_data ?? null,
      data.thumbnail_data ?? null,
      data.audio_data ?? null,
      data.transcript ?? null,
      data.plant_id ?? null,
      data.garden_id ?? null,
      data.zone_id ?? null,
      data.planting_record_id ?? null,
      data.tags ? JSON.stringify(data.tags) : null,
      data.observed_at ?? null,
      observationId,
      userId,
    ]);

    const row = await dbGet<ObservationRow>(`
      SELECT
        id, user_id, observation_type, text_content, image_data, thumbnail_data, audio_data, transcript,
        plant_id, garden_id, zone_id, planting_record_id, tags, observed_at, created_at, updated_at
      FROM observations
      WHERE id = ? AND user_id = ?
    `, [observationId, userId]);
    if (!row) {
      sendJsonError(res, 404, 'Observation not found');
      return;
    }
    res.json(toObservationResponse(row));
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid observation update payload', { details: err.issues });
      return;
    }
    logger.error('Failed to update observation', err);
    sendJsonError(res, 500, 'Failed to update observation');
  }
});

app.delete('/api/observations/:id', requireAuth, async (req, res) => {
  try {
    const userId = getRequiredAuthUserId(req, res);
    if (!userId) {
      return;
    }

    const observationId = idSchema.parse(req.params.id);
    await dbRun('DELETE FROM observations WHERE id = ? AND user_id = ?', [observationId, userId]);
    res.status(204).send();
  } catch (err) {
    if (err instanceof z.ZodError) {
      sendJsonError(res, 400, 'Invalid observation ID');
      return;
    }
    logger.error('Failed to delete observation', err);
    sendJsonError(res, 500, 'Failed to delete observation');
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
