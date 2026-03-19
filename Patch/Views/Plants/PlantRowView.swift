import SwiftUI

struct PlantRowView: View {
    let plant: Plant
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: AppTheme.Spacing.md) {
                PlantThumbnailView(plant: plant, size: 56)

                VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                    Text(plant.name)
                        .font(.patchHeadline)
                        .foregroundColor(.patchText)

                    if let species = plant.species, !species.isEmpty {
                        Text(species)
                            .font(.patchSubheadline)
                            .foregroundColor(.patchTextSecondary)
                            .lineLimit(1)
                    }
                }

                Spacer()

                VStack(alignment: .trailing, spacing: AppTheme.Spacing.xs) {
                    HealthBadge(status: plant.healthStatus)

                    if let garden = plant.garden {
                        Text(garden.name)
                            .font(.patchCaption2)
                            .foregroundColor(.patchTextTertiary)
                    }
                }

                Image(systemName: "chevron.right")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextTertiary)
            }
            .padding(AppTheme.Spacing.md)
            .background(.ultraThinMaterial)
            .background(Color.white.opacity(0.6))
            .cornerRadius(AppTheme.CornerRadius.xl)
            .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
        }
        .buttonStyle(.plain)
    }
}

struct PlantThumbnailView: View {
    let plant: Plant
    let size: CGFloat

    var body: some View {
        Group {
            if let photos = plant.photos as? Set<Photo>,
               let firstPhoto = photos.sorted(by: { $0.capturedAt < $1.capturedAt }).first,
               let imageData = firstPhoto.thumbnailData ?? firstPhoto.imageData,
               let uiImage = UIImage(data: imageData) {
                Image(uiImage: uiImage)
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } else {
                Image(systemName: "leaf.fill")
                    .font(.system(size: size * 0.45, weight: .light))
                    .foregroundColor(.patchPrimary)
            }
        }
        .frame(width: size, height: size)
        .background(Color.patchPrimary.opacity(0.08))
        .clipShape(RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md))
    }
}

#Preview("Plant Row") {
    let context = PersistenceController.shared.container.viewContext
    let plant = Plant(context: context)
    plant.id = UUID()
    plant.name = "Tomato"
    plant.species = "Solanum lycopersicum"
    plant.healthStatus = "Good"
    plant.growthStage = "Flowering"
    plant.createdAt = Date()

    return Button(action: {}) {
        PlantRowView(plant: plant, onTap: {})
    }
    .padding()
}
