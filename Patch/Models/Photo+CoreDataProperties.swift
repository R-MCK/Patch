import Foundation
import CoreData

extension Photo {
    @nonobjc public class func fetchRequest() -> NSFetchRequest<Photo> {
        return NSFetchRequest<Photo>(entityName: "Photo")
    }

    @NSManaged public var id: UUID
    @NSManaged public var imageData: Data?
    @NSManaged public var thumbnailData: Data?
    @NSManaged public var caption: String?
    @NSManaged public var capturedAt: Date
    @NSManaged public var createdAt: Date

    // Relationships
    @NSManaged public var plant: Plant?
}

// MARK: - Computed Properties

extension Photo {
    var formattedDate: String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: capturedAt)
    }
}

extension Photo: Identifiable { }
