import Foundation
import CoreData
import Combine

@MainActor
final class AddPlantViewModel: ObservableObject {
    @Published var name: String = ""
    @Published var species: String = ""
    @Published var variety: String = ""
    @Published var plantingDate: Date = Date()
    @Published var location: String = ""
    @Published var healthStatus: Plant.HealthStatus = .good
    @Published var growthStage: Plant.GrowthStage = .seedling
    @Published var selectedGarden: Garden?
    @Published var notes: String = ""
    @Published var spacingOverride: String = ""
    @Published var spacingOverrideUnit: SpacingOverrideUnit = .feet

    @Published var nameError: String?
    @Published var isSaving: Bool = false
    @Published var selectedWikiEntry: WikiEntry?

    @Published var availableGardens: [Garden] = []
    @Published var wikiSuggestions: [WikiEntry] = []

    private let repository: PlantRepository
    private let gardenRepository: GardenRepository
    private let wikiRepository: WikiRepository
    private var cancellables = Set<AnyCancellable>()

    init(
        repository: PlantRepository? = nil,
        gardenRepository: GardenRepository? = nil,
        wikiRepository: WikiRepository? = nil
    ) {
        self.repository = repository ?? PlantRepository()
        self.gardenRepository = gardenRepository ?? GardenRepository()
        self.wikiRepository = wikiRepository ?? WikiRepository()
        loadGardens()
        setupWikiSuggestions()
    }

    private func loadGardens() {
        availableGardens = gardenRepository.fetchAll()
    }

    private func setupWikiSuggestions() {
        $name
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .removeDuplicates()
            .sink { [weak self] query in
                guard let self = self else { return }
                if query.trimmingCharacters(in: .whitespacesAndNewlines).count >= 2 {
                    self.wikiSuggestions = self.wikiRepository.search(query: query)
                } else {
                    self.wikiSuggestions = []
                }
            }
            .store(in: &cancellables)
    }

    var isValid: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    func validate() -> Bool {
        nameError = nil

        if name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
            nameError = "Plant name is required"
            return false
        }

        return true
    }

    func save(completion: @escaping (Result<Plant, Error>) -> Void) {
        guard validate() else {
            completion(.failure(ValidationError.invalidName))
            return
        }

        isSaving = true

        let plant = repository.create(
            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
            species: species.isEmpty ? nil : species,
            variety: variety.isEmpty ? nil : variety,
            plantingDate: plantingDate,
            location: location.isEmpty ? nil : location,
            spacingOverrideFeet: spacingOverrideFeet,
            healthStatus: healthStatus,
            growthStage: growthStage,
            notes: notes.isEmpty ? nil : notes,
            garden: selectedGarden
        )

        isSaving = false
        completion(.success(plant))
    }

    enum ValidationError: LocalizedError {
        case invalidName

        var errorDescription: String? {
            switch self {
            case .invalidName:
                return "Please enter a valid plant name"
            }
        }
    }

    enum SpacingOverrideUnit: String, CaseIterable, Identifiable {
        case feet
        case inches

        var id: String { rawValue }

        var label: String {
            switch self {
            case .feet: return "ft"
            case .inches: return "in"
            }
        }
    }

    var spacingOverrideFeet: Double? {
        let trimmed = spacingOverride.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty, let value = Double(trimmed), value > 0 else {
            return nil
        }
        switch spacingOverrideUnit {
        case .feet:
            return value
        case .inches:
            return value / 12.0
        }
    }
}
