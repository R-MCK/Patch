import SwiftUI

struct PlantListView: View {
    @StateObject private var viewModel = PlantListViewModel()
    @State private var showAddPlant = false
    @State private var selectedPlant: Plant?
    @State private var showFilters = false

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottomTrailing) {
                VStack(spacing: AppTheme.Spacing.md) {
                    TrackerHeaderCard(
                        plantCount: viewModel.filteredPlants.count,
                        healthyCount: healthyCount,
                        hasActiveFilters: viewModel.hasActiveFilters
                    )
                    .padding(.horizontal, AppTheme.Spacing.md)
                    .padding(.top, AppTheme.Spacing.md)

                    SearchBar(text: $viewModel.searchText, placeholder: "Search plants...")
                        .padding(.horizontal, AppTheme.Spacing.md)

                    if viewModel.isLoading {
                        Spacer()
                        LoadingView(message: "Loading plants...")
                        Spacer()
                    } else if viewModel.filteredPlants.isEmpty {
                        Spacer()
                        if viewModel.hasActiveFilters {
                            EmptyStateView(
                                "No Results",
                                message: "No plants match your filters",
                                icon: "magnifyingglass"
                            ) {
                                viewModel.clearFilters()
                            }
                        } else {
                            EmptyStateView.noPlants {
                                showAddPlant = true
                            }
                        }
                        Spacer()
                    } else {
                        if viewModel.hasActiveFilters {
                            FilterChipsView(viewModel: viewModel)
                                .padding(.horizontal, AppTheme.Spacing.md)
                        }

                        List {
                            Section {
                                ForEach(viewModel.filteredPlants) { plant in
                                    PlantRowView(plant: plant) {
                                        selectedPlant = plant
                                    }
                                    .listRowInsets(EdgeInsets(top: AppTheme.Spacing.xs, leading: AppTheme.Spacing.md, bottom: AppTheme.Spacing.xs, trailing: AppTheme.Spacing.md))
                                    .listRowBackground(Color.clear)
                                    .listRowSeparator(.hidden)
                                }
                                .onDelete(perform: { indexSet in
                                    viewModel.deletePlants(at: indexSet)
                                })
                            } header: {
                                Text("Plants")
                                    .font(.patchCaption1)
                                    .foregroundColor(.patchTextSecondary)
                                    .textCase(nil)
                            }
                        }
                        .listStyle(.plain)
                        .scrollContentBackground(.hidden)
                    }
                }

                if !viewModel.filteredPlants.isEmpty {
                    FloatingActionButton(icon: "plus") {
                        showAddPlant = true
                    }
                    .padding(.trailing, AppTheme.Spacing.lg)
                    .padding(.bottom, 90) // Account for translucent tab bar
                }
            }
            .navigationTitle("My Plants")
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Menu {
                        ForEach(PlantListViewModel.SortOption.allCases, id: \.self) { option in
                            Button {
                                viewModel.sortOption = option
                            } label: {
                                HStack {
                                    Text(option.rawValue)
                                    if viewModel.sortOption == option {
                                        Image(systemName: "checkmark")
                                    }
                                }
                            }
                        }
                    } label: {
                        Label("Sort", systemImage: "arrow.up.arrow.down.circle")
                            .font(.patchSubheadline)
                            .foregroundColor(.patchText)
                    }
                    .accessibilityLabel("Sort plants")
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showFilters.toggle()
                    } label: {
                        Label("Filter", systemImage: viewModel.hasActiveFilters ? "line.3.horizontal.decrease.circle.fill" : "line.3.horizontal.decrease.circle")
                            .font(.patchSubheadline)
                            .foregroundColor(.patchText)
                    }
                    .accessibilityLabel("Filter plants")
                }

            }
            .sheet(isPresented: $showAddPlant) {
                AddPlantView { newPlant in
                    viewModel.loadPlants()
                }
            }
            .sheet(item: $selectedPlant) { plant in
                PlantDetailView(plant: plant) {
                    viewModel.loadPlants()
                }
            }
            .sheet(isPresented: $showFilters) {
                FilterSheetView(viewModel: viewModel)
            }
            .refreshable {
                await viewModel.refresh()
            }
            .onAppear {
                viewModel.loadPlants()
            }
            .screenBackgroundStyle()
        }
    }

    private var healthyCount: Int {
        viewModel.filteredPlants.filter {
            $0.healthStatus == Plant.HealthStatus.excellent.rawValue ||
            $0.healthStatus == Plant.HealthStatus.good.rawValue
        }.count
    }
}

struct TrackerHeaderCard: View {
    let plantCount: Int
    let healthyCount: Int
    let hasActiveFilters: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text("Tracker")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)
                    .textCase(.uppercase)
                    .kerning(0.5)

                Text(hasActiveFilters ? "Filtered Plant View" : "My Plants")
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)

                Text(hasActiveFilters ? "Showing only plants matching active filters." : "Monitor health, growth, and care tasks in one place.")
                    .font(.patchSubheadline)
                    .foregroundColor(.patchTextSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            HStack(spacing: AppTheme.Spacing.md) {
                trackerStat(title: "Tracked", value: "\(plantCount)")
                trackerStat(title: "Healthy", value: "\(healthyCount)")
            }
            .padding(.top, AppTheme.Spacing.sm)
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }

    private func trackerStat(title: String, value: String) -> some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
            Text(title)
                .font(.patchCaption2)
                .foregroundColor(.patchTextSecondary)
                .textCase(.uppercase)
                .kerning(0.5)
            Text(value)
                .font(.patchTitle3)
                .foregroundColor(.patchPrimary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct PlantListSummaryCard: View {
    let plantCount: Int
    let healthyCount: Int
    let hasActiveFilters: Bool

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text(hasActiveFilters ? "Filtered Collection" : "Garden Collection")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)

                Text("\(plantCount) plant\(plantCount == 1 ? "" : "s")")
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: AppTheme.Spacing.xxs) {
                Text("\(healthyCount) healthy")
                    .font(.patchBodyBold)
                    .foregroundColor(.patchPrimary)
                Text("Excellent or good")
                    .font(.patchCaption2)
                    .foregroundColor(.patchTextSecondary)
            }
        }
        .cardStyle()
    }
}

struct FilterChipsView: View {
    @ObservedObject var viewModel: PlantListViewModel

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: AppTheme.Spacing.sm) {
                if let health = viewModel.selectedHealthFilter {
                    ChipButton(health.rawValue, isSelected: true) {
                        viewModel.selectedHealthFilter = nil
                    }
                }

                if let growth = viewModel.selectedGrowthFilter {
                    ChipButton(growth.rawValue, isSelected: true) {
                        viewModel.selectedGrowthFilter = nil
                    }
                }

                if let garden = viewModel.selectedGardenFilter {
                    ChipButton(garden.name, isSelected: true) {
                        viewModel.selectedGardenFilter = nil
                    }
                }

                if viewModel.hasActiveFilters {
                    TextButton("Clear All") {
                        viewModel.clearFilters()
                    }
                }
            }
        }
    }
}

struct FilterSheetView: View {
    @ObservedObject var viewModel: PlantListViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section("Health Status") {
                    ForEach(Plant.HealthStatus.allCases, id: \.self) { status in
                        Button {
                            if viewModel.selectedHealthFilter == status {
                                viewModel.selectedHealthFilter = nil
                            } else {
                                viewModel.selectedHealthFilter = status
                            }
                        } label: {
                            HStack {
                                Text(status.rawValue)
                                    .foregroundColor(.patchText)
                                Spacer()
                                if viewModel.selectedHealthFilter == status {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(.patchPrimary)
                                }
                            }
                        }
                    }
                }

                Section("Growth Stage") {
                    ForEach(Plant.GrowthStage.allCases, id: \.self) { stage in
                        Button {
                            if viewModel.selectedGrowthFilter == stage {
                                viewModel.selectedGrowthFilter = nil
                            } else {
                                viewModel.selectedGrowthFilter = stage
                            }
                        } label: {
                            HStack {
                                Text(stage.rawValue)
                                    .foregroundColor(.patchText)
                                Spacer()
                                if viewModel.selectedGrowthFilter == stage {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(.patchPrimary)
                                }
                            }
                        }
                    }
                }

                Section("Sort By") {
                    ForEach(PlantListViewModel.SortOption.allCases, id: \.self) { option in
                        Button {
                            viewModel.sortOption = option
                        } label: {
                            HStack {
                                Text(option.rawValue)
                                    .foregroundColor(.patchText)
                                Spacer()
                                if viewModel.sortOption == option {
                                    Image(systemName: "checkmark")
                                        .foregroundColor(.patchPrimary)
                                }
                            }
                        }
                    }
                }

                Section {
                    Button("Clear All Filters", role: .destructive) {
                        viewModel.clearFilters()
                    }
                }
            }
            .navigationTitle("Filters")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }
}

#Preview("Plant List") {
    PlantListView()
}
