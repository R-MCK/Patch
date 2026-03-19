import Foundation
import CoreData
import Combine
import os

protocol PlantDetailPlantRepository {
    func fetchById(_ id: UUID) -> Plant?
    func fetchByGarden(_ garden: Garden) -> [Plant]
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
    )
    func delete(_ plant: Plant)
}

extension PlantDetailPlantRepository {
    func update(
        _ plant: Plant,
        healthStatus: Plant.HealthStatus? = nil,
        growthStage: Plant.GrowthStage? = nil
    ) {
        update(
            plant,
            name: nil,
            species: nil,
            variety: nil,
            plantingDate: nil,
            location: nil,
            spacingOverrideFeet: nil,
            healthStatus: healthStatus,
            growthStage: growthStage,
            notes: nil,
            garden: nil
        )
    }
}

/// Repository for Plant entity CRUD operations
@MainActor
final class PlantRepository: ObservableObject {

    private let context: NSManagedObjectContext

    @Published var plants: [Plant] = []
    @Published var errorMessage: String?

    private let logger = Logger(subsystem: "com.patch.app", category: "repository")

    init(context: NSManagedObjectContext = PersistenceController.shared.container.viewContext) {
        self.context = context
    }

    // MARK: - Fetch Operations

    /// Fetch all plants
    func fetchAll() -> [Plant] {
        let request: NSFetchRequest<Plant> = Plant.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Plant.name, ascending: true)]

        do {
            let results = try context.fetch(request)
            DispatchQueue.main.async {
                self.plants = results
            }
            return results
        } catch {
            logger.error("Error fetching plants: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Fetch plants by garden
    func fetchByGarden(_ garden: Garden) -> [Plant] {
        let request: NSFetchRequest<Plant> = Plant.fetchRequest()
        request.predicate = NSPredicate(format: "garden == %@", garden)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Plant.name, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            logger.error("Error fetching plants by garden: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Fetch plant by ID
    func fetchById(_ id: UUID) -> Plant? {
        let request: NSFetchRequest<Plant> = Plant.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", id as CVarArg)
        request.fetchLimit = 1

        do {
            return try context.fetch(request).first
        } catch {
            logger.error("Error fetching plant by ID: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return nil
        }
    }

    /// Search plants by name, species, or variety
    func search(query: String) -> [Plant] {
        guard !query.isEmpty else { return fetchAll() }

        let request: NSFetchRequest<Plant> = Plant.fetchRequest()
        request.predicate = NSPredicate(
            format: "name CONTAINS[cd] %@ OR species CONTAINS[cd] %@ OR variety CONTAINS[cd] %@",
            query, query, query
        )
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Plant.name, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            logger.error("Error searching plants: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Filter plants by health status
    func filterByHealth(_ status: Plant.HealthStatus) -> [Plant] {
        let request: NSFetchRequest<Plant> = Plant.fetchRequest()
        request.predicate = NSPredicate(format: "healthStatus == %@", status.rawValue)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Plant.name, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            logger.error("Error filtering plants by health: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Filter plants by growth stage
    func filterByGrowthStage(_ stage: Plant.GrowthStage) -> [Plant] {
        let request: NSFetchRequest<Plant> = Plant.fetchRequest()
        request.predicate = NSPredicate(format: "growthStage == %@", stage.rawValue)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Plant.name, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            logger.error("Error filtering plants by growth stage: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    // MARK: - Create

    @discardableResult
    func create(
        name: String,
        species: String? = nil,
        variety: String? = nil,
        plantingDate: Date? = nil,
        location: String? = nil,
        spacingOverrideFeet: Double? = nil,
        healthStatus: Plant.HealthStatus = .good,
        growthStage: Plant.GrowthStage = .seedling,
        notes: String? = nil,
        garden: Garden? = nil
    ) -> Plant {
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
        plant.notes = notes
        plant.garden = garden
        plant.createdAt = Date()
        plant.updatedAt = Date()

        save()
        return plant
    }

    // MARK: - Update

    func update(
        _ plant: Plant,
        name: String? = nil,
        species: String? = nil,
        variety: String? = nil,
        plantingDate: Date? = nil,
        location: String? = nil,
        spacingOverrideFeet: Double? = nil,
        healthStatus: Plant.HealthStatus? = nil,
        growthStage: Plant.GrowthStage? = nil,
        notes: String? = nil,
        garden: Garden? = nil
    ) {
        if let name = name { plant.name = name }
        if let species = species { plant.species = species }
        if let variety = variety { plant.variety = variety }
        if let plantingDate = plantingDate { plant.plantingDate = plantingDate }
        if let location = location { plant.location = location }
        plant.spacingOverrideFeet = spacingOverrideFeet.map { NSNumber(value: $0) }
        if let healthStatus = healthStatus { plant.healthStatus = healthStatus.rawValue }
        if let growthStage = growthStage { plant.growthStage = growthStage.rawValue }
        if let notes = notes { plant.notes = notes }
        if let garden = garden { plant.garden = garden }

        plant.updatedAt = Date()
        save()
    }

    // MARK: - Delete

    func delete(_ plant: Plant) {
        context.delete(plant)
        save()
    }

    func deleteById(_ id: UUID) {
        if let plant = fetchById(id) {
            delete(plant)
        }
    }

    // MARK: - Save

    private func save() {
        guard context.hasChanges else { return }

        do {
            try context.save()
            _ = fetchAll() // Refresh published plants
        } catch {
            logger.error("Error saving context: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
        }
    }
}

extension PlantRepository: PlantDetailPlantRepository { }
