import Foundation
import Combine

@MainActor
final class WikiCategoryViewModel: ObservableObject {
    
    @Published var entries: [WikiEntry] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    
    private let repository: WikiRepository
    private var cancellables = Set<AnyCancellable>()
    
    init(repository: WikiRepository = WikiRepository()) {
        self.repository = repository
    }
    
    func loadEntries(category: WikiEntry.Category) async {
        isLoading = true
        errorMessage = nil

        entries = repository.fetchByCategory(category)
        isLoading = false
    }
    
    func refresh() async {
        await loadEntries(category: .vegetables)
    }
}
