import XCTest
import UIKit
@testable import Patch

final class PhotoCompressionServiceTests: XCTestCase {
    
    var compressionService: PhotoCompressionService!
    
    override func setUpWithError() throws {
        compressionService = PhotoCompressionService.shared
    }
    
    override func tearDownWithError() throws {
        compressionService = nil
    }
    
    // MARK: - Basic Compression Tests
    
    func testCompressForStorage() throws {
        // Given
        let image = createTestImage(size: CGSize(width: 2000, height: 1500))
        
        // When
        let result = compressionService.compressForStorage(image)
        
        // Then
        XCTAssertNotNil(result.fullSize, "Full-size data should not be nil")
        XCTAssertNotNil(result.thumbnail, "Thumbnail data should not be nil")
        XCTAssertLessThan(result.fullSize!.count, 5 * 1024 * 1024, "Full image should be less than 5MB")
        XCTAssertLessThan(result.thumbnail!.count, 100 * 1024, "Thumbnail should be less than 100KB")
    }
    
    func testCompressFullSize() throws {
        // Given
        let image = createTestImage(size: CGSize(width: 3000, height: 2000))
        
        // When
        let compressedData = compressionService.compressFullSize(image)
        
        // Then
        XCTAssertNotNil(compressedData, "Compressed data should not be nil")
        XCTAssertLessThan(compressedData!.count, 5 * 1024 * 1024, "Should be under 5MB")
    }
    
    func testGenerateThumbnail() throws {
        // Given
        let image = createTestImage(size: CGSize(width: 2000, height: 1500))
        
        // When
        let thumbnailData = compressionService.generateThumbnail(image)
        
        // Then
        XCTAssertNotNil(thumbnailData, "Thumbnail data should not be nil")
        XCTAssertLessThan(thumbnailData!.count, 100 * 1024, "Should be under 100KB")
        
        // Verify thumbnail size
        if let thumbnail = UIImage(data: thumbnailData!) {
            let size = thumbnail.size
            XCTAssertLessThanOrEqual(size.width, 300, "Thumbnail width should not exceed 300px")
            XCTAssertLessThanOrEqual(size.height, 300, "Thumbnail height should not exceed 300px")
        }
    }
    
    // MARK: - Resize Tests
    
    func testResizeImage() throws {
        // Given
        let image = createTestImage(size: CGSize(width: 2000, height: 1500))
        let maxSize: CGFloat = 500
        
        // When
        let resizedImage = compressionService.resizeImage(image, maxDimension: maxSize)
        
        // Then
        let size = resizedImage.size
        let maxDimension = max(size.width, size.height)
        XCTAssertLessThanOrEqual(maxDimension, maxSize, "Max dimension should not exceed limit")
        XCTAssertLessThanOrEqual(abs(size.width/size.height - 2000/1500), 0.1, "Aspect ratio should be preserved")
    }
    
    func testResizeImageWithoutResizing() throws {
        // Given
        let image = createTestImage(size: CGSize(width: 200, height: 150))
        let maxSize: CGFloat = 500
        
        // When
        let resizedImage = compressionService.resizeImage(image, maxDimension: maxSize)
        
        // Then
        XCTAssertEqual(resizedImage.size.width, image.size.width, "Width should remain unchanged")
        XCTAssertEqual(resizedImage.size.height, image.size.height, "Height should remain unchanged")
    }
    
    func testCropToSquare() throws {
        // Given
        let image = createTestImage(size: CGSize(width: 2000, height: 1500))
        
        // When
        let squareImage = compressionService.cropToSquare(image)
        
        // Then
        let size = squareImage.size
        XCTAssertEqual(size.width, size.height, "Image should be square")
        XCTAssertEqual(size.width, 1500, "Square should be based on shorter dimension")
    }
    
    func testGenerateSquareThumbnail() throws {
        // Given
        let image = createTestImage(size: CGSize(width: 2000, height: 1500))
        let thumbnailSize: CGFloat = 150
        
        // When
        let thumbnailData = compressionService.generateSquareThumbnail(image, size: thumbnailSize)
        
        // Then
        XCTAssertNotNil(thumbnailData, "Thumbnail data should not be nil")
        
        if let thumbnail = UIImage(data: thumbnailData!) {
            let size = thumbnail.size
            XCTAssertEqual(size.width, thumbnailSize, "Thumbnail width should match requested size")
            XCTAssertEqual(size.height, thumbnailSize, "Thumbnail height should match requested size")
        }
    }
    
    // MARK: - Quality Tests
    
    func testCalculateCompressionQuality() throws {
        // Given
        let image = createTestImage(size: CGSize(width: 1000, height: 1000))
        let targetBytes = 50 * 1024 // 50KB
        
        // When
        let quality = compressionService.calculateCompressionQuality(for: image, targetBytes: targetBytes)
        
        // Then
        XCTAssertGreaterThanOrEqual(quality, 0.1, "Quality should be at least 0.1")
        XCTAssertLessThanOrEqual(quality, 1.0, "Quality should not exceed 1.0")
        
        // Verify the quality produces expected size
        if let data = image.jpegData(compressionQuality: quality) {
            XCTAssertLessThanOrEqual(data.count, targetBytes * 1.2, "Should be close to target size (20% tolerance)")
        }
    }
    
    func testEstimateFileSize() throws {
        // Given
        let image = createTestImage(size: CGSize(width: 1000, height: 1000))
        let quality: CGFloat = 0.8
        
        // When
        let estimatedSize = compressionService.estimateFileSize(for: image, quality: quality)
        
        // Then
        let actualSize = image.jpegData(compressionQuality: quality)?.count ?? 0
        XCTAssertEqual(estimatedSize, actualSize, "Estimated size should match actual size")
    }
    
    // MARK: - Batch Processing Tests
    
    func testCompressMultiple() throws {
        // Given
        let images = [
            createTestImage(size: CGSize(width: 2000, height: 1500)),
            createTestImage(size: CGSize(width: 1500, height: 2000)),
            createTestImage(size: CGSize(width: 1000, height: 1000))
        ]
        
        // When
        let results = compressionService.compressMultiple(images)
        
        // Then
        XCTAssertEqual(results.count, images.count, "Should process all images")
        
        for result in results {
            XCTAssertNotNil(result.fullSize, "Each image should have full-size data")
            XCTAssertNotNil(result.thumbnail, "Each image should have thumbnail data")
        }
    }
    
    func testCompressMultipleAsync() throws {
        // Given
        let images = [
            createTestImage(size: CGSize(width: 2000, height: 1500)),
            createTestImage(size: CGSize(width: 1500, height: 2000)),
            createTestImage(size: CGSize(width: 1000, height: 1000))
        ]
        
        let expectation = XCTestExpectation(description: "Async compression completes")
        
        // When
        Task {
            let results = await compressionService.compressMultipleAsync(images)
            
            // Then
            XCTAssertEqual(results.count, images.count, "Should process all images asynchronously")
            
            for result in results {
                XCTAssertNotNil(result.fullSize, "Each image should have full-size data")
                XCTAssertNotNil(result.thumbnail, "Each image should have thumbnail data")
            }
            
            expectation.fulfill()
        }
        
        await fulfillment(of: [expectation], timeout: 5.0)
    }
    
    // MARK: - Edge Cases Tests
    
    func testCompressNilImage() throws {
        // Given
        let image: UIImage? = nil
        
        // When
        let result = compressionService.compressForStorage(image!)
        
        // Then
        XCTAssertNil(result.fullSize, "Should handle nil image gracefully")
        XCTAssertNil(result.thumbnail, "Should handle nil image gracefully")
    }
    
    func testCompressVeryLargeImage() throws {
        // Given
        let image = createTestImage(size: CGSize(width: 8000, height: 6000))
        
        // When
        let result = compressionService.compressForStorage(image)
        
        // Then
        XCTAssertNotNil(result.fullSize, "Should handle very large images")
        XCTAssertNotNil(result.thumbnail, "Should generate thumbnail for very large images")
        XCTAssertLessThan(result.fullSize!.count, 5 * 1024 * 1024, "Should compress large images under 5MB")
    }
    
    func testGetImageDimensions() throws {
        // Given
        let size = CGSize(width: 1920, height: 1080)
        let image = createTestImage(size: size)
        let imageData = image.jpegData(compressionQuality: 0.8)!
        
        // When
        let detectedSize = compressionService.getImageDimensions(from: imageData)
        
        // Then
        XCTAssertNotNil(detectedSize, "Should detect image dimensions")
        XCTAssertEqual(detectedSize?.width, size.width, accuracy: 1, "Should detect correct width")
        XCTAssertEqual(detectedSize?.height, size.height, accuracy: 1, "Should detect correct height")
    }
    
    // MARK: - Performance Tests
    
    func testCompressionPerformance() throws {
        // Given
        let image = createTestImage(size: CGSize(width: 4000, height: 3000))
        
        // When & Then
        measure {
            _ = compressionService.compressForStorage(image)
        }
    }
    
    // MARK: - Helper Methods
    
    private func createTestImage(size: CGSize) -> UIImage {
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { context in
            // Create a gradient background
            let colors = [UIColor.systemBlue.cgColor, UIColor.systemGreen.cgColor]
            let colorSpace = CGColorSpaceCreateDeviceRGB()
            let gradient = CGGradient(colorsSpace: colorSpace, colors: colors as CFArray, locations: nil)!
            
            context.cgContext.drawLinearGradient(
                gradient,
                start: CGPoint.zero,
                end: CGPoint(x: size.width, y: size.height),
                options: []
            )
            
            // Add some text for content variation
            let text = "Test Image \(size.width)x\(size.height)"
            text.draw(in: CGRect(x: 20, y: 20, width: size.width - 40, height: 100), withAttributes: [
                .font: UIFont.systemFont(ofSize: 24),
                .foregroundColor: UIColor.white
            ])
        }
    }
}