import Foundation
import CoreData

/// Service for seeding wiki data on first app launch
final class WikiSeedService {
    
    // MARK: - Singleton
    
    static let shared = WikiSeedService()
    
    private init() {}
    
    // MARK: - Properties
    
    private let context = PersistenceController.shared.container.viewContext
    
    /// Check if wiki data needs to be seeded
    var needsSeeding: Bool {
        let request: NSFetchRequest<WikiEntry> = WikiEntry.fetchRequest()
        request.fetchLimit = 1
        
        do {
            let count = try context.count(for: request)
            return count == 0
        } catch {
            print("Error checking wiki seed status: \(error)")
            return true // Assume we need to seed on error
        }
    }
    
    // MARK: - Public Methods
    
    /// Seed wiki data if not already present
    func seedWikiDataIfNeeded() async {
        guard needsSeeding else {
            print("Wiki data already exists, skipping seeding")
            return
        }
        
        print("Starting wiki data seeding...")
        
        do {
            // Load seed data from JSON
            let seedData = try loadSeedData()
            
            // Create wiki entries from seed data
            try await createWikiEntries(from: seedData)
            
            // Save context
            try context.save()
            
            print("Successfully seeded \(seedData.entries.count) wiki entries")
            
        } catch {
            print("Error seeding wiki data: \(error)")
        }
    }
    
    // MARK: - Private Methods
    
    /// Load seed data from JSON file
    private func loadSeedData() throws -> WikiSeedData {
        guard let url = Bundle.main.url(forResource: "WikiSeedData", withExtension: "json") else {
            throw WikiSeedError.seedFileNotFound
        }
        
        let data = try Data(contentsOf: url)
        return try JSONDecoder().decode(WikiSeedData.self, from: data)
    }
    
    /// Create wiki entries from seed data
    private func createWikiEntries(from seedData: WikiSeedData) async throws {
        let persistenceController = PersistenceController.shared

        for entryData in seedData.entries {
            _ = persistenceController.createWikiEntry(
                commonName: entryData.commonName,
                scientificName: entryData.scientificName,
                category: WikiEntry.Category(rawValue: entryData.category) ?? .vegetables,
                description: entryData.description,
                sunlight: WikiEntry.Sunlight(rawValue: entryData.careGuide.sunlight) ?? .fullSun,
                watering: WikiEntry.Watering(rawValue: entryData.careGuide.watering) ?? .moderate,
                soil: entryData.careGuide.soil,
                difficulty: WikiEntry.Difficulty(rawValue: entryData.difficulty) ?? .easy,
                temperature: entryData.careGuide.temperature,
                humidity: entryData.careGuide.humidity,
                fertilizing: entryData.careGuide.fertilizing,
                spacing: entryData.plantingGuide.spacing,
                plantingDepth: entryData.plantingGuide.plantingDepth,
                germinationTime: entryData.plantingGuide.germinationTime,
                daysToMaturity: Int16(entryData.plantingGuide.daysToMaturity ?? 0),
                harvestInfo: entryData.plantingGuide.harvestInfo,
                companionPlants: entryData.companionPlanting.companionPlants?.joined(separator: ","),
                antagonistPlants: entryData.companionPlanting.antagonistPlants?.joined(separator: ","),
                imageURL: entryData.imageURL,
                isUserContributed: false
            )
            
            print("Created wiki entry: \(entryData.commonName)")
        }
    }
}

// MARK: - Data Models

struct WikiSeedData: Codable {
    let entries: [WikiEntryData]
}

struct WikiEntryData: Codable {
    let commonName: String
    let scientificName: String?
    let category: String
    let description: String
    let difficulty: String
    let careGuide: CareGuideData
    let plantingGuide: PlantingGuideData
    let companionPlanting: CompanionPlantingData
    let imageURL: String?
}

struct CareGuideData: Codable {
    let sunlight: String
    let watering: String
    let soil: String
    let temperature: String
    let humidity: String?
    let fertilizing: String?
}

struct PlantingGuideData: Codable {
    let plantingDepth: String?
    let spacing: String?
    let germinationTime: String?
    let daysToMaturity: Int?
    let harvestInfo: String?
}

struct CompanionPlantingData: Codable {
    let companionPlants: [String]?
    let antagonistPlants: [String]?
}

// MARK: - Error Types

enum WikiSeedError: Error, LocalizedError {
    case seedFileNotFound
    case invalidSeedData
    case seedingFailed(Error)
    
    var errorDescription: String? {
        switch self {
        case .seedFileNotFound:
            return "Wiki seed data file not found"
        case .invalidSeedData:
            return "Invalid wiki seed data format"
        case .seedingFailed(let error):
            return "Failed to seed wiki data: \(error.localizedDescription)"
        }
    }
}
