import SwiftUI

// MARK: - Card View

/// Basic card container with rounded corners and shadow
struct CardView<Content: View>: View {
    let content: Content
    let padding: CGFloat

    init(
        padding: CGFloat = AppTheme.Spacing.md,
        @ViewBuilder content: () -> Content
    ) {
        self.padding = padding
        self.content = content()
    }

    var body: some View {
        content
            .padding(padding)
            .background(.ultraThinMaterial)
            .background(Color.white.opacity(0.5))
            .cornerRadius(AppTheme.CornerRadius.xl)
            .shadow(
                color: AppTheme.Shadow.sm.color,
                radius: AppTheme.Shadow.sm.radius,
                x: AppTheme.Shadow.sm.x,
                y: AppTheme.Shadow.sm.y
            )
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.xl)
                    .stroke(Color.white.opacity(0.8), lineWidth: 0.5)
            )
    }
}

// MARK: - Plant Card

/// Card for displaying plant in a list
struct PlantCard: View {
    let name: String
    let species: String?
    let healthStatus: String
    let imageData: Data?
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: AppTheme.Spacing.md) {
                // Plant Image
                PlantImageView(imageData: imageData, size: 60)

                // Plant Info
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                    Text(name)
                        .font(.patchHeadline)
                        .foregroundColor(.patchText)

                    if let species = species {
                        Text(species)
                            .font(.patchSubheadline)
                            .foregroundColor(.patchTextSecondary)
                    }
                }

                Spacer()

                // Health Indicator
                HealthBadge(status: healthStatus)

                Image(systemName: "chevron.right")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextTertiary)
            }
            .cardStyle(padding: AppTheme.Spacing.md)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Garden Card

/// Card for displaying garden in a list
struct GardenCard: View {
    let name: String
    let type: String
    let dimensions: String
    let plantCount: Int
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                // Header
                HStack {
                    Image(systemName: "square.grid.2x2.fill")
                        .font(.patchTitle3)
                        .foregroundColor(.patchPrimary)

                    Spacer()

                    Text(type)
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                        .padding(.horizontal, AppTheme.Spacing.sm)
                        .padding(.vertical, AppTheme.Spacing.xxs)
                        .background(Color.patchPrimary.opacity(0.08))
                        .cornerRadius(AppTheme.CornerRadius.sm)
                }

                // Name
                Text(name)
                    .font(.patchHeadline)
                    .foregroundColor(.patchText)

                // Details
                HStack(spacing: AppTheme.Spacing.md) {
                    Label(dimensions, systemImage: "ruler")
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)

                    Label("\(plantCount) plants", systemImage: "leaf")
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                }
            }
            .padding(AppTheme.Spacing.md)
            .background(.ultraThinMaterial)
            .background(Color.white.opacity(0.6))
            .cornerRadius(AppTheme.CornerRadius.xl)
            .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.xl)
                    .stroke(Color.white.opacity(0.8), lineWidth: 0.5)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Care Task Card

/// Card for displaying a care task
struct CareTaskCard: View {
    let taskType: String
    let plantName: String
    let dueDate: Date
    let isOverdue: Bool
    let onComplete: () -> Void
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: AppTheme.Spacing.md) {
                // Task Icon
                TaskTypeIcon(type: taskType, size: 44)

                // Task Info
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                    Text(taskType)
                        .font(.patchHeadline)
                        .foregroundColor(.patchText)

                    Text(plantName)
                        .font(.patchSubheadline)
                        .foregroundColor(.patchTextSecondary)

                    Text(formattedDate)
                        .font(.patchCaption1)
                        .foregroundColor(isOverdue ? .healthCritical : .patchTextTertiary)
                }

                Spacer()

                // Complete Button
                Button(action: onComplete) {
                    Image(systemName: "checkmark.circle")
                        .font(.system(size: 28))
                        .foregroundColor(.patchPrimary)
                }
                .buttonStyle(.plain)
            }
            .cardStyle(padding: AppTheme.Spacing.md)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.xl)
                    .stroke(isOverdue ? Color.healthCritical.opacity(0.5) : Color.clear, lineWidth: 2)
            )
        }
        .buttonStyle(.plain)
    }

    private var formattedDate: String {
        let formatter = RelativeDateTimeFormatter()
        formatter.unitsStyle = .abbreviated
        return formatter.localizedString(for: dueDate, relativeTo: Date())
    }
}

// MARK: - Wiki Entry Card

/// Card for displaying a wiki entry
struct WikiEntryCard: View {
    let name: String
    let scientificName: String?
    let category: String
    let difficulty: String
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                // Category Badge
                HStack {
                    CategoryBadge(category: category)
                    Spacer()
                    DifficultyBadge(difficulty: difficulty)
                }

                // Name
                Text(name)
                    .font(.patchHeadline)
                    .foregroundColor(.patchText)

                if let scientificName = scientificName {
                    Text(scientificName)
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                        .italic()
                }
            }
            .cardStyle(padding: AppTheme.Spacing.md)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Note Card

/// Card for displaying a note
struct NoteCard: View {
    let title: String
    let preview: String
    let date: Date
    let plantName: String?
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                // Header
                HStack {
                    Text(title)
                        .font(.patchHeadline)
                        .foregroundColor(.patchText)
                        .lineLimit(1)

                    Spacer()

                    Text(formattedDate)
                        .font(.patchCaption2)
                        .foregroundColor(.patchTextTertiary)
                }

                // Preview
                Text(preview)
                    .font(.patchSubheadline)
                    .foregroundColor(.patchTextSecondary)
                    .lineLimit(2)

                // Plant Link
                if let plantName = plantName {
                    HStack(spacing: AppTheme.Spacing.xs) {
                        Image(systemName: "leaf.fill")
                            .font(.patchCaption2)
                        Text(plantName)
                            .font(.patchCaption1)
                    }
                    .foregroundColor(.patchPrimary)
                }
            }
            .cardStyle(padding: AppTheme.Spacing.md)
        }
        .buttonStyle(.plain)
    }

    private var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Stat Card

/// Card for displaying a statistic
struct StatCard: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: icon)
                .font(.patchTitle2)
                .foregroundColor(color)

            Text(value)
                .font(.patchTitle1)
                .foregroundColor(.patchText)

            Text(title)
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
        }
        .frame(maxWidth: .infinity)
        .cardStyle(padding: AppTheme.Spacing.md)
    }
}

// MARK: - Previews

#Preview("Cards") {
    ScrollView {
        VStack(spacing: AppTheme.Spacing.lg) {
            Text("Plant Card")
                .font(.patchHeadline)
            PlantCard(
                name: "Tomato",
                species: "Solanum lycopersicum",
                healthStatus: "Good",
                imageData: nil
            ) { }

            Text("Garden Card")
                .font(.patchHeadline)
            GardenCard(
                name: "Backyard Garden",
                type: "Raised Bed",
                dimensions: "8' × 4'",
                plantCount: 12
            ) { }

            Text("Care Task Card")
                .font(.patchHeadline)
            CareTaskCard(
                taskType: "Watering",
                plantName: "Tomato",
                dueDate: Date(),
                isOverdue: false,
                onComplete: { },
                onTap: { }
            )

            Text("Wiki Entry Card")
                .font(.patchHeadline)
            WikiEntryCard(
                name: "Tomato",
                scientificName: "Solanum lycopersicum",
                category: "Vegetables",
                difficulty: "Easy"
            ) { }

            Text("Note Card")
                .font(.patchHeadline)
            NoteCard(
                title: "Garden Journal",
                preview: "Today I noticed the tomatoes are starting to flower...",
                date: Date(),
                plantName: "Tomato"
            ) { }

            Text("Stat Cards")
                .font(.patchHeadline)
            HStack {
                StatCard(title: "Plants", value: "24", icon: "leaf.fill", color: .patchPrimary)
                StatCard(title: "Tasks", value: "5", icon: "checkmark.circle.fill", color: .taskWatering)
            }
        }
        .padding()
    }
}
