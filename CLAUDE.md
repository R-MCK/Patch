# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Patch is a gardening app with three components:
- **iOS app** (`Patch/`) — SwiftUI + Core Data + CloudKit, iOS 17+, Swift 5.9, MVVM
- **Backend** (`backend/`) — Bun/TypeScript, Express REST API + MCP server, SQLite
- **Web** (`web/`) — React 19 + Vite + Tailwind CSS + Zustand + React Router

## Commands

### iOS App
```bash
# Build (command line)
xcodebuild build -scheme Patch -destination 'platform=iOS Simulator,name=iPhone 15'

# Run tests
xcodebuild test -scheme Patch -destination 'platform=iOS Simulator,name=iPhone 15'

# Lint
swiftlint

# Auto-fix lint issues
swiftlint --fix

# Regenerate Xcode project from project.yml
xcodegen generate
```

Open in Xcode: `open Patch.xcodeproj`

### Backend (`cd backend`)
```bash
bun install
bun run src/index.ts        # Start REST API (port 3000) + MCP server
bun test                    # Run tests
```
**Important:** Use `bun` — not `node`, `npm`, or `npx`. See `backend/CLAUDE.md` for full Bun API rules.

### Web (`cd web`)
```bash
bun install
bun run dev       # Dev server (Vite)
bun run build     # Production build
bun run lint      # ESLint
```

## Architecture

### iOS (MVVM)
- `Patch/Models/` — Core Data entities (`Plant`, `Garden`, `CareTask`, `Note`, `Photo`, `WikiEntry`, `GardenDesign`). Each entity has `+CoreDataClass.swift` and `+CoreDataProperties.swift`.
- `Patch/Services/Repositories/` — One repository per entity. All data access goes through these (not directly through NSManagedObjectContext).
- `Patch/Services/PersistenceController.swift` — Core Data stack with `NSPersistentCloudKitContainer`. CloudKit container: `iCloud.com.patch.gardening` (requires paid Apple Developer account; disabled in personal team config).
- `Patch/ViewModels/` — `@ObservableObject` classes, grouped by feature (Plants, Gardens, CareTasks, Wiki, Photos).
- `Patch/Views/` — SwiftUI views, grouped by feature. `Views/Components/` has reusable primitives (Buttons, Badges, Cards, Inputs, Images, StatusPickers, States).
- `Patch/Utils/AppTheme.swift` — Centralized design tokens (colors, fonts, spacing).

### Backend
- `backend/src/index.ts` — Express server with REST endpoints (`/api/plants`, `/api/plants/:id/tasks`, `/api/plants/:id/water`, etc.)
- `backend/src/db.ts` — SQLite helpers (`dbAll`, `dbRun`, `initDatabase`)
- `backend/src/mcp-server.ts` — MCP server (runs concurrently with REST API)
- `backend/patch.db` — SQLite database file

### Web
- `web/src/App.tsx` — Route definitions. Auth routes (`/login`, `/register`) render without layout; all other routes use `Layout`.
- `web/src/stores/` — Zustand state
- `web/src/pages/` — Route-level components (plants, wiki, gardens, auth)
- `web/src/components/` — Shared UI components

## Key Conventions

### Swift/iOS
- `@StateObject` for ViewModels owned by the view; `@ObservedObject` for passed-in ViewModels
- `@Binding` for two-way data flow between parent/child views
- Use `os_log` instead of `print` (SwiftLint enforces this)
- `force_unwrapping` and `force_cast` are warnings — avoid them
- `trailing_comma` is mandatory in Swift collections

### Backend
- Use Bun native APIs (`Bun.file`, `bun:sqlite`) where available; only use Express/sqlite3 for what's already established
- The backend currently uses Express + sqlite3 (not Bun's native equivalents) — don't swap them out unless asked

### Web
- Path alias `@/` maps to `web/src/`
- Component library: Radix UI primitives + class-variance-authority + tailwind-merge
