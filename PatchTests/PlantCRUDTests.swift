import XCTest
@testable import Patch

@MainActor
final class PlantCRUDTests: XCTestCase {

    var context: NSManagedObjectContext!
    var repository: PlantRepository!

    override func setUp() {
        super.setUp()
        context = PersistenceController.shared.container.viewContext
        repository = PlantRepository(context: context)
        clearAllPlants()
    }

    override func tearDown() {
        clearAllPlants()
        repository = nil
        context = nil
        super.tearDown()
    }

    private func clearAllPlants() {
        let request: NSFetchRequest<Plant> = Plant.fetchRequest()
        do {
            let plants = try context.fetch(request)
            for plant in plants {
                context.delete(plant)
            }
            try context.save()
        } catch {
            print("Error clearing plants: \(error)")
        }
    }

    // MARK: - Create Tests

    func testCreatePlant() {
        let plant = repository.create(
            name: "Tomato",
            species: "Solanum lycopersicum",
            healthStatus: .good,
            growthStage: .flowering
        )

        XCTAssertNotNil(plant)
        XCTAssertEqual(plant.name, "Tomato")
        XCTAssertEqual(plant.species, "Solanum lycopersicum")
        XCTAssertEqual(plant.healthStatus, "Good")
        XCTAssertEqual(plant.growthStage, "Flowering")
        XCTAssertNotNil(plant.id)
        XCTAssertNotNil(plant.createdAt)
    }

    func testCreatePlantWithOptionalFields() {
        let plant = repository.create(
            name: "Basil",
            species: "Ocimum basilicum",
            variety: "Genovese",
            plantingDate: Date(),
            location: "Kitchen Window",
            healthStatus: .excellent,
            growthStage: .vegetative
        )

        XCTAssertEqual(plant.name, "Basil")
        XCTAssertEqual(plant.variety, "Genovese")
        XCTAssertNotNil(plant.plantingDate)
        XCTAssertEqual(plant.location, "Kitchen Window")
    }

    func testCreatePlantWithDefaultValues() {
        let plant = repository.create(name: "Test Plant")

        XCTAssertEqual(plant.name, "Test Plant")
        XCTAssertEqual(plant.healthStatus, "Good")
        XCTAssertEqual(plant.growthStage, "Seedling")
        XCTAssertNil(plant.species)
        XCTAssertNil(plant.plantingDate)
    }

    // MARK: - Read Tests

    func testFetchAllPlants() {
        _ = repository.create(name: "Plant 1")
        _ = repository.create(name: "Plant 2")
        _ = repository.create(name: "Plant 3")

        let plants = repository.fetchAll()

        XCTAssertEqual(plants.count, 3)
    }

    func testFetchById() {
        let created = repository.create(name: "Test Plant")
        let fetched = repository.fetchById(created.id)

        XCTAssertNotNil(fetched)
        XCTAssertEqual(fetched?.name, "Test Plant")
    }

    func testFetchByIdNotFound() {
        let fetched = repository.fetchById(UUID())

        XCTAssertNil(fetched)
    }

    func testSearchByName() {
        _ = repository.create(name: "Tomato")
        _ = repository.create(name: "Tomatillo")
        _ = repository.create(name: "Potato")

        let results = repository.search(query: "Tomato")

        XCTAssertEqual(results.count, 2)
        XCTAssertTrue(results.contains { $0.name == "Tomato" })
        XCTAssertTrue(results.contains { $0.name == "Tomatillo" })
    }

    func testSearchBySpecies() {
        _ = repository.create(name: "Plant A", species: "Solanum lycopersicum")
        _ = repository.create(name: "Plant B", species: "Solanum tuberosum")
        _ = repository.create(name: "Plant C", species: "Solanum melongena")

        let results = repository.search(query: "Solanum")

        XCTAssertEqual(results.count, 3)
    }

    func testFilterByHealth() {
        _ = repository.create(name: "Healthy", healthStatus: .excellent)
        _ = repository.create(name: "Okay", healthStatus: .good)
        _ = repository.create(name: "Poor", healthStatus: .poor)

        let excellent = repository.filterByHealth(.excellent)

        XCTAssertEqual(excellent.count, 1)
        XCTAssertEqual(excellent.first?.name, "Healthy")
    }

    func testFilterByGrowthStage() {
        _ = repository.create(name: "Seedling 1", growthStage: .seedling)
        _ = repository.create(name: "Seedling 2", growthStage: .seedling)
        _ = repository.create(name: "Flowering", growthStage: .flowering)

        let seedlings = repository.filterByGrowthStage(.seedling)

        XCTAssertEqual(seedlings.count, 2)
    }

    // MARK: - Update Tests

    func testUpdatePlantName() {
        let plant = repository.create(name: "Original Name")

        repository.update(plant, name: "New Name")

        XCTAssertEqual(plant.name, "New Name")
    }

    func testUpdatePlantHealth() {
        let plant = repository.create(name: "Test", healthStatus: .good)

        repository.update(plant, healthStatus: .excellent)

        XCTAssertEqual(plant.healthStatus, "Excellent")
    }

    func testUpdatePlantMultipleFields() {
        let plant = repository.create(name: "Original")

        repository.update(
            plant,
            name: "Updated",
            species: "New Species",
            healthStatus: .poor,
            growthStage: .fruiting
        )

        XCTAssertEqual(plant.name, "Updated")
        XCTAssertEqual(plant.species, "New Species")
        XCTAssertEqual(plant.healthStatus, "Poor")
        XCTAssertEqual(plant.growthStage, "Fruiting")
    }

    func testUpdatePlantClearsOptionalFields() {
        let plant = repository.create(
            name: "Test",
            species: "Original",
            location: "Original Location"
        )

        repository.update(plant, species: nil, location: nil)

        XCTAssertNil(plant.species)
        XCTAssertNil(plant.location)
    }

    // MARK: - Delete Tests

    func testDeletePlant() {
        let plant = repository.create(name: "To Delete")
        let id = plant.id

        repository.delete(plant)

        let fetched = repository.fetchById(id)
        XCTAssertNil(fetched)
    }

    func testDeleteById() {
        let plant = repository.create(name: "To Delete By ID")
        let id = plant.id

        repository.deleteById(id)

        let fetched = repository.fetchById(id)
        XCTAssertNil(fetched)
    }

    // MARK: - Validation Tests

    func testAddPlantViewModelValidation() {
        let vm = AddPlantViewModel()

        XCTAssertFalse(vm.isValid)

        vm.name = "Tomato"
        XCTAssertTrue(vm.isValid)

        vm.name = ""
        XCTAssertFalse(vm.isValid)
    }

    func testAddPlantViewModelValidationWhitespace() {
        let vm = AddPlantViewModel()

        vm.name = "   "
        XCTAssertFalse(vm.isValid)

        vm.name = "Tomato"
        XCTAssertTrue(vm.isValid)
    }

    // MARK: - Sorting Tests

    func testSortByNameAscending() {
        _ = repository.create(name: "Zebra Plant")
        _ = repository.create(name: "Apple Tree")
        _ = repository.create(name: "Mango")

        let plants = repository.fetchAll()

        XCTAssertEqual(plants[0].name, "Apple Tree")
        XCTAssertEqual(plants[1].name, "Mango")
        XCTAssertEqual(plants[2].name, "Zebra Plant")
    }
}

@MainActor
final class PlantDetailViewModelTests: XCTestCase {
    func testLoadRelatedDataUsesRepositoryResults() {
        let plant = makePlant(name: "Tomato")
        let careTask = makeCareTask(type: .watering, plant: plant)
        let note = makeNote(title: "Soil check")
        let photo = makePhoto(caption: "First harvest")

        let plantRepository = MockPlantDetailRepository()
        plantRepository.fetchByIdResult = plant

        let careTaskRepository = MockPlantCareTaskDetailRepository(tasks: [careTask])
        let noteRepository = MockPlantNoteDetailRepository(notes: [note])
        let photoRepository = MockPlantPhotoDetailRepository(photos: [photo])

        let viewModel = PlantDetailViewModel(
            plant: plant,
            plantRepository: plantRepository,
            careTaskRepository: careTaskRepository,
            noteRepository: noteRepository,
            photoRepository: photoRepository
        )

        viewModel.loadRelatedData()

        XCTAssertEqual(viewModel.careTasks.count, 1)
        XCTAssertEqual(viewModel.notes.count, 1)
        XCTAssertEqual(viewModel.photos.count, 1)
        XCTAssertTrue(careTaskRepository.fetchByPlantCalled)
        XCTAssertTrue(noteRepository.fetchByPlantCalled)
        XCTAssertTrue(photoRepository.fetchByPlantCalled)
    }

    func testRefreshUpdatesPlantAndRelatedData() {
        let plant = makePlant(name: "Tomato")
        let refreshedPlant = makePlant(name: "Cherry Tomato")
        let careTask = makeCareTask(type: .watering, plant: refreshedPlant)

        let plantRepository = MockPlantDetailRepository()
        plantRepository.fetchByIdResult = refreshedPlant

        let careTaskRepository = MockPlantCareTaskDetailRepository(tasks: [careTask])

        let viewModel = PlantDetailViewModel(
            plant: plant,
            plantRepository: plantRepository,
            careTaskRepository: careTaskRepository,
            noteRepository: MockPlantNoteDetailRepository(),
            photoRepository: MockPlantPhotoDetailRepository()
        )

        viewModel.refresh()

        XCTAssertEqual(viewModel.plant.name, "Cherry Tomato")
        XCTAssertTrue(plantRepository.fetchByIdCalled)
        XCTAssertEqual(viewModel.careTasks.count, 1)
    }

    func testUpdateHealthAndGrowthStageUsesRepository() {
        let plant = makePlant(name: "Basil")
        let plantRepository = MockPlantDetailRepository()

        let viewModel = PlantDetailViewModel(
            plant: plant,
            plantRepository: plantRepository,
            careTaskRepository: MockPlantCareTaskDetailRepository(),
            noteRepository: MockPlantNoteDetailRepository(),
            photoRepository: MockPlantPhotoDetailRepository()
        )

        viewModel.updateHealthStatus(.excellent)
        viewModel.updateGrowthStage(.flowering)

        XCTAssertEqual(plantRepository.lastUpdatedPlant?.id, plant.id)
        XCTAssertEqual(plantRepository.lastHealthStatus, .excellent)
        XCTAssertEqual(plantRepository.lastGrowthStage, .flowering)
    }

    func testDeleteUsesRepository() {
        let plant = makePlant(name: "Parsley")
        let plantRepository = MockPlantDetailRepository()

        let viewModel = PlantDetailViewModel(
            plant: plant,
            plantRepository: plantRepository,
            careTaskRepository: MockPlantCareTaskDetailRepository(),
            noteRepository: MockPlantNoteDetailRepository(),
            photoRepository: MockPlantPhotoDetailRepository()
        )

        viewModel.delete()

        XCTAssertTrue(plantRepository.deleteCalled)
        XCTAssertEqual(plantRepository.deletedPlant?.id, plant.id)
    }

    func testEditPlantViewModelSavesValidatedChanges() {
        let plant = makePlant(name: "Tomato")
        let plantRepository = MockPlantDetailRepository()
        let garden = makeGarden(name: "Backyard")

        let viewModel = EditPlantViewModel(plant: plant, repository: plantRepository)
        viewModel.name = "  Updated Tomato  "
        viewModel.species = "Solanum lycopersicum"
        viewModel.variety = "Roma"
        viewModel.location = "North bed"
        viewModel.healthStatus = .excellent
        viewModel.growthStage = .flowering
        viewModel.selectedGarden = garden
        viewModel.notes = "Water deeply"
        viewModel.spacingOverride = "18"
        viewModel.spacingOverrideUnit = .inches

        XCTAssertTrue(viewModel.save())

        XCTAssertEqual(plantRepository.lastName, "Updated Tomato")
        XCTAssertEqual(plantRepository.lastSpecies, "Solanum lycopersicum")
        XCTAssertEqual(plantRepository.lastVariety, "Roma")
        XCTAssertEqual(plantRepository.lastLocation, "North bed")
        XCTAssertEqual(plantRepository.lastHealthStatus, .excellent)
        XCTAssertEqual(plantRepository.lastGrowthStage, .flowering)
        XCTAssertEqual(plantRepository.lastNotes, "Water deeply")
        XCTAssertEqual(plantRepository.lastGarden?.id, garden.id)
        XCTAssertEqual(plantRepository.lastSpacingOverrideFeet, 1.5, accuracy: 0.0001)
    }

    func testEditPlantViewModelRejectsBlankName() {
        let plant = makePlant(name: "Tomato")
        let plantRepository = MockPlantDetailRepository()
        let viewModel = EditPlantViewModel(plant: plant, repository: plantRepository)

        viewModel.name = "   "

        XCTAssertFalse(viewModel.save())
        XCTAssertEqual(viewModel.nameError, "Plant name is required")
        XCTAssertNil(plantRepository.lastUpdatedPlant)
    }

    private func makePlant(name: String) -> Plant {
        let plant = Plant()
        plant.id = UUID()
        plant.name = name
        plant.healthStatus = Plant.HealthStatus.good.rawValue
        plant.growthStage = Plant.GrowthStage.seedling.rawValue
        plant.createdAt = Date()
        plant.updatedAt = Date()
        return plant
    }

    private func makeGarden(name: String) -> Garden {
        let garden = Garden()
        garden.id = UUID()
        garden.name = name
        garden.gardenType = Garden.GardenType.raisedBed.rawValue
        garden.width = 4
        garden.length = 4
        garden.createdAt = Date()
        garden.updatedAt = Date()
        return garden
    }

    private func makeCareTask(type: CareTask.TaskType, plant: Plant) -> CareTask {
        let task = CareTask()
        task.id = UUID()
        task.taskType = type.rawValue
        task.plant = plant
        task.scheduledDate = Date()
        task.createdAt = Date()
        return task
    }

    private func makeNote(title: String) -> Note {
        let note = Note()
        note.id = UUID()
        note.title = title
        note.content = "Content"
        note.isArchived = false
        note.createdAt = Date()
        note.updatedAt = Date()
        return note
    }

    private func makePhoto(caption: String) -> Photo {
        let photo = Photo()
        photo.id = UUID()
        photo.caption = caption
        photo.capturedAt = Date()
        photo.createdAt = Date()
        return photo
    }
}

final class MockPlantDetailRepository: PlantDetailPlantRepository {
    var fetchByIdResult: Plant?
    var fetchByGardenResult: [Plant] = []
    var fetchByIdCalled = false
    var fetchByGardenCalled = false
    var deleteCalled = false
    var deletedPlant: Plant?

    var lastUpdatedPlant: Plant?
    var lastName: String?
    var lastSpecies: String?
    var lastVariety: String?
    var lastPlantingDate: Date?
    var lastLocation: String?
    var lastSpacingOverrideFeet: Double?
    var lastHealthStatus: Plant.HealthStatus?
    var lastGrowthStage: Plant.GrowthStage?
    var lastNotes: String?
    var lastGarden: Garden?

    func fetchById(_ id: UUID) -> Plant? {
        fetchByIdCalled = true
        return fetchByIdResult
    }

    func fetchByGarden(_ garden: Garden) -> [Plant] {
        fetchByGardenCalled = true
        return fetchByGardenResult
    }

    func update(
        _ plant: Plant,
        name: String?,
        species: String?,
        variety: String?,
        plantingDate: Date?,
        location: String?,
        spacingOverrideFeet: Double?,
        healthStatus: Plant.HealthStatus?,
        growthStage: Plant.GrowthStage?,
        notes: String?,
        garden: Garden?
    ) {
        lastUpdatedPlant = plant
        lastName = name
        lastSpecies = species
        lastVariety = variety
        lastPlantingDate = plantingDate
        lastLocation = location
        lastSpacingOverrideFeet = spacingOverrideFeet
        lastHealthStatus = healthStatus
        lastGrowthStage = growthStage
        lastNotes = notes
        lastGarden = garden

        if let name { plant.name = name }
        if let species { plant.species = species }
        if let variety { plant.variety = variety }
        if let plantingDate { plant.plantingDate = plantingDate }
        if let location { plant.location = location }
        if let spacingOverrideFeet { plant.spacingOverrideFeet = NSNumber(value: spacingOverrideFeet) }
        if let healthStatus { plant.healthStatus = healthStatus.rawValue }
        if let growthStage { plant.growthStage = growthStage.rawValue }
        if let notes { plant.notes = notes }
        if let garden { plant.garden = garden }
    }

    func delete(_ plant: Plant) {
        deleteCalled = true
        deletedPlant = plant
    }
}

final class MockPlantCareTaskDetailRepository: PlantCareTaskRepository {
    var tasks: [CareTask] = []
    var fetchByPlantCalled = false

    init(tasks: [CareTask] = []) {
        self.tasks = tasks
    }

    func fetchByPlant(_ plant: Plant) -> [CareTask] {
        fetchByPlantCalled = true
        return tasks
    }
}

final class MockPlantNoteDetailRepository: PlantNoteRepository {
    var notes: [Note] = []
    var fetchByPlantCalled = false

    init(notes: [Note] = []) {
        self.notes = notes
    }

    func fetchByPlant(_ plant: Plant) -> [Note] {
        fetchByPlantCalled = true
        return notes
    }
}

final class MockPlantPhotoDetailRepository: PlantPhotoRepository {
    var photos: [Photo] = []
    var fetchByPlantCalled = false

    init(photos: [Photo] = []) {
        self.photos = photos
    }

    func fetchByPlant(_ plant: Plant) -> [Photo] {
        fetchByPlantCalled = true
        return photos
    }
}
