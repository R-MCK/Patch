import SwiftUI

struct CareTaskRowView: View {
    let task: CareTask
    let onComplete: () -> Void
    let onSnooze: () -> Void
    let onTap: () -> Void

    @State private var showSnoozeOptions = false

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: AppTheme.Spacing.md) {
                // Task Type Icon
                TaskTypeIcon(type: task.taskType, size: 44)
                    .swaying()

                // Task Details
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                    Text(task.taskType)
                        .font(.patchHeadline)
                        .foregroundColor(.patchText)

                    if let plant = task.plant {
                        Text(plant.name)
                            .font(.patchSubheadline)
                            .foregroundColor(.patchTextSecondary)
                            .lineLimit(1)
                    }

                    HStack(spacing: AppTheme.Spacing.xs) {
                        // Due Date/Time
                        Image(systemName: "clock")
                            .font(.patchCaption2)
                        Text(formattedDueDate)
                            .font(.patchCaption1)

                        // Recurring Indicator
                        if task.isRecurring {
                            Image(systemName: "repeat")
                                .font(.patchCaption2)
                            if let frequency = task.frequency {
                                Text(frequency)
                                    .font(.patchCaption2)
                            }
                        }
                    }
                    .foregroundColor(dueDateColor)
                }

                Spacer()

                // Action Buttons
                HStack(spacing: AppTheme.Spacing.sm) {
                    // Snooze Button
                    Button {
                        showSnoozeOptions = true
                    } label: {
                        Image(systemName: "clock.badge.questionmark")
                            .font(.title3)
                            .foregroundColor(.patchTextSecondary)
                    }
                    .buttonStyle(.plain)

                    // Complete Button
                    Button(action: onComplete) {
                        Image(systemName: "checkmark.circle.fill")
                            .font(.title2)
                            .foregroundColor(.patchPrimary)
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(AppTheme.Spacing.md)
            .background(.ultraThinMaterial)
            .background(backgroundColor)
            .cornerRadius(AppTheme.CornerRadius.xl)
            .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.xl)
                    .stroke(borderColor, lineWidth: task.isOverdue ? 1 : 0.5)
            )
        }
        .buttonStyle(.plain)
        .confirmationDialog("Snooze Task", isPresented: $showSnoozeOptions, titleVisibility: .visible) {
            Button("1 Hour") { onSnooze() }
            Button("3 Hours") { onSnooze() }
            Button("Tomorrow") { onSnooze() }
            Button("Cancel", role: .cancel) { }
        }
    }

    // MARK: - Computed Properties

    private var formattedDueDate: String {
        let calendar = Calendar.current

        if task.isOverdue {
            let days = calendar.dateComponents([.day], from: task.scheduledDate, to: Date()).day ?? 0
            if days == 0 {
                return "Overdue"
            } else if days == 1 {
                return "1 day overdue"
            } else {
                return "\(days) days overdue"
            }
        } else if calendar.isDateInToday(task.scheduledDate) {
            let formatter = DateFormatter()
            formatter.dateFormat = "h:mm a"
            return "Today \(formatter.string(from: task.scheduledDate))"
        } else if calendar.isDateInTomorrow(task.scheduledDate) {
            let formatter = DateFormatter()
            formatter.dateFormat = "h:mm a"
            return "Tomorrow \(formatter.string(from: task.scheduledDate))"
        } else {
            let formatter = DateFormatter()
            formatter.dateStyle = .medium
            formatter.timeStyle = .short
            return formatter.string(from: task.scheduledDate)
        }
    }

    private var dueDateColor: Color {
        if task.isOverdue {
            return .healthCritical
        } else if task.isDueToday {
            return .taskWatering
        } else {
            return .patchTextTertiary
        }
    }

    private var backgroundColor: Color {
        if task.isOverdue {
            return Color.healthCritical.opacity(0.12)
        } else {
            return Color.white.opacity(0.6)
        }
    }

    private var borderColor: Color {
        task.isOverdue ? Color.healthCritical.opacity(0.5) : Color.white.opacity(0.8)
    }
}

// MARK: - Compact Row View

struct CareTaskCompactRowView: View {
    let task: CareTask
    let onComplete: () -> Void

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            TaskTypeIcon(type: task.taskType, size: 32)
                .swaying(degree: 1.5, speed: 4.0)

            VStack(alignment: .leading, spacing: 2) {
                Text(task.taskType)
                    .font(.patchSubheadline)
                    .fontWeight(.medium)
                    .foregroundColor(.patchText)

                if let plant = task.plant {
                    Text(plant.name)
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                        .lineLimit(1)
                }
            }

            Spacer()

            Button(action: onComplete) {
                Image(systemName: "checkmark.circle")
                    .font(.title3)
                    .foregroundColor(.patchPrimary)
            }
            .buttonStyle(.plain)
        }
        .padding(.vertical, AppTheme.Spacing.xs)
    }
}

// MARK: - Preview

#Preview("Care Task Row") {
    let context = PersistenceController.shared.container.viewContext

    let plant = Plant(context: context)
    plant.id = UUID()
    plant.name = "Tomato"
    plant.species = "Solanum lycopersicum"
    plant.createdAt = Date()

    let task = CareTask(context: context)
    task.id = UUID()
    task.taskType = "Watering"
    task.scheduledDate = Date()
    task.isRecurring = true
    task.frequency = "Weekly"
    task.plant = plant
    task.createdAt = Date()

    let overdueTask = CareTask(context: context)
    overdueTask.id = UUID()
    overdueTask.taskType = "Fertilizing"
    overdueTask.scheduledDate = Calendar.current.date(byAdding: .day, value: -2, to: Date()) ?? Date()
    overdueTask.isRecurring = false
    overdueTask.plant = plant
    overdueTask.createdAt = Date()

    return VStack(spacing: AppTheme.Spacing.md) {
        CareTaskRowView(
            task: task,
            onComplete: {},
            onSnooze: {},
            onTap: {}
        )

        CareTaskRowView(
            task: overdueTask,
            onComplete: {},
            onSnooze: {},
            onTap: {}
        )

        Divider()

        CareTaskCompactRowView(task: task, onComplete: {})
    }
    .padding()
}
