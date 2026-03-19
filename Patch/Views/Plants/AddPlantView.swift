import SwiftUI

struct AddPlantView: View {
    @StateObject private var viewModel = AddPlantViewModel()
    @Environment(\.dismiss) private var dismiss

    let onSave: ((Plant) -> Void)?
    let wikiEntry: WikiEntry?

    @State private var showGardenPicker = false
    @FocusState private var isNameFocused: Bool

    init(onSave: ((Plant) -> Void)? = nil, wikiEntry: WikiEntry? = nil) {
        self.onSave = onSave
        self.wikiEntry = wikiEntry
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                    AddPlantHeaderCard(wikiEntry: wikiEntry)
                    AddPlantProgressCard(
                        isReadyToSave: viewModel.isValid,
                        selectedGardenName: viewModel.selectedGarden?.name
                    )

                    if let wiki = wikiEntry {
                        WikiEntryReferenceCard(wikiEntry: wiki)
                            .cardStyle(padding: AppTheme.Spacing.md)
                    }

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(
                            title: "Basic Info",
                            subtitle: "Name your plant and capture optional species details."
                        )

                        PatchTextField(
                            "Plant Name",
                            text: $viewModel.name,
                            placeholder: "e.g., Tomato",
                            error: viewModel.nameError,
                            isRequired: true
                        )
                        .focused($isNameFocused)

                        if wikiEntry == nil && isNameFocused && !viewModel.wikiSuggestions.isEmpty {
                            VStack(spacing: 0) {
                                ForEach(viewModel.wikiSuggestions, id: \.id) { suggestion in
                                    Button {
                                        prefillFromWiki(suggestion)
                                        viewModel.wikiSuggestions = []
                                        isNameFocused = false
                                    } label: {
                                        HStack {
                                            VStack(alignment: .leading, spacing: 2) {
                                                Text(suggestion.commonName ?? "")
                                                    .font(.patchBody)
                                                    .foregroundColor(.patchText)
                                                
                                                if let scientific = suggestion.scientificName, !scientific.isEmpty {
                                                    Text(scientific)
                                                        .font(.patchCaption1)
                                                        .foregroundColor(.patchTextSecondary)
                                                        .italic()
                                                }
                                            }
                                            Spacer()
                                            Image(systemName: "arrow.up.left.circle")
                                                .foregroundColor(.patchPrimary.opacity(0.6))
                                        }
                                        .padding(.vertical, AppTheme.Spacing.sm)
                                        .padding(.horizontal, AppTheme.Spacing.md)
                                        .contentShape(Rectangle())
                                    }
                                    .buttonStyle(.plain)

                                    if suggestion.id != viewModel.wikiSuggestions.last?.id {
                                        Divider()
                                            .padding(.horizontal, AppTheme.Spacing.md)
                                    }
                                }
                            }
                            .background(Color.white)
                            .cornerRadius(AppTheme.CornerRadius.md)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                                    .stroke(Color.patchBackgroundTertiary, lineWidth: 1)
                            )
                            .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
                            .padding(.bottom, AppTheme.Spacing.sm)
                        }

                        if let filledWiki = viewModel.selectedWikiEntry {
                            HStack(spacing: AppTheme.Spacing.xs) {
                                Image(systemName: "checkmark.circle.fill")
                                    .foregroundColor(.patchPrimary)
                                    .font(.patchCaption1)
                                Text("Filled from wiki: \(filledWiki.commonName)")
                                    .font(.patchCaption1)
                                    .foregroundColor(.patchPrimary)
                                Spacer()
                                Button {
                                    viewModel.selectedWikiEntry = nil
                                } label: {
                                    Image(systemName: "xmark")
                                        .font(.system(size: 10, weight: .semibold))
                                        .foregroundColor(.patchTextSecondary)
                                }
                            }
                            .padding(.horizontal, AppTheme.Spacing.md)
                            .padding(.vertical, AppTheme.Spacing.xs)
                            .background(Color.patchPrimary.opacity(0.08))
                            .cornerRadius(AppTheme.CornerRadius.sm)
                        }

                        PatchTextField("Species", text: $viewModel.species, placeholder: "e.g., Solanum lycopersicum")
                        PatchTextField("Variety", text: $viewModel.variety, placeholder: "e.g., Roma")
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(
                            title: "Location",
                            subtitle: "Attach this plant to a garden to keep organization tidy."
                        )

                        Button {
                            showGardenPicker = true
                        } label: {
                            HStack {
                                VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                                    Text("Garden")
                                        .font(.patchCaption1)
                                        .foregroundColor(.patchTextSecondary)

                                    Text(viewModel.selectedGarden?.name ?? "Choose a garden")
                                        .font(.patchBody)
                                        .foregroundColor(.patchText)
                                }

                                Spacer()

                                Image(systemName: "chevron.right")
                                    .font(.patchCaption1)
                                    .foregroundColor(.patchTextTertiary)
                            }
                            .padding(AppTheme.Spacing.md)
                            .background(Color.white.opacity(0.88))
                            .cornerRadius(AppTheme.CornerRadius.md)
                            .overlay(
                                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                                    .stroke(Color.patchBackgroundTertiary.opacity(0.7), lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)

                        PatchTextField("Location Notes", text: $viewModel.location, placeholder: "e.g., East bed, near fence")
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(
                            title: "Status",
                            subtitle: "Set health and growth stage to improve care context."
                        )

                        HealthStatusPicker(selection: $viewModel.healthStatus)
                        GrowthStagePicker(selection: $viewModel.growthStage)
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(
                            title: "Details",
                            subtitle: "Use planting date to keep timeline tracking accurate."
                        )

                        PatchDatePicker("Planting Date", date: $viewModel.plantingDate)

                        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                            PatchTextField(
                                "Spacing Override",
                                text: $viewModel.spacingOverride,
                                placeholder: "e.g., 18 or 2"
                            )
                            Picker("Spacing Unit", selection: $viewModel.spacingOverrideUnit) {
                                ForEach(AddPlantViewModel.SpacingOverrideUnit.allCases) { unit in
                                    Text(unit.label).tag(unit)
                                }
                            }
                            .pickerStyle(.segmented)

                            Text("Optional. Used in layout spacing insights before wiki defaults.")
                                .font(.patchCaption2)
                                .foregroundColor(.patchTextSecondary)
                        }
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(
                            title: "Notes",
                            subtitle: "Optional care reminders, observations, or wiki info."
                        )

                        ZStack(alignment: .topLeading) {
                            if viewModel.notes.isEmpty {
                                Text("e.g., Water deeply twice a week...")
                                    .font(.patchBody)
                                    .foregroundColor(.patchTextTertiary)
                                    .padding(.top, 8)
                                    .padding(.leading, 4)
                                    .allowsHitTesting(false)
                            }
                            TextEditor(text: $viewModel.notes)
                                .font(.patchBody)
                                .foregroundColor(.patchText)
                                .frame(minHeight: 100)
                                .scrollContentBackground(.hidden)
                        }
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    if let wiki = wikiEntry, !wiki.entryDescription.isEmpty {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                            formSectionHeader(
                                title: "From Wiki",
                                subtitle: "Reference summary imported from the selected entry."
                            )
                            Text(wiki.entryDescription)
                                .font(.patchCallout)
                                .foregroundColor(.patchTextSecondary)
                                .lineLimit(4)
                        }
                        .padding(AppTheme.Spacing.lg)
                        .background(.ultraThinMaterial)
                        .background(Color.white.opacity(0.6))
                        .cornerRadius(AppTheme.CornerRadius.xl)
                        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
                    }
                }
                .padding(AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xxl)
            }
            .screenBackgroundStyle()
            .navigationTitle(wikiEntry != nil ? "Add from Wiki" : "Add Plant")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        savePlant()
                    }
                    .disabled(!viewModel.isValid)
                }
            }
            .sheet(isPresented: $showGardenPicker) {
                GardenPickerView(selection: $viewModel.selectedGarden)
            }
            .onAppear {
                if let wiki = wikiEntry {
                    prefillFromWiki(wiki)
                }
            }
        }
    }

    private func formSectionHeader(title: String, subtitle: String) -> some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
            Text(title)
                .font(.patchTitle3)
                .foregroundColor(.patchText)
            Text(subtitle)
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
        }
    }

    private func prefillFromWiki(_ wiki: WikiEntry) {
        viewModel.selectedWikiEntry = wiki
        viewModel.name = wiki.commonName
        viewModel.species = wiki.scientificName ?? ""
        viewModel.growthStage = .seedling
        viewModel.healthStatus = .good
        viewModel.plantingDate = Date()

        // Parse spacing string into numeric override
        if let spacingStr = wiki.spacing {
            let (value, unit) = parseSpacing(spacingStr)
            if let value {
                viewModel.spacingOverride = String(format: value == value.rounded() ? "%.0f" : "%.1f", value)
                viewModel.spacingOverrideUnit = unit
            }
        }

        // Build care guide notes
        var notes = "Added from \(wiki.category)\n\n"
        notes += "Care Guide:\n"
        notes += "- Sunlight: \(wiki.sunlight)\n"
        notes += "- Watering: \(wiki.watering)\n"
        notes += "- Soil: \(wiki.soil)\n"

        if let temp = wiki.temperature {
            notes += "- Temperature: \(temp)\n"
        }
        if let humidity = wiki.humidity {
            notes += "- Humidity: \(humidity)\n"
        }
        if let fertilizing = wiki.fertilizing {
            notes += "- Fertilizing: \(fertilizing)\n"
        }

        var plantingDetails: [String] = []
        if let depth = wiki.plantingDepth { plantingDetails.append("Depth: \(depth)") }
        if let germination = wiki.germinationTime { plantingDetails.append("Germination: \(germination)") }
        if wiki.daysToMaturity > 0 { plantingDetails.append("Days to maturity: \(wiki.daysToMaturity)") }
        if !plantingDetails.isEmpty {
            notes += "\nPlanting:\n"
            plantingDetails.forEach { notes += "- \($0)\n" }
        }

        if let harvest = wiki.harvestInfo {
            notes += "\nHarvest: \(harvest)"
        }

        viewModel.notes = notes
    }

    /// Parses a spacing string like "18 inches", "2 feet", "12-18 inches" into (value, unit).
    /// For ranges, takes the smaller value.
    private func parseSpacing(_ spacing: String) -> (Double?, AddPlantViewModel.SpacingOverrideUnit) {
        let lower = spacing.lowercased()
        let unit: AddPlantViewModel.SpacingOverrideUnit = lower.contains("foot") || lower.contains("feet") || lower.contains(" ft") ? .feet : .inches

        // Extract all numbers (handles ranges like "12-18")
        let pattern = #"(\d+(?:\.\d+)?)"#
        let regex = try? NSRegularExpression(pattern: pattern)
        let range = NSRange(lower.startIndex..., in: lower)
        let matches = regex?.matches(in: lower, range: range) ?? []

        let numbers: [Double] = matches.compactMap { match in
            guard let r = Range(match.range(at: 1), in: lower) else { return nil }
            return Double(lower[r])
        }

        return (numbers.min(), unit)
    }

    private func savePlant() {
        viewModel.save { result in
            guard case .success(let plant) = result else { return }
            onSave?(plant)
            dismiss()
        }
    }
}

struct AddPlantHeaderCard: View {
    let wikiEntry: WikiEntry?

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text(wikiEntry == nil ? "Track a New Plant" : "Import from Wiki")
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)
                Text(wikiEntry == nil ? "Capture key details so care reminders stay accurate." : "Prefilled care data helps you start quickly.")
                    .font(.patchSubheadline)
                    .foregroundColor(.patchTextSecondary)
            }

            Spacer(minLength: 8)

            Image(systemName: wikiEntry == nil ? "leaf.fill" : "book.closed.fill")
                .font(.system(size: 28, weight: .semibold))
                .foregroundColor(.patchPrimary)
                .frame(width: 56, height: 56)
                .background(Color.patchPrimary.opacity(0.1))
                .clipShape(Circle())
        }
        .padding(AppTheme.Spacing.xl)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }
}

struct AddPlantProgressCard: View {
    let isReadyToSave: Bool
    let selectedGardenName: String?

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Label(isReadyToSave ? "Ready to save" : "Needs required fields", systemImage: isReadyToSave ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                .font(.patchCaption1)
                .foregroundColor(isReadyToSave ? .patchPrimary : .patchTextSecondary)

            Spacer()

            Text(selectedGardenName ?? "No garden linked")
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
        }
        .padding(.horizontal, AppTheme.Spacing.md)
        .padding(.vertical, AppTheme.Spacing.sm)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                .stroke(Color.white.opacity(0.8), lineWidth: 0.5)
        )
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

struct GardenPickerView: View {
    @Binding var selection: Garden?
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = GardenPickerViewModel()

    var body: some View {
        NavigationStack {
            List {
                Button {
                    selection = nil
                    dismiss()
                } label: {
                    HStack {
                        Text("No Garden")
                            .foregroundColor(.patchText)
                        Spacer()
                        if selection == nil {
                            Image(systemName: "checkmark")
                                .foregroundColor(.patchPrimary)
                        }
                    }
                }

                ForEach(viewModel.gardens, id: \.self) { garden in
                    Button {
                        selection = garden
                        dismiss()
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(garden.name)
                                    .foregroundColor(.patchText)
                                Text(garden.dimensions)
                                    .font(.patchCaption1)
                                    .foregroundColor(.patchTextSecondary)
                            }
                            Spacer()
                            if selection?.id == garden.id {
                                Image(systemName: "checkmark")
                                    .foregroundColor(.patchPrimary)
                            }
                        }
                    }
                }
            }
            .scrollContentBackground(.hidden)
            .screenBackgroundStyle()
            .navigationTitle("Select Garden")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }
            }
        }
        .onAppear {
            viewModel.loadGardens()
        }
    }
}

struct GardenPickerSheet: View {
    @Binding var selectedGarden: Garden?
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        GardenPickerView(selection: $selectedGarden)
    }
}

@MainActor
final class GardenPickerViewModel: ObservableObject {
    @Published var gardens: [Garden] = []

    private let repository = GardenRepository()

    func loadGardens() {
        gardens = repository.fetchAll()
    }
}

#Preview("Add Plant") {
    AddPlantView()
}

#Preview("Add Plant from Wiki") {
    AddPlantView(wikiEntry: {
        let entry = WikiEntry()
        entry.commonName = "Tomato"
        entry.scientificName = "Solanum lycopersicum"
        entry.category = "Vegetables"
        entry.difficulty = "Easy"
        entry.entryDescription = "Tomatoes are popular garden vegetables."
        entry.sunlight = "Full Sun"
        entry.watering = "Moderate"
        entry.soil = "Well-draining"
        entry.temperature = "65-85°F"
        entry.fertilizing = "Every 2-3 weeks"
        return entry
    }())
}
