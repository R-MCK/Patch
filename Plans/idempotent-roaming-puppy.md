# Patch Codebase Fix Plan

## Context

The Patch codebase review (2026-03-19) identified 22 issues across iOS, backend, and web — 4 critical, 7 high, 5 medium, and 6 low/quality. This plan organizes those fixes into 4 sequential phases. Within each phase, agents run in parallel on non-overlapping file scopes, using worktree isolation to prevent conflicts. Phases are ordered by risk: crash/security first, then thread safety, then error handling UX, then code quality.

---

## Phase 1 — Critical: Crash & Security (3 parallel agents)

**Goal:** Eliminate all crash risks and close the most obvious security gaps.

### Agent 1A — iOS Crash Fixes
**Files:** `Patch/ViewModels/CareTasks/CareTaskListViewModel.swift`, `Patch/ViewModels/CareTasks/CareHistoryViewModel.swift`, `Patch/Views/Wiki/WikiEntryDetailView.swift`

**Tasks:**
- `CareTaskListViewModel.swift:91-92` — Replace `calendar.date(...)!` force unwraps with `guard let`; set `errorMessage` on nil
- `CareHistoryViewModel.swift:173,182,228,260` — Same pattern for all 4 force unwraps
- `WikiEntryDetailView.swift:309` — Replace `URL(string: "patch://wiki/search")!` fallback with a safe URL or `URL(fileURLWithPath: "/")`

**Verify:** `xcodebuild build -scheme Patch -project Patch.xcodeproj -destination 'platform=iOS Simulator,name=iPhone 17'` — zero errors

---

### Agent 1B — Backend Security
**Files:** `backend/src/index.ts`

**Tasks:**
- Line 9: Replace `app.use(cors())` with `app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'] }))`
- Line 37: Replace `Math.random().toString(36).substring(7)` with `crypto.randomUUID()`
- Add a simple `requireAuth` middleware that checks for `Authorization: Bearer <token>` header; apply to `POST /api/plants/:id/water`; use an env var `API_TOKEN` for dev; skip check if `NODE_ENV === 'development'` and no token configured (so iOS Simulator dev flow isn't broken)

**Verify:** `cd backend && bun run src/index.ts` starts without error; `curl -X POST http://localhost:3000/api/plants/1/water` returns 401 when token not set in prod mode

---

### Agent 1C — Web Route Guards
**Files:** `web/src/App.tsx`, `web/src/components/ProtectedRoute.tsx` (new)

**Tasks:**
- Create `web/src/components/ProtectedRoute.tsx`:
  ```tsx
  import { Navigate, Outlet } from 'react-router-dom'
  import { useAuthStore } from '@/stores/authStore'
  export function ProtectedRoute() {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
  }
  ```
- In `web/src/App.tsx`: wrap all non-auth routes (`/`, `/plants/*`, `/gardens/*`, `/wiki/*`, `/profile`) inside a single `<Route element={<ProtectedRoute />}>` parent; remove the manual redirect in `Profile.tsx`

**Verify:** `cd web && bun run build` — zero TS errors; navigating to `/plants` while logged out redirects to `/login`

---

## Phase 2 — High: Thread Safety & Validation (2 parallel agents)

**Goal:** Fix data race potential in iOS repositories; add server-side validation.
Runs after Phase 1 is merged.

### Agent 2A — iOS @MainActor + Background Context
**Files:** `Patch/Services/Repositories/PlantRepository.swift`, `CareTaskRepository.swift`, `GardenRepository.swift`, `PhotoRepository.swift`, `NoteRepository.swift`, `WikiRepository.swift`

**Tasks:**
- Add `@MainActor` to each repository class declaration (does NOT change call sites — Swift infers the constraint)
- In each `fetchAll()` / fetch method: wrap `context.fetch()` in `context.perform { }` using a background context from `PersistenceController.shared.container.newBackgroundContext()`
- Return fetched objects by objectID and re-fetch on main context to avoid threading violations

**Verify:** Build passes; no new SwiftLint warnings

---

### Agent 2B — Backend Input Validation + Pagination
**Files:** `backend/src/index.ts`, `backend/src/db.ts`

**Tasks:**
- Install Zod: `bun add zod`
- Add param validation for `:id` routes — reject non-string or empty IDs with 400
- `GET /api/plants`: add `?limit=20&offset=0` query params with defaults; update SQL to `SELECT * FROM plants LIMIT ? OFFSET ?`
- Add `GET /api/plants/:id` single-plant endpoint (currently missing)

**Verify:** `bun run src/index.ts`; `curl 'http://localhost:3000/api/plants?limit=2&offset=0'` returns array; invalid ID returns 400

---

## Phase 3 — Medium: Error Handling & UX (2 parallel agents)

**Goal:** Surface errors to users instead of silently swallowing them.
Runs after Phase 2 is merged.

### Agent 3A — iOS Repository Error Propagation
**Files:** All 6 repository files + their corresponding ViewModels

**Tasks:**
- Add `@Published var errorMessage: String?` to each repository
- In each `catch` block: set `self.errorMessage = error.localizedDescription` instead of only printing
- In ViewModels that expose a plant/task/garden list: observe `repository.$errorMessage` and forward to a `@Published var errorMessage` on the ViewModel
- Spot-check one view (e.g., `PlantListView`) to confirm error can surface — add a `.alert` if not present

**Verify:** Build passes; intentionally corrupt a fetch call and confirm `errorMessage` is non-nil

---

### Agent 3B — Web Error Handling + UX
**Files:** `web/src/App.tsx`, `web/src/components/ErrorBoundary.tsx` (new), `web/src/pages/plants/PlantList.tsx`, `web/src/stores/plantStore.ts`

**Tasks:**
- Create `web/src/components/ErrorBoundary.tsx` (class component with `componentDidCatch`, fallback UI)
- Wrap `<RouterProvider>` or the route tree in `<ErrorBoundary>` in `App.tsx`
- `plantStore.ts:69`: replace `catch (e: any)` with `catch (e) { set({ error: e instanceof Error ? e.message : String(e), isLoading: false }) }`
- `PlantList.tsx`: render loading skeleton when `isLoading === true`; render error banner when `error` is set; add `fetchPlants` to `useEffect` deps array

**Verify:** `bun run build` — zero errors; in browser, triggering a fetch error shows error message instead of blank list

---

## Phase 4 — Quality: Code Cleanup (3 parallel agents)

**Goal:** Clean up logging, type safety, and dead code.
Can run after Phase 3, or skipped if time-constrained.

### Agent 4A — iOS Logging + Dead Code
**Files:** All 6 repository files, `WikiEntryDetailView.swift`, `CareTaskListViewModel.swift`

**Tasks:**
- Replace every `print(...)` in repository files with `os_log(...)` using `Logger(subsystem: "com.patch", category: "repository")`
- Extract `GrowthMetricTracker` struct from `WikiEntryDetailView.swift:348-366` → `Patch/Services/GrowthMetricTracker.swift`
- Extract `ActivityShareSheet` from `WikiEntryDetailView.swift:333-346` → `Patch/Views/Components/ActivityShareSheet.swift`
- `CareTaskListViewModel.swift:99-129`: extract duplicate filter blocks into `private func applyFilters(to tasks: [CareTask]) -> [CareTask]`

**Verify:** Build + `swiftlint` — zero violations

---

### Agent 4B — Web Type Safety
**Files:** `web/src/pages/plants/PlantForm.tsx`, `web/src/pages/gardens/GardenForm.tsx`, `web/src/stores/plantStore.ts`

**Tasks:**
- `PlantForm.tsx:85-87`: replace `as any` casts with explicit enum validation against `HealthStatus` and `GrowthStage` types
- `PlantForm.tsx`: disable submit button and show spinner while `isLoading` is true in plant store
- `GardenForm.tsx`: add required field check — reject empty `name`; trim whitespace
- `plantStore.ts:53`: type the `.map()` callback with a `DbPlant` interface matching the DB schema

**Verify:** `bun run lint` and `bun run build` — zero TS errors or ESLint warnings

---

### Agent 4C — Backend TypeScript
**Files:** `backend/src/db.ts`, `backend/src/index.ts`

**Tasks:**
- `db.ts`: replace `any` return types on `dbRun`/`dbGet`/`dbAll` with generics: `dbAll<T>(sql, params?): Promise<T[]>`
- `index.ts`: replace `console.log(...)` / `console.error(...)` with a simple logger wrapper (timestamps + level prefix)
- Add a `Plant` and `CareTask` interface in a new `backend/src/types.ts`; use them in route handlers

**Verify:** `bun tsc --noEmit` — zero errors

---

## Execution Order

```
Phase 1 (parallel): Agent 1A + 1B + 1C  →  merge all 3
Phase 2 (parallel): Agent 2A + 2B        →  merge both
Phase 3 (parallel): Agent 3A + 3B        →  merge both
Phase 4 (parallel): Agent 4A + 4B + 4C  →  merge all 3
```

Each phase runs only after the previous phase's merges are clean. Each agent in a phase runs in its own worktree to avoid conflicts.

---

## Verification (end-to-end)

After all phases:
1. `xcodebuild build -scheme Patch -project Patch.xcodeproj -destination 'platform=iOS Simulator,name=iPhone 17'` — 0 errors
2. `swiftlint` from repo root — 0 violations
3. `cd backend && bun tsc --noEmit` — 0 errors
4. `cd web && bun run build` — 0 errors, 0 TS errors
5. `cd web && bun run lint` — 0 ESLint warnings
