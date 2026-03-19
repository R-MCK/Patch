import SwiftUI
import AVFoundation

struct CameraCaptureView: View {
    @StateObject private var cameraService = CameraService()
    @Environment(\.dismiss) private var dismiss

    let onCapture: (UIImage) -> Void

    @State private var showCapturedImage = false
    @State private var capturedImage: UIImage?
    @State private var showPermissionAlert = false

    var body: some View {
        ZStack {
            // Camera Preview
            if cameraService.isAuthorized {
                CameraPreviewView(session: cameraService.session)
                    .ignoresSafeArea()
                    .onTapGesture { location in
                        // Convert tap to normalized coordinates
                        let normalizedPoint = CGPoint(
                            x: location.x / UIScreen.main.bounds.width,
                            y: location.y / UIScreen.main.bounds.height
                        )
                        cameraService.focus(at: normalizedPoint)
                    }
            } else {
                // Permission not granted view
                VStack(spacing: AppTheme.Spacing.lg) {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 64))
                        .foregroundColor(.patchTextSecondary)

                    Text("Camera Access Required")
                        .font(.patchTitle2)
                        .foregroundColor(.patchText)

                    Text("Please enable camera access in Settings to take photos of your plants.")
                        .font(.patchBody)
                        .foregroundColor(.patchTextSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)

                    PrimaryButton("Open Settings") {
                        if let url = URL(string: UIApplication.openSettingsURLString) {
                            UIApplication.shared.open(url)
                        }
                    }
                    .padding(.horizontal, AppTheme.Spacing.xl)
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .background(Color.black)
            }

            // Camera Controls Overlay
            if cameraService.isAuthorized {
                VStack {
                    // Top Bar
                    HStack {
                        // Close Button
                        Button {
                            dismiss()
                        } label: {
                            Image(systemName: "xmark")
                                .font(.title2)
                                .foregroundColor(.white)
                                .padding()
                                .background(Color.black.opacity(0.5))
                                .clipShape(Circle())
                        }

                        Spacer()

                        // Flash Button
                        Button {
                            cameraService.cycleFlashMode()
                        } label: {
                            Image(systemName: flashIcon)
                                .font(.title2)
                                .foregroundColor(flashColor)
                                .padding()
                                .background(Color.black.opacity(0.5))
                                .clipShape(Circle())
                        }
                    }
                    .padding()

                    Spacer()

                    // Bottom Controls
                    HStack(alignment: .center) {
                        // Gallery Button (placeholder)
                        Button {
                            // Would open photo picker
                        } label: {
                            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.sm)
                                .fill(Color.white.opacity(0.3))
                                .frame(width: 50, height: 50)
                                .overlay(
                                    Image(systemName: "photo.on.rectangle")
                                        .foregroundColor(.white)
                                )
                        }

                        Spacer()

                        // Capture Button
                        Button {
                            capturePhoto()
                        } label: {
                            ZStack {
                                Circle()
                                    .stroke(Color.white, lineWidth: 4)
                                    .frame(width: 74, height: 74)

                                Circle()
                                    .fill(Color.white)
                                    .frame(width: 60, height: 60)
                            }
                        }

                        Spacer()

                        // Switch Camera Button
                        Button {
                            cameraService.switchCamera()
                        } label: {
                            Image(systemName: "camera.rotate")
                                .font(.title2)
                                .foregroundColor(.white)
                                .frame(width: 50, height: 50)
                                .background(Color.black.opacity(0.5))
                                .clipShape(Circle())
                        }
                    }
                    .padding(.horizontal, AppTheme.Spacing.xl)
                    .padding(.bottom, AppTheme.Spacing.xl)
                }
            }
        }
        .background(Color.black)
        .onAppear {
            Task {
                let authorized = await cameraService.requestAuthorization()
                if authorized {
                    cameraService.configureSession()
                    cameraService.startSession()
                }
            }
        }
        .onDisappear {
            cameraService.stopSession()
        }
        .fullScreenCover(isPresented: $showCapturedImage) {
            if let image = capturedImage {
                PhotoReviewView(image: image) { accepted in
                    if accepted {
                        onCapture(image)
                        dismiss()
                    } else {
                        showCapturedImage = false
                        capturedImage = nil
                    }
                }
            }
        }
    }

    // MARK: - Computed Properties

    private var flashIcon: String {
        switch cameraService.flashMode {
        case .auto:
            return "bolt.badge.automatic"
        case .on:
            return "bolt.fill"
        case .off:
            return "bolt.slash"
        @unknown default:
            return "bolt.badge.automatic"
        }
    }

    private var flashColor: Color {
        switch cameraService.flashMode {
        case .on:
            return .yellow
        default:
            return .white
        }
    }

    // MARK: - Methods

    private func capturePhoto() {
        cameraService.capturePhoto { result in
            switch result {
            case .success(let image):
                capturedImage = image
                showCapturedImage = true
            case .failure(let error):
                print("Capture error: \(error)")
            }
        }
    }
}

// MARK: - Camera Preview UIViewRepresentable

struct CameraPreviewView: UIViewRepresentable {
    let session: AVCaptureSession

    func makeUIView(context: Context) -> CameraPreviewUIView {
        let view = CameraPreviewUIView()
        view.session = session
        return view
    }

    func updateUIView(_ uiView: CameraPreviewUIView, context: Context) {
        // No updates needed
    }
}

class CameraPreviewUIView: UIView {
    var session: AVCaptureSession? {
        didSet {
            if let session = session {
                previewLayer?.session = session
            }
        }
    }

    private var previewLayer: AVCaptureVideoPreviewLayer? {
        layer as? AVCaptureVideoPreviewLayer
    }

    override class var layerClass: AnyClass {
        AVCaptureVideoPreviewLayer.self
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        previewLayer?.frame = bounds
        previewLayer?.videoGravity = .resizeAspectFill
    }
}

// MARK: - Photo Review View

struct PhotoReviewView: View {
    let image: UIImage
    let onComplete: (Bool) -> Void

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            // Image
            Image(uiImage: image)
                .resizable()
                .aspectRatio(contentMode: .fit)

            // Controls
            VStack {
                Spacer()

                HStack(spacing: AppTheme.Spacing.xl) {
                    // Retake Button
                    Button {
                        onComplete(false)
                    } label: {
                        VStack(spacing: AppTheme.Spacing.xs) {
                            Image(systemName: "arrow.counterclockwise")
                                .font(.title)
                            Text("Retake")
                                .font(.patchCaption1)
                        }
                        .foregroundColor(.white)
                        .frame(width: 80)
                    }

                    Spacer()

                    // Use Photo Button
                    Button {
                        onComplete(true)
                    } label: {
                        VStack(spacing: AppTheme.Spacing.xs) {
                            Image(systemName: "checkmark")
                                .font(.title)
                            Text("Use Photo")
                                .font(.patchCaption1)
                        }
                        .foregroundColor(.patchPrimary)
                        .frame(width: 80)
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.xl)
                .padding(.bottom, AppTheme.Spacing.xl)
            }
        }
    }
}

// MARK: - Preview

#Preview("Camera Capture") {
    CameraCaptureView { image in
        print("Captured image: \(image.size)")
    }
}
