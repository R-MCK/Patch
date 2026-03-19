import SwiftUI
#if DEBUG
import CoreData
#endif

struct ContentView: View {
    var body: some View {
        #if DEBUG
        if let screen = ProcessInfo.processInfo.arguments.first(where: { $0.hasPrefix("--screen=") }) {
            let value = screen.replacingOccurrences(of: "--screen=", with: "")
            DebugScreenRouter(screen: value)
        } else {
            MainTabView()
        }
        #else
        MainTabView()
        #endif
    }
}

#if DEBUG
private struct DebugScreenRouter: View {
    let screen: String

    var body: some View {
        switch screen.lowercased() {
        case "add-plant":
            AddPlantView()
        case "add-garden":
            AddGardenView()
        case "care-tasks":
            CareTaskListView()
        case "photos":
            NavigationStack {
                PhotoGalleryContainerView(plant: samplePlant)
            }
        case "plant-detail":
            NavigationStack {
                PlantDetailView(plant: samplePlant) { }
            }
        case "wiki-detail":
            NavigationStack {
                WikiEntryDetailView(wikiEntry: sampleWikiEntry)
            }
        default:
            MainTabView()
        }
    }

    private var context: NSManagedObjectContext {
        PersistenceController.shared.container.viewContext
    }

    private var samplePlant: Plant {
        let plant = Plant(context: context)
        plant.id = UUID()
        plant.name = "Roma Tomato"
        plant.species = "Solanum lycopersicum"
        plant.variety = "Roma"
        plant.location = "South Bed"
        plant.healthStatus = "Good"
        plant.growthStage = "Flowering"
        plant.plantingDate = Date().addingTimeInterval(-86_400 * 30)
        plant.createdAt = Date()
        return plant
    }

    private var sampleWikiEntry: WikiEntry {
        let entry = WikiEntry(context: context)
        entry.id = UUID()
        entry.commonName = "Basil"
        entry.scientificName = "Ocimum basilicum"
        entry.category = "Herbs"
        entry.difficulty = "Easy"
        entry.entryDescription = "Basil is a warm-weather herb known for aromatic leaves and strong companion benefits with tomatoes."
        entry.sunlight = "6-8 hours"
        entry.watering = "Keep evenly moist"
        entry.soil = "Loamy, well-draining"
        entry.daysToMaturity = 60
        entry.spacing = "10-12 inches"
        entry.plantingDepth = "1/4 inch"
        entry.germinationTime = "5-10 days"
        entry.companionPlants = "Tomato, Pepper, Oregano"
        entry.antagonistPlants = "Rue, Sage"
        return entry
    }
}
#endif

#Preview {
    ContentView()
}
