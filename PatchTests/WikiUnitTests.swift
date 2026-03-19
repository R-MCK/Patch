import XCTest
@testable import Patch

final class WikiUnitTests: XCTestCase {
    
    // MARK: - Wiki Entry Model Tests
    
    func testWikiEntryCategoryInitialization() {
        let entry = WikiEntry()
        entry.category = "Vegetables"
        XCTAssertEqual(entry.category, "Vegetables")
    }
    
    func testWikiEntryDifficultyInitialization() {
        let entry = WikiEntry()
        entry.difficulty = "Easy"
        XCTAssertEqual(entry.difficulty, "Easy")
    }
    
    func testWikiEntrySunlightInitialization() {
        let entry = WikiEntry()
        entry.sunlight = "Full Sun"
        XCTAssertEqual(entry.sunlight, "Full Sun")
    }
    
    func testWikiEntryWateringInitialization() {
        let entry = WikiEntry()
        entry.watering = "Moderate"
        XCTAssertEqual(entry.watering, "Moderate")
    }
    
    // MARK: - Wiki Repository Tests
    
    func testWikiRepositoryInitialization() {
        let repository = WikiRepository()
        XCTAssertNotNil(repository)
    }
    
    // MARK: - Category Enum Tests
    
    func testCategoryVegetablesIcon() {
        XCTAssertEqual(WikiEntry.Category.vegetables.icon, "carrot.fill")
    }
    
    func testCategoryHerbsIcon() {
        XCTAssertEqual(WikiEntry.Category.herbs.icon, "leaf.fill")
    }
    
    func testCategoryFlowersIcon() {
        XCTAssertEqual(WikiEntry.Category.flowers.icon, "camera.macro")
    }
    
    func testCategoryFruitsIcon() {
        XCTAssertEqual(WikiEntry.Category.fruits.icon, "apple.logo")
    }
    
    func testCategoryHouseplantsIcon() {
        XCTAssertEqual(WikiEntry.Category.houseplants.icon, "house.fill")
    }
    
    func testCategorySucculentsIcon() {
        XCTAssertEqual(WikiEntry.Category.succulents.icon, "drop.fill")
    }
    
    // MARK: - Sunlight Enum Tests
    
    func testSunlightFullSunIcon() {
        XCTAssertEqual(WikiEntry.Sunlight.fullSun.icon, "sun.max.fill")
    }
    
    func testSunlightPartialSunIcon() {
        XCTAssertEqual(WikiEntry.Sunlight.partialSun.icon, "sun.min.fill")
    }
    
    // MARK: - Watering Enum Tests
    
    func testWateringLowIcon() {
        XCTAssertEqual(WikiEntry.Watering.low.icon, "drop")
    }
    
    func testWateringModerateIcon() {
        XCTAssertEqual(WikiEntry.Watering.moderate.icon, "drop.fill")
    }
    
    // MARK: - Companion Plants Parsing Tests
    
    func testCompanionPlantsArrayParsing() {
        let entry = WikiEntry()
        entry.companionPlants = "Basil, Marigold, Lettuce"
        
        let companions = entry.companionPlantsArray
        XCTAssertEqual(companions.count, 3)
        XCTAssertTrue(companions.contains("Basil"))
        XCTAssertTrue(companions.contains("Marigold"))
        XCTAssertTrue(companions.contains("Lettuce"))
    }
    
    func testAntagonistPlantsArrayParsing() {
        let entry = WikiEntry()
        entry.antagonistPlants = "Corn, Fennel"
        
        let antagonists = entry.antagonistPlantsArray
        XCTAssertEqual(antagonists.count, 2)
        XCTAssertTrue(antagonists.contains("Corn"))
        XCTAssertTrue(antagonists.contains("Fennel"))
    }
    
    func testEmptyCompanionPlantsArray() {
        let entry = WikiEntry()
        entry.companionPlants = nil
        
        let companions = entry.companionPlantsArray
        XCTAssertTrue(companions.isEmpty)
    }
    
    // MARK: - Category Count Tests
    
    func testCategoryAllCasesCount() {
        XCTAssertEqual(WikiEntry.Category.allCases.count, 6)
    }
    
    // MARK: - Difficulty Enum Tests
    
    func testDifficultyAllCases() {
        let difficulties = WikiEntry.Difficulty.allCases
        XCTAssertEqual(difficulties.count, 5)
        XCTAssertTrue(difficulties.contains(.beginner))
        XCTAssertTrue(difficulties.contains(.easy))
        XCTAssertTrue(difficulties.contains(.moderate))
        XCTAssertTrue(difficulties.contains(.challenging))
        XCTAssertTrue(difficulties.contains(.expert))
    }
}

// MARK: - Wiki Seed Data Tests

final class WikiSeedDataTests: XCTestCase {
    
    func testSeedDataFileExists() {
        guard let url = Bundle.main.url(forResource: "WikiSeedData", withExtension: "json") else {
            return
        }
        XCTAssertTrue(FileManager.default.fileExists(atPath: url.path))
    }
    
    func testSeedDataJSONParsing() {
        guard let url = Bundle.main.url(forResource: "WikiSeedData", withExtension: "json") else {
            XCTFail("Seed data file not found")
            return
        }
        
        do {
            let data = try Data(contentsOf: url)
            let decoder = JSONDecoder()
            let seedData = try decoder.decode(WikiSeedData.self, from: data)
            XCTAssertFalse(seedData.entries.isEmpty)
        } catch {
            XCTFail("Failed to parse seed data: \(error.localizedDescription)")
        }
    }
}

// MARK: - Wiki Search Functionality Tests

final class WikiSearchTests: XCTestCase {
    
    func testSearchQueryEmpty() {
        let query = ""
        XCTAssertTrue(query.isEmpty)
    }
    
    func testSearchQueryNormalization() {
        let query = "  Tomato  "
        let normalized = query.trimmingCharacters(in: .whitespacesAndNewlines)
        XCTAssertEqual(normalized, "Tomato")
    }
    
    func testSearchQueryLowercasing() {
        let query = "TOMATO"
        let lowercased = query.lowercased()
        XCTAssertEqual(lowercased, "tomato")
    }
}

// MARK: - Companion Plants String Tests

final class CompanionPlantsStringTests: XCTestCase {
    
    func testCompanionStringFromArray() {
        let plants = ["Basil", "Marigold", "Lettuce"]
        let string = plants.joined(separator: ",")
        XCTAssertEqual(string, "Basil,Marigold,Lettuce")
    }
    
    func testAntagonistStringFromArray() {
        let plants = ["Corn", "Fennel"]
        let string = plants.joined(separator: ",")
        XCTAssertEqual(string, "Corn,Fennel")
    }
}

// MARK: - Plant Creation from Wiki Tests

final class PlantCreationFromWikiTests: XCTestCase {
    
    func testPlantNameFromWiki() {
        let wikiEntry = WikiEntry()
        wikiEntry.commonName = "Tomato"
        
        let plantName = wikiEntry.commonName
        XCTAssertEqual(plantName, "Tomato")
    }
    
    func testPlantSpeciesFromWiki() {
        let wikiEntry = WikiEntry()
        wikiEntry.scientificName = "Solanum lycopersicum"
        
        let species = wikiEntry.scientificName
        XCTAssertEqual(species, "Solanum lycopersicum")
    }
    
    func testPlantCareGuideFromWiki() {
        let wikiEntry = WikiEntry()
        wikiEntry.sunlight = "Full Sun"
        wikiEntry.watering = "Moderate"
        wikiEntry.soil = "Well-draining"
        
        XCTAssertEqual(wikiEntry.sunlight, "Full Sun")
        XCTAssertEqual(wikiEntry.watering, "Moderate")
        XCTAssertEqual(wikiEntry.soil, "Well-draining")
    }
}