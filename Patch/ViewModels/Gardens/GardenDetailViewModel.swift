import Foundation
import CoreData
import Combine

@MainActor
final class GardenDetailViewModel: ObservableObject {
    @Published var garden: Garden
    @Published var plants: [Plant] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let gardenRepository: any GardenDetailGardenRepository
    private let plantRepository: any PlantDetailPlantRepository

    init(
        garden: Garden,
        gardenRepository: any GardenDetailGardenRepository = GardenRepository(),
        plantRepository: any PlantDetailPlantRepository = PlantRepository()
    ) {
        self.garden = garden
        self.gardenRepository = gardenRepository
        self.plantRepository = plantRepository
        loadPlants()
    }

    func loadPlants() {
        isLoading = true
        plants = plantRepository.fetchByGarden(garden)
        isLoading = false
    }

    func refresh() {
        if let refreshedGarden = gardenRepository.fetchById(garden.id) {
            garden = refreshedGarden
        }
        loadPlants()
    }

    func deleteGarden() {
        gardenRepository.delete(garden)
    }

    func updateGarden(
        name: String? = nil,
        type: Garden.GardenType? = nil,
        width: Double? = nil,
        length: Double? = nil,
        climateZone: String? = nil,
        soilType: Garden.SoilType? = nil
    ) {
        gardenRepository.update(
            garden,
            name: name,
            type: type,
            width: width,
            length: length,
            climateZone: climateZone,
            soilType: soilType
        )
        loadPlants()
    }

    var plantCount: Int {
        plants.count
    }

    var area: Double {
        garden.width * garden.length
    }

    var dimensions: String {
        "\(Int(garden.width))' × \(Int(garden.length))'"
    }
}
