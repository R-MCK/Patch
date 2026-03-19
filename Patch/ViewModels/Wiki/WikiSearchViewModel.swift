import Foundation
import Combine

@MainActor
final class WikiSearchViewModel: ObservableObject {
    
    @Published var searchQuery: String = ""
    @Published var searchResults: [WikiEntry] = []
    @Published var recentSearches: [String] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var showSuggestions: Bool = false
    @Published var suggestions: [String] = []
    
    private let repository: WikiRepository
    private var cancellables = Set<AnyCancellable>()
    
    init(repository: WikiRepository = WikiRepository()) {
        self.repository = repository
        loadRecentSearches()
    }
    
    func search(query: String) async {
        guard !query.isEmpty else {
            searchResults = repository.fetchAll()
            return
        }
        
        isLoading = true
        errorMessage = nil

        let results = repository.search(query: query)

        searchResults = results
        isLoading = false
        generateSuggestions(for: query)
        addToRecentSearches(query)
    }
    
    private func generateSuggestions(for query: String) {
        guard query.count >= 2 else {
            suggestions = []
            showSuggestions = false
            return
        }
        
        var querySuggestions: [String] = []
        
        let lowercasedQuery = query.lowercased()
        
        for entry in repository.fetchAll() {
            let commonName = entry.commonName.lowercased()
            if commonName.contains(lowercasedQuery) {
                querySuggestions.append(commonName)
            }
            
            if let scientific = entry.scientificName?.lowercased(),
               scientific.contains(lowercasedQuery) {
                querySuggestions.append(scientific)
            }
        }
        
        suggestions = Array(Array(Set(querySuggestions)).sorted().prefix(5))
        showSuggestions = !suggestions.isEmpty
    }
    
    private func addToRecentSearches(_ query: String) {
        recentSearches.insert(query, at: 0)
        if recentSearches.count > 20 {
            recentSearches.removeLast()
        }
        saveRecentSearches()
    }
    
    private func loadRecentSearches() {
        if let saved = UserDefaults.standard.string(forKey: "RecentWikiSearches") {
            recentSearches = saved.components(separatedBy: ",").filter { !$0.isEmpty }
        }
    }
    
    private func saveRecentSearches() {
        UserDefaults.standard.set(recentSearches.joined(separator: ","), forKey: "RecentWikiSearches")
    }
}
