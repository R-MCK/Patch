import Foundation
import CoreData
import Combine
import CryptoKit

@MainActor
final class PlantDetailViewModel: ObservableObject {
    @Published var plant: Plant
    @Published var careTasks: [CareTask] = []
    @Published var notes: [Note] = []
    @Published var photos: [Photo] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?

    private let plantRepository: any PlantDetailPlantRepository
    private let careTaskRepository: any PlantCareTaskRepository
    private let noteRepository: any PlantNoteRepository
    private let photoRepository: any PlantPhotoRepository

    init(
        plant: Plant,
        plantRepository: (any PlantDetailPlantRepository)? = nil,
        careTaskRepository: (any PlantCareTaskRepository)? = nil,
        noteRepository: (any PlantNoteRepository)? = nil,
        photoRepository: (any PlantPhotoRepository)? = nil
    ) {
        self.plant = plant
        self.plantRepository = plantRepository ?? PlantRepository()
        self.careTaskRepository = careTaskRepository ?? CareTaskRepository()
        self.noteRepository = noteRepository ?? NoteRepository()
        self.photoRepository = photoRepository ?? PhotoRepository()
    }

    func loadRelatedData() {
        isLoading = true
        careTasks = careTaskRepository.fetchByPlant(plant)
        notes = noteRepository.fetchByPlant(plant)
        photos = photoRepository.fetchByPlant(plant)
        isLoading = false
    }

    func refresh() {
        if let refreshedPlant = plantRepository.fetchById(plant.id) {
            plant = refreshedPlant
        }
        loadRelatedData()
    }

    func updateHealthStatus(_ status: Plant.HealthStatus) {
        plantRepository.update(plant, healthStatus: status)
        plant.healthStatus = status.rawValue
    }

    func updateGrowthStage(_ stage: Plant.GrowthStage) {
        plantRepository.update(plant, growthStage: stage)
        plant.growthStage = stage.rawValue
    }

    func delete() {
        plantRepository.delete(plant)
    }

    var pendingCareTasks: [CareTask] {
        careTasks.filter { $0.completedDate == nil }
    }

    var completedCareTasks: [CareTask] {
        careTasks.filter { $0.completedDate != nil }
    }

    var careTaskCount: Int {
        careTasks.count
    }

    var photoCount: Int {
        photos.count
    }

    var noteCount: Int {
        notes.count
    }

    var primaryPhoto: Photo? {
        photos.first
    }

    var careStreakDays: Int {
        let completionDates = careTasks.compactMap(\.completedDate)
        return ViralShareBuilder.currentCareStreak(completionDates: completionDates)
    }

    var inviteCode: String {
        ViralShareBuilder.inviteCode(from: plant.id.uuidString)
    }

    var viralShareMessage: String {
        ViralShareBuilder.challengeMessage(
            plantName: plant.name,
            species: plant.species,
            healthStatus: plant.healthStatus,
            growthStage: plant.growthStage,
            streakDays: careStreakDays,
            pendingTaskCount: pendingCareTasks.count,
            photoCount: photos.count,
            inviteCode: inviteCode
        )
    }
}

struct ViralShareBuilder {
    static func inviteCode(from seed: String) -> String {
        let digest = SHA256.hash(data: Data(seed.utf8))
        let alphabet = Array("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")
        var code = ""
        code.reserveCapacity(6)

        for byte in digest.prefix(6) {
            let index = Int(byte) % alphabet.count
            code.append(alphabet[index])
        }

        return code
    }

    static func currentCareStreak(
        completionDates: [Date],
        calendar: Calendar = .current,
        referenceDate: Date = Date()
    ) -> Int {
        guard !completionDates.isEmpty else { return 0 }

        let completedDays = Set(completionDates.map { calendar.startOfDay(for: $0) })
        let today = calendar.startOfDay(for: referenceDate)
        guard let yesterday = calendar.date(byAdding: .day, value: -1, to: today) else { return 0 }

        let startDay: Date
        if completedDays.contains(today) {
            startDay = today
        } else if completedDays.contains(yesterday) {
            startDay = yesterday
        } else {
            return 0
        }

        var streak = 0
        var cursor = startDay

        while completedDays.contains(cursor) {
            streak += 1
            guard let previous = calendar.date(byAdding: .day, value: -1, to: cursor) else { break }
            cursor = previous
        }

        return streak
    }

    static func challengeMessage(
        plantName: String,
        species: String?,
        healthStatus: String,
        growthStage: String,
        streakDays: Int,
        pendingTaskCount: Int,
        photoCount: Int,
        inviteCode: String
    ) -> String {
        let speciesLine: String
        if let species, !species.isEmpty {
            speciesLine = " (\(species))"
        } else {
            speciesLine = ""
        }
        let streakLine = streakDays > 0 ? "\(streakDays)-day care streak" : "starting a fresh care streak"
        let taskLine = pendingTaskCount == 0 ? "No pending care tasks." : "\(pendingTaskCount) care task(s) queued."

        return """
        My \(plantName)\(speciesLine) update from Patch:
        - Health: \(healthStatus)
        - Stage: \(growthStage)
        - Progress: \(streakLine)
        - Photos logged: \(photoCount)
        - \(taskLine)

        Join my garden challenge in Patch with invite code: \(inviteCode)
        #PatchGardenChallenge #GrowTogether
        """
    }
}
