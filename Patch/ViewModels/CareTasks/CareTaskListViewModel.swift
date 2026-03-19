import Foundation
import CoreData
import Combine

@MainActor
final class CareTaskListViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var overdueTasks: [CareTask] = []
    @Published var todayTasks: [CareTask] = []
    @Published var thisWeekTasks: [CareTask] = []
    @Published var laterTasks: [CareTask] = []

    @Published var searchText: String = ""
    @Published var selectedTaskTypeFilter: CareTask.TaskType?
    @Published var selectedPlantFilter: Plant?
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    // MARK: - Private Properties

    private let repository: CareTaskRepository
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Computed Properties

    var hasOverdueTasks: Bool {
        !overdueTasks.isEmpty
    }

    var hasTodayTasks: Bool {
        !todayTasks.isEmpty
    }

    var hasThisWeekTasks: Bool {
        !thisWeekTasks.isEmpty
    }

    var hasLaterTasks: Bool {
        !laterTasks.isEmpty
    }

    var hasAnyTasks: Bool {
        hasOverdueTasks || hasTodayTasks || hasThisWeekTasks || hasLaterTasks
    }

    var totalPendingCount: Int {
        overdueTasks.count + todayTasks.count + thisWeekTasks.count + laterTasks.count
    }

    var overdueCount: Int {
        overdueTasks.count
    }

    var todayCount: Int {
        todayTasks.count
    }

    var hasActiveFilters: Bool {
        !searchText.isEmpty || selectedTaskTypeFilter != nil || selectedPlantFilter != nil
    }

    // MARK: - Initialization

    init(repository: CareTaskRepository = CareTaskRepository()) {
        self.repository = repository
        setupBindings()
    }

    // MARK: - Setup

    private func setupBindings() {
        Publishers.CombineLatest3($searchText, $selectedTaskTypeFilter, $selectedPlantFilter)
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .sink { [weak self] _, _, _ in
                self?.loadTasks()
            }
            .store(in: &cancellables)
    }

    // MARK: - Load Tasks

    func loadTasks() {
        isLoading = true
        errorMessage = nil

        let calendar = Calendar.current
        let now = Date()
        let startOfToday = calendar.startOfDay(for: now)
        let endOfToday = calendar.date(byAdding: .day, value: 1, to: startOfToday)!
        let endOfWeek = calendar.date(byAdding: .day, value: 7, to: startOfToday)!

        // Fetch all incomplete tasks
        var allTasks = repository.fetchUpcoming()
        let overdue = repository.fetchOverdue()

        // Apply filters
        if let typeFilter = selectedTaskTypeFilter {
            allTasks = allTasks.filter { $0.taskType == typeFilter.rawValue }
        }

        if let plantFilter = selectedPlantFilter {
            allTasks = allTasks.filter { $0.plant == plantFilter }
        }

        if !searchText.isEmpty {
            allTasks = allTasks.filter { task in
                task.plant?.name.localizedCaseInsensitiveContains(searchText) == true ||
                task.taskType.localizedCaseInsensitiveContains(searchText) ||
                task.notes?.localizedCaseInsensitiveContains(searchText) == true
            }
        }

        // Apply same filters to overdue
        var filteredOverdue = overdue
        if let typeFilter = selectedTaskTypeFilter {
            filteredOverdue = filteredOverdue.filter { $0.taskType == typeFilter.rawValue }
        }
        if let plantFilter = selectedPlantFilter {
            filteredOverdue = filteredOverdue.filter { $0.plant == plantFilter }
        }
        if !searchText.isEmpty {
            filteredOverdue = filteredOverdue.filter { task in
                task.plant?.name.localizedCaseInsensitiveContains(searchText) == true ||
                task.taskType.localizedCaseInsensitiveContains(searchText) ||
                task.notes?.localizedCaseInsensitiveContains(searchText) == true
            }
        }

        // Group tasks by time period
        overdueTasks = filteredOverdue.sorted { $0.scheduledDate < $1.scheduledDate }

        todayTasks = allTasks.filter { task in
            task.scheduledDate >= startOfToday && task.scheduledDate < endOfToday
        }.sorted { $0.scheduledDate < $1.scheduledDate }

        thisWeekTasks = allTasks.filter { task in
            task.scheduledDate >= endOfToday && task.scheduledDate < endOfWeek
        }.sorted { $0.scheduledDate < $1.scheduledDate }

        laterTasks = allTasks.filter { task in
            task.scheduledDate >= endOfWeek
        }.sorted { $0.scheduledDate < $1.scheduledDate }

        isLoading = false
    }

    func refresh() async {
        loadTasks()
    }

    // MARK: - Task Actions

    func markComplete(_ task: CareTask) {
        repository.markComplete(task)
        loadTasks()
    }

    func snooze(_ task: CareTask, to date: Date) {
        repository.snooze(task, to: date)
        loadTasks()
    }

    func snooze(_ task: CareTask, byHours hours: Int) {
        repository.snooze(task, byHours: hours)
        loadTasks()
    }

    func skip(_ task: CareTask, reason: String? = nil) {
        // Mark as completed but with a skip indicator in notes
        if let reason = reason {
            let skipNote = "[Skipped: \(reason)]"
            let existingNotes = task.notes ?? ""
            task.notes = existingNotes.isEmpty ? skipNote : "\(existingNotes)\n\(skipNote)"
        } else {
            let skipNote = "[Skipped]"
            let existingNotes = task.notes ?? ""
            task.notes = existingNotes.isEmpty ? skipNote : "\(existingNotes)\n\(skipNote)"
        }
        repository.markComplete(task)
        loadTasks()
    }

    func delete(_ task: CareTask) {
        repository.delete(task)
        loadTasks()
    }

    func makeDetailViewModel(for task: CareTask) -> CareTaskDetailViewModel {
        CareTaskDetailViewModel(task: task, repository: repository)
    }

    // MARK: - Filter Actions

    func clearFilters() {
        searchText = ""
        selectedTaskTypeFilter = nil
        selectedPlantFilter = nil
    }

    func filterByType(_ type: CareTask.TaskType) {
        selectedTaskTypeFilter = type
    }

    func filterByPlant(_ plant: Plant) {
        selectedPlantFilter = plant
    }
}
