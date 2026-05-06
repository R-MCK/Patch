# Web Implementation Plan v2 — Almanac Aesthetic + Milestones A & B

Supersedes the 6-phase plan drafted 2026-05-05 after critique + verification surfaced
that (a) packages and redesign pages already exist, (b) the existing redesign is an
"almanac field-journal" aesthetic, not the frosted-glass cottage aesthetic the prior
plan also described, and (c) `apps/backend/package.json` has uncommitted dep changes
already installed in `package-lock.json`.

## Aesthetic decision (locked)

**Almanac field-journal** — opaque paper backdrop, washi tape, dotted rules, drop
caps, hand-script accents, terracotta / moss / honey / ink palette. The existing
`apps/web/src/redesign/cottage.css` and 7 pages are the reference fidelity. No
frosted glass, no `bg-white/70 backdrop-blur-md`, no `--cottage-overdue`-style tokens
from the prior plan. Vocabulary: `paper / cream / ink / moss / terracotta / honey /
sage-soft / washi / stamp / dotted-rule`.

## Verified starting state

- `packages/core` and `packages/api` exist with real implementations.
  - `packages/core/src/`: `index.ts`, `types.ts`, `plant.ts`, `care.ts`, `tokens.ts`, `mappers.ts`.
  - `packages/api/src/patchApiClient.ts` is 281 lines.
- All 7 redesign pages exist (126–267 lines each) using almanac aesthetic against
  static `PLANTS` data.
- `cottage.css` loaded in `main.tsx`; `body[data-palette='cottage']` and
  `body[data-density='airy']` are wired.
- Mobile imports `@patch/core` types/functions/constants and `@patch/api`
  `PatchApiClient` across 13 files. Any core/api change must keep mobile compiling.
- MCP server (`apps/backend/src/mcp-server.ts`) is stdio-only; auth swap doesn't
  touch it.
- No iOS code in this repo. No seed scripts. Only auth callers: web + mobile via
  `PatchApiClient` getAuthToken callback.
- Working tree uncommitted:
  - `apps/web/src/redesign/` (untracked, full redesign).
  - `apps/web/src/App.tsx` (62→31 lines: removed `<ProtectedRoute>`, `<Layout>`, all
    auth pages, all original feature pages; routes redesign pages directly).
  - `apps/web/src/main.tsx` (adds cottage.css import + body-attribute wiring).
  - `apps/backend/package.json`: sqlite3 `^5.1.7 → ^6.0.1` (major upgrade) and
    `@modelcontextprotocol/sdk ^1.26.0 → ^1.25.3` (downgrade) — both already
    installed in `package-lock.json`.

## Open decisions (gate Phase 0)

1. **sqlite3 v6 upgrade:** keep + audit, or revert to 5.1.7?
2. **mcp-sdk downgrade:** revert to 1.26.0?
3. **App.tsx Phase 0 strategy:** re-add `<ProtectedRoute>` + `<Layout>` shell now and
   route redesign pages inside it, OR commit redesign-only `App.tsx` and rebuild
   auth shell in Phase 4?
4. **`/today` as new `/` default in Phase 5, or alongside `DashboardMap`?**
5. **GardenDesigner canvas drawing engine:** in scope for Phase 3, or descope to a
   separate phase between 3 and 4?

---

## Phase 0 — Stabilize

**Tasks:**
- Resolve the five open decisions above.
- Add `bun run typecheck` for `apps/mobile` to phase exit criteria so core/api
  changes don't silently break mobile.
- Verify `npm --workspace web run build` is green from a clean checkout.
- Commit the redesign directory + `cottage.css` + `main.tsx` palette wiring as the
  new baseline.

**Out of scope:** creating packages (done), stubbing pages (done), creating
cottage.css (done).

---

## Phase 1 — Extract Almanac Primitives

Pull the inline patterns from the existing 7 pages into shared components in
`apps/web/src/redesign/components/`. Each primitive derived from real usage, not
designed from scratch.

**Primitives:**
- `PaperBackdrop.tsx` — wrap the `paper-bg` + noise texture pattern every page inlines.
- `AlmanacLayout.tsx` — page shell: `PaperBackdrop` + sidebar + header. Replaces
  inlined `<div className="paper-bg">` shells.
- `HeroCard.tsx` — derive from PlantSpread + PlantTrackerPackets opening blocks.
  Title, subtitle, optional stats row, optional trailing action. Existing
  `book-frame` / `drop-cap` / `hand-underline` accents as opt-in props.
- `SectionHeader.tsx` — replace every inline `<h2>` + `dotted-rule`. Title +
  subtitle + optional eyebrow.
- `SummaryStat.tsx` — extract the four-up stat tile pattern from DashboardAlmanac
  and PlantTrackerPackets.
- `PaperCard.tsx` — codify `card-paper` + `lift` / `packet-lift` hover.
- `LabeledIconButton.tsx` — wrap `btn-primary` / `btn-ghost` with mandatory text
  label slot.
- `EmptyState.tsx` — botanical illustration (`PlantArt` / `glyphs`) + title + body
  + CTA.
- `OverdueBadge.tsx`, `UrgencyBadge.tsx`, `WeatherChip.tsx` — small molecules using
  existing terracotta/sky tokens; **add** `--ink-overdue` / `--ink-overdue-soft`
  tokens to `cottage.css` if not present.
- `CapturePill.tsx` — visual-only this phase; floating bottom-right; styled as a
  wax-stamp / washi-tab.

**Token cleanup:**
- Add spacing scale `--space-{xs,sm,md,lg,xl,2xl}` to `cottage.css`.
- Add radius scale `--radius-{sm,md,lg,xl}`.
- Wire `body[data-density='airy']` to widen spacing.
- **Optional:** extend `tailwind.config.js` with `cottage` color keys mapped to CSS
  vars only if it eases consumption; skip if it adds drift.

**Verify:** every existing page renders identically after switching to primitives
(visual diff, screenshot compare).

---

## Phase 2 — Refit existing pages onto primitives + wire stores (REVISE list)

After Phase 1. These three pages are close to intent and need primitive consumption
+ real data.

- **PlantTrackerPackets:** replace inline header with `HeroCard`; stat tiles with
  `SummaryStat`; swap `PLANTS` for `usePlantStore.fetchPlants()`; add
  `UrgencyBadge` (overdue task lookup) + garden chip (from `useGardenStore`);
  preserve `packet-lift`.
- **PlantTrackerLedger:** wrap in `AlmanacLayout`; sticky header via primitive;
  real sort handlers; wire store; same overdue / garden chip enrichment.
- **PlantSpread:** wrap in `AlmanacLayout`; opening block becomes `HeroCard` +
  section list of `SectionHeader` blocks (Care Schedule / Notes & Photos /
  Wiki Reference); single `LabeledIconButton` row replaces inline buttons; wire
  `usePlantStore.getPlant(id)` + tasks via `@patch/api`.

---

## Phase 3 — Rebuild divergent pages onto primitives (REWRITE list)

Parallel with Phase 2 only after `App.tsx` routing contract is frozen at end of
Phase 1.

- **DashboardMap:** replace SVG plot composition with `HeroCard` (greeting +
  season + `WeatherChip`) + grid of `PaperCard`s per Garden (thumbnail, plant
  count, overdue count). Click-through to `PlantSpread` filtered by garden.
  `CapturePill` mounted.
- **DashboardAlmanac:** month strip across top; per-month `SectionHeader` blocks
  listing planting / harvest / care milestones from `Plant.planting_date` +
  `CareTask` history; `EmptyState` directs to capture.
- **DashboardSeasons:** four `PaperCard`s — Spring / Summer / Fall / Winter — each
  showing what's in season / plant now / harvest. Pre-Phase-5 fallback: hardcode
  Northern hemisphere with TODO copy.
- **GardenDesigner:** wrap canvas in `AlmanacLayout` + `HeroCard` (garden name +
  dimensions); side panel uses `SectionHeader` rhythm. **Real canvas drawing
  engine still needs building** — current `placed[]` is static SVG. Either scope
  a drawing engine into this phase or descope to "view-only" until a separate
  canvas phase (decision 5).

---

## Phase 4 — Real Auth + Protected Routes

Smaller than original plan because blast radius is just web + mobile via
`PatchApiClient`.

- Backend: `users` table; `POST /api/auth/register`, `POST /api/auth/login`,
  `GET /api/auth/me`; bcrypt + JWT; **transition window** where `requireAuth`
  accepts both shared-secret AND JWT, gated by env, until mobile is migrated.
- **Refresh token from day one:** short-lived access (15 min) + httpOnly refresh
  cookie + `/api/auth/refresh` + 401-retry-once interceptor in `PatchApiClient`.
- `@patch/api` adds `register / login / me / refresh`. Existing `getAuthToken`
  callback stays.
- `apps/web/src/stores/authStore.ts`: real client wiring, persist token in
  localStorage, restore via `me` on boot.
- Restore `<ProtectedRoute />` + auth pages in cottage layout (Login / Register
  skinned to almanac).
- Migrate mobile's `PatchApiClient` construction in lockstep, then remove
  shared-secret acceptance.

---

## Phase 5 — Milestone A on Web

**Critical sequencing change:** Phase 5 writes directly to `observations`
(introduced in Phase 6a schema), skipping `notes` / `photos` tables entirely.
**Phase 6a's schema lands first**, even though feature work happens in Phase 5.

- Backend: `user_profiles` table; `GET / PUT /api/profile`. **Skip** `notes` /
  `photos` tables.
- `@patch/core` types: `UserProfile`, `Observation`, `ObservationType`.
- `@patch/api`: profile CRUD + observation CRUD.
- Pages: `Today.tsx` (Overdue / Due today / Recent activity / Weather chip /
  Seasonal nudges), `Capture.tsx` (modal: photo / note / voice-stub /
  task-complete; writes observations), `Ask.tsx` (shell only), `Plan.tsx` (links
  to Designer + Almanac), `Onboarding.tsx` (first-launch profile capture).
- `SeasonService.ts` in `@patch/core` (pure function, runs in DOM and RN).
- Routing: `/today`, `/capture`, `/ask`, `/plan`, `/onboarding`. Decision 4
  determines whether `/today` becomes `/` default.

---

## Phase 6 — Milestone B (split 6a / 6b)

Never combine schema unification with destructive table drops.

**Phase 6a (lands before Phase 5):** non-destructive schema introduction.
- Add `garden_zones`, `planting_records`, `observations` tables.
- CRUD routes per entity.
- Types in `@patch/core`, methods in `@patch/api`.
- New `ZoneDetail.tsx` page.
- `GardenDesigner` extended for zone overlays (decoupled from canvas drawing
  engine — zones first, drawing later).

**Phase 6b (lands after a release of soak time):** destructive cleanup. Skipped
entirely if Phase 5 successfully writes straight to `observations` and
`notes` / `photos` tables were never created. If they exist for legacy reasons:
- Pre-migration `VACUUM INTO backup.db`.
- `INSERT...SELECT` notes+photos → observations with `pragma integrity_check` +
  row-count parity assertion.
- Drop old tables only after one production release where dual-write proved
  equivalent.

---

## Sequencing

```
Phase 0 (decisions + stabilize)
    ↓
Phase 1 (extract primitives)
    ↓
Phase 2 (refit) ─┐
                 ├→ Phase 4 (auth)
Phase 3 (rebuild)┘     ↓
                  Phase 6a (schema only)
                       ↓
                  Phase 5 (Milestone A on observations)
                       ↓
                  Phase 6b (cleanup, optional)
```

---

## Cross-phase verification

After each phase merges:

1. `npm install` from repo root.
2. `npm --workspace web run build` — zero TS errors.
3. `npm --workspace web run lint` — zero ESLint warnings.
4. `npm run packages:check` — both shared packages typecheck.
5. `bun run typecheck` for `apps/mobile` — mobile still compiles.
6. `npm --workspace web run dev`, click through every route added in the phase.

After Phase 6a merges, web supports the full Milestone A + B feature surface in
the almanac design language, backed by real auth and real backend data.
