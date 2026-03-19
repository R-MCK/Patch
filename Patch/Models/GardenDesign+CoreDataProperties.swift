import Foundation
import CoreData

extension GardenDesign {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<GardenDesign> {
        return NSFetchRequest<GardenDesign>(entityName: "GardenDesign")
    }

    @NSManaged public var id: UUID
    @NSManaged public var name: String
    @NSManaged public var canvasData: Data?
    @NSManaged public var thumbnailData: Data?
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date

    // Relationships
    @NSManaged public var garden: Garden?
}

// MARK: - Canvas Data Model

struct PlacedPlant: Codable, Identifiable {
    let id: UUID
    let wikiEntryId: UUID
    let name: String
    var x: Double
    var y: Double
    var rotation: Double
    var scale: Double

    init(id: UUID = UUID(), wikiEntryId: UUID, name: String, x: Double, y: Double, rotation: Double = 0, scale: Double = 1.0) {
        self.id = id
        self.wikiEntryId = wikiEntryId
        self.name = name
        self.x = x
        self.y = y
        self.rotation = rotation
        self.scale = scale
    }
}

struct CanvasState: Codable {
    var plants: [PlacedPlant]
    var gridSize: Double
    var showGrid: Bool
    var showSpacing: Bool
    var showCompanions: Bool

    init(plants: [PlacedPlant] = [], gridSize: Double = 12, showGrid: Bool = true, showSpacing: Bool = true, showCompanions: Bool = true) {
        self.plants = plants
        self.gridSize = gridSize
        self.showGrid = showGrid
        self.showSpacing = showSpacing
        self.showCompanions = showCompanions
    }
}

// MARK: - Computed Properties

extension GardenDesign {
    var canvasState: CanvasState? {
        get {
            guard let data = canvasData else { return nil }
            return try? JSONDecoder().decode(CanvasState.self, from: data)
        }
        set {
            canvasData = try? JSONEncoder().encode(newValue)
        }
    }

    var plantCount: Int {
        canvasState?.plants.count ?? 0
    }

    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: updatedAt)
    }
}

extension GardenDesign: Identifiable { }
