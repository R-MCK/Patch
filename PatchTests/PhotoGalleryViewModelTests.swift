import XCTest
@testable import Patch

final class PhotoGalleryViewModelTests: XCTestCase {
    
    var viewModel: PhotoGalleryViewModel!
    var mockRepository: MockPhotoRepository!
    
    override func setUpWithError() throws {
        mockRepository = MockPhotoRepository()
        viewModel = PhotoGalleryViewModel(repository: mockRepository)
    }
    
    override func tearDownWithError() throws {
        viewModel = nil
        mockRepository = nil
    }
    
    // MARK: - Loading Tests
    
    func testLoadPhotos() async throws {
        // Given
        let expectedPhotos = createMockPhotos(count: 3)
        mockRepository.photosToReturn = expectedPhotos
        
        // When
        viewModel.loadPhotos()
        
        // Then
        XCTAssertEqual(viewModel.photos.count, expectedPhotos.count, "Should load all photos")
        XCTAssertFalse(viewModel.isLoading, "Should not be loading after completion")
    }
    
    func testLoadPhotosByPlant() async throws {
        // Given
        let plant = createMockPlant()
        let expectedPhotos = createMockPhotos(count: 2)
        mockRepository.photosToReturn = expectedPhotos
        
        let plantViewModel = PhotoGalleryViewModel(plant: plant, repository: mockRepository)
        
        // When
        plantViewModel.loadPhotos()
        
        // Then
        XCTAssertEqual(plantViewModel.photos.count, expectedPhotos.count, "Should load photos for specific plant")
        XCTAssertTrue(mockRepository.fetchByPlantCalled, "Should fetch by plant")
    }
    
    // MARK: - Image Loading Tests
    
    func testThumbnailCaching() throws {
        // Given
        let photo = createMockPhotos(count: 1).first!
        let image = createTestImage()
        mockRepository.thumbnailDataToReturn = image.jpegData(compressionQuality: 0.7)
        
        // When
        let thumbnail1 = viewModel.thumbnail(for: photo)
        let thumbnail2 = viewModel.thumbnail(for: photo) // Should use cache
        
        // Then
        XCTAssertNotNil(thumbnail1, "Should return thumbnail")
        XCTAssertNotNil(thumbnail2, "Should return cached thumbnail")
        XCTAssertTrue(mockRepository.fetchByIdCalled, "Should fetch photo data")
    }
    
    func testFullImageLoading() async throws {
        // Given
        let photo = createMockPhotos(count: 1).first!
        let image = createTestImage()
        mockRepository.imageDataToReturn = image.jpegData(compressionQuality: 0.8)
        
        // When
        let fullImage = await viewModel.loadFullImage(for: photo)
        
        // Then
        XCTAssertNotNil(fullImage, "Should load full image")
        XCTAssertEqual(fullImage?.size.width, image.size.width, accuracy: 1, "Should return correct image size")
    }
    
    // MARK: - Selection Tests
    
    func testToggleSelection() throws {
        // Given
        let photo = createMockPhotos(count: 1).first!
        viewModel.photos = [photo]
        
        // When
        viewModel.toggleSelection(for: photo)
        
        // Then
        XCTAssertTrue(viewModel.isSelected(photo), "Photo should be selected")
        XCTAssertEqual(viewModel.selectedCount, 1, "Should have one selected photo")
        
        // When - deselect
        viewModel.toggleSelection(for: photo)
        
        // Then
        XCTAssertFalse(viewModel.isSelected(photo), "Photo should be deselected")
        XCTAssertEqual(viewModel.selectedCount, 0, "Should have no selected photos")
    }
    
    func testSelectAll() throws {
        // Given
        let photos = createMockPhotos(count: 3)
        viewModel.photos = photos
        
        // When
        viewModel.selectAll()
        
        // Then
        XCTAssertEqual(viewModel.selectedCount, photos.count, "Should select all photos")
        XCTAssertTrue(viewModel.allSelected, "All photos should be selected")
    }
    
    func testDeselectAll() throws {
        // Given
        let photos = createMockPhotos(count: 3)
        viewModel.photos = photos
        viewModel.selectAll() // Select all first
        
        // When
        viewModel.deselectAll()
        
        // Then
        XCTAssertEqual(viewModel.selectedCount, 0, "Should deselect all photos")
        XCTAssertFalse(viewModel.allSelected, "No photos should be selected")
    }
    
    // MARK: - Navigation Tests
    
    func testPhotoNavigation() throws {
        // Given
        let photos = createMockPhotos(count: 3)
        viewModel.photos = photos
        
        // When & Then
        XCTAssertEqual(viewModel.index(of: photos[1]), 1, "Should return correct index")
        XCTAssertEqual(viewModel.photo(at: 2), photos[2], "Should return correct photo")
        
        XCTAssertEqual(viewModel.nextPhoto(after: photos[0])?.id, photos[1].id, "Should return next photo")
        XCTAssertEqual(viewModel.previousPhoto(before: photos[1])?.id, photos[0].id, "Should return previous photo")
        XCTAssertNil(viewModel.nextPhoto(after: photos[2]), "Last photo should have no next")
        XCTAssertNil(viewModel.previousPhoto(before: photos[0]), "First photo should have no previous")
    }
    
    // MARK: - Cache Management Tests
    
    func testClearCache() throws {
        // Given
        let photo = createMockPhotos(count: 1).first!
        _ = viewModel.thumbnail(for: photo) // Populate cache
        _ = viewModel.fullImage(for: photo)
        
        // When
        viewModel.clearCache()
        
        // Then - cache should be empty, but images should still load
        let thumbnailAfter = viewModel.thumbnail(for: photo)
        XCTAssertNotNil(thumbnailAfter, "Should reload thumbnail after cache clear")
    }
    
    func testClearCacheForPhoto() throws {
        // Given
        let photos = createMockPhotos(count: 2)
        _ = viewModel.thumbnail(for: photos[0])
        _ = viewModel.thumbnail(for: photos[1])
        
        // When
        viewModel.clearCache(for: photos[0].id)
        
        // Then - only first photo should be cleared from cache
        _ = viewModel.thumbnail(for: photos[1]) // Should still be cached
        _ = viewModel.thumbnail(for: photos[0]) // Should reload
    }
    
    // MARK: - Helper Methods
    
    private func createMockPhotos(count: Int) -> [Photo] {
        return (0..<count).map { index in
            let photo = Photo()
            photo.id = UUID()
            photo.caption = "Test Photo \(index)"
            photo.capturedAt = Date()
            photo.createdAt = Date()
            return photo
        }
    }
    
    private func createMockPlant() -> Plant {
        let plant = Plant()
        plant.id = UUID()
        plant.name = "Test Plant"
        plant.createdAt = Date()
        return plant
    }
    
    private func createTestImage() -> Image {
        // Create a simple test image representation
        Image(systemName: "photo")
    }
}

// MARK: - Mock Repository

class MockPhotoRepository: PhotoRepository {
    
    var photosToReturn: [Photo] = []
    var thumbnailDataToReturn: Data?
    var imageDataToReturn: Data?
    
    var fetchAllCalled = false
    var fetchByPlantCalled = false
    var fetchByIdCalled = false
    var createCalled = false
    var updateCalled = false
    var deleteCalled = false
    
    override func fetchAll() -> [Photo] {
        fetchAllCalled = true
        return photosToReturn
    }
    
    override func fetchByPlant(_ plant: Plant) -> [Photo] {
        fetchByPlantCalled = true
        return photosToReturn
    }
    
    override func fetchById(_ id: UUID) -> Photo? {
        fetchByIdCalled = true
        return photosToReturn.first { $0.id == id }
    }
    
    @discardableResult
    override func create(
        imageData: Data,
        thumbnailData: Data? = nil,
        caption: String? = nil,
        plant: Plant,
        capturedAt: Date = Date()
    ) -> Photo {
        createCalled = true
        
        let photo = Photo()
        photo.id = UUID()
        photo.imageData = imageData
        photo.thumbnailData = thumbnailData
        photo.caption = caption
        photo.plant = plant
        photo.capturedAt = capturedAt
        photo.createdAt = Date()
        return photo
    }
    
    override func update(_ photo: Photo, caption: String? = nil) {
        updateCalled = true
        if let caption = caption {
            photo.caption = caption
        }
    }
    
    override func delete(_ photo: Photo) {
        deleteCalled = true
        // In a real implementation, this would remove from Core Data
    }
}