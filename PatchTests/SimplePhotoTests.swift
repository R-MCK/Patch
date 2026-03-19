import XCTest
@testable import Patch

final class SimplePhotoTests: XCTestCase {
    
    func testBasicPhotoCreation() throws {
        // Given
        let context = PersistenceController.shared.container.viewContext
        
        // When
        let photo = Photo(context: context)
        photo.id = UUID()
        photo.caption = "Test Photo"
        photo.capturedAt = Date()
        photo.createdAt = Date()
        
        // Then
        XCTAssertNotNil(photo.id, "Photo should have an ID")
        XCTAssertEqual(photo.caption, "Test Photo", "Caption should match")
        XCTAssertNotNil(photo.capturedAt, "Photo should have a capture date")
    }
    
    func testPhotoRepositoryBasicOperations() throws {
        // Given
        let context = PersistenceController.shared.container.viewContext
        let repository = PhotoRepository(context: context)
        
        // When - Create
        let photo = repository.create(
            imageData: Data("test".utf8),
            thumbnailData: Data("thumb".utf8),
            caption: "Test Photo",
            plant: nil
        )
        
        // Then
        XCTAssertNotNil(photo.id, "Photo should be created")
        XCTAssertEqual(photo.caption, "Test Photo", "Caption should match")
        
        // When - Fetch
        let fetchedPhotos = repository.fetchAll()
        XCTAssertTrue(fetchedPhotos.contains { $0.id == photo.id }, "Should find created photo")
        
        // When - Delete
        repository.delete(photo)
        let photosAfterDelete = repository.fetchAll()
        XCTAssertFalse(photosAfterDelete.contains { $0.id == photo.id }, "Photo should be deleted")
    }
}