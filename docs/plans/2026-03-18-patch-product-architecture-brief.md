# Patch Product Architecture Brief

Date: 2026-03-18
Status: Reviewed (2026-03-18)
Scope: Product direction, domain architecture, and phased delivery plan for Patch

## North Star

Patch should become the gardening companion you can take into the garden and use immediately, with memory.

That means the product must:
- help people record what they planted, where, when, and how it performed
- remember garden context so users do not need to repeat location and profile details
- make planning and seasonal history visible and useful
- support social sharing without compromising core gardening utility

The intended feel is not garden-management software. It is a field-ready garden notebook, planner, and assistant.

## Product Principles

### Garden First

The primary context is the user in their garden, not the database. The product should open into what matters right now in the garden.

### Capture First

Users should be able to log activity in under 10 seconds. Photos, quick notes, voice capture, and task completion matter more than perfect metadata at entry time.

### Memory Is the Differentiator

Patch becomes defensible when it can answer:
- What did I plant here last year?
- How did it do?
- What should I plant here next?
- Is this spacing or timing sensible for my location?

### Context Should Be Remembered

The app should remember profile, area, garden structure, units, and seasonal assumptions. The assistant should use known context before asking follow-up questions.

### Accessible Simplicity

This product must work for broad age ranges and low technical confidence. Outdoor use, bright sunlight, interrupted attention, and one-handed use are default conditions.

### Social Is Optional and Secondary

Social features should amplify gardening outcomes, not define the product before the personal garden workflow is strong.

## Product Pillars

1. Fast field capture
2. Garden memory
3. Context-aware advice
4. Spatial planning
5. Accessible usability
6. Optional social gardening

## Platform Strategy

Patch has three platform surfaces. Their roles are distinct and not all will evolve at the same pace.

### iOS App (Primary)

The iOS app is the primary product surface. It is the field-ready companion — the thing you take into the garden. All new domain entities and features land here first.

Stack: SwiftUI, Core Data, CloudKit (when paid developer account is active).

### Backend (Shared Services)

The backend provides shared data services that are not device-local: wiki content, user authentication, and eventually cross-device sync. It is not a source of truth for garden data — the iOS app's Core Data store is authoritative.

Stack: Bun, TypeScript, Express, SQLite. Evolves toward: authentication, wiki API, optional sync endpoint.

Current state: minimal — 3 REST endpoints (GET plants, GET tasks, POST water), 2 MCP tools. The backend should grow to support the web app's needs but should not dictate the iOS data model.

### Web App (Secondary)

The web app serves two purposes: (1) dashboard and review experience for users at a desk, and (2) a share target for social features in later phases. It is not a field tool. It does not need capture or voice features.

Stack: React 19, Vite, Tailwind, Zustand.

Current state: mostly mock data, only plant fetching is real. The web app should track behind iOS by at least one phase.

### Cross-Platform Data Rules

- iOS Core Data is the authoritative store for all garden data
- The backend stores shared reference data (wiki, auth) and acts as a sync relay when cross-device sync is needed
- The web app reads from the backend, never directly from Core Data
- New domain entities (UserProfile, GardenZone, PlantingRecord, Observation) are modeled in Core Data first, then replicated to backend schema when the web app needs them
- CloudKit handles device-to-device sync for iOS. Backend sync is a separate, later concern
- Sync conflicts resolve in favor of the most recent write with user-facing merge for destructive conflicts

## Target Experience

The app should feel like a garden companion home with four dominant actions:
- Today
- Capture
- Ask
- Plan

Everything else should support those actions.

Core v1 interaction goals:
- open app and immediately understand what matters now
- add a plant, photo, note, or task with minimal typing
- review a garden and its recent activity quickly
- retrieve simple history without browsing raw records

### Today View Definition

The Today view is the default home screen. It answers "what matters right now in my garden?" without requiring navigation. Content is assembled from stored facts, sorted by urgency.

Content blocks, in priority order:

1. **Overdue tasks** — care tasks past their scheduled date, grouped by plant. Red urgency. Tap to complete.
2. **Due today** — care tasks scheduled for today. Primary action surface.
3. **Recent activity** — photos, notes, and observations from the last 7 days. Scrollable timeline strip.
4. **Weather context** — current conditions and short forecast for the user's location (requires UserProfile). Informational, not actionable.
5. **Seasonal nudges** — derived suggestions based on region, time of year, and what's planted. Examples: "Time to start hardening off seedlings," "Check tomatoes for blight." Appears only when relevant data exists.
6. **Quick capture button** — persistent floating action. Opens the capture flow (photo, note, voice, task completion).

Progressive availability by phase:

| Block | Phase 0 (launch) | Phase 2 (UserProfile) | Phase 3 (Milestone B) |
|-------|------------------|-----------------------|-----------------------|
| Overdue tasks | Available — uses existing CareTask data | Available | Available |
| Due today | Available — uses existing CareTask data | Available | Available |
| Recent activity | Available — shows recent Notes and Photos (legacy entities) | Available | Shows Observations (unified entity) |
| Weather context | Hidden — no location data | Available — uses UserProfile location | Available |
| Seasonal nudges | Hidden — no profile or season derivation | Available — basic nudges from region + date | Richer — uses zone history and planting records |
| Quick capture | Available — creates Note or Photo (legacy entities) | Available | Creates Observation (unified entity) |

The Today view should show useful content from day one (overdue/due tasks, recent activity) and grow richer as UserProfile and history data accumulate. It must never show an empty state — if no tasks or activity exist, it should guide toward first capture.

Longer-term interaction goals:
- ask a voice-first assistant about a specific area of the garden
- compare planned versus actual plantings
- use history and local context to inform next steps

## Domain Architecture

The current app already has useful core entities:
- `Plant`
- `Garden`
- `CareTask`
- `Note`
- `Photo`
- `WikiEntry`
- `GardenDesign`

Those are necessary but not sufficient for the intended product. The missing layer is structured context and history.

### New First-Class Entities

#### UserProfile

Purpose:
- persist gardening context once instead of re-asking every session

Suggested fields:
- country
- region
- local area or postcode-level descriptor
- preferred units
- gardening experience level
- gardening goals
- growing assumptions or climate notes
- optional household or family gardening context

#### GardenZone

Purpose:
- represent named subdivisions of a garden that serve as the anchor for location-specific history

A GardenZone is a logical container, not a spatial primitive. It represents "the raised bed by the shed" or "herb corner" — a place the user names and refers to. Spatial coordinates are not required and belong to the design layer when needed.

Suggested fields:
- `id`
- `garden` — parent Garden reference
- `name` — user-assigned label
- `zoneType` — raised bed, in-ground bed, border, container group, greenhouse section, cold frame, other
- `widthFeet` — optional, for spacing calculations
- `lengthFeet` — optional, for spacing calculations
- `sortOrder` — display ordering within the garden
- `photoId` — optional reference photo for visual identification
- `notes` — optional free text
- `createdAt`, `updatedAt`

Spatial model:
- GardenZone does not store canvas coordinates. It is a data entity, not a drawing primitive.
- The existing `GardenDesign` canvas can reference zones by linking `PlacedPlant` entries to a zone ID, creating a visual overlay of logical zones.
- A zone may appear on zero, one, or multiple designs (e.g., a zone could be shown on both a spring plan and an autumn plan).
- This separation means zones work immediately for history queries without requiring the user to draw anything.

This entity is required before the app can reliably answer location-specific history questions.

#### PlantingRecord

Purpose:
- store historical planting facts over time instead of relying on the current state of a `Plant`

Suggested fields:
- `id`
- `plantNameSnapshot`
- `speciesSnapshot`
- `varietySnapshot`
- `garden`
- `zone`
- plantedAt
- removedAt or harvestedAt
- sourcePlant reference when applicable
- outcome or result summary
- season or year markers

Lifecycle:
- A PlantingRecord is created when a Plant is assigned to a GardenZone (or when the user manually logs a historical planting).
- The record snapshots the plant's name, species, and variety at creation time so the historical record is stable even if the Plant entity is later edited.
- When a Plant is removed, harvested, or dies, the PlantingRecord is updated with `removedAt`/`harvestedAt` and an outcome summary. The Plant entity can then be deleted or archived without losing history.
- Retrospective records without a source Plant are explicitly supported. Users should be able to say "I grew carrots in this bed in 2024" without creating a Plant entity for those carrots.
- The `sourcePlant` reference is optional and nullable. It links to a live Plant when one exists, but the record is self-contained.
- PlantingRecords are never deleted by the system. They are the permanent historical layer.

This should become the authoritative history layer.

#### Observation

Purpose:
- unify all in-garden evidence into a single timeline entity, replacing the separate Note and Photo entities

Observation replaces Note and Photo. The current model has notes and photos as separate entities both linked to Plant. This creates two parallel evidence streams with different schemas, different repositories, and different UI flows. Observation unifies them into a single entity that represents "something I recorded in the garden."

Suggested fields:
- `id`
- `observationType` — photo, voiceNote, textNote, pestIssue, growthUpdate, harvestUpdate, generalNote
- `textContent` — optional, for typed notes and transcripts
- `imageData` — optional, for photos (allows external storage)
- `thumbnailData` — optional, for photo thumbnails
- `audioData` — optional, for voice note recordings (future)
- `transcript` — optional, for voice-to-text result
- `plant` — optional Plant reference
- `garden` — optional Garden reference
- `zone` — optional GardenZone reference
- `plantingRecord` — optional PlantingRecord reference
- `tags` — optional comma-separated tags for categorization
- `observedAt` — when the observation was made (user-adjustable)
- `createdAt`, `updatedAt`

Migration path from Note and Photo:
- Existing Note entities become Observations with `observationType: textNote`, `textContent` populated from Note.content, and the Note.title prepended to content.
- Existing Photo entities become Observations with `observationType: photo`, `imageData` and `thumbnailData` carried over, and Photo.caption mapped to `textContent`.
- This is a one-time data migration run on first launch after the update.
- After migration, Note and Photo entities are removed from the Core Data model.
- NoteRepository and PhotoRepository are replaced by ObservationRepository with filtered fetch methods (e.g., `fetchPhotos()`, `fetchNotes()`).
- The migration is a lightweight Core Data migration: new entity added, old entities removed, data copied in code at launch.

This model allows the app to build memory from real garden activity.

### Season Derivation

Seasons are not stored as a first-class entity. They are derived at runtime from the user's location (via UserProfile) and the current date. A `SeasonService` in the Domain Services layer should:
- map UserProfile region to a hemisphere and climate zone
- return the current season and approximate planting windows for that zone
- provide season labels for PlantingRecord queries ("last season" → date range)
- power seasonal nudges in the Today view

This keeps the data model clean (no season table to maintain) while giving the app a consistent answer to "what season is it for this user?" Season derivation depends on UserProfile existing, which is why it arrives in Phase 2 or later.

### Existing Entities That Need Stronger Roles

#### Plant

Should represent a current or active tracked plant, not the only source of historical truth.

#### Garden

Should remain the top-level physical container for the user’s growing spaces.

#### GardenDesign

Should evolve from abstract canvas state toward plan data that can map onto real gardens and zones.

#### CareTask

Should support plant-level and optionally zone-level care workflows and history.

## Data Ownership Rules

The app should treat these as first-class stored facts:
- user profile
- gardens
- zones
- plants
- planting records
- tasks
- photos and observations
- plans

The app should treat these as derived or assembled context:
- current season summary
- area history summary
- crop rotation suggestions
- assistant prompt context
- “what should I do next?” recommendations

This distinction matters because the assistant should be built on reliable structured facts, not ad hoc UI state.

## Application Architecture

Recommended layering:

1. Views
   Focus on outdoor-safe, low-friction interactions.

2. ViewModels
   Orchestrate feature workflows, validation, and presentation state.

3. Domain Services
   Encapsulate gardening logic such as:
   - history lookup
   - area timeline assembly
   - planting suggestions
   - assistant context assembly
   - planning comparison logic

4. Repositories
   Pure persistence access and fetch/update operations.

5. Persistence Layer
   Core Data plus CloudKit sync for structured entities.

6. Assistant Integration Layer
   Context builder plus orchestration for voice, photo, and question flows.

7. Social/Sync Layer
   Sharing and collaboration features built on top of the gardening data model.

Architectural rule:
Views should never become the place where gardening logic, historical lookup, or persistence decisions live.

### Offline-First Architecture

The app is designed for outdoor use. Gardens do not reliably have connectivity. The architecture must assume offline is the default state.

Rules:
- All garden data operations (CRUD, observations, task completion) work fully offline using Core Data as the local store
- The app must never show a spinner or error for garden operations due to network state
- CloudKit sync happens opportunistically in the background when connectivity is available
- Backend API calls (wiki content, authentication, web sync) are non-blocking. Failures are silent and retried automatically
- Voice note transcription should support on-device processing (Apple Speech framework) with optional cloud enhancement when online
- Photo capture stores locally first and syncs thumbnails to CloudKit when available

### Data Migration Strategy

Adding new entities to the Core Data model requires careful migration planning, especially with CloudKit compatibility as a future requirement.

Rules:
- All new entities (UserProfile, GardenZone, PlantingRecord, Observation) are added as new tables, not modifications to existing entity schemas. This keeps migrations lightweight.
- The Observation entity introduction requires a one-time data migration to move existing Note and Photo records. This runs at launch after the model update.
- Lightweight migration must remain enabled. No heavyweight migrations unless absolutely unavoidable.
- CloudKit-compatible models cannot delete or rename attributes after first sync. Since CloudKit is currently disabled, the model can be restructured freely now — but once CloudKit is enabled, the schema is locked for additive-only changes.
- Each phase that introduces new entities should ship the Core Data model changes in a single migration step, not incrementally across builds.
- Migration code should be isolated in a dedicated `MigrationService` that runs before the main view hierarchy loads.

CloudKit activation decision point:
- CloudKit should not be enabled until all Milestone B entities (UserProfile, GardenZone, PlantingRecord, Observation) are in the Core Data model and tested. Enabling CloudKit before the schema is stable locks the model into additive-only changes permanently.
- The recommended activation point is after Milestone B ships and the data model has been validated through real usage. This allows schema restructuring during the most volatile development phases.
- Before activation, audit every entity for attribute naming, optionality, and relationship cardinality — these cannot be changed after first CloudKit sync.
- CloudKit activation requires a paid Apple Developer account. Plan for this dependency in the Milestone B timeline.

## Phased Delivery Plan

### Phase 0: Foundation and UX Simplification

Goal:
- clarify the smallest set of workflows the product must do extremely well

Scope:
- define the primary home experience around `Today`, `Capture`, `Ask`, and `Plan`
- simplify terminology and reduce feature sprawl
- establish accessibility and outdoor-use standards
- define sensible out-of-the-box onboarding defaults

Exit criteria:
- a new user can add a plant and complete a care task within 60 seconds without help text
- the Today view is the default home screen and shows actionable content (tasks due, recent activity)
- all existing features (plant list, wiki, garden list, design) are accessible from the new navigation structure
- touch targets meet 44pt minimum, Dynamic Type renders correctly at all system sizes

### Phase 1: Core Gardening Tracker (Substantially Complete)

Goal:
- deliver immediate solo utility

Current state:
- plant tracking, garden organization, care tasks, photos, notes, and daily task workflows are implemented in the iOS app
- 7 Core Data entities, 6 repositories, 13 ViewModels are in place
- wiki seeded with 15 plant entries (tomato, lettuce, carrot, basil, mint, rose, sunflower, apple, strawberry, pothos, snake plant, peace lily, spider plant, aloe vera, ZZ plant)
- garden design canvas with plant placement exists

Remaining scope:
- polish and edge case fixes within the new navigation structure from Phase 0
- verify care task recurrence across timezone edge cases
- ensure all CRUD flows are reliable end-to-end

Exit criteria:
- a user can track actual garden activity over time without advanced setup

### Phase 2: User Context and Local Intelligence

Goal:
- let the app remember who the user is and where they garden

Scope:
- add `UserProfile`
- use location and profile to set defaults
- support region-aware assumptions and future advice inputs

Exit criteria:
- the app stops requiring repeated explanation of profile and location

### Phase 3: Garden History and Spatial Memory

Goal:
- turn Patch into a memory system, not just a tracker

Scope:
- add `GardenZone`
- add `PlantingRecord`
- connect photos, notes, and tasks to zones where relevant
- add simple history queries for beds and areas

Exit criteria:
- users can answer what happened in a specific area last season or year

### Phase 4: Practical Garden Planning

Goal:
- make planning reflect the real garden

Scope:
- zone-aware planning
- compare planned vs actual
- add photo-backed reference or overlays
- support plant placement and spacing in real areas

Exit criteria:
- a user can place plants into a named zone on the design canvas with correct spacing shown
- the planning view shows a side-by-side of planned vs actual plantings for at least one zone
- spacing warnings appear when a plant is placed too close to another based on wiki data

### Phase 5: Agent-Assisted Gardening

Goal:
- make the assistant meaningfully garden-aware

Scope:
- voice-first interaction
- photo-led advice
- context-aware Q&A using profile, location, history, tasks, wiki, and plan data
- questions like:
  - what did I plant here last year?
  - is this spacing okay?
  - what should I plant next?
  - what should I do in this area this week?

Exit criteria:
- assistant responses reference at least 2 user-specific facts (location, planted species, zone history, or active tasks) when answering garden questions
- voice input is transcribed and answered without requiring the user to type
- photo-based questions ("what’s wrong with this plant?") return advice that accounts for the plant’s species and care history

### Phase 6: Social Gardening

Goal:
- add retention and delight without harming simplicity

Scope:
- lightweight sharing
- seasonal progress or challenge features
- optional shared gardens or family collaboration
- inspiration and community features

Exit criteria:
- a user can share a garden photo or harvest update to at least one external channel (link, message, or in-app feed)
- shared content includes garden context (plant name, zone, season) without requiring manual annotation
- all social features can be disabled without affecting core gardening workflows
- solo users who never enable social features experience no prompts, badges, or UI changes related to social

## Sequence Risks

### Agent Too Early

If agent features ship before profile, zones, and planting history exist, answers will feel generic and repetitive.

### Social Too Early

If social ships before strong personal utility, the product will feel shallow and harder to retain.

### Planning Before Spatial Memory

If planning stays disconnected from real zones and history, it will remain decorative rather than essential.

### Heavy Onboarding

If setup becomes a barrier, broad-age usability will suffer and garden-side capture will fail.

### Current State Without History

If the app relies only on current plants and current gardens, it will never become a real seasonal memory system.

## Immediate Implementation Priorities

The existing iOS app already delivers approximately 80% of Phase 1 (Core Gardening Tracker). Plants, gardens, care tasks, photos, notes, and daily task workflows are functional. Phase 1 should be acknowledged as substantially complete and renamed accordingly.

The next milestone (Milestone A) covers Phase 0 and Phase 2 only. Phase 3 data model additions follow in Milestone B. Attempting to ship UX rework, UserProfile, GardenZone, and PlantingRecord in a single milestone creates too many moving parts.

### Milestone A: Foundation and User Context

#### Priority 1: Today View and Navigation Rework (Phase 0)

- Replace the current 4-tab structure (Tracker, Wiki, Gardens, Design) with the Today/Capture/Ask/Plan home experience
- Implement the Today view with overdue tasks, due-today tasks, and recent observations
- Add a persistent floating capture button accessible from all screens. In Phase 0, capture creates Note and Photo entities using the existing model. These are migrated to the unified Observation entity in Milestone B.
- Refactor MainTabView (currently 44KB with inline ViewModel logic, including 2 embedded ViewModels for the design tab) into focused, composable views
- Existing feature screens (plant list, wiki, garden list, design) move behind navigation rather than tabs
- Establish accessibility baselines: minimum 44pt touch targets, Dynamic Type support, high-contrast mode for outdoor use

#### Priority 2: Add UserProfile Entity (Phase 2)

- Add UserProfile to the Core Data model with location, units, experience level, and growing assumptions
- Build a lightweight onboarding flow that captures profile during first launch (skippable, completable later)
- Use profile defaults throughout the app: units in spacing, region in seasonal nudges, experience level in wiki recommendations
- Single UserProfile per device — this is a personal tool, not a multi-user system

#### Priority 3: Tracker Polish (Phase 1 completion)

- Close remaining gaps in the tracker workflow: ensure plant edit, delete, and garden reassignment all work reliably
- Verify care task recurrence works correctly across timezone changes
- Ensure all existing features work within the new navigation structure

### Milestone B: Garden Memory (deferred — not in first milestone)

- Add GardenZone and PlantingRecord to Core Data model
- Introduce Observation entity, migrate existing Note and Photo data
- Connect observations, tasks, and planting records to zones
- Build zone history queries
- This is the hardest architectural milestone and benefits from having the UX foundation stable first

### Milestone C and beyond

- Phases 4-6 proceed as defined in the phased delivery plan above
- The assistant context layer (previously Priority 5) moves to Milestone C or later — it depends on entities that do not yet exist and should not be built speculatively

## Suggested Milestone Labels

- Milestone A: Foundation and user context (Phase 0 + Phase 1 polish + Phase 2)
- Milestone B: Garden memory (Phase 3 — zones, planting records, observations)
- Milestone C: Grounded planning (Phase 4)
- Milestone D: Garden-aware assistant (Phase 5)
- Milestone E: Social gardening layer (Phase 6)

## Current Repository Implications

### iOS App (strong foundation)

The iOS codebase has:
- 7 Core Data entities with full CRUD repositories
- 13 ViewModels across 5 feature domains
- 4-tab navigation (to be reworked in Phase 0)
- 15 seeded wiki entries
- Garden design canvas with plant placement
- Care task scheduling with recurrence
- Photo capture and gallery

### Web App (early stage)

The web app has:
- React 19 + Zustand with route structure in place
- Plant list reads from backend; all other data is mock
- Garden store is local-only (no backend persistence)
- Wiki uses hardcoded mock entries
- Auth is mocked (no real authentication)
- Dashboard, plant CRUD, wiki browsing, and garden management UI exist but are not connected to real data

The web app should not receive new feature work until Milestone A is complete on iOS. Its next milestone is connecting to the backend for real plant and wiki data.

### Backend (minimal)

The backend has:
- 3 REST endpoints (GET plants, GET tasks, POST water)
- 2 MCP tools (get_plants, water_plants)
- SQLite with plants and care_tasks tables
- No authentication, no user management, no wiki API

The backend should grow to support: authentication, wiki content API, and eventually sync. It should not grow ahead of what the web app needs.

### Architectural gaps relative to vision

- user profile context (no entity on any platform)
- structured garden zones (no entity on any platform)
- historical planting records (no entity on any platform)
- unified observation and capture model (Note and Photo exist separately, Observation does not)
- cross-platform data sync (no sync mechanism between iOS and backend)

Those should be treated as the next major architecture additions, with iOS leading and other platforms following.

## Recommendation

Use this brief as the governing product document for upcoming implementation planning.

The next planning document should be an implementation plan for Milestone A:
- home experience rework around `Today`, `Capture`, `Ask`, and `Plan` (Phase 0)
- `UserProfile` entity and onboarding flow (Phase 2)
- tracker polish within the new navigation structure (Phase 1 completion)

GardenZone, PlantingRecord, and Observation belong to Milestone B and should not be planned until Milestone A is stable.
