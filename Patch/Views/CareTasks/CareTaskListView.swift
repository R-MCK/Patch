import SwiftUI

struct CareTaskListView: View {
    @StateObject private var viewModel = CareTaskListViewModel()
    @State private var showAddTask = false
    @State private var selectedTask: CareTask?
    @State private var showFilters = false
    @State private var taskToSnooze: CareTask?
    @State private var showSnoozeSheet = false

    var body: some View {
        NavigationStack {
            VStack(spacing: AppTheme.Spacing.sm) {
                CareTaskHeaderCard(
                    totalCount: viewModel.totalPendingCount,
                    overdueCount: viewModel.overdueCount
                )
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.top, AppTheme.Spacing.sm)

                SearchBar(text: $viewModel.searchText, placeholder: "Search tasks...")
                    .padding(.horizontal, AppTheme.Spacing.md)

                CareTaskFilterChipsView(viewModel: viewModel)
                    .padding(.horizontal, AppTheme.Spacing.md)

                if viewModel.isLoading {
                    Spacer()
                    LoadingView(message: "Loading tasks...")
                    Spacer()
                } else if !viewModel.hasAnyTasks {
                    Spacer()
                    if viewModel.hasActiveFilters {
                        EmptyFilteredCareTaskView {
                            viewModel.clearFilters()
                        }
                    } else {
                        EmptyCareTaskView {
                            showAddTask = true
                        }
                    }
                    Spacer()
                } else {
                    // Task List
                    ScrollView {
                        LazyVStack(spacing: AppTheme.Spacing.md) {
                            // Overdue Section
                            if viewModel.hasOverdueTasks {
                                CareTaskSectionView(
                                    title: "Overdue",
                                    icon: "exclamationmark.circle.fill",
                                    iconColor: .healthCritical,
                                    tasks: viewModel.overdueTasks,
                                    onComplete: { task in viewModel.markComplete(task) },
                                    onSnooze: { task in
                                        taskToSnooze = task
                                        showSnoozeSheet = true
                                    },
                                    onTap: { task in selectedTask = task }
                                )
                            }

                            // Today Section
                            if viewModel.hasTodayTasks {
                                CareTaskSectionView(
                                    title: "Today",
                                    icon: "sun.max.fill",
                                    iconColor: .taskHarvesting,
                                    tasks: viewModel.todayTasks,
                                    onComplete: { task in viewModel.markComplete(task) },
                                    onSnooze: { task in
                                        taskToSnooze = task
                                        showSnoozeSheet = true
                                    },
                                    onTap: { task in selectedTask = task }
                                )
                            }

                            // This Week Section
                            if viewModel.hasThisWeekTasks {
                                CareTaskSectionView(
                                    title: "This Week",
                                    icon: "calendar",
                                    iconColor: .taskWatering,
                                    tasks: viewModel.thisWeekTasks,
                                    onComplete: { task in viewModel.markComplete(task) },
                                    onSnooze: { task in
                                        taskToSnooze = task
                                        showSnoozeSheet = true
                                    },
                                    onTap: { task in selectedTask = task }
                                )
                            }

                            // Later Section
                            if viewModel.hasLaterTasks {
                                CareTaskSectionView(
                                    title: "Later",
                                    icon: "calendar.badge.clock",
                                    iconColor: .patchTextSecondary,
                                    tasks: viewModel.laterTasks,
                                    onComplete: { task in viewModel.markComplete(task) },
                                    onSnooze: { task in
                                        taskToSnooze = task
                                        showSnoozeSheet = true
                                    },
                                    onTap: { task in selectedTask = task }
                                )
                            }
                        }
                        .padding(.horizontal)
                        .padding(.vertical, AppTheme.Spacing.md)
                    }
                }
            }
            .navigationTitle("Care Tasks")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    if viewModel.overdueCount > 0 {
                        HStack(spacing: AppTheme.Spacing.xxs) {
                            Image(systemName: "exclamationmark.circle.fill")
                                .foregroundColor(.healthCritical)
                            Text("\(viewModel.overdueCount)")
                                .font(.patchCaption1)
                                .fontWeight(.bold)
                                .foregroundColor(.healthCritical)
                        }
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showFilters.toggle()
                    } label: {
                        Label("Filter", systemImage: viewModel.hasActiveFilters ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle")
                            .font(.patchSubheadline)
                    }
                    .accessibilityLabel("Filter care tasks")
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showAddTask = true
                    } label: {
                        Label("Add", systemImage: "plus")
                            .font(.patchSubheadline)
                    }
                    .accessibilityLabel("Add care task")
                }
            }
            .sheet(isPresented: $showAddTask) {
                AddCareTaskView { _ in
                    viewModel.loadTasks()
                }
            }
            .sheet(item: $selectedTask) { task in
                CareTaskDetailView(viewModel: viewModel.makeDetailViewModel(for: task)) {
                    viewModel.loadTasks()
                }
            }
            .sheet(isPresented: $showFilters) {
                CareTaskFilterSheetView(viewModel: viewModel)
            }
            .sheet(isPresented: $showSnoozeSheet) {
                if let task = taskToSnooze {
                    SnoozePickerView(task: task) { snoozeDate in
                        viewModel.snooze(task, to: snoozeDate)
                        taskToSnooze = nil
                    }
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
            .onAppear {
                viewModel.loadTasks()
            }
            .screenBackgroundStyle()
        }
    }
}

struct CareTaskHeaderCard: View {
    let totalCount: Int
    let overdueCount: Int

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("Care Planner")
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
                .textCase(.uppercase)
                .kerning(0.5)
            Text("Task Timeline")
                .font(.patchTitle2)
                .foregroundColor(.patchText)
            Text("Stay ahead of watering, feeding, and maintenance by schedule.")
                .font(.patchSubheadline)
                .foregroundColor(.patchTextSecondary)

            HStack(spacing: AppTheme.Spacing.md) {
                careStat(title: "Visible", value: "\(totalCount)")
                careStat(title: "Overdue", value: "\(overdueCount)", highlight: overdueCount > 0)
            }
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }

    private func careStat(title: String, value: String, highlight: Bool = false) -> some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
            Text(title)
                .font(.patchCaption2)
                .foregroundColor(.patchTextSecondary)
            Text(value)
                .font(.patchHeadline)
                .foregroundColor(highlight ? .healthCritical : .patchPrimary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

// MARK: - Section View

struct CareTaskSectionView: View {
    let title: String
    let icon: String
    let iconColor: Color
    let tasks: [CareTask]
    let onComplete: (CareTask) -> Void
    let onSnooze: (CareTask) -> Void
    let onTap: (CareTask) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            // Section Header
            HStack(spacing: AppTheme.Spacing.sm) {
                Image(systemName: icon)
                    .font(.patchHeadline)
                    .foregroundColor(iconColor)

                Text(title)
                    .font(.patchHeadline)
                    .foregroundColor(.patchText)

                Text("(\(tasks.count))")
                    .font(.patchSubheadline)
                    .foregroundColor(.patchTextSecondary)

                Spacer()
            }
            .padding(.horizontal, AppTheme.Spacing.xs)

            // Task Rows
            ForEach(tasks) { task in
                CareTaskRowView(
                    task: task,
                    onComplete: { onComplete(task) },
                    onSnooze: { onSnooze(task) },
                    onTap: { onTap(task) }
                )
            }
        }
    }
}

// MARK: - Filter Chips View

struct CareTaskFilterChipsView: View {
    @ObservedObject var viewModel: CareTaskListViewModel

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: AppTheme.Spacing.sm) {
                if let taskType = viewModel.selectedTaskTypeFilter {
                    ChipButton(taskType.rawValue, isSelected: true) {
                        viewModel.selectedTaskTypeFilter = nil
                    }
                }

                if let plant = viewModel.selectedPlantFilter {
                    ChipButton(plant.name, isSelected: true) {
                        viewModel.selectedPlantFilter = nil
                    }
                }

                if viewModel.hasActiveFilters {
                    TextButton("Clear All") {
                        viewModel.clearFilters()
                    }
                }
            }
        }
    }
}

// MARK: - Filter Sheet View

struct CareTaskFilterSheetView: View {
    @ObservedObject var viewModel: CareTaskListViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Task Type") {
                    ForEach(CareTask.TaskType.allCases, id: \.self) { type in
                        Button {
                            if viewModel.selectedTaskTypeFilter == type {
                                viewModel.selectedTaskTypeFilter = nil
                            } else {
                                viewModel.selectedTaskTypeFilter = type
                            }
                        } label: {
                            HStack {
                                TaskTypeIcon(type: type.rawValue, size: 28)
                                Text(type.rawValue)
                                    .foregroundColor(.patchText)
                                Spacer()
                                if viewModel.selectedTaskTypeFilter == type {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(.patchPrimary)
                                }
                            }
                        }
                    }
                }

                Section {
                    Button("Clear All Filters", role: .destructive) {
                        viewModel.clearFilters()
                    }
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }
}

// MARK: - Snooze Picker View

struct SnoozePickerView: View {
    let task: CareTask
    let onSnooze: (Date) -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var selectedOption: SnoozeOption = .oneHour
    @State private var customDate = Date()

    enum SnoozeOption: String, CaseIterable {
        case oneHour = "1 Hour"
        case threeHours = "3 Hours"
        case tomorrow = "Tomorrow Morning"
        case twoDays = "In 2 Days"
        case nextWeek = "Next Week"
        case custom = "Custom Date & Time"

        var date: Date {
            let calendar = Calendar.current
            switch self {
            case .oneHour:
                return calendar.date(byAdding: .hour, value: 1, to: Date()) ?? Date()
            case .threeHours:
                return calendar.date(byAdding: .hour, value: 3, to: Date()) ?? Date()
            case .tomorrow:
                let tomorrow = calendar.date(byAdding: .day, value: 1, to: Date()) ?? Date()
                return calendar.date(bySettingHour: 9, minute: 0, second: 0, of: tomorrow) ?? tomorrow
            case .twoDays:
                return calendar.date(byAdding: .day, value: 2, to: Date()) ?? Date()
            case .nextWeek:
                return calendar.date(byAdding: .weekOfYear, value: 1, to: Date()) ?? Date()
            case .custom:
                return Date()
            }
        }
    }

    var body: some View {
        NavigationStack {
            Form {
                Section("Snooze Until") {
                    ForEach(SnoozeOption.allCases, id: \.self) { option in
                        Button {
                            selectedOption = option
                        } label: {
                            HStack {
                                Text(option.rawValue)
                                    .foregroundColor(.patchText)
                                Spacer()
                                if option != .custom {
                                    Text(formattedDate(option.date))
                                        .font(.patchCaption1)
                                        .foregroundColor(.patchTextSecondary)
                                }
                                if selectedOption == option {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(.patchPrimary)
                                }
                            }
                        }
                    }
                }

                if selectedOption == .custom {
                    Section("Custom Date & Time") {
                        DatePicker(
                            "Snooze until",
                            selection: $customDate,
                            in: Date()...,
                            displayedComponents: [.date, .hourAndMinute]
                        )
                        .labelsHidden()
                    }
                }
            }
            .navigationTitle("Snooze Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button("Snooze") {
                        let snoozeDate = selectedOption == .custom ? customDate : selectedOption.date
                        onSnooze(snoozeDate)
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
        }
        .presentationDetents([.medium])
    }

    private func formattedDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Task Detail View (Placeholder)

struct CareTaskDetailView: View {
    @StateObject private var viewModel: CareTaskDetailViewModel
    let onUpdate: () -> Void

    @Environment(\.dismiss) private var dismiss
    @State private var showDeleteConfirmation = false

    init(viewModel: CareTaskDetailViewModel, onUpdate: @escaping () -> Void) {
        _viewModel = StateObject(wrappedValue: viewModel)
        self.onUpdate = onUpdate
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                    // Task Type Header
                    HStack(spacing: AppTheme.Spacing.md) {
                        TaskTypeIcon(type: viewModel.task.taskType, size: 56)

                        VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                            Text(viewModel.task.taskType)
                                .font(.patchTitle2)
                                .foregroundColor(.patchText)

                            if let plant = viewModel.task.plant {
                                Text(plant.name)
                                    .font(.patchSubheadline)
                                    .foregroundColor(.patchTextSecondary)
                            }
                        }

                        Spacer()
                    }
                    .padding()
                    .background(Color.patchBackgroundSecondary)
                    .cornerRadius(AppTheme.CornerRadius.lg)

                    // Schedule Info
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                        Text("Schedule")
                            .font(.patchHeadline)
                            .foregroundColor(.patchText)

                        HStack {
                            Image(systemName: "calendar")
                                .foregroundColor(.patchTextSecondary)
                            Text(formattedDate)
                                .font(.patchBody)
                                .foregroundColor(.patchText)
                        }

                        if viewModel.task.isRecurring, let frequency = viewModel.task.frequency {
                            HStack {
                                Image(systemName: "repeat")
                                    .foregroundColor(.patchTextSecondary)
                                Text("Repeats \(frequency)")
                                    .font(.patchBody)
                                    .foregroundColor(.patchText)
                            }
                        }
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.patchBackgroundSecondary)
                    .cornerRadius(AppTheme.CornerRadius.lg)

                    // Notes
                    if let notes = viewModel.task.notes, !notes.isEmpty {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                            Text("Notes")
                                .font(.patchHeadline)
                                .foregroundColor(.patchText)

                            Text(notes)
                                .font(.patchBody)
                                .foregroundColor(.patchTextSecondary)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.patchBackgroundSecondary)
                        .cornerRadius(AppTheme.CornerRadius.lg)
                    }

                    // Actions
                    VStack(spacing: AppTheme.Spacing.sm) {
                        PrimaryButton("Mark Complete", icon: "checkmark") {
                            viewModel.markComplete()
                            onUpdate()
                            dismiss()
                        }

                        SecondaryButton("Delete Task", icon: "trash") {
                            showDeleteConfirmation = true
                        }
                    }
                }
                .padding()
            }
            .navigationTitle("Task Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .alert("Delete Task?", isPresented: $showDeleteConfirmation) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    viewModel.delete()
                    onUpdate()
                    dismiss()
                }
            } message: {
                Text("This action cannot be undone.")
            }
        }
    }

    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .full
        formatter.timeStyle = .short
        return formatter.string(from: viewModel.task.scheduledDate)
    }
}

@MainActor
final class CareTaskDetailViewModel: ObservableObject {
    let task: CareTask

    private let repository: any CareTaskActionRepository

    init(task: CareTask, repository: any CareTaskActionRepository) {
        self.task = task
        self.repository = repository
    }

    func markComplete() {
        repository.markComplete(task)
    }

    func delete() {
        repository.delete(task)
    }
}

// MARK: - Preview

#Preview("Care Task List") {
    CareTaskListView()
}
