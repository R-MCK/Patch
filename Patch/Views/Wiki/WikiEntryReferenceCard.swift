import SwiftUI

struct WikiEntryReferenceCard: View {
    let wikiEntry: WikiEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
            Text("Based on \(wikiEntry.commonName)")
                .font(.patchHeadline)
            Text(wikiEntry.category)
                .font(.patchSubheadline)
                .foregroundColor(.patchTextSecondary)
        }
        .padding()
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.md)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
    }
}
