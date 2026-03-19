import SwiftUI

// MARK: - Loading View

/// Centered loading indicator with optional message
struct LoadingView: View {
    let message: String?
    let showBackground: Bool

    init(message: String? = nil, showBackground: Bool = false) {
        self.message = message
        self.showBackground = showBackground
    }

    var body: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            ProgressView()
                .progressViewStyle(CircularProgressViewStyle(tint: .patchPrimary))
                .scaleEffect(1.2)

            if let message = message {
                Text(message)
                    .font(.patchBody)
                    .foregroundColor(.patchTextSecondary)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(showBackground ? Color.patchBackground : Color.clear)
    }
}

// MARK: - Full Screen Loading View

/// Full screen loading overlay
struct FullScreenLoadingView: View {
    let message: String?

    var body: some View {
        ZStack {
            Color.black.opacity(0.3)
                .ignoresSafeArea()

            VStack(spacing: AppTheme.Spacing.md) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(1.5)

                if let message = message {
                    Text(message)
                        .font(.patchBody)
                        .foregroundColor(.white)
                        .multilineTextAlignment(.center)
                }
            }
            .padding(AppTheme.Spacing.xl)
            .background(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                    .fill(Color.black.opacity(0.8))
            )
        }
    }
}

// MARK: - Error View

/// Error display with retry option
struct ErrorView: View {
    let title: String
    let message: String
    let icon: String?
    let retryTitle: String?
    let onRetry: (() -> Void)?

    init(
        _ title: String,
        message: String,
        icon: String? = nil,
        retryTitle: String? = nil,
        onRetry: (() -> Void)? = nil
    ) {
        self.title = title
        self.message = message
        self.icon = icon
        self.retryTitle = retryTitle
        self.onRetry = onRetry
    }

    var body: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            // Icon
            Image(systemName: icon ?? "exclamationmark.triangle.fill")
                .font(.system(size: 48))
                .foregroundColor(.healthCritical)

            // Error Info
            VStack(spacing: AppTheme.Spacing.sm) {
                Text(title)
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)
                    .multilineTextAlignment(.center)

                Text(message)
                    .font(.patchBody)
                    .foregroundColor(.patchTextSecondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(4)
            }

            // Retry Button
            if let onRetry = onRetry, let retryTitle = retryTitle {
                PrimaryButton(retryTitle, action: onRetry)
            }
        }
        .padding(AppTheme.Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color.patchBackground)
    }
}

// MARK: - Empty State View

/// Empty state display with optional action
struct EmptyStateView: View {
    let title: String
    let message: String
    let icon: String?
    let actionTitle: String?
    let onAction: (() -> Void)?

    init(
        _ title: String,
        message: String,
        icon: String? = nil,
        actionTitle: String? = nil,
        onAction: (() -> Void)? = nil
    ) {
        self.title = title
        self.message = message
        self.icon = icon
        self.actionTitle = actionTitle
        self.onAction = onAction
    }

    var body: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            // Icon
            Group {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.system(size: 56, weight: .light))
                        .foregroundColor(.patchPrimary)
                        .padding(AppTheme.Spacing.lg)
                        .background(Color.patchPrimary.opacity(0.08))
                        .clipShape(Circle())
                } else {
                    Image(systemName: "tray")
                        .font(.system(size: 56, weight: .light))
                        .foregroundColor(.patchPrimary)
                        .padding(AppTheme.Spacing.lg)
                        .background(Color.patchPrimary.opacity(0.08))
                        .clipShape(Circle())
                }
            }

            // Empty State Info
            VStack(spacing: AppTheme.Spacing.sm) {
                Text(title)
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)
                    .multilineTextAlignment(.center)

                Text(message)
                    .font(.patchBody)
                    .foregroundColor(.patchTextSecondary)
                    .multilineTextAlignment(.center)
                    .lineLimit(4)
                    .padding(.horizontal, AppTheme.Spacing.xl)
            }

            // Action Button
            if let onAction = onAction, let actionTitle = actionTitle {
                PrimaryButton(actionTitle, action: onAction)
                    .padding(.top, AppTheme.Spacing.sm)
                    .padding(.horizontal, AppTheme.Spacing.xl)
            }
        }
        .padding(AppTheme.Spacing.xl)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .screenBackgroundStyle()
    }
}

// MARK: - Predefined Empty States

extension EmptyStateView {

    /// Empty state for no plants
    static func noPlants(onAdd: @escaping () -> Void) -> EmptyStateView {
        EmptyStateView(
            "No Plants Yet",
            message: "Start your garden by adding your first plant",
            icon: "leaf.slash",
            actionTitle: "Add Plant",
            onAction: onAdd
        )
    }

    /// Empty state for no tasks
    static func noTasks() -> EmptyStateView {
        EmptyStateView(
            "All Caught Up",
            message: "You have no pending care tasks",
            icon: "checkmark.circle",
            actionTitle: nil,
            onAction: nil
        )
    }

    /// Empty state for no gardens
    static func noGardens(onCreate: @escaping () -> Void) -> EmptyStateView {
        EmptyStateView(
            "No Gardens",
            message: "Create your first garden to start organizing your plants",
            icon: "square.grid.2x2",
            actionTitle: "Create Garden",
            onAction: onCreate
        )
    }

    /// Empty state for no notes
    static func noNotes(onAdd: @escaping () -> Void) -> EmptyStateView {
        EmptyStateView(
            "No Notes",
            message: "Take notes to track your gardening progress",
            icon: "note.text",
            actionTitle: "Add Note",
            onAction: onAdd
        )
    }

    /// Empty state for no photos
    static func noPhotos(onAdd: @escaping () -> Void) -> EmptyStateView {
        EmptyStateView(
            "No Photos",
            message: "Capture photos to document your plant's growth",
            icon: "camera",
            actionTitle: "Add Photo",
            onAction: onAdd
        )
    }

    /// Empty state for search results
    static func noResults() -> EmptyStateView {
        EmptyStateView(
            "No Results",
            message: "We couldn't find anything matching your search",
            icon: "magnifyingglass",
            actionTitle: nil,
            onAction: nil
        )
    }
}

// MARK: - Predefined Errors

extension ErrorView {

    /// Error for network issues
    static func networkError(onRetry: @escaping () -> Void) -> ErrorView {
        ErrorView(
            "Connection Error",
            message: "Please check your internet connection and try again",
            icon: "wifi.slash",
            retryTitle: "Retry",
            onRetry: onRetry
        )
    }

    /// Error for generic issues
    static func generic(error: Error?, onRetry: @escaping () -> Void) -> ErrorView {
        let message = error?.localizedDescription ?? "Something went wrong. Please try again."
        return ErrorView(
            "Oops!",
            message: message,
            icon: "exclamationmark.triangle.fill",
            retryTitle: "Try Again",
            onRetry: onRetry
        )
    }

    /// Error for not found
    static func notFound(onDismiss: @escaping () -> Void) -> ErrorView {
        ErrorView(
            "Not Found",
            message: "The item you're looking for doesn't exist",
            icon: "questionmark.circle",
            retryTitle: "Go Back",
            onRetry: onDismiss
        )
    }
}

// MARK: - Previews

#Preview("Loading Views") {
    VStack(spacing: 0) {
        LoadingView(message: "Loading your plants...", showBackground: false)
            .frame(height: 200)

        Divider()

        LoadingView(showBackground: true)
            .frame(height: 200)
    }
}

#Preview("Full Screen Loading") {
    FullScreenLoadingView(message: "Syncing with CloudKit...")
}

#Preview("Error Views") {
    VStack(spacing: 0) {
        ErrorView.networkError { }
            .frame(height: 400)

        Divider()

        ErrorView.generic(error: nil) { }
            .frame(height: 400)
    }
}

#Preview("Empty State Views") {
    ScrollView {
        VStack(spacing: 0) {
            EmptyStateView.noPlants { }
                .frame(height: 400)

            Divider()

            EmptyStateView.noTasks()
                .frame(height: 400)

            Divider()

            EmptyStateView.noResults()
                .frame(height: 400)
        }
    }
}
