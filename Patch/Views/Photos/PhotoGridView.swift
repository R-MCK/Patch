import SwiftUI

struct PhotoGridView: View {
    @ObservedObject var viewModel: PhotoGalleryViewModel
    let columns: Int
    let spacing: CGFloat
    let onPhotoTap: (Photo) -> Void
    let onAddPhoto: () -> Void

    private let gridColumns: [GridItem]

    init(
        viewModel: PhotoGalleryViewModel,
        columns: Int = 3,
        spacing: CGFloat = 2,
        onPhotoTap: @escaping (Photo) -> Void,
        onAddPhoto: @escaping () -> Void
    ) {
        self.viewModel = viewModel
        self.columns = columns
        self.spacing = spacing
        self.onPhotoTap = onPhotoTap
        self.onAddPhoto = onAddPhoto
        self.gridColumns = Array(repeating: GridItem(.flexible(), spacing: spacing), count: columns)
    }

    var body: some View {
        LazyVGrid(columns: gridColumns, spacing: spacing) {
            // Add Photo Button
            AddPhotoGridButton(onTap: onAddPhoto)

            // Photo Thumbnails
            ForEach(viewModel.photos) { photo in
                PhotoThumbnailView(
                    photo: photo,
                    image: viewModel.thumbnail(for: photo),
                    isSelectionMode: viewModel.isSelectionMode,
                    isSelected: viewModel.isSelected(photo),
                    onTap: {
                        if viewModel.isSelectionMode {
                            viewModel.toggleSelection(for: photo)
                        } else {
                            onPhotoTap(photo)
                        }
                    },
                    onLongPress: {
                        if !viewModel.isSelectionMode {
                            viewModel.enterSelectionMode()
                            viewModel.toggleSelection(for: photo)
                        }
                    }
                )
            }
        }
        .padding(spacing)
    }
}

// MARK: - Add Photo Grid Button

struct AddPhotoGridButton: View {
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            GeometryReader { geometry in
                ZStack {
                    RoundedRectangle(cornerRadius: AppTheme.CornerRadius.sm)
                        .fill(Color.white.opacity(0.88))
                        .overlay(
                            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.sm)
                                .stroke(Color.patchBackgroundTertiary.opacity(0.8), lineWidth: 1)
                        )

                    VStack(spacing: AppTheme.Spacing.xs) {
                        Image(systemName: "plus")
                            .font(.title2)
                            .foregroundColor(.patchPrimary)

                        Text("Add")
                            .font(.patchCaption2)
                            .foregroundColor(.patchTextSecondary)
                    }
                }
                .frame(width: geometry.size.width, height: geometry.size.width) // Square
            }
            .aspectRatio(1, contentMode: .fit)
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Photo Thumbnail View

struct PhotoThumbnailView: View {
    let photo: Photo
    let image: UIImage?
    let isSelectionMode: Bool
    let isSelected: Bool
    let onTap: () -> Void
    let onLongPress: () -> Void

    @State private var isPressed = false

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Image
                if let image = image {
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: geometry.size.width, height: geometry.size.width)
                        .clipped()
                } else {
                    // Placeholder
                    Rectangle()
                        .fill(Color.patchBackgroundTertiary)
                        .overlay(
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .patchPrimary))
                        )
                }

                // Selection Overlay
                if isSelectionMode {
                    Color.black.opacity(isSelected ? 0.3 : 0)

                    VStack {
                        HStack {
                            Spacer()

                            ZStack {
                                Circle()
                                    .fill(isSelected ? Color.patchPrimary : Color.white.opacity(0.8))
                                    .frame(width: 24, height: 24)

                                if isSelected {
                                    Image(systemName: "checkmark")
                                        .font(.caption)
                                        .fontWeight(.bold)
                                        .foregroundColor(.white)
                                }
                            }
                            .padding(AppTheme.Spacing.xs)
                        }

                        Spacer()
                    }
                }

                // Caption Indicator
                if !isSelectionMode && photo.caption != nil && !(photo.caption?.isEmpty ?? true) {
                    VStack {
                        Spacer()

                        HStack {
                            Image(systemName: "text.bubble.fill")
                                .font(.caption2)
                                .foregroundColor(.white)
                                .padding(4)
                                .background(Color.black.opacity(0.5))
                                .clipShape(Circle())
                                .padding(AppTheme.Spacing.xs)

                            Spacer()
                        }
                    }
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.width) // Square
            .cornerRadius(AppTheme.CornerRadius.sm)
            .scaleEffect(isPressed ? 0.95 : 1.0)
            .animation(AppTheme.Animation.fast, value: isPressed)
        }
        .aspectRatio(1, contentMode: .fit)
        .onTapGesture {
            onTap()
        }
        .onLongPressGesture(minimumDuration: 0.5, pressing: { pressing in
            isPressed = pressing
        }, perform: {
            onLongPress()
        })
    }
}

// MARK: - Photo Gallery Container

struct PhotoGalleryContainerView: View {
    let plant: Plant

    @StateObject private var viewModel: PhotoGalleryViewModel
    @State private var showImageSourcePicker = false
    @State private var showCamera = false
    @State private var showPhotoPicker = false
    @State private var selectedPhoto: Photo?
    @State private var showDeleteConfirmation = false

    init(plant: Plant) {
        self.plant = plant
        self._viewModel = StateObject(wrappedValue: PhotoGalleryViewModel(plant: plant))
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                PhotoGalleryHeaderCard(
                    photoCount: viewModel.photos.count,
                    selectionMode: viewModel.isSelectionMode
                )

                Group {
                    if viewModel.isLoading {
                        LoadingView(message: "Loading photos...")
                            .frame(minHeight: 220)
                    } else if viewModel.photos.isEmpty {
                        EmptyPhotoGalleryView {
                            showImageSourcePicker = true
                        }
                    } else {
                        PhotoGridView(
                            viewModel: viewModel,
                            onPhotoTap: { photo in
                                selectedPhoto = photo
                            },
                            onAddPhoto: {
                                showImageSourcePicker = true
                            }
                        )
                    }
                }
            }
            .padding(AppTheme.Spacing.md)
            .padding(.bottom, AppTheme.Spacing.xxl)
        }
        .screenBackgroundStyle()
        .navigationTitle("Photos")
        .toolbar {
            if viewModel.isSelectionMode {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") {
                        viewModel.exitSelectionMode()
                    }
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        if viewModel.hasSelection {
                            showDeleteConfirmation = true
                        }
                    } label: {
                        Image(systemName: "trash")
                            .foregroundColor(viewModel.hasSelection ? .healthCritical : .patchTextTertiary)
                    }
                    .disabled(!viewModel.hasSelection)
                }

                ToolbarItem(placement: .topBarTrailing) {
                    Button(viewModel.allSelected ? "Deselect All" : "Select All") {
                        if viewModel.allSelected {
                            viewModel.deselectAll()
                        } else {
                            viewModel.selectAll()
                        }
                    }
                }
            } else {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showImageSourcePicker = true
                    } label: {
                        Image(systemName: "plus")
                    }
                }
            }
        }
        .sheet(isPresented: $showImageSourcePicker) {
            ImageSourcePicker(
                isPresented: $showImageSourcePicker,
                onCameraSelect: {
                    showCamera = true
                },
                onLibrarySelect: {
                    showPhotoPicker = true
                }
            )
            .presentationDetents([.height(280)])
        }
        .fullScreenCover(isPresented: $showCamera) {
            CameraCaptureView { image in
                Task {
                    await viewModel.addPhoto(image)
                }
            }
        }
        .sheet(isPresented: $showPhotoPicker) {
            PhotoPickerSheet { images in
                Task {
                    await viewModel.addPhotos(images)
                }
            }
        }
        .fullScreenCover(item: $selectedPhoto) { photo in
            PhotoDetailView(
                photo: photo,
                viewModel: viewModel,
                onDismiss: { selectedPhoto = nil }
            )
        }
        .alert("Delete Photos?", isPresented: $showDeleteConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                viewModel.deleteSelected()
            }
        } message: {
            Text("Delete \(viewModel.selectedCount) selected photo\(viewModel.selectedCount == 1 ? "" : "s")? This cannot be undone.")
        }
        .onAppear {
            viewModel.loadPhotos()
        }
    }
}

// MARK: - Empty Gallery View

struct EmptyPhotoGalleryView: View {
    let onAddPhoto: () -> Void

    var body: some View {
        VStack(spacing: AppTheme.Spacing.lg) {
            Image(systemName: "camera")
                .font(.system(size: 64))
                .foregroundColor(.patchPrimary.opacity(0.5))

            VStack(spacing: AppTheme.Spacing.sm) {
                Text("No Photos Yet")
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)

                Text("Capture photos to document your plant's growth journey")
                    .font(.patchBody)
                    .foregroundColor(.patchTextSecondary)
                    .multilineTextAlignment(.center)
            }

            PrimaryButton("Add Photo", icon: "camera", action: onAddPhoto)
                .padding(.top, AppTheme.Spacing.sm)
        }
        .padding(AppTheme.Spacing.xl)
    }
}

struct PhotoGalleryHeaderCard: View {
    let photoCount: Int
    let selectionMode: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            Text("Photo Journal")
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
            Text(selectionMode ? "Selecting Photos" : "Plant Photos")
                .font(.patchTitle2)
                .foregroundColor(.patchText)
            Text("\(photoCount) photo\(photoCount == 1 ? "" : "s") stored")
                .font(.patchSubheadline)
                .foregroundColor(.patchTextSecondary)
        }
        .cardStyle()
    }
}

// MARK: - Preview

#Preview("Photo Grid") {
    NavigationStack {
        let context = PersistenceController.shared.container.viewContext
        let plant = Plant(context: context)
        plant.id = UUID()
        plant.name = "Test Plant"
        plant.createdAt = Date()

        return PhotoGalleryContainerView(plant: plant)
    }
}
