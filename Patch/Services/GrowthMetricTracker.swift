import Foundation
import os

enum GrowthMetricTracker {
    private static let prefix = "patch.metrics."
    private static let logger = Logger(subsystem: "com.patch.app", category: "metrics")

    static func track(event: String, properties: [String: String] = [:]) {
        let defaults = UserDefaults.standard
        let key = prefix + event
        defaults.set(defaults.integer(forKey: key) + 1, forKey: key)

        let serializedProperties = properties
            .sorted { $0.key < $1.key }
            .map { "\($0.key)=\($0.value)" }
            .joined(separator: ",")
        logger.info("[GrowthMetric] \(event) \(serializedProperties)")
    }

    static func count(for event: String) -> Int {
        UserDefaults.standard.integer(forKey: prefix + event)
    }
}
