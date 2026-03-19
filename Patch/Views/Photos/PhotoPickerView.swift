import SwiftUI
import PhotosUI

/// SwiftUI wrapper for PHPickerViewController
struct PhotoPickerView: UIViewControllerRepresentable {
    let selectionLimit: Int
    let onSelect: ([UIImage]) -> Void

    @Environment(\.dismiss) private var dismiss

    init(selectionLimit: Int = 10, onSelect: @escaping ([UIImage]) -> Void) {
        self.selectionLimit = selectionLimit
        self.onSelect = onSelect
    }

    func makeUIViewController(context: Context) -> PHPickerViewController {
        var configuration = PHPickerConfiguration(photoLibrary: .shared())
        configuration.selectionLimit = selectionLimit
        configuration.filter = .images
        configuration.preferredAssetRepresentationMode = .current

        let picker = PHPickerViewController(configuration: configuration)
        picker.delegate = context.coordinator
        return picker
    }

    func updateUIViewController(_ uiViewController: PHPickerViewController, context: Context) {
        // No updates needed
    }

    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    class Coordinator: NSObject, PHPickerViewControllerDelegate {
        let parent: PhotoPickerView

        init(_ parent: PhotoPickerView) {
            self.parent = parent
        }

        func picker(_ picker: PHPickerViewController, didFinishPicking results: [PHPickerResult]) {
            guard !results.isEmpty else {
                parent.dismiss()
                return
            }

            var images: [UIImage] = []
            let group = DispatchGroup()

            for result in results {
                group.enter()

                if result.itemProvider.canLoadObject(ofClass: UIImage.self) {
                    result.itemProvider.loadObject(ofClass: UIImage.self) { object, error in
                        if let image = object as? UIImage {
                            images.append(image)
                        }
                        group.leave()
                    }
                } else {
                    group.leave()
                }
            }

            group.notify(queue: .main) {
                self.parent.onSelect(images)
                self.parent.dismiss()
            }
        }
    }
}

// MARK: - Photo Library Permission Service

final class PhotoLibraryService: ObservableObject {

    static let shared = PhotoLibraryService()

    @Published var authorizationStatus: PHAuthorizationStatus = .notDetermined
    @Published var isAuthorized: Bool = false

    private init() {
        checkAuthorizationStatus()
    }

    /// Check current authorization status
    func checkAuthorizationStatus() {
        let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)
        DispatchQueue.main.async {
            self.authorizationStatus = status
            self.isAuthorized = status == .authorized || status == .limited
        }
    }

    /// Request photo library authorization
    func requestAuthorization() async -> Bool {
        let status = await PHPhotoLibrary.requestAuthorization(for: .readWrite)

        await MainActor.run {
            self.authorizationStatus = status
            self.isAuthorized = status == .authorized || status == .limited
        }

        return status == .authorized || status == .limited
    }
}

// MARK: - Simple Photo Picker Sheet

struct PhotoPickerSheet: View {
    let selectionLimit: Int
    let onSelect: ([UIImage]) -> Void

    @Environment(\.dismiss) private var dismiss
    @StateObject private var libraryService = PhotoLibraryService.shared

    init(selectionLimit: Int = 10, onSelect: @escaping ([UIImage]) -> Void) {
        self.selectionLimit = selectionLimit
        self.onSelect = onSelect
    }

    var body: some View {
        Group {
            if libraryService.isAuthorized {
                PhotoPickerView(selectionLimit: selectionLimit, onSelect: onSelect)
            } else if libraryService.authorizationStatus == .denied {
                permissionDeniedView
            } else {
                requestPermissionView
            }
        }
        .onAppear {
            libraryService.checkAuthorizationStatus()
        }
    }

    private var requestPermissionView: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            Image(systemName: "photo.on.rectangle.angled")
                .font(.system(size: 64))
                .foregroundColor(.patchPrimary)

            Text("Access Your Photos")
                .font(.patchTitle2)
                .foregroundColor(.patchText)

            Text("Allow Patch to access your photo library to add photos of your plants.")
                .font(.patchBody)
                .foregroundColor(.patchTextSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            PrimaryButton("Allow Access") {
                Task {
                    await libraryService.requestAuthorization()
                }
            }
            .padding(.horizontal, AppTheme.Spacing.xl)

            Button("Cancel") {
                dismiss()
            }
            .foregroundColor(.patchTextSecondary)
        }
        .padding()
    }

    private var permissionDeniedView: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            Image(systemName: "photo.on.rectangle.angled")
                .font(.system(size: 64))
                .foregroundColor(.patchTextSecondary)

            Text("Photo Access Denied")
                .font(.patchTitle2)
                .foregroundColor(.patchText)

            Text("Please enable photo library access in Settings to add photos of your plants.")
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

            Button("Cancel") {
                dismiss()
            }
            .foregroundColor(.patchTextSecondary)
        }
        .padding()
    }
}

// MARK: - Image Source Picker (Camera or Library)

struct ImageSourcePicker: View {
    @Binding var isPresented: Bool
    let onCameraSelect: () -> Void
    let onLibrarySelect: () -> Void

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("Add Photo")
                    .font(.patchHeadline)
                    .foregroundColor(.patchText)

                Spacer()

                Button {
                    isPresented = false
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.title2)
                        .foregroundColor(.patchTextSecondary)
                }
            }
            .padding()

            Divider()

            // Options
            VStack(spacing: 0) {
                Button {
                    isPresented = false
                    onCameraSelect()
                } label: {
                    HStack(spacing: AppTheme.Spacing.md) {
                        Image(systemName: "camera.fill")
                            .font(.title2)
                            .foregroundColor(.patchPrimary)
                            .frame(width: 40)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Take Photo")
                                .font(.patchBody)
                                .foregroundColor(.patchText)
                            Text("Use camera to capture a new photo")
                                .font(.patchCaption1)
                                .foregroundColor(.patchTextSecondary)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.patchCaption1)
                            .foregroundColor(.patchTextTertiary)
                    }
                    .padding()
                }

                Divider()
                    .padding(.leading, 56)

                Button {
                    isPresented = false
                    onLibrarySelect()
                } label: {
                    HStack(spacing: AppTheme.Spacing.md) {
                        Image(systemName: "photo.on.rectangle")
                            .font(.title2)
                            .foregroundColor(.patchPrimary)
                            .frame(width: 40)

                        VStack(alignment: .leading, spacing: 2) {
                            Text("Choose from Library")
                                .font(.patchBody)
                                .foregroundColor(.patchText)
                            Text("Select photos from your photo library")
                                .font(.patchCaption1)
                                .foregroundColor(.patchTextSecondary)
                        }

                        Spacer()

                        Image(systemName: "chevron.right")
                            .font(.patchCaption1)
                            .foregroundColor(.patchTextTertiary)
                    }
                    .padding()
                }
            }

            Spacer()
        }
        .background(Color.patchBackground)
    }
}

// MARK: - Preview

#Preview("Photo Picker Sheet") {
    PhotoPickerSheet { images in
        print("Selected \(images.count) images")
    }
}

#Preview("Image Source Picker") {
    ImageSourcePicker(
        isPresented: .constant(true),
        onCameraSelect: { print("Camera") },
        onLibrarySelect: { print("Library") }
    )
    .presentationDetents([.height(280)])
}
