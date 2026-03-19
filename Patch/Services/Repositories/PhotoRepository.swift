import Foundation
import CoreData
import Combine
import os

protocol PlantPhotoRepository {
    func fetchByPlant(_ plant: Plant) -> [Photo]
}

/// Repository for Photo entity CRUD operations
@MainActor
final class PhotoRepository: ObservableObject {

    private let context: NSManagedObjectContext

    @Published var photos: [Photo] = []
    @Published var errorMessage: String?

    private let logger = Logger(subsystem: "com.patch.app", category: "repository")

    init(context: NSManagedObjectContext = PersistenceController.shared.container.viewContext) {
        self.context = context
    }

    // MARK: - Fetch Operations

    /// Fetch all photos
    func fetchAll() -> [Photo] {
        let request: NSFetchRequest<Photo> = Photo.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Photo.capturedAt, ascending: false)]

        do {
            let results = try context.fetch(request)
            DispatchQueue.main.async {
                self.photos = results
            }
            return results
        } catch {
            logger.error("Error fetching photos: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Fetch photos by plant
    func fetchByPlant(_ plant: Plant) -> [Photo] {
        let request: NSFetchRequest<Photo> = Photo.fetchRequest()
        request.predicate = NSPredicate(format: "plant == %@", plant)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Photo.capturedAt, ascending: false)]

        do {
            return try context.fetch(request)
        } catch {
            logger.error("Error fetching photos by plant: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Fetch photo by ID
    func fetchById(_ id: UUID) -> Photo? {
        let request: NSFetchRequest<Photo> = Photo.fetchRequest()
        request.predicate = NSPredicate(format: "id == %@", id as CVarArg)
        request.fetchLimit = 1

        do {
            return try context.fetch(request).first
        } catch {
            logger.error("Error fetching photo by ID: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return nil
        }
    }

    /// Fetch recent photos
    func fetchRecent(limit: Int = 10) -> [Photo] {
        let request: NSFetchRequest<Photo> = Photo.fetchRequest()
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Photo.capturedAt, ascending: false)]
        request.fetchLimit = limit

        do {
            return try context.fetch(request)
        } catch {
            logger.error("Error fetching recent photos: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    /// Fetch photos within date range
    func fetchInDateRange(from startDate: Date, to endDate: Date) -> [Photo] {
        let request: NSFetchRequest<Photo> = Photo.fetchRequest()
        request.predicate = NSPredicate(format: "capturedAt >= %@ AND capturedAt <= %@", startDate as CVarArg, endDate as CVarArg)
        request.sortDescriptors = [NSSortDescriptor(keyPath: \Photo.capturedAt, ascending: false)]

        do {
            return try context.fetch(request)
        } catch {
            logger.error("Error fetching photos in date range: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
            return []
        }
    }

    // MARK: - Create

    @discardableResult
    func create(
        imageData: Data,
        thumbnailData: Data? = nil,
        caption: String? = nil,
        plant: Plant,
        capturedAt: Date = Date()
    ) -> Photo {
        let photo = Photo(context: context)

        photo.id = UUID()
        photo.imageData = imageData
        photo.thumbnailData = thumbnailData
        photo.caption = caption
        photo.plant = plant
        photo.capturedAt = capturedAt
        photo.createdAt = Date()

        save()
        return photo
    }

    // MARK: - Update

    func update(
        _ photo: Photo,
        caption: String? = nil
    ) {
        if let caption = caption { photo.caption = caption }
        save()
    }

    func updateThumbnail(_ photo: Photo, thumbnailData: Data) {
        photo.thumbnailData = thumbnailData
        save()
    }

    // MARK: - Delete

    func delete(_ photo: Photo) {
        context.delete(photo)
        save()
    }

    func deleteById(_ id: UUID) {
        if let photo = fetchById(id) {
            delete(photo)
        }
    }

    func deleteByPlant(_ plant: Plant) {
        let photos = fetchByPlant(plant)
        for photo in photos {
            context.delete(photo)
        }
        save()
    }

    // MARK: - Save

    private func save() {
        guard context.hasChanges else { return }

        do {
            try context.save()
            _ = fetchAll() // Refresh published photos
        } catch {
            logger.error("Error saving context: \(error.localizedDescription)")
            self.errorMessage = error.localizedDescription
        }
    }
}

extension PhotoRepository: PlantPhotoRepository { }
