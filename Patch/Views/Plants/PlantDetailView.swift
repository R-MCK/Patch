import SwiftUI
import UIKit

struct PlantDetailView: View {
    @StateObject private var viewModel: PlantDetailViewModel
    @Environment(\.dismiss) private var dismiss

    let onUpdate: () -> Void

    @State private var showEditSheet = false
    @State private var showDeleteAlert = false
    @State private var showAddCareTask = false
    @State private var didCopyInviteCode = false

    init(plant: Plant, onUpdate: @escaping () -> Void) {
        _viewModel = StateObject(wrappedValue: PlantDetailViewModel(plant: plant))
        self.onUpdate = onUpdate
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.lg) {
                    PlantHeaderSection(plant: viewModel.plant)

                    PlantStatsStrip(
                        photoCount: viewModel.photos.count,
                        careTaskCount: viewModel.pendingCareTasks.count,
                        noteCount: viewModel.notes.count
                    )

                    PlantViralShareSection(
                        plantName: viewModel.plant.name,
                        careStreakDays: viewModel.careStreakDays,
                        inviteCode: viewModel.inviteCode,
                        shareMessage: viewModel.viralShareMessage,
                        didCopyInviteCode: didCopyInviteCode,
                        onCopyInviteCode: {
                            UIPasteboard.general.string = viewModel.inviteCode
                            withAnimation(.easeInOut(duration: 0.2)) {
                                didCopyInviteCode = true
                            }
                            DispatchQueue.main.asyncAfter(deadline: .now() + 1.6) {
                                withAnimation(.easeInOut(duration: 0.2)) {
                                    didCopyInviteCode = false
                                }
                            }
                        }
                    )

                    PlantInfoSection(plant: viewModel.plant)

                    PlantActionsSection(
                        onEdit: { showEditSheet = true },
                        onAddCareTask: { showAddCareTask = true },
                        onDelete: { showDeleteAlert = true }
                    )

                    if !viewModel.photos.isEmpty {
                        PlantPhotosSection(photos: viewModel.photos)
                    }

                    if !viewModel.pendingCareTasks.isEmpty {
                        PlantCareTasksSection(tasks: viewModel.pendingCareTasks)
                    }

                    if !viewModel.notes.isEmpty {
                        PlantNotesSection(notes: viewModel.notes)
                    }
                }
                .padding(AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xxl)
            }
            .screenBackgroundStyle()
            .navigationTitle(viewModel.plant.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(.patchBodyBold)
                        .foregroundColor(.patchPrimary)
                }
            }
            .sheet(isPresented: $showEditSheet) {
                EditPlantView(plant: viewModel.plant) {
                    viewModel.refresh()
                    onUpdate()
                }
            }
            .sheet(isPresented: $showAddCareTask) {
                AddPlantCareTaskView(plant: viewModel.plant) { _ in
                    viewModel.loadRelatedData()
                }
            }
            .alert("Delete Plant", isPresented: $showDeleteAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    viewModel.delete()
                    onUpdate()
                    dismiss()
                }
            } message: {
                Text("Are you sure you want to delete \(viewModel.plant.name)? This action cannot be undone.")
            }
            .onAppear {
                viewModel.loadRelatedData()
            }
        }
    }
}

struct PlantHeaderSection: View {
    let plant: Plant

    var body: some View {
        VStack(spacing: AppTheme.Spacing.md) {
            PlantThumbnailView(plant: plant, size: 112)
                .plantGrowth()

            VStack(spacing: AppTheme.Spacing.xs) {
                Text(plant.name)
                    .font(.patchLargeTitle)
                    .foregroundColor(.patchText)

                if let species = plant.species, !species.isEmpty {
                    Text(species)
                        .font(.patchSubheadline)
                        .foregroundColor(.patchTextSecondary)
                        .italic()
                }

                if let gardenName = plant.garden?.name {
                    Text(gardenName)
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                }
            }

            HStack(spacing: AppTheme.Spacing.md) {
                HealthBadge(status: plant.healthStatus)
                GrowthStageBadge(stage: plant.growthStage)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(AppTheme.Spacing.xl)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }
}

struct PlantStatsStrip: View {
    let photoCount: Int
    let careTaskCount: Int
    let noteCount: Int

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            StatPill(title: "Photos", value: "\(photoCount)", icon: "photo")
            StatPill(title: "Tasks", value: "\(careTaskCount)", icon: "checklist")
            StatPill(title: "Notes", value: "\(noteCount)", icon: "note.text")
        }
    }
}

struct StatPill: View {
    let title: String
    let value: String
    let icon: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.xs) {
            Image(systemName: icon)
                .font(.patchCaption1)
                .foregroundColor(.patchPrimary)
            Text(value)
                .font(.patchBodyBold)
                .foregroundColor(.patchText)
            Text(title)
                .font(.patchCaption2)
                .foregroundColor(.patchTextSecondary)
                .textCase(.uppercase)
                .kerning(0.5)
        }
        .padding(.horizontal, AppTheme.Spacing.sm)
        .padding(.vertical, AppTheme.Spacing.sm)
        .frame(maxWidth: .infinity)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.full)
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.full)
                .stroke(Color.white.opacity(0.8), lineWidth: 0.5)
        )
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

struct PlantInfoSection: View {
    let plant: Plant

    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        return formatter
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            Text("Details")
                .font(.patchTitle3)
                .foregroundColor(.patchText)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: AppTheme.Spacing.md) {
                if let plantingDate = plant.plantingDate {
                    InfoItem(icon: "calendar", label: "Planted", value: dateFormatter.string(from: plantingDate))
                }

                if let location = plant.location, !location.isEmpty {
                    InfoItem(icon: "mappin.circle", label: "Location", value: location)
                }

                if let variety = plant.variety, !variety.isEmpty {
                    InfoItem(icon: "leaf", label: "Variety", value: variety)
                }

                if let garden = plant.garden {
                    InfoItem(icon: "square.grid.2x2", label: "Garden", value: garden.name)
                }
            }

            if let notes = plant.notes, !notes.isEmpty {
                Divider()

                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                    Text("Notes")
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)

                    Text(notes)
                        .font(.patchBody)
                        .foregroundColor(.patchText)
                }
            }
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

struct PlantViralShareSection: View {
    let plantName: String
    let careStreakDays: Int
    let inviteCode: String
    let shareMessage: String
    let didCopyInviteCode: Bool
    let onCopyInviteCode: () -> Void

    private var streakText: String {
        guard careStreakDays > 0 else { return "Start your first care streak" }
        return "\(careStreakDays)-day care streak live"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                Text("Grow Together")
                    .font(.patchTitle3)
                    .foregroundColor(.patchText)
                Text("Share \(plantName)'s progress and challenge friends to join.")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)
            }

            HStack(spacing: AppTheme.Spacing.sm) {
                Image(systemName: "flame.fill")
                    .foregroundColor(.orange)
                Text(streakText)
                    .font(.patchSubheadline)
                    .foregroundColor(.patchText)
                Spacer()
            }
            .padding(AppTheme.Spacing.sm)
            .background(Color.patchBackgroundSecondary.opacity(0.55))
            .cornerRadius(AppTheme.CornerRadius.md)

            HStack(spacing: AppTheme.Spacing.sm) {
                ShareLink(item: shareMessage) {
                    Label("Share Challenge", systemImage: "square.and.arrow.up")
                        .font(.patchBodyBold)
                        .foregroundColor(.patchPrimary)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, AppTheme.Spacing.sm)
                        .background(Color.patchPrimary.opacity(0.08))
                        .cornerRadius(AppTheme.CornerRadius.md)
                }
                .buttonStyle(.plain)

                Button(action: onCopyInviteCode) {
                    Label(didCopyInviteCode ? "Copied" : inviteCode, systemImage: didCopyInviteCode ? "checkmark" : "number")
                        .font(.patchCaption1)
                        .foregroundColor(didCopyInviteCode ? .healthExcellent : .patchText)
                        .padding(.horizontal, AppTheme.Spacing.sm)
                        .padding(.vertical, AppTheme.Spacing.sm)
                        .background(Color.patchBackgroundSecondary.opacity(0.75))
                        .cornerRadius(AppTheme.CornerRadius.md)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

struct InfoItem: View {
    let icon: String
    let label: String
    let value: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: icon)
                .font(.patchTitle3)
                .foregroundColor(.patchPrimary)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 0) {
                Text(label)
                    .font(.patchCaption2)
                    .foregroundColor(.patchTextSecondary)
                Text(value)
                    .font(.patchSubheadline)
                    .foregroundColor(.patchText)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppTheme.Spacing.sm)
        .background(Color.patchBackgroundSecondary.opacity(0.55))
        .cornerRadius(AppTheme.CornerRadius.md)
    }
}

struct PlantActionsSection: View {
    let onEdit: () -> Void
    let onAddCareTask: () -> Void
    let onDelete: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                Text("Actions")
                    .font(.patchTitle3)
                    .foregroundColor(.patchText)
                Text("Edit profile details, schedule care, or remove this plant.")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)
            }

            HStack(spacing: AppTheme.Spacing.sm) {
                SecondaryButton("Edit", icon: "pencil") {
                    onEdit()
                }

                SecondaryButton("Add Task", icon: "plus.circle") {
                    onAddCareTask()
                }
            }

            TextButton("Delete Plant", icon: "trash", color: .healthCritical) {
                onDelete()
            }
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

struct PlantPhotosSection: View {
    let photos: [Photo]

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            Text("Photos (\(photos.count))")
                .font(.patchTitle3)
                .foregroundColor(.patchText)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: AppTheme.Spacing.sm) {
                    ForEach(photos, id: \.self) { photo in
                        if let imageData = photo.thumbnailData ?? photo.imageData,
                           let uiImage = UIImage(data: imageData) {
                            Image(uiImage: uiImage)
                                .resizable()
                                .aspectRatio(contentMode: .fill)
                                .frame(width: 88, height: 88)
                                .clipShape(RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md))
                        }
                    }
                }
            }
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

struct PlantCareTasksSection: View {
    let tasks: [CareTask]

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            Text("Upcoming Care Tasks (\(tasks.count))")
                .font(.patchTitle3)
                .foregroundColor(.patchText)

            ForEach(tasks, id: \.self) { task in
                CareTaskRowCompact(task: task)
            }
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

struct CareTaskRowCompact: View {
    let task: CareTask

    private var dateFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateStyle = .short
        return formatter
    }

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            TaskTypeIcon(type: task.taskType, size: 32)

            VStack(alignment: .leading, spacing: 0) {
                Text(task.taskType)
                    .font(.patchBody)
                    .foregroundColor(.patchText)
                Text(dateFormatter.string(from: task.scheduledDate))
                    .font(.patchCaption2)
                    .foregroundColor(.patchTextSecondary)
            }

            Spacer()
        }
        .padding(AppTheme.Spacing.sm)
        .background(Color.patchBackgroundSecondary.opacity(0.55))
        .cornerRadius(AppTheme.CornerRadius.md)
    }
}

struct PlantNotesSection: View {
    let notes: [Note]

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            Text("Recent Notes (\(notes.count))")
                .font(.patchTitle3)
                .foregroundColor(.patchText)

            ForEach(notes.prefix(3), id: \.self) { note in
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                    Text(note.title)
                        .font(.patchSubheadline)
                        .fontWeight(.medium)
                    Text(note.content)
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                        .lineLimit(2)
                }
                .padding(AppTheme.Spacing.sm)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color.patchBackgroundSecondary.opacity(0.55))
                .cornerRadius(AppTheme.CornerRadius.md)
            }
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

#Preview("Plant Detail") {
    let context = PersistenceController.shared.container.viewContext
    let plant = Plant(context: context)
    plant.id = UUID()
    plant.name = "Tomato"
    plant.species = "Solanum lycopersicum"
    plant.healthStatus = "Good"
    plant.growthStage = "Flowering"
    plant.plantingDate = Date()
    plant.location = "Backyard Garden"
    plant.createdAt = Date()

    return PlantDetailView(plant: plant) {
        print("Updated")
    }
}
