# Patch Milestone A — Implementation Plan

Date: 2026-03-19
Status: Ready to execute
Scope: Phase 0 (nav rework) + Phase 2 (UserProfile) + Phase 1 polish
Visual reference: `docs/design/pencil/runs/milestone-a/milestone-a.pen`
Brief: `docs/plans/2026-03-18-patch-product-architecture-brief.md`

---

## Overview

Milestone A ships the new home experience (Today/Capture/Ask/Plan), the UserProfile entity, and tracker polish. It does **not** include GardenZone, PlantingRecord, Observation, or any backend AI integration — those are Milestone B and later.

**Exit criteria (from brief):**
- A new user can add a plant and complete a care task within 60 seconds without help text
- The Today view is the default home screen and shows actionable content (tasks due, recent activity)
- All existing features (plant list, wiki, garden list, design) are accessible from the new navigation structure
- Touch targets meet 44pt minimum, Dynamic Type renders correctly at all system sizes
- The app stops requiring repeated explanation of profile and location

**Phases at a glance:**

| # | Phase | Priority | Size |
|---|-------|----------|------|
| 1 | Extract MainTabView internals | P1 prereq | XL |
| 2 | New navigation shell | P1 | L |
| 3 | AppTheme additions | P1 prereq | M |
| 4 | Repository additions | P1 prereq | S |
| 5 | TodayView + TodayViewModel | P1 | L |
| 6 | CaptureSheet + CaptureViewModel | P1 | L |
| 7 | AskView shell | P1 | M |
| 8 | PlanView shell | P1 | S |
| 9 | UserProfile — Core Data + Repository + ViewModel | P2 | XL |
| 10 | Onboarding flow | P2 | L |
| 11 | Tracker polish + accessibility audit | P3 | M |

---

## Phase 1 — Extract MainTabView Internals

**Goal:** Reduce `MainTabView.swift` from 1225 lines to a thin shell containing only the tab picker. All embedded ViewModels, complex logic, and view clusters move to dedicated files. No visual changes — pure refactor.

**Why first:** Phases 2–8 all depend on the codebase being modular. The DesignTab is an intertwined mess of ViewModels + view structs + logic helpers. Untangle it before building anything new on top.

**Files to create:**

```
Patch/ViewModels/Gardens/DesignTabViewModel.swift
Patch/ViewModels/Gardens/GardenDesignEditorViewModel.swift
Patch/Views/Design/GardenDesignEditorView.swift
Patch/Views/Design/DesignTab.swift
Patch/Views/Design/DesignEditorComponents.swift
Patch/Utils/DesignInsights.swift
```

**Files to modify:**

```
Patch/Views/MainTabView.swift  — strip to tab shell only
```

**Tasks:**

1. **Extract `DesignTabViewModel`** — Move `private final class DesignTabViewModel` from `MainTabView.swift` to `Patch/ViewModels/Gardens/DesignTabViewModel.swift`. Remove `private` access modifier (make `internal`). Dependencies: `GardenRepository`, `GardenDesignRepository`.

2. **Extract `GardenDesignEditorViewModel`** — Move `@MainActor private final class GardenDesignEditorViewModel` to `Patch/ViewModels/Gardens/GardenDesignEditorViewModel.swift`. Remove `private`. Preserve all computed properties: `title`, `availablePlants`, `gardenWidth`, `gardenLength`.

3. **Extract `GardenDesignEditorView` cluster** — Move the following `private struct` definitions to `Patch/Views/Design/GardenDesignEditorView.swift` and `Patch/Views/Design/DesignEditorComponents.swift`:
   - `GardenDesignEditorView`
   - `DesignEditorCanvas`
   - `GridOverlay`
   - `DesignHeroCard`
   - `DesignMetric`
   - `DesignStatusCard`
   - `DesignInsightsSection`
   - `DesignToggleSection`
   - `DesignPaletteSection`
   - `CreateDesignSheet`

4. **Extract `DesignTab` view** — Move `struct DesignTab` and its inner navigation logic to `Patch/Views/Design/DesignTab.swift`.

5. **Extract logic helpers** — Move `buildInsights(placements:availablePlants:wikiEntries:gardenWidth:gardenLength:)`, `companionRelationship(_:_:in:)`, `parseSpacingFeet(_:)`, `DesignMarkerStatus`, `SpacingIssue`, `PlantRelationshipIssue`, `DesignInsights` to `Patch/Utils/DesignInsights.swift`.

6. **Strip MainTabView** — `MainTabView.swift` should contain only: `TabView` with 4 tab items calling `TrackerTab()`, `WikiTab()`, `GardensTab()`, `DesignTab()`. The UITabBar appearance customization block stays here.

7. **Build and verify** — Run `xcodebuild build` and confirm zero new errors. Existing behavior unchanged.

**Notes:**
- `project.yml` uses a directory glob — new files under `Patch/` are auto-included. Run `xcodegen generate` after creating new directories.
- The free functions (`buildInsights` etc.) are referenced by tests via `@testable import Patch` — they must stay in a compiled source file.

---

## Phase 2 — New Navigation Shell

**Goal:** Replace the 4-tab structure (Tracker/Wiki/Gardens/Design) with Today/Capture/Ask/Plan. Feature screens (plant list, wiki, garden list, design) move behind navigation — they are no longer tabs.

**Design reference:** Screen 2 — Navigation Shell in `milestone-a.pen`

**Files to create:**

```
Patch/Views/AppTabView.swift
Patch/Views/Today/TodayTab.swift      (thin wrapper for Phase 5)
Patch/Views/Ask/AskTab.swift          (thin wrapper for Phase 7)
Patch/Views/Plan/PlanTab.swift        (thin wrapper for Phase 8)
```

**Files to modify:**

```
Patch/ContentView.swift               — swap MainTabView → AppTabView, update DebugScreenRouter
```

**Tasks:**

1. **Create `AppTabView.swift`** — New root `TabView` with 4 items:
   - **Today** — SF Symbol `house.fill`, renders `TodayTab()`
   - **Capture** — SF Symbol `plus.circle.fill`, tapping opens `CaptureSheet` as a sheet (not a navigation push). The Capture tab item is a button, not a navigation destination.
   - **Ask** — SF Symbol `bubble.left.fill`, renders `AskTab()`
   - **Plan** — SF Symbol `rectangle.grid.2x2.fill`, renders `PlanTab()`
   - Carry over UITabBar appearance customization from old MainTabView
   - CaptureSheet state: `@State private var showCapture = false` managed here

2. **Create `TodayTab.swift`** — Stub that renders placeholder text "Today" until Phase 5.

3. **Create `AskTab.swift`** — Stub that renders placeholder text "Ask" until Phase 7.

4. **Create `PlanTab.swift`** — Stub that renders placeholder text "Plan" until Phase 8.

5. **Update `ContentView.swift`**:
   - Replace `MainTabView()` with `AppTabView()`
   - Update `DebugScreenRouter` — all 3 references to `MainTabView` (lines 13, 16, 46) must be updated to `AppTabView` or removed

6. **Verify existing screens still accessible** — Plant list, wiki, garden list, design canvas must all be reachable from within `TodayTab` and `PlanTab` via NavigationStack pushes. Add navigation links from each stub as placeholders.

7. **Build and verify** — App launches, 4 new tabs present, existing feature screens accessible.

---

## Phase 3 — AppTheme Additions

**Goal:** Add semantic tokens to `AppTheme.swift` for the new screens. TodayView, CaptureSheet, and AskView should not hardcode colors.

**Design reference:** Color system from `milestone-a.pen` variables section.

**Files to modify:**

```
Patch/Utils/AppTheme.swift
```

**Tokens to add:**

```swift
// Today View
Color.patchOverdue        // #B8543C — overdue task urgency (maps to existing urgent)
Color.patchOverdueSoft    // #F7E5DF — overdue card background
Color.patchDueToday       // patchGreen (already exists)
Color.patchWeatherChip    // #DCEBF3 — sky blue for weather chip

// Capture Sheet
Color.patchCaptureSheet   // patchBackgroundSecondary (already exists, alias)
Color.patchCaptureVoiceDisabled  // patchTextTertiary (already exists, alias)

// Today View FAB
Color.patchFAB            // patchGreen (alias — FAB uses primary green)
```

**Notes:**
- Most tokens already exist in AppTheme. Add only what's missing. Do not duplicate.
- Confirm `patchGreenDark` (#1E3410) exists for pressed FAB state.

---

## Phase 4 — Repository Additions

**Goal:** Add `fetchRecent(days:)` to `NoteRepository` and a date-windowed `fetchRecent(since:)` to `PhotoRepository`. TodayViewModel requires both.

**Files to modify:**

```
Patch/Services/Repositories/NoteRepository.swift
Patch/Services/Repositories/PhotoRepository.swift
```

**Tasks:**

1. **`NoteRepository.fetchRecent(days: Int) -> [Note]`** — Returns notes with `createdAt >= now - days`, sorted descending by `createdAt`. Limit to 20.

2. **`PhotoRepository.fetchRecent(since: Date) -> [Photo]`** — Returns photos with `capturedAt >= since`, sorted descending by `capturedAt`. Limit to 20. (Existing `fetchRecent(limit:)` is count-based — keep both.)

---

## Phase 5 — TodayView + TodayViewModel

**Goal:** Implement the default home screen. Answers "what matters right now?" without navigation.

**Design reference:** Screen 1 — Today View in `milestone-a.pen`

**Files to create:**

```
Patch/Views/Today/TodayView.swift
Patch/ViewModels/Today/TodayViewModel.swift
Patch/Views/Today/TodayOverdueSection.swift
Patch/Views/Today/TodayDueTodaySection.swift
Patch/Views/Today/TodayRecentActivityStrip.swift
Patch/Views/Today/TodayEmptyState.swift
```

**Files to modify:**

```
Patch/Views/Today/TodayTab.swift      — replace stub with TodayView()
```

**TodayViewModel — key properties and methods:**

```swift
@Published var overdueTasks: [CareTask] = []
@Published var dueTodayTasks: [CareTask] = []
@Published var recentNotes: [Note] = []
@Published var recentPhotos: [Photo] = []
@Published var isLoading: Bool = false

func load() async   // calls all 4 repositories
func completeTask(_ task: CareTask)   // marks complete, reloads overdue + dueToday
```

**Data sources:**
- `overdueTasks` ← `CareTaskRepository.fetchOverdue()` (already exists ✓)
- `dueTodayTasks` ← `CareTaskRepository.fetchDueToday()` (already exists ✓)
- `recentNotes` ← `NoteRepository.fetchRecent(days: 7)` (added in Phase 4)
- `recentPhotos` ← `PhotoRepository.fetchRecent(since: Date().addingTimeInterval(-7*86400))` (added in Phase 4)

**TodayView — layout:**
1. `ScrollView` (vertical)
2. Header: date string + weather chip (weather chip is static placeholder in Milestone A — "Add location in profile" until UserProfile lands in Phase 9)
3. `TodayOverdueSection` — shown if `overdueTasks.isEmpty == false`. Red urgency badge per task, grouped by plant. Tap to complete.
4. `TodayDueTodaySection` — shown if `dueTodayTasks.isEmpty == false`. Green accent, same row pattern. Tap to complete.
5. `TodayRecentActivityStrip` — horizontal scrollable row of photo thumbnails + note snippets. Shown if either is non-empty.
6. `TodayEmptyState` — shown if all sections are empty. Friendly message, CTA to add first plant.
7. Floating `CaptureButton` overlay — always visible at bottom-right, 56pt diameter, patchGreen fill, above tab bar.

**Floating capture button:**
- `ZStack` overlay over `ScrollView`
- Opens `CaptureSheet` via `@Binding var showCapture: Bool` passed from `AppTabView`
- 56pt minimum — must meet accessibility target
- Shadow lift: `AppTheme.Shadow.md`

**Notes:**
- Phase 0 Today View shows Notes and Photos (legacy entities). In Milestone B, this section will switch to Observations. Design the Recent Activity strip to take a generic `RecentActivityItem` protocol — this makes the Milestone B swap a data-source change, not a UI rewrite.
- Weather chip is visual-only placeholder until UserProfile + SeasonService land in Phases 9+.

---

## Phase 6 — CaptureSheet + CaptureViewModel

**Goal:** Quick-capture bottom sheet accessible from any screen via the FAB. Under 10 seconds from intent to logged.

**Design reference:** Screen 3 — Capture Flow in `milestone-a.pen`

**Files to create:**

```
Patch/Views/Capture/CaptureSheet.swift
Patch/Views/Capture/CaptureNoteView.swift
Patch/Views/Capture/CapturePhotoView.swift
Patch/ViewModels/Capture/CaptureViewModel.swift
```

**CaptureViewModel — key properties:**

```swift
@Published var selectedPlant: Plant? = nil
@Published var recentPlants: [Plant] = []
@Published var mode: CaptureMode = .picker

enum CaptureMode { case picker, note, photo, taskComplete }

func loadRecentPlants()   // fetches last 5 recently-modified plants
func saveNote(content: String, plant: Plant?)
func savePhoto(imageData: Data, caption: String?, plant: Plant?)
func completeTask(_ task: CareTask)
```

**CaptureSheet — layout:**

1. Bottom sheet (`presentationDetents([.medium, .large])`)
2. Drag handle at top
3. **Picker state (default):** 2×2 grid of large tiles:
   - **Photo** (camera icon) → transitions to `CapturePhotoView`
   - **Note** (pencil icon) → transitions to `CaptureNoteView`
   - **Voice** (mic icon) → disabled chip, "Coming soon" label
   - **Task Done** (checkmark icon) → shows due-today task list inline
4. **Plant assignment row** below tiles: "Attaching to:" + recent plant chips (tappable)
5. Dismiss via drag or cancel button

**CaptureNoteView:**
- Full-text editor (`TextEditor`), minimum 120pt height
- Plant assignment chip shown at top
- "Save" button (top-right in nav bar)
- "Add Photo" button (bottom bar)

**CapturePhotoView:**
- Presents existing `CameraCaptureView` or `PhotoPickerView`
- Plant assignment chip shown after photo is selected
- Caption field (optional)
- "Save" button

**Notes:**
- Uses `NoteRepository.create()` and `PhotoRepository.create()` — these are existing methods ✓
- Does NOT use Observation entity — that is Milestone B
- The `Note` and `Photo` entities are temporary capture targets. When Milestone B migrates them to Observations, the ViewModel's `saveNote()` and `savePhoto()` methods are the only things that need to change.

---

## Phase 7 — AskView Shell

**Goal:** Implement the Ask tab as a functional UI shell with suggested prompts and a text input. No backend AI integration in Milestone A.

**Design reference:** Screen 5 — Ask View in `milestone-a.pen`

**Files to create:**

```
Patch/Views/Ask/AskView.swift
Patch/ViewModels/Ask/AskViewModel.swift
```

**AskViewModel (stub):**

```swift
@Published var messages: [AskMessage] = []
@Published var inputText: String = ""
@Published var isThinking: Bool = false

struct AskMessage { let role: Role; let content: String; let timestamp: Date
  enum Role { case user, assistant }
}

func sendMessage()   // Milestone A: returns static placeholder response
                     // Milestone D: connects to Claude API with context
```

**AskView — layout:**
1. NavBar title "Ask Patch"
2. If `messages.isEmpty`: suggested prompts section — 4 tappable chips in a 2-column grid:
   - "What needs water today?"
   - "Why are my tomato leaves yellowing?"
   - "What should I plant next?"
   - "What did I do in the raised bed last month?"
   - Tapping a chip populates `inputText` and calls `sendMessage()`
3. `ScrollView` message thread (shown when messages exist)
   - User bubbles: right-aligned, `patchGreen` fill
   - Assistant bubbles: left-aligned, `patchBackgroundSecondary` fill
4. Persistent input bar at bottom:
   - `TextField` "Ask about your garden…"
   - Mic icon (grayed, disabled, "Coming soon" tooltip on long press)
   - Send button (arrow icon, disabled when `inputText.isEmpty`)

**Placeholder response (Milestone A):**
The stub `sendMessage()` returns: `"This feature is coming in a future update. Your garden data will be used to give you personalized advice."` — clearly marked as a placeholder, not a real response.

---

## Phase 8 — PlanView Shell

**Goal:** Implement the Plan tab as a navigable entry point to garden planning. In Milestone A this is a thin wrapper over existing screens. It will expand substantially in Milestone C.

**Design reference:** Screen 2 — Navigation Shell (Plan state) in `milestone-a.pen`

**Files to create:**

```
Patch/Views/Plan/PlanView.swift
```

**PlanView — layout:**
1. NavBar title "Plan"
2. Garden list (reuses `GardenListView` logic or a simplified version) — shows gardens with plant count
3. Each garden row tappable → pushes `GardenDetailView` (existing)
4. "+" button in nav bar → `AddGardenView` (existing)
5. Placeholder section: "Zone planning and crop rotation coming soon" — displayed below garden list in a subtle info card

**Notes:**
- This is intentionally minimal. Milestone C (Grounded Planning) will expand PlanView with zone-aware layout, designed canvas overlay, and planned vs actual comparison.
- Do not build anything zone-related here.

---

## Phase 9 — UserProfile: Core Data + Repository + ViewModel

**Goal:** Add the UserProfile entity to Core Data and wire it up with a repository and ViewModel. This is the data foundation for onboarding (Phase 10) and eventually SeasonService (post-Milestone A).

**Files to create:**

```
Patch/Models/UserProfile+CoreDataClass.swift
Patch/Models/UserProfile+CoreDataProperties.swift
Patch/Services/Repositories/UserProfileRepository.swift
Patch/ViewModels/Profile/UserProfileViewModel.swift
```

**Files to modify:**

```
Patch/Resources/Patch.xcdatamodeld/Patch.xcdatamodel/contents   — add UserProfile entity
Patch/Services/PersistenceController.swift                        — add createUserProfile() helper
```

**Core Data entity — UserProfile:**

| Attribute | Type | Optional | Default |
|-----------|------|----------|---------|
| id | UUID | No | — |
| country | String | Yes | — |
| region | String | Yes | — |
| localArea | String | Yes | — |
| preferredUnits | String | No | "imperial" |
| experienceLevel | String | No | "beginner" |
| gardeningGoals | String | Yes | — (comma-separated) |
| climateNotes | String | Yes | — |
| createdAt | Date | No | — |
| updatedAt | Date | No | — |

**Migration notes:**
- This is a new entity — no modifications to existing entities. Lightweight migration handles new tables automatically. No migration mapping model required.
- After editing the xcdatamodel, run `xcodegen generate` to refresh the project.
- `PersistenceController.enableCloudKit` is `false` — schema can be freely modified. Do NOT enable CloudKit in this phase.

**UserProfileRepository — key methods:**

```swift
func fetch() -> UserProfile?          // returns single profile (or nil if not created)
func create(...) -> UserProfile       // creates the profile record
func update(_ profile: UserProfile, ...) // updates profile fields
func hasProfile() -> Bool             // convenience check
```

**UserProfileViewModel:**

```swift
@Published var profile: UserProfile? = nil
@Published var hasProfile: Bool = false

func load()
func saveProfile(country: String?, region: String?, localArea: String?,
                 preferredUnits: String, experienceLevel: String,
                 gardeningGoals: [String])
```

**UserDefaults flag (separate from Core Data):**

```swift
// In a new Patch/Utils/AppState.swift (or UserProfileViewModel)
extension UserDefaults {
    var hasCompletedOnboarding: Bool {
        get { bool(forKey: "hasCompletedOnboarding") }
        set { set(newValue, forKey: "hasCompletedOnboarding") }
    }
}
```

This flag controls whether `OnboardingView` shows on launch. It is set to `true` when the user either completes onboarding or taps "Set up later" on any screen.

---

## Phase 10 — Onboarding Flow

**Goal:** First-launch experience that captures UserProfile data. Skippable at any step. Warm, not overwhelming.

**Design reference:** Screen 4 — Onboarding in `milestone-a.pen`

**Files to create:**

```
Patch/Views/Onboarding/OnboardingView.swift           (paged container)
Patch/Views/Onboarding/OnboardingWelcomeView.swift    (screen 1)
Patch/Views/Onboarding/OnboardingLocationView.swift   (screen 2)
Patch/Views/Onboarding/OnboardingExperienceView.swift (screen 3)
Patch/Views/Onboarding/OnboardingGoalsView.swift      (screen 4)
```

**Files to modify:**

```
Patch/ContentView.swift   — show OnboardingView if !UserDefaults.standard.hasCompletedOnboarding
```

**OnboardingView — container:**
- `TabView` with `tabViewStyle(.page(indexDisplayMode: .always))` — swipe between screens
- Progress dots shown at top (`.page` style provides this automatically)
- "Skip" action available on screens 2–4: sets `hasCompletedOnboarding = true`, dismisses

**Screen 1 — Welcome:**
- Large seedling illustration (use `FloatingLeavesBackground` or a static Image asset)
- Headline: "Your garden, remembered."
- Subtext: "Track your plants, log care activities, and watch your garden thrive — all in one place."
- Primary button: "Get started" → advances to screen 2
- Secondary link: "Set up later" → sets `hasCompletedOnboarding = true`, presents AppTabView

**Screen 2 — Location:**
- Title: "Where do you garden?"
- `Picker` for country (use a static list of common English-speaking countries + "Other")
- `TextField` for local area (e.g. "Portland, OR") — optional
- Helper text: "Used for seasonal reminders and local advice"
- "Next" button → screen 3
- "Skip" link → sets flag, dismisses

**Screen 3 — Experience:**
- Title: "Your experience level"
- 3 large selectable cards (full-width, tappable):
  - **Beginner** — seedling icon, "Just getting started with gardening"
  - **Intermediate** — growing plant icon, "Comfortable with basic plant care"
  - **Experienced** — harvest icon, "Seasoned gardener with deep knowledge"
- Selecting a card auto-advances to screen 4 (no "Next" button needed)
- "Skip" link

**Screen 4 — Goals:**
- Title: "What do you grow?"
- Subtitle: "Select all that apply. You can change these later."
- Chip grid (multi-select): Vegetables, Herbs, Flowers, Fruit, Indoor Plants, Other
- "Get Started" button → saves all collected data to UserProfile via `UserProfileViewModel.saveProfile()`, sets `hasCompletedOnboarding = true`, presents AppTabView
- Skipped screens leave their values nil/empty in UserProfile

**Notes:**
- Requires Phase 9 (UserProfile entity) to be complete before this phase.
- Onboarding is shown via a `.fullScreenCover` in `ContentView`, not as a navigation push.
- After completing onboarding, `AppTabView` is the root. The cover dismisses.

---

## Phase 11 — Tracker Polish + Accessibility Audit

**Goal:** Ensure all existing features work correctly in the new navigation structure and meet accessibility baselines.

**Files to audit/modify:** All existing feature views as needed.

**Tasks:**

**Tracker reliability:**
1. Verify plant edit (`EditPlantView`) works when accessed from the new navigation path (Today → Plant List → Plant Detail → Edit)
2. Verify plant delete shows confirmation, removes plant, and updates Today View task list
3. Verify garden reassignment (plant moved from one garden to another) updates plant list grouping correctly
4. Verify care task recurrence: create a recurring weekly task, simulate timezone change (set device to UTC+12, then UTC-12), confirm scheduled dates advance correctly
5. Verify all CRUD flows (add plant, add garden, add care task, add note, add photo) complete without error in the new nav structure

**Accessibility audit:**
6. Audit all interactive elements across the new screens (TodayView, CaptureSheet, AskView, PlanView, OnboardingView) for 44pt minimum touch targets
7. Audit existing feature views (PlantListView, PlantDetailView, CareTaskListView, WikiHomeView, GardenListView) for 44pt minimum touch targets
8. Enable Dynamic Type at "AX5" (largest accessibility size) — verify all screens remain readable and no text truncates unexpectedly
9. Enable "Increase Contrast" in Accessibility settings — verify all text passes WCAG AA contrast ratio (4.5:1 for body text)
10. Verify FAB is accessible: VoiceOver label "Capture", accessibility trait `.button`, action description "Add a photo, note, or task"

**Exit criteria verification:**
11. Time the "add first plant + complete a care task" flow from cold launch: must be ≤60 seconds for a user with no prior knowledge
12. Confirm Today view is the default tab on launch (selectedTab = 0 in AppTabView)
13. Confirm all legacy tabs (plant list, wiki, gardens, design) are accessible without more than 2 taps from Today

---

## Out of Scope (Milestone B)

The following are explicitly deferred and must not appear in Milestone A code:

- `GardenZone` entity
- `PlantingRecord` entity
- `Observation` entity (Note + Photo migration)
- `SeasonService` (depends on UserProfile existing and tested)
- CloudKit activation
- Backend AI integration for Ask view
- Voice transcription

---

## Appendix A: Design Reference Index

| Screen | Pencil Frame | Phase |
|--------|-------------|-------|
| Today View | Screen 1 — Today View | Phase 5 |
| Navigation Shell | Screen 2 — Navigation Shell | Phase 2 |
| Capture Flow | Screen 3 — Capture Flow | Phase 6 |
| Onboarding | Screen 4 — Onboarding | Phase 10 |
| Ask View | Screen 5 — Ask View | Phase 7 |
| Plant List | Screen 6 — Plant List | Phase 11 (existing) |

Open design file: `docs/design/pencil/runs/milestone-a/milestone-a.pen`

---

## Appendix B: Files Created in Milestone A

```
Patch/Views/AppTabView.swift
Patch/Views/Today/TodayView.swift
Patch/Views/Today/TodayTab.swift
Patch/Views/Today/TodayOverdueSection.swift
Patch/Views/Today/TodayDueTodaySection.swift
Patch/Views/Today/TodayRecentActivityStrip.swift
Patch/Views/Today/TodayEmptyState.swift
Patch/Views/Capture/CaptureSheet.swift
Patch/Views/Capture/CaptureNoteView.swift
Patch/Views/Capture/CapturePhotoView.swift
Patch/Views/Ask/AskView.swift
Patch/Views/Ask/AskTab.swift
Patch/Views/Plan/PlanView.swift
Patch/Views/Plan/PlanTab.swift
Patch/Views/Onboarding/OnboardingView.swift
Patch/Views/Onboarding/OnboardingWelcomeView.swift
Patch/Views/Onboarding/OnboardingLocationView.swift
Patch/Views/Onboarding/OnboardingExperienceView.swift
Patch/Views/Onboarding/OnboardingGoalsView.swift
Patch/Views/Design/GardenDesignEditorView.swift
Patch/Views/Design/DesignTab.swift
Patch/Views/Design/DesignEditorComponents.swift
Patch/ViewModels/Today/TodayViewModel.swift
Patch/ViewModels/Capture/CaptureViewModel.swift
Patch/ViewModels/Ask/AskViewModel.swift
Patch/ViewModels/Gardens/DesignTabViewModel.swift
Patch/ViewModels/Gardens/GardenDesignEditorViewModel.swift
Patch/ViewModels/Profile/UserProfileViewModel.swift
Patch/Models/UserProfile+CoreDataClass.swift
Patch/Models/UserProfile+CoreDataProperties.swift
Patch/Services/Repositories/UserProfileRepository.swift
Patch/Utils/DesignInsights.swift
Patch/Utils/AppState.swift
```

**Files modified:**
```
Patch/Views/MainTabView.swift          — stripped to tab shell
Patch/ContentView.swift                — AppTabView + onboarding check
Patch/Utils/AppTheme.swift             — new semantic tokens
Patch/Services/Repositories/NoteRepository.swift    — fetchRecent(days:)
Patch/Services/Repositories/PhotoRepository.swift   — fetchRecent(since:)
Patch/Services/PersistenceController.swift          — createUserProfile()
Patch/Resources/Patch.xcdatamodeld/...             — UserProfile entity
```
