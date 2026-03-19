import UIKit
import CoreGraphics

/// Service for compressing and resizing images
final class PhotoCompressionService {

    // MARK: - Singleton

    static let shared = PhotoCompressionService()

    private init() {}

    // MARK: - Configuration

    /// Maximum dimension for full-size images (longest edge)
    var maxFullSizeDimension: CGFloat = 2048

    /// Maximum dimension for thumbnails (longest edge)
    var maxThumbnailDimension: CGFloat = 300

    /// JPEG compression quality for full-size images (0.0 - 1.0)
    var fullSizeCompressionQuality: CGFloat = 0.8

    /// JPEG compression quality for thumbnails (0.0 - 1.0)
    var thumbnailCompressionQuality: CGFloat = 0.7

    /// Maximum file size in bytes for full-size images (5MB)
    var maxFullSizeBytes: Int = 5 * 1024 * 1024

    /// Maximum file size in bytes for thumbnails (100KB)
    var maxThumbnailBytes: Int = 100 * 1024

    // MARK: - Public Methods

    /// Compress an image for storage
    /// - Parameter image: Original UIImage
    /// - Returns: Tuple of (fullSizeData, thumbnailData)
    func compressForStorage(_ image: UIImage) -> (fullSize: Data?, thumbnail: Data?) {
        let fullSize = compressFullSize(image)
        let thumbnail = generateThumbnail(image)

        return (fullSize, thumbnail)
    }

    /// Compress image to full-size JPEG
    func compressFullSize(_ image: UIImage) -> Data? {
        // Resize if needed
        let resizedImage = resizeImage(image, maxDimension: maxFullSizeDimension)

        // Compress to JPEG
        var compressionQuality = fullSizeCompressionQuality
        var imageData = resizedImage.jpegData(compressionQuality: compressionQuality)

        // Reduce quality if still too large
        while let data = imageData, data.count > maxFullSizeBytes && compressionQuality > 0.1 {
            compressionQuality -= 0.1
            imageData = resizedImage.jpegData(compressionQuality: compressionQuality)
        }

        return imageData
    }

    /// Generate a thumbnail from an image
    func generateThumbnail(_ image: UIImage) -> Data? {
        let thumbnailImage = resizeImage(image, maxDimension: maxThumbnailDimension)

        var compressionQuality = thumbnailCompressionQuality
        var imageData = thumbnailImage.jpegData(compressionQuality: compressionQuality)

        // Reduce quality if still too large
        while let data = imageData, data.count > maxThumbnailBytes && compressionQuality > 0.1 {
            compressionQuality -= 0.1
            imageData = thumbnailImage.jpegData(compressionQuality: compressionQuality)
        }

        return imageData
    }

    /// Resize an image to fit within max dimension
    func resizeImage(_ image: UIImage, maxDimension: CGFloat) -> UIImage {
        let size = image.size

        // Check if resize is needed
        if size.width <= maxDimension && size.height <= maxDimension {
            return image
        }

        // Calculate new size maintaining aspect ratio
        let ratio = min(maxDimension / size.width, maxDimension / size.height)
        let newSize = CGSize(width: size.width * ratio, height: size.height * ratio)

        // Resize
        let renderer = UIGraphicsImageRenderer(size: newSize)
        let resizedImage = renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: newSize))
        }

        return resizedImage
    }

    /// Resize image to specific dimensions
    func resizeImage(_ image: UIImage, to size: CGSize, maintainAspectRatio: Bool = true) -> UIImage {
        var targetSize = size

        if maintainAspectRatio {
            let ratio = min(size.width / image.size.width, size.height / image.size.height)
            targetSize = CGSize(
                width: image.size.width * ratio,
                height: image.size.height * ratio
            )
        }

        let renderer = UIGraphicsImageRenderer(size: targetSize)
        return renderer.image { _ in
            image.draw(in: CGRect(origin: .zero, size: targetSize))
        }
    }

    /// Crop image to square (centered)
    func cropToSquare(_ image: UIImage) -> UIImage {
        let size = min(image.size.width, image.size.height)
        let x = (image.size.width - size) / 2
        let y = (image.size.height - size) / 2

        let cropRect = CGRect(x: x, y: y, width: size, height: size)

        guard let cgImage = image.cgImage?.cropping(to: cropRect) else {
            return image
        }

        return UIImage(cgImage: cgImage, scale: image.scale, orientation: image.imageOrientation)
    }

    /// Generate square thumbnail
    func generateSquareThumbnail(_ image: UIImage, size: CGFloat = 150) -> Data? {
        let squareImage = cropToSquare(image)
        let resizedImage = resizeImage(squareImage, to: CGSize(width: size, height: size), maintainAspectRatio: false)
        return resizedImage.jpegData(compressionQuality: thumbnailCompressionQuality)
    }

    // MARK: - Utility Methods

    /// Get image dimensions from data without fully decoding
    func getImageDimensions(from data: Data) -> CGSize? {
        guard let imageSource = CGImageSourceCreateWithData(data as CFData, nil),
              let properties = CGImageSourceCopyPropertiesAtIndex(imageSource, 0, nil) as? [String: Any],
              let width = properties[kCGImagePropertyPixelWidth as String] as? Int,
              let height = properties[kCGImagePropertyPixelHeight as String] as? Int else {
            return nil
        }

        return CGSize(width: width, height: height)
    }

    /// Calculate optimal compression quality for target file size
    func calculateCompressionQuality(for image: UIImage, targetBytes: Int) -> CGFloat {
        var quality: CGFloat = 1.0
        let step: CGFloat = 0.1

        while quality > 0.1 {
            if let data = image.jpegData(compressionQuality: quality), data.count <= targetBytes {
                return quality
            }
            quality -= step
        }

        return 0.1
    }

    /// Get estimated file size for compression quality
    func estimateFileSize(for image: UIImage, quality: CGFloat) -> Int {
        return image.jpegData(compressionQuality: quality)?.count ?? 0
    }

    // MARK: - Batch Processing

    /// Compress multiple images
    func compressMultiple(_ images: [UIImage]) -> [(fullSize: Data?, thumbnail: Data?)] {
        return images.map { compressForStorage($0) }
    }

    /// Compress multiple images asynchronously
    func compressMultipleAsync(_ images: [UIImage]) async -> [(fullSize: Data?, thumbnail: Data?)] {
        await withTaskGroup(of: (Int, (fullSize: Data?, thumbnail: Data?)).self) { group in
            for (index, image) in images.enumerated() {
                group.addTask {
                    let result = self.compressForStorage(image)
                    return (index, result)
                }
            }

            var results = [(Int, (fullSize: Data?, thumbnail: Data?))]()
            for await result in group {
                results.append(result)
            }

            return results
                .sorted { $0.0 < $1.0 }
                .map { $0.1 }
        }
    }
}

// MARK: - UIImage Extensions

extension UIImage {

    /// Convenience method to compress for Patch storage
    func compressedForStorage() -> (fullSize: Data?, thumbnail: Data?) {
        PhotoCompressionService.shared.compressForStorage(self)
    }

    /// Get JPEG data with automatic quality adjustment
    func jpegDataWithMaxSize(_ maxBytes: Int) -> Data? {
        var quality: CGFloat = 1.0
        var data = jpegData(compressionQuality: quality)

        while let imageData = data, imageData.count > maxBytes && quality > 0.1 {
            quality -= 0.1
            data = jpegData(compressionQuality: quality)
        }

        return data
    }
}
