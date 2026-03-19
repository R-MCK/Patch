import SwiftUI

struct CareHistoryView: View {
    @StateObject private var viewModel = CareHistoryViewModel()
    @State private var showFilters = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search Bar
                SearchBar(text: $viewModel.searchText, placeholder: "Search history...")
                    .padding(.horizontal)
                    .padding(.top, AppTheme.Spacing.sm)

                // Date Range Picker
                ScrollView(.horizontal, showsIndicators: false) {
                    HStack(spacing: AppTheme.Spacing.sm) {
                        ForEach(CareHistoryViewModel.DateRange.allCases, id: \.self) { range in
                            ChipButton(
                                range.rawValue,
                                isSelected: viewModel.dateRange == range
                            ) {
                                viewModel.dateRange = range
                            }
                        }
                    }
                    .padding(.horizontal)
                }
                .padding(.vertical, AppTheme.Spacing.sm)

                if viewModel.isLoading {
                    Spacer()
                    LoadingView(message: "Loading history...")
                    Spacer()
                } else if viewModel.isEmpty {
                    Spacer()
                    EmptyHistoryView(hasFilters: viewModel.hasActiveFilters) {
                        viewModel.clearFilters()
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: AppTheme.Spacing.lg) {
                            // Statistics Summary
                            CareStatisticsSummaryView(viewModel: viewModel)
                                .padding(.horizontal)

                            // History List
                            ForEach(viewModel.sortedDates, id: \.self) { date in
                                if let tasks = viewModel.groupedTasks[date] {
                                    HistoryDateSection(date: date, tasks: tasks)
                                }
                            }
                            .padding(.horizontal)
                        }
                        .padding(.vertical)
                    }
                }
            }
            .navigationTitle("History")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showFilters.toggle()
                    } label: {
                        Image(systemName: viewModel.hasActiveFilters ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle")
                            .font(.title3)
                    }
                }
            }
            .sheet(isPresented: $showFilters) {
                CareHistoryFilterSheet(viewModel: viewModel)
            }
            .refreshable {
                await viewModel.refresh()
            }
            .onAppear {
                viewModel.loadHistory()
            }
        }
    }
}

// MARK: - Statistics Summary View

struct CareStatisticsSummaryView: View {
    @ObservedObject var viewModel: CareHistoryViewModel

    var body: some View {
        VStack(spacing: AppTheme.Spacing.md) {
            // Top Stats Row
            HStack(spacing: AppTheme.Spacing.md) {
                StatCard(
                    title: "Total",
                    value: "\(viewModel.totalCompleted)",
                    icon: "checkmark.circle.fill",
                    color: .patchPrimary
                )

                StatCard(
                    title: "This Week",
                    value: "\(viewModel.thisWeekCompleted)",
                    icon: "calendar",
                    color: .taskWatering
                )

                StatCard(
                    title: "This Month",
                    value: "\(viewModel.thisMonthCompleted)",
                    icon: "calendar.badge.clock",
                    color: .taskFertilizing
                )
            }

            // Streak Stats
            HStack(spacing: AppTheme.Spacing.md) {
                StatCard(
                    title: "Current Streak",
                    value: "\(viewModel.currentStreak) days",
                    icon: "flame.fill",
                    color: .taskPruning
                )

                StatCard(
                    title: "Longest Streak",
                    value: "\(viewModel.longestStreak) days",
                    icon: "trophy.fill",
                    color: .taskHarvesting
                )
            }

            // Completion Rate
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                HStack {
                    Text("30-Day Completion Rate")
                        .font(.patchSubheadline)
                        .foregroundColor(.patchTextSecondary)

                    Spacer()

                    Text(String(format: "%.0f%%", viewModel.completionRate))
                        .font(.patchHeadline)
                        .foregroundColor(.patchPrimary)
                }

                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.sm)
                            .fill(Color.patchBackgroundTertiary)
                            .frame(height: 8)

                        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.sm)
                            .fill(Color.patchPrimary)
                            .frame(width: geometry.size.width * CGFloat(viewModel.completionRate / 100), height: 8)
                    }
                }
                .frame(height: 8)
            }
            .padding(AppTheme.Spacing.lg)
            .background(.ultraThinMaterial)
            .background(Color.white.opacity(0.6))
            .cornerRadius(AppTheme.CornerRadius.xl)
            .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
        }
    }
}

// StatCard moved to Cards.swift

// MARK: - History Date Section

struct HistoryDateSection: View {
    let date: Date
    let tasks: [CareTask]

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            // Date Header
            Text(formattedDate)
                .font(.patchHeadline)
                .foregroundColor(.patchText)
                .padding(.horizontal, AppTheme.Spacing.xs)

            // Task Rows
            ForEach(tasks) { task in
                CompletedTaskRow(task: task)
            }
        }
    }

    private var formattedDate: String {
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInYesterday(date) {
            return "Yesterday"
        } else {
            let formatter = DateFormatter()
            formatter.dateStyle = .medium
            return formatter.string(from: date)
        }
    }
}

struct CompletedTaskRow: View {
    let task: CareTask

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            // Completed checkmark
            Image(systemName: "checkmark.circle.fill")
                .font(.title2)
                .foregroundColor(.patchPrimary)

            // Task Type Icon
            TaskTypeIcon(type: task.taskType, size: 36)

            // Task Details
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                Text(task.taskType)
                    .font(.patchSubheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.patchText)

                if let plant = task.plant {
                    Text(plant.name)
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                }
            }

            Spacer()

            // Completion Time
            if let completedDate = task.completedDate {
                Text(formattedTime(completedDate))
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextTertiary)
            }
        }
        .padding(AppTheme.Spacing.md)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }

    private func formattedTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Empty History View

struct EmptyHistoryView: View {
    let hasFilters: Bool
    let onClearFilters: () -> Void

    var body: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            Image(systemName: hasFilters ? "magnifyingglass" : "clock.arrow.circlepath")
                .font(.system(size: 64))
                .foregroundColor(.patchPrimary.opacity(0.5))

            VStack(spacing: AppTheme.Spacing.sm) {
                Text(hasFilters ? "No Results" : "No History Yet")
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)
                    .multilineTextAlignment(.center)

                Text(hasFilters ? "No completed tasks match your filters" : "Complete some care tasks to build your history")
                    .font(.patchBody)
                    .foregroundColor(.patchTextSecondary)
                    .multilineTextAlignment(.center)
            }

            if hasFilters {
                SecondaryButton("Clear Filters", icon: "xmark.circle", action: onClearFilters)
                    .padding(.top, AppTheme.Spacing.sm)
            }
        }
        .padding(AppTheme.Spacing.xl)
    }
}

// MARK: - Filter Sheet

struct CareHistoryFilterSheet: View {
    @ObservedObject var viewModel: CareHistoryViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Task Type") {
                    Button {
                        viewModel.selectedTaskTypeFilter = nil
                    } label: {
                        HStack {
                            Text("All Types")
                                .foregroundColor(.patchText)
                            Spacer()
                            if viewModel.selectedTaskTypeFilter == nil {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.patchPrimary)
                            }
                        }
                    }

                    ForEach(CareTask.TaskType.allCases, id: \.self) { type in
                        Button {
                            viewModel.selectedTaskTypeFilter = type
                        } label: {
                            HStack {
                                TaskTypeIcon(type: type.rawValue, size: 24)
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

// MARK: - Preview

#Preview("Care History") {
    CareHistoryView()
}
