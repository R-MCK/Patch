import XCTest
import CoreData
@testable import Patch

@MainActor
final class GardenTests: XCTestCase {
    
    var context: NSManagedObjectContext!
    var repository: GardenRepository!
    
    override func setUp() {
        super.setUp()
        context = PersistenceController.shared.container.viewContext
        repository = GardenRepository(context: context)
        clearAllGardens()
    }
    
    override func tearDown() {
        clearAllGardens()
        repository = nil
        context = nil
        super.tearDown()
    }
    
    private func clearAllGardens() {
        let request: NSFetchRequest<Garden> = Garden.fetchRequest()
        do {
            let gardens = try context.fetch(request)
            for garden in gardens {
                context.delete(garden)
            }
            try context.save()
        } catch {
            print("Error clearing gardens: \(error)")
        }
    }
    
    // MARK: - Create Tests
    
    func testCreateGarden() {
        let garden = repository.create(
            name: "Backyard Garden",
            type: .raisedBed,
            width: 8,
            length: 4
        )
        
        XCTAssertNotNil(garden)
        XCTAssertEqual(garden.name, "Backyard Garden")
        XCTAssertEqual(garden.gardenType, "Raised Bed")
        XCTAssertEqual(garden.width, 8)
        XCTAssertEqual(garden.length, 4)
        XCTAssertNotNil(garden.id)
        XCTAssertNotNil(garden.createdAt)
    }
    
    func testCreateGardenWithAllFields() {
        let garden = repository.create(
            name: "Greenhouse",
            type: .greenhouse,
            width: 12,
            length: 20,
            climateZone: "Zone 6a",
            soilType: .loamy
        )
        
        XCTAssertEqual(garden.name, "Greenhouse")
        XCTAssertEqual(garden.gardenType, "Greenhouse")
        XCTAssertEqual(garden.width, 12)
        XCTAssertEqual(garden.length, 20)
        XCTAssertEqual(garden.climateZone, "Zone 6a")
        XCTAssertEqual(garden.soilType, "Loamy")
    }
    
    func testCreateGardenWithDefaultValues() {
        let garden = repository.create(name: "Test Garden", width: 4, length: 4)
        
        XCTAssertEqual(garden.name, "Test Garden")
        XCTAssertEqual(garden.gardenType, "Raised Bed")
        XCTAssertNil(garden.climateZone)
        XCTAssertNil(garden.soilType)
    }
    
    // MARK: - Fetch Tests
    
    func testFetchAllGardens() {
        _ = repository.create(name: "Garden 1", width: 4, length: 4)
        _ = repository.create(name: "Garden 2", width: 8, length: 4)
        _ = repository.create(name: "Garden 3", width: 10, length: 10)
        
        let gardens = repository.fetchAll()
        
        XCTAssertEqual(gardens.count, 3)
    }
    
    func testFetchById() {
        let created = repository.create(name: "Test Garden", width: 4, length: 4)
        let fetched = repository.fetchById(created.id)
        
        XCTAssertNotNil(fetched)
        XCTAssertEqual(fetched?.name, "Test Garden")
    }
    
    func testFetchByIdNotFound() {
        let fetched = repository.fetchById(UUID())
        XCTAssertNil(fetched)
    }
    
    func testSearchGardens() {
        _ = repository.create(name: "Backyard Garden", width: 4, length: 4)
        _ = repository.create(name: "Front Yard", width: 8, length: 4)
        _ = repository.create(name: "Backyard Greenhouse", width: 10, length: 10)
        
        let results = repository.search(query: "Backyard")
        
        XCTAssertEqual(results.count, 2)
        XCTAssertTrue(results.contains { $0.name == "Backyard Garden" })
        XCTAssertTrue(results.contains { $0.name == "Backyard Greenhouse" })
    }
    
    func testFilterByType() {
        _ = repository.create(name: "Raised Bed 1", type: .raisedBed, width: 4, length: 4)
        _ = repository.create(name: "Container 1", type: .container, width: 2, length: 2)
        _ = repository.create(name: "Raised Bed 2", type: .raisedBed, width: 8, length: 4)
        
        let raisedBeds = repository.filterByType(.raisedBed)
        
        XCTAssertEqual(raisedBeds.count, 2)
    }
    
    // MARK: - Update Tests
    
    func testUpdateGardenName() {
        let garden = repository.create(name: "Original Name", width: 4, length: 4)
        
        repository.update(garden, name: "New Name")
        
        XCTAssertEqual(garden.name, "New Name")
    }
    
    func testUpdateGardenDimensions() {
        let garden = repository.create(name: "Test", width: 4, length: 4)
        
        repository.update(garden, width: 12, length: 8)
        
        XCTAssertEqual(garden.width, 12)
        XCTAssertEqual(garden.length, 8)
    }
    
    func testUpdateGardenType() {
        let garden = repository.create(name: "Test", type: .raisedBed, width: 4, length: 4)
        
        repository.update(garden, type: .greenhouse)
        
        XCTAssertEqual(garden.gardenType, "Greenhouse")
    }
    
    // MARK: - Delete Tests
    
    func testDeleteGarden() {
        let garden = repository.create(name: "To Delete", width: 4, length: 4)
        let id = garden.id
        
        repository.delete(garden)
        
        let fetched = repository.fetchById(id)
        XCTAssertNil(fetched)
    }
    
    func testDeleteById() {
        let garden = repository.create(name: "To Delete By ID", width: 4, length: 4)
        let id = garden.id
        
        repository.deleteById(id)
        
        let fetched = repository.fetchById(id)
        XCTAssertNil(fetched)
    }
    
    // MARK: - Computed Properties Tests
    
    func testGardenArea() {
        let garden = repository.create(name: "Test", width: 8, length: 4)
        
        XCTAssertEqual(garden.area, 32)
    }
    
    func testGardenDimensions() {
        let garden = repository.create(name: "Test", width: 8, length: 4)
        
        XCTAssertEqual(garden.dimensions, "8' × 4'")
    }
    
    func testGardenPlantCount() {
        let garden = repository.create(name: "Test", width: 8, length: 4)
        
        XCTAssertEqual(garden.plantCount, 0)
    }
    
    // MARK: - Enum Tests
    
    func testGardenTypeAllCases() {
        let types = Garden.GardenType.allCases
        
        XCTAssertEqual(types.count, 5)
        XCTAssertTrue(types.contains(.raisedBed))
        XCTAssertTrue(types.contains(.inGround))
        XCTAssertTrue(types.contains(.container))
        XCTAssertTrue(types.contains(.greenhouse))
        XCTAssertTrue(types.contains(.hydroponic))
    }
    
    func testSoilTypeAllCases() {
        let soils = Garden.SoilType.allCases
        
        XCTAssertEqual(soils.count, 6)
        XCTAssertTrue(soils.contains(.clay))
        XCTAssertTrue(soils.contains(.sandy))
        XCTAssertTrue(soils.contains(.loamy))
    }
    
    // MARK: - ViewModel Tests
    
    func testGardenListViewModelLoadGardens() {
        _ = repository.create(name: "Garden 1", width: 4, length: 4)
        _ = repository.create(name: "Garden 2", width: 8, length: 4)
        
        let viewModel = GardenListViewModel()
        viewModel.loadGardens()
        
        XCTAssertEqual(viewModel.gardens.count, 2)
        XCTAssertFalse(viewModel.isLoading)
    }
    
    func testGardenListViewModelDeleteGarden() {
        _ = repository.create(name: "Garden 1", width: 4, length: 4)
        let garden2 = repository.create(name: "Garden 2", width: 8, length: 4)
        
        let viewModel = GardenListViewModel()
        viewModel.loadGardens()
        
        XCTAssertEqual(viewModel.gardens.count, 2)
        
        viewModel.deleteGarden(garden2)
        
        XCTAssertEqual(viewModel.gardens.count, 1)
        XCTAssertEqual(viewModel.gardens.first?.name, "Garden 1")
    }
    
    func testAddGardenViewModelValidation() {
        let viewModel = AddGardenViewModel()
        
        viewModel.name = ""
        XCTAssertFalse(viewModel.isValid)
        
        viewModel.name = "   "
        XCTAssertFalse(viewModel.isValid)
        
        viewModel.name = "My Garden"
        XCTAssertTrue(viewModel.isValid)
    }
}

@MainActor
final class GardenDetailViewModelTests: XCTestCase {
    func testLoadPlantsUsesRepositoryResults() {
        let garden = makeGarden(name: "Backyard")
        let plant = makePlant(name: "Tomato")

        let gardenRepository = MockGardenDetailRepository()
        let plantRepository = MockGardenPlantsRepository(plants: [plant])

        let viewModel = GardenDetailViewModel(
            garden: garden,
            gardenRepository: gardenRepository,
            plantRepository: plantRepository
        )

        viewModel.loadPlants()

        XCTAssertEqual(viewModel.plants.count, 1)
        XCTAssertTrue(plantRepository.fetchByGardenCalled)
    }

    func testRefreshReloadsGardenAndPlants() {
        let garden = makeGarden(name: "Backyard")
        let refreshedGarden = makeGarden(name: "Updated Garden")
        let plant = makePlant(name: "Basil")

        let gardenRepository = MockGardenDetailRepository()
        gardenRepository.fetchByIdResult = refreshedGarden
        let plantRepository = MockGardenPlantsRepository(plants: [plant])

        let viewModel = GardenDetailViewModel(
            garden: garden,
            gardenRepository: gardenRepository,
            plantRepository: plantRepository
        )

        viewModel.refresh()

        XCTAssertEqual(viewModel.garden.name, "Updated Garden")
        XCTAssertTrue(gardenRepository.fetchByIdCalled)
        XCTAssertEqual(viewModel.plants.count, 1)
    }

    func testUpdateGardenUsesRepository() {
        let garden = makeGarden(name: "Backyard")
        let gardenRepository = MockGardenDetailRepository()
        let plantRepository = MockGardenPlantsRepository()

        let viewModel = GardenDetailViewModel(
            garden: garden,
            gardenRepository: gardenRepository,
            plantRepository: plantRepository
        )

        viewModel.updateGarden(
            name: "Updated",
            type: .greenhouse,
            width: 12,
            length: 20,
            climateZone: "Zone 8",
            soilType: .loamy
        )

        XCTAssertEqual(gardenRepository.lastUpdatedGarden?.name, "Updated")
        XCTAssertEqual(gardenRepository.lastGardenType, .greenhouse)
        XCTAssertEqual(gardenRepository.lastWidth, 12)
        XCTAssertEqual(gardenRepository.lastLength, 20)
        XCTAssertEqual(gardenRepository.lastClimateZone, "Zone 8")
        XCTAssertEqual(gardenRepository.lastSoilType, .loamy)
    }

    func testDeleteGardenUsesRepository() {
        let garden = makeGarden(name: "Backyard")
        let gardenRepository = MockGardenDetailRepository()
        let plantRepository = MockGardenPlantsRepository()

        let viewModel = GardenDetailViewModel(
            garden: garden,
            gardenRepository: gardenRepository,
            plantRepository: plantRepository
        )

        viewModel.deleteGarden()

        XCTAssertTrue(gardenRepository.deleteCalled)
        XCTAssertEqual(gardenRepository.deletedGarden?.id, garden.id)
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
}

final class MockGardenDetailRepository: GardenDetailGardenRepository {
    var fetchByIdResult: Garden?
    var fetchByIdCalled = false
    var deleteCalled = false
    var deletedGarden: Garden?

    var lastUpdatedGarden: Garden?
    var lastName: String?
    var lastGardenType: Garden.GardenType?
    var lastWidth: Double?
    var lastLength: Double?
    var lastClimateZone: String?
    var lastSoilType: Garden.SoilType?

    func fetchById(_ id: UUID) -> Garden? {
        fetchByIdCalled = true
        return fetchByIdResult
    }

    func update(
        _ garden: Garden,
        name: String?,
        type: Garden.GardenType?,
        width: Double?,
        length: Double?,
        climateZone: String?,
        soilType: Garden.SoilType?
    ) {
        lastUpdatedGarden = garden
        lastName = name
        lastGardenType = type
        lastWidth = width
        lastLength = length
        lastClimateZone = climateZone
        lastSoilType = soilType

        if let name { garden.name = name }
        if let type { garden.gardenType = type.rawValue }
        if let width { garden.width = width }
        if let length { garden.length = length }
        if let climateZone { garden.climateZone = climateZone }
        if let soilType { garden.soilType = soilType.rawValue }
    }

    func delete(_ garden: Garden, transferPlantsTo targetGarden: Garden?) {
        deleteCalled = true
        deletedGarden = garden
    }
}

final class MockGardenPlantsRepository: PlantDetailPlantRepository {
    var plants: [Plant] = []
    var fetchByGardenCalled = false

    init(plants: [Plant] = []) {
        self.plants = plants
    }

    func fetchById(_ id: UUID) -> Plant? { nil }

    func fetchByGarden(_ garden: Garden) -> [Plant] {
        fetchByGardenCalled = true
        return plants
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
    ) { }

    func delete(_ plant: Plant) { }
}
