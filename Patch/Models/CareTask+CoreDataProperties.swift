import Foundation
import CoreData

extension CareTask {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<CareTask> {
        return NSFetchRequest<CareTask>(entityName: "CareTask")
    }

    @NSManaged public var id: UUID
    @NSManaged public var taskType: String
    @NSManaged public var scheduledDate: Date
    @NSManaged public var completedDate: Date?
    @NSManaged public var notes: String?
    @NSManaged public var isRecurring: Bool
    @NSManaged public var frequency: String?
    @NSManaged public var createdAt: Date

    // Relationships
    @NSManaged public var plant: Plant?
}

// MARK: - Enums

extension CareTask {
    enum TaskType: String, CaseIterable {
        case watering = "Watering"
        case fertilizing = "Fertilizing"
        case pruning = "Pruning"
        case pestControl = "Pest Control"
        case harvesting = "Harvesting"
        case repotting = "Repotting"
        case weeding = "Weeding"
        case mulching = "Mulching"

        var icon: String {
            switch self {
            case .watering: return "drop.fill"
            case .fertilizing: return "leaf.arrow.circlepath"
            case .pruning: return "scissors"
            case .pestControl: return "ant.fill"
            case .harvesting: return "basket.fill"
            case .repotting: return "arrow.up.bin.fill"
            case .weeding: return "leaf.fill"
            case .mulching: return "rectangle.stack.fill"
            }
        }

        var color: String {
            switch self {
            case .watering: return "blue"
            case .fertilizing: return "green"
            case .pruning: return "orange"
            case .pestControl: return "red"
            case .harvesting: return "yellow"
            case .repotting: return "brown"
            case .weeding: return "green"
            case .mulching: return "brown"
            }
        }
    }

    enum Frequency: String, CaseIterable {
        case daily = "Daily"
        case everyOtherDay = "Every Other Day"
        case weekly = "Weekly"
        case biweekly = "Biweekly"
        case monthly = "Monthly"
        case custom = "Custom"
    }
}

// MARK: - Computed Properties

extension CareTask {
    var isCompleted: Bool {
        completedDate != nil
    }

    var isOverdue: Bool {
        !isCompleted && scheduledDate < Date()
    }

    var isDueToday: Bool {
        Calendar.current.isDateInToday(scheduledDate)
    }

    var isDueThisWeek: Bool {
        Calendar.current.isDate(scheduledDate, equalTo: Date(), toGranularity: .weekOfYear)
    }
}

extension CareTask: Identifiable { }
