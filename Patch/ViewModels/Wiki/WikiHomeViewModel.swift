import Foundation
import Combine

@MainActor
final class WikiHomeViewModel: ObservableObject {
    
    @Published var categories: [CategoryInfo] = []
    @Published var featuredEntries: [WikiEntry] = []
    @Published var searchResults: [WikiEntry] = []
    @Published var categoryCounts: [String: Int] = [:]
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository = WikiRepository()
    
    struct CategoryInfo: Identifiable {
        let id = UUID()
        let name: String
        let icon: String
        let color: String
        let rawValue: String
    }
    
    init() {
        setupCategories()
    }
    
    private func setupCategories() {
        categories = [
            CategoryInfo(name: "Vegetables", icon: "carrot.fill", color: "orange", rawValue: "Vegetables"),
            CategoryInfo(name: "Herbs", icon: "leaf.fill", color: "green", rawValue: "Herbs"),
            CategoryInfo(name: "Flowers", icon: "camera.macro", color: "pink", rawValue: "Flowers"),
            CategoryInfo(name: "Fruits", icon: "apple.logo", color: "red", rawValue: "Fruits"),
            CategoryInfo(name: "Houseplants", icon: "house.fill", color: "teal", rawValue: "Houseplants"),
            CategoryInfo(name: "Succulents", icon: "drop.fill", color: "mint", rawValue: "Succulents")
        ]
    }
    
    func loadWikiData() async {
        isLoading = true
        errorMessage = nil

        // Load all entries
        let allEntries = repository.fetchAll()

        // Count entries per category
        var counts: [String: Int] = [:]
        for category in categories {
            counts[category.rawValue] = allEntries.filter { $0.category == category.rawValue }.count
        }

        categoryCounts = counts
        featuredEntries = Array(allEntries.prefix(9))
        isLoading = false
    }
    
    func search(query: String) async {
        guard !query.isEmpty else {
            await MainActor.run {
                searchResults = []
            }
            return
        }
        
        let results = repository.search(query: query)
        
        await MainActor.run {
            self.searchResults = results
        }
    }
    
    func getEntriesForCategory(_ categoryName: String) -> [WikiEntry] {
        return repository.fetchByCategoryName(categoryName)
    }
}
