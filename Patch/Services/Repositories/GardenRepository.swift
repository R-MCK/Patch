import Foundation
import CoreData
import Combine
import os

protocol GardenDetailGardenRepository {
    func fetchById(_ id: UUID) -> Garden?
    func update(
        _ garden: Garden,
        name: String?,
        type: Garden.GardenType?,
        width: Double?,
        length: Double?,
        climateZone: String?,
        soilType: Garden.SoilType?
    )
    func delete(_ garden: Garden, transferPlantsTo targetGarden: Garden?)
}

extension GardenDetailGardenRepository {
    func delete(_ garden: Garden) {
        delete(garden, transferPlantsTo: nil)
    }
}

/// Repository for Garden entity CRUD operations
@MainActor
final class GardenRepository: ObservableObject {

    private let context: NSManagedObjectContext

    @Published var gardens: [Garden] = []
    @Published var errorMessage: String?

    private let logger = Logger(subsystem: "com.patch.app", category: "repository")

    init(context: NSManagedObjectContext = PersistenceController.shared.container.viewContext) {
        self.context = context
    }

    // MARK: - Fetch Operations

    /// Fetch all gardens
    func fetchAll() -> [Garden] {
        let request: NSFetchRequest<Garden> = Garden.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Garden.name, ascending: true)]

        do {
            let results = try context.fetch(request)
            DispatchQueue.main.async {
                self.gardens = results
            }
            return results
        } catch {
            logger.error("Error fetching gardens: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Fetch garden by ID
    func fetchById(_ id: UUID) -> Garden? {
        let request: NSFetchRequest<Garden> = Garden.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", id as CVarArg)
        request.fetchLimit = 1

        do {
            return try context.fetch(request).first
        } catch {
            logger.error("Error fetching garden by ID: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return nil
        }
    }

    /// Search gardens by name
    func search(query: String) -> [Garden] {
        guard !query.isEmpty else { return fetchAll() }

        let request: NSFetchRequest<Garden> = Garden.fetchRequest()
        request.predicate = NSPredicate(format: "name CONTAINS[cd] %@", query)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Garden.name, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            logger.error("Error searching gardens: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Filter gardens by type
    func filterByType(_ type: Garden.GardenType) -> [Garden] {
        let request: NSFetchRequest<Garden> = Garden.fetchRequest()
        request.predicate = NSPredicate(format: "gardenType == %@", type.rawValue)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Garden.name, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            logger.error("Error filtering gardens by type: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    // MARK: - Create

    @discardableResult
    func create(
        name: String,
        type: Garden.GardenType = .raisedBed,
        width: Double,
        length: Double,
        climateZone: String? = nil,
        soilType: Garden.SoilType? = nil
    ) -> Garden {
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

    // MARK: - Update

    func update(
        _ garden: Garden,
        name: String? = nil,
        type: Garden.GardenType? = nil,
        width: Double? = nil,
        length: Double? = nil,
        climateZone: String? = nil,
        soilType: Garden.SoilType? = nil
    ) {
        if let name = name { garden.name = name }
        if let type = type { garden.gardenType = type.rawValue }
        if let width = width { garden.width = width }
        if let length = length { garden.length = length }
        if let climateZone = climateZone { garden.climateZone = climateZone }
        if let soilType = soilType { garden.soilType = soilType.rawValue }

        garden.updatedAt = Date()
        save()
    }

    // MARK: - Delete

    func delete(_ garden: Garden, transferPlantsTo targetGarden: Garden? = nil) {
        // Transfer plants if target specified
        if let target = targetGarden, let plants = garden.plants as? Set<Plant> {
            for plant in plants {
                plant.garden = target
            }
        }

        context.delete(garden)
        save()
    }

    func deleteById(_ id: UUID, transferPlantsTo targetGarden: Garden? = nil) {
        if let garden = fetchById(id) {
            delete(garden, transferPlantsTo: targetGarden)
        }
    }

    // MARK: - Duplicate

    @discardableResult
    func duplicate(_ garden: Garden, withPlants: Bool = true) -> Garden {
        let newGarden = Garden(context: context)

        newGarden.id = UUID()
        newGarden.name = "\(garden.name) (Copy)"
        newGarden.gardenType = garden.gardenType
        newGarden.width = garden.width
        newGarden.length = garden.length
        newGarden.climateZone = garden.climateZone
        newGarden.soilType = garden.soilType
        newGarden.createdAt = Date()
        newGarden.updatedAt = Date()

        if withPlants, let plants = garden.plants as? Set<Plant> {
            for plant in plants {
                let newPlant = Plant(context: context)
                newPlant.id = UUID()
                newPlant.name = plant.name
                newPlant.species = plant.species
                newPlant.variety = plant.variety
                newPlant.plantingDate = plant.plantingDate
                newPlant.location = plant.location
                newPlant.healthStatus = plant.healthStatus
                newPlant.growthStage = plant.growthStage
                newPlant.garden = newGarden
                newPlant.createdAt = Date()
                newPlant.updatedAt = Date()
            }
        }

        save()
        return newGarden
    }

    // MARK: - Save

    private func save() {
        guard context.hasChanges else { return }

        do {
            try context.save()
            _ = fetchAll() // Refresh published gardens
        } catch {
            logger.error("Error saving context: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
        }
    }
}

extension GardenRepository: GardenDetailGardenRepository { }

/// Repository for GardenDesign entity CRUD operations.
final class GardenDesignRepository {
    private let context: NSManagedObjectContext
    private let logger = Logger(subsystem: "com.patch.app", category: "repository")

    init(context: NSManagedObjectContext = PersistenceController.shared.container.viewContext) {
        self.context = context
    }

    func fetchAll() -> [GardenDesign] {
        let request: NSFetchRequest<GardenDesign> = GardenDesign.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \GardenDesign.updatedAt, ascending: false)]

        do {
            return try context.fetch(request)
        } catch {
            logger.error("Error fetching garden designs: \(error.localizedDescription)")
            return []
        }
    }

    @discardableResult
    func create(name: String, garden: Garden) -> GardenDesign {
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

    func update(_ design: GardenDesign, canvasState: CanvasState) {
        design.canvasState = canvasState
        design.updatedAt = Date()
        save()
    }

    private func save() {
        guard context.hasChanges else { return }

        do {
            try context.save()
        } catch {
            logger.error("Error saving garden design context: \(error.localizedDescription)")
        }
    }
}
