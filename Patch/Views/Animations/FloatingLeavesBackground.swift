import SwiftUI

struct FloatingLeavesBackground: View {
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                LinearGradient(
                    colors: [
                        Color.patchBackground,
                        Color.patchBackgroundSecondary
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()

                Circle()
                    .fill(Color.patchGreen.opacity(0.11))
                    .frame(width: geometry.size.width * 0.82)
                    .blur(radius: 38)
                    .offset(x: geometry.size.width * 0.36, y: -geometry.size.height * 0.24)

                Circle()
                    .fill(Color.patchTan.opacity(0.18))
                    .frame(width: geometry.size.width * 0.7)
                    .blur(radius: 36)
                    .offset(x: -geometry.size.width * 0.34, y: geometry.size.height * 0.33)
            }
        }
    }
}
