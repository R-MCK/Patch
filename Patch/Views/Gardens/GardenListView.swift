import SwiftUI

struct GardenListView: View {
    @StateObject private var viewModel = GardenListViewModel()
    @State private var showAddGarden = false
    @State private var selectedGarden: Garden?

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottomTrailing) {
                VStack(spacing: AppTheme.Spacing.md) {
                    GardensHeaderCard(
                        gardenCount: viewModel.gardens.count,
                        totalPlants: viewModel.gardens.reduce(0) { $0 + $1.plantCount }
                    )
                    .padding(.horizontal, AppTheme.Spacing.md)
                    .padding(.top, AppTheme.Spacing.md)

                    if viewModel.isLoading {
                        Spacer()
                        LoadingView(message: "Loading gardens...")
                        Spacer()
                    } else if viewModel.gardens.isEmpty {
                        Spacer()
                        EmptyStateView.noGardens {
                            showAddGarden = true
                        }
                        Spacer()
                    } else {
                        List {
                            Section {
                                ForEach(viewModel.gardens) { garden in
                                    GardenCard(
                                        name: garden.name,
                                        type: garden.gardenType,
                                        dimensions: garden.dimensions,
                                        plantCount: garden.plantCount
                                    ) {
                                        selectedGarden = garden
                                    }
                                    .listRowInsets(EdgeInsets(top: AppTheme.Spacing.xs, leading: AppTheme.Spacing.md, bottom: AppTheme.Spacing.xs, trailing: AppTheme.Spacing.md))
                                    .listRowBackground(Color.clear)
                                    .listRowSeparator(.hidden)
                                }
                                .onDelete(perform: { indexSet in
                                    viewModel.deleteGardens(at: indexSet)
                                })
                            } header: {
                                Text("Gardens")
                                    .font(.patchCaption1)
                                    .foregroundColor(.patchTextSecondary)
                                    .textCase(nil)
                            }
                        }
                        .listStyle(.plain)
                        .scrollContentBackground(.hidden)
                    }
                }

                if !viewModel.gardens.isEmpty {
                    FloatingActionButton(icon: "plus") {
                        showAddGarden = true
                    }
                    .padding(.trailing, AppTheme.Spacing.lg)
                    .padding(.bottom, 90) // Account for the translucent tab bar
                }
            }
            .navigationTitle("My Gardens")
            .sheet(isPresented: $showAddGarden) {
                AddGardenView { newGarden in
                    viewModel.loadGardens()
                }
            }
            .sheet(item: $selectedGarden) { garden in
                GardenDetailView(garden: garden) {
                    viewModel.loadGardens()
                }
            }
            .refreshable {
                await viewModel.refresh()
            }
            .onAppear {
                viewModel.loadGardens()
            }
            .screenBackgroundStyle()
        }
    }
}

struct GardensHeaderCard: View {
    let gardenCount: Int
    let totalPlants: Int

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text("Garden Spaces")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)
                    .textCase(.uppercase)
                    .kerning(0.5)

                Text("My Gardens")
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)

                Text("Organize beds, containers, and zones to keep your planting plan clear.")
                    .font(.patchSubheadline)
                    .foregroundColor(.patchTextSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            HStack(spacing: AppTheme.Spacing.md) {
                gardensStat(title: "Gardens", value: "\(gardenCount)")
                gardensStat(title: "Plants", value: "\(totalPlants)")
            }
            .padding(.top, AppTheme.Spacing.sm)
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }

    private func gardensStat(title: String, value: String) -> some View {
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

struct GardenListSummaryCard: View {
    let gardenCount: Int
    let totalPlants: Int

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text("Garden Spaces")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)
                Text("\(gardenCount)")
                    .font(.patchTitle1)
                    .foregroundColor(.patchText)
            }

            Spacer()

            VStack(alignment: .trailing, spacing: AppTheme.Spacing.xs) {
                Text("\(totalPlants)")
                    .font(.patchTitle1)
                    .foregroundColor(.patchPrimary)
                Text("plants tracked")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)
            }
        }
        .cardStyle()
    }
}

#Preview("Garden List") {
    GardenListView()
}
