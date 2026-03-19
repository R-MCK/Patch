import SwiftUI

struct ReminderSettingsView: View {
    @StateObject private var notificationService = NotificationService.shared

    @State private var notificationsEnabled: Bool = false
    @State private var defaultReminderTiming: ReminderTiming = .oneHourBefore
    @State private var quietHoursEnabled: Bool = false
    @State private var quietHoursStart: Int = 22
    @State private var quietHoursEnd: Int = 7
    @State private var showPermissionAlert: Bool = false

    var body: some View {
        Form {
            // Authorization Status Section
            Section {
                HStack {
                    Image(systemName: authorizationIcon)
                        .foregroundColor(authorizationColor)

                    VStack(alignment: .leading, spacing: AppTheme.Spacing.xxs) {
                        Text(authorizationTitle)
                            .font(.patchBody)
                            .foregroundColor(.patchText)

                        Text(authorizationSubtitle)
                            .font(.patchCaption1)
                            .foregroundColor(.patchTextSecondary)
                    }

                    Spacer()

                    if notificationService.authorizationStatus == .denied {
                        Button("Settings") {
                            openAppSettings()
                        }
                        .font(.patchButtonSmall)
                    } else if notificationService.authorizationStatus == .notDetermined {
                        Button("Enable") {
                            requestPermission()
                        }
                        .font(.patchButtonSmall)
                    }
                }
            } header: {
                Text("Notification Status")
            }

            // Enable/Disable Notifications
            if notificationService.isAuthorized {
                Section {
                    Toggle("Enable Reminders", isOn: $notificationsEnabled)
                        .tint(.patchPrimary)
                } header: {
                    Text("Reminders")
                } footer: {
                    Text("When enabled, you'll receive notifications before care tasks are due.")
                }

                // Reminder Timing
                if notificationsEnabled {
                    Section {
                        Picker("Default Reminder Time", selection: $defaultReminderTiming) {
                            ForEach(ReminderTiming.allCases, id: \.self) { timing in
                                Text(timing.displayName).tag(timing)
                            }
                        }
                    } header: {
                        Text("Timing")
                    } footer: {
                        Text("Choose when to receive reminders relative to the scheduled task time.")
                    }

                    // Quiet Hours
                    Section {
                        Toggle("Enable Quiet Hours", isOn: $quietHoursEnabled)
                            .tint(.patchPrimary)

                        if quietHoursEnabled {
                            HStack {
                                Text("From")
                                    .foregroundColor(.patchTextSecondary)
                                Spacer()
                                Picker("Start", selection: $quietHoursStart) {
                                    ForEach(0..<24, id: \.self) { hour in
                                        Text(formatHour(hour)).tag(hour)
                                    }
                                }
                                .pickerStyle(.menu)
                            }

                            HStack {
                                Text("Until")
                                    .foregroundColor(.patchTextSecondary)
                                Spacer()
                                Picker("End", selection: $quietHoursEnd) {
                                    ForEach(0..<24, id: \.self) { hour in
                                        Text(formatHour(hour)).tag(hour)
                                    }
                                }
                                .pickerStyle(.menu)
                            }
                        }
                    } header: {
                        Text("Quiet Hours")
                    } footer: {
                        if quietHoursEnabled {
                            Text("Notifications will be delayed until \(formatHour(quietHoursEnd)) if they would normally appear during quiet hours.")
                        } else {
                            Text("Prevent notifications during specific hours, like while sleeping.")
                        }
                    }
                }
            }

            // Test Notification
            if notificationService.isAuthorized && notificationsEnabled {
                Section {
                    Button {
                        sendTestNotification()
                    } label: {
                        HStack {
                            Image(systemName: "bell.badge")
                            Text("Send Test Notification")
                        }
                    }
                } footer: {
                    Text("Send a test notification to verify your settings.")
                }
            }
        }
        .navigationTitle("Reminder Settings")
        .navigationBarTitleDisplayMode(.inline)
        .onAppear {
            loadSettings()
        }
        .onChange(of: notificationsEnabled) { _, newValue in
            notificationService.notificationsEnabled = newValue
        }
        .onChange(of: defaultReminderTiming) { _, newValue in
            notificationService.defaultReminderHours = newValue.rawValue
        }
        .onChange(of: quietHoursEnabled) { _, newValue in
            notificationService.quietHoursEnabled = newValue
        }
        .onChange(of: quietHoursStart) { _, newValue in
            notificationService.quietHoursStart = newValue
        }
        .onChange(of: quietHoursEnd) { _, newValue in
            notificationService.quietHoursEnd = newValue
        }
        .alert("Notifications Disabled", isPresented: $showPermissionAlert) {
            Button("Open Settings") {
                openAppSettings()
            }
            Button("Cancel", role: .cancel) { }
        } message: {
            Text("To receive care task reminders, please enable notifications in Settings.")
        }
    }

    // MARK: - Computed Properties

    private var authorizationIcon: String {
        switch notificationService.authorizationStatus {
        case .authorized, .provisional:
            return "checkmark.circle.fill"
        case .ephemeral:
            return "bell.badge.fill"
        case .denied:
            return "xmark.circle.fill"
        case .notDetermined:
            return "questionmark.circle.fill"
        @unknown default:
            return "questionmark.circle.fill"
        }
    }

    private var authorizationColor: Color {
        switch notificationService.authorizationStatus {
        case .authorized, .provisional:
            return .healthExcellent
        case .ephemeral:
            return .taskFertilizing
        case .denied:
            return .healthCritical
        case .notDetermined:
            return .taskWatering
        @unknown default:
            return .gray
        }
    }

    private var authorizationTitle: String {
        switch notificationService.authorizationStatus {
        case .authorized, .provisional:
            return "Notifications Enabled"
        case .ephemeral:
            return "Temporary Notifications Enabled"
        case .denied:
            return "Notifications Disabled"
        case .notDetermined:
            return "Notifications Not Set Up"
        @unknown default:
            return "Unknown Status"
        }
    }

    private var authorizationSubtitle: String {
        switch notificationService.authorizationStatus {
        case .authorized:
            return "You'll receive care task reminders"
        case .provisional:
            return "Quiet notifications enabled"
        case .ephemeral:
            return "Temporary notifications are active"
        case .denied:
            return "Enable in Settings to receive reminders"
        case .notDetermined:
            return "Tap Enable to set up notifications"
        @unknown default:
            return ""
        }
    }

    // MARK: - Methods

    private func loadSettings() {
        notificationService.checkAuthorizationStatus()
        notificationsEnabled = notificationService.notificationsEnabled
        defaultReminderTiming = ReminderTiming(rawValue: notificationService.defaultReminderHours) ?? .oneHourBefore
        quietHoursEnabled = notificationService.quietHoursEnabled
        quietHoursStart = notificationService.quietHoursStart
        quietHoursEnd = notificationService.quietHoursEnd
    }

    private func requestPermission() {
        Task {
            let granted = await notificationService.requestAuthorization()
            if granted {
                notificationsEnabled = true
            }
        }
    }

    private func openAppSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    }

    private func formatHour(_ hour: Int) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"

        var components = DateComponents()
        components.hour = hour
        components.minute = 0

        guard let date = Calendar.current.date(from: components) else {
            return "\(hour):00"
        }

        return formatter.string(from: date)
    }

    private func sendTestNotification() {
        let content = UNMutableNotificationContent()
        content.title = "Test Notification"
        content.body = "Your reminder settings are working correctly!"
        content.sound = .default

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: 3, repeats: false)
        let request = UNNotificationRequest(
            identifier: UUID().uuidString,
            content: content,
            trigger: trigger
        )

        UNUserNotificationCenter.current().add(request)
    }
}

// MARK: - Preview

#Preview("Reminder Settings") {
    NavigationStack {
        ReminderSettingsView()
    }
}
