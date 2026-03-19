import AVFoundation
import UIKit
import Combine

/// Service for managing camera capture
final class CameraService: NSObject, ObservableObject {

    // MARK: - Published Properties

    @Published var isAuthorized: Bool = false
    @Published var authorizationStatus: AVAuthorizationStatus = .notDetermined
    @Published var isSessionRunning: Bool = false
    @Published var capturedImage: UIImage?
    @Published var error: CameraError?
    @Published var flashMode: AVCaptureDevice.FlashMode = .auto
    @Published var currentCameraPosition: AVCaptureDevice.Position = .back

    // MARK: - Camera Session

    let session = AVCaptureSession()
    private var videoDeviceInput: AVCaptureDeviceInput?
    private let photoOutput = AVCapturePhotoOutput()
    private let sessionQueue = DispatchQueue(label: "com.patch.camera.session")

    // MARK: - Completion Handler

    private var photoCaptureCompletion: ((Result<UIImage, CameraError>) -> Void)?

    // MARK: - Error Types

    enum CameraError: Error, LocalizedError {
        case notAuthorized
        case configurationFailed
        case captureError(String)
        case deviceNotAvailable
        case unknownError

        var errorDescription: String? {
            switch self {
            case .notAuthorized:
                return "Camera access not authorized"
            case .configurationFailed:
                return "Failed to configure camera"
            case .captureError(let message):
                return "Capture error: \(message)"
            case .deviceNotAvailable:
                return "Camera device not available"
            case .unknownError:
                return "Unknown camera error"
            }
        }
    }

    // MARK: - Initialization

    override init() {
        super.init()
        checkAuthorizationStatus()
    }

    // MARK: - Authorization

    /// Check current camera authorization status
    func checkAuthorizationStatus() {
        let status = AVCaptureDevice.authorizationStatus(for: .video)
        DispatchQueue.main.async {
            self.authorizationStatus = status
            self.isAuthorized = status == .authorized
        }
    }

    /// Request camera authorization
    func requestAuthorization() async -> Bool {
        let status = AVCaptureDevice.authorizationStatus(for: .video)

        switch status {
        case .notDetermined:
            let granted = await AVCaptureDevice.requestAccess(for: .video)
            await MainActor.run {
                self.isAuthorized = granted
                self.authorizationStatus = granted ? .authorized : .denied
            }
            return granted

        case .authorized:
            await MainActor.run {
                self.isAuthorized = true
                self.authorizationStatus = .authorized
            }
            return true

        case .denied, .restricted:
            await MainActor.run {
                self.isAuthorized = false
                self.authorizationStatus = status
            }
            return false

        @unknown default:
            return false
        }
    }

    // MARK: - Session Configuration

    /// Configure and start the capture session
    func configureSession() {
        sessionQueue.async { [weak self] in
            guard let self = self else { return }

            guard self.isAuthorized else {
                DispatchQueue.main.async {
                    self.error = .notAuthorized
                }
                return
            }

            self.session.beginConfiguration()
            self.session.sessionPreset = .photo

            // Add video input
            do {
                guard let videoDevice = self.defaultVideoDevice() else {
                    throw CameraError.deviceNotAvailable
                }

                let videoDeviceInput = try AVCaptureDeviceInput(device: videoDevice)

                if self.session.canAddInput(videoDeviceInput) {
                    self.session.addInput(videoDeviceInput)
                    self.videoDeviceInput = videoDeviceInput
                } else {
                    throw CameraError.configurationFailed
                }
            } catch {
                DispatchQueue.main.async {
                    self.error = .configurationFailed
                }
                self.session.commitConfiguration()
                return
            }

            // Add photo output
            if self.session.canAddOutput(self.photoOutput) {
                self.session.addOutput(self.photoOutput)
                if let dimensions = self.videoDeviceInput?.device.activeFormat.supportedMaxPhotoDimensions.max(
                    by: { ($0.width * $0.height) < ($1.width * $1.height) }
                ) {
                    self.photoOutput.maxPhotoDimensions = dimensions
                }
                self.photoOutput.maxPhotoQualityPrioritization = .quality
            } else {
                DispatchQueue.main.async {
                    self.error = .configurationFailed
                }
                self.session.commitConfiguration()
                return
            }

            self.session.commitConfiguration()
        }
    }

    /// Get default video device for current position
    private func defaultVideoDevice() -> AVCaptureDevice? {
        if let device = AVCaptureDevice.default(.builtInDualCamera, for: .video, position: currentCameraPosition) {
            return device
        }

        if let device = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: currentCameraPosition) {
            return device
        }

        return nil
    }

    // MARK: - Session Control

    /// Start the capture session
    func startSession() {
        sessionQueue.async { [weak self] in
            guard let self = self else { return }

            if !self.session.isRunning {
                self.session.startRunning()
                DispatchQueue.main.async {
                    self.isSessionRunning = self.session.isRunning
                }
            }
        }
    }

    /// Stop the capture session
    func stopSession() {
        sessionQueue.async { [weak self] in
            guard let self = self else { return }

            if self.session.isRunning {
                self.session.stopRunning()
                DispatchQueue.main.async {
                    self.isSessionRunning = self.session.isRunning
                }
            }
        }
    }

    // MARK: - Camera Switching

    /// Switch between front and back camera
    func switchCamera() {
        sessionQueue.async { [weak self] in
            guard let self = self else { return }

            let newPosition: AVCaptureDevice.Position = self.currentCameraPosition == .back ? .front : .back

            guard let newDevice = AVCaptureDevice.default(.builtInWideAngleCamera, for: .video, position: newPosition) else {
                return
            }

            do {
                let newInput = try AVCaptureDeviceInput(device: newDevice)

                self.session.beginConfiguration()

                if let currentInput = self.videoDeviceInput {
                    self.session.removeInput(currentInput)
                }

                if self.session.canAddInput(newInput) {
                    self.session.addInput(newInput)
                    self.videoDeviceInput = newInput
                    DispatchQueue.main.async {
                        self.currentCameraPosition = newPosition
                    }
                }

                self.session.commitConfiguration()
            } catch {
                print("Error switching camera: \(error)")
            }
        }
    }

    // MARK: - Flash Control

    /// Cycle through flash modes
    func cycleFlashMode() {
        switch flashMode {
        case .auto:
            flashMode = .on
        case .on:
            flashMode = .off
        case .off:
            flashMode = .auto
        @unknown default:
            flashMode = .auto
        }
    }

    // MARK: - Photo Capture

    /// Capture a photo
    func capturePhoto(completion: @escaping (Result<UIImage, CameraError>) -> Void) {
        sessionQueue.async { [weak self] in
            guard let self = self else {
                completion(.failure(.unknownError))
                return
            }

            self.photoCaptureCompletion = completion

            var settings = AVCapturePhotoSettings()

            // Configure photo settings
            if self.photoOutput.availablePhotoCodecTypes.contains(.hevc) {
                settings = AVCapturePhotoSettings(format: [AVVideoCodecKey: AVVideoCodecType.hevc])
            }

            // Set flash mode
            if self.videoDeviceInput?.device.isFlashAvailable == true {
                settings.flashMode = self.flashMode
            }

            settings.maxPhotoDimensions = self.photoOutput.maxPhotoDimensions

            // Capture
            self.photoOutput.capturePhoto(with: settings, delegate: self)
        }
    }

    /// Capture photo with async/await
    func capturePhoto() async throws -> UIImage {
        try await withCheckedThrowingContinuation { continuation in
            capturePhoto { result in
                switch result {
                case .success(let image):
                    continuation.resume(returning: image)
                case .failure(let error):
                    continuation.resume(throwing: error)
                }
            }
        }
    }

    // MARK: - Focus

    /// Focus at a specific point
    func focus(at point: CGPoint) {
        guard let device = videoDeviceInput?.device else { return }

        do {
            try device.lockForConfiguration()

            if device.isFocusPointOfInterestSupported {
                device.focusPointOfInterest = point
                device.focusMode = .autoFocus
            }

            if device.isExposurePointOfInterestSupported {
                device.exposurePointOfInterest = point
                device.exposureMode = .autoExpose
            }

            device.unlockForConfiguration()
        } catch {
            print("Error focusing: \(error)")
        }
    }
}

// MARK: - AVCapturePhotoCaptureDelegate

extension CameraService: AVCapturePhotoCaptureDelegate {

    func photoOutput(_ output: AVCapturePhotoOutput, didFinishProcessingPhoto photo: AVCapturePhoto, error: Error?) {
        if let error = error {
            DispatchQueue.main.async {
                self.photoCaptureCompletion?(.failure(.captureError(error.localizedDescription)))
                self.photoCaptureCompletion = nil
            }
            return
        }

        guard let imageData = photo.fileDataRepresentation(),
              let image = UIImage(data: imageData) else {
            DispatchQueue.main.async {
                self.photoCaptureCompletion?(.failure(.captureError("Failed to process image")))
                self.photoCaptureCompletion = nil
            }
            return
        }

        // Fix orientation
        let orientedImage = fixOrientation(image)

        DispatchQueue.main.async {
            self.capturedImage = orientedImage
            self.photoCaptureCompletion?(.success(orientedImage))
            self.photoCaptureCompletion = nil
        }
    }

    /// Fix image orientation
    private func fixOrientation(_ image: UIImage) -> UIImage {
        if image.imageOrientation == .up {
            return image
        }

        UIGraphicsBeginImageContextWithOptions(image.size, false, image.scale)
        image.draw(in: CGRect(origin: .zero, size: image.size))
        let normalizedImage = UIGraphicsGetImageFromCurrentImageContext()
        UIGraphicsEndImageContext()

        return normalizedImage ?? image
    }
}
