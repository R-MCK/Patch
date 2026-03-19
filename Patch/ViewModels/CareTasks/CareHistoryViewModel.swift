import Foundation
import CoreData
import Combine

@MainActor
final class CareHistoryViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var completedTasks: [CareTask] = []
    @Published var groupedTasks: [Date: [CareTask]] = [:]
    @Published var sortedDates: [Date] = []

    @Published var searchText: String = ""
    @Published var selectedTaskTypeFilter: CareTask.TaskType?
    @Published var selectedPlantFilter: Plant?
    @Published var dateRange: DateRange = .all

    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    // MARK: - Statistics

    @Published var totalCompleted: Int = 0
    @Published var thisWeekCompleted: Int = 0
    @Published var thisMonthCompleted: Int = 0
    @Published var currentStreak: Int = 0
    @Published var longestStreak: Int = 0
    @Published var completionRate: Double = 0.0
    @Published var taskTypeBreakdown: [CareTask.TaskType: Int] = [:]

    // MARK: - Date Range Options

    enum DateRange: String, CaseIterable {
        case week = "This Week"
        case month = "This Month"
        case year = "This Year"
        case all = "All Time"

        var startDate: Date? {
            let calendar = Calendar.current
            switch self {
            case .week:
                return calendar.date(byAdding: .day, value: -7, to: Date())
            case .month:
                return calendar.date(byAdding: .month, value: -1, to: Date())
            case .year:
                return calendar.date(byAdding: .year, value: -1, to: Date())
            case .all:
                return nil
            }
        }
    }

    // MARK: - Private Properties

    private let repository: CareTaskRepository
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Computed Properties

    var hasActiveFilters: Bool {
        !searchText.isEmpty || selectedTaskTypeFilter != nil || selectedPlantFilter != nil || dateRange != .all
    }

    var isEmpty: Bool {
        completedTasks.isEmpty
    }

    // MARK: - Initialization

    init(repository: CareTaskRepository = CareTaskRepository()) {
        self.repository = repository
        setupBindings()
    }

    // MARK: - Setup

    private func setupBindings() {
        Publishers.CombineLatest4($searchText, $selectedTaskTypeFilter, $selectedPlantFilter, $dateRange)
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .sink { [weak self] _, _, _, _ in
                self?.loadHistory()
            }
            .store(in: &cancellables)
    }

    // MARK: - Load History

    func loadHistory() {
        isLoading = true
        errorMessage = nil

        // Fetch all completed tasks
        var tasks = repository.fetchCompleted()

        // Apply date range filter
        if let startDate = dateRange.startDate {
            tasks = tasks.filter { task in
                if let completedDate = task.completedDate {
                    return completedDate >= startDate
                }
                return false
            }
        }

        // Apply task type filter
        if let typeFilter = selectedTaskTypeFilter {
            tasks = tasks.filter { $0.taskType == typeFilter.rawValue }
        }

        // Apply plant filter
        if let plantFilter = selectedPlantFilter {
            tasks = tasks.filter { $0.plant == plantFilter }
        }

        // Apply search filter
        if !searchText.isEmpty {
            tasks = tasks.filter { task in
                task.plant?.name.localizedCaseInsensitiveContains(searchText) == true ||
                task.taskType.localizedCaseInsensitiveContains(searchText) ||
                task.notes?.localizedCaseInsensitiveContains(searchText) == true
            }
        }

        completedTasks = tasks

        // Group by completion date
        groupTasksByDate()

        // Calculate statistics
        calculateStatistics()

        isLoading = false
    }

    func refresh() async {
        loadHistory()
    }

    // MARK: - Group Tasks

    private func groupTasksByDate() {
        let calendar = Calendar.current
        var grouped: [Date: [CareTask]] = [:]

        for task in completedTasks {
            guard let completedDate = task.completedDate else { continue }
            let dateKey = calendar.startOfDay(for: completedDate)

            if grouped[dateKey] != nil {
                grouped[dateKey]?.append(task)
            } else {
                grouped[dateKey] = [task]
            }
        }

        groupedTasks = grouped
        sortedDates = grouped.keys.sorted(by: >)
    }

    // MARK: - Statistics

    private func calculateStatistics() {
        let allCompleted = repository.fetchCompleted()
        let calendar = Calendar.current
        let now = Date()

        // Total completed
        totalCompleted = allCompleted.count

        // This week
        let weekStart = calendar.date(byAdding: .day, value: -7, to: now) ?? now
        thisWeekCompleted = allCompleted.filter { task in
            if let date = task.completedDate {
                return date >= weekStart
            }
            return false
        }.count

        // This month
        let monthStart = calendar.date(byAdding: .month, value: -1, to: now) ?? now
        thisMonthCompleted = allCompleted.filter { task in
            if let date = task.completedDate {
                return date >= monthStart
            }
            return false
        }.count

        // Calculate streaks
        calculateStreaks(from: allCompleted)

        // Task type breakdown
        var breakdown: [CareTask.TaskType: Int] = [:]
        for task in allCompleted {
            if let type = CareTask.TaskType(rawValue: task.taskType) {
                breakdown[type, default: 0] += 1
            }
        }
        taskTypeBreakdown = breakdown

        // Completion rate (completed / total scheduled in last 30 days)
        calculateCompletionRate()
    }

    private func calculateStreaks(from tasks: [CareTask]) {
        let calendar = Calendar.current

        // Get unique dates with completed tasks
        let completionDates = Set(tasks.compactMap { task -> Date? in
            guard let date = task.completedDate else { return nil }
            return calendar.startOfDay(for: date)
        }).sorted(by: >)

        guard !completionDates.isEmpty else {
            currentStreak = 0
            longestStreak = 0
            return
        }

        // Calculate current streak
        var streak = 0
        var checkDate = calendar.startOfDay(for: Date())

        for date in completionDates {
            if date == checkDate {
                streak += 1
                guard let previousDay = calendar.date(byAdding: .day, value: -1, to: checkDate) else { break }
                checkDate = previousDay
            } else if date < checkDate {
                break
            }
        }
        currentStreak = streak

        // Calculate longest streak
        var longest = 0
        var currentRun = 0
        var previousDate: Date?

        for date in completionDates.sorted() {
            if let prev = previousDate {
                let daysBetween = calendar.dateComponents([.day], from: prev, to: date).day ?? 0
                if daysBetween == 1 {
                    currentRun += 1
                } else {
                    longest = max(longest, currentRun)
                    currentRun = 1
                }
            } else {
                currentRun = 1
            }
            previousDate = date
        }
        longest = max(longest, currentRun)
        longestStreak = longest
    }

    private func calculateCompletionRate() {
        let calendar = Calendar.current
        let monthAgo = calendar.date(byAdding: .month, value: -1, to: Date()) ?? Date()

        // Get all tasks (completed and incomplete) from last 30 days
        let allTasks = repository.fetchAll()
        let recentTasks = allTasks.filter { task in
            task.scheduledDate >= monthAgo && task.scheduledDate <= Date()
        }

        let completed = recentTasks.filter { $0.isCompleted }.count
        let total = recentTasks.count

        completionRate = total > 0 ? Double(completed) / Double(total) * 100 : 0
    }

    // MARK: - Filter Actions

    func clearFilters() {
        searchText = ""
        selectedTaskTypeFilter = nil
        selectedPlantFilter = nil
        dateRange = .all
    }
}
