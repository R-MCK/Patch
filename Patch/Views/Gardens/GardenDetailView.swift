import SwiftUI

struct GardenDetailView: View {
    @StateObject private var viewModel: GardenDetailViewModel
    @Environment(\.dismiss) private var dismiss

    let onDismiss: () -> Void

    @State private var showEditSheet = false
    @State private var showDeleteAlert = false
    @State private var selectedPlant: Plant?

    init(garden: Garden, onDismiss: @escaping () -> Void) {
        _viewModel = StateObject(wrappedValue: GardenDetailViewModel(garden: garden))
        self.onDismiss = onDismiss
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: AppTheme.Spacing.lg) {
                    GardenHeaderSection(garden: viewModel.garden)

                    GardenStatsSection(
                        plantCount: viewModel.plantCount,
                        area: viewModel.area
                    )

                    if viewModel.garden.climateZone != nil || viewModel.garden.soilType != nil {
                        GardenInfoSection(garden: viewModel.garden)
                    }

                    GardenPlantsSection(
                        plants: viewModel.plants,
                        isLoading: viewModel.isLoading,
                        onPlantTap: { plant in
                            selectedPlant = plant
                        }
                    )
                }
                .padding()
            }
            .navigationTitle(viewModel.garden.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Menu {
                        Button {
                            showEditSheet = true
                        } label: {
                            Label("Edit Garden", systemImage: "pencil")
                        }

                        Divider()

                        Button(role: .destructive) {
                            showDeleteAlert = true
                        } label: {
                            Label("Delete Garden", systemImage: "trash")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
            }
            .sheet(isPresented: $showEditSheet) {
                EditGardenView(garden: viewModel.garden) {
                    viewModel.refresh()
                    onDismiss()
                }
            }
            .navigationDestination(item: $selectedPlant) { plant in
                PlantDetailView(plant: plant) {
                    viewModel.loadPlants()
                }
            }
            .alert("Delete Garden", isPresented: $showDeleteAlert) {
                Button("Cancel", role: .cancel) { }
                Button("Delete", role: .destructive) {
                    viewModel.deleteGarden()
                    onDismiss()
                    dismiss()
                }
            } message: {
                Text("Are you sure you want to delete \(viewModel.garden.name)? This will also remove all plants in this garden. This action cannot be undone.")
            }
        }
    }
}

struct GardenHeaderSection: View {
    let garden: Garden

    var body: some View {
        VStack(spacing: AppTheme.Spacing.md) {
            Image(systemName: "square.grid.2x2.fill")
                .font(.system(size: 48, weight: .light))
                .foregroundColor(.patchPrimary)
                .padding(AppTheme.Spacing.lg)
                .background(Color.patchPrimary.opacity(0.08))
                .clipShape(Circle())

            VStack(spacing: AppTheme.Spacing.xs) {
                Text(garden.name)
                    .font(.patchTitle1)
                    .foregroundColor(.patchText)
                    .multilineTextAlignment(.center)

                Text("\(Int(garden.width))' × \(Int(garden.length))'")
                    .font(.patchSubheadline)
                    .foregroundColor(.patchTextSecondary)
            }

            GardenTypeBadge(type: garden.gardenType)
                .padding(.top, AppTheme.Spacing.xs)
        }
        .frame(maxWidth: .infinity)
        .padding(AppTheme.Spacing.xl)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }
}

struct GardenTypeBadge: View {
    let type: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.xs) {
            Image(systemName: typeIcon)
                .font(.patchCaption1)
            Text(type)
                .font(.patchCaption1)
                .fontWeight(.medium)
                .textCase(.uppercase)
                .kerning(0.5)
        }
        .padding(.horizontal, AppTheme.Spacing.md)
        .padding(.vertical, AppTheme.Spacing.sm)
        .background(Color.patchPrimary.opacity(0.08))
        .foregroundColor(.patchPrimary)
        .cornerRadius(AppTheme.CornerRadius.full)
    }

    private var typeIcon: String {
        switch type.lowercased() {
        case "raised bed": return "rectangle.fill"
        case "in-ground": return "globe"
        case "container": return "cube.box.fill"
        case "greenhouse": return "house.fill"
        case "hydroponic": return "drop.fill"
        default: return "square.grid.2x2.fill"
        }
    }
}

struct GardenStatsSection: View {
    let plantCount: Int
    let area: Double

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            StatCard(
                title: "Plants",
                value: "\(plantCount)",
                icon: "leaf.fill",
                color: .patchPrimary
            )

            StatCard(
                title: "Area",
                value: String(format: "%.0f sq ft", area),
                icon: "square.on.square",
                color: .patchSecondary
            )
        }
    }
}

struct GardenInfoSection: View {
    let garden: Garden

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            Text("Environment")
                .font(.patchTitle3)
                .foregroundColor(.patchText)

            LazyVGrid(columns: [
                GridItem(.flexible()),
                GridItem(.flexible())
            ], spacing: AppTheme.Spacing.md) {
                if let climateZone = garden.climateZone, !climateZone.isEmpty {
                    InfoItem(icon: "thermometer.medium", label: "Climate Zone", value: climateZone)
                }

                if let soilType = garden.soilType, !soilType.isEmpty {
                    InfoItem(icon: "circle.hexagonpath.fill", label: "Soil Type", value: soilType)
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

struct GardenPlantsSection: View {
    let plants: [Plant]
    let isLoading: Bool
    let onPlantTap: (Plant) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            HStack {
                Text("Plants (\(plants.count))")
                    .font(.patchTitle3)
                    .foregroundColor(.patchText)

                Spacer()

                if plants.isEmpty {
                    Text("No plants yet")
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextTertiary)
                        .textCase(.uppercase)
                        .kerning(0.5)
                }
            }

            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity)
                    .padding(AppTheme.Spacing.xl)
            } else if plants.isEmpty {
                VStack(spacing: AppTheme.Spacing.md) {
                    Image(systemName: "leaf.badge.plus")
                        .font(.system(size: 40, weight: .light))
                        .foregroundColor(.patchPrimary)
                        .padding(AppTheme.Spacing.lg)
                        .background(Color.patchPrimary.opacity(0.08))
                        .clipShape(Circle())

                    Text("This garden is empty")
                        .font(.patchSubheadline)
                        .foregroundColor(.patchText)

                    Text("Add plants from the Tracker tab to start organizing.")
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                        .multilineTextAlignment(.center)
                }
                .frame(maxWidth: .infinity)
                .padding(AppTheme.Spacing.xl)
            } else {
                ForEach(plants, id: \.self) { plant in
                    PlantRowView(plant: plant) {
                        onPlantTap(plant)
                    }
                    if plant != plants.last {
                        Divider()
                            .padding(.leading, 68) // align with content after image
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

struct EditGardenView: View {
    let garden: Garden
    let onSave: () -> Void

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Garden Details") {
                    Text("Edit functionality coming soon")
                        .foregroundColor(.patchTextSecondary)
                }
            }
            .navigationTitle("Edit Garden")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        onSave()
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview("Garden Detail") {
    let context = PersistenceController.shared.container.viewContext
    let garden = Garden(context: context)
    garden.id = UUID()
    garden.name = "Backyard Garden"
    garden.gardenType = "Raised Bed"
    garden.width = 8
    garden.length = 4
    garden.climateZone = "Zone 8a"
    garden.soilType = "Loamy"
    garden.createdAt = Date()

    return GardenDetailView(garden: garden) {
        print("Dismissed")
    }
}
