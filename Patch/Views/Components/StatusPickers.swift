import SwiftUI

struct HealthStatusPicker: View {
    @Binding var selection: Plant.HealthStatus
    
    var body: some View {
        Picker("Health Status", selection: $selection) {
            ForEach(Plant.HealthStatus.allCases, id: \.self) { status in
                Text(status.rawValue).tag(status)
            }
        }
    }
}

struct GrowthStagePicker: View {
    @Binding var selection: Plant.GrowthStage
    
    var body: some View {
        Picker("Growth Stage", selection: $selection) {
            ForEach(Plant.GrowthStage.allCases, id: \.self) { stage in
                Text(stage.rawValue).tag(stage)
            }
        }
    }
}
