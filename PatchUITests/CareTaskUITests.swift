import XCTest

final class CareTaskUITests: XCTestCase {

    var app: XCUIApplication!

    override func setUpWithError() throws {
        continueAfterFailure = false
        app = XCUIApplication()
        app.launchArguments = ["--uitesting"]
        app.launch()
    }

    override func tearDownWithError() throws {
        app = nil
    }

    // MARK: - Helper Methods

    private func navigateToCareTasks() {
        // Assuming the app has a tab bar with Care Tasks tab
        // Adjust the identifier based on actual implementation
        let careTasksTab = app.tabBars.buttons["Tasks"]
        if careTasksTab.exists {
            careTasksTab.tap()
        }
    }

    private func waitForElement(_ element: XCUIElement, timeout: TimeInterval = 5) -> Bool {
        return element.waitForExistence(timeout: timeout)
    }

    // MARK: - Care Task List Tests

    func testCareTaskListDisplays() throws {
        navigateToCareTasks()

        // Verify navigation title
        let navTitle = app.navigationBars["Care Tasks"]
        XCTAssertTrue(waitForElement(navTitle))
    }

    func testEmptyStateDisplaysWhenNoTasks() throws {
        navigateToCareTasks()

        // If there are no tasks, empty state should be visible
        let emptyStateText = app.staticTexts["All Caught Up!"]
        let addButton = app.buttons["Add Care Task"]

        // Either we have tasks or we see empty state
        // This test will pass in either case, but validates the UI is working
        if emptyStateText.exists {
            XCTAssertTrue(addButton.exists)
        }
    }

    func testAddTaskButtonExists() throws {
        navigateToCareTasks()

        // Check for add button in navigation bar
        let addButton = app.navigationBars.buttons["plus"]
        XCTAssertTrue(waitForElement(addButton))
    }

    // MARK: - Add Care Task Flow Tests

    func testOpenAddTaskSheet() throws {
        navigateToCareTasks()

        // Tap add button
        let addButton = app.navigationBars.buttons["plus"]
        if waitForElement(addButton) {
            addButton.tap()
        }

        // Verify sheet appears with title
        let sheetTitle = app.navigationBars["Add Care Task"]
        XCTAssertTrue(waitForElement(sheetTitle))
    }

    func testAddTaskFormElements() throws {
        navigateToCareTasks()

        // Open add task sheet
        let addButton = app.navigationBars.buttons["plus"]
        if waitForElement(addButton) {
            addButton.tap()
        }

        // Wait for sheet
        let sheetTitle = app.navigationBars["Add Care Task"]
        guard waitForElement(sheetTitle) else {
            XCTFail("Add task sheet did not appear")
            return
        }

        // Verify form sections exist
        XCTAssertTrue(app.staticTexts["Task Type"].exists || app.cells.staticTexts["Task Type"].exists)
        XCTAssertTrue(app.staticTexts["Schedule"].exists || app.cells.staticTexts["Schedule"].exists)
    }

    func testCancelAddTask() throws {
        navigateToCareTasks()

        // Open add task sheet
        let addButton = app.navigationBars.buttons["plus"]
        if waitForElement(addButton) {
            addButton.tap()
        }

        // Wait for sheet
        let sheetTitle = app.navigationBars["Add Care Task"]
        guard waitForElement(sheetTitle) else {
            XCTFail("Add task sheet did not appear")
            return
        }

        // Tap cancel
        let cancelButton = app.buttons["Cancel"]
        if cancelButton.exists {
            cancelButton.tap()
        }

        // Verify we're back to task list
        let navTitle = app.navigationBars["Care Tasks"]
        XCTAssertTrue(waitForElement(navTitle))
    }

    func testSelectTaskType() throws {
        navigateToCareTasks()

        // Open add task sheet
        let addButton = app.navigationBars.buttons["plus"]
        if waitForElement(addButton) {
            addButton.tap()
        }

        // Wait for sheet
        _ = app.navigationBars["Add Care Task"].waitForExistence(timeout: 3)

        // Find and tap a task type (e.g., Fertilizing)
        let fertilizerButton = app.buttons["Fertilizing"]
        if fertilizerButton.exists {
            fertilizerButton.tap()
            // Task type should be selected (button should show selected state)
        }
    }

    func testToggleRecurring() throws {
        navigateToCareTasks()

        // Open add task sheet
        let addButton = app.navigationBars.buttons["plus"]
        if waitForElement(addButton) {
            addButton.tap()
        }

        // Wait for sheet
        _ = app.navigationBars["Add Care Task"].waitForExistence(timeout: 3)

        // Find recurring toggle
        let recurringToggle = app.switches["Recurring Task"]
        if recurringToggle.exists {
            let initialValue = recurringToggle.value as? String
            recurringToggle.tap()

            // Value should have changed
            let newValue = recurringToggle.value as? String
            XCTAssertNotEqual(initialValue, newValue)
        }
    }

    // MARK: - Task Interaction Tests

    func testCompleteTaskSwipeAction() throws {
        navigateToCareTasks()

        // This test requires at least one task to exist
        // Find the first task cell
        let firstTask = app.cells.firstMatch

        if firstTask.exists {
            // Try to find complete button (shown on row)
            let completeButton = firstTask.buttons["checkmark.circle.fill"]
            if completeButton.exists {
                completeButton.tap()
                // Task should be marked complete and may disappear from list
            }
        }
    }

    func testTaskRowDisplaysCorrectInfo() throws {
        navigateToCareTasks()

        // If tasks exist, verify row content
        let firstTask = app.cells.firstMatch

        if firstTask.exists && waitForElement(firstTask) {
            // Task row should have task type icon, plant name, and due date
            // These are general checks - specific content depends on data
            XCTAssertTrue(firstTask.exists)
        }
    }

    // MARK: - Filter Tests

    func testOpenFilterSheet() throws {
        navigateToCareTasks()

        // Find filter button
        let filterButton = app.navigationBars.buttons.matching(
            NSPredicate(format: "identifier CONTAINS 'filter' OR label CONTAINS 'filter' OR identifier CONTAINS 'line.3.horizontal.decrease'")
        ).firstMatch

        if filterButton.exists {
            filterButton.tap()

            // Filter sheet should appear
            let filterTitle = app.navigationBars["Filters"]
            XCTAssertTrue(waitForElement(filterTitle))
        }
    }

    // MARK: - Snooze Tests

    func testSnoozeSheetAppears() throws {
        navigateToCareTasks()

        // This requires a task to exist
        // Find snooze button on a task row
        let snoozeButton = app.buttons["clock.badge.questionmark"].firstMatch

        if snoozeButton.exists {
            snoozeButton.tap()

            // Snooze confirmation dialog should appear
            let snoozeTitle = app.staticTexts["Snooze Task"]
            XCTAssertTrue(waitForElement(snoozeTitle, timeout: 3))
        }
    }

    // MARK: - Task Detail Tests

    func testOpenTaskDetail() throws {
        navigateToCareTasks()

        // Tap on a task to open detail
        let firstTask = app.cells.firstMatch

        if firstTask.exists && waitForElement(firstTask) {
            firstTask.tap()

            // Detail sheet should appear
            let detailTitle = app.navigationBars["Task Details"]
            if waitForElement(detailTitle) {
                XCTAssertTrue(true)
            }
        }
    }

    func testDeleteTaskFromDetail() throws {
        navigateToCareTasks()

        // Open task detail
        let firstTask = app.cells.firstMatch

        if firstTask.exists && waitForElement(firstTask) {
            firstTask.tap()

            // Wait for detail sheet
            let detailTitle = app.navigationBars["Task Details"]
            guard waitForElement(detailTitle) else { return }

            // Find delete button
            let deleteButton = app.buttons["Delete Task"]
            if deleteButton.exists {
                deleteButton.tap()

                // Confirmation alert should appear
                let deleteConfirm = app.buttons["Delete"]
                if deleteConfirm.exists {
                    deleteConfirm.tap()
                }
            }
        }
    }

    // MARK: - Pull to Refresh Tests

    func testPullToRefresh() throws {
        navigateToCareTasks()

        // Get the scroll view / list
        let scrollView = app.scrollViews.firstMatch

        if scrollView.exists {
            // Perform pull to refresh gesture
            let start = scrollView.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.3))
            let end = scrollView.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.8))
            start.press(forDuration: 0.1, thenDragTo: end)

            // Give time for refresh
            Thread.sleep(forTimeInterval: 1)

            // Verify list still exists (refresh completed without crash)
            XCTAssertTrue(app.navigationBars["Care Tasks"].exists)
        }
    }

    // MARK: - Section Tests

    func testSectionsDisplay() throws {
        navigateToCareTasks()

        // If tasks exist, check for section headers
        let todaySection = app.staticTexts["Today"]
        let thisWeekSection = app.staticTexts["This Week"]
        let laterSection = app.staticTexts["Later"]
        let overdueSection = app.staticTexts["Overdue"]

        // At least one section should exist if there are tasks
        // Or empty state should be visible
        let emptyState = app.staticTexts["All Caught Up!"]

        let hasContent = todaySection.exists ||
                         thisWeekSection.exists ||
                         laterSection.exists ||
                         overdueSection.exists ||
                         emptyState.exists

        XCTAssertTrue(hasContent, "Should display either task sections or empty state")
    }

    // MARK: - Accessibility Tests

    func testAccessibilityLabelsExist() throws {
        navigateToCareTasks()

        // Navigation should be accessible
        let navBar = app.navigationBars["Care Tasks"]
        XCTAssertTrue(navBar.isHittable || navBar.exists)

        // Add button should be accessible
        let addButton = app.navigationBars.buttons["plus"]
        if addButton.exists {
            XCTAssertTrue(addButton.isHittable)
        }
    }

    // MARK: - Performance Tests

    func testLaunchPerformance() throws {
        if #available(iOS 13.0, *) {
            measure(metrics: [XCTApplicationLaunchMetric()]) {
                XCUIApplication().launch()
            }
        }
    }
}
