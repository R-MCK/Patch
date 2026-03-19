import Foundation
import CoreData
import Combine

@MainActor
final class AddCareTaskViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var selectedPlant: Plant?
    @Published var taskType: CareTask.TaskType = .watering
    @Published var scheduledDate: Date = Date()
    @Published var notes: String = ""
    @Published var isRecurring: Bool = false
    @Published var frequency: CareTask.Frequency = .weekly
    @Published var customIntervalDays: Int = 3

    @Published var availablePlants: [Plant] = []
    @Published var isSaving: Bool = false
    @Published var errorMessage: String?

    // MARK: - Validation

    @Published var plantError: String?

    var isValid: Bool {
        selectedPlant != nil
    }

    var canSave: Bool {
        isValid && !isSaving
    }

    // MARK: - Private Properties

    private let careTaskRepository: CareTaskRepository
    private let plantRepository: PlantRepository
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Initialization

    init(
        careTaskRepository: CareTaskRepository? = nil,
        plantRepository: PlantRepository? = nil,
        preselectedPlant: Plant? = nil
    ) {
        self.careTaskRepository = careTaskRepository ?? CareTaskRepository()
        self.plantRepository = plantRepository ?? PlantRepository()
        self.selectedPlant = preselectedPlant

        loadPlants()
        setupValidation()
    }

    // MARK: - Setup

    private func setupValidation() {
        $selectedPlant
            .map { plant -> String? in
                plant == nil ? "Please select a plant" : nil
            }
            .assign(to: &$plantError)
    }

    // MARK: - Load Plants

    func loadPlants() {
        availablePlants = plantRepository.fetchAll()
    }

    // MARK: - Recurrence Helpers

    /// Calculate the next occurrence date based on frequency
    func calculateNextOccurrence(from date: Date) -> Date? {
        let calendar = Calendar.current

        switch frequency {
        case .daily:
            return calendar.date(byAdding: .day, value: 1, to: date)
        case .everyOtherDay:
            return calendar.date(byAdding: .day, value: 2, to: date)
        case .weekly:
            return calendar.date(byAdding: .weekOfYear, value: 1, to: date)
        case .biweekly:
            return calendar.date(byAdding: .weekOfYear, value: 2, to: date)
        case .monthly:
            return calendar.date(byAdding: .month, value: 1, to: date)
        case .custom:
            return calendar.date(byAdding: .day, value: customIntervalDays, to: date)
        }
    }

    /// Get a human-readable description of the recurrence
    var recurrenceDescription: String {
        guard isRecurring else { return "One-time task" }

        switch frequency {
        case .daily:
            return "Repeats every day"
        case .everyOtherDay:
            return "Repeats every other day"
        case .weekly:
            return "Repeats every week"
        case .biweekly:
            return "Repeats every 2 weeks"
        case .monthly:
            return "Repeats every month"
        case .custom:
            return "Repeats every \(customIntervalDays) days"
        }
    }

    /// Get the next few occurrence dates for preview
    var nextOccurrences: [Date] {
        guard isRecurring else { return [] }

        var dates: [Date] = []
        var currentDate = scheduledDate

        for _ in 0..<3 {
            if let nextDate = calculateNextOccurrence(from: currentDate) {
                dates.append(nextDate)
                currentDate = nextDate
            }
        }

        return dates
    }

    // MARK: - Task Type Helpers

    /// Get suggested frequency for task type
    func suggestedFrequency(for taskType: CareTask.TaskType) -> CareTask.Frequency {
        switch taskType {
        case .watering:
            return .everyOtherDay
        case .fertilizing:
            return .biweekly
        case .pruning:
            return .monthly
        case .pestControl:
            return .weekly
        case .harvesting:
            return .weekly
        case .repotting:
            return .monthly
        case .weeding:
            return .weekly
        case .mulching:
            return .monthly
        }
    }

    /// Update frequency when task type changes (if user hasn't customized)
    func updateFrequencyForTaskType(_ newType: CareTask.TaskType) {
        if isRecurring {
            frequency = suggestedFrequency(for: newType)
        }
    }

    // MARK: - Save

    @discardableResult
    func save() -> CareTask? {
        guard let plant = selectedPlant else {
            errorMessage = "Please select a plant"
            return nil
        }

        isSaving = true
        errorMessage = nil

        let task = careTaskRepository.create(
            type: taskType,
            plant: plant,
            scheduledDate: scheduledDate,
            notes: notes.isEmpty ? nil : notes,
            isRecurring: isRecurring,
            frequency: isRecurring ? frequency : nil
        )

        isSaving = false
        return task
    }

    // MARK: - Reset

    func reset() {
        taskType = .watering
        scheduledDate = Date()
        notes = ""
        isRecurring = false
        frequency = .weekly
        customIntervalDays = 3
        errorMessage = nil
    }
}
