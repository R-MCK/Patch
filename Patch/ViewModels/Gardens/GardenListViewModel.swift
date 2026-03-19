import Foundation
import CoreData
import Combine

@MainActor
final class GardenListViewModel: ObservableObject {

    @Published var gardens: [Garden] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let repository: GardenRepository

    init(repository: GardenRepository? = nil) {
        self.repository = repository ?? GardenRepository()
    }

    func loadGardens() {
        isLoading = true
        errorMessage = nil

        gardens = repository.fetchAll()
        isLoading = false
    }

    func refresh() async {
        isLoading = true
        gardens = repository.fetchAll()
        isLoading = false
    }

    func deleteGardens(at offsets: IndexSet) {
        for index in offsets {
            let garden = gardens[index]
            repository.delete(garden)
        }
        loadGardens()
    }

    func deleteGarden(_ garden: Garden) {
        repository.delete(garden)
        loadGardens()
    }
}