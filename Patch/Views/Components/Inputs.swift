import SwiftUI

// MARK: - Search Bar

/// Search input with icon and clear button
struct SearchBar: View {
    @Binding var text: String
    let placeholder: String
    var onSubmit: (() -> Void)?

    init(
        text: Binding<String>,
        placeholder: String = "Search...",
        onSubmit: (() -> Void)? = nil
    ) {
        self._text = text
        self.placeholder = placeholder
        self.onSubmit = onSubmit
    }

    var body: some View {
        HStack(spacing: AppTheme.Spacing.sm) {
            Image(systemName: "magnifyingglass")
                .foregroundColor(.patchTextSecondary)

            TextField(placeholder, text: $text)
                .font(.patchBody)
                .submitLabel(.search)
                .onSubmit {
                    onSubmit?()
                }

            if !text.isEmpty {
                Button {
                    text = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundColor(.patchTextTertiary)
                }
            }
        }
        .padding(.horizontal, AppTheme.Spacing.md)
        .padding(.vertical, 12)
        .background(Color.white.opacity(0.9))
        .cornerRadius(AppTheme.CornerRadius.lg)
        .overlay(
            RoundedRectangle(cornerRadius: AppTheme.CornerRadius.lg)
                .stroke(Color.patchBackgroundTertiary.opacity(0.7), lineWidth: 1)
        )
    }
}

// MARK: - Text Field

/// Styled text field with label and validation
struct PatchTextField: View {
    let label: String
    @Binding var text: String
    let placeholder: String
    let icon: String?
    let error: String?
    let isRequired: Bool

    init(
        _ label: String,
        text: Binding<String>,
        placeholder: String = "",
        icon: String? = nil,
        error: String? = nil,
        isRequired: Bool = false
    ) {
        self.label = label
        self._text = text
        self.placeholder = placeholder
        self.icon = icon
        self.error = error
        self.isRequired = isRequired
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            // Label
            HStack(spacing: AppTheme.Spacing.xxs) {
                Text(label)
                    .font(.patchSubheadline)
                    .foregroundColor(.patchTextSecondary)

                if isRequired {
                    Text("*")
                        .foregroundColor(.healthCritical)
                }
            }

            // Input
            HStack(spacing: AppTheme.Spacing.sm) {
                if let icon = icon {
                    Image(systemName: icon)
                        .foregroundColor(.patchTextSecondary)
                }

                TextField(placeholder, text: $text)
                    .font(.patchBody)
            }
            .padding(AppTheme.Spacing.md)
            .background(Color.white.opacity(0.88))
            .cornerRadius(AppTheme.CornerRadius.md)
            .overlay(
                RoundedRectangle(cornerRadius: AppTheme.CornerRadius.md)
                    .stroke(error != nil ? Color.healthCritical : Color.patchBackgroundTertiary.opacity(0.7), lineWidth: 1)
            )

            // Error
            if let error = error {
                Text(error)
                    .font(.patchCaption1)
                    .foregroundColor(.healthCritical)
            }
        }
    }
}

// MARK: - Text Editor

/// Multi-line text input
struct PatchTextEditor: View {
    let label: String
    @Binding var text: String
    let placeholder: String
    let minHeight: CGFloat

    init(
        _ label: String,
        text: Binding<String>,
        placeholder: String = "",
        minHeight: CGFloat = 100
    ) {
        self.label = label
        self._text = text
        self.placeholder = placeholder
        self.minHeight = minHeight
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            Text(label)
                .font(.patchSubheadline)
                .foregroundColor(.patchTextSecondary)

            ZStack(alignment: .topLeading) {
                if text.isEmpty {
                    Text(placeholder)
                        .font(.patchBody)
                        .foregroundColor(.patchTextTertiary)
                        .padding(.horizontal, AppTheme.Spacing.xs)
                        .padding(.vertical, AppTheme.Spacing.sm)
                }

                TextEditor(text: $text)
                    .font(.patchBody)
                    .frame(minHeight: minHeight)
                    .scrollContentBackground(.hidden)
            }
            .padding(AppTheme.Spacing.sm)
            .background(Color.white.opacity(0.88))
            .cornerRadius(AppTheme.CornerRadius.md)
        }
    }
}

// MARK: - Date Picker Field

/// Date picker with label
struct PatchDatePicker: View {
    let label: String
    @Binding var date: Date
    let displayedComponents: DatePicker.Components

    init(
        _ label: String,
        date: Binding<Date>,
        displayedComponents: DatePicker.Components = .date
    ) {
        self.label = label
        self._date = date
        self.displayedComponents = displayedComponents
    }

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            Text(label)
                .font(.patchSubheadline)
                .foregroundColor(.patchTextSecondary)

            DatePicker("", selection: $date, displayedComponents: displayedComponents)
                .labelsHidden()
                .padding(AppTheme.Spacing.sm)
                .background(Color.white.opacity(0.88))
                .cornerRadius(AppTheme.CornerRadius.md)
        }
    }
}

// MARK: - Picker Field

/// Generic picker with label
struct PatchPicker<T: Hashable>: View {
    let label: String
    @Binding var selection: T
    let options: [T]
    let displayName: (T) -> String

    var body: some View {
        VStack(alignment: .leading, spacing: AppTheme.Spacing.xs) {
            Text(label)
                .font(.patchSubheadline)
                .foregroundColor(.patchTextSecondary)

            Picker("", selection: $selection) {
                ForEach(options, id: \.self) { option in
                    Text(displayName(option))
                        .tag(option)
                }
            }
            .pickerStyle(.menu)
            .padding(AppTheme.Spacing.sm)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color.white.opacity(0.88))
            .cornerRadius(AppTheme.CornerRadius.md)
        }
    }
}

// MARK: - Toggle Field

/// Toggle with label and description
struct PatchToggle: View {
    let title: String
    let description: String?
    @Binding var isOn: Bool

    init(
        _ title: String,
        description: String? = nil,
        isOn: Binding<Bool>
    ) {
        self.title = title
        self.description = description
        self._isOn = isOn
    }

    var body: some View {
        HStack(alignment: .top, spacing: AppTheme.Spacing.md) {
            VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                Text(title)
                    .font(.patchBody)
                    .foregroundColor(.patchText)

                if let description = description {
                    Text(description)
                        .font(.patchCaption1)
                        .foregroundColor(.patchTextSecondary)
                }
            }

            Spacer()

            Toggle("", isOn: $isOn)
                .labelsHidden()
                .tint(.patchPrimary)
        }
        .padding(AppTheme.Spacing.md)
        .background(Color.white.opacity(0.88))
        .cornerRadius(AppTheme.CornerRadius.md)
    }
}

// MARK: - Stepper Field

/// Stepper with label and value display
struct PatchStepper: View {
    let label: String
    @Binding var value: Int
    let range: ClosedRange<Int>
    let step: Int
    let unit: String?

    init(
        _ label: String,
        value: Binding<Int>,
        range: ClosedRange<Int>,
        step: Int = 1,
        unit: String? = nil
    ) {
        self.label = label
        self._value = value
        self.range = range
        self.step = step
        self.unit = unit
    }

    var body: some View {
        HStack {
            Text(label)
                .font(.patchBody)
                .foregroundColor(.patchText)

            Spacer()

            HStack(spacing: AppTheme.Spacing.sm) {
                Text("\(value)")
                    .font(.patchHeadline)
                    .foregroundColor(.patchPrimary)
                    .monospacedDigit()

                if let unit = unit {
                    Text(unit)
                        .font(.patchSubheadline)
                        .foregroundColor(.patchTextSecondary)
                }
            }

            Stepper("", value: $value, in: range, step: step)
                .labelsHidden()
        }
        .padding(AppTheme.Spacing.md)
        .background(Color.white.opacity(0.88))
        .cornerRadius(AppTheme.CornerRadius.md)
    }
}

// MARK: - Previews

#Preview("Inputs") {
    ScrollView {
        VStack(spacing: AppTheme.Spacing.lg) {
            SearchBar(text: .constant(""), placeholder: "Search plants...")
            SearchBar(text: .constant("Tomato"))

            PatchTextField(
                "Plant Name",
                text: .constant(""),
                placeholder: "Enter plant name",
                icon: "leaf",
                isRequired: true
            )

            PatchTextField(
                "Species",
                text: .constant("Solanum lycopersicum"),
                placeholder: "Enter species"
            )

            PatchTextField(
                "Email",
                text: .constant("invalid"),
                placeholder: "Enter email",
                icon: "envelope",
                error: "Invalid email format"
            )

            PatchTextEditor(
                "Notes",
                text: .constant(""),
                placeholder: "Add your notes here..."
            )

            PatchDatePicker("Planting Date", date: .constant(Date()))

            PatchToggle(
                "Enable Notifications",
                description: "Receive reminders for care tasks",
                isOn: .constant(true)
            )

            PatchStepper(
                "Spacing",
                value: .constant(12),
                range: 1...48,
                unit: "inches"
            )
        }
        .padding()
    }
}
