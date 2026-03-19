import XCTest
@testable import Patch

final class ViralShareBuilderTests: XCTestCase {
    func testInviteCodeIsDeterministicAndExpectedFormat() {
        let first = ViralShareBuilder.inviteCode(from: "plant-123")
        let second = ViralShareBuilder.inviteCode(from: "plant-123")

        XCTAssertEqual(first, second)
        XCTAssertEqual(first.count, 6)
        XCTAssertNotNil(first.range(of: "^[A-Z2-9]{6}$", options: .regularExpression))
    }

    func testCurrentCareStreakCountsConsecutiveDaysFromToday() {
        let calendar = Calendar(identifier: .gregorian)
        let today = calendar.startOfDay(for: Date(timeIntervalSince1970: 1_739_880_000))
        let yesterday = calendar.date(byAdding: .day, value: -1, to: today)!
        let twoDaysAgo = calendar.date(byAdding: .day, value: -2, to: today)!

        let streak = ViralShareBuilder.currentCareStreak(
            completionDates: [today, yesterday, twoDaysAgo],
            calendar: calendar,
            referenceDate: today
        )

        XCTAssertEqual(streak, 3)
    }

    func testCurrentCareStreakReturnsZeroWhenNotRecent() {
        let calendar = Calendar(identifier: .gregorian)
        let today = calendar.startOfDay(for: Date(timeIntervalSince1970: 1_739_880_000))
        let fourDaysAgo = calendar.date(byAdding: .day, value: -4, to: today)!

        let streak = ViralShareBuilder.currentCareStreak(
            completionDates: [fourDaysAgo],
            calendar: calendar,
            referenceDate: today
        )

        XCTAssertEqual(streak, 0)
    }

    func testChallengeMessageIncludesInviteCodeAndHashtags() {
        let message = ViralShareBuilder.challengeMessage(
            plantName: "Tomato",
            species: "Solanum lycopersicum",
            healthStatus: "Good",
            growthStage: "Flowering",
            streakDays: 5,
            pendingTaskCount: 2,
            photoCount: 8,
            inviteCode: "ABC123"
        )

        XCTAssertTrue(message.contains("ABC123"))
        XCTAssertTrue(message.contains("#PatchGardenChallenge"))
        XCTAssertTrue(message.contains("Tomato"))
    }
}
