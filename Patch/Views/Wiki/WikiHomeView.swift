import SwiftUI

struct WikiHomeView: View {
    @StateObject private var viewModel = WikiHomeViewModel()
    @State private var searchText = ""

    private let columns = [
        GridItem(.flexible(), spacing: AppTheme.Spacing.md),
        GridItem(.flexible(), spacing: AppTheme.Spacing.md)
    ]

    private var isSearching: Bool {
        !searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                    WikiHeroCard(
                        totalEntries: totalEntryCount,
                        categoryCount: WikiEntry.Category.allCases.count
                    )

                    if isSearching {
                        searchResultsSection
                    } else {
                        categoriesSection
                        featuredEntriesSection
                    }
                }
                .padding(.horizontal, AppTheme.Spacing.md)
                .padding(.vertical, AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xxl)
            }
            .screenBackgroundStyle()
            .navigationTitle("Plant Wiki")
            .searchable(text: $searchText, prompt: "Search plants by name, sunlight, or category")
            .onChange(of: searchText) { _, newValue in
                Task {
                    await viewModel.search(query: newValue)
                }
            }
            .task {
                await viewModel.loadWikiData()
            }
        }
    }

    private var totalEntryCount: Int {
        viewModel.categoryCounts.values.reduce(0, +)
    }

    private var categoriesSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            sectionHeading(
                title: "Browse by Category",
                subtitle: "Jump directly into the plant family you are researching."
            )

            LazyVGrid(columns: columns, spacing: AppTheme.Spacing.md) {
                ForEach(WikiEntry.Category.allCases, id: \.self) { category in
                    NavigationLink(destination: WikiCategoryView(category: category)) {
                        CategoryCardView(
                            name: category.displayName,
                            icon: category.icon,
                            color: category.color,
                            count: viewModel.categoryCounts[category.rawValue] ?? 0
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var featuredEntriesSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            sectionHeading(
                title: "Featured Plants",
                subtitle: "\(min(viewModel.featuredEntries.count, 8)) highlighted entries handpicked for quick learning."
            )

            LazyVGrid(columns: columns, spacing: AppTheme.Spacing.md) {
                ForEach(Array(viewModel.featuredEntries.prefix(8).enumerated()), id: \.element.id) { _, entry in
                    NavigationLink(destination: WikiEntryDetailView(wikiEntry: entry)) {
                        FeaturedEntryCard(entry: entry)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }

    private var searchResultsSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            sectionHeading(
                title: "Search Results",
                subtitle: "\(viewModel.searchResults.count) matching entries"
            )

            if viewModel.isLoading {
                LoadingView(message: "Searching wiki...")
                    .frame(height: 160)
            } else if viewModel.searchResults.isEmpty {
                EmptyStateView(
                    "No Matches",
                    message: "Try another plant name or category.",
                    icon: "magnifyingglass"
                )
                .frame(height: 220)
            } else {
                LazyVStack(spacing: AppTheme.Spacing.sm) {
                    ForEach(viewModel.searchResults, id: \.id) { entry in
                        NavigationLink(destination: WikiEntryDetailView(wikiEntry: entry)) {
                            SearchResultRow(entry: entry)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
        }
    }

    private func sectionHeading(title: String, subtitle: String) -> some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
            Text(title)
                .font(.patchTitle3)
                .foregroundColor(.patchText)
            Text(subtitle)
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
        }
    }
}

struct WikiHeroCard: View {
    let totalEntries: Int
    let categoryCount: Int

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            HStack(alignment: .top, spacing: AppTheme.Spacing.md) {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                    Text("Grow Better")
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                    Text("Plant Knowledge Base")
                        .font(.patchTitle2)
                        .foregroundColor(.patchText)
                    Text("\(totalEntries) entries across \(categoryCount) categories")
                        .font(.patchSubheadline)
                        .foregroundColor(.patchTextSecondary)
                }

                Spacer(minLength: 12)

                Image(systemName: "book.closed.fill")
                    .font(.system(size: 30, weight: .semibold))
                    .foregroundColor(.patchPrimary)
                    .padding(16)
                    .background(Color.patchBackgroundTertiary)
                    .clipShape(RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg))
            }

            Label("Use search for care, planting depth, sunlight, and companion tips.", systemImage: "sparkles")
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }
}

// MARK: - Category Card View

struct CategoryCardView: View {
    let name: String
    let icon: String
    let color: String
    let count: Int

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            HStack {
                Image(systemName: icon)
                    .font(.patchHeadline)
                    .foregroundColor(colorFromString(color))
                    .frame(width: 34, height: 34)
                    .background(colorFromString(color).opacity(0.17))
                    .clipShape(Circle())

                Spacer()

                Text("\(count)")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)
            }

            Text(name)
                .font(.patchSubheadline)
                .foregroundColor(.patchText)
                .lineLimit(1)

            Text("\(count) entries")
                .font(.patchCaption2)
                .foregroundColor(.patchTextSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppTheme.Spacing.md)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }

    private func colorFromString(_ color: String) -> Color {
        switch color.lowercased() {
        case "orange": return .orange
        case "green": return .green
        case "pink": return .pink
        case "red": return .red
        case "teal": return .teal
        case "mint": return .mint
        default: return .gray
        }
    }
}

// MARK: - Featured Entry Card

struct FeaturedEntryCard: View {
    let entry: WikiEntry

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            HStack(spacing: AppTheme.Spacing.xs) {
                Image(systemName: "star.fill")
                    .foregroundColor(.yellow)
                    .font(.patchCaption2)

                Text("Featured")
                    .font(.patchCaption2)
                    .foregroundColor(.patchTextSecondary)
            }

            Text(entry.commonName)
                .font(.patchSubheadline)
                .foregroundColor(.patchText)
                .lineLimit(1)

            if let scientific = entry.scientificName {
                Text(scientific)
                    .font(.patchCaption2)
                    .foregroundColor(.patchTextSecondary)
                    .italic()
                    .lineLimit(1)
            }

            Spacer(minLength: 4)

            VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                Label(entry.sunlight, systemImage: "sun.max.fill")
                    .font(.patchCaption2)
                    .foregroundColor(.patchTextSecondary)
                Label(entry.watering, systemImage: "drop.fill")
                    .font(.patchCaption2)
                    .foregroundColor(.patchTextSecondary)
            }
        }
        .frame(maxWidth: .infinity, minHeight: 128, alignment: .leading)
        .padding(AppTheme.Spacing.md)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

// MARK: - Search Result Row

struct SearchResultRow: View {
    let entry: WikiEntry

    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                .fill(Color.patchBackgroundSecondary)
                .frame(width: 56, height: 56)
                .overlay(
                    Image(systemName: "leaf.fill")
                        .foregroundColor(.patchPrimary)
                )

            VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                Text(entry.commonName)
                    .font(.patchBodyBold)
                    .foregroundColor(.patchText)

                if let scientific = entry.scientificName {
                    Text(scientific)
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                        .lineLimit(1)
                }

                Text(entry.category)
                    .font(.patchCaption2)
                    .foregroundColor(.patchTextTertiary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.patchCaption1)
                .foregroundColor(.patchTextTertiary)
        }
        .padding(AppTheme.Spacing.md)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

#Preview("Wiki Home") {
    WikiHomeView()
}
