# Patch Gardening App - Comprehensive Sprint Plan

**Version**: 1.0  
**Date**: January 2026  
**Platforms**: iOS (SwiftUI) + Web (React + Node.js)  
**Testing**: Full Test Suite (XCTest, Jest, Cypress E2E)  
**Wiki Model**: Hybrid (Curated + User Generated)  
**Design Tool**: Advanced 2D Garden Planner

---

## Executive Summary

This document provides an exhaustive sprint breakdown for the Patch gardening application. The project consists of 24 sprints across 6 phases, resulting in a fully functional iOS and web application for gardening tracking, plant wiki, and garden design.

### Project Scope

- **Primary Features**: Plant Tracker, Plant Wiki, Garden Notes, Photo Gallery, Garden Design, Care Recommendations, Weather Integration
- **Platforms**: iOS (SwiftUI + CloudKit), Web (React + Node.js)
- **Data Strategy**: CloudKit for iOS sync, REST API for web, local persistence for offline
- **Testing**: Unit tests, UI tests, integration tests, E2E tests, snapshot tests

---

## Phase 1: Foundation

### Sprint 1: Project Setup & Infrastructure

**Sprint Goal**: Establish project structure, CI/CD pipelines, shared configurations, error handling, and logging infrastructure for both iOS and Web platforms.

**Validation Criteria**:
- All tasks complete
- CI passing for both iOS and Web
- Project builds successfully
- Fresh setup possible from documentation

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 1.1.1 | Create iOS Directory Structure | Create Patch/ directory with Models/, Views/, Services/, Utils/, Resources/ subdirectories | All directories created and verified | `ls -la` confirms structure |
| 1.1.2 | Configure XcodeGen Project | Create project.yml with iOS target, configure build settings, signing, and capabilities | `xcodegen generate` succeeds | `xcodebuild -list` shows targets |
| 1.1.3 | Setup iOS Build Configuration | Create Debug/Release configs, configure code signing, and provisioning | Project builds for simulator | `xcodebuild build -scheme Patch -destination 'platform=iOS Simulator,name=iPhone 15'` succeeds |
| 1.2.1 | Create React Web Project | Initialize React app with TypeScript using Vite or Create React App | App runs on localhost | `npm start` serves on port 3000 |
| 1.2.2 | Configure TypeScript | Setup tsconfig.json with strict mode, path aliases, and type checking | TypeScript compiles without errors | `npx tsc --noEmit` passes |
| 1.2.3 | Configure Webpack/Vite | Override default config for optimal production builds | Build completes successfully | `npm run build` succeeds with no warnings |
| 1.3.1 | Initialize Node.js Backend | Create server/ directory structure with routes/, controllers/, models/, middleware/, config/ | Server structure created | Directory structure verified |
| 1.3.2 | Configure Express Server | Setup Express with middleware (CORS, body-parser, helmet, compression) | Server starts without errors | `npm run dev` serves on configured port |
| 1.3.3 | Setup TypeScript for Backend | Configure tsconfig.json for Node.js with proper module resolution | TypeScript compiles | `npx tsc --project tsconfig.server.json` passes |
| 1.4.1 | Initialize Git Repository | Create git repo, configure .gitignore for both platforms | Repo initialized | `git status` shows clean state |
| 1.4.2 | Configure Branch Strategy | Setup main/develop branches, create branch protection rules, define naming conventions | Branch strategy documented | PR review workflow functional |
| 1.4.3 | Create Commit Message Convention | Define conventional commit format, add commit message linter | Pre-commit hook configured | Commit messages follow convention |
| 1.5.1 | Configure iOS CI Pipeline | Create GitHub Actions workflow for Xcode builds, tests, and code coverage | CI workflow runs on push | All jobs complete successfully |
| 1.5.2 | Configure Web CI Pipeline | Create GitHub Actions workflow for Node.js builds, tests, and linting | CI workflow runs on push | All jobs complete successfully |
| 1.5.3 | Setup Code Coverage Reporting | Configure codecov.io or similar for coverage tracking | Coverage badges in README | Coverage reports generated |
| 1.6.1 | Define Shared TypeScript Types | Create shared/ directory with API contracts, data models, and utilities | Types can be imported | TypeScript compilation succeeds |
| 1.6.2 | Create Plant Model Types | Define TypeScript interfaces for Plant, Garden, CareTask, Note, Photo | Types match iOS models | Type validation passes |
| 1.6.3 | Create API Contract Types | Define request/response types for all API endpoints | Contracts documented | OpenAPI spec generated |
| 1.7.1 | Create Backend Dockerfile | Dockerfile with multi-stage build for Node.js backend | Container builds successfully | `docker build -t patch-backend .` succeeds |
| 1.7.2 | Create Docker Compose | Configure services for backend, database, and optional services | `docker-compose up` works | All containers start |
| 1.7.3 | Setup Database in Docker | Configure PostgreSQL container with initial schema | Database accessible | Connection test passes |
| 1.8.1 | Setup SwiftLint | Configure .swiftlint.yml with custom rules, add to build phase | Lint runs without errors | `swiftlint` passes |
| 1.8.2 | Setup SwiftFormat | Configure .swiftformat with code style rules | Format runs without changes needed | `swiftformat --check .` passes |
| 1.9.1 | Setup ESLint | Configure .eslintrc.js with TypeScript and React rules | Lint runs without errors | `npm run lint` passes |
| 1.9.2 | Setup Prettier | Configure .prettierrc with consistent formatting | Format runs without changes | `npm run format:check` passes |
| 1.10.1 | Create Project README | Setup instructions, architecture overview, tech stack documentation | README complete | New developer can understand project |
| 1.10.2 | Create AGENTS.md | Developer guide with setup commands, coding conventions, troubleshooting | AGENTS.md complete | Fresh setup completes in <30 min |
| 1.10.3 | Create API Documentation Template | OpenAPI spec template for documenting endpoints | Template created | Docs render in Swagger UI |
| 1.11.1 | Define Error Handling Strategy | Document error types, error codes, and response formats | Strategy documented | Review with team |
| 1.11.2 | Implement Global Exception Handler | Create middleware for handling uncaught exceptions | Handler catches errors | 500 responses include error info |
| 1.11.3 | Implement API Error Response Format | Define consistent error response structure | Format defined | All errors use format |
| 1.12.1 | Setup Application Logging | Configure structured logging (winston/pino for Node, oslog for iOS) | Logging configured | Logs output correctly |
| 1.12.2 | Configure Log Levels | Define when to use each log level (debug, info, warn, error) | Levels documented | Correct levels used |
| 1.12.3 | Setup Log Rotation | Configure log file rotation for production | Rotation works | Old logs archived |

**Sprint 1 Validation**: All 32 tasks complete, CI green, builds pass, error handling and logging functional, fresh setup possible.

---

### Sprint 2: Core Data Models & Persistence (iOS)

**Sprint Goal**: Implement Core Data models with CloudKit sync infrastructure for all primary entities.

**Validation Criteria**:
- All entities defined and functional
- CloudKit configured
- Repositories tested
- Data layer ready for features

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 2.1.1 | Create Core Data Model File | Create Patch.xcdatamodeld with all entities | Model file created | Xcode shows entities |
| 2.1.2 | Define Plant Entity Attributes | Add id (UUID), name (String), species (String), variety (String), plantingDate (Date), location (String), healthStatus (String), growthStage (String), notes (Transformable), photos (Transformable) | All attributes defined | Model validates |
| 2.1.3 | Define Plant Relationships | Add careTasks (to-many), notes (to-many), photos (to-many) relationships | Relationships defined | Inverse relationships correct |
| 2.2.1 | Define Garden Entity | Add id, name, dimensions, layout (Binary), climateZone, soilType attributes | Garden entity defined | Model validates |
| 2.2.2 | Define Garden Relationships | Add plants (to-many) relationship to Garden | Relationship defined | Inverse correct |
| 2.3.1 | Define CareTask Entity | Add id, type (String - watering/fertilizing/pruning), scheduledDate, completedDate, notes attributes | CareTask entity defined | Model validates |
| 2.3.2 | Define CareTask Relationships | Add plant (to-one) relationship | Relationship defined | Inverse correct |
| 2.4.1 | Define Note Entity | Add id, content (String), createdAt, updatedAt, title attributes | Note entity defined | Model validates |
| 2.4.2 | Define Note Relationships | Add plant (to-one) relationship | Relationship defined | Inverse correct |
| 2.5.1 | Define Photo Entity | Add id, imageData (Binary), capturedAt, caption attributes | Photo entity defined | Model validates |
| 2.5.2 | Define Photo Relationships | Add plant (to-one) relationship | Relationship defined | Inverse correct |
| 2.6.1 | Define WikiEntry Entity | Add id, species, commonName, description, careGuide (Transformable), category, companionPlants attributes | WikiEntry entity defined | Model validates |
| 2.6.2 | Define Wiki Relationships | No relationships - standalone entity | Entity standalone | N/A |
| 2.7.1 | Create Core Data Stack | Implement NSPersistentContainer with initialization logic | Stack initializes | App launches without errors |
| 2.7.2 | Implement Background Context | Configure background context for heavy operations | Background operations work | Performance improved |
| 2.7.3 | Create Data Migration Strategy | Configure lightweight migration for model changes | Migration configured | `xcodebuild test` passes |
| 2.8.1 | Configure CloudKit Entitlements | Enable iCloud capability with CloudKit container | Entitlements configured | Container visible in dashboard |
| 2.8.2 | Setup NSPersistentCloudKitContainer | Configure container for automatic CloudKit sync | Container configured | Sync enabled |
| 2.8.3 | Configure CloudKit Options | Set up NSPersistentCloudKitContainerOptions with container identifier | Options configured | Sync works |
| 2.8.4 | Implement Sync Event Handling | Observe NSPersistentCloudKitContainerEvent for sync status | Events handled | UI updates on sync |
| 2.9.1 | Create Plant Repository | Implement CRUD operations for Plant entity | Repository functional | All CRUD tests pass |
| 2.9.2 | Create Garden Repository | Implement CRUD operations for Garden entity | Repository functional | All CRUD tests pass |
| 2.9.3 | Create CareTask Repository | Implement CRUD operations for CareTask entity | Repository functional | All CRUD tests pass |
| 2.9.4 | Create Note Repository | Implement CRUD operations for Note entity | Repository functional | All CRUD tests pass |
| 2.9.5 | Create Photo Repository | Implement CRUD operations for Photo entity | Repository functional | All CRUD tests pass |
| 2.10.1 | Write Plant Model Tests | Unit tests for Plant entity creation, validation, relationships | Coverage >90% | All tests pass |
| 2.10.2 | Write Garden Model Tests | Unit tests for Garden entity creation, validation, relationships | Coverage >90% | All tests pass |
| 2.10.3 | Write CareTask Model Tests | Unit tests for CareTask entity creation, validation, relationships | Coverage >90% | All tests pass |
| 2.10.4 | Write Repository Tests | Integration tests for all repositories using in-memory Core Data | Coverage >80% | All tests pass |
| 2.10.5 | Write CloudKit Mock Tests | Mock CloudKit sync tests for offline/online scenarios | Tests pass | CI includes tests |

**Sprint 2 Validation**: 26 tasks complete, all entities functional, CloudKit configured, repositories tested, >80% coverage.

---

### Sprint 3: Backend API Foundation & Photo Storage

**Sprint Goal**: Implement REST API with PostgreSQL, authentication, photo storage service, and API versioning strategy.

**Validation Criteria**:
- Full REST API functional
- All CRUD operations work
- Auth implemented
- Photo storage working
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 3.1.1 | Setup PostgreSQL Schema | Create SQL schema with tables matching Core Data models | Schema created | Tables visible in DB |
| 3.1.2 | Configure TypeORM/Prisma | Setup ORM with entities mapping to Core Data models | ORM configured | Generate migrations |
| 3.1.3 | Implement Database Migrations | Create migration files for all tables | Migrations run | `npm run db:migrate` succeeds |
| 3.1.4 | Create Database Indexes | Add indexes for frequently queried columns | Indexes created | Query performance improved |
| 3.2.1 | Define API Versioning Strategy | Decide on URL versioning (v1/) and backward compatibility | Strategy documented | Team approval |
| 3.2.2 | Implement Plant GET Routes | GET /api/v1/plants, GET /api/v1/plants/:id with query params | Routes return data | All endpoints return 200 |
| 3.2.3 | Implement Plant WRITE Routes | POST /api/v1/plants, PUT /api/v1/plants/:id, DELETE /api/v1/plants/:id | Routes work | CRUD operations succeed |
| 3.3.1 | Implement Garden GET Routes | GET /api/v1/gardens, GET /api/v1/gardens/:id | Routes return data | All endpoints return 200 |
| 3.3.2 | Implement Garden WRITE Routes | POST /api/v1/gardens, PUT /api/v1/gardens/:id, DELETE /api/v1/gardens/:id | Routes work | CRUD operations succeed |
| 3.4.1 | Implement CareTask GET Routes | GET /api/v1/care-tasks, GET /api/v1/care-tasks/:id with filters | Routes return data | All endpoints return 200 |
| 3.4.2 | Implement CareTask WRITE Routes | POST /api/v1/care-tasks, PUT /api/v1/care-tasks/:id, DELETE /api/v1/care-tasks/:id | Routes work | CRUD operations succeed |
| 3.5.1 | Implement Note GET Routes | GET /api/v1/notes, GET /api/v1/notes/:id with plant filter | Routes return data | All endpoints return 200 |
| 3.5.2 | Implement Note WRITE Routes | POST /api/v1/notes, PUT /api/v1/notes/:id, DELETE /api/v1/notes/:id | Routes work | CRUD operations succeed |
| 3.6.1 | Setup S3 Bucket/Cloudinary | Configure object storage for photos | Storage configured | Can upload files |
| 3.6.2 | Implement Photo Upload Endpoint | POST /api/v1/photos/upload with file handling | Upload works | Files stored |
| 3.6.3 | Implement Photo Retrieval | GET /api/v1/photos/:id with proper content-type | Photos retrieve | Images display |
| 3.6.4 | Implement Photo Delete | DELETE /api/v1/photos/:id removes from storage | Delete works | File removed |
| 3.7.1 | Implement JWT Authentication | Create authentication middleware with JWT tokens | Auth works | Tokens issued |
| 3.7.2 | Implement User Registration | POST /api/v1/auth/register with validation | Registration works | User created |
| 3.7.3 | Implement User Login | POST /api/v1/auth/login with credentials | Login works | JWT returned |
| 3.7.4 | Implement Token Refresh | POST /api/v1/auth/refresh with token refresh logic | Refresh works | New tokens issued |
| 3.7.5 | Implement Password Hashing | bcrypt with salt rounds for secure storage | Hashing works | Hashes secure |
| 3.8.1 | Configure Rate Limiting | Setup express-rate-limit for API protection | Rate limits enforced | Limits work |
| 3.8.2 | Implement Request Validation | Add Joi/Zod validation for all input | Validation works | Invalid data rejected |
| 3.8.3 | Implement Circuit Breaker | Add circuit breaker for external service calls | Circuit breaker works | Failures handled |
| 3.9.1 | Generate OpenAPI Spec | Document all endpoints with OpenAPI 3.0 | Spec complete | Swagger UI works |
| 3.9.2 | Create API Documentation | Write descriptions, examples, and error codes for all endpoints | Docs complete | All endpoints documented |
| 3.10.1 | Write API Unit Tests | Unit tests for controllers with mocked repositories | Coverage >90% | All tests pass |
| 3.10.2 | Write API Integration Tests | supertest tests for all endpoints with real DB | Coverage >80% | All tests pass |
| 3.10.3 | Write Auth Integration Tests | Full registration/login flow tests | Tests pass | Auth flow works |
| 3.10.4 | Write Photo Upload Tests | Test file upload, retrieval, and deletion | Tests pass | Photos work |
| 3.10.5 | Seed Development Data | Create seed script with sample plants and gardens | Script runs | DB has test data |

**Sprint 3 Validation**: 34 tasks complete, full API functional, auth working, photos storing, tests passing.

---

### Sprint 4: UI Shell & Navigation (iOS)

**Sprint Goal**: Create app shell with tab navigation, navigation coordinator, and reusable components.

**Validation Criteria**:
- App shell complete
- Navigation working
- Theming applied
- Snapshot tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 4.1.1 | Create App Entry Point | Setup @main entry with configuration | App launches | Launches successfully |
| 4.1.2 | Create Main TabView | Implement TabView with Tracker, Wiki, Gardens, Design tabs | Tabs display | All tabs visible |
| 4.1.3 | Configure Tab Icons | SF Symbols for each tab (leaf, book, square.grid.2x2, pencil.and.ruler) | Icons display | Icons correct |
| 4.1.4 | Create Tab Content Views | Empty placeholder views for each tab | Views exist | Navigation works |
| 4.2.1 | Define Navigation Path | Implement enum for all navigation destinations | Enum complete | All paths defined |
| 4.2.2 | Create NavigationCoordinator | Implement coordinator pattern for managing navigation stack | Coordinator works | Deep linking functional |
| 4.2.3 | Implement Deep Link Handler | Handle universal links and URL schemes | Deep links work | Navigation correct |
| 4.2.4 | Configure Universal Links | Setup associated domains for deep linking | Links configured | Links open app |
| 4.3.1 | Create PlantListViewModel | Implement filtering, sorting, search logic | ViewModel works | Filter/sort tests pass |
| 4.3.2 | Create PlantListView | Implement list view with search bar, filter chips | View renders | All plants display |
| 4.3.3 | Implement List Cell Views | Custom cells for plant display with image, name, status | Cells render | Display correct |
| 4.3.4 | Implement Pull-to-Refresh | Add refresh control for reloading data | Refresh works | Data reloads |
| 4.4.1 | Create GardenListViewModel | Implement filtering and sorting logic | ViewModel works | Tests pass |
| 4.4.2 | Create GardenListView | Implement list view with garden cards | View renders | All gardens display |
| 4.5.1 | Create WikiHomeViewModel | Implement category and search logic | ViewModel works | Tests pass |
| 4.5.2 | Create WikiHomeView | Implement grid of categories with search | View renders | Categories display |
| 4.5.3 | Create Category Cards | Custom cards for wiki categories with icons | Cards render | Visuals correct |
| 4.6.1 | Create DesignHomeViewModel | Implement design list logic | ViewModel works | Tests pass |
| 4.6.2 | Create DesignHomeView | Implement list with existing designs and new design button | View renders | Navigation works |
| 4.7.1 | Define Color Scheme | Create Color extension with app colors (green, earth tones) | Colors defined | Consistent usage |
| 4.7.2 | Define Typography | Create Font extension with text styles | Fonts defined | Consistent usage |
| 4.7.3 | Create Light/Dark Mode Support | Implement color adaptivity for dark mode | Both modes work | UI correct |
| 4.8.1 | Create PrimaryButton | Reusable button with consistent styling | Button works | Tests pass |
| 4.8.2 | Create SecondaryButton | Outlined button variant | Button works | Tests pass |
| 4.8.3 | Create CardView | Reusable card container with shadow | Card works | Tests pass |
| 4.8.4 | Create LoadingView | Activity indicator overlay | View works | Tests pass |
| 4.8.5 | Create ErrorView | Error display with retry action | View works | Tests pass |
| 4.8.6 | Create EmptyStateView | Placeholder for empty data | View works | Tests pass |
| 4.8.7 | Create TextFieldView | Styled text field with validation | Field works | Tests pass |
| 4.8.8 | Create DatePickerView | Date picker with consistent styling | Picker works | Tests pass |
| 4.9.1 | Setup ViewInspector | Configure ViewInspector for SwiftUI view testing | Setup complete | Tests run |
| 4.9.2 | Create Plant List Snapshot Tests | Tests for PlantListView rendering | Tests pass | Snapshots captured |
| 4.9.3 | Create Garden List Snapshot Tests | Tests for GardenListView rendering | Tests pass | Snapshots captured |
| 4.9.4 | Create Wiki Snapshot Tests | Tests for WikiHomeView rendering | Tests pass | Snapshots captured |
| 4.9.5 | Create Component Snapshot Tests | Tests for all shared components | Tests pass | Snapshots captured |

**Sprint 4 Validation**: 30 tasks complete, shell functional, navigation working, components reusable, tests passing.

---

## Phase 2: Tracker + Wiki Features

### Sprint 5: Plant CRUD (iOS)

**Sprint Goal**: Complete plant creation, viewing, editing, and deletion with all fields and validation.

**Validation Criteria**:
- Plants can be added, edited, viewed, deleted
- Search and filtering work
- All workflows tested

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 5.1.1 | Create AddPlantFormView | Implement form with name, species, variety, planting date, location, health status, growth stage fields | Form renders | All fields display |
| 5.1.2 | Create PlantFormViewModel | Implement form state management with validation | ViewModel works | Validation tests pass |
| 5.2.1 | Implement Name Validation | Required, min 2 chars, max 50 chars | Validation works | Invalid rejected |
| 5.2.2 | Implement Species Validation | Required, selection from wiki or custom | Validation works | Selection works |
| 5.2.3 | Implement Date Validation | Must be past or today | Validation works | Future rejected |
| 5.2.4 | Implement Location Validation | Required, reasonable length | Validation works | Invalid rejected |
| 5.3.1 | Create PlantDetailView | Implement scrollable view with all plant data | View renders | All data displays |
| 5.3.2 | Create PlantHeaderView | Hero section with main info and primary image | Header renders | Info complete |
| 5.3.3 | Create PlantInfoSection | Section for details (species, variety, planted, location) | Section renders | Data correct |
| 5.3.4 | Create PlantStatusSection | Section for health status and growth stage | Section renders | Status displays |
| 5.4.1 | Create EditPlantView | Pre-filled form for editing existing plant | View renders | Data pre-fills |
| 5.4.2 | Implement Save Changes | Persist edited data to Core Data | Save works | Data persists |
| 5.4.3 | Implement Cancel Discard | Show confirmation on discard | Confirmation shows | Works correctly |
| 5.5.1 | Create DeleteConfirmationView | Alert with plant name for confirmation | Alert shows | Name displays |
| 5.5.2 | Implement Plant Deletion | Delete plant and associated data | Delete works | Plant removed |
| 5.5.3 | Implement Cascade Deletion | Delete related care tasks, notes, photos | Cascade works | Related data removed |
| 5.6.1 | Create LocationPickerView | Picker for garden areas/beds | Picker renders | Selection works |
| 5.6.2 | Implement Custom Location | Allow typing custom location | Custom works | Saves correctly |
| 5.7.1 | Create HealthStatusPicker | Picker for health status (Excellent, Good, Fair, Poor, Critical) | Picker renders | Selection works |
| 5.7.2 | Create HealthStatusIcon | Visual indicator with color coding | Icon renders | Colors correct |
| 5.8.1 | Create GrowthStagePicker | Picker for growth stage (Seedling, Vegetative, Flowering, Fruiting, Dormant) | Picker renders | Selection works |
| 5.8.2 | Implement GrowthStageTimeline | Show visual timeline of stage changes | Timeline renders | History correct |
| 5.9.1 | Implement Search Logic | Filter plants by name, species, variety | Search works | Results correct |
| 5.9.2 | Implement Filter Logic | Filter by health, growth stage, garden location | Filters work | Results correct |
| 5.9.3 | Implement Sort Logic | Sort by name, planting date, health status | Sort works | Order correct |
| 5.10.1 | Create Add Plant UITest | Test complete add plant workflow | Test passes | Add works |
| 5.10.2 | Create Edit Plant UITest | Test complete edit plant workflow | Test passes | Edit works |
| 5.10.3 | Create Delete Plant UITest | Test delete with confirmation | Test passes | Delete works |
| 5.10.4 | Create Search/Filter UITest | Test search and filter workflows | Test passes | Search works |
| 5.10.5 | Create Navigation UITest | Test navigation to detail and back | Test passes | Navigation works |

**Sprint 5 Validation**: 28 tasks complete, full plant CRUD functional, all workflows tested.

---

### Sprint 6: Care Schedule & Reminders (iOS)

**Sprint Goal**: Implement care task scheduling, local notifications, and care history tracking.

**Validation Criteria**:
- Care tasks schedule correctly
- Notifications fire
- History tracks
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 6.1.1 | Create CareTaskFormView | Form with task type, plant selection, schedule, notes | Form renders | All fields display |
| 6.1.2 | Create CareTaskTypePicker | Picker for watering, fertilizing, pruning, pest control, harvesting | Picker renders | Selection works |
| 6.1.3 | Create PlantSelector | Dropdown to select plant for care task | Selector works | Plant selected |
| 6.1.4 | Create SchedulePicker | Picker for one-time vs recurring, frequency | Picker renders | Options work |
| 6.2.1 | Implement Schedule Calculator | Calculate next occurrence from frequency | Calculator works | Dates correct |
| 6.2.2 | Implement Recurring Logic | Handle daily, weekly, biweekly, monthly, custom | Logic works | Recurrence correct |
| 6.2.3 | Implement Calendar Integration | Sync with device calendar (optional) | Integration works | Events add |
| 6.3.1 | Create CareTaskListViewModel | Implement filtering (upcoming, past, by plant) | ViewModel works | Filter tests pass |
| 6.3.2 | Create CareTaskListView | List view grouped by date (today, this week, later) | View renders | Tasks display |
| 6.3.3 | Create CareTaskRow | Individual task row with action buttons | Row renders | Actions work |
| 6.3.4 | Create EmptyTaskView | Placeholder when no care tasks | View renders | Correct message |
| 6.4.1 | Implement Mark Complete | Button action to mark task done with timestamp | Action works | Time recorded |
| 6.4.2 | Implement Snooze | Delay task to later time/date | Snooze works | New time set |
| 6.4.3 | Implement Skip | Mark task as skipped with reason | Skip works | Reason saved |
| 6.5.1 | Setup Notification Authorization | Request user permission for notifications | Auth requested | User grants/denies |
| 6.5.2 | Create Notification Service | Service for scheduling local notifications | Service works | Notifications schedule |
| 6.5.3 | Implement Care Notifications | Schedule notifications for care tasks | Notifications fire | At correct time |
| 6.5.4 | Implement Notification Categories | Configure notification actions (complete, snooze, dismiss) | Categories work | Actions respond |
| 6.6.1 | Create ReminderSettingsView | View for configuring notification preferences | View renders | Settings save |
| 6.6.2 | Implement Notification Timing | Configurable hours before task (1hr, 2hr, 1day) | Timing works | Notifs at config |
| 6.6.3 | Implement Quiet Hours | Suppress notifications during set hours | Quiet hours work | No notifs during |
| 6.6.4 | Save Preferences | Persist notification settings to UserDefaults | Preferences save | Restore on launch |
| 6.7.1 | Create CareHistoryViewModel | Fetch and organize completed tasks | ViewModel works | Data organizes |
| 6.7.2 | Create CareHistoryView | List view of completed care tasks by date | View renders | History displays |
| 6.7.3 | Create CareStatisticsView | View showing completion rates, streaks | View renders | Stats calculate |
| 6.8.1 | Implement Streak Calculation | Calculate current streak of care completion | Calculation works | Streak correct |
| 6.8.2 | Implement Completion Rate | Calculate percentage of tasks completed | Rate correct | Calculation accurate |
| 6.8.3 | Create Statistics Visualization | Charts/graphs for care data | Visual renders | Data accurate |
| 6.9.1 | Handle Notification Launch | App opens to correct plant from notification | Navigation works | Correct plant |
| 6.9.2 | Handle Notification Actions | Process complete/snooze from notification | Actions work | Task updated |
| 6.9.3 | Update Badge Count | Show number of pending care tasks | Badge updates | Count correct |
| 6.10.1 | Create Care Task UITest | Test complete care task workflow | Test passes | Workflow works |
| 6.10.2 | Create Notification UITest | Test notification scheduling and handling | Test passes | Notifs work |
| 6.10.3 | Create History UITest | Test viewing care history | Test passes | History displays |
| 6.10.4 | Create Statistics UITest | Test statistics calculation | Test passes | Stats correct |
| 6.10.5 | Write Notification Mock Tests | Mock UNUserNotificationCenter for testing | Tests pass | CI includes tests |

**Sprint 6 Validation**: 28 tasks complete, care scheduling functional, notifications working, history tracked.

---

### Sprint 7: Photo Capture & Gallery (iOS)

**Sprint Goal**: Implement photo capture, storage, compression, gallery, and CloudKit sync.

**Validation Criteria**:
- Photos capture and store
- Gallery displays correctly
- CloudKit sync works
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 7.1.1 | Create CameraCaptureView | Implement camera UI with capture button, preview | View renders | Camera activates |
| 7.1.2 | Configure Camera Permissions | Request camera access permission | Permission requested | User grants/denies |
| 7.1.3 | Implement Photo Capture | Capture image from camera | Capture works | Image saved |
| 7.1.4 | Implement Camera Preview | Live preview before capture | Preview displays | Smooth framerate |
| 7.2.1 | Create PhotoPickerView | PHPickerViewController for library selection | Picker works | Selection works |
| 7.2.2 | Configure Photo Library Permission | Request photo library access | Permission requested | User grants/denies |
| 7.2.3 | Implement Multi-Select | Allow selecting multiple photos | Selection works | Multiple add |
| 7.3.1 | Create PhotoCompressionService | Service for resizing/compressing images | Compression works | Size reduced |
| 7.3.2 | Implement JPEG Compression | Convert HEIF to JPEG with quality | Conversion works | Format correct |
| 7.3.3 | Implement Resizing | Resize large images to max dimension | Resize works | Max size enforced |
| 7.3.4 | Write Compression Tests | Test quality vs size tradeoffs | Tests pass | Quality acceptable |
| 7.4.1 | Create PhotoMetadataService | Extract and store EXIF data (date, location) | Metadata extracted | Data stored |
| 7.4.2 | Implement Date Extraction | Get capture date from image | Date extracts | Correct date |
| 7.4.3 | Implement Location Extraction | Get GPS coordinates if available | Location extracts | Coords correct |
| 7.5.1 | Create PhotoGalleryViewModel | Fetch and organize photos for plant | ViewModel works | Photos organize |
| 7.5.2 | Create PhotoGridView | Grid layout for gallery display | View renders | Grid displays |
| 7.5.3 | Create PhotoThumbnailView | Individual thumbnail with selection state | Thumb renders | Selection works |
| 7.5.4 | Implement Pagination | Load photos in batches for performance | Pagination works | Performance good |
| 7.6.1 | Create PhotoDetailView | Full-screen photo viewer with zoom | View renders | Zoom works |
| 7.6.2 | Implement Pinch Zoom | UIPinchGestureRecognizer for zoom | Zoom works | Smooth gesture |
| 7.6.3 | Implement Pan Gesture | Allow panning when zoomed | Pan works | Within bounds |
| 7.6.4 | Implement Double-Tap Zoom | Zoom to fill on double-tap | Double-tap works | Zooms correctly |
| 7.7.1 | Create DeleteConfirmationView | Alert for photo deletion | Alert shows | Confirm works |
| 7.7.2 | Implement Photo Deletion | Delete from Core Data and file storage | Delete works | Photo removed |
| 7.7.3 | Implement Cloud Delete | Delete from CloudKit if synced | Delete syncs | Cloud removes |
| 7.8.1 | Create PhotoCarouselView | Horizontal carousel for quick browsing | View renders | Carousel works |
| 7.8.2 | Implement Carousel Gestures | Swipe to navigate photos | Gestures work | Navigation smooth |
| 7.8.3 | Create CarouselIndicator | Page dots for current position | Indicator works | Position correct |
| 7.9.1 | Create CloudPhotoUploadService | Upload photos to CloudKit container | Upload works | Photos sync |
| 7.9.2 | Implement Thumbnail Upload | Upload smaller thumbnails for performance | Thumbnails upload | Faster sync |
| 7.9.3 | Implement Progress Tracking | Track upload progress for UI | Progress displays | Accuracy good |
| 7.9.4 | Implement Retry Logic | Retry failed uploads with exponential backoff | Retry works | Uploads succeed |
| 7.10.1 | Create Photo Capture UITest | Test complete capture workflow | Test passes | Capture works |
| 7.10.2 | Create Gallery UITest | Test gallery browsing | Test passes | Gallery works |
| 7.10.3 | Create Delete Photo UITest | Test deletion workflow | Test passes | Delete works |
| 7.10.4 | Write Compression Unit Tests | Test compression service | Tests pass | Quality consistent |
| 7.10.5 | Write Cloud Sync Tests | Test CloudKit photo sync | Tests pass | Sync works |

**Sprint 7 Validation**: 27 tasks complete, photos functional, gallery working, cloud sync tested.

---

### Sprint 8: Wiki Data Models & Seeding

**Sprint Goal**: Implement wiki data structure, seed with curated plant information, and implement user contribution models.

**Validation Criteria**:
- Wiki data seeded
- Search functional
- User contributions working
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 8.1.1 | Create Wiki Data Models | Define WikiEntry, CareGuide, Category, CompanionRelationship models | Models defined | Match requirements |
| 8.1.2 | Create Wiki Core Data Model | Add entities to Core Data for offline wiki | Model created | Xcode validates |
| 8.1.3 | Create Wiki Backend Models | Define Prisma/TypeORM entities | Models created | Schema matches |
| 8.2.1 | Define Seed JSON Schema | Schema for wiki plant data | Schema complete | Validates data |
| 8.2.2 | Create Vegetables Seed Data | 20 common vegetables with care guides | Data complete | Validates |
| 8.2.3 | Create Herbs Seed Data | 15 common herbs with care guides | Data complete | Validates |
| 8.2.4 | Create Flowers Seed Data | 15 common flowers with care guides | Data complete | Validates |
| 8.2.5 | Create Fruits/Berries Seed Data | 10 common fruits with care guides | Data complete | Validates |
| 8.2.6 | Create Houseplants Seed Data | 10 common houseplants with care guides | Data complete | Validates |
| 8.3.1 | Create Care Guide Models | Define watering, sunlight, soil, temperature, fertilizing structure | Models defined | Complete |
| 8.3.2 | Create Companion Data | Define companion/antagonist relationships | Data structure | Validates |
| 8.3.3 | Create Planting Guide | Define spacing, depth, germination time | Data complete | Validates |
| 8.3.4 | Create Pest/Disease Info | Common issues and treatments | Data complete | Validates |
| 8.4.1 | Create Category Definitions | Vegetables, Herbs, Flowers, Fruits, Houseplants, Succulents | Categories defined | All categories |
| 8.4.2 | Implement Category Icons | SF Symbols for each category | Icons assigned | Display correct |
| 8.4.3 | Implement Category Colors | Distinct colors for categories | Colors defined | Consistent |
| 8.5.1 | Create Search Service | Full-text search implementation | Search works | Results relevant |
| 8.5.2 | Implement Name Search | Search by common and scientific name | Search works | Results correct |
| 8.5.3 | Implement Description Search | Search within care guides and descriptions | Search works | Results relevant |
| 8.5.4 | Implement Tag Search | Search by tags and keywords | Search works | Results correct |
| 8.6.1 | Create Seed Script | Node.js script to import JSON data to database | Script runs | Imports all data |
| 8.6.2 | Create Image Import Script | Script to download and store plant images | Script runs | Images imported |
| 8.6.3 | Validate Seed Data | Script to verify all entries are valid | Validation passes | All data valid |
| 8.7.1 | Create Wiki API Routes | GET /api/v1/wiki, GET /api/v1/wiki/:id, GET /api/v1/wiki/search | Routes work | All return 200 |
| 8.7.2 | Create Category API | GET /api/v1/wiki/categories with entries | API works | Returns categories |
| 8.7.3 | Create Search API | GET /api/v1/wiki/search?q=term | API works | Returns results |
| 8.8.1 | Create Wiki Sync Service | Service to sync wiki from backend to local Core Data | Sync works | Data matches |
| 8.8.2 | Implement Sync Scheduling | Sync wiki data periodically | Schedule works | Updates regularly |
| 8.8.3 | Implement Sync Conflict Resolution | Handle conflicts between local and server | Resolution works | Data correct |
| 8.9.1 | Create User Wiki Model | Define user contribution data model | Model defined | Complete |
| 8.9.2 | Create Wiki Contribution Form | Form for user to add plant info | Form works | Data submits |
| 8.9.3 | Implement Wiki Entry Creation | Allow creating new wiki entries | Creation works | Entry saved |
| 8.9.4 | Implement Wiki Entry Editing | Allow editing existing entries | Edit works | Changes saved |
| 8.9.5 | Create Contribution Approval | Queue for user contributions to be reviewed | Queue works | Review possible |
| 8.10.1 | Write Wiki Data Tests | Test data integrity for all seeded entries | Tests pass | Data valid |
| 8.10.2 | Write Search Tests | Test search accuracy and relevance | Tests pass | Search works |
| 8.10.3 | Write Sync Tests | Test wiki sync functionality | Tests pass | Sync works |
| 8.10.4 | Write API Integration Tests | Test all wiki endpoints | Tests pass | API works |

**Sprint 8 Validation**: 32 tasks complete, wiki seeded (70+ plants), search working, user contributions enabled.

---

### Sprint 9: Wiki Browse & Search (iOS)

**Sprint Goal**: Complete wiki browsing experience with categories, search, entry details, and plant association.

**Validation Criteria**:
- Wiki browse complete
- Search works
- Add to garden working
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 9.1.1 | Create WikiHomeView | Grid view of categories with search bar | View renders | Categories display |
| 9.1.2 | Create CategoryGridView | Grid layout for category cards | View renders | Grid displays |
| 9.1.3 | Create CategoryCardView | Individual card with icon, name, plant count | Card renders | Info correct |
| 9.1.4 | Implement Category Icons | SF Symbols for each wiki category | Icons display | Correct symbols |
| 9.2.1 | Create WikiCategoryViewModel | Fetch and organize entries by category | ViewModel works | Data organizes |
| 9.2.2 | Navigate to Category Entries | Tap category shows entry list | Navigation works | List displays |
| 9.2.3 | Implement Breadcrumb | Show navigation path | Breadcrumb renders | Path correct |
| 9.3.1 | Create WikiEntryListViewModel | Fetch entries with filters | ViewModel works | Filtering works |
| 9.3.2 | Create WikiEntryListView | List view with entry cards | View renders | Entries display |
| 9.3.3 | Create WikiEntryCardView | Card showing name, image, quick info | Card renders | Info complete |
| 9.3.4 | Implement List Sorting | Sort by name, ease of care, category | Sort works | Order correct |
| 9.4.1 | Implement Search Bar | Search input in wiki home | Search renders | Input works |
| 9.4.2 | Implement Real-time Search | Filter results as user types | Search works | Results update |
| 9.4.3 | Implement Search Suggestions | Show suggestions while typing | Suggestions work | Relevant results |
| 9.4.4 | Implement Recent Searches | Show history of searches | History works | Saves correctly |
| 9.5.1 | Create WikiEntryDetailViewModel | Fetch full entry data | ViewModel works | Data loads |
| 9.5.2 | Create WikiEntryDetailView | Complete entry view with all info | View renders | Info complete |
| 9.5.3 | Create EntryHeaderView | Hero with image, name, scientific name | Header renders | Info correct |
| 9.5.4 | Create EntryQuickInfoView | At-a-glance info (sun, water, difficulty) | View renders | Info complete |
| 9.6.1 | Create CareGuideView | Display care requirements with icons | View renders | Guide complete |
| 9.6.2 | Create WateringInfoView | Watering requirements section | View renders | Info correct |
| 9.6.3 | Create SunlightInfoView | Sunlight requirements section | View renders | Info correct |
| 9.6.4 | Create SoilInfoView | Soil requirements section | View renders | Info correct |
| 9.6.5 | Create PlantingInfoView | Planting instructions section | View renders | Info complete |
| 9.7.1 | Create AddToGardenButton | Button to add wiki plant to garden | Button renders | Action works |
| 9.7.2 | Create PlantFromWikiView | Pre-filled plant creation from wiki entry | View renders | Data pre-fills |
| 9.7.3 | Implement Add Plant Flow | Complete flow from wiki to plant creation | Flow works | Plant created |
| 9.7.4 | Handle Existing Plants | Show if plant already in garden | Handling works | Message displays |
| 9.8.1 | Create FavoritesService | Service for managing favorited entries | Service works | Saves locally |
| 9.8.2 | Implement Favorite Toggle | Star button on entries | Toggle works | State saves |
| 9.8.3 | Create FavoritesListView | View showing all favorites | View renders | List displays |
| 9.9.1 | Create ShareSheetView | UIActivityViewController for sharing | Sheet appears | Content shares |
| 9.9.2 | Implement Share Content | Format share text with plant info | Content formats | Correct data |
| 9.9.3 | Implement Copy to Clipboard | Copy plant info as text | Copy works | Text correct |
| 9.10.1 | Create Wiki Browse UITest | Test category navigation | Test passes | Navigation works |
| 9.10.2 | Create Search UITest | Test search functionality | Test passes | Search works |
| 9.10.3 | Create Add to Garden UITest | Test adding plant from wiki | Test passes | Plant created |
| 9.10.4 | Create Favorites UITest | Test favorites workflow | Test passes | Favorites work |
| 9.10.5 | Write View Snapshot Tests | Tests for wiki views | Tests pass | Snapshots captured |

**Sprint 9 Validation**: 29 tasks complete, wiki browsing complete, add to garden working, favorites and sharing functional.

---

## Phase 3: Additional Features

### Sprint 10: Notes Feature (iOS)

**Sprint Goal**: Implement rich text notes with plant association and search.

**Validation Criteria**:
- Notes create, edit, link, search
- Export works
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 10.1.1 | Create Note Data Model | Define Note entity with content, metadata | Model complete | Validates |
| 10.1.2 | Create Note Repository | CRUD operations for notes | Repository works | Tests pass |
| 10.1.3 | Define Note Relationships | Link to plant entity | Relationship defined | Correct inverse |
| 10.2.1 | Create NoteListViewModel | Fetch and organize notes | ViewModel works | Tests pass |
| 10.2.2 | Create NoteListView | List view with sorting options | View renders | Notes display |
| 10.2.3 | Create NoteRowView | Individual note preview row | Row renders | Info complete |
| 10.2.4 | Implement Sort Options | Sort by created, updated, alphabetically | Sort works | Order correct |
| 10.3.1 | Create NoteEditorViewModel | Manage editor state and autosave | ViewModel works | Autosave works |
| 10.3.2 | Create NoteEditorView | Text editor for note content | View renders | Editing works |
| 10.3.3 | Implement Title Input | Field for note title | Input works | Saves correctly |
| 10.3.4 | Implement Body Input | Text area for note content | Input works | Text saves |
| 10.4.1 | Implement Bold Formatting | Bold button and formatting | Formatting works | Text bolds |
| 10.4.2 | Implement Italic Formatting | Italic button and formatting | Formatting works | Text italicizes |
| 10.4.3 | Implement Underline Formatting | Underline button and formatting | Formatting works | Text underlines |
| 10.4.4 | Implement Bullet Lists | Bullet list formatting | Formatting works | Lists format |
| 10.5.1 | Create PlantSelectorView | Dropdown to select plant for note | Selector works | Plant selected |
| 10.5.2 | Implement Association | Save plant ID with note | Association works | Links correctly |
| 10.5.3 | Display Linked Plant | Show plant name on note card | Display works | Name correct |
| 10.5.4 | Filter Notes by Plant | Filter list by selected plant | Filter works | Results correct |
| 10.6.1 | Implement Note Search | Full-text search within notes | Search works | Finds correctly |
| 10.6.2 | Highlight Search Results | Show matching text in results | Highlight works | Visible matches |
| 10.6.3 | Filter by Date Range | Filter notes by date | Filter works | Range correct |
| 10.7.1 | Create Archive View | View for archived notes | View renders | Archived show |
| 10.7.2 | Implement Archive Action | Move note to archive | Archive works | Note moves |
| 10.7.3 | Implement Restore Action | Restore from archive | Restore works | Note returns |
| 10.7.4 | Implement Permanent Delete | Delete archived notes | Delete works | Note removed |
| 10.8.1 | Implement Text Export | Export note as plain text | Export works | File generated |
| 10.8.2 | Implement Markdown Export | Export note as Markdown | Export works | File generated |
| 10.8.3 | Implement PDF Export | Export note as PDF | Export works | PDF generated |
| 10.8.4 | Implement Share Export | Share exported file | Share works | Sheet appears |
| 10.9.1 | Create Journal Template | Template for daily journal entries | Template works | Applies correctly |
| 10.9.2 | Create Care Log Template | Template for tracking care activities | Template works | Applies correctly |
| 10.9.3 | Create Observation Template | Template for observations | Template works | Applies correctly |
| 10.10.1 | Create Note CRUD UITests | Test note workflows | Tests pass | All work |
| 10.10.2 | Create Rich Text UITest | Test formatting | Test passes | Formatting works |
| 10.10.3 | Create Export UITest | Test export functionality | Test passes | Export works |
| 10.10.4 | Write Note Model Tests | Test note models | Tests pass | Coverage >90% |

**Sprint 10 Validation**: 28 tasks complete, notes feature complete with rich text, search, export, templates.

---

### Sprint 11: Garden Design Canvas (iOS)

**Sprint Goal**: Implement garden design canvas with drag-drop plant placement and grid system.

**Validation Criteria**:
- Canvas renders and responds
- Drag-drop works
- Grid snapping functional
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 11.1.1 | Create CanvasView | Custom SwiftUI view with drawing surface | View renders | Surface visible |
| 11.1.2 | Create CanvasRepresentable | UIViewRepresentable for canvas access | Representable works | UIKit access |
| 11.1.3 | Configure Canvas Size | Set canvas dimensions and boundaries | Size configured | Within bounds |
| 11.1.4 | Create CanvasBackground | Grid pattern or garden bed background | Background renders | Pattern correct |
| 11.2.1 | Implement Pinch-to-Zoom | Gesture for zooming canvas | Gesture works | Zoom smooth |
| 11.2.2 | Implement Pan Gesture | Two-finger pan for moving view | Gesture works | Panning smooth |
| 11.2.3 | Implement Double-Tap Zoom | Zoom to fit on double-tap | Gesture works | Zooms to fit |
| 11.2.4 | Implement Zoom Limits | Min/max zoom constraints | Limits work | Bounds enforced |
| 11.3.1 | Create PlantPaletteViewModel | Fetch plants for palette | ViewModel works | Plants load |
| 11.3.2 | Create PlantPaletteView | Sidebar with draggable plant items | View renders | Items display |
| 11.3.3 | Create PlantPaletteItemView | Individual draggable item | Item draggable | Drag works |
| 11.3.4 | Implement Category Tabs | Group plants by category in palette | Tabs work | Filtering works |
| 11.4.1 | Implement Dragging | Track drag gesture on palette items | Dragging tracks | Position updates |
| 11.4.2 | Implement Drop Zone | Detect drop on canvas | Drop detected | Enter/Exit events |
| 11.4.3 | Implement Placement | Calculate position on canvas | Placement works | Position correct |
| 11.4.4 | Implement Preview | Show ghost image while dragging | Preview shows | Position tracks |
| 11.5.1 | Create PlantGraphicView | Render plant as graphic on canvas | View renders | Graphic visible |
| 11.5.2 | Implement Plant Icon | Display plant icon/emoji | Icon displays | Correct symbol |
| 11.5.3 | Implement Plant Label | Display plant name under graphic | Label displays | Name correct |
| 11.5.4 | Implement Selection Highlight | Glow/border on selected plants | Highlight works | Visible selection |
| 11.6.1 | Implement Tap Selection | Tap to select placed plant | Selection works | Plant selected |
| 11.6.2 | Implement Multi-Select | Shift-click or long-press for multiple | Selection works | Multiple select |
| 11.6.3 | Implement Selection Box | Show bounding box around selection | Box renders | Bounds correct |
| 11.6.4 | Implement Properties Panel | Show properties for selected plant | Panel renders | Properties show |
| 11.7.1 | Implement Move Action | Drag to move placed plants | Move works | Position updates |
| 11.7.2 | Implement Delete Action | Delete selected plants | Delete works | Plant removed |
| 11.7.3 | Implement Duplicate Action | Duplicate selected plants | Duplicate works | Copy created |
| 11.7.4 | Implement Rotate Action | Rotate selected plants | Rotate works | Degrees update |
| 11.8.1 | Create GridOverlayView | Visual grid overlay | View renders | Grid visible |
| 11.8.2 | Implement Snap Logic | Snap plants to grid points | Snap works | Points align |
| 11.8.3 | Implement Grid Toggle | Turn grid on/off | Toggle works | Visible state |
| 11.8.4 | Implement Grid Size Config | Configure grid cell size | Config works | Size updates |
| 11.9.1 | Create GardenBedModel | Model for multiple beds | Model complete | Validates |
| 11.9.2 | Create BedSelectorView | UI to switch between beds | View renders | Selection works |
| 11.9.3 | Implement Bed Switching | Switch canvas to selected bed | Switching works | Canvas updates |
| 11.9.4 | Implement Bed Creation | Create new garden bed | Creation works | Bed added |
| 11.10.1 | Create Canvas UITest | Test canvas interactions | Test passes | Interactions work |
| 11.10.2 | Create Drag-Drop UITest | Test drag and drop | Test passes | Drop works |
| 11.10.3 | Create Selection UITest | Test selection workflow | Test passes | Selection works |
| 11.10.4 | Create Grid UITest | Test grid snapping | Test passes | Snap works |
| 11.10.5 | Write Canvas Rendering Tests | Test canvas rendering | Tests pass | No artifacts |

**Sprint 11 Validation**: 30 tasks complete, canvas functional, drag-drop working, grid snapping, multi-bed support.

---

### Sprint 12: Garden Design Advanced Features (iOS)

**Sprint Goal**: Advanced garden design features including spacing validation, companion planting, save/load, export.

**Validation Criteria**:
- Spacing warnings display
- Companion relationships show
- Save/load works
- Export generates files
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 12.1.1 | Create SpacingCalculator | Calculate required spacing for plants | Calculator works | Values correct |
| 12.1.2 | Implement Spacing Zones | Calculate occupied space around plant | Zones calculate | Display correct |
| 12.1.3 | Implement Spacing Validation | Check for overlap violations | Validation works | Warnings show |
| 12.1.4 | Implement Warning Display | Show visual warning for violations | Warning displays | Clear indication |
| 12.2.1 | Create CompanionDataService | Fetch companion relationships from wiki | Service works | Data loads |
| 12.2.2 | Implement Companion Icons | Display companion indicator (🌿) | Icons display | Correct symbol |
| 12.2.3 | Implement Antagonist Icons | Display antagonist indicator (⚠️) | Icons display | Correct symbol |
| 12.2.4 | Implement Companion Lines | Draw lines between companions | Lines display | Correct positions |
| 12.3.1 | Create SizeDataModel | Define mature size for plants | Model complete | Validates |
| 12.3.2 | Implement Size Visualization | Render plants at scale | Size renders | Proportions correct |
| 12.3.3 | Implement Size Adjustment | Allow changing plant size | Adjustment works | Size updates |
| 12.3.4 | Implement Size Legend | Show scale reference | Legend renders | Reference correct |
| 12.4.1 | Create DesignStorageService | Service for saving designs | Service works | Saves correctly |
| 12.4.2 | Implement Save Design | Save canvas to Core Data | Save works | Data persists |
| 12.4.3 | Implement Load Design | Load design from Core Data | Load works | Data restores |
| 12.4.4 | Implement Design List | List saved designs | List renders | Designs display |
| 12.5.1 | Create ExportService | Service for design export | Service works | Export generates |
| 12.5.2 | Implement JSON Export | Export design as JSON | Export works | Valid JSON |
| 12.5.3 | Implement Image Export | Export canvas as PNG/JPEG | Export works | Image generated |
| 12.5.4 | Implement PDF Export | Export canvas as PDF | Export works | PDF generated |
| 12.6.1 | Implement Undo Manager | Cocoa-style undo/redo | Undo works | Actions undo |
| 12.6.2 | Implement Redo Manager | Cocoa-style redo | Redo works | Actions redo |
| 12.6.3 | Implement Undo UI | Toolbar buttons for undo/redo | UI works | Buttons enable |
| 12.6.4 | Limit Undo History | Cap history to prevent memory issues | Limit works | History capped |
| 12.7.1 | Create AreaCalculator | Calculate total and used area | Calculator works | Values correct |
| 12.7.2 | Display Area Stats | Show area used/remaining | Display works | Values correct |
| 12.7.3 | Implement Progress Ring | Visual for area usage | Ring renders | Percentage correct |
| 12.7.4 | Implement Plant Count | Show count by type | Count works | Values correct |
| 12.8.1 | Create TemplateGalleryView | View for pre-built layouts | View renders | Templates display |
| 12.8.2 | Implement Raised Bed Template | 4x8 raised bed layout | Template works | Applies correctly |
| 12.8.3 | Implement Square Foot Template | Square foot gardening grid | Template works | Applies correctly |
| 12.8.4 | Implement Container Garden Template | Container arrangement | Template works | Applies correctly |
| 12.9.1 | Create Delete Confirmation | Confirm before deleting design | Confirm shows | Works correctly |
| 12.9.2 | Implement Design Deletion | Delete saved design | Delete works | Design removed |
| 12.9.3 | Implement Design Rename | Rename saved design | Rename works | Name updates |
| 12.9.4 | Implement Design Duplicate | Copy design | Duplicate works | Copy created |
| 12.10.1 | Write Spacing Tests | Test spacing validation | Tests pass | Correct warnings |
| 12.10.2 | Write Export Tests | Test export functionality | Tests pass | Files generate |
| 12.10.3 | Write Save/Load Tests | Test persistence | Tests pass | Data restores |
| 12.10.4 | Write Undo/Redo Tests | Test undo functionality | Tests pass | Actions undo |

**Sprint 12 Validation**: 28 tasks complete, advanced features functional, spacing warnings, companions, save/load, export working.

---

### Sprint 13: Garden List & Management (iOS)

**Sprint Goal**: Complete garden management with creation, editing, templates, and statistics.

**Validation Criteria**:
- Gardens create, edit, delete
- Templates work
- Statistics display
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 13.1.1 | Create AddGardenFormView | Form with name, dimensions, type, climate zone | Form renders | Fields display |
| 13.1.2 | Create GardenTypePicker | Picker for garden type (raised bed, in-ground, container) | Picker renders | Selection works |
| 13.1.3 | Implement Form Validation | Validate required fields | Validation works | Invalid rejected |
| 13.1.4 | Implement Garden Creation | Create garden entity | Creation works | Garden saved |
| 13.2.1 | Create GardenDetailView | Detail view with plants, stats, actions | View renders | Info complete |
| 13.2.2 | Create GardenHeaderView | Header with name, type, dimensions | Header renders | Info correct |
| 13.2.3 | Create GardenPlantsSection | Section showing plants in garden | Section renders | Plants display |
| 13.2.4 | Create GardenActionsSection | Quick actions (edit, design, share) | Section renders | Actions work |
| 13.3.1 | Create EditGardenView | Pre-filled form for editing | View renders | Data pre-fills |
| 13.3.2 | Implement Garden Update | Save edited garden | Update works | Changes persist |
| 13.3.3 | Implement Dimension Update | Update garden dimensions | Update works | Dimensions change |
| 13.3.4 | Implement Plant Transfer | Move plants when garden changes | Transfer works | Plants move |
| 13.4.1 | Create DeleteConfirmationView | Alert for garden deletion | Alert shows | Warning displays |
| 13.4.2 | Implement Plant Transfer Dialog | Dialog for choosing target garden | Dialog renders | Selection works |
| 13.4.3 | Implement Garden Deletion | Delete garden with plant transfer | Deletion works | Garden removed |
| 13.4.4 | Handle Empty Transfer | Handle case with no target garden | Handling works | Plants preserved |
| 13.5.1 | Create TemplateGalleryViewModel | Fetch available templates | ViewModel works | Templates load |
| 13.5.2 | Create TemplatePreviewView | Preview image of template | Preview renders | Image visible |
| 13.5.3 | Implement Template Application | Apply template to create garden | Application works | Garden created |
| 13.5.4 | Create Custom Template | Save current design as template | Custom works | Template saved |
| 13.6.1 | Create QuickActionButton | Reusable action button | Button renders | Action works |
| 13.6.2 | Create Quick Water Button | Quick action to log watering | Action works | Task created |
| 13.6.3 | Create Quick Fertilize Button | Quick action to log fertilizing | Action works | Task created |
| 13.6.4 | Create Design Button | Quick action to open design | Action works | Opens design |
| 13.7.1 | Implement Garden Search | Search gardens by name | Search works | Results correct |
| 13.7.2 | Implement Sort Options | Sort by name, plant count, date | Sort works | Order correct |
| 13.7.3 | Implement Filter | Filter by garden type | Filter works | Results correct |
| 13.8.1 | Create GardenStatisticsViewModel | Calculate garden statistics | ViewModel works | Stats calculate |
| 13.8.2 | Create Statistics Overview | Display plant count, types, health | View renders | Values correct |
| 13.8.3 | Create Health Distribution | Chart showing plant health distribution | Chart renders | Distribution correct |
| 13.8.4 | Create Care Needs Summary | Summary of upcoming care | Summary renders | Tasks listed |
| 13.9.1 | Implement Duplicate Garden | Copy existing garden | Duplicate works | Copy created |
| 13.9.2 | Preserve Plant Data | Ensure plants copy correctly | Preservation works | Data intact |
| 13.9.3 | Update Name on Copy | Append "Copy" to name | Update works | Name correct |
| 13.10.1 | Create Garden CRUD UITests | Test garden workflows | Tests pass | All work |
| 13.10.2 | Create Template UITest | Test template application | Test passes | Template works |
| 13.10.3 | Create Statistics UITest | Test statistics display | Test passes | Stats correct |
| 13.10.4 | Write Garden Model Tests | Test garden models | Tests pass | Coverage >90% |

**Sprint 13 Validation**: 25 tasks complete, garden management complete, templates working, statistics displaying.

---

## Phase 4: Recommendations & Intelligence

### Sprint 14: Weather Integration (iOS)

**Sprint Goal**: Integrate weather data for smart care recommendations and alerts.

**Validation Criteria**:
- Weather fetches and displays
- Alerts trigger
- Integrates with care
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 14.1.1 | Configure Weather API | Setup OpenWeatherMap API client | Client configured | API responds |
| 14.1.2 | Create WeatherService | Service for fetching weather data | Service works | Data returns |
| 14.1.3 | Implement API Key Storage | Secure storage for API key | Key stored | Not in code |
| 14.2.1 | Create CurrentWeatherViewModel | Fetch and parse current weather | ViewModel works | Data parses |
| 14.2.2 | Create CurrentWeatherView | Display current conditions | View renders | Conditions show |
| 14.2.3 | Create WeatherIconView | Display weather icon | Icon displays | Correct symbol |
| 14.2.4 | Create TemperatureView | Display temperature with feels-like | View renders | Values correct |
| 14.3.1 | Create ForecastViewModel | Fetch and parse 7-day forecast | ViewModel works | Data parses |
| 14.3.2 | Create ForecastView | Display 7-day forecast | View renders | Days display |
| 14.3.3 | Create DailyForecastRow | Individual day forecast | Row renders | Data correct |
| 14.3.4 | Create HourlyForecastView | Display hourly forecast | View renders | Hours display |
| 14.4.1 | Create WeatherAlertViewModel | Parse weather warnings | ViewModel works | Alerts detect |
| 14.4.2 | Create WeatherAlertView | Display active alerts | View renders | Alerts show |
| 14.4.3 | Implement Frost Alert | Alert for predicted frost | Alert triggers | At correct time |
| 14.4.4 | Implement Heat Alert | Alert for predicted heat | Alert triggers | At correct time |
| 14.4.5 | Implement Rain Alert | Alert for rain expected | Alert triggers | At correct time |
| 14.5.1 | Create WeatherCareAdjuster | Adjust care based on weather | Adjuster works | Recommendations |
| 14.5.2 | Implement Rain Skip | Skip watering if rain expected | Skip works | Task skipped |
| 14.5.3 | Implement Heat Adjustment | Increase watering in heat | Adjustment works | Frequency up |
| 14.5.4 | Implement Frost Protection | Suggest covering plants | Suggestion works | Message shows |
| 14.6.1 | Create WeatherDetailView | Full weather detail view | View renders | Details complete |
| 14.6.2 | Create HumidityDisplay | Display humidity level | Display renders | Value correct |
| 14.6.3 | Create WindDisplay | Display wind speed | Display renders | Value correct |
| 14.6.4 | Create UVIndexDisplay | Display UV index | Display renders | Value correct |
| 14.7.1 | Configure Push Notifications | Register for weather alerts | Registration works | Alerts enabled |
| 14.7.2 | Implement Alert Scheduling | Schedule notification for alerts | Scheduling works | Alerts fire |
| 14.7.3 | Implement Alert Actions | Actions for weather alerts | Actions work | Respond correctly |
| 14.7.4 | Create Notification Preferences | User settings for weather notifs | Preferences save | Settings work |
| 14.8.1 | Create WeatherHistoryService | Store historical weather | Service works | Data saves |
| 14.8.2 | Create WeatherHistoryView | Display historical weather | View renders | History shows |
| 14.8.3 | Implement History Export | Export weather history | Export works | File generates |
| 14.9.1 | Create ClimateZoneMatcher | Match plants to climate zone | Matcher works | Recommendations |
| 14.9.2 | Implement Zone Display | Show user's climate zone | Display works | Zone shows |
| 14.9.3 | Implement Plant Suggestions | Suggest plants for zone | Suggestions work | Relevant results |
| 14.10.1 | Write Weather API Tests | Test weather service | Tests pass | Correct data |
| 14.10.2 | Write Alert Tests | Test alert triggering | Tests pass | Alerts fire |
| 14.10.3 | Write Care Adjustment Tests | Test care adjustments | Tests pass | Adjustments work |
| 14.10.4 | Write Weather UI Tests | Test weather views | Tests pass | Render correctly |

**Sprint 14 Validation**: 29 tasks complete, weather integration functional, alerts working, care adjustments active.

---

### Sprint 15: Care Recommendations Engine (iOS)

**Sprint Goal**: Implement intelligent care recommendations based on plant data and weather.

**Validation Criteria**:
- Recommendations generate
- Notify correctly
- Prioritize properly
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 15.1.1 | Create RecommendationModel | Define types: watering, fertilizing, pruning, pest, seasonal | Models complete | Validates |
| 15.1.2 | Create RecommendationPriority | Define priority levels (urgent, high, medium, low) | Priorities defined | Clear levels |
| 15.1.3 | Create RecommendationSource | Track source (weather, schedule, plant needs) | Sources defined | Attribution works |
| 15.2.1 | Create WateringRecommendationService | Generate watering suggestions | Service works | Recommendations |
| 15.2.2 | Implement Soil Moisture Check | Consider soil moisture data | Check works | Accurate |
| 15.2.3 | Implement Weather Integration | Adjust for rain/temperature | Integration works | Adjustments |
| 15.2.4 | Implement Plant Type Logic | Consider plant-specific needs | Logic works | Relevant |
| 15.3.1 | Create FertilizingRecommendationService | Generate fertilizing suggestions | Service works | Recommendations |
| 15.3.2 | Implement Growth Stage Logic | Adjust for plant growth stage | Logic works | Timing correct |
| 15.3.3 | Implement Seasonal Logic | Adjust for season | Logic works | Timing correct |
| 15.3.4 | Implement Soil Test Integration | Consider soil test results | Integration works | Recommendations |
| 15.4.1 | Create SeasonalRecommendationService | Generate seasonal care tips | Service works | Tips relevant |
| 15.4.2 | Implement Seasonal Tasks | Generate seasonal task list | Tasks generate | Complete list |
| 15.4.3 | Implement Seasonal Warnings | Generate seasonal warnings | Warnings generate | Timely |
| 15.4.4 | Implement Harvest Timing | Suggest harvest windows | Timing works | Accurate |
| 15.5.1 | Create RecommendationNotificationService | Notify users of recommendations | Service works | Notifs send |
| 15.5.2 | Implement Notification Grouping | Group similar recommendations | Grouping works | Notifs combined |
| 15.5.3 | Implement Notification Timing | Schedule at optimal times | Timing works | User-friendly |
| 15.5.4 | Implement Notification Channels | Separate channels for types | Channels work | Organized |
| 15.6.1 | Create DismissConfirmationView | Confirm dismissal with optional feedback | View renders | Feedback options |
| 15.6.2 | Implement Dismiss Action | Dismiss recommendation | Action works | Removed from list |
| 15.6.3 | Implement Feedback Collection | Collect reason for dismissal | Feedback saves | Analyzable |
| 15.6.4 | Implement Adaptive Learning | Adjust recommendations based on feedback | Learning works | Improves over time |
| 15.7.1 | Create RecommendationsListViewModel | Fetch and organize recommendations | ViewModel works | Data organizes |
| 15.7.2 | Create RecommendationsListView | Display all recommendations | View renders | List displays |
| 15.7.3 | Create RecommendationCardView | Individual recommendation card | Card renders | Info complete |
| 15.7.4 | Create EmptyRecommendationsView | Placeholder when no recommendations | View renders | Message shows |
| 15.8.1 | Implement Priority Sorting | Sort by priority level | Sorting works | Urgent first |
| 15.8.2 | Implement Time Sorting | Sort by due date | Sorting works | Soonest first |
| 15.8.3 | Implement Category Grouping | Group by category | Grouping works | Organized |
| 15.8.4 | Implement Search | Search recommendations | Search works | Finds correctly |
| 15.9.1 | Create RecommendationActionView | View with quick actions for recommendations | View renders | Actions work |
| 15.9.2 | Implement Complete Action | Mark recommendation as done | Action works | Task created |
| 15.9.3 | Implement Snooze Action | Snooze recommendation | Action works | New time set |
| 15.9.4 | Implement Schedule Action | Add to calendar | Action works | Event created |
| 15.10.1 | Write Recommendation Generation Tests | Test recommendation services | Tests pass | Correct output |
| 15.10.2 | Write Notification Tests | Test notification triggering | Tests pass | Notifs fire |
| 15.10.3 | Write Priority Tests | Test prioritization logic | Tests pass | Order correct |
| 15.10.4 | Write Recommendation UITests | Test recommendation UI | Tests pass | UI works |

**Sprint 15 Validation**: 29 tasks complete, recommendations generate, notify, prioritize, and act correctly.

---

### Sprint 16: Smart Plant Suggestions (iOS)

**Sprint Goal**: Implement intelligent plant suggestions based on user preferences and conditions.

**Validation Criteria**:
- Suggestions work with preferences
- Climate, light, space matching
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 16.1.1 | Create UserPreferenceModel | Define preference data model | Model complete | Validates |
| 16.1.2 | Create PreferenceService | Service for managing preferences | Service works | Saves correctly |
| 16.1.3 | Implement Preference Storage | Store preferences in UserDefaults | Storage works | Persists |
| 16.2.1 | Create ClimateZoneService | Determine user's climate zone | Service works | Zone determined |
| 16.2.2 | Implement Hardiness Mapping | Map zone to plant suitability | Mapping works | Accurate |
| 16.2.3 | Implement Climate Filters | Filter plants by zone | Filters work | Relevant results |
| 16.3.1 | Create LightLevelService | Determine light conditions | Service works | Level determined |
| 16.3.2 | Implement Light Mapping | Map light to plant requirements | Mapping works | Accurate |
| 16.3.3 | Implement Light Filters | Filter plants by light | Filters work | Relevant results |
| 16.4.1 | Create DifficultyLevelService | Define difficulty levels | Service works | Levels clear |
| 16.4.2 | Implement Difficulty Mapping | Map skill to plant difficulty | Mapping works | Accurate |
| 16.4.3 | Implement Difficulty Filters | Filter by difficulty | Filters work | Relevant results |
| 16.5.1 | Create SpaceRecommendationService | Suggest plants based on space | Service works | Suggestions |
| 16.5.2 | Implement Space Calculation | Calculate available space | Calculation works | Accurate |
| 16.5.3 | Implement Spacing Rules | Apply spacing requirements | Rules work | Valid suggestions |
| 16.5.4 | Implement Container Suggestions | Suggest for containers | Suggestions work | Container plants |
| 16.6.1 | Create SuggestionsListViewModel | Fetch and score suggestions | ViewModel works | Scores calculate |
| 16.6.2 | Create SuggestionsListView | Display suggestions with scores | View renders | List displays |
| 16.6.3 | Create SuggestionCardView | Individual suggestion card | Card renders | Info complete |
| 16.6.4 | Create SuggestionDetailView | Full suggestion details | View renders | Details complete |
| 16.7.1 | Implement Match Score Display | Show match percentage | Display works | Score correct |
| 16.7.2 | Implement Match Reasons | Show why plant is suggested | Reasons display | Clear |
| 16.7.3 | Implement Comparison View | Compare multiple suggestions | View works | Comparison clear |
| 16.8.1 | Implement Like Action | Like a suggestion | Action works | Saved |
| 16.8.2 | Implement Dislike Action | Dislike a suggestion | Action works | Saved |
| 16.8.3 | Implement Feedback Storage | Store feedback for learning | Storage works | Analyzable |
| 16.8.4 | Implement Adaptive Suggestions | Adjust based on feedback | Adaptation works | Improves |
| 16.9.1 | Create PlantingCalendarView | Show what to plant each season | View renders | Calendar displays |
| 16.9.2 | Implement Seasonal Logic | Generate seasonal list | Logic works | Complete list |
| 16.9.3 | Implement Planting Window | Show optimal planting windows | Display works | Accurate |
| 16.9.4 | Implement Succession Planting | Suggest succession planting | Suggestions work | Relevant |
| 16.10.1 | Write Suggestion Engine Tests | Test suggestion logic | Tests pass | Correct output |
| 16.10.2 | Write Matching Tests | Test matching algorithms | Tests pass | Accurate |
| 16.10.3 | Write Preference Tests | Test preference handling | Tests pass | Storage works |
| 16.10.4 | Write Suggestion UITests | Test suggestion UI | Tests pass | UI works |

**Sprint 16 Validation**: 28 tasks complete, smart suggestions working with preferences, climate, light, space.

---

## Phase 5: Web Application

### Sprint 17: Web Project Setup & UI Shell

**Sprint Goal**: Set up React web project with routing, state management, and UI shell.

**Validation Criteria**:
- Web app shell complete
- Routing works
- Plants and wiki display
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 17.1.1 | Initialize React with TypeScript | Create new React project with TypeScript | Project creates | Runs successfully |
| 17.1.2 | Configure TypeScript | Setup tsconfig.json with strict mode | TypeScript compiles | No errors |
| 17.1.3 | Configure Build Tools | Setup webpack/vite optimization | Build succeeds | Optimized |
| 17.2.1 | Setup React Router | Configure react-router-dom with routes | Router works | Navigation works |
| 17.2.2 | Create Route Structure | Define routes for all pages | Routes defined | Match app |
| 17.2.3 | Implement Route Guards | Protect authenticated routes | Guards work | Redirects work |
| 17.3.1 | Setup State Management | Configure Zustand/Redux store | Store works | State persists |
| 17.3.2 | Create Plant Store | Manage plant state | Store works | Actions work |
| 17.3.3 | Create Garden Store | Manage garden state | Store works | Actions work |
| 17.3.4 | Create Auth Store | Manage authentication state | Store works | Auth works |
| 17.4.1 | Create App Layout | Main layout with header, sidebar, content | Layout renders | Structure correct |
| 17.4.2 | Create Header Component | Navigation header | Header renders | Links work |
| 17.4.3 | Create Sidebar Component | Navigation sidebar | Sidebar renders | Links work |
| 17.4.4 | Create Footer Component | App footer | Footer renders | Content correct |
| 17.5.1 | Create Plant List Page | Display plants with search/filter | Page renders | Plants display |
| 17.5.2 | Create Plant List Component | Plant cards grid | Component renders | Cards display |
| 17.5.3 | Create Search Component | Search input with debounce | Component works | Search functions |
| 17.5.4 | Create Filter Component | Filter controls | Component works | Filters work |
| 17.6.1 | Create Plant Detail Page | Display plant details | Page renders | Details show |
| 17.6.2 | Create Plant Info Component | Plant information section | Component renders | Info complete |
| 17.6.3 | Create Plant Care Component | Care information | Component renders | Care shows |
| 17.6.4 | Create Plant Photos Component | Photo gallery | Component renders | Photos display |
| 17.7.1 | Create Wiki Home Page | Wiki categories and search | Page renders | Categories show |
| 17.7.2 | Create Wiki List Page | Wiki entries list | Page renders | Entries display |
| 17.7.3 | Create Wiki Detail Page | Wiki entry details | Page renders | Details show |
| 17.7.4 | Create Wiki Search Component | Search wiki | Component works | Results display |
| 17.8.1 | Create Garden List Page | Display gardens | Page renders | Gardens show |
| 17.8.2 | Create Garden Detail Page | Garden details | Page renders | Details show |
| 17.8.3 | Create Garden Form Page | Create/edit garden | Page renders | Form works |
| 17.9.1 | Define Color Palette | Colors matching iOS theme | Palette defined | Consistent |
| 17.9.2 | Define Typography | Font styles | Typography defined | Consistent |
| 17.9.3 | Create Theme Provider | React context for theming | Provider works | Theme applies |
| 17.9.4 | Implement Dark Mode | Dark mode support | Mode works | Switches correct |
| 17.10.1 | Write Component Unit Tests | Test React components | Tests pass | Coverage >80% |
| 17.10.2 | Write Store Tests | Test state management | Tests pass | State works |
| 17.10.3 | Write Route Tests | Test routing | Tests pass | Navigation works |
| 17.10.4 | Create E2E Tests | Cypress tests for shell | Tests pass | Shell works |

**Sprint 17 Validation**: 30 tasks complete, web shell functional, routing works, plants and wiki display.

---

### Sprint 18: Web Plant Management

**Sprint Goal**: Complete plant CRUD operations on web with API integration.

**Validation Criteria**:
- Web plant management complete
- All CRUD operations work
- Photos upload
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 18.1.1 | Create Add Plant Form | Form with all plant fields | Form renders | Fields display |
| 18.1.2 | Implement Form Validation | Validate all inputs | Validation works | Invalid rejected |
| 18.1.3 | Implement Form Submission | Submit to API | Submission works | Plant created |
| 18.1.4 | Create Success/Error Handling | Show feedback messages | Handling works | Messages show |
| 18.2.1 | Create Edit Plant Form | Pre-filled form for editing | Form renders | Data pre-fills |
| 18.2.2 | Implement Update Submission | Submit changes to API | Update works | Changes persist |
| 18.2.3 | Implement Cancel Handling | Discard changes | Handling works | Navigates away |
| 18.3.1 | Implement Delete Confirmation | Modal for delete confirmation | Modal shows | Confirm works |
| 18.3.2 | Implement Delete Action | Call API to delete | Action works | Plant removed |
| 18.3.3 | Handle Cascade Deletion | Handle related data | Handling works | UI updates |
| 18.4.1 | Create Photo Upload Component | File input for photos | Component renders | Input works |
| 18.4.2 | Implement Preview | Show selected image | Preview works | Image displays |
| 18.4.3 | Implement Upload Progress | Progress bar for upload | Progress works | Shows status |
| 18.4.4 | Implement Multiple Uploads | Upload multiple photos | Uploads work | All upload |
| 18.5.1 | Create Care Task List | Display care tasks | List renders | Tasks show |
| 18.5.2 | Create Add Care Task Form | Form to add care task | Form renders | Works correctly |
| 18.5.3 | Implement Complete Action | Mark task complete | Action works | Task updates |
| 18.5.4 | Implement Delete Action | Delete care task | Action works | Task removed |
| 18.6.1 | Create Calendar View | Display care schedule | View renders | Calendar shows |
| 18.6.2 | Implement Month Navigation | Navigate months | Navigation works | Changes month |
| 18.6.3 | Implement Task Display | Show tasks on calendar | Display works | Tasks visible |
| 18.6.4 | Implement Click Details | Show task details on click | Details work | Modal shows |
| 18.7.1 | Create Notes List | Display notes | List renders | Notes show |
| 18.7.2 | Create Note Editor | Create/edit notes | Editor works | Text saves |
| 18.7.3 | Implement Rich Text | Bold, italic formatting | Formatting works | Styles apply |
| 18.7.4 | Implement Plant Linking | Link notes to plants | Linking works | Associated |
| 18.8.1 | Implement Search | Search plants by name | Search works | Results correct |
| 18.8.2 | Implement Filter | Filter by status/type | Filter works | Results filter |
| 18.8.3 | Implement Sort | Sort results | Sort works | Order changes |
| 18.8.4 | Implement Pagination | Paginate results | Pagination works | Pages navigate |
| 18.9.1 | Create Filter Controls | Filter dropdowns/checkboxes | Controls render | Options work |
| 18.9.2 | Create Sort Controls | Sort dropdown | Controls render | Options work |
| 18.9.3 | Implement Active Filters | Show active filters | Display works | Clear works |
| 18.9.4 | Implement Clear All | Clear all filters | Action works | Filters reset |
| 18.10.1 | Write API Integration Tests | Test API calls | Tests pass | Calls work |
| 18.10.2 | Write Form Tests | Test form validation | Tests pass | Validates |
| 18.10.3 | Write Component Tests | Test React components | Tests pass | Render correctly |
| 18.10.4 | Create E2E Tests | Cypress for plant workflows | Tests pass | Full workflows |

**Sprint 18 Validation**: 28 tasks complete, web plant management functional, all CRUD operations work.

---

### Sprint 19: Web Garden Design

**Sprint Goal**: Implement garden design functionality on web with canvas, drag-drop, and export.

**Validation Criteria**:
- Web garden design complete
- All features working
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 19.1.1 | Create Canvas Component | HTML5 canvas for drawing | Component renders | Canvas works |
| 19.1.2 | Configure Canvas Size | Set dimensions | Size configured | Fits container |
| 19.1.3 | Create Canvas Controls | Zoom, pan controls | Controls render | Work correctly |
| 19.1.4 | Create Grid Overlay | Grid pattern on canvas | Overlay renders | Grid visible |
| 19.2.1 | Create Plant Palette | Sidebar with draggable plants | Palette renders | Plants show |
| 19.2.2 | Implement HTML5 Drag | Native drag and drop | Drag works | Transfer works |
| 19.2.3 | Implement Drop Detection | Detect drop on canvas | Detection works | Position correct |
| 19.2.4 | Implement Ghost Image | Preview while dragging | Ghost shows | Position tracks |
| 19.3.1 | Create Plant Item Component | Draggable plant item | Component works | Draggable |
| 19.3.2 | Create Category Tabs | Group plants by category | Tabs work | Filter works |
| 19.3.3 | Create Search Component | Search palette | Component works | Filters plants |
| 19.3.4 | Create Plant Details | Quick info on hover | Details show | Info correct |
| 19.4.1 | Implement Selection | Click to select | Selection works | Plant selected |
| 19.4.2 | Implement Multi-Select | Shift-click for multiple | Selection works | Multiple |
| 19.4.3 | Implement Properties Panel | Show selected properties | Panel renders | Properties show |
| 19.4.4 | Implement Edit Actions | Edit selected plants | Actions work | Changes apply |
| 19.5.1 | Create Save Design API | Save design to backend | API call works | Saves correctly |
| 19.5.2 | Create Load Design API | Load design from backend | API call works | Loads correctly |
| 19.5.3 | Create Design List | List saved designs | List renders | Designs show |
| 19.5.4 | Implement Auto-Save | Save changes automatically | Auto-save works | No data lost |
| 19.6.1 | Create Export Service | Export design | Service works | Generates file |
| 19.6.2 | Implement Image Export | Export as PNG/JPEG | Export works | Image generates |
| 19.6.3 | Implement PDF Export | Export as PDF | Export works | PDF generates |
| 19.6.4 | Implement JSON Export | Export as JSON | Export works | JSON generates |
| 19.7.1 | Display Companion Icons | Show companion indicators | Icons display | Correct symbols |
| 19.7.2 | Display Antagonist Icons | Show antagonist indicators | Icons display | Correct symbols |
| 19.7.3 | Implement Companion Lines | Draw lines between companions | Lines display | Correct positions |
| 19.7.4 | Create Companion Panel | Panel showing relationships | Panel renders | Relationships show |
| 19.8.1 | Implement Spacing Zones | Calculate occupied space | Zones calculate | Display correct |
| 19.8.2 | Display Warnings | Show spacing violations | Warnings display | Clear indication |
| 19.8.3 | Implement Snap to Grid | Snap plants to grid | Snap works | Aligns correctly |
| 19.8.4 | Implement Measurement Display | Show measurements | Display works | Values correct |
| 19.9.1 | Create Garden CRUD | Garden management on web | CRUD works | All operations |
| 19.9.2 | Create Garden Form | Create/edit gardens | Form works | Saves correctly |
| 19.9.3 | Implement Garden Selection | Select active garden | Selection works | Canvas updates |
| 19.9.4 | Create Garden Settings | Configure garden settings | Settings work | Apply correctly |
| 19.10.1 | Write Canvas Tests | Test canvas rendering | Tests pass | No artifacts |
| 19.10.2 | Write Drag-Drop Tests | Test drag and drop | Tests pass | Works correctly |
| 19.10.3 | Write Export Tests | Test export functionality | Tests pass | Files generate |
| 19.10.4 | Create E2E Tests | Cypress for design workflow | Tests pass | Full workflow |

**Sprint 19 Validation**: 30 tasks complete, web garden design functional, all features working.

---

### Sprint 20: Web Authentication & User Management

**Sprint Goal**: Implement user accounts, authentication, and cross-device sync.

**Validation Criteria**:
- User accounts work
- Sessions persist
- Settings save
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 20.1.1 | Create Registration Form | Form with email, password, confirm | Form renders | Fields display |
| 20.1.2 | Implement Validation | Validate all inputs | Validation works | Invalid rejected |
| 20.1.3 | Implement Registration API | Call registration endpoint | Call works | User created |
| 20.1.4 | Implement Email Verification | Send verification email | Email sends | User verifies |
| 20.2.1 | Create Login Form | Form with email, password | Form renders | Fields display |
| 20.2.2 | Implement Login API | Call login endpoint | Call works | Token returned |
| 20.2.3 | Implement Token Storage | Store JWT securely | Storage works | Persists |
| 20.2.4 | Implement Auto-Login | Login on return visit | Auto-login works | Token valid |
| 20.3.1 | Create Reset Request Form | Request password reset | Form renders | Email sends |
| 20.3.2 | Implement Reset Token | Generate reset token | Token generated | Email sends |
| 20.3.3 | Create Reset Form | Enter new password | Form renders | Password resets |
| 20.3.4 | Implement Password Policy | Enforce password requirements | Policy enforced | Meets criteria |
| 20.4.1 | Create Profile Page | Display user info | Page renders | Info shows |
| 20.4.2 | Create Edit Profile Form | Edit user info | Form works | Updates save |
| 20.4.3 | Implement Avatar Upload | Upload profile picture | Upload works | Image saves |
| 20.4.4 | Create Delete Account | Delete user account | Delete works | Account removed |
| 20.5.1 | Implement Session Storage | Store session data | Storage works | Persists |
| 20.5.2 | Implement Session Timeout | Auto-logout after inactivity | Timeout works | Logs out |
| 20.5.3 | Implement Refresh Token | Refresh expired tokens | Refresh works | New token |
| 20.5.4 | Implement Logout | Clear session | Logout works | Token cleared |
| 20.6.1 | Create Settings Page | Account settings | Page renders | Settings show |
| 20.6.2 | Create Notification Settings | Configure notifications | Settings save | Persist |
| 20.6.3 | Create Privacy Settings | Privacy controls | Settings save | Persist |
| 20.6.4 | Create Theme Settings | Theme preferences | Settings save | Persist |
| 20.7.1 | Implement Password Change | Change password form | Form works | Password changes |
| 20.7.2 | Implement Email Change | Change email form | Form works | Email updates |
| 20.7.3 | Implement Two-Factor Auth | 2FA setup | Setup works | 2FA enabled |
| 20.7.4 | Implement Connected Accounts | Link social accounts | Linking works | Accounts link |
| 20.8.1 | Implement Data Export | Export user data | Export works | File generates |
| 20.8.2 | Implement Data Import | Import user data | Import works | Data loads |
| 20.8.3 | Create Export Formats | JSON, CSV formats | Formats work | Both work |
| 20.8.4 | Implement Export Progress | Progress indicator | Progress shows | Accurate |
| 20.9.1 | Configure Rate Limits | API rate limiting | Limits configured | Enforced |
| 20.9.2 | Configure Account Lockout | Lock after failed attempts | Lockout works | Accounts lock |
| 20.9.3 | Implement Audit Logging | Log user actions | Logging works | Actions logged |
| 20.9.4 | Implement Security Headers | HTTP security headers | Headers set | Verified |
| 20.10.1 | Write Auth Unit Tests | Test auth functions | Tests pass | Functions work |
| 20.10.2 | Write Auth Integration Tests | Test auth flows | Tests pass | Flows work |
| 20.10.3 | Write Security Tests | Test security features | Tests pass | Secure |
| 20.10.4 | Create E2E Auth Tests | Cypress for auth | Tests pass | Full auth flow |

**Sprint 20 Validation**: 30 tasks complete, authentication functional, user management complete, security implemented.

---

## Phase 6: Integration & Polish

### Sprint 21: Cross-Platform Sync

**Sprint Goal**: Implement sync between iOS and web platforms through cloud backend.

**Validation Criteria**:
- Platforms sync bidirectionally
- Conflicts resolve
- Offline works
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 21.1.1 | Define Sync Protocol | Document how data syncs between platforms | Protocol documented | Team approval |
| 21.1.2 | Create Sync Data Models | Define sync state, conflict data | Models complete | Validates |
| 21.1.3 | Create Sync API Endpoints | Endpoints for push/pull sync | Endpoints work | Calls succeed |
| 21.2.1 | Create Cloud Sync Service | Service for syncing to server | Service works | Data syncs |
| 21.2.2 | Implement Push Sync | Send local changes to server | Push works | Changes upload |
| 21.2.3 | Implement Pull Sync | Fetch remote changes | Pull works | Changes download |
| 21.2.4 | Implement Full Sync | Complete data synchronization | Full sync works | All data syncs |
| 21.3.1 | Implement Last-Write-Wins | Simple conflict resolution | Resolution works | Consistent |
| 21.3.2 | Implement Manual Resolution | User chooses winner | Resolution works | User decides |
| 21.3.3 | Implement Field-Level Merge | Merge changes per field | Merge works | Combined |
| 21.3.4 | Implement Conflict History | Track conflicts for review | History works | Review possible |
| 21.4.1 | Create Sync Status Indicator | Show sync state in UI | Indicator shows | State correct |
| 21.4.2 | Create Last Sync Time | Show when last synced | Display works | Time correct |
| 21.4.3 | Create Sync Errors View | Show sync errors | View renders | Errors clear |
| 21.4.4 | Implement Retry Action | Retry failed sync | Retry works | Sync succeeds |
| 21.5.1 | Create Offline Storage | Store changes locally when offline | Storage works | Changes saved |
| 21.5.2 | Implement Queue Management | Queue changes for sync | Queue works | Order maintained |
| 21.5.3 | Implement Conflict Detection | Detect conflicts while offline | Detection works | Flags conflicts |
| 21.5.4 | Implement Online Detection | Detect when back online | Detection works | Sync triggers |
| 21.6.1 | Setup Service Worker | PWA service worker | Worker registers | Caches work |
| 21.6.2 | Implement Caching Strategy | Cache API responses | Caching works | Offline reads |
| 21.6.3 | Implement Background Sync | Sync when app not open | Sync works | Updates occur |
| 21.6.4 | Create Offline Indicator | Show offline status | Indicator shows | State correct |
| 21.7.1 | Create Sync Debug Panel | Developer tool for sync | Panel works | Info displays |
| 21.7.2 | Create Sync Log Viewer | View sync history | Viewer works | Log shows |
| 21.7.3 | Implement Manual Sync Trigger | Force sync now | Trigger works | Sync runs |
| 21.7.4 | Create Data Viewer | View raw sync data | Viewer works | Data visible |
| 21.8.1 | Implement Chunked Upload | Upload large photos in chunks | Chunking works | Uploads complete |
| 21.8.2 | Implement Resume Upload | Resume interrupted uploads | Resume works | Continues |
| 21.8.3 | Implement Compression | Compress before upload | Compression works | Size reduced |
| 21.8.4 | Implement Progress Tracking | Track upload progress | Tracking works | Accurate |
| 21.9.1 | Write Sync Unit Tests | Test sync logic | Tests pass | Correct output |
| 21.9.2 | Write Conflict Tests | Test conflict resolution | Tests pass | Resolves |
| 21.9.3 | Write Offline Tests | Test offline behavior | Tests pass | Works offline |
| 21.9.4 | Create E2E Sync Tests | Test full sync flow | Tests pass | Sync works |

**Sprint 21 Validation**: 28 tasks complete, cross-platform sync working, conflicts resolve, offline functional.

---

### Sprint 22: Performance Optimization

**Sprint Goal**: Optimize app performance for large datasets and smooth UX.

**Validation Criteria**:
- Performance meets targets
- Profiling complete
- Optimizations documented
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 22.1.1 | Profile iOS Startup | Measure startup time | Profile complete | Time recorded |
| 22.1.2 | Profile iOS Memory | Check memory usage | Profile complete | Usage recorded |
| 22.1.3 | Profile iOS UI | Check view rendering time | Profile complete | Times recorded |
| 22.1.4 | Profile iOS Database | Check Core Data performance | Profile complete | Times recorded |
| 22.2.1 | Profile Web Load | Measure page load time | Profile complete | Time recorded |
| 22.2.2 | Profile Web Memory | Check memory usage | Profile complete | Usage recorded |
| 22.2.3 | Profile Web Bundle | Analyze bundle size | Profile complete | Size recorded |
| 22.2.4 | Profile API Response | Measure endpoint latency | Profile complete | Times recorded |
| 22.3.1 | Implement iOS Lazy Loading | Lazy load plant lists | Loading works | Memory improved |
| 22.3.2 | Implement Image Lazy Loading | Lazy load images | Loading works | Memory improved |
| 22.3.3 | Implement Pagination API | Paginate list endpoints | Pagination works | Faster loads |
| 22.3.4 | Implement Virtual Scrolling | Only render visible items | Scrolling works | Memory improved |
| 22.4.1 | Implement Code Splitting | Split web bundle | Splitting works | Smaller initial |
| 22.4.2 | Implement Lazy Routes | Lazy load routes | Loading works | Faster initial |
| 22.4.3 | Implement Tree Shaking | Remove unused code | Shaking works | Smaller bundle |
| 22.4.4 | Implement Asset Optimization | Optimize images/fonts | Optimization works | Smaller assets |
| 22.5.1 | Implement Image Caching | Cache images locally | Caching works | Faster loads |
| 22.5.2 | Implement Thumbnail Generation | Generate thumbnails | Generation works | Thumbnails created |
| 22.5.3 | Implement Progressive Loading | Load images progressively | Loading works | Perceivable faster |
| 22.5.4 | Implement WebP Support | Use WebP format | Support works | Smaller images |
| 22.6.1 | Analyze Core Data Queries | Profile slow queries | Analysis complete | Queries identified |
| 22.6.2 | Add Database Indexes | Index frequently queried columns | Indexes added | Faster queries |
| 22.6.3 | Optimize Fetch Requests | Optimize Core Data requests | Requests optimized | Faster loads |
| 22.6.4 | Implement Batch Processing | Process large data in batches | Processing works | Memory efficient |
| 22.7.1 | Implement Pagination | Paginate API responses | Pagination works | Faster responses |
| 22.7.2 | Implement Caching Headers | Set cache headers | Headers set | Caching works |
| 22.7.3 | Implement Response Compression | Compress JSON responses | Compression works | Smaller responses |
| 22.7.4 | Optimize Database Queries | Optimize SQL queries | Queries optimized | Faster responses |
| 22.8.1 | Implement Background Sync | Sync in background | Sync works | Non-blocking |
| 22.8.2 | Implement Debounced Updates | Batch updates | Debouncing works | Fewer updates |
| 22.8.3 | Implement Priority Queue | Process high priority first | Queue works | Critical first |
| 22.8.4 | Implement Connection Pooling | Pool database connections | Pooling works | Faster queries |
| 22.9.1 | Create Performance Benchmarks | Define performance targets | Benchmarks defined | Measurable |
| 22.9.2 | Create Performance Tests | Tests for performance | Tests pass | Meets targets |
| 22.9.3 | Create CI Performance Checks | Run perf tests in CI | Checks run | Fail if slow |
| 22.9.4 | Create Performance Dashboard | Visualize performance | Dashboard works | Metrics visible |
| 22.10.1 | Document Optimizations | Record all optimizations | Document complete | Clear |
| 22.10.2 | Document Tradeoffs | Record decisions made | Document complete | Clear rationale |
| 22.10.3 | Create Performance Report | Final report | Report complete | Stakeholders informed |
| 22.10.4 | Set Performance Budgets | Define limits | Budgets set | Enforced in CI |

**Sprint 22 Validation**: 30 tasks complete, performance optimized, profiling complete, targets met.

---

### Sprint 23: Accessibility & Internationalization

**Sprint Goal**: Make app accessible and support multiple languages.

**Validation Criteria**:
- Accessibility complete
- Two languages supported
- Tests passing

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 23.1.1 | Audit iOS Accessibility | Test all views with VoiceOver | Audit complete | Issues listed |
| 23.1.2 | Audit iOS Contrast | Check color contrast | Audit complete | Issues listed |
| 23.1.3 | Audit iOS Touch Targets | Check touch target sizes | Audit complete | Issues listed |
| 23.1.4 | Audit iOS Navigation | Test keyboard navigation | Audit complete | Issues listed |
| 23.2.1 | Audit Web Accessibility | Test with axe-core | Audit complete | Issues listed |
| 23.2.2 | Audit Web Contrast | Check color contrast WCAG | Audit complete | Issues listed |
| 23.2.3 | Audit Web Keyboard | Test keyboard navigation | Audit complete | Issues listed |
| 23.2.4 | Audit Web Screen Reader | Test with screen reader | Audit complete | Issues listed |
| 23.3.1 | Add VoiceOver Labels | Label all interactive elements | Labels added | Announce correct |
| 23.3.2 | Add VoiceOver Hints | Provide action hints | Hints added | Guidance clear |
| 23.3.3 | Implement Accessibility Order | Define focus order | Order correct | Logical |
| 23.3.4 | Implement Accessibility Groups | Group related elements | Groups work | Logical |
| 23.4.1 | Implement Keyboard Navigation | All features keyboard accessible | Navigation works | All features |
| 23.4.2 | Implement Focus Indicators | Visible focus states | Indicators work | Clear |
| 23.4.3 | Implement Skip Links | Skip repeated content | Links work | Navigate past |
| 23.4.4 | Implement ARIA Labels | Proper ARIA attributes | Attributes correct | Valid |
| 23.5.1 | Setup iOS String Catalog | Configure for localization | Setup complete | Extracts strings |
| 23.5.2 | Create English Strings | Extract all strings | Strings created | All UI covered |
| 23.5.3 | Create String Keys | Define consistent keys | Keys defined | Consistent |
| 23.5.4 | Create String Validation | Verify all strings extracted | Validation passes | Complete |
| 23.6.1 | Setup Web i18n | Configure i18next | Setup complete | Works correctly |
| 23.6.2 | Create Translation Files | JSON for each language | Files created | All keys |
| 23.6.3 | Create Language Selector | Switch languages | Selector works | Switches correct |
| 23.6.4 | Create Language Detection | Auto-detect locale | Detection works | Sets correct |
| 23.7.1 | Create Spanish Strings | Translate to Spanish | Strings complete | All translated |
| 23.7.2 | Validate Spanish Strings | Verify translations | Validation passes | Correct |
| 23.7.3 | Create French Strings | Translate to French | Strings complete | All translated |
| 23.7.4 | Validate French Strings | Verify translations | Validation passes | Correct |
| 23.8.1 | Test Color Contrast | Verify WCAG AA | Tests pass | Meets AA |
| 23.8.2 | Test Color Contrast | Verify WCAG AAA | Tests pass | Meets AAA |
| 23.8.3 | Test Focus Indicators | Verify visibility | Tests pass | Visible |
| 23.8.4 | Test Touch Targets | Verify size (44x44) | Tests pass | Sized correctly |
| 23.9.1 | Write Accessibility Tests | XCTest accessibility checks | Tests pass | Passes |
| 23.9.2 | Write Axe Tests | Axe-core automated tests | Tests pass | Passes |
| 23.9.3 | Write i18n Tests | Test string extraction | Tests pass | Complete |
| 23.9.4 | Write Language Tests | Test language switching | Tests pass | Switches correct |
| 23.10.1 | Create Accessibility Report | Document compliance | Report complete | Clear |
| 23.10.2 | Create VPAT | Create accessibility statement | Document complete | Stakeholders |
| 23.10.3 | Document Languages | Document supported languages | Document complete | Clear |
| 23.10.4 | Create Translation Guide | Guide for adding languages | Guide complete | Usable |

**Sprint 23 Validation**: 30 tasks complete, accessibility compliant, two languages (English, Spanish), tests passing.

---

### Sprint 24: Final Polish & Launch Prep

**Sprint Goal**: Final polish, bug fixes, documentation, and launch.

**Validation Criteria**:
- All bugs fixed
- UI polished
- Documentation complete
- App launched

**Tasks**:

| ID | Task Name | Description | Completion Criteria | Tests/Validation |
|----|-----------|-------------|---------------------|------------------|
| 24.1.1 | Collect Bug Reports | Aggregate all known bugs | List complete | All known |
| 24.1.2 | Prioritize Bugs | Categorize by severity | Priorities set | Clear |
| 24.1.3 | Fix Critical Bugs | Fix P0/P1 bugs | All fixed | Tests pass |
| 24.1.4 | Fix Major Bugs | Fix P2 bugs | All fixed | Tests pass |
| 24.1.5 | Fix Minor Bugs | Fix P3 bugs | Majority fixed | Tests pass |
| 24.1.6 | Regression Test | Full test suite | Tests pass | No regressions |
| 24.2.1 | UI Review | Review all screens | Review complete | Issues listed |
| 24.2.2 | Fix UI Issues | Address review findings | Fixed | Visual tests |
| 24.2.3 | Animation Polish | Smooth animations | Polished | Perceivable |
| 24.2.4 | Empty States | Design all empty states | States designed | Render correctly |
| 24.2.5 | Error States | Design all error states | States designed | Render correctly |
| 24.2.6 | Loading States | Design all loading states | States designed | Render correctly |
| 24.3.1 | Create App Icon | Design iOS app icon | Icon designed | Meets guidelines |
| 24.3.2 | Create Launch Screen | Design launch screen | Screen designed | Renders correctly |
| 24.3.3 | Create Screenshots | iPhone and iPad screenshots | Created | Meet guidelines |
| 24.3.4 | Create App Description | Write App Store description | Description written | Compelling |
| 24.3.5 | Create Keywords | App Store keywords | Keywords chosen | Relevant |
| 24.3.6 | Create Privacy Policy | Write privacy policy | Policy written | Compliant |
| 24.4.1 | Configure Production | Setup production environment | Configured | Works |
| 24.4.2 | Deploy Web App | Deploy to production | Deployed | Accessible |
| 24.4.3 | Configure CDN | Setup content delivery network | Configured | Faster loads |
| 24.4.4 | Configure SSL | HTTPS certificate | Configured | Secure |
| 24.4.5 | Smoke Tests | Verify production | Tests pass | All accessible |
| 24.5.1 | Create TestFlight | Build for TestFlight | Build succeeds | Uploaded |
| 24.5.2 | Beta Testing | Send to beta testers | Testing complete | Feedback received |
| 24.5.3 | Address Feedback | Fix beta issues | Fixed | Tests pass |
| 24.5.4 | App Store Submission | Submit to App Store | Submitted | In review |
| 24.6.1 | Create User Guide | Write getting started guide | Guide complete | Clear |
| 24.6.2 | Create FAQ | Write frequently asked questions | FAQ complete | Comprehensive |
| 24.6.3 | Create Video Tutorial | Record feature walkthrough | Video complete | Quality |
| 24.6.4 | Create Help Center | Setup help content | Center ready | Accessible |
| 24.7.1 | Create API Docs | Complete API documentation | Docs complete | Accurate |
| 24.7.2 | Create Developer Guide | Setup instructions for devs | Guide complete | Clear |
| 24.7.3 | Create Architecture Doc | Document system architecture | Document complete | Clear |
| 24.7.4 | Create Contributing Guide | Guide for contributors | Guide complete | Clear |
| 24.8.1 | Configure Analytics | Setup analytics tracking | Configured | Tracking |
| 24.8.2 | Configure Error Tracking | Setup error monitoring | Configured | Monitoring |
| 24.8.3 | Create Dashboards | Performance dashboards | Dashboards ready | Visible |
| 24.8.4 | Define Alerts | Set up alerting | Alerts configured | Notifies |
| 24.9.1 | Create Launch Checklist | Comprehensive checklist | Checklist complete | All items |
| 24.9.2 | Verify Checklist | Walk through checklist | Verified | All checked |
| 24.9.3 | Final Sign-off | Stakeholder approval | Approved | Ready to launch |
| 24.10.1 | Launch Web App | Go live | Live | Accessible |
| 24.10.2 | Launch iOS App | Release from App Store | Released | In store |
| 24.10.3 | Monitor Launch | Watch for issues | Monitoring | No issues |
| 24.10.4 | Announce Launch | Public announcement | Announced | Users aware |

**Sprint 24 Validation**: 40 tasks complete, app launched, all documentation ready, monitoring active.

---

## Testing Summary

### iOS Testing Stack

| Test Type | Framework | Coverage Target | Location |
|-----------|-----------|-----------------|----------|
| Unit Tests | XCTest | >90% | PatchTests/ |
| UI Tests | XCUITest | >80% | PatchUITests/ |
| View Tests | ViewInspector | >80% | PatchTests/Views/ |
| Snapshot Tests | ViewInspector | 100% main views | PatchTests/Snapshots/ |
| Integration Tests | XCTest + Core Data | >80% | PatchTests/Integration/ |

### Web Testing Stack

| Test Type | Framework | Coverage Target | Location |
|-----------|-----------|-----------------|----------|
| Unit Tests | Jest | >90% | client/src/__tests__/ |
| Component Tests | React Testing Library | >80% | client/src/**/*.test.tsx |
| Integration Tests | supertest | >90% | server/tests/ |
| E2E Tests | Cypress | >80% | cypress/tests/ |
| Type Tests | TypeScript | 100% | npm run typecheck |

### Backend Testing Stack

| Test Type | Framework | Coverage Target | Location |
|-----------|-----------|-----------------|----------|
| Unit Tests | Jest | >90% | server/src/__tests__/ |
| Integration Tests | supertest | >90% | server/tests/ |
| Database Tests | Jest | >90% | server/tests/db/ |
| Load Tests | Artillery/k6 | Baseline | server/tests/load/ |

### Critical Paths (100% Coverage Required)

1. **Plant Creation Flow**: AddPlantForm → PlantListView → PlantDetailView → Edit → Delete
2. **Care Task Flow**: AddCareTask → CareTaskListView → Complete → History
3. **Photo Flow**: Capture → Gallery → Detail → Delete → Cloud Sync
4. **Wiki Flow**: Browse → Search → Detail → Add to Garden
5. **Design Flow**: Create Design → Add Plant → Save → Load → Export
6. **Auth Flow**: Register → Login → Profile → Settings → Logout
7. **Sync Flow**: Offline Change → Online Sync → Conflict Resolution

---

## Sprint Dependencies Matrix

### Critical Path (Must Complete in Order)

```
Sprint 1 → Sprint 2 → Sprint 3 → Sprint 4 → Sprint 5 → Sprint 6 → Sprint 7 → Sprint 8 → Sprint 9
   ↓           ↓           ↓           ↓           ↓           ↓           ↓           ↓
Sprint 17 → Sprint 18 → Sprint 19 → Sprint 20 → Sprint 21 → Sprint 22 → Sprint 23 → Sprint 24
```

### Parallel Execution Paths

**iOS Core Track** (can run after Sprint 4):
```
Sprint 5 → Sprint 6 → Sprint 7 → Sprint 8 → Sprint 9 → Sprint 10 → Sprint 11 → Sprint 12 → Sprint 13
   ↓           ↓           ↓           ↓           ↓           ↓           ↓           ↓
Sprint 14 → Sprint 15 → Sprint 16 → Sprint 21 → Sprint 22 → Sprint 23 → Sprint 24
```

**Web Track** (can run after Sprint 3):
```
Sprint 17 → Sprint 18 → Sprint 19 → Sprint 20 → Sprint 21 → Sprint 22 → Sprint 23 → Sprint 24
```

### Flexible Tasks (Can Run in Parallel)

- Sprint 10 (Notes) - After Sprint 5
- Sprint 11 (Design Canvas) - After Sprint 5
- Sprint 12 (Design Advanced) - After Sprint 11
- Sprint 13 (Garden Management) - After Sprint 5
- Sprint 14 (Weather) - After Sprint 7
- Sprint 15 (Recommendations) - After Sprint 14
- Sprint 16 (Smart Suggestions) - After Sprint 13

---

## Validation Gates

### Sprint Gate Criteria

Each sprint must pass ALL of:

1. ✅ All unit tests pass (`npm test` / `xcodebuild test`)
2. ✅ All UI tests pass (Cypress / XCUITest)
3. ✅ Code coverage meets targets
4. ✅ No critical (P0) bugs
5. ✅ CI pipeline green
6. ✅ Feature demoable (can show in running app)
7. ✅ Documentation updated (AGENTS.md, README)
8. ✅ Code reviewed and merged to develop

### Phase Gate Criteria

Each phase must pass ALL of:

1. ✅ All sprints in phase complete
2. ✅ Phase integration tests pass
3. ✅ Demo to stakeholders
4. ✅ Phase approved for next

---

## Risk Assessment

### High Risk Areas

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| CloudKit sync issues | Medium | High | Extensive testing, fallback to REST |
| Cross-platform sync conflicts | Medium | High | Clear conflict resolution strategy |
| Performance with large datasets | Low | Medium | Pagination, lazy loading, profiling |
| App Store rejection | Low | Medium | Follow guidelines, accessibility audit |
| Weather API reliability | Low | Medium | Multiple providers, caching |

### Dependency Risks

| Dependency | Risk | Mitigation |
|------------|------|------------|
| Sprint 2 → Sprint 4 | Data models needed for UI | Buffer time, parallel validation |
| Sprint 3 → Sprint 17 | API needed for web | Mock API for early development |
| Sprint 8 → Sprint 9 | Wiki data needed | Minimal seed in Sprint 3 |
| Sprint 14 → Sprint 15 | Weather for recommendations | Swap order if needed |

---

## Success Criteria

### Functional Requirements

- [ ] All 6 primary features implemented (Tracker, Wiki, Notes, Photos, Design, Recommendations)
- [ ] iOS app functional with CloudKit sync
- [ ] Web app functional with REST API
- [ ] Cross-platform sync working
- [ ] Offline mode functional

### Quality Requirements

- [ ] 80%+ test coverage on all platforms
- [ ] 100% critical path coverage
- [ ] No P0 bugs at launch
- [ ] WCAG 2.1 AA accessibility
- [ ] Performance targets met (launch <3s, interaction <100ms)

### Launch Requirements

- [ ] App Store approved
- [ ] Web app deployed
- [ ] Documentation complete
- [ ] Analytics configured
- [ ] Monitoring active

---

## Appendices

### A. Tech Stack Reference

| Layer | iOS | Web | Backend |
|-------|-----|-----|---------|
| Language | Swift 5.9+ | TypeScript 5.x | Node.js 20.x |
| UI | SwiftUI 4 | React 18 | N/A |
| State | Combine | Zustand/Redux | N/A |
| Persistence | Core Data | LocalStorage | PostgreSQL |
| Sync | CloudKit | REST API | N/A |
| Auth | CloudKit | JWT | JWT |
| Testing | XCTest | Jest/Cypress | Jest |

### B. API Endpoint Reference

See OpenAPI specification at `/api/docs` when server is running.

### C. Database Schema

See Prisma schema at `server/prisma/schema.prisma`.

### D. Development Commands

```bash
# iOS
make ios-setup      # Install dependencies
make ios-build      # Build project
make ios-test       # Run tests
make ios-lint       # Run linting

# Web
make web-setup      # Install dependencies
make web-dev        # Start dev server
make web-build      # Production build
make web-test       # Run tests
make web-lint       # Run linting

# Backend
make backend-setup  # Install dependencies
make backend-dev    # Start dev server
make backend-test   # Run tests
make backend-migrate # Run migrations

# All
make setup          # Setup all platforms
make test           # Run all tests
make lint           # Run all linting
```

---

**Document Version**: 1.0  
**Last Updated**: January 2026  
**Next Review**: Before Sprint 1 begins
