import Foundation
import CoreData

extension Plant {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<Plant> {
        return NSFetchRequest<Plant>(entityName: "Plant")
    }

    @NSManaged public var id: UUID
    @NSManaged public var name: String
    @NSManaged public var species: String?
    @NSManaged public var variety: String?
    @NSManaged public var plantingDate: Date?
    @NSManaged public var location: String?
    @NSManaged public var healthStatus: String
    @NSManaged public var growthStage: String
    @NSManaged public var notes: String?
    @NSManaged public var spacingOverrideFeet: NSNumber?
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date

    // Relationships
    @NSManaged public var garden: Garden?
    @NSManaged public var careTasks: NSSet?
    @NSManaged public var plantNotes: NSSet?
    @NSManaged public var photos: NSSet?
}

// MARK: - Relationships Accessors

extension Plant {
    @objc(addCareTasksObject:)
    @NSManaged public func addToCareTasks(_ value: CareTask)

    @objc(removeCareTasksObject:)
    @NSManaged public func removeFromCareTasks(_ value: CareTask)

    @objc(addCareTasks:)
    @NSManaged public func addToCareTasks(_ values: NSSet)

    @objc(removeCareTasks:)
    @NSManaged public func removeFromCareTasks(_ values: NSSet)

    @objc(addPlantNotesObject:)
    @NSManaged public func addToPlantNotes(_ value: Note)

    @objc(removePlantNotesObject:)
    @NSManaged public func removeFromPlantNotes(_ value: Note)

    @objc(addPlantNotes:)
    @NSManaged public func addToPlantNotes(_ values: NSSet)

    @objc(removePlantNotes:)
    @NSManaged public func removeFromPlantNotes(_ values: NSSet)

    @objc(addPhotosObject:)
    @NSManaged public func addToPhotos(_ value: Photo)

    @objc(removePhotosObject:)
    @NSManaged public func removeFromPhotos(_ value: Photo)

    @objc(addPhotos:)
    @NSManaged public func addToPhotos(_ values: NSSet)

    @objc(removePhotos:)
    @NSManaged public func removeFromPhotos(_ values: NSSet)
}

// MARK: - Enums

extension Plant {
    enum HealthStatus: String, CaseIterable {
        case excellent = "Excellent"
        case good = "Good"
        case fair = "Fair"
        case poor = "Poor"
        case critical = "Critical"

        var color: String {
            switch self {
            case .excellent: return "green"
            case .good: return "green"
            case .fair: return "yellow"
            case .poor: return "orange"
            case .critical: return "red"
            }
        }
    }

    enum GrowthStage: String, CaseIterable {
        case seedling = "Seedling"
        case vegetative = "Vegetative"
        case flowering = "Flowering"
        case fruiting = "Fruiting"
        case dormant = "Dormant"
        case harvesting = "Harvesting"
    }
}

extension Plant: Identifiable { }

extension Plant {
    var spacingOverrideFeetValue: Double? {
        guard let spacingOverrideFeet else { return nil }
        let value = spacingOverrideFeet.doubleValue
        return value > 0 ? value : nil
    }
}
