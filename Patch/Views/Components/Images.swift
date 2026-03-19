import SwiftUI

// MARK: - Plant Image View

/// Displays plant image with fallback
struct PlantImageView: View {
    let imageData: Data?
    let size: CGFloat

    init(imageData: Data?, size: CGFloat) {
        self.imageData = imageData
        self.size = size
    }

    var body: some View {
        Group {
            if let imageData = imageData, let uiImage = UIImage(data: imageData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                Image(systemName: "leaf.fill")
                    .font(.system(size: size * 0.5))
                    .foregroundColor(.patchPrimary.opacity(0.3))
            }
        }
        .frame(width: size, height: size)
        .background(Color.patchBackgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md))
    }
}

// MARK: - Async Image View

/// Loads and displays image from URL
struct AsyncImageView: View {
    let url: URL?
    let placeholder: String
    let size: CGFloat

    init(url: URL?, placeholder: String = "photo", size: CGFloat = 60) {
        self.url = url
        self.placeholder = placeholder
        self.size = size
    }

    var body: some View {
        AsyncImage(url: url) { phase in
            switch phase {
            case .success(let image):
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            case .failure:
                Image(systemName: placeholder)
                    .font(.system(size: size * 0.5))
                    .foregroundColor(.patchTextTertiary)
            case .empty:
                Image(systemName: placeholder)
                    .font(.system(size: size * 0.5))
                    .foregroundColor(.patchTextTertiary.opacity(0.3))
            @unknown default:
                Image(systemName: placeholder)
                    .font(.system(size: size * 0.5))
                    .foregroundColor(.patchTextTertiary.opacity(0.3))
            }
        }
        .frame(width: size, height: size)
        .background(Color.patchBackgroundSecondary)
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md))
    }
}

// MARK: - Circle Image View

/// Circular image view for avatars and thumbnails
struct CircleImageView: View {
    let imageData: Data?
    let size: CGFloat
    let defaultIcon: String

    init(imageData: Data?, size: CGFloat = 60, defaultIcon: String = "person.crop.circle") {
        self.imageData = imageData
        self.size = size
        self.defaultIcon = defaultIcon
    }

    var body: some View {
        Group {
            if let imageData = imageData, let uiImage = UIImage(data: imageData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                Image(systemName: defaultIcon)
                    .font(.system(size: size * 0.5))
                    .foregroundColor(.patchTextSecondary)
            }
        }
        .frame(width: size, height: size)
        .clipShape(Circle())
        .overlay(
            Circle()
                .stroke(Color.patchBackgroundSecondary, lineWidth: 2)
        )
    }
}

// MARK: - Photo Grid Item

/// Grid item for displaying photos
struct PhotoGridItem: View {
    let imageData: Data?
    let caption: String?
    let isSelected: Bool
    let onTap: () -> Void

    init(imageData: Data?, caption: String? = nil, isSelected: Bool = false, onTap: @escaping () -> Void) {
        self.imageData = imageData
        self.caption = caption
        self.isSelected = isSelected
        self.onTap = onTap
    }

    var body: some View {
        Button(action: onTap) {
            ZStack(alignment: .bottomLeading) {
                PlantImageView(imageData: imageData, size: 100)

                if isSelected {
                    VStack {
                        HStack {
                            Spacer()
                            Image(systemName: "checkmark.circle.fill")
                                .font(.title2)
                                .foregroundColor(.white)
                                .padding(AppTheme.Spacing.xs)
                        }
                        Spacer()
                    }
                }

                if let caption = caption, !caption.isEmpty {
                    VStack {
                        Spacer()
                        Text(caption)
                            .font(.patchCaption2)
                            .foregroundColor(.white)
                            .padding(AppTheme.Spacing.xs)
                            .frame(maxWidth: .infinity)
                            .background(
                                LinearGradient(
                                    gradient: Gradient(colors: [.clear, .black.opacity(0.7)]),
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                    }
                }
            }
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                    .stroke(isSelected ? Color.patchPrimary : Color.clear, lineWidth: 3)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Preview

#Preview("Image Views") {
    ScrollView {
        VStack(spacing: AppTheme.Spacing.lg) {
            Text("Plant Image View")
                .font(.patchHeadline)
            HStack {
                PlantImageView(imageData: nil, size: 60)
                PlantImageView(imageData: nil, size: 80)
                PlantImageView(imageData: nil, size: 100)
            }

            Divider()

            Text("Circle Image View")
                .font(.patchHeadline)
            HStack {
                CircleImageView(imageData: nil, size: 60)
                CircleImageView(imageData: nil, size: 80)
                CircleImageView(imageData: nil, size: 100)
            }

            Divider()

            Text("Photo Grid Item")
                .font(.patchHeadline)
            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: AppTheme.Spacing.sm) {
                ForEach(0..<6) { _ in
                    PhotoGridItem(imageData: nil, caption: "Photo \(UUID().uuidString.prefix(4))", isSelected: false) { }
                }
            }
        }
        .padding()
    }
}
