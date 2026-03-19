import Foundation
import CoreData
import Combine

protocol PlantCareTaskRepository {
    func fetchByPlant(_ plant: Plant) -> [CareTask]
}

protocol CareTaskActionRepository {
    func fetchById(_ id: UUID) -> CareTask?
    func markComplete(_ task: CareTask)
    func snooze(_ task: CareTask, byHours hours: Int)
    func delete(_ task: CareTask)
}

/// Repository for CareTask entity CRUD operations
final class CareTaskRepository: ObservableObject {

    private let context: NSManagedObjectContext

    @Published var tasks: [CareTask] = []

    init(context: NSManagedObjectContext = PersistenceController.shared.container.viewContext) {
        self.context = context
    }

    // MARK: - Fetch Operations

    /// Fetch all tasks
    func fetchAll() -> [CareTask] {
        let request: NSFetchRequest<CareTask> = CareTask.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \CareTask.scheduledDate, ascending: true)]

        do {
            let results = try context.fetch(request)
            DispatchQueue.main.async {
                self.tasks = results
            }
            return results
        } catch {
            print("Error fetching care tasks: \(error)")
            return []
        }
    }

    /// Fetch tasks by plant
    func fetchByPlant(_ plant: Plant) -> [CareTask] {
        let request: NSFetchRequest<CareTask> = CareTask.fetchRequest()
        request.predicate = NSPredicate(format: "plant == %@", plant)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \CareTask.scheduledDate, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching tasks by plant: \(error)")
            return []
        }
    }

    /// Fetch task by ID
    func fetchById(_ id: UUID) -> CareTask? {
        let request: NSFetchRequest<CareTask> = CareTask.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", id as CVarArg)
        request.fetchLimit = 1

        do {
            return try context.fetch(request).first
        } catch {
            print("Error fetching task by ID: \(error)")
            return nil
        }
    }

    /// Fetch upcoming tasks (not completed, scheduled in future or today)
    func fetchUpcoming(limit: Int? = nil) -> [CareTask] {
        let request: NSFetchRequest<CareTask> = CareTask.fetchRequest()
        let startOfDay = Calendar.current.startOfDay(for: Date())
        request.predicate = NSPredicate(format: "completedDate == nil AND scheduledDate >= %@", startOfDay as CVarArg)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \CareTask.scheduledDate, ascending: true)]

        if let limit = limit {
            request.fetchLimit = limit
        }

        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching upcoming tasks: \(error)")
            return []
        }
    }

    /// Fetch overdue tasks
    func fetchOverdue() -> [CareTask] {
        let request: NSFetchRequest<CareTask> = CareTask.fetchRequest()
        let startOfDay = Calendar.current.startOfDay(for: Date())
        request.predicate = NSPredicate(format: "completedDate == nil AND scheduledDate < %@", startOfDay as CVarArg)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \CareTask.scheduledDate, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching overdue tasks: \(error)")
            return []
        }
    }

    /// Fetch tasks due today
    func fetchDueToday() -> [CareTask] {
        let request: NSFetchRequest<CareTask> = CareTask.fetchRequest()
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        guard let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay) else {
            return []
        }

        request.predicate = NSPredicate(
            format: "completedDate == nil AND scheduledDate >= %@ AND scheduledDate < %@",
            startOfDay as CVarArg, endOfDay as CVarArg
        )
        request.sortDescriptors = [NSSortDescriptor(keyPath: \CareTask.scheduledDate, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching tasks due today: \(error)")
            return []
        }
    }

    /// Fetch completed tasks
    func fetchCompleted(limit: Int? = nil) -> [CareTask] {
        let request: NSFetchRequest<CareTask> = CareTask.fetchRequest()
        request.predicate = NSPredicate(format: "completedDate != nil")
        request.sortDescriptors = [NSSortDescriptor(keyPath: \CareTask.completedDate, ascending: false)]

        if let limit = limit {
            request.fetchLimit = limit
        }

        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching completed tasks: \(error)")
            return []
        }
    }

    /// Filter by task type
    func filterByType(_ type: CareTask.TaskType) -> [CareTask] {
        let request: NSFetchRequest<CareTask> = CareTask.fetchRequest()
        request.predicate = NSPredicate(format: "taskType == %@ AND completedDate == nil", type.rawValue)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \CareTask.scheduledDate, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            print("Error filtering tasks by type: \(error)")
            return []
        }
    }

    // MARK: - Create

    @discardableResult
    func create(
        type: CareTask.TaskType,
        plant: Plant,
        scheduledDate: Date,
        notes: String? = nil,
        isRecurring: Bool = false,
        frequency: CareTask.Frequency? = nil
    ) -> CareTask {
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

    // MARK: - Update

    func update(
        _ task: CareTask,
        type: CareTask.TaskType? = nil,
        scheduledDate: Date? = nil,
        notes: String? = nil,
        isRecurring: Bool? = nil,
        frequency: CareTask.Frequency? = nil
    ) {
        if let type = type { task.taskType = type.rawValue }
        if let scheduledDate = scheduledDate { task.scheduledDate = scheduledDate }
        if let notes = notes { task.notes = notes }
        if let isRecurring = isRecurring { task.isRecurring = isRecurring }
        if let frequency = frequency { task.frequency = frequency.rawValue }

        save()
    }

    // MARK: - Complete

    func markComplete(_ task: CareTask) {
        task.completedDate = Date()

        // Create next occurrence if recurring
        if task.isRecurring, let frequency = task.frequency {
            createNextOccurrence(for: task, frequency: frequency)
        }

        save()
    }

    private func createNextOccurrence(for task: CareTask, frequency: String) {
        guard let plant = task.plant else { return }

        let calendar = Calendar.current
        var nextDate: Date?

        switch CareTask.Frequency(rawValue: frequency) {
        case .daily:
            nextDate = calendar.date(byAdding: .day, value: 1, to: task.scheduledDate)
        case .everyOtherDay:
            nextDate = calendar.date(byAdding: .day, value: 2, to: task.scheduledDate)
        case .weekly:
            nextDate = calendar.date(byAdding: .weekOfYear, value: 1, to: task.scheduledDate)
        case .biweekly:
            nextDate = calendar.date(byAdding: .weekOfYear, value: 2, to: task.scheduledDate)
        case .monthly:
            nextDate = calendar.date(byAdding: .month, value: 1, to: task.scheduledDate)
        default:
            break
        }

        if let nextDate = nextDate {
            create(
                type: CareTask.TaskType(rawValue: task.taskType) ?? .watering,
                plant: plant,
                scheduledDate: nextDate,
                notes: task.notes,
                isRecurring: true,
                frequency: CareTask.Frequency(rawValue: frequency)
            )
        }
    }

    // MARK: - Snooze

    func snooze(_ task: CareTask, to newDate: Date) {
        task.scheduledDate = newDate
        save()
    }

    func snooze(_ task: CareTask, byHours hours: Int) {
        let newDate = Calendar.current.date(byAdding: .hour, value: hours, to: Date()) ?? Date()
        snooze(task, to: newDate)
    }

    // MARK: - Delete

    func delete(_ task: CareTask) {
        context.delete(task)
        save()
    }

    func deleteById(_ id: UUID) {
        if let task = fetchById(id) {
            delete(task)
        }
    }

    // MARK: - Save

    private func save() {
        guard context.hasChanges else { return }

        do {
            try context.save()
            _ = fetchAll() // Refresh published tasks
        } catch {
            print("Error saving context: \(error)")
        }
    }
}

extension CareTaskRepository: PlantCareTaskRepository { }
extension CareTaskRepository: CareTaskActionRepository { }
