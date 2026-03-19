import SwiftUI
import Charts

struct CareStatisticsView: View {
    @StateObject private var viewModel = CareHistoryViewModel()
    @State private var selectedTimeRange: TimeRange = .week

    enum TimeRange: String, CaseIterable {
        case week = "Week"
        case month = "Month"
        case year = "Year"
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.lg) {
                    // Time Range Selector
                    Picker("Time Range", selection: $selectedTimeRange) {
                        ForEach(TimeRange.allCases, id: \.self) { range in
                            Text(range.rawValue).tag(range)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding(.horizontal)

                    // Summary Stats
                    SummaryStatsSection(viewModel: viewModel)
                        .padding(.horizontal)

                    // Completion Chart
                    CompletionChartSection(viewModel: viewModel, timeRange: selectedTimeRange)
                        .padding(.horizontal)

                    // Task Type Breakdown
                    TaskTypeBreakdownSection(breakdown: viewModel.taskTypeBreakdown)
                        .padding(.horizontal)

                    // Streak Info
                    StreakSection(
                        currentStreak: viewModel.currentStreak,
                        longestStreak: viewModel.longestStreak
                    )
                    .padding(.horizontal)
                }
                .padding(.vertical)
            }
            .navigationTitle("Statistics")
            .onAppear {
                viewModel.loadHistory()
            }
            .onChange(of: selectedTimeRange) { _, newValue in
                updateDateRange(for: newValue)
            }
        }
    }

    private func updateDateRange(for timeRange: TimeRange) {
        switch timeRange {
        case .week:
            viewModel.dateRange = .week
        case .month:
            viewModel.dateRange = .month
        case .year:
            viewModel.dateRange = .year
        }
    }
}

// MARK: - Summary Stats Section

struct SummaryStatsSection: View {
    @ObservedObject var viewModel: CareHistoryViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("Overview")
                .font(.patchHeadline)
                .foregroundColor(.patchText)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: AppTheme.Spacing.md) {
                SummaryStatBox(
                    value: "\(viewModel.totalCompleted)",
                    label: "Total",
                    color: .patchPrimary
                )

                SummaryStatBox(
                    value: String(format: "%.0f%%", viewModel.completionRate),
                    label: "Completion",
                    color: .taskWatering
                )

                SummaryStatBox(
                    value: "\(viewModel.currentStreak)",
                    label: "Day Streak",
                    color: .taskPruning
                )
            }
        }
    }
}

struct SummaryStatBox: View {
    let value: String
    let label: String
    let color: Color

    var body: some View {
        VStack(spacing: AppTheme.Spacing.xs) {
            Text(value)
                .font(.patchTitle2)
                .fontWeight(.bold)
                .foregroundColor(color)

            Text(label)
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
        }
        .frame(maxWidth: .infinity)
        .padding(AppTheme.Spacing.md)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }
}

// MARK: - Completion Chart Section

struct CompletionChartSection: View {
    @ObservedObject var viewModel: CareHistoryViewModel
    let timeRange: CareStatisticsView.TimeRange

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("Completions Over Time")
                .font(.patchHeadline)
                .foregroundColor(.patchText)

            if #available(iOS 16.0, *) {
                CompletionChart(tasks: viewModel.completedTasks, timeRange: timeRange)
                    .frame(height: 200)
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
            } else {
                // Fallback for older iOS versions
                SimpleCompletionChart(tasks: viewModel.completedTasks)
                    .frame(height: 200)
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
            }
        }
    }
}

@available(iOS 16.0, *)
struct CompletionChart: View {
    let tasks: [CareTask]
    let timeRange: CareStatisticsView.TimeRange

    var body: some View {
        Chart {
            ForEach(chartData, id: \.date) { item in
                BarMark(
                    x: .value("Date", item.date, unit: dateUnit),
                    y: .value("Count", item.count)
                )
                .foregroundStyle(Color.patchPrimary.gradient)
                .cornerRadius(AppTheme.CornerRadius.sm)
            }
        }
        .chartXAxis {
            AxisMarks(values: .stride(by: strideComponent)) { _ in
                AxisGridLine()
                AxisTick()
                AxisValueLabel(format: dateFormat)
            }
        }
        .chartYAxis {
            AxisMarks { _ in
                AxisGridLine()
                AxisTick()
                AxisValueLabel()
            }
        }
    }

    private var chartData: [ChartDataPoint] {
        let calendar = Calendar.current
        var dataPoints: [Date: Int] = [:]

        for task in tasks {
            guard let completedDate = task.completedDate else { continue }
            let dateKey = calendar.startOfDay(for: completedDate)
            dataPoints[dateKey, default: 0] += 1
        }

        return dataPoints.map { ChartDataPoint(date: $0.key, count: $0.value) }
            .sorted { $0.date < $1.date }
    }

    private var dateUnit: Calendar.Component {
        switch timeRange {
        case .week: return .day
        case .month: return .day
        case .year: return .month
        }
    }

    private var strideComponent: Calendar.Component {
        switch timeRange {
        case .week: return .day
        case .month: return .weekOfMonth
        case .year: return .month
        }
    }

    private var dateFormat: Date.FormatStyle {
        switch timeRange {
        case .week: return .dateTime.weekday(.abbreviated)
        case .month: return .dateTime.day()
        case .year: return .dateTime.month(.abbreviated)
        }
    }
}

struct ChartDataPoint: Identifiable {
    let id = UUID()
    let date: Date
    let count: Int
}

// Simple fallback chart for older iOS
struct SimpleCompletionChart: View {
    let tasks: [CareTask]

    var body: some View {
        GeometryReader { geometry in
            HStack(alignment: .bottom, spacing: 4) {
                ForEach(weeklyData, id: \.date) { item in
                    VStack {
                        Spacer()

                        RoundedRectangle(cornerRadius: AppTheme.CornerRadius.sm)
                            .fill(Color.patchPrimary)
                            .frame(
                                width: (geometry.size.width - 32) / 7,
                                height: barHeight(for: item.count, maxHeight: geometry.size.height - 20)
                            )

                        Text(dayLabel(for: item.date))
                            .font(.patchCaption2)
                            .foregroundColor(.patchTextSecondary)
                    }
                }
            }
        }
    }

    private var weeklyData: [ChartDataPoint] {
        let calendar = Calendar.current
        var dataPoints: [Date: Int] = [:]

        // Last 7 days
        for dayOffset in 0..<7 {
            if let date = calendar.date(byAdding: .day, value: -dayOffset, to: Date()) {
                let dateKey = calendar.startOfDay(for: date)
                dataPoints[dateKey] = 0
            }
        }

        for task in tasks {
            guard let completedDate = task.completedDate else { continue }
            let dateKey = calendar.startOfDay(for: completedDate)
            if let _ = dataPoints[dateKey] {
                dataPoints[dateKey, default: 0] += 1
            }
        }

        return dataPoints.map { ChartDataPoint(date: $0.key, count: $0.value) }
            .sorted { $0.date < $1.date }
    }

    private var maxCount: Int {
        weeklyData.map { $0.count }.max() ?? 1
    }

    private func barHeight(for count: Int, maxHeight: CGFloat) -> CGFloat {
        guard maxCount > 0 else { return 0 }
        let minHeight: CGFloat = 4
        let scaledHeight = CGFloat(count) / CGFloat(maxCount) * maxHeight
        return max(minHeight, scaledHeight)
    }

    private func dayLabel(for date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE"
        return formatter.string(from: date)
    }
}

// MARK: - Task Type Breakdown Section

struct TaskTypeBreakdownSection: View {
    let breakdown: [CareTask.TaskType: Int]

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("By Task Type")
                .font(.patchHeadline)
                .foregroundColor(.patchText)

            VStack(spacing: AppTheme.Spacing.xs) {
                ForEach(sortedBreakdown, id: \.type) { item in
                    TaskTypeBreakdownRow(
                        type: item.type,
                        count: item.count,
                        percentage: percentage(for: item.count)
                    )
                }
            }
            .padding(AppTheme.Spacing.lg)
            .background(.ultraThinMaterial)
            .background(Color.white.opacity(0.6))
            .cornerRadius(AppTheme.CornerRadius.xl)
            .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
        }
    }

    private var sortedBreakdown: [(type: CareTask.TaskType, count: Int)] {
        breakdown.map { (type: $0.key, count: $0.value) }
            .sorted { $0.count > $1.count }
    }

    private var total: Int {
        breakdown.values.reduce(0, +)
    }

    private func percentage(for count: Int) -> Double {
        guard total > 0 else { return 0 }
        return Double(count) / Double(total) * 100
    }
}

struct TaskTypeBreakdownRow: View {
    let type: CareTask.TaskType
    let count: Int
    let percentage: Double

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            TaskTypeIcon(type: type.rawValue, size: 28)

            VStack(alignment: .leading, spacing: 2) {
                Text(type.rawValue)
                    .font(.patchSubheadline)
                    .foregroundColor(.patchText)

                GeometryReader { geometry in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(Color.patchBackgroundTertiary)
                            .frame(height: 4)

                        RoundedRectangle(cornerRadius: 2)
                            .fill(taskColor)
                            .frame(width: geometry.size.width * CGFloat(percentage / 100), height: 4)
                    }
                }
                .frame(height: 4)
            }

            Spacer()

            Text("\(count)")
                .font(.patchHeadline)
                .foregroundColor(.patchText)
                .monospacedDigit()
        }
        .padding(.vertical, AppTheme.Spacing.xxs)
    }

    private var taskColor: Color {
        switch type {
        case .watering: return .taskWatering
        case .fertilizing: return .taskFertilizing
        case .pruning: return .taskPruning
        case .pestControl: return .taskPestControl
        case .harvesting: return .taskHarvesting
        default: return .patchPrimary
        }
    }
}

// MARK: - Streak Section

struct StreakSection: View {
    let currentStreak: Int
    let longestStreak: Int

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("Streaks")
                .font(.patchHeadline)
                .foregroundColor(.patchText)

            HStack(spacing: AppTheme.Spacing.md) {
                StreakCard(
                    title: "Current",
                    days: currentStreak,
                    icon: "flame.fill",
                    color: currentStreak > 0 ? .taskPruning : .patchTextTertiary
                )

                StreakCard(
                    title: "Best",
                    days: longestStreak,
                    icon: "trophy.fill",
                    color: .taskHarvesting
                )
            }
        }
    }
}

struct StreakCard: View {
    let title: String
    let days: Int
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: icon)
                .font(.system(size: 32))
                .foregroundColor(color)

            VStack(spacing: 2) {
                Text("\(days)")
                    .font(.patchLargeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.patchText)

                Text(days == 1 ? "day" : "days")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)
            }

            Text(title)
                .font(.patchCaption1)
                .fontWeight(.medium)
                .foregroundColor(.patchTextTertiary)
        }
        .frame(maxWidth: .infinity)
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }
}

// MARK: - Preview

#Preview("Care Statistics") {
    CareStatisticsView()
}
