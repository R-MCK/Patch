import XCTest
import CoreData
@testable import Patch

@MainActor
final class DesignInsightsTests: XCTestCase {
    private var context: NSManagedObjectContext!

    override func setUp() {
        super.setUp()
        context = PersistenceController.shared.container.viewContext
    }

    override func tearDown() {
        context.rollback()
        context = nil
        super.tearDown()
    }

    func testParseSpacingFeetCommonInputs() {
        XCTAssertEqual(parseSpacingFeet("18-24 in"), 2.0, accuracy: 0.0001)
        XCTAssertEqual(parseSpacingFeet("2 ft"), 2.0, accuracy: 0.0001)
        XCTAssertEqual(parseSpacingFeet("12in"), 1.0, accuracy: 0.0001)
        XCTAssertNil(parseSpacingFeet("unknown spacing"))
    }

    func testCompanionAndAntagonistNormalization() {
        let tomato = WikiEntry(context: context)
        tomato.id = UUID()
        tomato.commonName = "Tomato"
        tomato.category = "Vegetables"
        tomato.entryDescription = "Test"
        tomato.sunlight = "Full Sun"
        tomato.watering = "Regular"
        tomato.soil = "Well-draining"
        tomato.difficulty = "Easy"
        tomato.isUserContributed = false
        tomato.createdAt = Date()
        tomato.updatedAt = Date()
        tomato.companionPlants = "basil, marigold"
        tomato.antagonistPlants = "fennel"

        let companionResult = companionRelationship(
            firstPlant: nil,
            firstFallbackName: "  Tomato  ",
            secondPlant: nil,
            secondFallbackName: "BASIL!!",
            wikiEntries: [tomato]
        )
        XCTAssertEqual(companionResult, .companion)

        let antagonistResult = companionRelationship(
            firstPlant: nil,
            firstFallbackName: "Tomato",
            secondPlant: nil,
            secondFallbackName: "Fennel ",
            wikiEntries: [tomato]
        )
        XCTAssertEqual(antagonistResult, .antagonist)
    }

    func testSpacingConflictDetectionMathUsesGardenDimensions() {
        let plantA = Plant(context: context)
        plantA.id = UUID()
        plantA.name = "Plant A"
        plantA.healthStatus = Plant.HealthStatus.good.rawValue
        plantA.growthStage = Plant.GrowthStage.seedling.rawValue
        plantA.createdAt = Date()
        plantA.updatedAt = Date()
        plantA.spacingOverrideFeet = NSNumber(value: 2.0)

        let plantB = Plant(context: context)
        plantB.id = UUID()
        plantB.name = "Plant B"
        plantB.healthStatus = Plant.HealthStatus.good.rawValue
        plantB.growthStage = Plant.GrowthStage.seedling.rawValue
        plantB.createdAt = Date()
        plantB.updatedAt = Date()

        let firstPlacement = PlacedPlant(
            id: UUID(),
            wikiEntryId: plantA.id,
            name: plantA.name,
            x: 0.1,
            y: 0.1
        )
        let secondPlacement = PlacedPlant(
            id: UUID(),
            wikiEntryId: plantB.id,
            name: plantB.name,
            x: 0.2,
            y: 0.1
        )

        let insights = buildInsights(
            placements: [firstPlacement, secondPlacement],
            availablePlants: [plantA, plantB],
            wikiEntries: [],
            gardenWidth: 10,
            gardenLength: 10
        )

        XCTAssertEqual(insights.spacingIssues.count, 1)
        XCTAssertEqual(insights.spacingIssues[0].requiredFeet, 2.0, accuracy: 0.0001)
        XCTAssertEqual(insights.spacingIssues[0].actualFeet, 1.0, accuracy: 0.0001)
    }
}
