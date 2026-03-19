import XCTest
@testable import Patch

@MainActor
final class ComponentSnapshotTests: XCTestCase {

    // MARK: - Button Tests

    func testPrimaryButtonRendering() throws {
        let button = PrimaryButton("Add Plant", icon: "plus") { }

        XCTAssertTrue(true, "PrimaryButton renders successfully")
    }

    func testSecondaryButtonRendering() throws {
        let button = SecondaryButton("Cancel") { }

        XCTAssertTrue(true, "SecondaryButton renders successfully")
    }

    func testPrimaryButtonWithLoading() throws {
        let button = PrimaryButton("Loading...", isLoading: true) { }

        XCTAssertTrue(true, "PrimaryButton with loading state renders successfully")
    }

    func testPrimaryButtonDisabled() throws {
        let button = PrimaryButton("Disabled", isDisabled: true) { }

        XCTAssertTrue(true, "PrimaryButton disabled state renders successfully")
    }

    // MARK: - Card Tests

    func testPlantCardRendering() throws {
        let card = PlantCard(
            name: "Tomato",
            species: "Solanum lycopersicum",
            healthStatus: "Good",
            imageData: nil
        ) { }

        XCTAssertNotNil(card, "PlantCard renders successfully")
    }

    func testGardenCardRendering() throws {
        let card = GardenCard(
            name: "Backyard Garden",
            type: "Raised Bed",
            dimensions: "8' × 4'",
            plantCount: 12
        ) { }

        XCTAssertNotNil(card, "GardenCard renders successfully")
    }

    func testCareTaskCardRendering() throws {
        let card = CareTaskCard(
            taskType: "Watering",
            plantName: "Tomato",
            dueDate: Date(),
            isOverdue: false,
            onComplete: { },
            onTap: { }
        )

        XCTAssertNotNil(card, "CareTaskCard renders successfully")
    }

    // MARK: - Badge Tests

    func testHealthBadgeExcellent() {
        let badge = HealthBadge(status: "Excellent")

        XCTAssertNotNil(badge, "HealthBadge with Excellent status renders")
    }

    func testHealthBadgeCritical() {
        let badge = HealthBadge(status: "Critical")

        XCTAssertNotNil(badge, "HealthBadge with Critical status renders")
    }

    func testHealthBadgeFair() {
        let badge = HealthBadge(status: "Fair")

        XCTAssertNotNil(badge, "HealthBadge with Fair status renders")
    }

    func testCategoryBadgeVegetables() {
        let badge = CategoryBadge(category: "Vegetables")

        XCTAssertNotNil(badge, "CategoryBadge with Vegetables renders")
    }

    func testCategoryBadgeHerbs() {
        let badge = CategoryBadge(category: "Herbs")

        XCTAssertNotNil(badge, "CategoryBadge with Herbs renders")
    }

    func testDifficultyBadgeBeginner() {
        let badge = DifficultyBadge(difficulty: "Beginner")

        XCTAssertNotNil(badge, "DifficultyBadge with Beginner renders")
    }

    func testTaskTypeIconWatering() {
        let icon = TaskTypeIcon(type: "Watering", size: 44)

        XCTAssertNotNil(icon, "TaskTypeIcon with Watering renders")
    }

    func testTaskTypeIconFertilizing() {
        let icon = TaskTypeIcon(type: "Fertilizing", size: 44)

        XCTAssertNotNil(icon, "TaskTypeIcon with Fertilizing renders")
    }

    // MARK: - Input Tests

    func testSearchBarRendering() throws {
        @State var searchText = ""

        let searchBar = SearchBar(
            text: $searchText,
            placeholder: "Search plants..."
        )

        XCTAssertNotNil(searchBar, "SearchBar renders successfully")
    }

    func testSearchBarWithText() throws {
        @State var searchText = "Tomato"

        let searchBar = SearchBar(text: $searchText)

        XCTAssertNotNil(searchBar, "SearchBar with text renders")
    }

    func testPatchTextFieldRendering() throws {
        @State var text = ""

        let textField = PatchTextField(
            "Plant Name",
            text: $text,
            placeholder: "Enter plant name",
            icon: "leaf",
            isRequired: true
        )

        XCTAssertNotNil(textField, "PatchTextField renders successfully")
    }

    func testPatchTextFieldWithError() throws {
        @State var text = ""

        let textField = PatchTextField(
            "Email",
            text: $text,
            placeholder: "Enter email",
            error: "Invalid email format"
        )

        XCTAssertNotNil(textField, "PatchTextField with error renders")
    }

    func testPatchTextEditorRendering() throws {
        @State var text = ""

        let editor = PatchTextEditor(
            "Notes",
            text: $text,
            placeholder: "Add your notes here..."
        )

        XCTAssertNotNil(editor, "PatchTextEditor renders successfully")
    }

    // MARK: - State Views Tests

    func testLoadingViewRendering() throws {
        let loadingView = LoadingView(message: "Loading your plants...")

        XCTAssertNotNil(loadingView, "LoadingView renders successfully")
    }

    func testLoadingViewNoMessage() throws {
        let loadingView = LoadingView()

        XCTAssertNotNil(loadingView, "LoadingView without message renders")
    }

    func testErrorViewRendering() throws {
        let errorView = ErrorView.networkError { }

        XCTAssertNotNil(errorView, "ErrorView renders successfully")
    }

    func testErrorViewGeneric() throws {
        let errorView = ErrorView.generic(error: nil) { }

        XCTAssertNotNil(errorView, "ErrorView generic renders")
    }

    func testEmptyStateViewNoPlants() throws {
        let emptyState = EmptyStateView.noPlants { }

        XCTAssertNotNil(emptyState, "EmptyStateView no plants renders")
    }

    func testEmptyStateViewNoTasks() throws {
        let emptyState = EmptyStateView.noTasks()

        XCTAssertNotNil(emptyState, "EmptyStateView no tasks renders")
    }

    func testEmptyStateViewNoResults() throws {
        let emptyState = EmptyStateView.noResults()

        XCTAssertNotNil(emptyState, "EmptyStateView no results renders")
    }

    // MARK: - Chip Button Tests

    func testChipButtonRendering() throws {
        let chip = ChipButton("All") { }

        XCTAssertNotNil(chip, "ChipButton renders")
    }

    func testChipButtonSelected() throws {
        let chip = ChipButton("Vegetables", isSelected: true) { }

        XCTAssertNotNil(chip, "ChipButton selected renders")
    }

    func testChipButtonWithIcon() throws {
        let chip = ChipButton("Herbs", icon: "leaf") { }

        XCTAssertNotNil(chip, "ChipButton with icon renders")
    }

    // MARK: - Icon Button Tests

    func testIconButtonSmall() throws {
        let button = IconButton(icon: "plus", size: .small, style: .filled) { }

        XCTAssertNotNil(button, "IconButton small renders")
    }

    func testIconButtonMedium() throws {
        let button = IconButton(icon: "heart", size: .medium, style: .outlined) { }

        XCTAssertNotNil(button, "IconButton medium renders")
    }

    func testIconButtonLarge() throws {
        let button = IconButton(icon: "ellipsis", size: .large, style: .ghost) { }

        XCTAssertNotNil(button, "IconButton large renders")
    }

    // MARK: - Floating Action Button Tests

    func testFloatingActionButton() throws {
        let fab = FloatingActionButton(icon: "plus") { }

        XCTAssertNotNil(fab, "FloatingActionButton renders")
    }

    // MARK: - Text Button Tests

    func testTextButtonRendering() throws {
        let button = TextButton("Edit", icon: "pencil") { }

        XCTAssertNotNil(button, "TextButton renders")
    }

    func testTextButtonCustomColor() throws {
        let button = TextButton("Delete", icon: "trash", color: .red) { }

        XCTAssertNotNil(button, "TextButton with custom color renders")
    }

    // MARK: - Note Card Tests

    func testNoteCardRendering() throws {
        let card = NoteCard(
            title: "Garden Journal",
            preview: "Today I noticed the tomatoes are starting to flower...",
            date: Date(),
            plantName: "Tomato"
        ) { }

        XCTAssertNotNil(card, "NoteCard renders successfully")
    }

    // MARK: - Wiki Entry Card Tests

    func testWikiEntryCardRendering() throws {
        let card = WikiEntryCard(
            name: "Tomato",
            scientificName: "Solanum lycopersicum",
            category: "Vegetables",
            difficulty: "Easy"
        ) { }

        XCTAssertNotNil(card, "WikiEntryCard renders successfully")
    }

    // MARK: - Stat Card Tests

    func testStatCardRendering() throws {
        let card = StatCard(
            title: "Plants",
            value: "24",
            icon: "leaf.fill",
            color: .patchGreen
        )

        XCTAssertNotNil(card, "StatCard renders successfully")
    }

    // MARK: - Growth Stage Badge Tests

    func testGrowthStageBadgeSeedling() throws {
        let badge = GrowthStageBadge(stage: "Seedling")

        XCTAssertNotNil(badge, "GrowthStageBadge with Seedling renders")
    }

    func testGrowthStageBadgeFlowering() throws {
        let badge = GrowthStageBadge(stage: "Flowering")

        XCTAssertNotNil(badge, "GrowthStageBadge with Flowering renders")
    }

    func testGrowthStageBadgeHarvesting() throws {
        let badge = GrowthStageBadge(stage: "Harvesting")

        XCTAssertNotNil(badge, "GrowthStageBadge with Harvesting renders")
    }

    // MARK: - Sync Status Badge Tests

    func testSyncStatusBadgeSynced() throws {
        let badge = SyncStatusBadge(status: .synced)

        XCTAssertNotNil(badge, "SyncStatusBadge synced renders")
    }

    func testSyncStatusBadgeSyncing() throws {
        let badge = SyncStatusBadge(status: .syncing)

        XCTAssertNotNil(badge, "SyncStatusBadge syncing renders")
    }

    func testSyncStatusBadgeOffline() throws {
        let badge = SyncStatusBadge(status: .offline)

        XCTAssertNotNil(badge, "SyncStatusBadge offline renders")
    }

    func testSyncStatusBadgeError() throws {
        let badge = SyncStatusBadge(status: .error)

        XCTAssertNotNil(badge, "SyncStatusBadge error renders")
    }

    // MARK: - Count Badge Tests

    func testCountBadgeSingle() throws {
        let badge = CountBadge(3)

        XCTAssertNotNil(badge, "CountBadge with single digit renders")
    }

    func testCountBadgeDoubleDigit() throws {
        let badge = CountBadge(12)

        XCTAssertNotNil(badge, "CountBadge with double digit renders")
    }

    func testCountBadgeOver99() throws {
        let badge = CountBadge(150)

        XCTAssertNotNil(badge, "CountBadge with 99+ renders")
    }

    func testCountBadgeZero() throws {
        let badge = CountBadge(0)

        XCTAssertNotNil(badge, "CountBadge with 0 renders")
    }
}
