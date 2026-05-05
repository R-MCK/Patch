# Patch - Gardening App

## Project Overview

Patch is a cross-platform gardening application built with React Native (Expo) and React (Vite). It helps users track plants, manage care schedules, browse a plant wiki, take notes, and design garden layouts.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Workspace | npm Workspaces |
| Web App | React, Vite, Tailwind CSS |
| Mobile App | React Native, Expo, Expo Router |
| UI Components | Radix UI (Web), Custom Views (Mobile) |
| Data Layer | SQLite (Mobile Offline), SQLite (Backend) |
| Backend | Node.js, Express, Zod |

## Project Structure

The repository is organized as a monorepo with the following workspace packages:

```
Patch/
├── apps/
│   ├── backend/             # Node.js Express API and SQLite database
│   ├── mobile/              # Expo React Native iOS/Android application
│   └── web/                 # React Vite web application
└── packages/
    ├── api/                 # Shared API client for web and mobile
    └── core/                # Shared domain types, validation, and design tokens
```

## Shared Packages

### `@patch/core`
Contains universal types and logic shared across all parts of the application:
- **Models**: `Plant`, `Garden`, `CareTask`, `WikiEntry`
- **Mappers**: Translation layers from backend DB models to domain entities
- **Design**: Shared design tokens (`patchColors`, `patchSpacing`)
- **Logic**: Care schedule calculators (`isDueToday`, `isOverdue`)

### `@patch/api`
A strongly typed API client wrapper used by both the Web and Mobile applications to interact with the backend API.

## Core Data Entities

### Plant
- `id`: UUID (required)
- `name`: String (required)
- `species`: String (optional)
- `variety`: String (optional)
- `plantingDate`: Date (optional)
- `location`: String (optional)
- `healthStatus`: String (Excellent/Good/Fair/Poor/Critical)
- `growthStage`: String (Seedling/Vegetative/Flowering/Fruiting/Dormant/Harvesting)

### Garden
- `id`: UUID (required)
- `name`: String (required)
- `gardenType`: String (Raised Bed/In-Ground/Container/Greenhouse/Hydroponic)
- `width`, `length`: Double (dimensions in feet)
- `climateZone`: String (optional)
- `soilType`: String (optional)

### CareTask
- `id`: UUID (required)
- `taskType`: String (Watering/Fertilizing/Pruning/Pest Control/Harvesting/etc.)
- `scheduledDate`: Date (required)
- `completedDate`: Date (optional)
- `isRecurring`: Bool
- `frequency`: String (Daily/Weekly/Biweekly/Monthly)

### WikiEntry
- `id`: UUID (required)
- `commonName`: String (required)
- `scientificName`: String (optional)
- `category`: String (Vegetables/Herbs/Flowers/Fruits/Houseplants/Succulents)
- `entryDescription`: String (required)

## Development Setup

### Prerequisites
- Node.js 20+
- npm 10+
- iOS Simulator or Android Emulator (for mobile)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Patch
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Run Backend**
   ```bash
   npm --workspace backend run start
   ```

4. **Run Web App**
   ```bash
   npm --workspace web run dev
   ```

5. **Run Mobile App**
   ```bash
   npm --workspace mobile run ios
   ```

## Architecture Guidelines

### Offline-First Mobile Sync
The mobile application uses `expo-sqlite` as its primary data store to provide instant, offline-capable UI interactions.
1. The `usePatchData` hook reads purely from the local SQLite database.
2. Any mutations (e.g. `createPlant`) optimistically update the local database with a `pending_create` sync status.
3. A background sync engine (`mobile/src/data/sync.ts`) automatically triggers to push local changes and pull the latest state from the backend.

### Shared Logic Before UI
We prioritize sharing logic via `packages/core` and `packages/api` before attempting to share UI code. Platform-specific UI code ensures the Web application and Mobile applications feel native to their respective platforms.

## Testing

Type checking is our primary defense. Before committing code, verify types across the entire workspace:

```bash
# Typecheck Web
npm --workspace web run typecheck

# Typecheck Mobile
npm --workspace mobile run typecheck

# Typecheck Core & API
npm --workspace packages/core run typecheck
npm --workspace packages/api run typecheck
```

## Common Commands

```bash
# Install packages in specific workspace
npm install <package> --workspace <workspace-name>

# Start all environments
# Open multiple terminals and run backend, web, and mobile simultaneously.
```
