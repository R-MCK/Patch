import XCTest
@testable import Patch

@MainActor
final class CareTaskTests: XCTestCase {

    var context: NSManagedObjectContext!
    var careTaskRepository: CareTaskRepository!
    var plantRepository: PlantRepository!
    var testPlant: Plant!

    override func setUp() {
        super.setUp()
        context = PersistenceController.shared.container.viewContext
        careTaskRepository = CareTaskRepository(context: context)
        plantRepository = PlantRepository(context: context)

        clearAllData()

        // Create a test plant for task associations
        testPlant = plantRepository.create(name: "Test Tomato", healthStatus: .good)
    }

    override func tearDown() {
        clearAllData()
        careTaskRepository = nil
        plantRepository = nil
        testPlant = nil
        context = nil
        super.tearDown()
    }

    private func clearAllData() {
        // Clear care tasks
        let taskRequest: NSFetchRequest<CareTask> = CareTask.fetchRequest()
        do {
            let tasks = try context.fetch(taskRequest)
            for task in tasks {
                context.delete(task)
            }
        } catch {
            print("Error clearing tasks: \(error)")
        }

        // Clear plants
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
    }

    // MARK: - Create Tests

    func testCreateCareTask() {
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: Date(),
            notes: "Test notes"
        )

        XCTAssertNotNil(task)
        XCTAssertEqual(task.taskType, "Watering")
        XCTAssertEqual(task.plant, testPlant)
        XCTAssertEqual(task.notes, "Test notes")
        XCTAssertNotNil(task.id)
        XCTAssertNotNil(task.createdAt)
        XCTAssertFalse(task.isRecurring)
        XCTAssertNil(task.completedDate)
    }

    func testCreateRecurringTask() {
        let task = careTaskRepository.create(
            type: .fertilizing,
            plant: testPlant,
            scheduledDate: Date(),
            isRecurring: true,
            frequency: .weekly
        )

        XCTAssertTrue(task.isRecurring)
        XCTAssertEqual(task.frequency, "Weekly")
    }

    func testCreateTaskWithAllTypes() {
        for taskType in CareTask.TaskType.allCases {
            let task = careTaskRepository.create(
                type: taskType,
                plant: testPlant,
                scheduledDate: Date()
            )

            XCTAssertEqual(task.taskType, taskType.rawValue)
        }
    }

    // MARK: - Read Tests

    func testFetchAllTasks() {
        _ = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: Date())
        _ = careTaskRepository.create(type: .fertilizing, plant: testPlant, scheduledDate: Date())
        _ = careTaskRepository.create(type: .pruning, plant: testPlant, scheduledDate: Date())

        let tasks = careTaskRepository.fetchAll()

        XCTAssertEqual(tasks.count, 3)
    }

    func testFetchById() {
        let created = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: Date()
        )

        let fetched = careTaskRepository.fetchById(created.id)

        XCTAssertNotNil(fetched)
        XCTAssertEqual(fetched?.id, created.id)
    }

    func testFetchByPlant() {
        let plant2 = plantRepository.create(name: "Another Plant")

        _ = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: Date())
        _ = careTaskRepository.create(type: .fertilizing, plant: testPlant, scheduledDate: Date())
        _ = careTaskRepository.create(type: .pruning, plant: plant2, scheduledDate: Date())

        let tasksForTestPlant = careTaskRepository.fetchByPlant(testPlant)

        XCTAssertEqual(tasksForTestPlant.count, 2)
    }

    func testFetchDueToday() {
        let calendar = Calendar.current
        let today = Date()
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: today)!
        let yesterday = calendar.date(byAdding: .day, value: -1, to: today)!

        _ = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: today)
        _ = careTaskRepository.create(type: .fertilizing, plant: testPlant, scheduledDate: tomorrow)
        _ = careTaskRepository.create(type: .pruning, plant: testPlant, scheduledDate: yesterday)

        let dueToday = careTaskRepository.fetchDueToday()

        XCTAssertEqual(dueToday.count, 1)
        XCTAssertEqual(dueToday.first?.taskType, "Watering")
    }

    func testFetchOverdue() {
        let calendar = Calendar.current
        let today = Date()
        let yesterday = calendar.date(byAdding: .day, value: -1, to: today)!
        let lastWeek = calendar.date(byAdding: .day, value: -7, to: today)!

        _ = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: today)
        _ = careTaskRepository.create(type: .fertilizing, plant: testPlant, scheduledDate: yesterday)
        _ = careTaskRepository.create(type: .pruning, plant: testPlant, scheduledDate: lastWeek)

        let overdue = careTaskRepository.fetchOverdue()

        XCTAssertEqual(overdue.count, 2)
    }

    func testFetchUpcoming() {
        let calendar = Calendar.current
        let today = Date()
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: today)!
        let nextWeek = calendar.date(byAdding: .day, value: 7, to: today)!
        let yesterday = calendar.date(byAdding: .day, value: -1, to: today)!

        _ = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: today)
        _ = careTaskRepository.create(type: .fertilizing, plant: testPlant, scheduledDate: tomorrow)
        _ = careTaskRepository.create(type: .pruning, plant: testPlant, scheduledDate: nextWeek)
        _ = careTaskRepository.create(type: .harvesting, plant: testPlant, scheduledDate: yesterday)

        let upcoming = careTaskRepository.fetchUpcoming()

        XCTAssertEqual(upcoming.count, 3) // Today, tomorrow, next week
    }

    func testFilterByType() {
        _ = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: Date())
        _ = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: Date())
        _ = careTaskRepository.create(type: .fertilizing, plant: testPlant, scheduledDate: Date())

        let wateringTasks = careTaskRepository.filterByType(.watering)

        XCTAssertEqual(wateringTasks.count, 2)
    }

    // MARK: - Complete Tests

    func testMarkComplete() {
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: Date()
        )

        XCTAssertNil(task.completedDate)
        XCTAssertFalse(task.isCompleted)

        careTaskRepository.markComplete(task)

        XCTAssertNotNil(task.completedDate)
        XCTAssertTrue(task.isCompleted)
    }

    func testMarkCompleteCreatesNextRecurringTask() {
        let scheduledDate = Date()
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: scheduledDate,
            isRecurring: true,
            frequency: .weekly
        )

        let initialTaskCount = careTaskRepository.fetchAll().count

        careTaskRepository.markComplete(task)

        let finalTaskCount = careTaskRepository.fetchAll().count

        // Should have created a new task
        XCTAssertEqual(finalTaskCount, initialTaskCount + 1)

        // Find the new task (not the completed one)
        let upcomingTasks = careTaskRepository.fetchUpcoming()
        let newTask = upcomingTasks.first { $0.id != task.id }

        XCTAssertNotNil(newTask)
        XCTAssertTrue(newTask?.isRecurring ?? false)
        XCTAssertEqual(newTask?.taskType, task.taskType)
    }

    func testFetchCompleted() {
        let task1 = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: Date())
        let task2 = careTaskRepository.create(type: .fertilizing, plant: testPlant, scheduledDate: Date())
        _ = careTaskRepository.create(type: .pruning, plant: testPlant, scheduledDate: Date())

        careTaskRepository.markComplete(task1)
        careTaskRepository.markComplete(task2)

        let completed = careTaskRepository.fetchCompleted()

        XCTAssertEqual(completed.count, 2)
    }

    // MARK: - Snooze Tests

    func testSnoozeToDate() {
        let originalDate = Date()
        let newDate = Calendar.current.date(byAdding: .day, value: 1, to: originalDate)!

        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: originalDate
        )

        careTaskRepository.snooze(task, to: newDate)

        XCTAssertEqual(task.scheduledDate, newDate)
    }

    func testSnoozeByHours() {
        let originalDate = Date()
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: originalDate
        )

        careTaskRepository.snooze(task, byHours: 3)

        // Should be approximately 3 hours from now
        let expectedDate = Calendar.current.date(byAdding: .hour, value: 3, to: Date())!
        let timeDifference = abs(task.scheduledDate.timeIntervalSince(expectedDate))

        XCTAssertLessThan(timeDifference, 60) // Within 1 minute
    }

    // MARK: - Delete Tests

    func testDeleteTask() {
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: Date()
        )
        let id = task.id

        careTaskRepository.delete(task)

        let fetched = careTaskRepository.fetchById(id)
        XCTAssertNil(fetched)
    }

    func testDeleteById() {
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: Date()
        )
        let id = task.id

        careTaskRepository.deleteById(id)

        let fetched = careTaskRepository.fetchById(id)
        XCTAssertNil(fetched)
    }

    // MARK: - Update Tests

    func testUpdateTask() {
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: Date()
        )

        let newDate = Calendar.current.date(byAdding: .day, value: 5, to: Date())!

        careTaskRepository.update(
            task,
            type: .fertilizing,
            scheduledDate: newDate,
            notes: "Updated notes"
        )

        XCTAssertEqual(task.taskType, "Fertilizing")
        XCTAssertEqual(task.scheduledDate, newDate)
        XCTAssertEqual(task.notes, "Updated notes")
    }

    // MARK: - Computed Properties Tests

    func testIsOverdueComputed() {
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: Date())!
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: yesterday
        )

        XCTAssertTrue(task.isOverdue)
    }

    func testIsNotOverdueWhenCompleted() {
        let yesterday = Calendar.current.date(byAdding: .day, value: -1, to: Date())!
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: yesterday
        )

        careTaskRepository.markComplete(task)

        XCTAssertFalse(task.isOverdue)
    }

    func testIsDueTodayComputed() {
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: Date()
        )

        XCTAssertTrue(task.isDueToday)
    }

    func testIsDueThisWeekComputed() {
        let inTwoDays = Calendar.current.date(byAdding: .day, value: 2, to: Date())!
        let task = careTaskRepository.create(
            type: .watering,
            plant: testPlant,
            scheduledDate: inTwoDays
        )

        XCTAssertTrue(task.isDueThisWeek)
    }

    // MARK: - ViewModel Tests

    func testCareTaskListViewModelLoadsGroupedTasks() async {
        let calendar = Calendar.current
        let today = Date()
        let tomorrow = calendar.date(byAdding: .day, value: 1, to: today)!
        let nextWeek = calendar.date(byAdding: .day, value: 8, to: today)!
        let yesterday = calendar.date(byAdding: .day, value: -1, to: today)!

        _ = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: today)
        _ = careTaskRepository.create(type: .fertilizing, plant: testPlant, scheduledDate: tomorrow)
        _ = careTaskRepository.create(type: .pruning, plant: testPlant, scheduledDate: nextWeek)
        _ = careTaskRepository.create(type: .harvesting, plant: testPlant, scheduledDate: yesterday)

        let viewModel = await CareTaskListViewModel(repository: careTaskRepository)
        await viewModel.loadTasks()

        await MainActor.run {
            XCTAssertEqual(viewModel.overdueTasks.count, 1)
            XCTAssertEqual(viewModel.todayTasks.count, 1)
            XCTAssertGreaterThanOrEqual(viewModel.thisWeekTasks.count, 1) // tomorrow
            XCTAssertGreaterThanOrEqual(viewModel.laterTasks.count, 1) // next week
        }
    }

    func testCareTaskListViewModelFilters() async {
        _ = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: Date())
        _ = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: Date())
        _ = careTaskRepository.create(type: .fertilizing, plant: testPlant, scheduledDate: Date())

        let viewModel = await CareTaskListViewModel(repository: careTaskRepository)
        await viewModel.loadTasks()

        await MainActor.run {
            viewModel.selectedTaskTypeFilter = .watering
        }

        // Wait for debounce
        try? await Task.sleep(nanoseconds: 400_000_000)

        await MainActor.run {
            let totalFiltered = viewModel.todayTasks.count
            XCTAssertEqual(totalFiltered, 2)
        }
    }

    func testAddCareTaskViewModelValidation() async {
        let viewModel = await AddCareTaskViewModel(
            careTaskRepository: careTaskRepository,
            plantRepository: plantRepository
        )

        await MainActor.run {
            XCTAssertFalse(viewModel.isValid)

            viewModel.selectedPlant = testPlant

            XCTAssertTrue(viewModel.isValid)
        }
    }

    func testAddCareTaskViewModelSave() async {
        let viewModel = await AddCareTaskViewModel(
            careTaskRepository: careTaskRepository,
            plantRepository: plantRepository,
            preselectedPlant: testPlant
        )

        await MainActor.run {
            viewModel.taskType = .fertilizing
            viewModel.scheduledDate = Date()
            viewModel.notes = "Test notes"
            viewModel.isRecurring = true
            viewModel.frequency = .weekly

            let task = viewModel.save()

            XCTAssertNotNil(task)
            XCTAssertEqual(task?.taskType, "Fertilizing")
            XCTAssertEqual(task?.notes, "Test notes")
            XCTAssertTrue(task?.isRecurring ?? false)
            XCTAssertEqual(task?.frequency, "Weekly")
        }
    }

    func testAddCareTaskViewModelRecurrenceCalculation() async {
        let viewModel = await AddCareTaskViewModel(
            careTaskRepository: careTaskRepository,
            plantRepository: plantRepository
        )

        let today = Date()

        await MainActor.run {
            viewModel.scheduledDate = today
            viewModel.isRecurring = true

            // Test weekly
            viewModel.frequency = .weekly
            let weeklyNext = viewModel.calculateNextOccurrence(from: today)
            let weeklyExpected = Calendar.current.date(byAdding: .weekOfYear, value: 1, to: today)
            XCTAssertEqual(weeklyNext, weeklyExpected)

            // Test daily
            viewModel.frequency = .daily
            let dailyNext = viewModel.calculateNextOccurrence(from: today)
            let dailyExpected = Calendar.current.date(byAdding: .day, value: 1, to: today)
            XCTAssertEqual(dailyNext, dailyExpected)

            // Test monthly
            viewModel.frequency = .monthly
            let monthlyNext = viewModel.calculateNextOccurrence(from: today)
            let monthlyExpected = Calendar.current.date(byAdding: .month, value: 1, to: today)
            XCTAssertEqual(monthlyNext, monthlyExpected)
        }
    }

    // MARK: - History ViewModel Tests

    func testCareHistoryViewModelLoadsCompletedTasks() async {
        let task1 = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: Date())
        let task2 = careTaskRepository.create(type: .fertilizing, plant: testPlant, scheduledDate: Date())
        _ = careTaskRepository.create(type: .pruning, plant: testPlant, scheduledDate: Date())

        careTaskRepository.markComplete(task1)
        careTaskRepository.markComplete(task2)

        let viewModel = await CareHistoryViewModel(repository: careTaskRepository)
        await viewModel.loadHistory()

        await MainActor.run {
            XCTAssertEqual(viewModel.completedTasks.count, 2)
            XCTAssertEqual(viewModel.totalCompleted, 2)
        }
    }

    func testCareHistoryViewModelCalculatesStatistics() async {
        // Create and complete several tasks
        for _ in 0..<5 {
            let task = careTaskRepository.create(type: .watering, plant: testPlant, scheduledDate: Date())
            careTaskRepository.markComplete(task)
        }

        let viewModel = await CareHistoryViewModel(repository: careTaskRepository)
        await viewModel.loadHistory()

        await MainActor.run {
            XCTAssertEqual(viewModel.totalCompleted, 5)
            XCTAssertEqual(viewModel.thisWeekCompleted, 5)
            XCTAssertEqual(viewModel.thisMonthCompleted, 5)
        }
    }
}
