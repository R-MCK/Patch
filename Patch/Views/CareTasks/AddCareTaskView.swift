import SwiftUI

struct AddCareTaskView: View {
    @Environment(\.dismiss) private var dismiss

    let preselectedPlant: Plant?
    let onSave: (CareTask) -> Void

    @StateObject private var viewModel: AddCareTaskViewModel

    init(plant: Plant? = nil, onSave: @escaping (CareTask) -> Void) {
        self.preselectedPlant = plant
        self.onSave = onSave
        self._viewModel = StateObject(wrappedValue: AddCareTaskViewModel(preselectedPlant: plant))
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                    
                    // Plant Selection (if not preselected)
                    if preselectedPlant == nil {
                        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                            formSectionHeader(title: "Plant Selection", subtitle: "Which plant needs care?")
                            
                            PlantPickerView(
                                selectedPlant: $viewModel.selectedPlant,
                                plants: viewModel.availablePlants
                            )

                            if let error = viewModel.plantError, viewModel.selectedPlant == nil {
                                Text(error)
                                    .font(.patchCaption1)
                                    .foregroundColor(.healthCritical)
                            }
                        }
                        .padding(AppTheme.Spacing.lg)
                        .background(.ultraThinMaterial)
                        .background(Color.white.opacity(0.6))
                        .cornerRadius(AppTheme.CornerRadius.xl)
                        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
                    }

                    // Task Type
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.sm) {
                        formSectionHeader(title: "Task Type", subtitle: "Select the type of care.")
                        
                        TaskTypePicker(selectedType: $viewModel.taskType)
                            .onChange(of: viewModel.taskType) { _, newValue in
                                viewModel.updateFrequencyForTaskType(newValue)
                            }
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    // Schedule
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(title: "Schedule", subtitle: "When should this task be done?")
                        
                        PatchDatePicker("Date", date: $viewModel.scheduledDate, displayedComponents: .date)
                        PatchDatePicker("Time", date: $viewModel.scheduledDate, displayedComponents: .hourAndMinute)
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    // Recurrence
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(title: "Recurrence", subtitle: "Set up a repeating schedule.")
                        
                        Toggle("Recurring Task", isOn: $viewModel.isRecurring)
                            .font(.patchBody)
                            .foregroundColor(.patchText)

                        if viewModel.isRecurring {
                            RecurrencePicker(
                                selectedFrequency: $viewModel.frequency,
                                customDays: $viewModel.customIntervalDays
                            )

                            Text(viewModel.recurrenceDescription)
                                .font(.patchCaption1)
                                .foregroundColor(.patchTextSecondary)

                            // Preview next occurrences
                            if !viewModel.nextOccurrences.isEmpty {
                                VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                                    Text("Upcoming:")
                                        .font(.patchCaption1)
                                        .fontWeight(.medium)
                                        .foregroundColor(.patchTextSecondary)

                                    ForEach(viewModel.nextOccurrences.prefix(3), id: \.self) { date in
                                        Text(formatDate(date))
                                            .font(.patchCaption1)
                                            .foregroundColor(.patchTextTertiary)
                                    }
                                }
                                .padding(.top, AppTheme.Spacing.xs)
                            }
                        }
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    // Notes
                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(title: "Notes", subtitle: "Add optional instructions.")
                        
                        PatchTextEditor("Notes", text: $viewModel.notes, placeholder: "Any specific details...")
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)

                    // Error Message
                    if let error = viewModel.errorMessage {
                        Text(error)
                            .font(.patchCaption1)
                            .foregroundColor(.healthCritical)
                            .padding(.horizontal)
                    }
                }
                .padding(AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xxl)
            }
            .screenBackgroundStyle()
            .navigationTitle("Add Care Task")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        if let task = viewModel.save() {
                            onSave(task)
                            dismiss()
                        }
                    }
                    .disabled(!viewModel.canSave)
                    .fontWeight(.semibold)
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

    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .short
        return formatter.string(from: date)
    }
}

// MARK: - Plant Picker View

struct PlantPickerView: View {
    @Binding var selectedPlant: Plant?
    let plants: [Plant]

    var body: some View {
        if plants.isEmpty {
            HStack {
                Image(systemName: "leaf.slash")
                    .foregroundColor(.patchTextSecondary)
                Text("No plants available")
                    .foregroundColor(.patchTextSecondary)
            }
            .padding(AppTheme.Spacing.md)
            .background(Color.white.opacity(0.88))
            .cornerRadius(AppTheme.CornerRadius.md)
        } else {
            Menu {
                Button {
                    selectedPlant = nil
                } label: {
                    Text("Select a plant...")
                }
                
                ForEach(plants) { plant in
                    Button {
                        selectedPlant = plant
                    } label: {
                        Label(plant.name, systemImage: "leaf.fill")
                    }
                }
            } label: {
                HStack {
                    if let plant = selectedPlant {
                        Image(systemName: "leaf.fill")
                            .foregroundColor(.patchPrimary)
                        Text(plant.name)
                            .font(.patchBody)
                            .foregroundColor(.patchText)
                    } else {
                        Text("Select a plant...")
                            .font(.patchBody)
                            .foregroundColor(.patchTextSecondary)
                    }
                    
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
    }
}

// MARK: - Task Type Picker

struct TaskTypePicker: View {
    @Binding var selectedType: CareTask.TaskType

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: AppTheme.Spacing.sm) {
                ForEach(CareTask.TaskType.allCases, id: \.self) { type in
                    TaskTypeButton(
                        type: type,
                        isSelected: selectedType == type
                    ) {
                        selectedType = type
                    }
                }
            }
            .padding(.vertical, AppTheme.Spacing.xs)
        }
    }
}

struct TaskTypeButton: View {
    let type: CareTask.TaskType
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: AppTheme.Spacing.xs) {
                TaskTypeIcon(type: type.rawValue, size: 44)

                Text(type.rawValue)
                    .font(.patchCaption1)
                    .fontWeight(isSelected ? .semibold : .regular)
                    .foregroundColor(isSelected ? .patchPrimary : .patchTextSecondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.8)
            }
            .frame(width: 80)
            .padding(.vertical, AppTheme.Spacing.sm)
            .background(isSelected ? Color.patchPrimary.opacity(0.1) : Color.white.opacity(0.88))
            .cornerRadius(AppTheme.CornerRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                    .stroke(isSelected ? Color.patchPrimary : Color.patchBackgroundTertiary.opacity(0.7), lineWidth: isSelected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Recurrence Picker

struct RecurrencePicker: View {
    @Binding var selectedFrequency: CareTask.Frequency
    @Binding var customDays: Int

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text("Frequency")
                    .font(.patchCaption1)
                    .foregroundColor(.patchTextSecondary)
                
                Menu {
                    ForEach(CareTask.Frequency.allCases, id: \.self) { freq in
                        Button {
                            selectedFrequency = freq
                        } label: {
                            if selectedFrequency == freq {
                                Label(freq.rawValue, systemImage: "checkmark")
                            } else {
                                Text(freq.rawValue)
                            }
                        }
                    }
                } label: {
                    HStack {
                        Text(selectedFrequency.rawValue)
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

            // Custom Days Stepper (if custom selected)
            if selectedFrequency == .custom {
                HStack {
                    Text("Every")
                        .foregroundColor(.patchText)

                    Stepper(value: $customDays, in: 1...365) {
                        Text("\(customDays)")
                            .fontWeight(.semibold)
                            .foregroundColor(.patchPrimary)
                            .monospacedDigit()
                    }

                    Text("days")
                        .foregroundColor(.patchText)
                }
                .padding(AppTheme.Spacing.md)
                .background(Color.white.opacity(0.88))
                .cornerRadius(AppTheme.CornerRadius.md)
            }
        }
    }
}

// MARK: - Preview

#Preview("Add Care Task - No Plant") {
    AddCareTaskView { task in
        print("Saved: \(task.taskType)")
    }
}

#Preview("Add Care Task - With Plant") {
    let context = PersistenceController.shared.container.viewContext
    let plant = Plant(context: context)
    plant.id = UUID()
    plant.name = "Tomato"
    plant.createdAt = Date()

    return AddCareTaskView(plant: plant) { task in
        print("Saved: \(task.taskType)")
    }
}
