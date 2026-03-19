import Foundation
import CoreData

extension WikiEntry {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<WikiEntry> {
        return NSFetchRequest<WikiEntry>(entityName: "WikiEntry")
    }

    @NSManaged public var id: UUID
    @NSManaged public var commonName: String
    @NSManaged public var scientificName: String?
    @NSManaged public var category: String
    @NSManaged public var entryDescription: String
    @NSManaged public var imageURL: String?

    // Care Guide
    @NSManaged public var sunlight: String
    @NSManaged public var watering: String
    @NSManaged public var soil: String
    @NSManaged public var temperature: String?
    @NSManaged public var humidity: String?
    @NSManaged public var fertilizing: String?

    // Planting Guide
    @NSManaged public var spacing: String?
    @NSManaged public var plantingDepth: String?
    @NSManaged public var germinationTime: String?
    @NSManaged public var daysToMaturity: Int16
    @NSManaged public var harvestInfo: String?

    // Companion Planting
    @NSManaged public var companionPlants: String?
    @NSManaged public var antagonistPlants: String?

    // Metadata
    @NSManaged public var difficulty: String
    @NSManaged public var isUserContributed: Bool
    @NSManaged public var createdAt: Date
    @NSManaged public var updatedAt: Date
}

// MARK: - Enums

extension WikiEntry {
    enum Category: String, CaseIterable {
        case vegetables = "Vegetables"
        case herbs = "Herbs"
        case flowers = "Flowers"
        case fruits = "Fruits"
        case houseplants = "Houseplants"
        case succulents = "Succulents"

        var icon: String {
            switch self {
            case .vegetables: return "carrot.fill"
            case .herbs: return "leaf.fill"
            case .flowers: return "camera.macro"
            case .fruits: return "apple.logo"
            case .houseplants: return "house.fill"
            case .succulents: return "drop.fill"
            }
        }

        var color: String {
            switch self {
            case .vegetables: return "orange"
            case .herbs: return "green"
            case .flowers: return "pink"
            case .fruits: return "red"
            case .houseplants: return "teal"
            case .succulents: return "mint"
            }
        }

        var displayName: String {
            rawValue
        }
    }

    enum Sunlight: String, CaseIterable {
        case fullSun = "Full Sun"
        case partialSun = "Partial Sun"
        case partialShade = "Partial Shade"
        case fullShade = "Full Shade"

        var icon: String {
            switch self {
            case .fullSun: return "sun.max.fill"
            case .partialSun: return "sun.min.fill"
            case .partialShade: return "cloud.sun.fill"
            case .fullShade: return "cloud.fill"
            }
        }
    }

    enum Watering: String, CaseIterable {
        case low = "Low"
        case moderate = "Moderate"
        case high = "High"
        case veryHigh = "Very High"

        var icon: String {
            switch self {
            case .low: return "drop"
            case .moderate: return "drop.fill"
            case .high: return "drop.triangle.fill"
            case .veryHigh: return "humidity.fill"
            }
        }
    }

    enum Difficulty: String, CaseIterable {
        case beginner = "Beginner"
        case easy = "Easy"
        case moderate = "Moderate"
        case challenging = "Challenging"
        case expert = "Expert"
    }
}

// MARK: - Computed Properties

extension WikiEntry {
    var companionPlantsArray: [String] {
        companionPlants?.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespaces) } ?? []
    }

    var antagonistPlantsArray: [String] {
        antagonistPlants?.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespaces) } ?? []
    }
}

extension WikiEntry: Identifiable { }
