import SwiftUI
import CoreData

struct MainTabView: View {
    @State private var selectedTab = 0

    var body: some View {
        ZStack {
            FloatingLeavesBackground()
                .ignoresSafeArea()

            TabView(selection: $selectedTab) {
                TrackerTab()
                    .tabItem {
                        Label("Tracker", systemImage: "leaf.fill")
                    }
                    .tag(0)

                WikiTab()
                    .tabItem {
                        Label("Wiki", systemImage: "book.fill")
                    }
                    .tag(1)

                GardensTab()
                    .tabItem {
                        Label("Gardens", systemImage: "square.grid.2x2.fill")
                    }
                    .tag(2)

                DesignTab()
                    .tabItem {
                        Label("Design", systemImage: "pencil.and.ruler")
                    }
                    .tag(3)
            }
            .tint(Color.patchGreen)
            .onAppear {
                #if DEBUG
                if let tabArgument = ProcessInfo.processInfo.arguments.first(where: { $0.hasPrefix("--tab=") }) {
                    let tabValue = tabArgument.replacingOccurrences(of: "--tab=", with: "")
                    switch tabValue.lowercased() {
                    case "tracker": selectedTab = 0
                    case "wiki": selectedTab = 1
                    case "gardens": selectedTab = 2
                    case "design": selectedTab = 3
                    default: break
                    }
                }
                #endif

                let appearance = UITabBarAppearance()
                appearance.configureWithTransparentBackground()
                
                let blurEffect = UIBlurEffect(style: .systemThinMaterialLight)
                appearance.backgroundEffect = blurEffect
                appearance.backgroundColor = UIColor(Color.white.opacity(0.8))
                
                appearance.shadowColor = UIColor(Color.patchBackgroundTertiary.opacity(0.4))
                
                let itemAppearance = UITabBarItemAppearance()
                itemAppearance.normal.iconColor = UIColor(Color.patchTextTertiary)
                itemAppearance.normal.titleTextAttributes = [.foregroundColor: UIColor(Color.patchTextTertiary), .font: UIFont.systemFont(ofSize: 10, weight: .medium)]
                itemAppearance.selected.iconColor = UIColor(Color.patchPrimary)
                itemAppearance.selected.titleTextAttributes = [.foregroundColor: UIColor(Color.patchPrimary), .font: UIFont.systemFont(ofSize: 10, weight: .semibold)]
                
                appearance.stackedLayoutAppearance = itemAppearance
                appearance.inlineLayoutAppearance = itemAppearance
                appearance.compactInlineLayoutAppearance = itemAppearance
                
                UITabBar.appearance().standardAppearance = appearance
                UITabBar.appearance().scrollEdgeAppearance = appearance
            }
        }
    }
}

// MARK: - Root Tabs

struct TrackerTab: View {
    var body: some View {
        PlantListView()
    }
}

struct WikiTab: View {
    var body: some View {
        WikiHomeView()
    }
}

struct GardensTab: View {
    var body: some View {
        GardenListView()
    }
}

// MARK: - Design Feature

struct DesignTab: View {
    @StateObject private var viewModel = DesignTabViewModel()

    @State private var showCreateSheet = false
    @State private var selectedDesign: GardenDesign?

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottomTrailing) {
                ScrollView {
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                        DesignHeroCard()

                        if viewModel.gardens.isEmpty {
                            DesignEmptyGardensCard()
                        } else {
                            DesignStatusCard(
                                totalLayouts: viewModel.designs.count,
                                totalPlacedPlants: viewModel.designs.reduce(0) { $0 + $1.plantCount }
                            )

                            if viewModel.designs.isEmpty {
                                EmptyStateView(
                                    "No layouts yet",
                                    message: "Create a layout to plan spacing and placement before planting.",
                                    icon: "pencil.and.ruler.fill",
                                    actionTitle: "Create First Layout"
                                ) {
                                    showCreateSheet = true
                                }
                            } else {
                                VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                                    Text("Your Layouts")
                                        .font(.patchTitle3)
                                        .foregroundColor(.patchText)

                                    ForEach(viewModel.designs) { design in
                                        DesignLayoutCard(design: design) {
                                            selectedDesign = design
                                        }
                                    }
                                }
                            }
                        }
                    }
                    .padding(AppTheme.Spacing.md)
                    .padding(.bottom, 90)
                }

                if !viewModel.gardens.isEmpty {
                    FloatingActionButton(icon: "plus") {
                        showCreateSheet = true
                    }
                    .padding(.trailing, AppTheme.Spacing.lg)
                    .padding(.bottom, AppTheme.Spacing.lg)
                }
            }
            .navigationTitle("Design")
            .screenBackgroundStyle()
            .sheet(isPresented: $showCreateSheet) {
                CreateDesignSheet(gardens: viewModel.gardens) { name, garden in
                    if let design = viewModel.createDesign(name: name, garden: garden) {
                        selectedDesign = design
                    }
                }
            }
            .navigationDestination(item: $selectedDesign) { design in
                GardenDesignEditorView(design: design)
            }
            .onAppear {
                viewModel.loadContent()
            }
        }
    }
}

private struct DesignHeroCard: View {
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text("Garden Design Studio")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)
                    .textCase(.uppercase)
                    .kerning(0.5)
                    
                Text("Plan Before You Plant")
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)
                    
                Text("Lay out your garden with confidence using spacing and companion-aware guidance.")
                    .font(.patchSubheadline)
                    .foregroundColor(.patchTextSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: AppTheme.Spacing.md)

            Image(systemName: "pencil.and.ruler.fill")
                .font(.system(size: 32, weight: .semibold))
                .foregroundColor(.patchPrimary)
                .frame(width: 64, height: 64)
                .background(Color.patchPrimary.opacity(0.1))
                .clipShape(Circle())
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }
}

private struct DesignMetric: View {
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
            Text(title)
                .font(.patchCaption2)
                .foregroundColor(.patchTextSecondary)
            Text(value)
                .font(.patchHeadline)
                .foregroundColor(.patchPrimary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

private struct DesignStatusCard: View {
    let totalLayouts: Int
    let totalPlacedPlants: Int

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            StatCard(
                title: "Layouts",
                value: "\(totalLayouts)",
                icon: "square.grid.3x3.fill",
                color: .patchPrimary
            )

            StatCard(
                title: "Placed",
                value: "\(totalPlacedPlants)",
                icon: "leaf.fill",
                color: .patchSecondary
            )
        }
    }
}

private struct DesignEmptyGardensCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("Create a garden first")
                .font(.patchHeadline)
                .foregroundColor(.patchText)

            Text("Design layouts are attached to gardens. Add a garden from the Gardens tab, then return here to build your canvas.")
                .font(.patchSubheadline)
                .foregroundColor(.patchTextSecondary)
        }
        .cardStyle()
    }
}

private struct DesignLayoutCard: View {
    let design: GardenDesign
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: AppTheme.Spacing.md) {
                Image(systemName: "square.grid.3x3")
                    .font(.patchHeadline)
                    .foregroundColor(.patchPrimary)
                    .frame(width: 36, height: 36)
                    .background(Color.patchBackgroundSecondary)
                    .clipShape(RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md))

                VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                    Text(design.name)
                        .font(.patchBodyBold)
                        .foregroundColor(.patchText)

                    Text(design.garden?.name ?? "Unassigned Garden")
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)

                    Text("\(design.plantCount) placed • Updated \(design.formattedDate)")
                        .font(.patchCaption2)
                        .foregroundColor(.patchTextTertiary)
                }

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextTertiary)
            }
            .cardStyle(padding: AppTheme.Spacing.md)
        }
        .buttonStyle(.plain)
    }
}

private struct CreateDesignSheet: View {
    let gardens: [Garden]
    let onCreate: (String, Garden) -> Void

    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var selectedGardenID: UUID?

    var body: some View {
        NavigationStack {
            VStack(spacing: AppTheme.Spacing.lg) {
                PatchTextField(
                    "Layout Name",
                    text: $name,
                    placeholder: "Spring Bed Layout",
                    icon: "square.grid.3x3",
                    isRequired: true
                )

                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                    Text("Garden")
                        .font(.patchSubheadline)
                        .foregroundColor(.patchTextSecondary)

                    Picker("Garden", selection: $selectedGardenID) {
                        ForEach(gardens) { garden in
                            Text(garden.name).tag(Optional(garden.id))
                        }
                    }
                    .pickerStyle(.menu)
                    .padding(AppTheme.Spacing.md)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.white.opacity(0.88))
                    .cornerRadius(AppTheme.CornerRadius.md)
                }

                Spacer()

                PrimaryButton("Create Layout", icon: "plus") {
                    guard let selectedGardenID,
                          let garden = gardens.first(where: { $0.id == selectedGardenID }) else {
                        return
                    }

                    let trimmed = name.trimmingCharacters(in: .whitespacesAndNewlines)
                    onCreate(trimmed, garden)
                    dismiss()
                }
                .disabled(!canCreate)
            }
            .padding(AppTheme.Spacing.md)
            .screenBackgroundStyle()
            .navigationTitle("New Layout")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
            .onAppear {
                if selectedGardenID == nil {
                    selectedGardenID = gardens.first?.id
                }
                if name.isEmpty, let firstGarden = gardens.first {
                    name = "\(firstGarden.name) Layout"
                }
            }
        }
    }

    private var canCreate: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && selectedGardenID != nil
    }
}

private struct GardenDesignEditorView: View {
    @StateObject private var viewModel: GardenDesignEditorViewModel

    @State private var canvasState: CanvasState
    @State private var selectedPlacedPlantID: UUID?
    @State private var focusedPlantPairIDs: Set<UUID> = []

    init(design: GardenDesign) {
        _viewModel = StateObject(wrappedValue: GardenDesignEditorViewModel(design: design))
        _canvasState = State(initialValue: design.canvasState ?? CanvasState())
    }

    var body: some View {
        ScrollView {
            VStack(spacing: AppTheme.Spacing.lg) {
                DesignEditorCanvas(
                    canvasState: $canvasState,
                    selectedPlacedPlantID: $selectedPlacedPlantID,
                    focusedPlantPairIDs: $focusedPlantPairIDs,
                    markerStatuses: insights.markerStatuses,
                    spacingConflictPlantIDs: insights.spacingConflictPlantIDs
                )

                DesignInsightsSection(insights: insights) { firstID, secondID in
                    focusPair(firstPlacedPlantID: firstID, secondPlacedPlantID: secondID)
                }

                DesignToggleSection(canvasState: $canvasState)

                DesignPaletteSection(
                    plants: availablePlants,
                    placedPlantIDs: Set(canvasState.plants.map(\.wikiEntryId)),
                    onAddPlant: addPlant
                )

                if let selectedPlant = selectedPlacedPlant {
                    selectedPlantActions(selectedPlant)
                }
            }
            .padding(AppTheme.Spacing.md)
            .padding(.bottom, AppTheme.Spacing.lg)
        }
        .navigationTitle(viewModel.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Save") {
                    saveDesign()
                }
                .font(.patchBodyBold)
            }
        }
        .screenBackgroundStyle()
        .onDisappear {
            saveDesign()
        }
    }

    private var availablePlants: [Plant] {
        viewModel.availablePlants
    }

    private var selectedPlacedPlant: PlacedPlant? {
        guard let selectedPlacedPlantID else { return nil }
        return canvasState.plants.first(where: { $0.id == selectedPlacedPlantID })
    }

    private var insights: DesignInsights {
        buildInsights(
            placements: canvasState.plants,
            availablePlants: availablePlants,
            wikiEntries: viewModel.wikiEntries,
            gardenWidth: viewModel.gardenWidth,
            gardenLength: viewModel.gardenLength
        )
    }

    private func addPlant(_ plant: Plant) {
        let placement = PlacedPlant(
            wikiEntryId: plant.id,
            name: plant.name,
            x: 0.5,
            y: 0.5,
            rotation: 0,
            scale: 1
        )
        canvasState.plants.append(placement)
        selectedPlacedPlantID = placement.id
        focusedPlantPairIDs = []
    }

    private func selectedPlantActions(_ selectedPlant: PlacedPlant) -> some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("Selected")
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)

            HStack(spacing: AppTheme.Spacing.md) {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                    Text(selectedPlant.name)
                        .font(.patchHeadline)
                        .foregroundColor(.patchText)
                    Text(selectedPlantHint(for: selectedPlant.id))
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                }

                Spacer()

                Button(role: .destructive) {
                    canvasState.plants.removeAll(where: { $0.id == selectedPlant.id })
                    selectedPlacedPlantID = nil
                    focusedPlantPairIDs = []
                } label: {
                    Label("Remove", systemImage: "trash")
                        .font(.patchCaption1)
                }
            }
        }
        .cardStyle()
    }

    private func selectedPlantHint(for placedPlantID: UUID) -> String {
        if let issueCount = insights.spacingIssueCounts[placedPlantID], issueCount > 0 {
            return "Spacing conflict with \(issueCount) nearby \(issueCount == 1 ? "plant" : "plants")"
        }

        if let status = insights.markerStatuses[placedPlantID] {
            switch status {
            case .companionGood:
                return "Has companion-friendly placement nearby"
            case .companionBad:
                return "Near an antagonistic pairing"
            case .spacingConflict:
                return "Spacing conflict detected"
            case .normal:
                return "Drag on canvas to reposition"
            }
        }

        return "Drag on canvas to reposition"
    }

    private func saveDesign() {
        viewModel.save(canvasState: canvasState)
    }

    private func focusPair(firstPlacedPlantID: UUID, secondPlacedPlantID: UUID) {
        selectedPlacedPlantID = firstPlacedPlantID
        focusedPlantPairIDs = [firstPlacedPlantID, secondPlacedPlantID]
    }
}

@MainActor
private final class DesignTabViewModel: ObservableObject {
    @Published private(set) var gardens: [Garden] = []
    @Published private(set) var designs: [GardenDesign] = []

    private let gardenRepository: GardenRepository
    private let gardenDesignRepository: GardenDesignRepository

    init(
        gardenRepository: GardenRepository? = nil,
        gardenDesignRepository: GardenDesignRepository? = nil
    ) {
        self.gardenRepository = gardenRepository ?? GardenRepository()
        self.gardenDesignRepository = gardenDesignRepository ?? GardenDesignRepository()
    }

    func loadContent() {
        gardens = gardenRepository.fetchAll()
        designs = gardenDesignRepository.fetchAll()
    }

    func createDesign(name: String, garden: Garden) -> GardenDesign? {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmedName.isEmpty else { return nil }

        let design = gardenDesignRepository.create(name: trimmedName, garden: garden)
        loadContent()
        return design
    }
}

@MainActor
private final class GardenDesignEditorViewModel: ObservableObject {
    @Published private(set) var wikiEntries: [WikiEntry] = []

    let design: GardenDesign

    private let designRepository: GardenDesignRepository
    private let wikiRepository: WikiRepository

    init(
        design: GardenDesign,
        designRepository: GardenDesignRepository? = nil,
        wikiRepository: WikiRepository? = nil
    ) {
        self.design = design
        self.designRepository = designRepository ?? GardenDesignRepository()
        self.wikiRepository = wikiRepository ?? WikiRepository()
        loadSupportingData()
    }

    var title: String {
        design.name
    }

    var availablePlants: [Plant] {
        ((design.garden?.plants as? Set<Plant>) ?? [])
            .sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
    }

    var gardenWidth: Double {
        design.garden?.width ?? 0
    }

    var gardenLength: Double {
        design.garden?.length ?? 0
    }

    func save(canvasState: CanvasState) {
        designRepository.update(design, canvasState: canvasState)
    }

    private func loadSupportingData() {
        wikiEntries = wikiRepository.fetchAll()
    }
}

enum DesignMarkerStatus {
    case normal
    case spacingConflict
    case companionGood
    case companionBad
}

struct SpacingIssue: Identifiable {
    let id = UUID()
    let firstPlacedPlantID: UUID
    let secondPlacedPlantID: UUID
    let firstName: String
    let secondName: String
    let requiredFeet: Double
    let actualFeet: Double
}

struct PlantRelationshipIssue: Identifiable {
    let id = UUID()
    let firstPlacedPlantID: UUID
    let secondPlacedPlantID: UUID
    let firstName: String
    let secondName: String
}

struct DesignInsights {
    let spacingIssues: [SpacingIssue]
    let companionPairs: [PlantRelationshipIssue]
    let antagonistPairs: [PlantRelationshipIssue]
    let spacingIssueCounts: [UUID: Int]
    let companionPairCount: Int
    let antagonistPairCount: Int
    let markerStatuses: [UUID: DesignMarkerStatus]
    let spacingConflictPlantIDs: Set<UUID>
}

func buildInsights(
    placements: [PlacedPlant],
    availablePlants: [Plant],
    wikiEntries: [WikiEntry],
    gardenWidth: Double,
    gardenLength: Double
) -> DesignInsights {
    guard placements.count > 1 else {
        return DesignInsights(
            spacingIssues: [],
            companionPairs: [],
            antagonistPairs: [],
            spacingIssueCounts: [:],
            companionPairCount: 0,
            antagonistPairCount: 0,
            markerStatuses: [:],
            spacingConflictPlantIDs: []
        )
    }

    let plantsByID = Dictionary(uniqueKeysWithValues: availablePlants.map { ($0.id, $0) })

    let width = max(gardenWidth, 1)
    let length = max(gardenLength, 1)

    var spacingIssues: [SpacingIssue] = []
    var companionPairs: [PlantRelationshipIssue] = []
    var antagonistPairs: [PlantRelationshipIssue] = []
    var spacingIssueCounts: [UUID: Int] = [:]
    var companionPairCount = 0
    var antagonistPairCount = 0
    var markerStatuses: [UUID: DesignMarkerStatus] = [:]

    for i in placements.indices {
        for j in placements.indices where j > i {
            let first = placements[i]
            let second = placements[j]

            let firstPlant = plantsByID[first.wikiEntryId]
            let secondPlant = plantsByID[second.wikiEntryId]

            let spacingA = recommendedSpacingFeet(for: firstPlant, from: wikiEntries)
            let spacingB = recommendedSpacingFeet(for: secondPlant, from: wikiEntries)
            let required = max(spacingA, spacingB)

            let dx = (first.x - second.x) * width
            let dy = (first.y - second.y) * length
            let distance = sqrt((dx * dx) + (dy * dy))

            if distance < required {
                spacingIssues.append(
                    SpacingIssue(
                        firstPlacedPlantID: first.id,
                        secondPlacedPlantID: second.id,
                        firstName: first.name,
                        secondName: second.name,
                        requiredFeet: required,
                        actualFeet: distance
                    )
                )
                spacingIssueCounts[first.id, default: 0] += 1
                spacingIssueCounts[second.id, default: 0] += 1
                markerStatuses[first.id] = .spacingConflict
                markerStatuses[second.id] = .spacingConflict
            }

            switch companionRelationship(
                firstPlant: firstPlant,
                firstFallbackName: first.name,
                secondPlant: secondPlant,
                secondFallbackName: second.name,
                wikiEntries: wikiEntries
            ) {
            case .companion:
                companionPairCount += 1
                companionPairs.append(
                    PlantRelationshipIssue(
                        firstPlacedPlantID: first.id,
                        secondPlacedPlantID: second.id,
                        firstName: first.name,
                        secondName: second.name
                    )
                )
                if markerStatuses[first.id] != .spacingConflict {
                    markerStatuses[first.id] = .companionGood
                }
                if markerStatuses[second.id] != .spacingConflict {
                    markerStatuses[second.id] = .companionGood
                }
            case .antagonist:
                antagonistPairCount += 1
                antagonistPairs.append(
                    PlantRelationshipIssue(
                        firstPlacedPlantID: first.id,
                        secondPlacedPlantID: second.id,
                        firstName: first.name,
                        secondName: second.name
                    )
                )
                if markerStatuses[first.id] != .spacingConflict {
                    markerStatuses[first.id] = .companionBad
                }
                if markerStatuses[second.id] != .spacingConflict {
                    markerStatuses[second.id] = .companionBad
                }
            case .neutral:
                break
            }
        }
    }

    return DesignInsights(
        spacingIssues: spacingIssues,
        companionPairs: companionPairs,
        antagonistPairs: antagonistPairs,
        spacingIssueCounts: spacingIssueCounts,
        companionPairCount: companionPairCount,
        antagonistPairCount: antagonistPairCount,
        markerStatuses: markerStatuses,
        spacingConflictPlantIDs: Set(spacingIssues.flatMap { [$0.firstPlacedPlantID, $0.secondPlacedPlantID] })
    )
}

enum CompanionRelationship: Equatable {
    case companion
    case antagonist
    case neutral
}

func companionRelationship(
    firstPlant: Plant?,
    firstFallbackName: String,
    secondPlant: Plant?,
    secondFallbackName: String,
    wikiEntries: [WikiEntry]
) -> CompanionRelationship {
    let firstWiki = matchedWikiEntry(for: firstPlant, fallbackName: firstFallbackName, wikiEntries: wikiEntries)
    let secondWiki = matchedWikiEntry(for: secondPlant, fallbackName: secondFallbackName, wikiEntries: wikiEntries)

    let firstNames = plantNameSet(plant: firstPlant, fallbackName: firstFallbackName, wiki: firstWiki)
    let secondNames = plantNameSet(plant: secondPlant, fallbackName: secondFallbackName, wiki: secondWiki)

    let firstCompanions = Set((firstWiki?.companionPlantsArray ?? []).map(normalizePlantName))
    let firstAntagonists = Set((firstWiki?.antagonistPlantsArray ?? []).map(normalizePlantName))
    let secondCompanions = Set((secondWiki?.companionPlantsArray ?? []).map(normalizePlantName))
    let secondAntagonists = Set((secondWiki?.antagonistPlantsArray ?? []).map(normalizePlantName))

    if !firstAntagonists.intersection(secondNames).isEmpty || !secondAntagonists.intersection(firstNames).isEmpty {
        return .antagonist
    }

    if !firstCompanions.intersection(secondNames).isEmpty || !secondCompanions.intersection(firstNames).isEmpty {
        return .companion
    }

    return .neutral
}

private func plantNameSet(plant: Plant?, fallbackName: String, wiki: WikiEntry?) -> Set<String> {
    var names: Set<String> = [normalizePlantName(fallbackName)]
    if let plantName = plant?.name, !plantName.isEmpty {
        names.insert(normalizePlantName(plantName))
    }
    if let species = plant?.species, !species.isEmpty {
        names.insert(normalizePlantName(species))
    }
    if let common = wiki?.commonName {
        names.insert(normalizePlantName(common))
    }
    if let scientific = wiki?.scientificName, !scientific.isEmpty {
        names.insert(normalizePlantName(scientific))
    }
    return names
}

private func matchedWikiEntry(for plant: Plant?, fallbackName: String, wikiEntries: [WikiEntry]) -> WikiEntry? {
    let targetNames = plantNameSet(plant: plant, fallbackName: fallbackName, wiki: nil)
    return wikiEntries.first { entry in
        let common = normalizePlantName(entry.commonName)
        let scientific = normalizePlantName(entry.scientificName ?? "")
        return targetNames.contains(common) || (!scientific.isEmpty && targetNames.contains(scientific))
    }
}

func recommendedSpacingFeet(for plant: Plant?, from wikiEntries: [WikiEntry]) -> Double {
    guard let plant else { return 1.5 }
    if let overrideFeet = plant.spacingOverrideFeetValue {
        return overrideFeet
    }
    guard let wiki = matchedWikiEntry(for: plant, fallbackName: plant.name, wikiEntries: wikiEntries) else { return 1.5 }
    return parseSpacingFeet(wiki.spacing) ?? 1.5
}

func parseSpacingFeet(_ spacing: String?) -> Double? {
    guard let spacing else { return nil }
    let lower = spacing.lowercased()
    let numericTokens = lower.split { character in
        !(character.isNumber || character == ".")
    }
    let values = numericTokens.compactMap { Double($0) }
    guard let maxValue = values.max() else { return nil }
    if lower.contains("ft") || lower.contains("feet") || lower.contains("foot") {
        return maxValue
    }
    return maxValue / 12.0
}

func normalizePlantName(_ name: String) -> String {
    let lowered = name.lowercased().trimmingCharacters(in: .whitespacesAndNewlines)
    let scalars = lowered.unicodeScalars.map { scalar -> Character in
        CharacterSet.alphanumerics.contains(scalar) ? Character(scalar) : " "
    }
    return String(scalars).split(separator: " ").joined(separator: " ")
}

private struct DesignInsightsSection: View {
    let insights: DesignInsights
    let onFocusPair: (UUID, UUID) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("Layout Insights")
                .font(.patchTitle3)
                .foregroundColor(.patchText)

            HStack(spacing: AppTheme.Spacing.md) {
                StatCard(
                    title: "Spacing",
                    value: "\(insights.spacingIssues.count)",
                    icon: "exclamationmark.triangle.fill",
                    color: insights.spacingIssues.isEmpty ? .healthGood : .healthCritical
                )

                StatCard(
                    title: "Companion",
                    value: "\(insights.companionPairCount)",
                    icon: "checkmark.circle.fill",
                    color: .healthGood
                )

                StatCard(
                    title: "Antagonist",
                    value: "\(insights.antagonistPairCount)",
                    icon: "xmark.circle.fill",
                    color: insights.antagonistPairCount > 0 ? .healthCritical : .patchTextTertiary
                )
            }

            if insights.spacingIssues.isEmpty && insights.companionPairs.isEmpty && insights.antagonistPairs.isEmpty {
                Text("No pair issues detected. Keep plants distributed as you add more placements.")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)
                    .padding(.top, AppTheme.Spacing.xxs)
            }

            if !insights.spacingIssues.isEmpty {
                pairSection(title: "Spacing Conflicts (\(insights.spacingIssues.count))") {
                    ForEach(insights.spacingIssues) { issue in
                        pairRow(
                            title: "\(issue.firstName) ↔ \(issue.secondName)",
                            subtitle: "\(String(format: "%.1f", issue.actualFeet)) ft apart • need \(String(format: "%.1f", issue.requiredFeet)) ft"
                        ) {
                            onFocusPair(issue.firstPlacedPlantID, issue.secondPlacedPlantID)
                        }
                    }
                }
            }

            if !insights.antagonistPairs.isEmpty {
                pairSection(title: "Antagonist Pairs (\(insights.antagonistPairs.count))") {
                    ForEach(insights.antagonistPairs) { pair in
                        pairRow(
                            title: "\(pair.firstName) ↔ \(pair.secondName)",
                            subtitle: "Antagonistic pairing nearby"
                        ) {
                            onFocusPair(pair.firstPlacedPlantID, pair.secondPlacedPlantID)
                        }
                    }
                }
            }

            if !insights.companionPairs.isEmpty {
                pairSection(title: "Companion Pairs (\(insights.companionPairs.count))") {
                    ForEach(insights.companionPairs) { pair in
                        pairRow(
                            title: "\(pair.firstName) ↔ \(pair.secondName)",
                            subtitle: "Companion-friendly placement nearby"
                        ) {
                            onFocusPair(pair.firstPlacedPlantID, pair.secondPlacedPlantID)
                        }
                    }
                }
            }
        }
    }

    private func pairSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            Text(title)
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
                .padding(.top, AppTheme.Spacing.xxs)
            content()
        }
    }

    private func pairRow(title: String, subtitle: String, onTap: @escaping () -> Void) -> some View {
        Button(action: onTap) {
            HStack(spacing: AppTheme.Spacing.sm) {
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.patchBodyBold)
                        .foregroundColor(.patchText)
                    Text(subtitle)
                        .font(.patchCaption2)
                        .foregroundColor(.patchTextSecondary)
                }
                Spacer()
                Image(systemName: "scope")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextTertiary)
            }
            .padding(AppTheme.Spacing.sm)
            .background(Color.white.opacity(0.82))
            .cornerRadius(AppTheme.CornerRadius.md)
        }
        .buttonStyle(.plain)
    }
}

private struct DesignToggleSection: View {
    @Binding var canvasState: CanvasState

    var body: some View {
        VStack(spacing: AppTheme.Spacing.sm) {
            PatchToggle(
                "Show grid",
                description: "Display reference lines for layout alignment",
                isOn: $canvasState.showGrid
            )

            PatchToggle(
                "Show spacing radius",
                description: "Visualize each plant's spacing buffer",
                isOn: $canvasState.showSpacing
            )

            PatchToggle(
                "Companion highlighting",
                description: "Color placements to show companion mode",
                isOn: $canvasState.showCompanions
            )
        }
    }
}

private struct DesignPaletteSection: View {
    let plants: [Plant]
    let placedPlantIDs: Set<UUID>
    let onAddPlant: (Plant) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("Garden Plants")
                .font(.patchTitle3)
                .foregroundColor(.patchText)

            if plants.isEmpty {
                Text("This garden has no plants yet. Add plants in the Tracker tab to place them here.")
                    .font(.patchSubheadline)
                    .foregroundColor(.patchTextSecondary)
                    .cardStyle()
            } else {
                ForEach(plants) { plant in
                    HStack(spacing: AppTheme.Spacing.md) {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                            Text(plant.name)
                                .font(.patchBodyBold)
                                .foregroundColor(.patchText)

                            if let species = plant.species, !species.isEmpty {
                                Text(species)
                                    .font(.patchCaption1)
                                    .foregroundColor(.patchTextSecondary)
                            }
                        }

                        Spacer()

                        SecondaryButton(
                            placedPlantIDs.contains(plant.id) ? "Add Another" : "Add",
                            icon: "plus"
                        ) {
                            onAddPlant(plant)
                        }
                        .frame(maxWidth: 130)
                    }
                    .cardStyle(padding: AppTheme.Spacing.md)
                }
            }
        }
    }
}

private struct DesignEditorCanvas: View {
    @Binding var canvasState: CanvasState
    @Binding var selectedPlacedPlantID: UUID?
    @Binding var focusedPlantPairIDs: Set<UUID>
    let markerStatuses: [UUID: DesignMarkerStatus]
    let spacingConflictPlantIDs: Set<UUID>

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("Layout Canvas")
                .font(.patchTitle3)
                .foregroundColor(.patchText)

            GeometryReader { proxy in
                ZStack {
                    RoundedRectangle(cornerRadius: AppTheme.CornerRadius.xl)
                        .fill(Color.white.opacity(0.92))

                    if canvasState.showGrid {
                        GridOverlay(gridSize: max(8, canvasState.gridSize))
                            .clipShape(RoundedRectangle(cornerRadius: AppTheme.CornerRadius.xl))
                    }

                    ForEach(canvasState.plants) { placedPlant in
                        let markerPosition = position(for: placedPlant, in: proxy.size)

                        ZStack {
                            if canvasState.showSpacing {
                                Circle()
                                    .stroke(
                                        spacingConflictPlantIDs.contains(placedPlant.id)
                                        ? Color.healthCritical.opacity(0.45)
                                        : Color.patchPrimary.opacity(0.28),
                                        lineWidth: 1
                                    )
                                    .frame(width: spacingConflictPlantIDs.contains(placedPlant.id) ? 84 : 70, height: spacingConflictPlantIDs.contains(placedPlant.id) ? 84 : 70)
                            }

                            Text(String(placedPlant.name.prefix(1)).uppercased())
                                .font(.patchBodyBold)
                                .foregroundColor(markerTextColor)
                                .frame(width: 36, height: 36)
                                .background(markerBackground(for: placedPlant.id))
                                .clipShape(Circle())
                                .overlay(
                                    Circle()
                                        .stroke(
                                            markerStrokeColor(for: placedPlant.id),
                                            lineWidth: markerStrokeWidth(for: placedPlant.id)
                                        )
                                )
                        }
                        .position(markerPosition)
                        .gesture(
                            DragGesture(minimumDistance: 0)
                                .onChanged { value in
                                    updatePosition(
                                        plantID: placedPlant.id,
                                        location: value.location,
                                        size: proxy.size
                                    )
                                    selectedPlacedPlantID = placedPlant.id
                                    focusedPlantPairIDs = []
                                }
                        )
                        .onTapGesture {
                            selectedPlacedPlantID = placedPlant.id
                            focusedPlantPairIDs = []
                        }
                    }
                }
                .overlay(
                    RoundedRectangle(cornerRadius: AppTheme.CornerRadius.xl)
                        .stroke(Color.patchBackgroundTertiary.opacity(0.8), lineWidth: 1)
                )
            }
            .frame(height: 360)
            .shadow(AppTheme.Shadow.sm)
        }
    }

    private var markerTextColor: Color {
        if canvasState.showCompanions {
            return .white
        }
        return .patchPrimary
    }

    private func markerBackground(for plantID: UUID) -> Color {
        if canvasState.showCompanions {
            switch markerStatuses[plantID] ?? .normal {
            case .spacingConflict:
                return .healthCritical
            case .companionGood:
                return .healthGood
            case .companionBad:
                return .healthCritical
            case .normal:
                return selectedPlacedPlantID == plantID ? .patchSecondary : .patchPrimary
            }
        }
        return Color.patchPrimary.opacity(0.16)
    }

    private func markerStrokeColor(for plantID: UUID) -> Color {
        if focusedPlantPairIDs.contains(plantID) {
            return .patchPrimary
        }
        if selectedPlacedPlantID == plantID {
            return .patchSecondary
        }
        return .clear
    }

    private func markerStrokeWidth(for plantID: UUID) -> CGFloat {
        focusedPlantPairIDs.contains(plantID) ? 3 : 2
    }

    private func position(for placedPlant: PlacedPlant, in size: CGSize) -> CGPoint {
        CGPoint(
            x: CGFloat(placedPlant.x) * max(size.width, 1),
            y: CGFloat(placedPlant.y) * max(size.height, 1)
        )
    }

    private func updatePosition(plantID: UUID, location: CGPoint, size: CGSize) {
        guard let index = canvasState.plants.firstIndex(where: { $0.id == plantID }) else {
            return
        }

        let normalizedX = min(max(0.05, location.x / max(size.width, 1)), 0.95)
        let normalizedY = min(max(0.05, location.y / max(size.height, 1)), 0.95)

        canvasState.plants[index].x = normalizedX
        canvasState.plants[index].y = normalizedY
    }
}

private struct GridOverlay: View {
    let gridSize: Double

    var body: some View {
        Canvas { context, size in
            let spacing = CGFloat(gridSize)

            var path = Path()

            var x: CGFloat = 0
            while x <= size.width {
                path.move(to: CGPoint(x: x, y: 0))
                path.addLine(to: CGPoint(x: x, y: size.height))
                x += spacing
            }

            var y: CGFloat = 0
            while y <= size.height {
                path.move(to: CGPoint(x: 0, y: y))
                path.addLine(to: CGPoint(x: size.width, y: y))
                y += spacing
            }

            context.stroke(path, with: .color(Color.patchBackgroundTertiary.opacity(0.7)), lineWidth: 0.6)
        }
    }
}

#Preview {
    MainTabView()
        .environment(\.managedObjectContext, PersistenceController.preview.container.viewContext)
}
