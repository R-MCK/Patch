import SwiftUI

// MARK: - App Theme
// NOTE: All patch* colors are hardcoded light-mode values.
// The app forces .preferredColorScheme(.light) in PatchApp.swift.
// Dark mode requires full color system refactor when/if needed.

/// Central theme configuration for the Patch app
enum AppTheme {

    // MARK: - Spacing

    enum Spacing {
        static let xxs: CGFloat = 2
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
        static let xl: CGFloat = 32
        static let xxl: CGFloat = 48
    }

    // MARK: - Corner Radius

    enum CornerRadius {
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 18
        static let xl: CGFloat = 24
        static let xxl: CGFloat = 24
        static let full: CGFloat = 9999
    }

    // MARK: - Shadow

    enum Shadow {
        static let sm = ShadowStyle(color: Color.black.opacity(0.04), radius: 6, x: 0, y: 2)
        static let md = ShadowStyle(color: Color.black.opacity(0.08), radius: 14, x: 0, y: 8)
        static let lg = ShadowStyle(color: Color.black.opacity(0.14), radius: 24, x: 0, y: 12)
    }

    // MARK: - Animation

    enum Animation {
        static let fast = SwiftUI.Animation.easeInOut(duration: 0.15)
        static let normal = SwiftUI.Animation.easeInOut(duration: 0.25)
        static let slow = SwiftUI.Animation.easeInOut(duration: 0.4)
        static let spring = SwiftUI.Animation.spring(response: 0.3, dampingFraction: 0.7)
    }
}

// MARK: - Shadow Style

struct ShadowStyle {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat
}

// MARK: - Color Extension

extension Color {

    // MARK: - Brand Colors

    /// Primary green - main brand color
    static let patchGreen = Color(red: 0.196, green: 0.424, blue: 0.235)

    /// Light green for accents
    static let patchGreenLight = Color(red: 0.294, green: 0.565, blue: 0.341)

    /// Dark green for text on light backgrounds
    static let patchGreenDark = Color(red: 0.106, green: 0.231, blue: 0.133)

    /// Secondary earth tone
    static let patchBrown = Color(red: 0.576, green: 0.435, blue: 0.282)

    /// Light brown/tan
    static let patchTan = Color(red: 0.863, green: 0.776, blue: 0.635)

    // MARK: - Semantic Colors

    /// Primary action color
    static let patchPrimary = Color.patchGreen

    /// Secondary action color
    static let patchSecondary = Color.patchBrown

    /// Background colors - light mode (Earth tones)
    static let patchBackground = Color(red: 0.953, green: 0.969, blue: 0.937)
    static let patchBackgroundSecondary = Color(red: 0.914, green: 0.941, blue: 0.89)
    static let patchBackgroundTertiary = Color(red: 0.855, green: 0.902, blue: 0.827)

    /// Text colors (Brownish-grays instead of harsh black)
    static let patchText = Color(red: 0.11, green: 0.16, blue: 0.12)
    static let patchTextSecondary = Color(red: 0.25, green: 0.34, blue: 0.26)
    static let patchTextTertiary = Color(red: 0.43, green: 0.52, blue: 0.44)

    // MARK: - Status Colors

    /// Health status colors
    static let healthExcellent = Color(red: 0.133, green: 0.773, blue: 0.369)
    static let healthGood = Color(red: 0.518, green: 0.8, blue: 0.086)
    static let healthFair = Color(red: 0.918, green: 0.706, blue: 0.024)
    static let healthPoor = Color(red: 0.976, green: 0.451, blue: 0.086)
    static let healthCritical = Color(red: 0.937, green: 0.263, blue: 0.267)

    // MARK: - Care Task Colors

    static let taskWatering = Color(red: 0.231, green: 0.51, blue: 0.965)
    static let taskFertilizing = Color(red: 0.133, green: 0.773, blue: 0.369)
    static let taskPruning = Color(red: 0.976, green: 0.451, blue: 0.086)
    static let taskPestControl = Color(red: 0.937, green: 0.263, blue: 0.267)
    static let taskHarvesting = Color(red: 0.918, green: 0.706, blue: 0.024)

    // MARK: - Category Colors

    static let categoryVegetables = Color(red: 0.976, green: 0.451, blue: 0.086)
    static let categoryHerbs = Color(red: 0.133, green: 0.773, blue: 0.369)
    static let categoryFlowers = Color(red: 0.925, green: 0.282, blue: 0.6)
    static let categoryFruits = Color(red: 0.937, green: 0.263, blue: 0.267)
    static let categoryHouseplants = Color(red: 0.078, green: 0.722, blue: 0.651)
    static let categorySucculents = Color(red: 0.024, green: 0.714, blue: 0.831)

    // MARK: - Hex Initializer

    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }

    // MARK: - Dark Mode Adaptivity

    /// Lighten color for dark mode backgrounds
    func lightened(by amount: CGFloat = 0.2) -> Color {
        Color(
            red: min(1, self.rgba.red + amount),
            green: min(1, self.rgba.green + amount),
            blue: min(1, self.rgba.blue + amount),
            opacity: self.rgba.opacity
        )
    }

    /// Darken color for dark mode backgrounds
    func darkened(by amount: CGFloat = 0.2) -> Color {
        Color(
            red: max(0, self.rgba.red - amount),
            green: max(0, self.rgba.green - amount),
            blue: max(0, self.rgba.blue - amount),
            opacity: self.rgba.opacity
        )
    }

    private var rgba: (red: CGFloat, green: CGFloat, blue: CGFloat, opacity: CGFloat) {
        var r: CGFloat = 0
        var g: CGFloat = 0
        var b: CGFloat = 0
        var a: CGFloat = 0

        #if os(iOS)
        UIColor(self).getRed(&r, green: &g, blue: &b, alpha: &a)
        #elseif os(macOS)
        NSColor(self).getRed(&r, green: &g, blue: &b, alpha: &a)
        #elseif os(watchOS)
        UIColor(self).getRed(&r, green: &g, blue: &b, alpha: &a)
        #endif

        return (r, g, b, a)
    }
}

// MARK: - Font Extension

extension Font {

    // MARK: - Display

    /// Large title - 34pt bold
    static let patchLargeTitle = Font.system(size: 38, weight: .bold, design: .rounded)

    /// Title 1 - 28pt bold
    static let patchTitle1 = Font.system(size: 32, weight: .bold, design: .rounded)

    /// Title 2 - 22pt bold
    static let patchTitle2 = Font.system(size: 24, weight: .bold, design: .rounded)

    /// Title 3 - 20pt semibold
    static let patchTitle3 = Font.system(size: 20, weight: .semibold, design: .rounded)

    // MARK: - Headline

    /// Headline - 17pt semibold
    static let patchHeadline = Font.system(size: 18, weight: .semibold, design: .rounded)

    /// Subheadline - 15pt regular
    static let patchSubheadline = Font.system(size: 16, weight: .medium, design: .rounded)

    // MARK: - Body

    /// Body - 17pt medium
    static let patchBody = Font.system(size: 17, weight: .medium, design: .default)

    /// Body bold - 17pt semibold
    static let patchBodyBold = Font.system(size: 17, weight: .semibold, design: .default)

    /// Callout - 16pt regular
    static let patchCallout = Font.system(size: 16, weight: .regular, design: .default)

    // MARK: - Caption

    /// Caption 1 - 12pt medium
    static let patchCaption1 = Font.system(size: 13, weight: .medium, design: .default)

    /// Caption 2 - 11pt medium
    static let patchCaption2 = Font.system(size: 12, weight: .medium, design: .default)

    // MARK: - Button

    /// Button text - 17pt bold
    static let patchButton = Font.system(size: 17, weight: .bold, design: .rounded)

    /// Small button - 15pt bold
    static let patchButtonSmall = Font.system(size: 15, weight: .bold, design: .rounded)
}

// MARK: - View Extensions

extension View {

    /// Apply card styling with strong readability and premium material
    @ViewBuilder
    func cardStyle(padding: CGFloat = AppTheme.Spacing.md) -> some View {
        self
            .padding(padding)
            .background(.ultraThinMaterial)
            .background(Color.white.opacity(0.6))
            .cornerRadius(AppTheme.CornerRadius.xl)
            .shadow(
                color: AppTheme.Shadow.sm.color,
                radius: AppTheme.Shadow.sm.radius,
                x: AppTheme.Shadow.sm.x,
                y: AppTheme.Shadow.sm.y
            )
    }

    /// Apply floating nav style
    @ViewBuilder
    func glassNavStyle() -> some View {
        self
            .background(Color.white.opacity(0.92))
            .cornerRadius(AppTheme.CornerRadius.full)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.full)
                    .stroke(Color.patchBackgroundTertiary.opacity(0.8), lineWidth: 1)
            )
            .shadow(
                color: AppTheme.Shadow.sm.color,
                radius: AppTheme.Shadow.sm.radius,
                x: AppTheme.Shadow.sm.x,
                y: AppTheme.Shadow.sm.y
            )
    }

    /// Apply shadow style
    func shadow(_ style: ShadowStyle) -> some View {
        self.shadow(color: style.color, radius: style.radius, x: style.x, y: style.y)
    }

    /// Apply the app's shared background gradient for top-level screens
    @ViewBuilder
    func screenBackgroundStyle() -> some View {
        self.background(
            LinearGradient(
                colors: [
                    Color.patchBackground,
                    Color.patchBackgroundSecondary
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
    }
}
