import Foundation
import UserNotifications
import UIKit

/// Service for managing local notifications for care tasks
@MainActor
final class NotificationService: NSObject, ObservableObject {

    // MARK: - Singleton

    static let shared = NotificationService()

    // MARK: - Published Properties

    @Published var isAuthorized: Bool = false
    @Published var authorizationStatus: UNAuthorizationStatus = .notDetermined

    // MARK: - Notification Categories

    static let careTaskCategoryIdentifier = "CARE_TASK_REMINDER"
    static let completeActionIdentifier = "COMPLETE_ACTION"
    static let snoozeActionIdentifier = "SNOOZE_ACTION"
    static let dismissActionIdentifier = "DISMISS_ACTION"

    // MARK: - User Defaults Keys

    private let notificationsEnabledKey = "notificationsEnabled"
    private let defaultReminderTimeKey = "defaultReminderTime"
    private let quietHoursStartKey = "quietHoursStart"
    private let quietHoursEndKey = "quietHoursEnd"
    private let quietHoursEnabledKey = "quietHoursEnabled"

    // MARK: - Settings

    var notificationsEnabled: Bool {
        get { UserDefaults.standard.bool(forKey: notificationsEnabledKey) }
        set { UserDefaults.standard.set(newValue, forKey: notificationsEnabledKey) }
    }

    /// Default reminder timing (in hours before task)
    var defaultReminderHours: Int {
        get { UserDefaults.standard.integer(forKey: defaultReminderTimeKey) }
        set { UserDefaults.standard.set(newValue, forKey: defaultReminderTimeKey) }
    }

    var quietHoursEnabled: Bool {
        get { UserDefaults.standard.bool(forKey: quietHoursEnabledKey) }
        set { UserDefaults.standard.set(newValue, forKey: quietHoursEnabledKey) }
    }

    var quietHoursStart: Int {
        get {
            let value = UserDefaults.standard.integer(forKey: quietHoursStartKey)
            return value == 0 ? 22 : value // Default to 10 PM
        }
        set { UserDefaults.standard.set(newValue, forKey: quietHoursStartKey) }
    }

    var quietHoursEnd: Int {
        get {
            let value = UserDefaults.standard.integer(forKey: quietHoursEndKey)
            return value == 0 ? 7 : value // Default to 7 AM
        }
        set { UserDefaults.standard.set(newValue, forKey: quietHoursEndKey) }
    }

    // MARK: - Private Properties

    private let notificationCenter = UNUserNotificationCenter.current()
    private let careTaskRepository: any CareTaskActionRepository

    // MARK: - Initialization

    override private init() {
        self.careTaskRepository = CareTaskRepository()
        super.init()
        notificationCenter.delegate = self
        setupNotificationCategories()
        checkAuthorizationStatus()

        // Set defaults if not set
        if defaultReminderHours == 0 {
            defaultReminderHours = 1
        }
    }

    init(careTaskRepository: any CareTaskActionRepository) {
        self.careTaskRepository = careTaskRepository
        super.init()
        notificationCenter.delegate = self
        setupNotificationCategories()
        checkAuthorizationStatus()

        // Set defaults if not set
        if defaultReminderHours == 0 {
            defaultReminderHours = 1
        }
    }

    // MARK: - Authorization

    /// Check current authorization status
    func checkAuthorizationStatus() {
        notificationCenter.getNotificationSettings { [weak self] settings in
            DispatchQueue.main.async {
                self?.authorizationStatus = settings.authorizationStatus
                self?.isAuthorized = settings.authorizationStatus == .authorized
            }
        }
    }

    /// Request notification authorization
    func requestAuthorization() async -> Bool {
        do {
            let granted = try await notificationCenter.requestAuthorization(
                options: [.alert, .badge, .sound, .provisional]
            )

            await MainActor.run {
                self.isAuthorized = granted
                self.notificationsEnabled = granted
            }

            checkAuthorizationStatus()
            return granted
        } catch {
            print("Error requesting notification authorization: \(error)")
            return false
        }
    }

    // MARK: - Notification Categories

    /// Setup notification action categories
    private func setupNotificationCategories() {
        // Complete action
        let completeAction = UNNotificationAction(
            identifier: Self.completeActionIdentifier,
            title: "Complete",
            options: [.foreground]
        )

        // Snooze action
        let snoozeAction = UNNotificationAction(
            identifier: Self.snoozeActionIdentifier,
            title: "Snooze 1 Hour",
            options: []
        )

        // Dismiss action
        let dismissAction = UNNotificationAction(
            identifier: Self.dismissActionIdentifier,
            title: "Dismiss",
            options: [.destructive]
        )

        // Care task category
        let careTaskCategory = UNNotificationCategory(
            identifier: Self.careTaskCategoryIdentifier,
            actions: [completeAction, snoozeAction, dismissAction],
            intentIdentifiers: [],
            options: [.customDismissAction]
        )

        notificationCenter.setNotificationCategories([careTaskCategory])
    }

    // MARK: - Schedule Notifications

    /// Schedule a notification for a care task
    func scheduleNotification(for task: CareTask, reminderHoursBefore: Int? = nil) {
        guard isAuthorized, notificationsEnabled else { return }
        guard let plant = task.plant else { return }

        let hours = reminderHoursBefore ?? defaultReminderHours

        // Calculate notification time
        var notificationDate = task.scheduledDate
        if hours > 0 {
            notificationDate = Calendar.current.date(
                byAdding: .hour,
                value: -hours,
                to: task.scheduledDate
            ) ?? task.scheduledDate
        }

        // Check if notification time is in quiet hours
        if quietHoursEnabled && isInQuietHours(notificationDate) {
            // Adjust to end of quiet hours
            notificationDate = adjustForQuietHours(notificationDate)
        }

        // Don't schedule if notification time is in the past
        guard notificationDate > Date() else { return }

        // Create notification content
        let content = UNMutableNotificationContent()
        content.title = "Care Reminder: \(task.taskType)"
        content.body = "\(plant.name) needs \(task.taskType.lowercased())"
        content.sound = .default
        content.categoryIdentifier = Self.careTaskCategoryIdentifier
        content.userInfo = [
            "taskId": task.id.uuidString,
            "plantId": plant.id.uuidString,
            "taskType": task.taskType
        ]

        // Add badge increment
        content.badge = NSNumber(value: 1)

        // Create trigger
        let triggerDate = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute],
            from: notificationDate
        )
        let trigger = UNCalendarNotificationTrigger(dateMatching: triggerDate, repeats: false)

        // Create request
        let request = UNNotificationRequest(
            identifier: task.id.uuidString,
            content: content,
            trigger: trigger
        )

        // Schedule
        notificationCenter.add(request) { error in
            if let error = error {
                print("Error scheduling notification: \(error)")
            }
        }
    }

    /// Schedule notifications for multiple tasks
    func scheduleNotifications(for tasks: [CareTask]) {
        for task in tasks {
            scheduleNotification(for: task)
        }
    }

    /// Cancel a scheduled notification
    func cancelNotification(for taskId: UUID) {
        notificationCenter.removePendingNotificationRequests(
            withIdentifiers: [taskId.uuidString]
        )
    }

    /// Cancel all scheduled notifications
    func cancelAllNotifications() {
        notificationCenter.removeAllPendingNotificationRequests()
    }

    /// Reschedule notification (e.g., after snooze)
    func rescheduleNotification(for task: CareTask, newDate: Date) {
        cancelNotification(for: task.id)

        // Create a temporary task with new date for scheduling
        // The actual task update should be done in the repository
        guard let plant = task.plant else { return }

        let content = UNMutableNotificationContent()
        content.title = "Care Reminder: \(task.taskType)"
        content.body = "\(plant.name) needs \(task.taskType.lowercased())"
        content.sound = .default
        content.categoryIdentifier = Self.careTaskCategoryIdentifier
        content.userInfo = [
            "taskId": task.id.uuidString,
            "plantId": plant.id.uuidString,
            "taskType": task.taskType
        ]

        let triggerDate = Calendar.current.dateComponents(
            [.year, .month, .day, .hour, .minute],
            from: newDate
        )
        let trigger = UNCalendarNotificationTrigger(dateMatching: triggerDate, repeats: false)

        let request = UNNotificationRequest(
            identifier: task.id.uuidString,
            content: content,
            trigger: trigger
        )

        notificationCenter.add(request)
    }

    // MARK: - Badge Management

    /// Update app badge count
    func updateBadgeCount(_ count: Int) {
        notificationCenter.setBadgeCount(count) { error in
            if let error {
                print("Error updating badge count: \(error)")
            }
        }
    }

    /// Clear app badge
    func clearBadge() {
        updateBadgeCount(0)
    }

    // MARK: - Quiet Hours

    /// Check if a date falls within quiet hours
    private func isInQuietHours(_ date: Date) -> Bool {
        let calendar = Calendar.current
        let hour = calendar.component(.hour, from: date)

        if quietHoursStart < quietHoursEnd {
            // Same day quiet hours (e.g., 22:00 - 23:00)
            return hour >= quietHoursStart && hour < quietHoursEnd
        } else {
            // Overnight quiet hours (e.g., 22:00 - 07:00)
            return hour >= quietHoursStart || hour < quietHoursEnd
        }
    }

    /// Adjust notification time to avoid quiet hours
    private func adjustForQuietHours(_ date: Date) -> Date {
        let calendar = Calendar.current

        // Set to end of quiet hours
        var components = calendar.dateComponents([.year, .month, .day], from: date)
        components.hour = quietHoursEnd
        components.minute = 0

        guard var adjustedDate = calendar.date(from: components) else {
            return date
        }

        // If end hour is before start hour (overnight), and original date is after midnight,
        // we're already on the right day. Otherwise, add a day.
        let hour = calendar.component(.hour, from: date)
        if quietHoursStart > quietHoursEnd && hour >= quietHoursStart {
            adjustedDate = calendar.date(byAdding: .day, value: 1, to: adjustedDate) ?? adjustedDate
        }

        return adjustedDate
    }

    // MARK: - Pending Notifications

    /// Get all pending notification requests
    func getPendingNotifications() async -> [UNNotificationRequest] {
        await notificationCenter.pendingNotificationRequests()
    }

    /// Get pending notification count
    func getPendingNotificationCount() async -> Int {
        await getPendingNotifications().count
    }
}

// MARK: - UNUserNotificationCenterDelegate

extension NotificationService: UNUserNotificationCenterDelegate {

    /// Handle notification when app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        // Show notification even when app is in foreground
        completionHandler([.banner, .sound, .badge])
    }

    /// Handle notification response (user tapped or used action)
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo

        guard let taskIdString = userInfo["taskId"] as? String,
              let taskId = UUID(uuidString: taskIdString) else {
            completionHandler()
            return
        }

        switch response.actionIdentifier {
        case Self.completeActionIdentifier:
            handleCompleteAction(taskId: taskId)

        case Self.snoozeActionIdentifier:
            handleSnoozeAction(taskId: taskId)

        case Self.dismissActionIdentifier:
            // Just dismiss, no action needed
            break

        case UNNotificationDefaultActionIdentifier:
            // User tapped notification - navigate to task
            NotificationCenter.default.post(
                name: .navigateToCareTask,
                object: nil,
                userInfo: ["taskId": taskId]
            )

        default:
            break
        }

        completionHandler()
    }

    // MARK: - Action Handlers

    func handleCompleteAction(taskId: UUID) {
        if let task = careTaskRepository.fetchById(taskId) {
            careTaskRepository.markComplete(task)
        }
    }

    func handleSnoozeAction(taskId: UUID) {
        if let task = careTaskRepository.fetchById(taskId) {
            careTaskRepository.snooze(task, byHours: 1)
            rescheduleNotification(for: task, newDate: task.scheduledDate)
        }
    }
}

// MARK: - Notification Names

extension Notification.Name {
    static let navigateToCareTask = Notification.Name("navigateToCareTask")
}

// MARK: - Reminder Timing Options

enum ReminderTiming: Int, CaseIterable {
    case atTime = 0
    case oneHourBefore = 1
    case twoHoursBefore = 2
    case oneDayBefore = 24

    var displayName: String {
        switch self {
        case .atTime: return "At scheduled time"
        case .oneHourBefore: return "1 hour before"
        case .twoHoursBefore: return "2 hours before"
        case .oneDayBefore: return "1 day before"
        }
    }
}
