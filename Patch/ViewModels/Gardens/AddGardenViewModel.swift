import Foundation
import SwiftUI

@MainActor
final class AddGardenViewModel: ObservableObject {
    @Published var name: String = ""
    @Published var gardenType: Garden.GardenType = .raisedBed
    @Published var width: Double = 4.0
    @Published var length: Double = 8.0
    @Published var climateZone: String = ""
    @Published var soilType: Garden.SoilType?

    private let repository: GardenRepository

    init(repository: GardenRepository = GardenRepository()) {
        self.repository = repository
    }
    
    var nameError: String? {
        if name.isEmpty {
            return "Garden name is required"
        }
        return nil
    }
    
    var isValid: Bool {
        !name.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }
    
    func save() -> Garden? {
        guard isValid else { return nil }

        let garden = repository.create(
            name: name.trimmingCharacters(in: .whitespacesAndNewlines),
            type: gardenType,
            width: width,
            length: length,
            climateZone: climateZone.isEmpty ? nil : climateZone,
            soilType: soilType
        )
        
        return garden
    }
}
