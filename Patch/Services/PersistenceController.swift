import CoreData
import CloudKit

/// Manages Core Data stack with CloudKit sync for the Patch app
final class PersistenceController: ObservableObject {

    // MARK: - Singleton

    // Set enableCloudKit to true when you have a paid developer account
    static let shared = PersistenceController(enableCloudKit: false)

    // MARK: - Preview

    static var preview: PersistenceController = {
        let controller = PersistenceController(inMemory: true)
        let viewContext = controller.container.viewContext

        // Create sample data for previews
        let garden = Garden(context: viewContext)
        garden.id = UUID()
        garden.name = "Backyard Garden"
        garden.gardenType = Garden.GardenType.raisedBed.rawValue
        garden.width = 8
        garden.length = 4
        garden.createdAt = Date()
        garden.updatedAt = Date()

        for i in 0..<5 {
            let plant = Plant(context: viewContext)
            plant.id = UUID()
            plant.name = "Plant \(i + 1)"
            plant.species = "Species \(i + 1)"
            plant.healthStatus = Plant.HealthStatus.good.rawValue
            plant.growthStage = Plant.GrowthStage.vegetative.rawValue
            plant.plantingDate = Date().addingTimeInterval(-Double(i * 7 * 24 * 60 * 60))
            plant.createdAt = Date()
            plant.updatedAt = Date()
            plant.garden = garden
        }

        do {
            try viewContext.save()
        } catch {
            fatalError("Error creating preview data: \(error)")
        }

        return controller
    }()

    // MARK: - Properties

    let container: NSPersistentCloudKitContainer

    @Published var syncStatus: SyncStatus = .idle

    enum SyncStatus {
        case idle
        case syncing
        case synced
        case error(Error)
    }

    // MARK: - Initialization

    init(inMemory: Bool = false, enableCloudKit: Bool = true) {
        container = NSPersistentCloudKitContainer(name: "Patch")

        if inMemory {
            container.persistentStoreDescriptions.first?.url = URL(fileURLWithPath: "/dev/null")
        }

        // Configure CloudKit options
        guard let description = container.persistentStoreDescriptions.first else {
            fatalError("Failed to retrieve persistent store description")
        }

        if !inMemory && enableCloudKit {
            // Enable CloudKit sync only if requested
            description.cloudKitContainerOptions = NSPersistentCloudKitContainerOptions(
                containerIdentifier: "iCloud.com.patch.gardening"
            )

            // Enable remote change notifications
            description.setOption(true as NSNumber, forKey: NSPersistentStoreRemoteChangeNotificationPostOptionKey)

            // Enable persistent history tracking
            description.setOption(true as NSNumber, forKey: NSPersistentHistoryTrackingKey)
        } else if !inMemory {
            // Disable CloudKit sync for local development
            description.cloudKitContainerOptions = nil
        }

        // Enable lightweight migration when the model changes.
        description.setOption(true as NSNumber, forKey: NSMigratePersistentStoresAutomaticallyOption)
        description.setOption(true as NSNumber, forKey: NSInferMappingModelAutomaticallyOption)

        container.loadPersistentStores { storeDescription, error in
            if let error = error as NSError? {
                // In production, handle this gracefully
                fatalError("Persistent store failed to load: \(error), \(error.userInfo)")
            }
        }

        // Configure view context
        container.viewContext.automaticallyMergesChangesFromParent = true
        container.viewContext.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy

        // Observe CloudKit sync events
        setupSyncObserver()
    }

    // MARK: - Sync Observation

    private func setupSyncObserver() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleRemoteChange),
            name: .NSPersistentStoreRemoteChange,
            object: container.persistentStoreCoordinator
        )
    }

    @objc private func handleRemoteChange(_ notification: Notification) {
        DispatchQueue.main.async {
            self.syncStatus = .synced
        }
    }

    // MARK: - Context Management

    /// Creates a new background context for heavy operations
    func newBackgroundContext() -> NSManagedObjectContext {
        let context = container.newBackgroundContext()
        context.mergePolicy = NSMergeByPropertyObjectTrumpMergePolicy
        return context
    }

    /// Saves the view context if there are changes
    func save() {
        let context = container.viewContext

        guard context.hasChanges else { return }

        do {
            try context.save()
        } catch {
            let nsError = error as NSError
            print("Error saving context: \(nsError), \(nsError.userInfo)")
        }
    }

    /// Saves a background context
    func save(context: NSManagedObjectContext) {
        guard context.hasChanges else { return }

        do {
            try context.save()
        } catch {
            let nsError = error as NSError
            print("Error saving background context: \(nsError), \(nsError.userInfo)")
        }
    }

    // MARK: - Data Operations

    /// Deletes all data (for testing/reset purposes)
    func deleteAllData() async throws {
        let context = newBackgroundContext()
        let viewContext = container.viewContext

        try await context.perform {
            let entities = ["Plant", "Garden", "CareTask", "Note", "Photo", "WikiEntry", "GardenDesign"]

            for entityName in entities {
                let fetchRequest = NSFetchRequest<NSFetchRequestResult>(entityName: entityName)
                let deleteRequest = NSBatchDeleteRequest(fetchRequest: fetchRequest)
                deleteRequest.resultType = .resultTypeObjectIDs

                let result = try context.execute(deleteRequest) as? NSBatchDeleteResult
                let objectIDArray = result?.result as? [NSManagedObjectID] ?? []

                let changes = [NSDeletedObjectsKey: objectIDArray]
                NSManagedObjectContext.mergeChanges(fromRemoteContextSave: changes, into: [viewContext])
            }

            try context.save()
        }
    }
}

// MARK: - Entity Creation Helpers

extension PersistenceController {

    func createPlant(
        name: String,
        species: String? = nil,
        variety: String? = nil,
        plantingDate: Date? = nil,
        location: String? = nil,
        spacingOverrideFeet: Double? = nil,
        healthStatus: Plant.HealthStatus = .good,
        growthStage: Plant.GrowthStage = .seedling,
        garden: Garden? = nil
    ) -> Plant {
        let context = container.viewContext
        let plant = Plant(context: context)

        plant.id = UUID()
        plant.name = name
        plant.species = species
        plant.variety = variety
        plant.plantingDate = plantingDate
        plant.location = location
        plant.spacingOverrideFeet = spacingOverrideFeet.map { NSNumber(value: $0) }
        plant.healthStatus = healthStatus.rawValue
        plant.growthStage = growthStage.rawValue
        plant.garden = garden
        plant.createdAt = Date()
        plant.updatedAt = Date()

        save()
        return plant
    }

    func createGarden(
        name: String,
        type: Garden.GardenType = .raisedBed,
        width: Double,
        length: Double,
        climateZone: String? = nil,
        soilType: Garden.SoilType? = nil
    ) -> Garden {
        let context = container.viewContext
        let garden = Garden(context: context)

        garden.id = UUID()
        garden.name = name
        garden.gardenType = type.rawValue
        garden.width = width
        garden.length = length
        garden.climateZone = climateZone
        garden.soilType = soilType?.rawValue
        garden.createdAt = Date()
        garden.updatedAt = Date()

        save()
        return garden
    }

    func createCareTask(
        type: CareTask.TaskType,
        plant: Plant,
        scheduledDate: Date,
        notes: String? = nil,
        isRecurring: Bool = false,
        frequency: CareTask.Frequency? = nil
    ) -> CareTask {
        let context = container.viewContext
        let task = CareTask(context: context)

        task.id = UUID()
        task.taskType = type.rawValue
        task.plant = plant
        task.scheduledDate = scheduledDate
        task.notes = notes
        task.isRecurring = isRecurring
        task.frequency = frequency?.rawValue
        task.createdAt = Date()

        save()
        return task
    }

    func createNote(
        title: String,
        content: String,
        plant: Plant? = nil
    ) -> Note {
        let context = container.viewContext
        let note = Note(context: context)

        note.id = UUID()
        note.title = title
        note.content = content
        note.plant = plant
        note.isArchived = false
        note.createdAt = Date()
        note.updatedAt = Date()

        save()
        return note
    }

    func createPhoto(
        imageData: Data,
        thumbnailData: Data? = nil,
        caption: String? = nil,
        plant: Plant
    ) -> Photo {
        let context = container.viewContext
        let photo = Photo(context: context)

        photo.id = UUID()
        photo.imageData = imageData
        photo.thumbnailData = thumbnailData
        photo.caption = caption
        photo.plant = plant
        photo.capturedAt = Date()
        photo.createdAt = Date()

        save()
        return photo
    }

    func createGardenDesign(
        name: String,
        garden: Garden
    ) -> GardenDesign {
        let context = container.viewContext
        let design = GardenDesign(context: context)

        design.id = UUID()
        design.name = name
        design.garden = garden
        design.canvasState = CanvasState()
        design.createdAt = Date()
        design.updatedAt = Date()

        save()
        return design
    }

    func createWikiEntry(
        commonName: String,
        scientificName: String? = nil,
        category: WikiEntry.Category,
        description: String,
        sunlight: WikiEntry.Sunlight,
        watering: WikiEntry.Watering,
        soil: String,
        difficulty: WikiEntry.Difficulty,
        temperature: String? = nil,
        humidity: String? = nil,
        fertilizing: String? = nil,
        spacing: String? = nil,
        plantingDepth: String? = nil,
        germinationTime: String? = nil,
        daysToMaturity: Int16 = 0,
        harvestInfo: String? = nil,
        companionPlants: String? = nil,
        antagonistPlants: String? = nil,
        imageURL: String? = nil,
        isUserContributed: Bool = false
    ) -> WikiEntry {
        let context = container.viewContext
        let entry = WikiEntry(context: context)

        entry.id = UUID()
        entry.commonName = commonName
        entry.scientificName = scientificName
        entry.category = category.rawValue
        entry.entryDescription = description
        entry.sunlight = sunlight.rawValue
        entry.watering = watering.rawValue
        entry.soil = soil
        entry.difficulty = difficulty.rawValue
        entry.temperature = temperature
        entry.humidity = humidity
        entry.fertilizing = fertilizing
        entry.spacing = spacing
        entry.plantingDepth = plantingDepth
        entry.germinationTime = germinationTime
        entry.daysToMaturity = daysToMaturity
        entry.harvestInfo = harvestInfo
        entry.companionPlants = companionPlants
        entry.antagonistPlants = antagonistPlants
        entry.imageURL = imageURL
        entry.isUserContributed = isUserContributed
        entry.createdAt = Date()
        entry.updatedAt = Date()

        save()
        return entry
    }
}
