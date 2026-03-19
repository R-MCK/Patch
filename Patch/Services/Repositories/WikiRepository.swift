import Foundation
import CoreData
import Combine

/// Repository for WikiEntry entity CRUD operations
@MainActor
final class WikiRepository: ObservableObject {

    private let context: NSManagedObjectContext

    @Published var entries: [WikiEntry] = []
    @Published var errorMessage: String?

    init(context: NSManagedObjectContext = PersistenceController.shared.container.viewContext) {
        self.context = context
    }

    // MARK: - Fetch Operations

    /// Fetch all wiki entries
    func fetchAll() -> [WikiEntry] {
        let request: NSFetchRequest<WikiEntry> = WikiEntry.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \WikiEntry.commonName, ascending: true)]

        do {
            let results = try context.fetch(request)
            DispatchQueue.main.async {
                self.entries = results
            }
            return results
        } catch {
            print("Error fetching wiki entries: \(error)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Fetch entries by category
    func fetchByCategory(_ category: WikiEntry.Category) -> [WikiEntry] {
        let request: NSFetchRequest<WikiEntry> = WikiEntry.fetchRequest()
        request.predicate = NSPredicate(format: "category == %@", category.rawValue)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \WikiEntry.commonName, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching wiki entries by category: \(error)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Fetch entries by category name string
    func fetchByCategoryName(_ categoryName: String) -> [WikiEntry] {
        let request: NSFetchRequest<WikiEntry> = WikiEntry.fetchRequest()
        request.predicate = NSPredicate(format: "category == %@", categoryName)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \WikiEntry.commonName, ascending: true)]
        
        do {
            return try context.fetch(request)
        } catch {
            print("Error fetching entries by category: \(error)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Fetch entry by ID
    func fetchById(_ id: UUID) -> WikiEntry? {
        let request: NSFetchRequest<WikiEntry> = WikiEntry.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", id as CVarArg)
        request.fetchLimit = 1

        do {
            return try context.fetch(request).first
        } catch {
            print("Error fetching wiki entry by ID: \(error)")
            self.errorMessage = error.localizedDescription
            return nil
        }
    }

    /// Search wiki entries — name matches first, falls back to description if no name hits.
    /// Results are capped at 5 for use in suggestion dropdowns.
    func search(query: String) -> [WikiEntry] {
        guard !query.isEmpty else { return [] }

        // Try name-only first for clean, relevant suggestions
        let nameRequest: NSFetchRequest<WikiEntry> = WikiEntry.fetchRequest()
        nameRequest.predicate = NSPredicate(
            format: "commonName CONTAINS[cd] %@ OR scientificName CONTAINS[cd] %@",
            query, query
        )
        nameRequest.sortDescriptors = [NSSortDescriptor(keyPath: \WikiEntry.commonName, ascending: true)]
        nameRequest.fetchLimit = 5

        do {
            let nameResults = try context.fetch(nameRequest)
            if !nameResults.isEmpty { return nameResults }

            // Fall back to full-text search if no name matches
            let fullRequest: NSFetchRequest<WikiEntry> = WikiEntry.fetchRequest()
            fullRequest.predicate = NSPredicate(
                format: "entryDescription CONTAINS[cd] %@",
                query
            )
            fullRequest.sortDescriptors = [NSSortDescriptor(keyPath: \WikiEntry.commonName, ascending: true)]
            fullRequest.fetchLimit = 5
            return try context.fetch(fullRequest)
        } catch {
            print("Error searching wiki entries: \(error)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Filter by difficulty
    func filterByDifficulty(_ difficulty: WikiEntry.Difficulty) -> [WikiEntry] {
        let request: NSFetchRequest<WikiEntry> = WikiEntry.fetchRequest()
        request.predicate = NSPredicate(format: "difficulty == %@", difficulty.rawValue)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \WikiEntry.commonName, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            print("Error filtering wiki entries by difficulty: \(error)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Filter by sunlight requirement
    func filterBySunlight(_ sunlight: WikiEntry.Sunlight) -> [WikiEntry] {
        let request: NSFetchRequest<WikiEntry> = WikiEntry.fetchRequest()
        request.predicate = NSPredicate(format: "sunlight == %@", sunlight.rawValue)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \WikiEntry.commonName, ascending: true)]

        do {
            return try context.fetch(request)
        } catch {
            print("Error filtering wiki entries by sunlight: \(error)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Get category counts
    func getCategoryCounts() -> [WikiEntry.Category: Int] {
        var counts: [WikiEntry.Category: Int] = [:]

        for category in WikiEntry.Category.allCases {
            let request: NSFetchRequest<WikiEntry> = WikiEntry.fetchRequest()
            request.predicate = NSPredicate(format: "category == %@", category.rawValue)

            do {
                counts[category] = try context.count(for: request)
            } catch {
                counts[category] = 0
            }
        }

        return counts
    }

    // MARK: - Create

    @discardableResult
    func create(
        commonName: String,
        scientificName: String? = nil,
        category: WikiEntry.Category,
        description: String,
        sunlight: WikiEntry.Sunlight,
        watering: WikiEntry.Watering,
        soil: String,
        difficulty: WikiEntry.Difficulty,
        temperature: String? = nil,
        humidity: String? = nil,
        fertilizing: String? = nil,
        spacing: String? = nil,
        plantingDepth: String? = nil,
        germinationTime: String? = nil,
        daysToMaturity: Int16 = 0,
        harvestInfo: String? = nil,
        companionPlants: String? = nil,
        antagonistPlants: String? = nil,
        imageURL: String? = nil,
        isUserContributed: Bool = false
    ) -> WikiEntry {
        let entry = WikiEntry(context: context)

        entry.id = UUID()
        entry.commonName = commonName
        entry.scientificName = scientificName
        entry.category = category.rawValue
        entry.entryDescription = description
        entry.sunlight = sunlight.rawValue
        entry.watering = watering.rawValue
        entry.soil = soil
        entry.difficulty = difficulty.rawValue
        entry.temperature = temperature
        entry.humidity = humidity
        entry.fertilizing = fertilizing
        entry.spacing = spacing
        entry.plantingDepth = plantingDepth
        entry.germinationTime = germinationTime
        entry.daysToMaturity = daysToMaturity
        entry.harvestInfo = harvestInfo
        entry.companionPlants = companionPlants
        entry.antagonistPlants = antagonistPlants
        entry.imageURL = imageURL
        entry.isUserContributed = isUserContributed
        entry.createdAt = Date()
        entry.updatedAt = Date()

        save()
        return entry
    }

    // MARK: - Update

    func update(_ entry: WikiEntry) {
        entry.updatedAt = Date()
        save()
    }

    // MARK: - Delete

    func delete(_ entry: WikiEntry) {
        context.delete(entry)
        save()
    }

    func deleteById(_ id: UUID) {
        if let entry = fetchById(id) {
            delete(entry)
        }
    }

    // MARK: - Save

    private func save() {
        guard context.hasChanges else { return }

        do {
            try context.save()
            _ = fetchAll() // Refresh published entries
        } catch {
            print("Error saving context: \(error)")
            self.errorMessage = error.localizedDescription
        }
    }
}
