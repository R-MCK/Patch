import Foundation
import CoreData

extension Garden {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<Garden> {
        return NSFetchRequest<Garden>(entityName: "Garden")
    }

    @NSManaged public var id: UUID
    @NSManaged public var name: String
    @NSManaged public var gardenType: String
    @NSManaged public var width: Double
    @NSManaged public var length: Double
    @NSManaged public var climateZone: String?
    @NSManaged public var soilType: String?
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date

    // Relationships
    @NSManaged public var plants: NSSet?
    @NSManaged public var designs: NSSet?
}

// MARK: - Relationships Accessors

extension Garden {
    @objc(addPlantsObject:)
    @NSManaged public func addToPlants(_ value: Plant)

    @objc(removePlantsObject:)
    @NSManaged public func removeFromPlants(_ value: Plant)

    @objc(addPlants:)
    @NSManaged public func addToPlants(_ values: NSSet)

    @objc(removePlants:)
    @NSManaged public func removeFromPlants(_ values: NSSet)

    @objc(addDesignsObject:)
    @NSManaged public func addToDesigns(_ value: GardenDesign)

    @objc(removeDesignsObject:)
    @NSManaged public func removeFromDesigns(_ value: GardenDesign)

    @objc(addDesigns:)
    @NSManaged public func addToDesigns(_ values: NSSet)

    @objc(removeDesigns:)
    @NSManaged public func removeFromDesigns(_ values: NSSet)
}

// MARK: - Enums

extension Garden {
    enum GardenType: String, CaseIterable {
        case raisedBed = "Raised Bed"
        case inGround = "In-Ground"
        case container = "Container"
        case greenhouse = "Greenhouse"
        case hydroponic = "Hydroponic"
    }

    enum SoilType: String, CaseIterable {
        case clay = "Clay"
        case sandy = "Sandy"
        case loamy = "Loamy"
        case silty = "Silty"
        case peaty = "Peaty"
        case chalky = "Chalky"
    }
}

// MARK: - Computed Properties

extension Garden {
    var plantCount: Int {
        plants?.count ?? 0
    }

    var area: Double {
        width * length
    }

    var dimensions: String {
        "\(Int(width))' × \(Int(length))'"
    }
}

extension Garden: Identifiable { }
