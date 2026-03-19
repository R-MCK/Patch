import Foundation
import CoreData
import Combine

@MainActor
final class PlantListViewModel: ObservableObject {

    @Published var plants: [Plant] = []
    @Published var filteredPlants: [Plant] = []
    @Published var searchText: String = ""
    @Published var selectedHealthFilter: Plant.HealthStatus?
    @Published var selectedGrowthFilter: Plant.GrowthStage?
    @Published var selectedGardenFilter: Garden?
    @Published var sortOption: SortOption = .nameAscending
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let repository: PlantRepository
    private var cancellables = Set<AnyCancellable>()

    enum SortOption: String, CaseIterable {
        case nameAscending = "Name (A-Z)"
        case nameDescending = "Name (Z-A)"
        case datePlantedNewest = "Date Planted (Newest)"
        case datePlantedOldest = "Date Planted (Oldest)"
        case healthBest = "Health (Best)"
        case healthWorst = "Health (Worst)"

        var sortDescriptor: NSSortDescriptor {
            switch self {
            case .nameAscending:
                return NSSortDescriptor(keyPath: \Plant.name, ascending: true)
            case .nameDescending:
                return NSSortDescriptor(keyPath: \Plant.name, ascending: false)
            case .datePlantedNewest:
                return NSSortDescriptor(keyPath: \Plant.plantingDate, ascending: false)
            case .datePlantedOldest:
                return NSSortDescriptor(keyPath: \Plant.plantingDate, ascending: true)
            case .healthBest:
                return NSSortDescriptor(keyPath: \Plant.healthStatus, ascending: true)
            case .healthWorst:
                return NSSortDescriptor(keyPath: \Plant.healthStatus, ascending: false)
            }
        }
    }

    init(repository: PlantRepository? = nil) {
        self.repository = repository ?? PlantRepository()
        setupBindings()
    }

    private func setupBindings() {
        repository.$errorMessage.assign(to: &$errorMessage)

        Publishers.CombineLatest4($searchText, $selectedHealthFilter, $selectedGrowthFilter, $selectedGardenFilter)
            .combineLatest($sortOption)
            .debounce(for: .milliseconds(300), scheduler: RunLoop.main)
            .sink { [weak self] filters, sort in
                self?.applyFilters(search: filters.0, health: filters.1, growth: filters.2, garden: filters.3, sort: sort)
            }
            .store(in: &cancellables)
    }

    func loadPlants() {
        isLoading = true
        errorMessage = nil

        plants = repository.fetchAll()
        applyFilters()
        isLoading = false
    }

    func refresh() async {
        isLoading = true
        plants = repository.fetchAll()
        applyFilters()
        isLoading = false
    }

    private func applyFilters(
        search: String? = nil,
        health: Plant.HealthStatus? = nil,
        growth: Plant.GrowthStage? = nil,
        garden: Garden? = nil,
        sort: SortOption? = nil
    ) {
        var result = plants

        if let search = search, !search.isEmpty {
            result = result.filter { plant in
                plant.name.localizedCaseInsensitiveContains(search) ||
                plant.species?.localizedCaseInsensitiveContains(search) == true ||
                plant.variety?.localizedCaseInsensitiveContains(search) == true
            }
        }

        if let health = health {
            result = result.filter { $0.healthStatus == health.rawValue }
        }

        if let growth = growth {
            result = result.filter { $0.growthStage == growth.rawValue }
        }

        if let garden = garden {
            result = result.filter { $0.garden == garden }
        }

        let sortOption = sort ?? sortOption
        result.sort { plant1, plant2 in
            switch sortOption {
            case .nameAscending:
                return plant1.name.localizedCompare(plant2.name) == .orderedAscending
            case .nameDescending:
                return plant1.name.localizedCompare(plant2.name) == .orderedDescending
            case .datePlantedNewest:
                let date1 = plant1.plantingDate ?? Date.distantPast
                let date2 = plant2.plantingDate ?? Date.distantPast
                return date1 > date2
            case .datePlantedOldest:
                let date1 = plant1.plantingDate ?? Date.distantFuture
                let date2 = plant2.plantingDate ?? Date.distantFuture
                return date1 < date2
            case .healthBest:
                return healthRank(plant1.healthStatus) < healthRank(plant2.healthStatus)
            case .healthWorst:
                return healthRank(plant1.healthStatus) > healthRank(plant2.healthStatus)
            }
        }

        filteredPlants = result
    }

    private func healthRank(_ status: String) -> Int {
        switch status {
        case "Excellent": return 0
        case "Good": return 1
        case "Fair": return 2
        case "Poor": return 3
        case "Critical": return 4
        default: return 5
        }
    }

    func clearFilters() {
        searchText = ""
        selectedHealthFilter = nil
        selectedGrowthFilter = nil
        selectedGardenFilter = nil
        sortOption = .nameAscending
    }

    var hasActiveFilters: Bool {
        !searchText.isEmpty ||
        selectedHealthFilter != nil ||
        selectedGrowthFilter != nil ||
        selectedGardenFilter != nil
    }

    var plantCount: Int {
        filteredPlants.count
    }

    func deletePlants(at offsets: IndexSet) {
        for index in offsets {
            let plant = filteredPlants[index]
            repository.delete(plant)
        }
        loadPlants()
    }

    func deletePlant(_ plant: Plant) {
        repository.delete(plant)
        loadPlants()
    }
}
