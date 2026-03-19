import SwiftUI

struct EditPlantView: View {
    @Environment(\.dismiss) private var dismiss

    let onSave: () -> Void
    @StateObject private var viewModel: EditPlantViewModel
    @State private var showGardenPicker: Bool = false

    init(plant: Plant, onSave: @escaping () -> Void) {
        self.onSave = onSave
        _viewModel = StateObject(wrappedValue: EditPlantViewModel(plant: plant))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                    
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(title: "Basic Info", subtitle: "Update your plant's name and details.")

                        PatchTextField(
                            "Plant Name",
                            text: $viewModel.name,
                            placeholder: "e.g., Tomato",
                            error: viewModel.nameError,
                            isRequired: true
                        )

                        PatchTextField("Species", text: $viewModel.species, placeholder: "e.g., Solanum lycopersicum")
                        PatchTextField("Variety", text: $viewModel.variety, placeholder: "e.g., Roma")
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(title: "Location", subtitle: "Update garden connection or specific placement notes.")
                        
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
                        formSectionHeader(title: "Status", subtitle: "Update health and growth stage.")

                        HealthStatusPicker(selection: $viewModel.healthStatus)
                        GrowthStagePicker(selection: $viewModel.growthStage)
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(title: "Details", subtitle: "Adjust planting date and spacing.")

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
                            
                            Text("Optional. Used in layout spacing insights.")
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
                        formSectionHeader(title: "Notes", subtitle: "Any additional notes for this plant.")
                        PatchTextEditor("Notes", text: $viewModel.notes, placeholder: "Add any additional notes...")
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                }
                .padding(AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xxl)
            }
            .screenBackgroundStyle()
            .navigationTitle("Edit Plant")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(!viewModel.isValid || viewModel.isSaving)
                }
            }
            .sheet(isPresented: $showGardenPicker) {
                GardenPickerSheet(selectedGarden: $viewModel.selectedGarden)
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

    private func save() {
        guard viewModel.save() else { return }
        onSave()
        dismiss()
    }
}

@MainActor
final class EditPlantViewModel: ObservableObject {
    @Published var name: String
    @Published var species: String
    @Published var variety: String
    @Published var plantingDate: Date
    @Published var location: String
    @Published var healthStatus: Plant.HealthStatus
    @Published var growthStage: Plant.GrowthStage
    @Published var selectedGarden: Garden?
    @Published var notes: String
    @Published var spacingOverride: String
    @Published var spacingOverrideUnit: AddPlantViewModel.SpacingOverrideUnit
    @Published var isSaving: Bool = false
    @Published var nameError: String?

    private let plant: Plant
    private let repository: any PlantDetailPlantRepository

    init(
        plant: Plant,
        repository: any PlantDetailPlantRepository = PlantRepository()
    ) {
        self.plant = plant
        self.repository = repository
        self.name = plant.name
        self.species = plant.species ?? ""
        self.variety = plant.variety ?? ""
        self.plantingDate = plant.plantingDate ?? Date()
        self.location = plant.location ?? ""
        self.healthStatus = Plant.HealthStatus(rawValue: plant.healthStatus) ?? .good
        self.growthStage = Plant.GrowthStage(rawValue: plant.growthStage) ?? .seedling
        self.selectedGarden = plant.garden
        self.notes = plant.notes ?? ""
        if let spacingFeet = plant.spacingOverrideFeetValue {
            self.spacingOverride = String(format: "%.2f", spacingFeet)
            self.spacingOverrideUnit = .feet
        } else {
            self.spacingOverride = ""
            self.spacingOverrideUnit = .feet
        }
    }

    var isValid: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    func save() -> Bool {
        guard validate() else { return false }

        isSaving = true
        repository.update(
            plant,
            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
            species: species.isEmpty ? nil : species,
            variety: variety.isEmpty ? nil : variety,
            plantingDate: plantingDate,
            location: location.isEmpty ? nil : location,
            spacingOverrideFeet: parsedSpacingOverrideFeet,
            healthStatus: healthStatus,
            growthStage: growthStage,
            notes: notes.isEmpty ? nil : notes,
            garden: selectedGarden
        )
        isSaving = false
        return true
    }

    private func validate() -> Bool {
        nameError = nil
        if name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            nameError = "Plant name is required"
            return false
        }
        return true
    }

    private var parsedSpacingOverrideFeet: Double? {
        let trimmed = spacingOverride.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, let value = Double(trimmed), value > 0 else { return nil }
        switch spacingOverrideUnit {
        case .feet: return value
        case .inches: return value / 12.0
        }
    }
}
