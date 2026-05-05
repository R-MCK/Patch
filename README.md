# Patch - Gardening App

Patch is a cross-platform gardening application that helps users track plants, manage care schedules, browse a plant wiki, take notes, and design garden layouts.

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

This project is organized as an npm monorepo containing the following applications and packages:

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

## Development Setup

### Prerequisites
- Node.js 20+
- npm 10+
- iOS Simulator or Android Emulator (for mobile development)

### Quick Start

1. **Install Dependencies**
   From the root of the project, install all workspace dependencies:
   ```bash
   npm install
   ```

2. **Run the Backend**
   In a new terminal:
   ```bash
   npm --workspace backend run start
   ```

3. **Run the Web App**
   In a new terminal:
   ```bash
   npm --workspace web run dev
   ```

4. **Run the Mobile App**
   In a new terminal:
   ```bash
   npm --workspace mobile run start
   ```
   *Press `i` to open the iOS simulator, or `a` to open the Android emulator.*

## Architecture Notes

### Offline-First Mobile Sync
The mobile application (`apps/mobile`) uses `expo-sqlite` as its primary data store to provide instant, offline-capable UI interactions. 
Mutations optimistically update the local database, and a background sync engine handles bidirectional data flow with the Node.js backend.

### Shared Logic
We prioritize sharing logic via `packages/core` and `packages/api` before attempting to share UI code. Platform-specific UI code ensures the Web application and Mobile applications feel native to their respective platforms.
