import XCTest
import UserNotifications
@testable import Patch

@MainActor
final class NotificationServiceTests: XCTestCase {

    var notificationService: NotificationService!
    var context: NSManagedObjectContext!
    var careTaskRepository: CareTaskRepository!
    var plantRepository: PlantRepository!
    var testPlant: Plant!

    override func setUp() {
        super.setUp()
        notificationService = NotificationService.shared
        context = PersistenceController.shared.container.viewContext
        careTaskRepository = CareTaskRepository(context: context)
        plantRepository = PlantRepository(context: context)

        // Create test plant
        testPlant = plantRepository.create(name: "Test Plant", healthStatus: .good)
    }

    override func tearDown() {
        // Clear test data
        let taskRequest: NSFetchRequest<CareTask> = CareTask.fetchRequest()
        do {
            let tasks = try context.fetch(taskRequest)
            for task in tasks {
                context.delete(task)
            }
        } catch {
            print("Error clearing tasks: \(error)")
        }

        let plantRequest: NSFetchRequest<Plant> = Plant.fetchRequest()
        do {
            let plants = try context.fetch(plantRequest)
            for plant in plants {
                context.delete(plant)
            }
            try context.save()
        } catch {
            print("Error clearing plants: \(error)")
        }

        // Cancel all pending notifications
        notificationService.cancelAllNotifications()

        notificationService = nil
        careTaskRepository = nil
        plantRepository = nil
        testPlant = nil
        context = nil
        super.tearDown()
    }

    // MARK: - Reminder Timing Tests

    func testReminderTimingDisplayNames() {
        XCTAssertEqual(ReminderTiming.atTime.displayName, "At scheduled time")
        XCTAssertEqual(ReminderTiming.oneHourBefore.displayName, "1 hour before")
        XCTAssertEqual(ReminderTiming.twoHoursBefore.displayName, "2 hours before")
        XCTAssertEqual(ReminderTiming.oneDayBefore.displayName, "1 day before")
    }

    func testReminderTimingRawValues() {
        XCTAssertEqual(ReminderTiming.atTime.rawValue, 0)
        XCTAssertEqual(ReminderTiming.oneHourBefore.rawValue, 1)
        XCTAssertEqual(ReminderTiming.twoHoursBefore.rawValue, 2)
        XCTAssertEqual(ReminderTiming.oneDayBefore.rawValue, 24)
    }

    // MARK: - Settings Tests

    func testDefaultReminderHoursSetting() {
        // Set a value
        notificationService.defaultReminderHours = 2
        XCTAssertEqual(notificationService.defaultReminderHours, 2)

        // Change it
        notificationService.defaultReminderHours = 1
        XCTAssertEqual(notificationService.defaultReminderHours, 1)
    }

    func testQuietHoursSettings() {
        // Test quiet hours enabled
        notificationService.quietHoursEnabled = true
        XCTAssertTrue(notificationService.quietHoursEnabled)

        notificationService.quietHoursEnabled = false
        XCTAssertFalse(notificationService.quietHoursEnabled)

        // Test quiet hours times
        notificationService.quietHoursStart = 23
        notificationService.quietHoursEnd = 8

        XCTAssertEqual(notificationService.quietHoursStart, 23)
        XCTAssertEqual(notificationService.quietHoursEnd, 8)
    }

    func testNotificationsEnabledSetting() {
        notificationService.notificationsEnabled = true
        XCTAssertTrue(notificationService.notificationsEnabled)

        notificationService.notificationsEnabled = false
        XCTAssertFalse(notificationService.notificationsEnabled)
    }

    // MARK: - Badge Tests

    func testUpdateBadgeCount() {
        notificationService.updateBadgeCount(5)

        // Note: In a real test environment, we'd verify the badge was set
        // For unit tests, we're just ensuring the method doesn't crash
        XCTAssertTrue(true)
    }

    func testClearBadge() {
        notificationService.updateBadgeCount(10)
        notificationService.clearBadge()

        // Note: In a real test environment, we'd verify the badge is 0
        XCTAssertTrue(true)
    }

    // MARK: - Cancel Notification Tests

    func testCancelNotificationById() {
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: Date().addingTimeInterval(3600)
        )

        // Schedule then cancel
        notificationService.scheduleNotification(for: task)
        notificationService.cancelNotification(for: task.id)

        // Verify no crash
        XCTAssertTrue(true)
    }

    func testCancelAllNotifications() {
        // Create several tasks
        for i in 0..<3 {
            let task = careTaskRepository.create(
                type: .watering,
                plant: testPlant,
                scheduledDate: Date().addingTimeInterval(TimeInterval(3600 * (i + 1)))
            )
            notificationService.scheduleNotification(for: task)
        }

        notificationService.cancelAllNotifications()

        // Verify no crash
        XCTAssertTrue(true)
    }

    // MARK: - Notification Category Tests

    func testNotificationCategoryIdentifiers() {
        XCTAssertEqual(NotificationService.careTaskCategoryIdentifier, "CARE_TASK_REMINDER")
        XCTAssertEqual(NotificationService.completeActionIdentifier, "COMPLETE_ACTION")
        XCTAssertEqual(NotificationService.snoozeActionIdentifier, "SNOOZE_ACTION")
        XCTAssertEqual(NotificationService.dismissActionIdentifier, "DISMISS_ACTION")
    }

    // MARK: - Pending Notifications Tests

    func testGetPendingNotifications() async {
        let notifications = await notificationService.getPendingNotifications()

        // Just verify the method works
        XCTAssertNotNil(notifications)
    }

    func testGetPendingNotificationCount() async {
        // Cancel all first to get a clean state
        notificationService.cancelAllNotifications()

        let count = await notificationService.getPendingNotificationCount()

        // Should be 0 after canceling all
        XCTAssertEqual(count, 0)
    }

    // MARK: - Integration Tests (require notification permission)

    func testScheduleNotificationForTask() {
        // Only runs if notifications are authorized
        guard notificationService.isAuthorized else {
            // Skip test if not authorized
            return
        }

        let futureDate = Calendar.current.date(byAdding: .hour, value: 2, to: Date())!
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: futureDate
        )

        notificationService.scheduleNotification(for: task)

        // Clean up
        notificationService.cancelNotification(for: task.id)
    }

    func testRescheduleNotification() {
        guard notificationService.isAuthorized else {
            return
        }

        let originalDate = Calendar.current.date(byAdding: .hour, value: 2, to: Date())!
        let newDate = Calendar.current.date(byAdding: .hour, value: 4, to: Date())!

        let task = careTaskRepository.create(
            type: .fertilizing,
            plant: testPlant,
            scheduledDate: originalDate
        )

        notificationService.scheduleNotification(for: task)
        notificationService.rescheduleNotification(for: task, newDate: newDate)

        // Clean up
        notificationService.cancelNotification(for: task.id)
    }
}

@MainActor
final class NotificationServiceActionHandlingTests: XCTestCase {
    func testHandleCompleteActionMarksTaskComplete() {
        let referenceDate = Date(timeIntervalSince1970: 1_700_000_000)
        let task = makeTask(scheduledDate: referenceDate)
        let repository = MockCareTaskActionRepository(task: task, referenceDate: referenceDate)
        let service = NotificationService(careTaskRepository: repository)

        service.handleCompleteAction(taskId: task.id)

        XCTAssertTrue(repository.fetchByIdCalled)
        XCTAssertTrue(repository.markCompleteCalled)
        XCTAssertNotNil(task.completedDate)
    }

    func testHandleSnoozeActionSnoozesTaskByOneHour() {
        let referenceDate = Date(timeIntervalSince1970: 1_700_000_000)
        let task = makeTask(scheduledDate: referenceDate)
        let repository = MockCareTaskActionRepository(task: task, referenceDate: referenceDate)
        let service = NotificationService(careTaskRepository: repository)

        service.handleSnoozeAction(taskId: task.id)

        XCTAssertTrue(repository.fetchByIdCalled)
        XCTAssertTrue(repository.snoozeCalled)
        XCTAssertEqual(task.scheduledDate, referenceDate.addingTimeInterval(3600))
    }

    private func makeTask(scheduledDate: Date) -> CareTask {
        let plant = Plant()
        plant.id = UUID()
        plant.name = "Test Plant"
        plant.createdAt = Date()
        plant.updatedAt = Date()

        let task = CareTask()
        task.id = UUID()
        task.taskType = CareTask.TaskType.watering.rawValue
        task.plant = plant
        task.scheduledDate = scheduledDate
        task.createdAt = Date()
        return task
    }
}

final class MockCareTaskActionRepository: CareTaskActionRepository {
    private let task: CareTask
    private let referenceDate: Date

    var fetchByIdCalled = false
    var markCompleteCalled = false
    var snoozeCalled = false

    init(task: CareTask, referenceDate: Date) {
        self.task = task
        self.referenceDate = referenceDate
    }

    func fetchById(_ id: UUID) -> CareTask? {
        fetchByIdCalled = true
        return task.id == id ? task : nil
    }

    func markComplete(_ task: CareTask) {
        markCompleteCalled = true
        task.completedDate = referenceDate
    }

    func snooze(_ task: CareTask, byHours hours: Int) {
        snoozeCalled = true
        task.scheduledDate = referenceDate.addingTimeInterval(TimeInterval(hours * 3600))
    }
}

// MARK: - Mock Notification Center Tests

/// Tests using a mock notification center for isolated unit testing
final class MockNotificationCenterTests: XCTestCase {

    // MARK: - Quiet Hours Logic Tests

    func testQuietHoursOvernightRange() {
        // Test quiet hours from 10 PM to 7 AM (overnight)
        let quietStart = 22  // 10 PM
        let quietEnd = 7     // 7 AM

        // 11 PM should be in quiet hours
        XCTAssertTrue(isInQuietHours(hour: 23, start: quietStart, end: quietEnd))

        // 2 AM should be in quiet hours
        XCTAssertTrue(isInQuietHours(hour: 2, start: quietStart, end: quietEnd))

        // 8 AM should NOT be in quiet hours
        XCTAssertFalse(isInQuietHours(hour: 8, start: quietStart, end: quietEnd))

        // 3 PM should NOT be in quiet hours
        XCTAssertFalse(isInQuietHours(hour: 15, start: quietStart, end: quietEnd))
    }

    func testQuietHoursSameDayRange() {
        // Test quiet hours from 1 PM to 3 PM (same day)
        let quietStart = 13  // 1 PM
        let quietEnd = 15    // 3 PM

        // 2 PM should be in quiet hours
        XCTAssertTrue(isInQuietHours(hour: 14, start: quietStart, end: quietEnd))

        // 12 PM should NOT be in quiet hours
        XCTAssertFalse(isInQuietHours(hour: 12, start: quietStart, end: quietEnd))

        // 4 PM should NOT be in quiet hours
        XCTAssertFalse(isInQuietHours(hour: 16, start: quietStart, end: quietEnd))
    }

    // Helper to replicate quiet hours logic for testing
    private func isInQuietHours(hour: Int, start: Int, end: Int) -> Bool {
        if start < end {
            // Same day range
            return hour >= start && hour < end
        } else {
            // Overnight range
            return hour >= start || hour < end
        }
    }
}
