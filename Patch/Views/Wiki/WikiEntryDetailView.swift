import SwiftUI
import UIKit

struct WikiEntryDetailView: View {
    let wikiEntry: WikiEntry
    @State private var showAddToGarden = false
    @State private var showShareSheet = false
    @State private var showShareSuccess = false

    private let guideColumns = [
        GridItem(.flexible(), spacing: AppTheme.Spacing.sm),
        GridItem(.flexible(), spacing: AppTheme.Spacing.sm)
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                headerSection
                quickInfoSection
                descriptionSection
                careGuideSection
                plantingGuideSection
                companionPlantingSection
                growthActionsSection
            }
            .padding(AppTheme.Spacing.md)
            .padding(.bottom, AppTheme.Spacing.xxl)
        }
        .screenBackgroundStyle()
        .navigationTitle(wikiEntry.commonName)
        .navigationBarTitleDisplayMode(.inline)
        .sheet(isPresented: $showAddToGarden) {
            AddPlantView(wikiEntry: wikiEntry)
        }
        .sheet(isPresented: $showShareSheet) {
            ActivityShareSheet(items: shareItems) { completed in
                guard completed else { return }
                GrowthMetricTracker.track(
                    event: "wiki_share_completed",
                    properties: [
                        "entry": wikiEntry.commonName,
                        "category": wikiEntry.category
                    ]
                )
                showShareSuccess = true
            }
        }
        .alert("Shared Successfully", isPresented: $showShareSuccess) {
            Button("Done", role: .cancel) { }
        } message: {
            Text("Thanks for sharing \(wikiEntry.commonName).")
        }
    }

    private var headerSection: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                HStack(spacing: AppTheme.Spacing.xs) {
                    TagPill(title: wikiEntry.category, color: categoryColor)
                    TagPill(title: wikiEntry.difficulty, color: difficultyColor)
                }

                Text(wikiEntry.commonName)
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)

                if let scientific = wikiEntry.scientificName {
                    Text(scientific)
                        .font(.patchSubheadline)
                        .foregroundColor(.patchTextSecondary)
                        .italic()
                }
            }

            Spacer(minLength: 8)

            Image(systemName: "leaf.fill")
                .font(.system(size: 28, weight: .semibold))
                .foregroundColor(.patchPrimary)
                .padding(12)
                .background(Color.patchBackgroundTertiary)
                .clipShape(RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg))
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }

    private var categoryColor: Color {
        switch wikiEntry.category.lowercased() {
        case "vegetables": return .orange
        case "herbs": return .green
        case "flowers": return .pink
        case "fruits": return .red
        case "houseplants": return .teal
        case "succulents": return .mint
        default: return .gray
        }
    }

    private var difficultyColor: Color {
        switch wikiEntry.difficulty.lowercased() {
        case "beginner", "easy": return .green
        case "moderate": return .orange
        case "challenging", "expert": return .red
        default: return .gray
        }
    }

    private var quickInfoSection: some View {
        LazyVGrid(columns: guideColumns, spacing: AppTheme.Spacing.sm) {
            QuickInfoCard(
                icon: "sun.max.fill",
                title: "Sunlight",
                value: wikiEntry.sunlight,
                color: .orange
            )

            QuickInfoCard(
                icon: "drop.fill",
                title: "Water",
                value: wikiEntry.watering,
                color: .blue
            )

            QuickInfoCard(
                icon: "calendar",
                title: "Days to Maturity",
                value: "\(wikiEntry.daysToMaturity)",
                color: .green
            )

            QuickInfoCard(
                icon: "leaf.arrow.triangle.circlepath",
                title: "Difficulty",
                value: wikiEntry.difficulty,
                color: difficultyColor
            )
        }
    }

    private var descriptionSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            sectionHeader(title: "About", subtitle: "Overview of growing characteristics and expected behavior.")

            Text(wikiEntry.entryDescription)
                .font(.patchBody)
                .foregroundColor(.patchTextSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }

    private var careGuideSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            sectionHeader(title: "Care Guide", subtitle: "Use these baseline conditions for healthy growth.")

            VStack(spacing: AppTheme.Spacing.sm) {
                CareGuideRow(icon: "sun.max.fill", title: "Sunlight", value: wikiEntry.sunlight, color: .orange)
                CareGuideRow(icon: "drop.fill", title: "Watering", value: wikiEntry.watering, color: .blue)
                CareGuideRow(icon: "leaf.fill", title: "Soil", value: wikiEntry.soil, color: .brown)

                if let temperature = wikiEntry.temperature {
                    CareGuideRow(icon: "thermometer", title: "Temperature", value: temperature, color: .red)
                }

                if let humidity = wikiEntry.humidity {
                    CareGuideRow(icon: "humidity", title: "Humidity", value: humidity, color: .cyan)
                }

                if let fertilizing = wikiEntry.fertilizing {
                    CareGuideRow(icon: "sparkles", title: "Fertilizing", value: fertilizing, color: .purple)
                }
            }
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }

    private var plantingGuideSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            sectionHeader(title: "Planting Guide", subtitle: "Apply spacing and depth recommendations when planting.")

            VStack(spacing: AppTheme.Spacing.sm) {
                if let depth = wikiEntry.plantingDepth {
                    PlantingGuideRow(icon: "arrow.down.circle.fill", title: "Planting Depth", value: depth)
                }

                if let spacing = wikiEntry.spacing {
                    PlantingGuideRow(icon: "arrow.left.and.right.circle.fill", title: "Spacing", value: spacing)
                }

                if let germination = wikiEntry.germinationTime {
                    PlantingGuideRow(icon: "clock.fill", title: "Germination Time", value: germination)
                }

                if let harvest = wikiEntry.harvestInfo {
                    PlantingGuideRow(icon: "basket.fill", title: "Harvest Info", value: harvest)
                }
            }
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }

    private var companionPlantingSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            sectionHeader(title: "Companion Planting", subtitle: "Pair strategically to reduce risk and improve yield.")

            VStack(spacing: AppTheme.Spacing.sm) {
                if let companions = parseCompanionString(wikiEntry.companionPlants) {
                    CompanionPlantsCard(
                        title: "Good Companions",
                        plants: companions,
                        icon: "checkmark.circle.fill",
                        color: .green
                    )
                }

                if let antagonists = parseCompanionString(wikiEntry.antagonistPlants) {
                    CompanionPlantsCard(
                        title: "Avoid Planting With",
                        plants: antagonists,
                        icon: "xmark.circle.fill",
                        color: .red
                    )
                }
            }
        }
        .padding(AppTheme.Spacing.lg)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }

    private var growthActionsSection: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            sectionHeader(title: "Actions", subtitle: "Add this plant to your tracker or share guidance.")

            PrimaryButton("Add to My Garden", icon: "plus") {
                showAddToGarden = true
            }

            SecondaryButton("Share Care Guide", icon: "square.and.arrow.up") {
                GrowthMetricTracker.track(
                    event: "wiki_share_clicked",
                    properties: [
                        "entry": wikiEntry.commonName,
                        "category": wikiEntry.category
                    ]
                )
                showShareSheet = true
            }

            Text("Shares completed: \(GrowthMetricTracker.count(for: "wiki_share_completed"))")
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
        }
    }

    private func sectionHeader(title: String, subtitle: String) -> some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
            Text(title)
                .font(.patchTitle3)
                .foregroundColor(.patchText)
            Text(subtitle)
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
        }
    }

    private var shareItems: [Any] {
        [
            """
            \(wikiEntry.commonName) care guide from Patch
            Sunlight: \(wikiEntry.sunlight)
            Watering: \(wikiEntry.watering)
            Difficulty: \(wikiEntry.difficulty)

            Open in Patch: \(shareURL.absoluteString)
            """,
            shareURL
        ]
    }

    private var shareURL: URL {
        var components = URLComponents()
        components.scheme = "patch"
        components.host = "wiki"
        components.path = "/search"
        components.queryItems = [
            URLQueryItem(name: "q", value: wikiEntry.commonName),
            URLQueryItem(name: "source", value: "wiki_share")
        ]

        return components.url ?? URL(string: "patch://wiki/search")!
    }

    private func parseCompanionString(_ string: String?) -> [String]? {
        guard let string = string, !string.isEmpty else { return nil }
        return string.components(separatedBy: ",").map { $0.trimmingCharacters(in: .whitespaces) }
    }
}

struct TagPill: View {
    let title: String
    let color: Color

    var body: some View {
        Text(title)
            .font(.patchCaption1)
            .foregroundColor(.white)
            .padding(.horizontal, AppTheme.Spacing.sm)
            .padding(.vertical, AppTheme.Spacing.xxs)
            .background(color)
            .cornerRadius(AppTheme.CornerRadius.full)
    }
}

private struct ActivityShareSheet: UIViewControllerRepresentable {
    let items: [Any]
    let onComplete: (Bool) -> Void

    func makeUIViewController(context: Context) -> UIActivityViewController {
        let controller = UIActivityViewController(activityItems: items, applicationActivities: nil)
        controller.completionWithItemsHandler = { _, completed, _, _ in
            onComplete(completed)
        }
        return controller
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) { }
}

private enum GrowthMetricTracker {
    private static let prefix = "patch.metrics."

    static func track(event: String, properties: [String: String] = [:]) {
        let defaults = UserDefaults.standard
        let key = prefix + event
        defaults.set(defaults.integer(forKey: key) + 1, forKey: key)

        let serializedProperties = properties
            .sorted { $0.key < $1.key }
            .map { "\($0.key)=\($0.value)" }
            .joined(separator: ",")
        print("[GrowthMetric] \(event) \(serializedProperties)")
    }

    static func count(for event: String) -> Int {
        UserDefaults.standard.integer(forKey: prefix + event)
    }
}

struct QuickInfoCard: View {
    let icon: String
    let title: String
    let value: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            Image(systemName: icon)
                .font(.patchHeadline)
                .foregroundColor(color)

            Text(value)
                .font(.patchBodyBold)
                .foregroundColor(.patchText)
                .lineLimit(2)

            Text(title)
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(AppTheme.Spacing.md)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}

struct CareGuideRow: View {
    let icon: String
    let title: String
    let value: String
    let color: Color

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: icon)
                .font(.patchBody)
                .foregroundColor(color)
                .frame(width: 24)

            Text(title)
                .font(.patchSubheadline)
                .foregroundColor(.patchTextSecondary)
                .frame(width: 92, alignment: .leading)

            Spacer()

            Text(value)
                .font(.patchSubheadline)
                .foregroundColor(.patchText)
                .multilineTextAlignment(.trailing)
        }
        .padding(.horizontal, AppTheme.Spacing.md)
        .padding(.vertical, AppTheme.Spacing.sm)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.4))
        .cornerRadius(AppTheme.CornerRadius.md)
    }
}

struct PlantingGuideRow: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: icon)
                .font(.patchBody)
                .foregroundColor(.patchBrown)
                .frame(width: 24)

            Text(title)
                .font(.patchSubheadline)
                .foregroundColor(.patchTextSecondary)
                .frame(width: 120, alignment: .leading)

            Spacer()

            Text(value)
                .font(.patchSubheadline)
                .foregroundColor(.patchText)
                .multilineTextAlignment(.trailing)
        }
        .padding(.horizontal, AppTheme.Spacing.md)
        .padding(.vertical, AppTheme.Spacing.sm)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.4))
        .cornerRadius(AppTheme.CornerRadius.md)
    }
}

struct CompanionPlantsCard: View {
    let title: String
    let plants: [String]
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            HStack(spacing: AppTheme.Spacing.xs) {
                Image(systemName: icon)
                    .foregroundColor(color)
                Text(title)
                    .font(.patchSubheadline)
                    .foregroundColor(.patchText)
            }

            Text(plants.joined(separator: ", "))
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(AppTheme.Spacing.md)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.4))
        .cornerRadius(AppTheme.CornerRadius.md)
    }
}

#Preview {
    let entry = WikiEntry()
    entry.commonName = "Tomato"
    entry.scientificName = "Solanum lycopersicum"
    entry.category = "Vegetables"
    entry.difficulty = "Easy"
    entry.entryDescription = "Tomatoes are warm-season crops that thrive in full sun and nutrient-rich soil."
    entry.sunlight = "Full Sun"
    entry.watering = "Moderate"
    entry.soil = "Loamy"
    entry.daysToMaturity = 75
    entry.spacing = "18-24 in"
    entry.plantingDepth = "1/4 in"
    entry.germinationTime = "7-14 days"
    entry.companionPlants = "Basil, Marigold, Onion"
    entry.antagonistPlants = "Corn, Potato"

    return NavigationStack {
        WikiEntryDetailView(wikiEntry: entry)
    }
}
