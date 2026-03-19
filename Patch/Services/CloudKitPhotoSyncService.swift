import Foundation
import CloudKit
import CoreData
import Combine

/// Service for managing CloudKit photo synchronization
final class CloudKitPhotoSyncService: ObservableObject {
    
    // MARK: - Singleton
    
    static let shared = CloudKitPhotoSyncService()
    
    // MARK: - Published Properties
    
    @Published var syncProgress: Double = 0.0
    @Published var isSyncing: Bool = false
    @Published var syncStatus: SyncStatus = .idle
    @Published var errorMessage: String?
    
    // MARK: - Private Properties
    
    private let container: CKContainer
    private let database: CKDatabase
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Sync Status
    
    enum SyncStatus {
        case idle
        case syncing
        case completed
        case failed(Error)
        
        var isActive: Bool {
            switch self {
            case .syncing:
                return true
            default:
                return false
            }
        }
    }
    
    // MARK: - Initialization
    
    private init(containerIdentifier: String = "iCloud.com.patch.gardening") {
        self.container = CKContainer(identifier: containerIdentifier)
        self.database = self.container.privateCloudDatabase
        
        // Monitor CloudKit sync events
        NotificationCenter.default.publisher(for: NSPersistentCloudKitContainer.eventChangedNotification)
            .sink { [weak self] notification in
                self?.handleCloudKitEvent(notification)
            }
            .store(in: &cancellables)
    }
    
    // MARK: - CloudKit Event Handling
    
    private func handleCloudKitEvent(_ notification: Notification) {
        guard let event = notification.userInfo?[NSPersistentCloudKitContainer.eventNotificationUserInfoKey] as? NSPersistentCloudKitContainer.Event else {
            return
        }
        
        switch event.type {
        case .setup:
            print("CloudKit setup completed")
        case .import:
            print("CloudKit import completed")
        case .export:
            print("CloudKit export completed")
        @unknown default:
            break
        }
    }
    
    // MARK: - Progressive Sync
    
    /// Sync photos with progressive loading (thumbnails first, then full images)
    func syncPhotosProgressively(photos: [NSManagedObject]) async {
        await MainActor.run {
            isSyncing = true
            syncStatus = .syncing
            syncProgress = 0.0
            errorMessage = nil
        }

        // Phase 1: Sync thumbnails and metadata
        await syncThumbnailsAndMetadata(photos: photos)

        // Phase 2: Sync full images in batches
        await syncFullImages(photos: photos)

        await MainActor.run {
            isSyncing = false
            syncStatus = .completed
            syncProgress = 1.0
        }
    }
    
    // MARK: - Phase 1: Thumbnails and Metadata
    
    private func syncThumbnailsAndMetadata(photos: [NSManagedObject]) async {
        let totalPhotos = photos.count
        var completedCount = 0
        
        for photo in photos {
            do {
                // Create CKRecord for photo metadata
                let record = try createPhotoRecord(photo: photo, includeFullImage: false)
                
                // Save to CloudKit
                try await saveRecord(record)
                
                completedCount += 1
                let progress = Double(completedCount) / Double(totalPhotos) * 0.5 // 50% for thumbnails
                
                await MainActor.run {
                    syncProgress = progress
                }
                
            } catch {
                print("Error syncing thumbnail for photo: \(error)")
            }
        }
    }
    
    // MARK: - Phase 2: Full Images
    
    private func syncFullImages(photos: [NSManagedObject]) async {
        let totalPhotos = photos.count
        var completedCount = 0
        
        // Process in batches to avoid overwhelming CloudKit
        let batchSize = 5
        let batches = photos.chunked(into: batchSize)
        
        for batch in batches {
            for photo in batch {
                await syncFullImage(for: photo)
            }

            completedCount += batch.count
            let progress = 0.5 + (Double(completedCount) / Double(totalPhotos) * 0.5) // 50-100% for full images

            await MainActor.run {
                syncProgress = progress
            }

            // Small delay between batches
            try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
        }
    }
    
    private func syncFullImage(for photo: NSManagedObject) async {
        guard photo.value(forKey: "imageData") as? Data != nil else { return }
        
        do {
            // Create CKRecord with full image
            let record = try createPhotoRecord(photo: photo, includeFullImage: true)
            
            // Save to CloudKit
            try await saveRecord(record)
            
        } catch {
            print("Error syncing full image for photo: \(error)")
        }
    }
    
    // MARK: - Helper Methods
    
    /// Create CKAsset from Data by writing to temporary file
    private func createCKAsset(from data: Data) throws -> CKAsset {
        let tempDir = FileManager.default.temporaryDirectory
        let fileName = UUID().uuidString + ".jpg"
        let fileURL = tempDir.appendingPathComponent(fileName)
        
        try data.write(to: fileURL)
        return CKAsset(fileURL: fileURL)
    }
    
    // MARK: - Record Creation
    
    private func createPhotoRecord(photo: NSManagedObject, includeFullImage: Bool) throws -> CKRecord {
        guard let photoId = photo.value(forKey: "id") as? UUID else {
            throw SyncError.invalidPhoto
        }
        
        let recordID = CKRecord.ID(recordName: "Photo_\(photoId.uuidString)")
        let record = CKRecord(recordType: "Photo", recordID: recordID)
        
        // Basic metadata
        record["id"] = photoId.uuidString
        record["caption"] = photo.value(forKey: "caption") as? String
        record["capturedAt"] = photo.value(forKey: "capturedAt") as? Date
        record["createdAt"] = photo.value(forKey: "createdAt") as? Date
        
        // Plant relationship
        if let plant = photo.value(forKey: "plant") as? NSManagedObject,
           let plantId = plant.value(forKey: "id") as? UUID {
            record["plantId"] = plantId.uuidString
        }
        
        // Thumbnail (always included)
        if let thumbnailData = photo.value(forKey: "thumbnailData") as? Data {
            let thumbnailAsset = try createCKAsset(from: thumbnailData)
            record["thumbnailData"] = thumbnailAsset
        }
        
        // Full image (only if requested)
        if includeFullImage, let imageData = photo.value(forKey: "imageData") as? Data {
            let imageAsset = try createCKAsset(from: imageData)
            record["imageData"] = imageAsset
        }
        
        return record
    }
    
    // MARK: - CloudKit Operations
    
    private func saveRecord(_ record: CKRecord) async throws {
        try await database.save(record)
    }
    
    private func fetchRecord(recordID: CKRecord.ID) async throws -> CKRecord {
        return try await database.record(for: recordID)
    }
    
    // MARK: - Sync Progress Monitoring
    
    /// Monitor sync progress for specific photo
    func monitorSyncProgress(for photoId: UUID) -> AsyncStream<Double> {
        AsyncStream { continuation in
            // This would integrate with CloudKit's progress monitoring
            // For now, we'll simulate progress
            Task {
                for progress in stride(from: 0.0, through: 1.0, by: 0.1) {
                    continuation.yield(progress)
                    try? await Task.sleep(nanoseconds: 100_000_000) // 0.1 seconds
                }
                continuation.finish()
            }
        }
    }
    
    // MARK: - Conflict Resolution
    
    /// Handle sync conflicts for photos
    func resolveSyncConflict(for photo: NSManagedObject, serverRecord: CKRecord) async throws {
        // Compare timestamps to determine which version to keep
        let localTimestamp = photo.value(forKey: "updatedAt") as? Date ?? photo.value(forKey: "createdAt") as? Date ?? Date.distantPast
        let serverTimestamp = serverRecord["updatedAt"] as? Date ?? serverRecord["createdAt"] as? Date ?? Date.distantPast
        
        if localTimestamp > serverTimestamp {
            // Local version is newer, upload it
            let record = try createPhotoRecord(photo: photo, includeFullImage: true)
            try await saveRecord(record)
        } else {
            // Server version is newer, download and merge
            try await mergeServerRecord(serverRecord, with: photo)
        }
    }
    
    private func mergeServerRecord(_ serverRecord: CKRecord, with photo: NSManagedObject) async throws {
        let serverCaption = serverRecord["caption"] as? String
        let objectID = photo.objectID

        guard let context = photo.managedObjectContext else {
            throw SyncError.invalidPhoto
        }

        try await context.perform {
            let localPhoto = try context.existingObject(with: objectID)
            if let serverCaption {
                localPhoto.setValue(serverCaption, forKey: "caption")
            }

            localPhoto.setValue(Date(), forKey: "updatedAt")

            if context.hasChanges {
                try context.save()
            }
        }
    }
    
    // MARK: - Cleanup
    
    /// Delete photos from CloudKit
    func deletePhotos(_ photos: [NSManagedObject]) async {
        for photo in photos {
            guard let photoId = photo.value(forKey: "id") as? UUID else { continue }
            
            let recordID = CKRecord.ID(recordName: "Photo_\(photoId.uuidString)")
            
            do {
                try await database.deleteRecord(withID: recordID)
            } catch {
                print("Error deleting photo \(photoId) from CloudKit: \(error)")
            }
        }
    }
    
    /// Check CloudKit account status
    func checkAccountStatus() async -> CKAccountStatus {
        return (try? await container.accountStatus()) ?? .couldNotDetermine
    }
    
    /// Request CloudKit permissions
    func requestPermissions() async -> Bool {
        let status = (try? await container.accountStatus()) ?? .couldNotDetermine
        return status == .available
    }
}

// MARK: - Sync Errors

enum SyncError: Error, LocalizedError {
    case invalidPhoto
    case cloudKitError(Error)
    case dataCorruption
    
    var errorDescription: String? {
        switch self {
        case .invalidPhoto:
            return "Invalid photo data"
        case .cloudKitError(let error):
            return "CloudKit error: \(error.localizedDescription)"
        case .dataCorruption:
            return "Photo data is corrupted"
        }
    }
}

// MARK: - Array Extension for Chunking

extension Array {
    func chunked(into size: Int) -> [[Element]] {
        return stride(from: 0, to: count, by: size).map {
            Array(self[$0..<Swift.min($0 + size, count)])
        }
    }
}
