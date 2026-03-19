# Patch Gardening App - iOS Sprint Plan

**Version**: 2.0  
**Date**: January 2026  
**Platform**: iOS (SwiftUI + CloudKit)  
**Testing**: Full Test Suite (XCTest, ViewInspector)  
**Design Tool**: Advanced 2D Garden Planner

---

## Executive Summary

iOS-focused sprint plan for the Patch gardening application. 18 sprints across 6 phases, resulting in a fully functional iOS app with CloudKit sync.

### Project Scope

- **Primary Features**: Plant Tracker, Plant Wiki, Garden Notes, Photo Gallery, Garden Design, Care Recommendations, Weather Integration
- **Platform**: iOS 17+ (SwiftUI + CloudKit)
- **Data Strategy**: Core Data with CloudKit sync for cross-device
- **Testing**: Unit tests, UI tests, snapshot tests

---

## Phase 1: Foundation

### Sprint 1: Project Setup & Core Data Models

**Sprint Goal**: Establish iOS project structure, Core Data models with CloudKit, and CI pipeline.

**Validation Criteria**:
- Project builds and runs on simulator
- Core Data stack functional
- CloudKit container configured
- CI pipeline passing

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 1.1.1 | Create Xcode Project | Create Patch.xcodeproj with SwiftUI lifecycle | Project opens in Xcode |
| 1.1.2 | Configure Directory Structure | Models/, Views/, ViewModels/, Services/, Utils/, Resources/ | Structure created |
| 1.1.3 | Configure Build Settings | Debug/Release configs, iOS 17+ deployment target | Builds succeed |
| 1.1.4 | Setup Git Repository | Initialize repo, .gitignore, branch strategy | Repo ready |
| 1.2.1 | Create Core Data Model | Patch.xcdatamodeld with all entities | Model compiles |
| 1.2.2 | Define Plant Entity | id, name, species, variety, plantingDate, location, healthStatus, growthStage | Entity validates |
| 1.2.3 | Define Garden Entity | id, name, dimensions, layout, climateZone, soilType | Entity validates |
| 1.2.4 | Define CareTask Entity | id, type, scheduledDate, completedDate, notes, isRecurring, frequency | Entity validates |
| 1.2.5 | Define Note Entity | id, title, content, createdAt, updatedAt | Entity validates |
| 1.2.6 | Define Photo Entity | id, imageData, capturedAt, caption, thumbnailData | Entity validates |
| 1.2.7 | Define WikiEntry Entity | id, species, commonName, description, careGuide, category | Entity validates |
| 1.2.8 | Define GardenDesign Entity | id, name, canvasData, createdAt, updatedAt | Entity validates |
| 1.2.9 | Configure Relationships | Plant-Garden, Plant-CareTask, Plant-Note, Plant-Photo, Garden-Design | Relationships valid |
| 1.3.1 | Create Core Data Stack | PersistenceController with NSPersistentCloudKitContainer | Stack initializes |
| 1.3.2 | Configure CloudKit Container | Enable iCloud capability, configure container identifier | Container accessible |
| 1.3.3 | Configure CloudKit Schema | Push schema to CloudKit dashboard | Schema visible |
| 1.3.4 | Implement Sync Monitoring | Observe NSPersistentCloudKitContainerEvent | Sync status available |
| 1.4.1 | Create Plant Repository | CRUD operations for Plant entity | All operations work |
| 1.4.2 | Create Garden Repository | CRUD operations for Garden entity | All operations work |
| 1.4.3 | Create CareTask Repository | CRUD operations for CareTask entity | All operations work |
| 1.4.4 | Create Note Repository | CRUD operations for Note entity | All operations work |
| 1.4.5 | Create Photo Repository | CRUD operations for Photo entity | All operations work |
| 1.5.1 | Setup SwiftLint | Configure .swiftlint.yml | Lint passes |
| 1.5.2 | Setup GitHub Actions CI | Workflow for build and test | CI green |
| 1.5.3 | Create AGENTS.md | Development setup documentation | Docs complete |
| 1.6.1 | Write Repository Unit Tests | Tests for all repositories | >90% coverage |
| 1.6.2 | Write Core Data Stack Tests | Tests for persistence controller | Tests pass |

**Sprint 1 Validation**: 26 tasks, project builds, Core Data functional, CloudKit configured, CI green.

---

### Sprint 2: UI Shell & Navigation

**Sprint Goal**: Create app shell with tab navigation and reusable components.

**Validation Criteria**:
- App launches with tab bar
- All tabs navigate correctly
- Theme system working
- Components reusable

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 2.1.1 | Create PatchApp Entry | @main App struct with environment setup | App launches |
| 2.1.2 | Create MainTabView | TabView with Tracker, Wiki, Gardens, Design tabs | Tabs display |
| 2.1.3 | Configure Tab Icons | SF Symbols (leaf.fill, book.fill, square.grid.2x2.fill, pencil.and.ruler) | Icons correct |
| 2.1.4 | Create Tab Placeholder Views | Empty views for each tab | Navigation works |
| 2.2.1 | Define AppTheme | Colors, typography, spacing constants | Theme defined |
| 2.2.2 | Create Color Extension | Primary, secondary, background, text colors | Colors accessible |
| 2.2.3 | Create Font Extension | Title, headline, body, caption styles | Fonts accessible |
| 2.2.4 | Implement Dark Mode | Color adaptivity for dark mode | Both modes work |
| 2.3.1 | Create PrimaryButton | Green filled button with consistent styling | Component works |
| 2.3.2 | Create SecondaryButton | Outlined button variant | Component works |
| 2.3.3 | Create CardView | Rounded card with shadow | Component works |
| 2.3.4 | Create LoadingView | Centered progress indicator | Component works |
| 2.3.5 | Create ErrorView | Error message with retry button | Component works |
| 2.3.6 | Create EmptyStateView | Illustration + message + action button | Component works |
| 2.3.7 | Create SearchBarView | Search input with clear button | Component works |
| 2.3.8 | Create FilterChipView | Selectable filter chip | Component works |
| 2.4.1 | Create NavigationCoordinator | Manage navigation state | Coordinator works |
| 2.4.2 | Define NavigationDestination | Enum for all app destinations | Destinations defined |
| 2.4.3 | Implement Deep Linking | Handle URL schemes | Links navigate |
| 2.5.1 | Write Component Snapshot Tests | ViewInspector tests for components | Snapshots match |
| 2.5.2 | Write Navigation Tests | Test navigation flows | Tests pass |

**Sprint 2 Validation**: 21 tasks, shell functional, navigation working, components tested.

---

## Phase 2: Core Tracker Features

### Sprint 3: Plant List & CRUD

**Sprint Goal**: Complete plant listing, creation, editing, and deletion.

**Validation Criteria**:
- Plants list with search/filter
- Add/edit/delete plants
- All fields functional
- Tests passing

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 3.1.1 | Create PlantListViewModel | Fetch, filter, sort, search plants | ViewModel works |
| 3.1.2 | Create PlantListView | List with search bar, filter chips, plant rows | View renders |
| 3.1.3 | Create PlantRowView | Plant name, species, health indicator, thumbnail | Row renders |
| 3.1.4 | Implement Search | Filter by name, species, variety | Search works |
| 3.1.5 | Implement Filters | Filter by health status, growth stage, garden | Filters work |
| 3.1.6 | Implement Sort | Sort by name, date planted, health | Sort works |
| 3.1.7 | Implement Pull-to-Refresh | Refresh plant list | Refresh works |
| 3.2.1 | Create AddPlantViewModel | Form state, validation logic | ViewModel works |
| 3.2.2 | Create AddPlantView | Form with all plant fields | Form renders |
| 3.2.3 | Create SpeciesPickerView | Searchable species picker (from wiki or custom) | Picker works |
| 3.2.4 | Create HealthStatusPicker | Picker with color indicators | Picker works |
| 3.2.5 | Create GrowthStagePicker | Picker for growth stages | Picker works |
| 3.2.6 | Create GardenPicker | Picker to assign plant to garden | Picker works |
| 3.2.7 | Implement Form Validation | Required fields, date validation | Validation works |
| 3.2.8 | Implement Save Plant | Persist to Core Data | Save works |
| 3.3.1 | Create PlantDetailViewModel | Fetch plant with related data | ViewModel works |
| 3.3.2 | Create PlantDetailView | Scrollable detail with all sections | View renders |
| 3.3.3 | Create PlantHeaderView | Hero image, name, species, health badge | Header renders |
| 3.3.4 | Create PlantInfoSection | Planted date, location, garden, growth stage | Section renders |
| 3.3.5 | Create PlantActionsSection | Edit, water, fertilize, delete buttons | Actions work |
| 3.4.1 | Create EditPlantView | Pre-filled form for editing | Form pre-fills |
| 3.4.2 | Implement Update Plant | Save changes to Core Data | Update works |
| 3.4.3 | Implement Discard Changes | Confirmation alert on cancel | Alert shows |
| 3.5.1 | Create DeleteConfirmation | Alert with plant name | Alert shows |
| 3.5.2 | Implement Delete Plant | Remove from Core Data with cascade | Delete works |
| 3.6.1 | Write PlantListViewModel Tests | Unit tests for all operations | Tests pass |
| 3.6.2 | Write AddPlantViewModel Tests | Unit tests for validation | Tests pass |
| 3.6.3 | Write Plant CRUD UI Tests | XCUITest for full workflows | Tests pass |

**Sprint 3 Validation**: 28 tasks, plant CRUD complete, search/filter working, tests passing.

---

### Sprint 4: Care Tasks & Notifications

**Sprint Goal**: Implement care task scheduling, completion, and local notifications.

**Validation Criteria**:
- Care tasks create and schedule
- Notifications fire correctly
- Mark complete/skip works
- History tracks

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 4.1.1 | Create CareTaskListViewModel | Fetch tasks grouped by date | ViewModel works |
| 4.1.2 | Create CareTaskListView | Grouped list (Today, This Week, Later) | View renders |
| 4.1.3 | Create CareTaskRowView | Task type icon, plant name, due date, actions | Row renders |
| 4.1.4 | Create EmptyCareTaskView | Placeholder when no tasks | View renders |
| 4.2.1 | Create AddCareTaskViewModel | Form state, recurrence logic | ViewModel works |
| 4.2.2 | Create AddCareTaskView | Form with type, plant, schedule, notes | Form renders |
| 4.2.3 | Create TaskTypePicker | Watering, fertilizing, pruning, pest control, harvesting | Picker works |
| 4.2.4 | Create RecurrencePicker | One-time, daily, weekly, biweekly, monthly, custom | Picker works |
| 4.2.5 | Implement Recurrence Calculator | Calculate next occurrence dates | Calculator works |
| 4.2.6 | Implement Save CareTask | Persist with recurrence rules | Save works |
| 4.3.1 | Implement Mark Complete | Set completedDate, create next if recurring | Complete works |
| 4.3.2 | Implement Snooze Task | Delay to later time/date | Snooze works |
| 4.3.3 | Implement Skip Task | Mark skipped with optional reason | Skip works |
| 4.3.4 | Implement Delete Task | Remove task | Delete works |
| 4.4.1 | Create NotificationService | Manage UNUserNotificationCenter | Service works |
| 4.4.2 | Request Notification Permission | Prompt user for authorization | Permission requested |
| 4.4.3 | Schedule Task Notifications | Schedule for upcoming tasks | Notifications schedule |
| 4.4.4 | Configure Notification Categories | Complete, snooze, dismiss actions | Categories work |
| 4.4.5 | Handle Notification Response | Process user action from notification | Response handled |
| 4.4.6 | Update Badge Count | Show pending task count | Badge updates |
| 4.5.1 | Create ReminderSettingsView | Configure notification preferences | Settings save |
| 4.5.2 | Implement Notification Timing | 1 hour, 2 hours, 1 day before options | Timing works |
| 4.5.3 | Implement Quiet Hours | Suppress during configured hours | Quiet hours work |
| 4.6.1 | Create CareHistoryViewModel | Fetch completed tasks | ViewModel works |
| 4.6.2 | Create CareHistoryView | List of completed care tasks | View renders |
| 4.6.3 | Create CareStatisticsView | Completion rate, streaks, charts | Stats display |
| 4.7.1 | Write CareTask ViewModel Tests | Unit tests for all operations | Tests pass |
| 4.7.2 | Write Notification Service Tests | Mock notification center tests | Tests pass |
| 4.7.3 | Write CareTask UI Tests | XCUITest for workflows | Tests pass |

**Sprint 4 Validation**: 29 tasks, care tasks functional, notifications working, history tracking.

---

### Sprint 5: Photo Capture & Gallery

**Sprint Goal**: Implement photo capture, storage, compression, and gallery display.

**Validation Criteria**:
- Camera capture works
- Photo library selection works
- Gallery displays correctly
- CloudKit sync works

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 5.1.1 | Create CameraService | AVCaptureSession management | Service works |
| 5.1.2 | Create CameraCaptureView | Camera preview with capture button | View renders |
| 5.1.3 | Request Camera Permission | Prompt for camera access | Permission requested |
| 5.1.4 | Implement Photo Capture | Capture and return image | Capture works |
| 5.2.1 | Create PhotoPickerView | PHPickerViewController wrapper | Picker works |
| 5.2.2 | Request Photo Library Permission | Prompt for library access | Permission requested |
| 5.2.3 | Implement Multi-Select | Select multiple photos | Selection works |
| 5.3.1 | Create PhotoCompressionService | Resize and compress images | Service works |
| 5.3.2 | Implement JPEG Compression | Convert to JPEG with quality setting | Compression works |
| 5.3.3 | Implement Thumbnail Generation | Create smaller thumbnails for lists | Thumbnails created |
| 5.3.4 | Configure Max Dimensions | Limit image size for storage | Limits enforced |
| 5.4.1 | Create PhotoGalleryViewModel | Fetch photos for plant | ViewModel works |
| 5.4.2 | Create PhotoGridView | Grid layout for thumbnails | Grid renders |
| 5.4.3 | Create PhotoThumbnailView | Individual thumbnail with selection | Thumbnail renders |
| 5.4.4 | Implement Lazy Loading | Load images on demand | Loading efficient |
| 5.5.1 | Create PhotoDetailView | Full-screen photo viewer | View renders |
| 5.5.2 | Implement Pinch-to-Zoom | Zoom gesture on photo | Zoom works |
| 5.5.3 | Implement Pan Gesture | Pan when zoomed | Pan works |
| 5.5.4 | Create PhotoCarouselView | Swipe between photos | Carousel works |
| 5.6.1 | Implement Photo Save | Save to Core Data with compression | Save works |
| 5.6.2 | Implement Photo Delete | Remove from Core Data | Delete works |
| 5.6.3 | Implement Caption Edit | Add/edit photo caption | Caption saves |
| 5.7.1 | Configure CloudKit Photo Sync | CKAsset for photo data | Sync works |
| 5.7.2 | Implement Progressive Sync | Sync thumbnails first, full later | Progressive works |
| 5.7.3 | Monitor Sync Progress | Track upload/download progress | Progress displays |
| 5.8.1 | Write PhotoService Tests | Unit tests for compression | Tests pass |
| 5.8.2 | Write PhotoGallery Tests | ViewModel and view tests | Tests pass |
| 5.8.3 | Write Photo UI Tests | XCUITest for capture and gallery | Tests pass |

**Sprint 5 Validation**: 28 tasks, photos functional, gallery working, CloudKit sync operational.

---

## Phase 3: Wiki & Notes

### Sprint 6: Wiki Data & Browsing

**Sprint Goal**: Seed wiki data and implement browsing experience.

**Validation Criteria**:
- Wiki seeded with 70+ plants
- Category browsing works
- Search functional
- Add to garden works

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 6.1.1 | Create WikiSeedService | Load and parse seed JSON | Service works |
| 6.1.2 | Create Vegetables Seed Data | 20 common vegetables with care guides | Data valid |
| 6.1.3 | Create Herbs Seed Data | 15 common herbs with care guides | Data valid |
| 6.1.4 | Create Flowers Seed Data | 15 common flowers with care guides | Data valid |
| 6.1.5 | Create Fruits Seed Data | 10 common fruits with care guides | Data valid |
| 6.1.6 | Create Houseplants Seed Data | 10 common houseplants with care guides | Data valid |
| 6.1.7 | Implement Seed on First Launch | Seed wiki entries to Core Data | Seed completes |
| 6.2.1 | Create WikiHomeViewModel | Fetch categories and featured entries | ViewModel works |
| 6.2.2 | Create WikiHomeView | Category grid with search bar | View renders |
| 6.2.3 | Create CategoryCardView | Category icon, name, plant count | Card renders |
| 6.2.4 | Define Category Icons | SF Symbols for each category | Icons assigned |
| 6.3.1 | Create WikiCategoryViewModel | Fetch entries by category | ViewModel works |
| 6.3.2 | Create WikiCategoryView | List of entries in category | View renders |
| 6.3.3 | Create WikiEntryRowView | Entry name, thumbnail, quick info | Row renders |
| 6.4.1 | Create WikiSearchViewModel | Search across all entries | ViewModel works |
| 6.4.2 | Implement Full-Text Search | Search name, description, care guide | Search works |
| 6.4.3 | Implement Search Suggestions | Show suggestions while typing | Suggestions work |
| 6.4.4 | Implement Recent Searches | Persist recent search terms | History works |
| 6.5.1 | Create WikiEntryDetailViewModel | Fetch full entry data | ViewModel works |
| 6.5.2 | Create WikiEntryDetailView | Complete entry with all sections | View renders |
| 6.5.3 | Create CareGuideSection | Watering, sunlight, soil, temperature | Section renders |
| 6.5.4 | Create PlantingGuideSection | Spacing, depth, germination, harvest | Section renders |
| 6.5.5 | Create CompanionPlantSection | Good/bad companions | Section renders |
| 6.6.1 | Create AddToGardenButton | Button to create plant from entry | Button works |
| 6.6.2 | Implement Pre-filled Plant Form | Populate form from wiki entry | Pre-fill works |
| 6.6.3 | Navigate After Add | Return to plant detail | Navigation works |
| 6.7.1 | Write WikiSeed Tests | Test seed data integrity | Tests pass |
| 6.7.2 | Write WikiSearch Tests | Test search functionality | Tests pass |
| 6.7.3 | Write Wiki UI Tests | XCUITest for browsing | Tests pass |

**Sprint 6 Validation**: 29 tasks, wiki seeded (70+ plants), browsing complete, search functional.

---

### Sprint 7: Notes Feature

**Sprint Goal**: Implement rich text notes with plant association.

**Validation Criteria**:
- Notes create/edit/delete
- Plant linking works
- Search notes works
- Export functional

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 7.1.1 | Create NoteListViewModel | Fetch, filter, search notes | ViewModel works |
| 7.1.2 | Create NoteListView | List with search and filters | View renders |
| 7.1.3 | Create NoteRowView | Title, preview, date, linked plant | Row renders |
| 7.1.4 | Implement Note Search | Full-text search in notes | Search works |
| 7.1.5 | Implement Plant Filter | Filter notes by linked plant | Filter works |
| 7.2.1 | Create NoteEditorViewModel | Editor state, autosave | ViewModel works |
| 7.2.2 | Create NoteEditorView | Title input, body editor | View renders |
| 7.2.3 | Create RichTextEditor | TextEditor with formatting | Editor works |
| 7.2.4 | Implement Bold Formatting | Bold text support | Formatting works |
| 7.2.5 | Implement Italic Formatting | Italic text support | Formatting works |
| 7.2.6 | Implement Bullet Lists | List formatting | Lists work |
| 7.2.7 | Implement Autosave | Save on pause/background | Autosave works |
| 7.3.1 | Create PlantLinkPicker | Select plant to associate | Picker works |
| 7.3.2 | Display Linked Plant | Show plant name on note | Display works |
| 7.3.3 | Navigate to Linked Plant | Tap to view plant | Navigation works |
| 7.4.1 | Implement Delete Note | Remove with confirmation | Delete works |
| 7.4.2 | Implement Archive Note | Move to archive | Archive works |
| 7.4.3 | Create ArchiveView | View archived notes | View renders |
| 7.4.4 | Implement Restore Note | Restore from archive | Restore works |
| 7.5.1 | Create ExportService | Export notes to files | Service works |
| 7.5.2 | Implement Text Export | Export as plain text | Export works |
| 7.5.3 | Implement Markdown Export | Export as Markdown | Export works |
| 7.5.4 | Implement Share Sheet | UIActivityViewController | Share works |
| 7.6.1 | Create Note Templates | Journal, care log, observation | Templates work |
| 7.6.2 | Implement Template Selection | Apply template to new note | Selection works |
| 7.7.1 | Write NoteViewModel Tests | Unit tests for operations | Tests pass |
| 7.7.2 | Write NoteEditor Tests | Test editing functionality | Tests pass |
| 7.7.3 | Write Note UI Tests | XCUITest for workflows | Tests pass |

**Sprint 7 Validation**: 28 tasks, notes complete with rich text, linking, export.

---

## Phase 4: Garden Design

### Sprint 8: Design Canvas Basics

**Sprint Goal**: Implement garden design canvas with drag-drop plant placement.

**Validation Criteria**:
- Canvas renders and responds
- Drag-drop from palette works
- Grid snapping functional
- Basic selection works

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 8.1.1 | Create GardenDesignViewModel | Manage canvas state, placed plants | ViewModel works |
| 8.1.2 | Create GardenDesignView | Canvas with palette sidebar | View renders |
| 8.1.3 | Create CanvasView | Custom drawing surface | Canvas renders |
| 8.1.4 | Configure Canvas Size | Set dimensions based on garden | Size configurable |
| 8.1.5 | Create GridBackgroundView | Grid pattern overlay | Grid renders |
| 8.2.1 | Implement Pinch-to-Zoom | Zoom canvas in/out | Zoom works |
| 8.2.2 | Implement Pan Gesture | Move canvas view | Pan works |
| 8.2.3 | Implement Double-Tap Reset | Reset zoom and position | Reset works |
| 8.2.4 | Configure Zoom Limits | Min/max zoom constraints | Limits enforced |
| 8.3.1 | Create PlantPaletteView | Scrollable list of wiki plants | Palette renders |
| 8.3.2 | Create PaletteItemView | Draggable plant item | Item renders |
| 8.3.3 | Implement Category Tabs | Group by plant category | Tabs work |
| 8.3.4 | Implement Palette Search | Filter palette items | Search works |
| 8.4.1 | Implement Drag Start | Begin drag from palette | Drag starts |
| 8.4.2 | Implement Drag Preview | Ghost image while dragging | Preview shows |
| 8.4.3 | Implement Drop Detection | Detect drop on canvas | Drop detected |
| 8.4.4 | Implement Plant Placement | Add plant at drop position | Placement works |
| 8.5.1 | Create PlacedPlantView | Render plant on canvas | Plant renders |
| 8.5.2 | Display Plant Icon | Show plant icon/emoji | Icon displays |
| 8.5.3 | Display Plant Label | Show plant name | Label displays |
| 8.5.4 | Implement Snap to Grid | Snap placement to grid points | Snap works |
| 8.6.1 | Implement Tap Selection | Tap to select placed plant | Selection works |
| 8.6.2 | Display Selection Indicator | Border/glow on selected | Indicator shows |
| 8.6.3 | Implement Move Plant | Drag to reposition | Move works |
| 8.6.4 | Implement Delete Plant | Remove selected plant | Delete works |
| 8.7.1 | Write Canvas ViewModel Tests | Unit tests for state management | Tests pass |
| 8.7.2 | Write Drag-Drop Tests | Test drag and drop | Tests pass |
| 8.7.3 | Write Canvas UI Tests | XCUITest for interactions | Tests pass |

**Sprint 8 Validation**: 28 tasks, canvas functional, drag-drop working, grid snapping.

---

### Sprint 9: Design Advanced Features

**Sprint Goal**: Add spacing validation, companion planting, save/load, export.

**Validation Criteria**:
- Spacing warnings display
- Companion relationships show
- Designs save/load
- Export works

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 9.1.1 | Create SpacingService | Calculate plant spacing requirements | Service works |
| 9.1.2 | Implement Spacing Zones | Draw occupied space circles | Zones display |
| 9.1.3 | Implement Overlap Detection | Detect spacing violations | Detection works |
| 9.1.4 | Display Spacing Warnings | Visual warning for violations | Warnings show |
| 9.2.1 | Create CompanionService | Fetch companion data from wiki | Service works |
| 9.2.2 | Display Companion Indicators | Green checkmark for companions | Indicators show |
| 9.2.3 | Display Antagonist Indicators | Red warning for antagonists | Indicators show |
| 9.2.4 | Draw Companion Lines | Lines between companion plants | Lines display |
| 9.2.5 | Create CompanionPanelView | Panel showing relationships | Panel renders |
| 9.3.1 | Implement Multi-Select | Shift-drag or long-press | Multi-select works |
| 9.3.2 | Implement Group Move | Move multiple selected | Group move works |
| 9.3.3 | Implement Group Delete | Delete multiple selected | Group delete works |
| 9.3.4 | Implement Duplicate | Copy selected plants | Duplicate works |
| 9.4.1 | Create DesignStorageService | Save/load designs | Service works |
| 9.4.2 | Implement Save Design | Persist to Core Data | Save works |
| 9.4.3 | Implement Load Design | Restore from Core Data | Load works |
| 9.4.4 | Create DesignListView | List saved designs | View renders |
| 9.4.5 | Implement Auto-Save | Save on changes | Auto-save works |
| 9.5.1 | Create ExportService | Export design to files | Service works |
| 9.5.2 | Implement Image Export | Export as PNG | Export works |
| 9.5.3 | Implement PDF Export | Export as PDF | Export works |
| 9.5.4 | Implement Share Sheet | Share exported file | Share works |
| 9.6.1 | Implement Undo | Undo last action | Undo works |
| 9.6.2 | Implement Redo | Redo undone action | Redo works |
| 9.6.3 | Create Undo/Redo Toolbar | Toolbar buttons | Toolbar works |
| 9.7.1 | Write Spacing Tests | Test spacing calculations | Tests pass |
| 9.7.2 | Write Companion Tests | Test companion logic | Tests pass |
| 9.7.3 | Write Export Tests | Test export functionality | Tests pass |

**Sprint 9 Validation**: 28 tasks, advanced features complete, save/load/export working.

---

### Sprint 10: Garden Management

**Sprint Goal**: Complete garden CRUD and statistics.

**Validation Criteria**:
- Gardens create/edit/delete
- Plant assignment works
- Statistics display

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 10.1.1 | Create GardenListViewModel | Fetch and organize gardens | ViewModel works |
| 10.1.2 | Create GardenListView | List with garden cards | View renders |
| 10.1.3 | Create GardenCardView | Name, dimensions, plant count, thumbnail | Card renders |
| 10.2.1 | Create AddGardenViewModel | Form state, validation | ViewModel works |
| 10.2.2 | Create AddGardenView | Name, type, dimensions, climate zone | Form renders |
| 10.2.3 | Create GardenTypePicker | Raised bed, in-ground, container | Picker works |
| 10.2.4 | Create DimensionInput | Width/length input | Input works |
| 10.2.5 | Implement Save Garden | Persist to Core Data | Save works |
| 10.3.1 | Create GardenDetailViewModel | Fetch garden with plants | ViewModel works |
| 10.3.2 | Create GardenDetailView | Garden info, plant list, actions | View renders |
| 10.3.3 | Create GardenPlantsSection | List plants in garden | Section renders |
| 10.3.4 | Create QuickActionsSection | Design, water all, stats | Actions work |
| 10.4.1 | Create EditGardenView | Pre-filled form | Form pre-fills |
| 10.4.2 | Implement Update Garden | Save changes | Update works |
| 10.4.3 | Implement Delete Garden | Remove with plant transfer | Delete works |
| 10.4.4 | Create PlantTransferDialog | Choose destination for plants | Dialog works |
| 10.5.1 | Create GardenStatisticsView | Statistics dashboard | View renders |
| 10.5.2 | Display Plant Count | Total and by category | Count correct |
| 10.5.3 | Display Health Distribution | Chart of health statuses | Chart renders |
| 10.5.4 | Display Care Summary | Upcoming care tasks | Summary renders |
| 10.6.1 | Implement Duplicate Garden | Copy garden with plants | Duplicate works |
| 10.6.2 | Create TemplateGallery | Pre-built garden templates | Gallery renders |
| 10.6.3 | Implement Apply Template | Create garden from template | Template works |
| 10.7.1 | Write Garden ViewModel Tests | Unit tests | Tests pass |
| 10.7.2 | Write Garden UI Tests | XCUITest workflows | Tests pass |

**Sprint 10 Validation**: 25 tasks, garden management complete, statistics functional.

---

## Phase 5: Intelligence Features

### Sprint 11: Weather Integration

**Sprint Goal**: Integrate weather data for care recommendations.

**Validation Criteria**:
- Weather displays correctly
- Alerts trigger appropriately
- Care adjustments work

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 11.1.1 | Create WeatherService | Fetch from OpenWeatherMap API | Service works |
| 11.1.2 | Configure API Key Storage | Store in Keychain | Key secure |
| 11.1.3 | Implement Location Service | Get user location | Location works |
| 11.2.1 | Create CurrentWeatherViewModel | Parse current conditions | ViewModel works |
| 11.2.2 | Create CurrentWeatherView | Temperature, conditions, icon | View renders |
| 11.2.3 | Create WeatherIconView | SF Symbols for conditions | Icons display |
| 11.3.1 | Create ForecastViewModel | Parse 7-day forecast | ViewModel works |
| 11.3.2 | Create ForecastView | Daily forecast list | View renders |
| 11.3.3 | Create DailyForecastRow | Day, high/low, icon, precipitation | Row renders |
| 11.4.1 | Create WeatherAlertService | Detect weather alerts | Service works |
| 11.4.2 | Implement Frost Alert | Alert when frost predicted | Alert triggers |
| 11.4.3 | Implement Heat Alert | Alert for extreme heat | Alert triggers |
| 11.4.4 | Implement Rain Alert | Alert for expected rain | Alert triggers |
| 11.4.5 | Create WeatherAlertView | Display active alerts | View renders |
| 11.5.1 | Create CareAdjustmentService | Adjust care for weather | Service works |
| 11.5.2 | Implement Rain Skip | Skip watering if rain coming | Skip works |
| 11.5.3 | Implement Heat Adjustment | Increase watering in heat | Adjustment works |
| 11.5.4 | Implement Frost Protection | Suggest covering plants | Suggestion works |
| 11.6.1 | Create WeatherWidgetView | Dashboard weather widget | Widget renders |
| 11.6.2 | Integrate with Plant Detail | Show weather on plant view | Integration works |
| 11.6.3 | Create WeatherSettingsView | Configure location, units | Settings save |
| 11.7.1 | Write Weather Service Tests | Mock API tests | Tests pass |
| 11.7.2 | Write Alert Tests | Test alert triggering | Tests pass |
| 11.7.3 | Write Weather UI Tests | XCUITest | Tests pass |

**Sprint 11 Validation**: 24 tasks, weather integration complete, alerts functional.

---

### Sprint 12: Care Recommendations

**Sprint Goal**: Implement intelligent care recommendations engine.

**Validation Criteria**:
- Recommendations generate correctly
- Notifications work
- Dismiss/feedback works

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 12.1.1 | Create RecommendationService | Generate recommendations | Service works |
| 12.1.2 | Define Recommendation Model | Type, priority, source, action | Model complete |
| 12.1.3 | Define Priority Levels | Urgent, high, medium, low | Levels defined |
| 12.2.1 | Implement Watering Recommendations | Based on weather, schedule, plant | Watering works |
| 12.2.2 | Implement Fertilizing Recommendations | Based on growth stage, season | Fertilizing works |
| 12.2.3 | Implement Seasonal Recommendations | Based on current season | Seasonal works |
| 12.2.4 | Implement Harvest Recommendations | Based on maturity | Harvest works |
| 12.3.1 | Create RecommendationsViewModel | Fetch and organize recommendations | ViewModel works |
| 12.3.2 | Create RecommendationsListView | Prioritized list | View renders |
| 12.3.3 | Create RecommendationCardView | Type, plant, reason, actions | Card renders |
| 12.3.4 | Create EmptyRecommendationsView | No recommendations state | View renders |
| 12.4.1 | Implement Complete Action | Mark recommendation done | Complete works |
| 12.4.2 | Implement Snooze Action | Delay recommendation | Snooze works |
| 12.4.3 | Implement Dismiss Action | Dismiss with feedback | Dismiss works |
| 12.4.4 | Create FeedbackSheet | Collect dismissal reason | Feedback saves |
| 12.5.1 | Create RecommendationNotificationService | Send notifications | Service works |
| 12.5.2 | Implement Grouped Notifications | Group similar recommendations | Grouping works |
| 12.5.3 | Configure Notification Timing | Send at optimal times | Timing works |
| 12.6.1 | Create RecommendationsWidgetView | Dashboard widget | Widget renders |
| 12.6.2 | Integrate with Care Tasks | Create tasks from recommendations | Integration works |
| 12.7.1 | Write Recommendation Tests | Test generation logic | Tests pass |
| 12.7.2 | Write Notification Tests | Test notification scheduling | Tests pass |
| 12.7.3 | Write Recommendation UI Tests | XCUITest | Tests pass |

**Sprint 12 Validation**: 23 tasks, recommendations engine complete, notifications working.

---

### Sprint 13: Smart Suggestions

**Sprint Goal**: Implement intelligent plant suggestions based on user conditions.

**Validation Criteria**:
- Suggestions based on preferences
- Climate/light matching works
- Planting calendar functional

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 13.1.1 | Create UserPreferencesService | Store user gardening preferences | Service works |
| 13.1.2 | Create PreferencesView | Set experience level, goals, space | View renders |
| 13.1.3 | Implement Preference Storage | Persist to UserDefaults | Storage works |
| 13.2.1 | Create ClimateZoneService | Determine hardiness zone | Service works |
| 13.2.2 | Implement Zone Detection | From location or manual | Detection works |
| 13.2.3 | Create ClimateZoneView | Display and edit zone | View renders |
| 13.3.1 | Create SuggestionService | Generate plant suggestions | Service works |
| 13.3.2 | Implement Climate Matching | Filter by hardiness zone | Matching works |
| 13.3.3 | Implement Light Matching | Match to available light | Matching works |
| 13.3.4 | Implement Difficulty Matching | Match to experience level | Matching works |
| 13.3.5 | Implement Space Matching | Match to available space | Matching works |
| 13.4.1 | Create SuggestionsViewModel | Score and rank suggestions | ViewModel works |
| 13.4.2 | Create SuggestionsListView | Ranked suggestion list | View renders |
| 13.4.3 | Create SuggestionCardView | Plant, score, match reasons | Card renders |
| 13.4.4 | Create MatchScoreView | Visual match percentage | Score displays |
| 13.5.1 | Implement Like/Dislike | User feedback on suggestions | Feedback works |
| 13.5.2 | Implement Adaptive Learning | Adjust based on feedback | Learning works |
| 13.6.1 | Create PlantingCalendarViewModel | Generate planting calendar | ViewModel works |
| 13.6.2 | Create PlantingCalendarView | What to plant each month | View renders |
| 13.6.3 | Implement Planting Windows | Optimal planting dates | Windows work |
| 13.6.4 | Implement Succession Planting | Suggest staggered planting | Suggestions work |
| 13.7.1 | Write Suggestion Tests | Test matching algorithms | Tests pass |
| 13.7.2 | Write Calendar Tests | Test calendar generation | Tests pass |
| 13.7.3 | Write Suggestion UI Tests | XCUITest | Tests pass |

**Sprint 13 Validation**: 24 tasks, smart suggestions complete, calendar functional.

---

## Phase 6: Polish & Launch

### Sprint 14: Performance Optimization

**Sprint Goal**: Optimize app performance for large datasets.

**Validation Criteria**:
- Startup time <3 seconds
- List scrolling 60fps
- Memory usage optimized

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 14.1.1 | Profile Startup Time | Measure cold start | Profile complete |
| 14.1.2 | Profile Memory Usage | Check for leaks | Profile complete |
| 14.1.3 | Profile UI Rendering | Check frame rates | Profile complete |
| 14.1.4 | Profile Core Data | Query performance | Profile complete |
| 14.2.1 | Implement Lazy Loading | Lazy load plant lists | Loading improved |
| 14.2.2 | Implement Pagination | Paginate large lists | Pagination works |
| 14.2.3 | Implement Image Caching | Cache images in memory | Caching works |
| 14.2.4 | Optimize Thumbnail Loading | Load thumbnails efficiently | Loading fast |
| 14.3.1 | Optimize Core Data Fetches | Batch and prefetch | Fetches faster |
| 14.3.2 | Add Database Indexes | Index frequently queried fields | Queries faster |
| 14.3.3 | Implement Background Context | Heavy ops on background | UI responsive |
| 14.4.1 | Optimize CloudKit Sync | Batch sync operations | Sync faster |
| 14.4.2 | Implement Delta Sync | Only sync changes | Data transferred |
| 14.4.3 | Optimize Photo Sync | Compress before upload | Upload faster |
| 14.5.1 | Create Performance Benchmarks | Define targets | Targets set |
| 14.5.2 | Create Performance Tests | Automated perf tests | Tests pass |
| 14.5.3 | Document Optimizations | Record changes made | Docs complete |

**Sprint 14 Validation**: 17 tasks, performance optimized, targets met.

---

### Sprint 15: Accessibility

**Sprint Goal**: Make app fully accessible with VoiceOver and Dynamic Type.

**Validation Criteria**:
- VoiceOver fully functional
- Dynamic Type supported
- Color contrast WCAG AA

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 15.1.1 | Audit VoiceOver | Test all views | Issues listed |
| 15.1.2 | Audit Color Contrast | Check WCAG AA | Issues listed |
| 15.1.3 | Audit Touch Targets | Minimum 44x44pt | Issues listed |
| 15.1.4 | Audit Dynamic Type | Test all sizes | Issues listed |
| 15.2.1 | Add Accessibility Labels | Label all controls | Labels complete |
| 15.2.2 | Add Accessibility Hints | Provide action hints | Hints complete |
| 15.2.3 | Configure Accessibility Order | Logical focus order | Order correct |
| 15.2.4 | Group Related Elements | Use accessibilityElement | Grouping correct |
| 15.3.1 | Fix Color Contrast Issues | Adjust colors for AA | Contrast fixed |
| 15.3.2 | Fix Touch Target Issues | Increase small targets | Targets fixed |
| 15.3.3 | Support Dynamic Type | Scale all text | Type scales |
| 15.3.4 | Support Bold Text | Honor bold text setting | Bold works |
| 15.4.1 | Test with VoiceOver | Full app walkthrough | VoiceOver works |
| 15.4.2 | Test with Switch Control | Switch navigation | Switch works |
| 15.4.3 | Write Accessibility Tests | XCTest accessibility | Tests pass |

**Sprint 15 Validation**: 15 tasks, accessibility complete, WCAG AA compliant.

---

### Sprint 16: Localization

**Sprint Goal**: Support English and Spanish languages.

**Validation Criteria**:
- All strings extracted
- Spanish translation complete
- Language switching works

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 16.1.1 | Setup String Catalog | Configure Localizable.xcstrings | Catalog created |
| 16.1.2 | Extract All Strings | Mark all user-facing strings | Strings extracted |
| 16.1.3 | Define String Keys | Consistent key naming | Keys defined |
| 16.1.4 | Validate Extraction | Verify no hardcoded strings | Validation passes |
| 16.2.1 | Translate to Spanish | All UI strings | Translation complete |
| 16.2.2 | Validate Spanish | Native speaker review | Validation passes |
| 16.2.3 | Handle Plurals | Correct plural forms | Plurals correct |
| 16.2.4 | Handle Date/Number Formats | Locale-aware formatting | Formats correct |
| 16.3.1 | Test English | Full app in English | Display correct |
| 16.3.2 | Test Spanish | Full app in Spanish | Display correct |
| 16.3.3 | Test Layout | No truncation or overflow | Layout correct |
| 16.4.1 | Write Localization Tests | Test string loading | Tests pass |
| 16.4.2 | Create Translation Guide | Guide for future languages | Guide complete |

**Sprint 16 Validation**: 13 tasks, English and Spanish supported, tests passing.

---

### Sprint 17: Final Polish

**Sprint Goal**: Bug fixes, UI polish, and quality improvements.

**Validation Criteria**:
- All critical bugs fixed
- UI polished
- All edge cases handled

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 17.1.1 | Collect Bug Reports | Aggregate known bugs | List complete |
| 17.1.2 | Prioritize Bugs | P0, P1, P2, P3 | Priorities set |
| 17.1.3 | Fix P0 Bugs | Critical bugs | All fixed |
| 17.1.4 | Fix P1 Bugs | Major bugs | All fixed |
| 17.1.5 | Fix P2 Bugs | Minor bugs | Most fixed |
| 17.2.1 | UI Review | Review all screens | Issues listed |
| 17.2.2 | Polish Animations | Smooth transitions | Animations polished |
| 17.2.3 | Design Empty States | All empty states | States designed |
| 17.2.4 | Design Error States | All error states | States designed |
| 17.2.5 | Design Loading States | All loading states | States designed |
| 17.3.1 | Handle Edge Cases | Network errors, empty data | Handled |
| 17.3.2 | Handle Permissions | Denied permissions | Graceful handling |
| 17.3.3 | Handle Low Storage | Low storage scenarios | Warning shown |
| 17.4.1 | Full Regression Test | Complete test suite | All pass |
| 17.4.2 | Manual QA Pass | Full manual testing | Issues fixed |

**Sprint 17 Validation**: 15 tasks, all bugs fixed, polish complete.

---

### Sprint 18: Launch Preparation

**Sprint Goal**: App Store submission and launch.

**Validation Criteria**:
- App submitted to App Store
- Documentation complete
- Monitoring active

**Tasks**:

| ID | Task | Description | Completion Criteria |
|----|------|-------------|---------------------|
| 18.1.1 | Create App Icon | 1024x1024 icon | Icon created |
| 18.1.2 | Create Launch Screen | Branded launch screen | Screen created |
| 18.1.3 | Create Screenshots | iPhone and iPad | Screenshots ready |
| 18.1.4 | Write App Description | App Store description | Description written |
| 18.1.5 | Select Keywords | Search keywords | Keywords selected |
| 18.1.6 | Write Privacy Policy | Privacy policy URL | Policy published |
| 18.2.1 | Configure App Store Connect | App metadata | Metadata complete |
| 18.2.2 | Create TestFlight Build | Beta build | Build uploaded |
| 18.2.3 | Beta Testing | Test with beta users | Feedback addressed |
| 18.2.4 | Submit for Review | App Store submission | Submitted |
| 18.3.1 | Create User Guide | Getting started guide | Guide written |
| 18.3.2 | Create FAQ | Frequently asked questions | FAQ written |
| 18.3.3 | Setup Support Email | support@patch.app | Email configured |
| 18.4.1 | Configure Analytics | Usage tracking | Analytics active |
| 18.4.2 | Configure Crash Reporting | Crash monitoring | Reporting active |
| 18.4.3 | Create Launch Checklist | Final checklist | Checklist complete |
| 18.4.4 | Monitor Launch | Watch for issues | Monitoring active |
| 18.4.5 | Announce Launch | Public announcement | Announced |

**Sprint 18 Validation**: 18 tasks, app launched, monitoring active.

---

## Summary

| Phase | Sprints | Tasks | Focus |
|-------|---------|-------|-------|
| 1. Foundation | 1-2 | 47 | Project setup, Core Data, UI shell |
| 2. Core Tracker | 3-5 | 85 | Plant CRUD, Care Tasks, Photos |
| 3. Wiki & Notes | 6-7 | 57 | Wiki browsing, Notes feature |
| 4. Garden Design | 8-10 | 81 | Canvas, advanced features, management |
| 5. Intelligence | 11-13 | 71 | Weather, recommendations, suggestions |
| 6. Polish & Launch | 14-18 | 78 | Performance, accessibility, launch |
| **Total** | **18** | **419** | |

---

## Testing Requirements

| Test Type | Framework | Coverage Target |
|-----------|-----------|-----------------|
| Unit Tests | XCTest | >90% |
| UI Tests | XCUITest | >80% critical paths |
| Snapshot Tests | ViewInspector | 100% main views |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Swift 5.9+ |
| UI | SwiftUI 4 |
| Data | Core Data + CloudKit |
| Async | Swift Concurrency |
| Testing | XCTest, ViewInspector |
| CI | GitHub Actions |

---

**Document Version**: 2.0  
**Last Updated**: January 2026
