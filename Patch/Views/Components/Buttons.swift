import SwiftUI

// MARK: - Primary Button

/// Main action button with filled green background
struct PrimaryButton: View {
    let title: String
    let icon: String?
    let isLoading: Bool
    let isDisabled: Bool
    let action: () -> Void

    init(
        _ title: String,
        icon: String? = nil,
        isLoading: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.isLoading = isLoading
        self.isDisabled = isDisabled
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: AppTheme.Spacing.sm) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(0.8)
                } else {
                    if let icon = icon {
                        Image(systemName: icon)
                            .font(.patchButton)
                    }
                    Text(title)
                        .font(.patchButton)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppTheme.Spacing.md)
            .padding(.horizontal, AppTheme.Spacing.lg)
            .background(isDisabled ? Color.patchTextTertiary.opacity(0.4) : Color.patchPrimary)
            .foregroundColor(.white)
            .cornerRadius(AppTheme.CornerRadius.lg)
        }
        .shadow(isDisabled ? AppTheme.Shadow.sm : AppTheme.Shadow.md)
        .disabled(isDisabled || isLoading)
        .animation(AppTheme.Animation.fast, value: isLoading)
    }
}

// MARK: - Secondary Button

/// Outlined button for secondary actions
struct SecondaryButton: View {
    let title: String
    let icon: String?
    let isLoading: Bool
    let isDisabled: Bool
    let action: () -> Void

    init(
        _ title: String,
        icon: String? = nil,
        isLoading: Bool = false,
        isDisabled: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.isLoading = isLoading
        self.isDisabled = isDisabled
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: AppTheme.Spacing.sm) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .patchPrimary))
                        .scaleEffect(0.8)
                } else {
                    if let icon = icon {
                        Image(systemName: icon)
                            .font(.patchButton)
                    }
                    Text(title)
                        .font(.patchButton)
                }
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, AppTheme.Spacing.md)
            .padding(.horizontal, AppTheme.Spacing.lg)
            .background(Color.clear)
            .foregroundColor(isDisabled ? .gray : .patchPrimary)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                    .stroke(isDisabled ? Color.patchTextTertiary.opacity(0.35) : Color.patchPrimary.opacity(0.65), lineWidth: 1.5)
            )
        }
        .disabled(isDisabled || isLoading)
        .animation(AppTheme.Animation.fast, value: isLoading)
    }
}

// MARK: - Text Button

/// Simple text button for tertiary actions
struct TextButton: View {
    let title: String
    let icon: String?
    let color: Color
    let action: () -> Void

    init(
        _ title: String,
        icon: String? = nil,
        color: Color = .patchPrimary,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.color = color
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: AppTheme.Spacing.xs) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.patchButtonSmall)
                }
                Text(title)
                    .font(.patchButtonSmall)
            }
            .foregroundColor(color)
        }
    }
}

// MARK: - Icon Button

/// Circular icon button
struct IconButton: View {
    let icon: String
    let size: Size
    let style: Style
    let action: () -> Void

    enum Size {
        case small, medium, large

        var dimension: CGFloat {
            switch self {
            case .small: return 32
            case .medium: return 44
            case .large: return 56
            }
        }

        var iconSize: CGFloat {
            switch self {
            case .small: return 14
            case .medium: return 18
            case .large: return 24
            }
        }
    }

    enum Style {
        case filled, outlined, ghost
    }

    init(
        icon: String,
        size: Size = .medium,
        style: Style = .ghost,
        action: @escaping () -> Void
    ) {
        self.icon = icon
        self.size = size
        self.style = style
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: size.iconSize, weight: .medium))
                .frame(width: size.dimension, height: size.dimension)
                .background(backgroundColor)
                .foregroundColor(foregroundColor)
                .clipShape(Circle())
                .overlay(
                    Circle()
                        .stroke(style == .outlined ? Color.patchPrimary : Color.clear, lineWidth: 2)
                )
        }
    }

    private var backgroundColor: Color {
        switch style {
        case .filled: return .patchPrimary
        case .outlined: return .clear
        case .ghost: return .white.opacity(0.9)
        }
    }

    private var foregroundColor: Color {
        switch style {
        case .filled: return .white
        case .outlined, .ghost: return .patchPrimary
        }
    }
}

// MARK: - Floating Action Button

/// Floating action button for primary creation actions
struct FloatingActionButton: View {
    let icon: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: icon)
                .font(.system(size: 24, weight: .semibold))
                .frame(width: 56, height: 56)
                .background(Color.patchPrimary)
                .foregroundColor(.white)
                .clipShape(Circle())
                .shadow(AppTheme.Shadow.lg)
        }
    }
}

// MARK: - Chip Button

/// Small chip/tag button for filters
struct ChipButton: View {
    let title: String
    let icon: String?
    let isSelected: Bool
    let action: () -> Void

    init(
        _ title: String,
        icon: String? = nil,
        isSelected: Bool = false,
        action: @escaping () -> Void
    ) {
        self.title = title
        self.icon = icon
        self.isSelected = isSelected
        self.action = action
    }

    var body: some View {
        Button(action: action) {
            HStack(spacing: AppTheme.Spacing.xs) {
                if let icon = icon {
                    Image(systemName: icon)
                        .font(.patchCaption1)
                }
                Text(title)
                    .font(.patchCaption1)
                    .fontWeight(.medium)
            }
            .padding(.horizontal, AppTheme.Spacing.sm)
            .padding(.vertical, AppTheme.Spacing.xs)
            .background(isSelected ? Color.patchPrimary : Color.patchBackgroundSecondary)
            .foregroundColor(isSelected ? .white : .patchText)
            .cornerRadius(AppTheme.CornerRadius.full)
        }
        .animation(AppTheme.Animation.fast, value: isSelected)
    }
}

// MARK: - Previews

#Preview("Buttons") {
    ScrollView {
        VStack(spacing: AppTheme.Spacing.lg) {
            Group {
                Text("Primary Buttons")
                    .font(.patchHeadline)

                PrimaryButton("Add Plant", icon: "plus") { }
                PrimaryButton("Loading...", isLoading: true) { }
                PrimaryButton("Disabled", isDisabled: true) { }
            }

            Divider()

            Group {
                Text("Secondary Buttons")
                    .font(.patchHeadline)

                SecondaryButton("Cancel", icon: "xmark") { }
                SecondaryButton("Loading...", isLoading: true) { }
            }

            Divider()

            Group {
                Text("Text Buttons")
                    .font(.patchHeadline)

                HStack {
                    TextButton("Edit", icon: "pencil") { }
                    TextButton("Delete", icon: "trash", color: .red) { }
                }
            }

            Divider()

            Group {
                Text("Icon Buttons")
                    .font(.patchHeadline)

                HStack(spacing: AppTheme.Spacing.md) {
                    IconButton(icon: "plus", size: .small, style: .filled) { }
                    IconButton(icon: "heart", size: .medium, style: .outlined) { }
                    IconButton(icon: "ellipsis", size: .large, style: .ghost) { }
                }
            }

            Divider()

            Group {
                Text("Chip Buttons")
                    .font(.patchHeadline)

                HStack {
                    ChipButton("All") { }
                    ChipButton("Vegetables", icon: "carrot", isSelected: true) { }
                    ChipButton("Herbs") { }
                }
            }

            Divider()

            Group {
                Text("FAB")
                    .font(.patchHeadline)

                FloatingActionButton(icon: "plus") { }
            }
        }
        .padding()
    }
}
