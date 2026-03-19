import SwiftUI

/// A gently swaying animation suitable for plants and cards.
struct SwayingAnimation: ViewModifier {
    @State private var isSwaying = false
    var degree: Double = 2.0
    var speed: Double = 3.0

    func body(content: Content) -> some View {
        content
            .rotationEffect(Angle(degrees: isSwaying ? degree : -degree), anchor: .bottom)
            .onAppear {
                withAnimation(Animation.easeInOut(duration: speed).repeatForever(autoreverses: true)) {
                    isSwaying.toggle()
                }
            }
    }
}

/// A playful growth scale animation that bounces in on appear.
struct GrowthScaleAnimation: ViewModifier {
    @State private var isGrown = false

    func body(content: Content) -> some View {
        content
            .scaleEffect(isGrown ? 1.0 : 0.8)
            .opacity(isGrown ? 1.0 : 0.0)
            .onAppear {
                withAnimation(Animation.spring(response: 0.5, dampingFraction: 0.6)) {
                    isGrown = true
                }
            }
    }
}

extension View {
    /// Applies a continuous, gentle swaying animation.
    func swaying(degree: Double = 2.0, speed: Double = 3.0) -> some View {
        self.modifier(SwayingAnimation(degree: degree, speed: speed))
    }

    /// Applies a bounce-in scale and opacity animation.
    func plantGrowth() -> some View {
        self.modifier(GrowthScaleAnimation())
    }
}
