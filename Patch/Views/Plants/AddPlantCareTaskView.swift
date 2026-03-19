import SwiftUI

struct AddPlantCareTaskView: View {
    @Environment(\.dismiss) private var dismiss

    let plant: Plant
    let onSave: (CareTask) -> Void

    @StateObject private var viewModel: AddCareTaskViewModel

    init(plant: Plant, onSave: @escaping (CareTask) -> Void) {
        self.plant = plant
        self.onSave = onSave
        _viewModel = StateObject(wrappedValue: AddCareTaskViewModel(preselectedPlant: plant))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                    
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(title: "Task Details", subtitle: "Select the type of care and when it's due.")

                        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                            Text("Task Type")
                                .font(.patchCaption1)
                                .foregroundColor(.patchTextSecondary)
                            
                            Menu {
                                ForEach(CareTask.TaskType.allCases, id: \.self) { type in
                                    Button {
                                        viewModel.taskType = type
                                    } label: {
                                        Label(type.rawValue, systemImage: type.icon)
                                    }
                                }
                            } label: {
                                HStack {
                                    TaskTypeIcon(type: viewModel.taskType.rawValue, size: 24)
                                    Text(viewModel.taskType.rawValue)
                                        .font(.patchBody)
                                        .foregroundColor(.patchText)
                                    
                                    Spacer()
                                    Image(systemName: "chevron.up.chevron.down")
                                        .font(.patchCaption1)
                                        .foregroundColor(.patchTextTertiary)
                                }
                                .padding(AppTheme.Spacing.md)
                                .background(Color.white.opacity(0.88))
                                .cornerRadius(AppTheme.CornerRadius.md)
                                .overlay(
                                    RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                                        .stroke(Color.patchBackgroundTertiary.opacity(0.7), lineWidth: 1)
                                )
                            }
                        }

                        PatchDatePicker("Due Date", date: $viewModel.scheduledDate)
                        PatchDatePicker("Time", date: $viewModel.scheduledDate, displayedComponents: .hourAndMinute)
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(title: "Recurrence", subtitle: "Set up a repeating schedule.")

                        Toggle("Recurring Task", isOn: $viewModel.isRecurring)
                            .font(.patchBody)
                            .foregroundColor(.patchText)

                        if viewModel.isRecurring {
                            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                                Text("Frequency")
                                    .font(.patchCaption1)
                                    .foregroundColor(.patchTextSecondary)
                                
                                Picker("Frequency", selection: $viewModel.frequency) {
                                    ForEach(CareTask.Frequency.allCases, id: \.self) { freq in
                                        Text(freq.rawValue).tag(freq)
                                    }
                                }
                                .pickerStyle(.segmented)
                            }
                        }
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(title: "Notes", subtitle: "Add optional instructions.")
                        PatchTextEditor("Notes", text: $viewModel.notes, placeholder: "e.g., Needs bottom watering")
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
                }
                .padding(AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xxl)
            }
            .screenBackgroundStyle()
            .navigationTitle("Add Care Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { save() }
                        .disabled(!viewModel.canSave)
                }
            }
        }
    }
    
    private func formSectionHeader(title: String, subtitle: String) -> some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
            Text(title)
                .font(.patchTitle3)
                .foregroundColor(.patchText)
            Text(subtitle)
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
        }
    }

    private func save() {
        if let task = viewModel.save() {
            onSave(task)
            dismiss()
        }
    }
}

#Preview("Add Plant Care Task") {
    let context = PersistenceController.shared.container.viewContext
    let plant = Plant(context: context)
    plant.id = UUID()
    plant.name = "Tomato"

    return AddPlantCareTaskView(plant: plant) { task in
        print("Saved task: \(task.taskType)")
    }
}
