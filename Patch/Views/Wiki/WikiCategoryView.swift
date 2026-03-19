import SwiftUI

struct WikiCategoryView: View {
    let category: WikiEntry.Category
    @StateObject private var viewModel = WikiCategoryViewModel()
    
    private let columns = [
        GridItem(.flexible()),
        GridItem(.flexible()),
        GridItem(.flexible())
    ]
    
    var body: some View {
        ScrollView {
            LazyVGrid(columns: columns, spacing: 12) {
                ForEach(viewModel.entries, id: \.id) { entry in
                    NavigationLink(destination: WikiEntryDetailView(wikiEntry: entry)) {
                        CategoryEntryCard(entry: entry)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
            .padding(AppTheme.Spacing.md)
            .padding(.bottom, AppTheme.Spacing.xxl)
        }
        .screenBackgroundStyle()
        .navigationTitle(category.displayName)
        .task {
            await viewModel.loadEntries(category: category)
        }
    }
}

struct CategoryEntryCard: View {
    let entry: WikiEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(entry.commonName)
                .font(.subheadline)
                .fontWeight(.semibold)
                .foregroundColor(.primary)
                .lineLimit(1)
            
            if let scientific = entry.scientificName {
                Text(scientific)
                    .font(.caption2)
                    .foregroundColor(.secondary)
                    .italic()
                    .lineLimit(1)
            }
            
            HStack {
                Text(entry.difficulty)
                    .font(.caption2)
                    .foregroundColor(.green)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppTheme.Spacing.md)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

#Preview {
    NavigationStack {
        WikiCategoryView(category: .vegetables)
    }
}