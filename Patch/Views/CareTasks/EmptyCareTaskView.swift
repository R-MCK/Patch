import SwiftUI

struct EmptyCareTaskView: View {
    let onAddTask: () -> Void

    var body: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            // Illustration
            Image(systemName: "checkmark.circle")
                .font(.system(size: 56, weight: .light))
                .foregroundColor(.patchPrimary)
                .padding(AppTheme.Spacing.lg)
                .background(Color.patchPrimary.opacity(0.08))
                .clipShape(Circle())

            // Text Content
            VStack(spacing: AppTheme.Spacing.sm) {
                Text("All Caught Up!")
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)
                    .multilineTextAlignment(.center)

                Text("You have no pending care tasks. Your plants are well taken care of!")
                    .font(.patchBody)
                    .foregroundColor(.patchTextSecondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(3)
            }

            // Action Button
            PrimaryButton("Add Care Task", icon: "plus", action: onAddTask)
                .padding(.top, AppTheme.Spacing.sm)
        }
        .padding(AppTheme.Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Filtered Empty State

struct EmptyFilteredCareTaskView: View {
    let onClearFilters: () -> Void

    var body: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 56, weight: .light))
                .foregroundColor(.patchPrimary)
                .padding(AppTheme.Spacing.lg)
                .background(Color.patchPrimary.opacity(0.08))
                .clipShape(Circle())

            VStack(spacing: AppTheme.Spacing.sm) {
                Text("No Results")
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)
                    .multilineTextAlignment(.center)

                Text("No care tasks match your current filters")
                    .font(.patchBody)
                    .foregroundColor(.patchTextSecondary)
                    .multilineTextAlignment(.center)
            }

            SecondaryButton("Clear Filters", icon: "xmark.circle", action: onClearFilters)
                .padding(.top, AppTheme.Spacing.sm)
        }
        .padding(AppTheme.Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

// MARK: - Preview

#Preview("Empty Care Task Views") {
    VStack {
        EmptyCareTaskView(onAddTask: {})
            .frame(height: 400)

        Divider()

        EmptyFilteredCareTaskView(onClearFilters: {})
            .frame(height: 400)
    }
}
