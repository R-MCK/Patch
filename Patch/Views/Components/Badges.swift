import SwiftUI

// MARK: - Health Badge

/// Badge showing plant health status with color
struct HealthBadge: View {
    let status: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.xxs) {
            Circle()
                .fill(statusColor)
                .frame(width: 8, height: 8)

            Text(status)
                .font(.patchCaption1)
                .fontWeight(.medium)
        }
        .padding(.horizontal, AppTheme.Spacing.sm)
        .padding(.vertical, AppTheme.Spacing.xxs)
        .background(statusColor.opacity(0.15))
        .cornerRadius(AppTheme.CornerRadius.full)
    }

    private var statusColor: Color {
        switch status.lowercased() {
        case "excellent": return .healthExcellent
        case "good": return .healthGood
        case "fair": return .healthFair
        case "poor": return .healthPoor
        case "critical": return .healthCritical
        default: return .gray
        }
    }
}

// MARK: - Category Badge

/// Badge showing wiki category
struct CategoryBadge: View {
    let category: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.xxs) {
            Image(systemName: categoryIcon)
                .font(.patchCaption2)
            Text(category)
                .font(.patchCaption1)
                .fontWeight(.medium)
        }
        .padding(.horizontal, AppTheme.Spacing.sm)
        .padding(.vertical, AppTheme.Spacing.xxs)
        .background(categoryColor.opacity(0.15))
        .foregroundColor(categoryColor)
        .cornerRadius(AppTheme.CornerRadius.full)
    }

    private var categoryColor: Color {
        switch category.lowercased() {
        case "vegetables": return .categoryVegetables
        case "herbs": return .categoryHerbs
        case "flowers": return .categoryFlowers
        case "fruits": return .categoryFruits
        case "houseplants": return .categoryHouseplants
        case "succulents": return .categorySucculents
        default: return .gray
        }
    }

    private var categoryIcon: String {
        switch category.lowercased() {
        case "vegetables": return "carrot.fill"
        case "herbs": return "leaf.fill"
        case "flowers": return "camera.macro"
        case "fruits": return "apple.logo"
        case "houseplants": return "house.fill"
        case "succulents": return "drop.fill"
        default: return "leaf"
        }
    }
}

// MARK: - Difficulty Badge

/// Badge showing difficulty level
struct DifficultyBadge: View {
    let difficulty: String

    var body: some View {
        Text(difficulty)
            .font(.patchCaption2)
            .fontWeight(.medium)
            .padding(.horizontal, AppTheme.Spacing.sm)
            .padding(.vertical, AppTheme.Spacing.xxs)
            .background(difficultyColor.opacity(0.15))
            .foregroundColor(difficultyColor)
            .cornerRadius(AppTheme.CornerRadius.full)
    }

    private var difficultyColor: Color {
        switch difficulty.lowercased() {
        case "beginner", "easy": return .healthExcellent
        case "moderate": return .healthFair
        case "challenging", "expert": return .healthPoor
        default: return .gray
        }
    }
}

// MARK: - Growth Stage Badge

/// Badge showing plant growth stage
struct GrowthStageBadge: View {
    let stage: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.xxs) {
            Image(systemName: stageIcon)
                .font(.patchCaption2)
            Text(stage)
                .font(.patchCaption1)
                .fontWeight(.medium)
        }
        .padding(.horizontal, AppTheme.Spacing.sm)
        .padding(.vertical, AppTheme.Spacing.xxs)
        .background(Color.patchPrimary.opacity(0.15))
        .foregroundColor(.patchPrimary)
        .cornerRadius(AppTheme.CornerRadius.full)
    }

    private var stageIcon: String {
        switch stage.lowercased() {
        case "seedling": return "leaf"
        case "vegetative": return "leaf.fill"
        case "flowering": return "camera.macro"
        case "fruiting": return "apple.logo"
        case "dormant": return "moon.fill"
        case "harvesting": return "basket.fill"
        default: return "leaf"
        }
    }
}

// MARK: - Task Type Icon

/// Icon for care task type
struct TaskTypeIcon: View {
    let type: String
    let size: CGFloat

    var body: some View {
        Image(systemName: typeIcon)
            .font(.system(size: size * 0.45))
            .foregroundColor(.white)
            .frame(width: size, height: size)
            .background(typeColor)
            .clipShape(Circle())
    }

    private var typeIcon: String {
        switch type.lowercased() {
        case "watering": return "drop.fill"
        case "fertilizing": return "leaf.arrow.circlepath"
        case "pruning": return "scissors"
        case "pest control": return "ant.fill"
        case "harvesting": return "basket.fill"
        case "repotting": return "arrow.up.bin.fill"
        case "weeding": return "leaf.fill"
        case "mulching": return "rectangle.stack.fill"
        default: return "leaf.fill"
        }
    }

    private var typeColor: Color {
        switch type.lowercased() {
        case "watering": return .taskWatering
        case "fertilizing": return .taskFertilizing
        case "pruning": return .taskPruning
        case "pest control": return .taskPestControl
        case "harvesting": return .taskHarvesting
        default: return .patchPrimary
        }
    }
}

// MARK: - Sync Status Badge

/// Badge showing sync status
struct SyncStatusBadge: View {
    let status: SyncStatus

    enum SyncStatus {
        case synced
        case syncing
        case offline
        case error
    }

    var body: some View {
        HStack(spacing: AppTheme.Spacing.xxs) {
            if status == .syncing {
                ProgressView()
                    .scaleEffect(0.6)
            } else {
                Image(systemName: statusIcon)
                    .font(.patchCaption2)
            }
            Text(statusText)
                .font(.patchCaption2)
        }
        .padding(.horizontal, AppTheme.Spacing.sm)
        .padding(.vertical, AppTheme.Spacing.xxs)
        .background(statusColor.opacity(0.15))
        .foregroundColor(statusColor)
        .cornerRadius(AppTheme.CornerRadius.full)
    }

    private var statusIcon: String {
        switch status {
        case .synced: return "checkmark.icloud.fill"
        case .syncing: return "arrow.triangle.2.circlepath"
        case .offline: return "icloud.slash.fill"
        case .error: return "exclamationmark.icloud.fill"
        }
    }

    private var statusText: String {
        switch status {
        case .synced: return "Synced"
        case .syncing: return "Syncing"
        case .offline: return "Offline"
        case .error: return "Error"
        }
    }

    private var statusColor: Color {
        switch status {
        case .synced: return .healthExcellent
        case .syncing: return .taskWatering
        case .offline: return .gray
        case .error: return .healthCritical
        }
    }
}

// MARK: - Count Badge

/// Simple count badge (e.g., for notification counts)
struct CountBadge: View {
    let count: Int
    let color: Color

    init(_ count: Int, color: Color = .healthCritical) {
        self.count = count
        self.color = color
    }

    var body: some View {
        if count > 0 {
            Text(count > 99 ? "99+" : "\(count)")
                .font(.patchCaption2)
                .fontWeight(.bold)
                .foregroundColor(.white)
                .padding(.horizontal, AppTheme.Spacing.xs)
                .padding(.vertical, AppTheme.Spacing.xxs)
                .background(color)
                .clipShape(Capsule())
        }
    }
}

// MARK: - Previews

#Preview("Badges") {
    VStack(spacing: AppTheme.Spacing.lg) {
        Group {
            Text("Health Badges")
                .font(.patchHeadline)
            HStack {
                HealthBadge(status: "Excellent")
                HealthBadge(status: "Good")
                HealthBadge(status: "Fair")
                HealthBadge(status: "Poor")
                HealthBadge(status: "Critical")
            }
        }

        Group {
            Text("Category Badges")
                .font(.patchHeadline)
            HStack {
                CategoryBadge(category: "Vegetables")
                CategoryBadge(category: "Herbs")
                CategoryBadge(category: "Flowers")
            }
        }

        Group {
            Text("Difficulty Badges")
                .font(.patchHeadline)
            HStack {
                DifficultyBadge(difficulty: "Beginner")
                DifficultyBadge(difficulty: "Moderate")
                DifficultyBadge(difficulty: "Expert")
            }
        }

        Group {
            Text("Growth Stage Badges")
                .font(.patchHeadline)
            HStack {
                GrowthStageBadge(stage: "Seedling")
                GrowthStageBadge(stage: "Flowering")
                GrowthStageBadge(stage: "Harvesting")
            }
        }

        Group {
            Text("Task Type Icons")
                .font(.patchHeadline)
            HStack {
                TaskTypeIcon(type: "Watering", size: 40)
                TaskTypeIcon(type: "Fertilizing", size: 40)
                TaskTypeIcon(type: "Pruning", size: 40)
                TaskTypeIcon(type: "Harvesting", size: 40)
            }
        }

        Group {
            Text("Sync Status Badges")
                .font(.patchHeadline)
            HStack {
                SyncStatusBadge(status: .synced)
                SyncStatusBadge(status: .syncing)
                SyncStatusBadge(status: .offline)
                SyncStatusBadge(status: .error)
            }
        }

        Group {
            Text("Count Badges")
                .font(.patchHeadline)
            HStack {
                CountBadge(3)
                CountBadge(12)
                CountBadge(150)
            }
        }
    }
    .padding()
}
