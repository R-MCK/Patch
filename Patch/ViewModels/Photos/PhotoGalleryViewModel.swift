import Foundation
import UIKit
import Combine

@MainActor
final class PhotoGalleryViewModel: ObservableObject {

    // MARK: - Published Properties

    @Published var photos: [Photo] = []
    @Published var selectedPhotos: Set<UUID> = []
    @Published var isLoading: Bool = false
    @Published var isSelectionMode: Bool = false
    @Published var errorMessage: String?
    @Published var isSaving: Bool = false

    // MARK: - Private Properties

    private let repository: PhotoRepository
    private let compressionService = PhotoCompressionService.shared
    private let plant: Plant?
    private var cancellables = Set<AnyCancellable>()

    // MARK: - Image Cache

    private var thumbnailCache: [UUID: UIImage] = [:]
    private var fullImageCache: [UUID: UIImage] = [:]

    // MARK: - Computed Properties

    var photoCount: Int {
        photos.count
    }

    var hasPhotos: Bool {
        !photos.isEmpty
    }

    var selectedCount: Int {
        selectedPhotos.count
    }

    var hasSelection: Bool {
        !selectedPhotos.isEmpty
    }

    var allSelected: Bool {
        selectedPhotos.count == photos.count && !photos.isEmpty
    }

    // MARK: - Initialization

    init(plant: Plant? = nil, repository: PhotoRepository = PhotoRepository()) {
        self.plant = plant
        self.repository = repository
    }

    // MARK: - Load Photos

    func loadPhotos() {
        isLoading = true
        errorMessage = nil

        if let plant = plant {
            photos = repository.fetchByPlant(plant)
        } else {
            photos = repository.fetchAll()
        }

        isLoading = false
    }

    func refresh() async {
        loadPhotos()
    }

    // MARK: - Image Loading

    /// Get thumbnail image for photo (cached)
    func thumbnail(for photo: Photo) -> UIImage? {
        // Check cache first
        if let cached = thumbnailCache[photo.id] {
            return cached
        }

        // Load from data
        if let thumbnailData = photo.thumbnailData,
           let image = UIImage(data: thumbnailData) {
            thumbnailCache[photo.id] = image
            return image
        }

        // Fall back to full image if no thumbnail
        if let imageData = photo.imageData,
           let image = UIImage(data: imageData) {
            // Generate and cache thumbnail
            if let thumbnailData = compressionService.generateThumbnail(image),
               let thumbnail = UIImage(data: thumbnailData) {
                thumbnailCache[photo.id] = thumbnail
                // Also update the photo with the thumbnail
                repository.updateThumbnail(photo, thumbnailData: thumbnailData)
                return thumbnail
            }
            return image
        }

        return nil
    }

    /// Get full-size image for photo (cached)
    func fullImage(for photo: Photo) -> UIImage? {
        // Check cache first
        if let cached = fullImageCache[photo.id] {
            return cached
        }

        // Load from data
        if let imageData = photo.imageData,
           let image = UIImage(data: imageData) {
            fullImageCache[photo.id] = image
            return image
        }

        return nil
    }

    /// Load full image asynchronously
    func loadFullImage(for photo: Photo) async -> UIImage? {
        // Check cache first
        if let cached = fullImageCache[photo.id] {
            return cached
        }

        let photoId = photo.id
        guard let imageData = photo.imageData else {
            return nil
        }

        return await withCheckedContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                let image = UIImage(data: imageData)
                DispatchQueue.main.async {
                    if let image {
                        self.fullImageCache[photoId] = image
                        continuation.resume(returning: image)
                    } else {
                        continuation.resume(returning: nil)
                    }
                }
            }
        }
    }

    /// Clear image caches
    func clearCache() {
        thumbnailCache.removeAll()
        fullImageCache.removeAll()
    }

    /// Clear cache for specific photo
    func clearCache(for photoId: UUID) {
        thumbnailCache.removeValue(forKey: photoId)
        fullImageCache.removeValue(forKey: photoId)
    }

    // MARK: - Add Photos

    /// Add a single photo from UIImage
    func addPhoto(_ image: UIImage, caption: String? = nil) async {
        guard let plant = plant else {
            errorMessage = "No plant selected"
            return
        }

        isSaving = true

        // Compress in background
        let compressed = await compressForStorageOffMain(image)

        guard let fullSizeData = compressed.fullSize else {
            errorMessage = "Failed to compress image"
            isSaving = false
            return
        }

        // Create photo record
        let photo = repository.create(
            imageData: fullSizeData,
            thumbnailData: compressed.thumbnail,
            caption: caption,
            plant: plant
        )

        // Update cache
        thumbnailCache[photo.id] = thumbnail(for: photo)

        // Reload photos
        loadPhotos()
        isSaving = false
    }

    private func compressForStorageOffMain(_ image: UIImage) async -> (fullSize: Data?, thumbnail: Data?) {
        await withCheckedContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                let compressed = PhotoCompressionService.shared.compressForStorage(image)
                continuation.resume(returning: compressed)
            }
        }
    }

    /// Add multiple photos from UIImages
    func addPhotos(_ images: [UIImage]) async {
        guard let plant = plant else {
            errorMessage = "No plant selected"
            return
        }

        isSaving = true

        // Compress all in parallel
        let compressedImages = await compressionService.compressMultipleAsync(images)

        // Create photo records
        for compressed in compressedImages {
            guard let fullSizeData = compressed.fullSize else { continue }

            let photo = repository.create(
                imageData: fullSizeData,
                thumbnailData: compressed.thumbnail,
                plant: plant
            )

            // Update cache
            thumbnailCache[photo.id] = thumbnail(for: photo)
        }

        // Reload photos
        loadPhotos()
        isSaving = false
    }

    // MARK: - Delete Photos

    /// Delete a single photo
    func deletePhoto(_ photo: Photo) {
        clearCache(for: photo.id)
        repository.delete(photo)
        loadPhotos()
    }

    /// Delete selected photos
    func deleteSelected() {
        for photoId in selectedPhotos {
            if let photo = photos.first(where: { $0.id == photoId }) {
                clearCache(for: photoId)
                repository.delete(photo)
            }
        }
        selectedPhotos.removeAll()
        loadPhotos()
    }

    // MARK: - Update Photos

    /// Update photo caption
    func updateCaption(for photo: Photo, caption: String) {
        repository.update(photo, caption: caption.isEmpty ? nil : caption)
        loadPhotos()
    }

    // MARK: - Selection

    func toggleSelection(for photo: Photo) {
        if selectedPhotos.contains(photo.id) {
            selectedPhotos.remove(photo.id)
        } else {
            selectedPhotos.insert(photo.id)
        }
    }

    func selectAll() {
        selectedPhotos = Set(photos.map { $0.id })
    }

    func deselectAll() {
        selectedPhotos.removeAll()
    }

    func enterSelectionMode() {
        isSelectionMode = true
    }

    func exitSelectionMode() {
        isSelectionMode = false
        selectedPhotos.removeAll()
    }

    func isSelected(_ photo: Photo) -> Bool {
        selectedPhotos.contains(photo.id)
    }

    // MARK: - Navigation

    /// Get index of photo in array
    func index(of photo: Photo) -> Int? {
        photos.firstIndex(where: { $0.id == photo.id })
    }

    /// Get photo at index
    func photo(at index: Int) -> Photo? {
        guard index >= 0 && index < photos.count else { return nil }
        return photos[index]
    }

    /// Get next photo
    func nextPhoto(after photo: Photo) -> Photo? {
        guard let index = index(of: photo), index < photos.count - 1 else { return nil }
        return photos[index + 1]
    }

    /// Get previous photo
    func previousPhoto(before photo: Photo) -> Photo? {
        guard let index = index(of: photo), index > 0 else { return nil }
        return photos[index - 1]
    }
}
