import SwiftUI

struct PhotoDetailView: View {
    let photo: Photo
    @ObservedObject var viewModel: PhotoGalleryViewModel
    let onDismiss: () -> Void

    @State private var currentPhoto: Photo
    @State private var showCaption = false
    @State private var isZoomed = false
    @State private var captionText: String = ""
    @State private var showDeleteConfirmation = false
    @State private var showEditCaption = false
    @State private var image: UIImage?

    init(photo: Photo, viewModel: PhotoGalleryViewModel, onDismiss: @escaping () -> Void) {
        self.photo = photo
        self.viewModel = viewModel
        self.onDismiss = onDismiss
        self._currentPhoto = State(initialValue: photo)
        self._captionText = State(initialValue: photo.caption ?? "")
    }

    var body: some View {
        ZStack {
            // Background
            Color.black.ignoresSafeArea()

            // Photo Carousel
            TabView(selection: $currentPhoto) {
                ForEach(viewModel.photos) { p in
                    ZoomableImageView(
                        photo: p,
                        viewModel: viewModel,
                        isZoomed: $isZoomed
                    )
                    .tag(p)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .ignoresSafeArea()

            // Controls Overlay
            if !isZoomed {
                VStack {
                    // Top Bar
                    HStack {
                        Button {
                            onDismiss()
                        } label: {
                            Image(systemName: "xmark")
                                .font(.title2)
                                .foregroundColor(.white)
                                .padding()
                                .background(Color.black.opacity(0.5))
                                .clipShape(Circle())
                        }

                        Spacer()

                        // Menu
                        Menu {
                            Button {
                                showEditCaption = true
                            } label: {
                                Label("Edit Caption", systemImage: "pencil")
                            }

                            Button(role: .destructive) {
                                showDeleteConfirmation = true
                            } label: {
                                Label("Delete Photo", systemImage: "trash")
                            }
                        } label: {
                            Image(systemName: "ellipsis")
                                .font(.title2)
                                .foregroundColor(.white)
                                .padding()
                                .background(Color.black.opacity(0.5))
                                .clipShape(Circle())
                        }
                    }
                    .padding()

                    Spacer()

                    // Bottom Info
                    VStack(spacing: AppTheme.Spacing.sm) {
                        // Caption
                        if let caption = currentPhoto.caption, !caption.isEmpty {
                            Text(caption)
                                .font(.patchBody)
                                .foregroundColor(.white)
                                .multilineTextAlignment(.center)
                                .padding(.horizontal)
                        }

                        // Date and Page Indicator
                        HStack {
                            Text(currentPhoto.formattedDate)
                                .font(.patchCaption1)
                                .foregroundColor(.white.opacity(0.7))

                            Spacer()

                            // Page indicator
                            if let index = viewModel.index(of: currentPhoto) {
                                Text("\(index + 1) / \(viewModel.photoCount)")
                                    .font(.patchCaption1)
                                    .foregroundColor(.white.opacity(0.7))
                            }
                        }
                        .padding(.horizontal)
                    }
                    .padding(.bottom, AppTheme.Spacing.xl)
                    .background(
                        LinearGradient(
                            colors: [.clear, .black.opacity(0.5)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                }
            }
        }
        .onChange(of: currentPhoto) { _, newPhoto in
            captionText = newPhoto.caption ?? ""
        }
        .alert("Delete Photo?", isPresented: $showDeleteConfirmation) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                viewModel.deletePhoto(currentPhoto)
                onDismiss()
            }
        } message: {
            Text("This photo will be permanently deleted.")
        }
        .sheet(isPresented: $showEditCaption) {
            EditCaptionSheet(
                caption: captionText,
                onSave: { newCaption in
                    viewModel.updateCaption(for: currentPhoto, caption: newCaption)
                    captionText = newCaption
                }
            )
        }
    }
}

// MARK: - Zoomable Image View

struct ZoomableImageView: View {
    let photo: Photo
    @ObservedObject var viewModel: PhotoGalleryViewModel
    @Binding var isZoomed: Bool

    @State private var image: UIImage?
    @State private var scale: CGFloat = 1.0
    @State private var lastScale: CGFloat = 1.0
    @State private var offset: CGSize = .zero
    @State private var lastOffset: CGSize = .zero

    private let minScale: CGFloat = 1.0
    private let maxScale: CGFloat = 5.0

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                if let image = image {
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .scaleEffect(scale)
                        .offset(offset)
                        .gesture(
                            MagnificationGesture()
                                .onChanged { value in
                                    let delta = value / lastScale
                                    lastScale = value
                                    scale = min(max(scale * delta, minScale), maxScale)
                                    isZoomed = scale > 1.1
                                }
                                .onEnded { _ in
                                    lastScale = 1.0
                                    if scale < minScale {
                                        withAnimation {
                                            scale = minScale
                                            offset = .zero
                                        }
                                    }
                                    isZoomed = scale > 1.1
                                }
                        )
                        .simultaneousGesture(
                            DragGesture()
                                .onChanged { value in
                                    if scale > 1.0 {
                                        offset = CGSize(
                                            width: lastOffset.width + value.translation.width,
                                            height: lastOffset.height + value.translation.height
                                        )
                                    }
                                }
                                .onEnded { _ in
                                    lastOffset = offset
                                    constrainOffset(geometry: geometry)
                                }
                        )
                        .onTapGesture(count: 2) {
                            withAnimation(.spring()) {
                                if scale > 1.0 {
                                    scale = 1.0
                                    offset = .zero
                                    lastOffset = .zero
                                    isZoomed = false
                                } else {
                                    scale = 2.5
                                    isZoomed = true
                                }
                            }
                        }
                } else {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                        .scaleEffect(1.5)
                }
            }
            .frame(width: geometry.size.width, height: geometry.size.height)
        }
        .task {
            image = await viewModel.loadFullImage(for: photo)
        }
    }

    private func constrainOffset(geometry: GeometryProxy) {
        let imageSize = geometry.size
        let scaledWidth = imageSize.width * scale
        let scaledHeight = imageSize.height * scale

        let maxOffsetX = max(0, (scaledWidth - imageSize.width) / 2)
        let maxOffsetY = max(0, (scaledHeight - imageSize.height) / 2)

        withAnimation(.spring()) {
            offset.width = min(max(offset.width, -maxOffsetX), maxOffsetX)
            offset.height = min(max(offset.height, -maxOffsetY), maxOffsetY)
            lastOffset = offset
        }
    }
}

// MARK: - Edit Caption Sheet

struct EditCaptionSheet: View {
    @State var caption: String
    let onSave: (String) -> Void

    @Environment(\.dismiss) private var dismiss
    @FocusState private var isFocused: Bool

    var body: some View {
        NavigationStack {
            VStack(spacing: AppTheme.Spacing.md) {
                TextField("Add a caption...", text: $caption, axis: .vertical)
                    .font(.patchBody)
                    .focused($isFocused)
                    .lineLimit(3...6)
                    .padding()
                    .background(Color.patchBackgroundSecondary)
                    .cornerRadius(AppTheme.CornerRadius.md)

                Text("\(caption.count)/200 characters")
                    .font(.patchCaption2)
                    .foregroundColor(.patchTextTertiary)

                Spacer()
            }
            .padding()
            .navigationTitle("Edit Caption")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        onSave(caption)
                        dismiss()
                    }
                    .fontWeight(.semibold)
                }
            }
            .onAppear {
                isFocused = true
            }
        }
        .presentationDetents([.medium])
    }
}

// MARK: - Photo Carousel View (Standalone)

struct PhotoCarouselView: View {
    let photos: [Photo]
    @ObservedObject var viewModel: PhotoGalleryViewModel
    @Binding var currentIndex: Int

    var body: some View {
        TabView(selection: $currentIndex) {
            ForEach(Array(photos.enumerated()), id: \.element.id) { index, photo in
                if let image = viewModel.fullImage(for: photo) {
                    Image(uiImage: image)
                        .resizable()
                        .aspectRatio(contentMode: .fit)
                        .tag(index)
                } else {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .patchPrimary))
                        .tag(index)
                }
            }
        }
        .tabViewStyle(.page(indexDisplayMode: .automatic))
    }
}

// MARK: - Preview

#Preview("Photo Detail") {
    let context = PersistenceController.shared.container.viewContext
    let plant = Plant(context: context)
    plant.id = UUID()
    plant.name = "Test Plant"
    plant.createdAt = Date()

    let photo = Photo(context: context)
    photo.id = UUID()
    photo.caption = "First bloom of the season!"
    photo.capturedAt = Date()
    photo.plant = plant
    photo.createdAt = Date()

    return PhotoDetailView(
        photo: photo,
        viewModel: PhotoGalleryViewModel(plant: plant),
        onDismiss: {}
    )
}
