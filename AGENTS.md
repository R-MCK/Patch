# Patch - iOS Gardening App

## Project Overview

Patch is an iOS gardening application built with SwiftUI and Core Data with CloudKit sync. It helps users track plants, manage care schedules, browse a plant wiki, take notes, and design garden layouts.

## Tech Stack

| Component | Technology |
|-----------|------------|
| Language | Swift 5.9+ |
| UI Framework | SwiftUI |
| Data Layer | Core Data + CloudKit |
| Minimum iOS | 17.0 |
| Architecture | MVVM |
| Testing | XCTest, ViewInspector |

## Project Structure

```
Patch/
├── PatchApp.swift           # App entry point
├── ContentView.swift        # Root view
├── Models/                  # Core Data entities
│   ├── Plant+CoreData*.swift
│   ├── Garden+CoreData*.swift
│   ├── CareTask+CoreData*.swift
│   ├── Note+CoreData*.swift
│   ├── Photo+CoreData*.swift
│   ├── WikiEntry+CoreData*.swift
│   └── GardenDesign+CoreData*.swift
├── Views/                   # SwiftUI views
│   └── MainTabView.swift
├── ViewModels/              # View models (MVVM)
├── Services/                # Business logic
│   ├── PersistenceController.swift
│   └── Repositories/
│       ├── PlantRepository.swift
│       ├── GardenRepository.swift
│       ├── CareTaskRepository.swift
│       ├── NoteRepository.swift
│       ├── PhotoRepository.swift
│       └── WikiRepository.swift
├── Utils/                   # Utilities and extensions
└── Resources/               # Assets and Core Data model
    └── Patch.xcdatamodeld/
```

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
- Relationships: `garden`, `careTasks`, `plantNotes`, `photos`

### Garden
- `id`: UUID (required)
- `name`: String (required)
- `gardenType`: String (Raised Bed/In-Ground/Container/Greenhouse/Hydroponic)
- `width`, `length`: Double (dimensions in feet)
- `climateZone`: String (optional)
- `soilType`: String (optional)
- Relationships: `plants`, `designs`

### CareTask
- `id`: UUID (required)
- `taskType`: String (Watering/Fertilizing/Pruning/Pest Control/Harvesting/etc.)
- `scheduledDate`: Date (required)
- `completedDate`: Date (optional)
- `isRecurring`: Bool
- `frequency`: String (Daily/Weekly/Biweekly/Monthly)
- Relationship: `plant`

### Note
- `id`: UUID (required)
- `title`: String (required)
- `content`: String (required)
- `isArchived`: Bool
- Relationship: `plant` (optional)

### Photo
- `id`: UUID (required)
- `imageData`: Binary (external storage)
- `thumbnailData`: Binary
- `caption`: String (optional)
- `capturedAt`: Date
- Relationship: `plant`

### WikiEntry
- `id`: UUID (required)
- `commonName`: String (required)
- `scientificName`: String (optional)
- `category`: String (Vegetables/Herbs/Flowers/Fruits/Houseplants/Succulents)
- `entryDescription`: String (required)
- Care guide fields: `sunlight`, `watering`, `soil`, `temperature`, etc.
- Planting guide fields: `spacing`, `plantingDepth`, `germinationTime`, etc.
- Companion planting: `companionPlants`, `antagonistPlants`

### GardenDesign
- `id`: UUID (required)
- `name`: String (required)
- `canvasData`: Binary (JSON-encoded canvas state)
- `thumbnailData`: Binary
- Relationship: `garden`

## Development Setup

### Prerequisites
- Xcode 15.0+
- iOS 17.0+ Simulator or device
- Apple Developer account (for CloudKit)

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Patch
   ```

2. **Open in Xcode**
   ```bash
   open Patch.xcodeproj
   ```

3. **Configure CloudKit** (optional for development)
   - Create CloudKit container in Apple Developer portal
   - Update container identifier in `PersistenceController.swift`
   - Enable iCloud capability in Xcode

4. **Build and Run**
   - Select iOS Simulator target
   - Press Cmd+R to build and run

### SwiftLint
```bash
# Install SwiftLint
brew install swiftlint

# Run linting
swiftlint

# Auto-fix issues
swiftlint --fix
```

## Architecture Guidelines

### MVVM Pattern
- **Views**: SwiftUI views, presentation only
- **ViewModels**: ObservableObject classes, business logic
- **Models**: Core Data entities and data structures
- **Repositories**: Data access layer for each entity

### Repository Pattern
Each entity has a dedicated repository:
```swift
let plantRepo = PlantRepository()

// Fetch
let plants = plantRepo.fetchAll()
let plant = plantRepo.fetchById(id)

// Create
let newPlant = plantRepo.create(name: "Tomato", species: "Solanum lycopersicum")

// Update
plantRepo.update(plant, healthStatus: .good)

// Delete
plantRepo.delete(plant)
```

### CloudKit Sync
- Automatic via `NSPersistentCloudKitContainer`
- Container ID: `iCloud.com.patch.gardening`
- Sync status observable via `PersistenceController.syncStatus`

## Testing

### Unit Tests
```bash
# Run tests via Xcode
Cmd+U

# Or via command line
xcodebuild test -scheme Patch -destination 'platform=iOS Simulator,name=iPhone 15'
```

### Test Coverage Targets
- Models: >90%
- Repositories: >90%
- ViewModels: >80%
- Views: Snapshot tests

## Key Features by Sprint

### Sprint 1-2: Foundation
- Core Data models
- CloudKit sync
- UI shell with tab navigation

### Sprint 3-5: Core Tracker
- Plant CRUD
- Care task scheduling
- Photo capture and gallery

### Sprint 6-7: Wiki & Notes
- Plant wiki with 70+ entries
- Rich text notes

### Sprint 8-10: Garden Design
- 2D canvas with drag-drop
- Spacing validation
- Companion planting indicators

### Sprint 11-13: Intelligence
- Weather integration
- Care recommendations
- Smart plant suggestions

### Sprint 14-18: Polish & Launch
- Performance optimization
- Accessibility
- Localization
- App Store submission

## Coding Conventions

### Naming
- Types: `PascalCase` (e.g., `PlantRepository`)
- Variables/Functions: `camelCase` (e.g., `fetchPlants`)
- Constants: `camelCase` (e.g., `maxImageSize`)

### File Organization
- One type per file
- Extensions in separate files when substantial
- Group by feature, not by type

### SwiftUI Best Practices
- Extract reusable components
- Use `@StateObject` for owned objects
- Use `@ObservedObject` for passed objects
- Prefer `@Binding` over callbacks for two-way data

### Error Handling
- Use `Result` type for async operations
- Log errors with context
- Show user-friendly messages

## Common Commands

```bash
# Build
xcodebuild build -scheme Patch

# Test
xcodebuild test -scheme Patch -destination 'platform=iOS Simulator,name=iPhone 15'

# Lint
swiftlint

# Clean
xcodebuild clean -scheme Patch
```

## Troubleshooting

### CloudKit Issues
1. Verify iCloud is enabled in device/simulator Settings
2. Check CloudKit dashboard for schema
3. Reset CloudKit development environment if needed

### Core Data Issues
1. Delete app from simulator to reset database
2. Check model version compatibility
3. Verify relationships have inverse set

### Build Issues
1. Clean build folder (Cmd+Shift+K)
2. Delete DerivedData
3. Reset package caches

## Resources

- [SwiftUI Documentation](https://developer.apple.com/documentation/swiftui)
- [Core Data Guide](https://developer.apple.com/documentation/coredata)
- [CloudKit Documentation](https://developer.apple.com/documentation/cloudkit)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
