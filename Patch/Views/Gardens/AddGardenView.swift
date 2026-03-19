import SwiftUI

struct AddGardenView: View {
    @StateObject private var viewModel = AddGardenViewModel()
    @Environment(\.dismiss) private var dismiss

    let onSave: ((Garden) -> Void)?
    @State private var hasAttemptedSave = false

    init(onSave: ((Garden) -> Void)? = nil) {
        self.onSave = onSave
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: AppTheme.Spacing.lg) {
                    AddGardenHeaderCard()
                    AddGardenProgressCard(
                        isReadyToSave: viewModel.isValid,
                        sizeLabel: "\(Int(viewModel.width)) × \(Int(viewModel.length)) ft"
                    )

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.md) {
                        formSectionHeader(
                            title: "Basic Info",
                            subtitle: "Define your garden name and format before adding plants."
                        )

                        PatchTextField(
                            "Garden Name",
                            text: $viewModel.name,
                            placeholder: "e.g., Backyard Garden",
                            error: hasAttemptedSave ? viewModel.nameError : nil,
                            isRequired: true
                        )

                        GardenTypePicker(selection: $viewModel.gardenType)
                        SoilTypePicker(selection: $viewModel.soilType)
                    }
                    .padding(AppTheme.Spacing.lg)
                    .background(.ultraThinMaterial)
                    .background(Color.white.opacity(0.6))
                    .cornerRadius(AppTheme.CornerRadius.xl)
                    .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 2)
                }
                .padding(AppTheme.Spacing.md)
                .padding(.bottom, AppTheme.Spacing.xxl)
            }
            .screenBackgroundStyle()
            .navigationTitle("Add Garden")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") {
                        dismiss()
                    }
                }

                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") {
                        hasAttemptedSave = true
                        saveGarden()
                    }
                    .disabled(!viewModel.isValid)
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

    private func saveGarden() {
        if let garden = viewModel.save() {
            onSave?(garden)
            dismiss()
        }
    }
}

struct AddGardenHeaderCard: View {
    var body: some View {
        HStack(spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
                Text("Create a Garden Space")
                    .font(.patchTitle2)
                    .foregroundColor(.patchText)
                Text("Set size, type, and conditions to keep your garden organized.")
                    .font(.patchSubheadline)
                    .foregroundColor(.patchTextSecondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Spacer(minLength: 8)

            Image(systemName: "square.grid.2x2.fill")
                .font(.system(size: 32, weight: .light))
                .foregroundColor(.patchPrimary)
                .frame(width: 64, height: 64)
                .background(Color.patchPrimary.opacity(0.1))
                .clipShape(Circle())
        }
        .padding(AppTheme.Spacing.xl)
        .background(.ultraThinMaterial)
        .background(Color.white.opacity(0.6))
        .cornerRadius(AppTheme.CornerRadius.xl)
        .shadow(color: AppTheme.Shadow.sm.color, radius: AppTheme.Shadow.sm.radius, x: 0, y: 4)
    }
}

struct AddGardenProgressCard: View {
    let isReadyToSave: Bool
    let sizeLabel: String

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Label(isReadyToSave ? "Ready to save" : "Complete required fields", systemImage: isReadyToSave ? "checkmark.circle.fill" : "exclamationmark.circle.fill")
                .font(.patchCaption1)
                .foregroundColor(isReadyToSave ? .patchPrimary : .patchTextSecondary)

            Spacer()

            Text(sizeLabel)
                .font(.patchCaption1)
                .foregroundColor(.patchTextSecondary)
        }
        .padding(.horizontal, AppTheme.Spacing.md)
        .padding(.vertical, AppTheme.Spacing.sm)
        .background(Color.white.opacity(0.78))
        .cornerRadius(AppTheme.CornerRadius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                .stroke(Color.patchBackgroundTertiary.opacity(0.8), lineWidth: 1)
        )
    }
}

struct NumericInputRow: View {
    let label: String
    @Binding var value: Double

    var body: some View {
        HStack {
            Text(label)
                .font(.patchSubheadline)
                .foregroundColor(.patchTextSecondary)

            Spacer()

            TextField(label, value: $value, format: .number)
                .keyboardType(.decimalPad)
                .multilineTextAlignment(.trailing)
                .frame(width: 90)

            Text("ft")
                .font(.patchCaption1)
                .foregroundColor(.patchTextTertiary)
        }
        .padding(AppTheme.Spacing.md)
        .background(Color.white.opacity(0.8))
        .cornerRadius(AppTheme.CornerRadius.md)
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                .stroke(Color.patchBackgroundTertiary.opacity(0.5), lineWidth: 1)
        )
    }
}

struct GardenTypePicker: View {
    @Binding var selection: Garden.GardenType

    var body: some View {
        PatchPicker(
            label: "Garden Type",
            selection: $selection,
            options: Garden.GardenType.allCases,
            displayName: { $0.rawValue }
        )
    }
}

struct SoilTypePicker: View {
    @Binding var selection: Garden.SoilType?

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            Text("Soil Type")
                .font(.patchSubheadline)
                .foregroundColor(.patchTextSecondary)

            Picker("Soil Type", selection: $selection) {
                Text("None").tag(nil as Garden.SoilType?)
                ForEach(Garden.SoilType.allCases, id: \.self) { type in
                    Text(type.rawValue).tag(type as Garden.SoilType?)
                }
            }
            .pickerStyle(.menu)
            .padding(.horizontal, AppTheme.Spacing.sm)
            .padding(.vertical, 2)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white.opacity(0.8))
            .cornerRadius(AppTheme.CornerRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                    .stroke(Color.patchBackgroundTertiary.opacity(0.5), lineWidth: 1)
            )
        }
    }
}

#Preview("Add Garden") {
    AddGardenView()
}
