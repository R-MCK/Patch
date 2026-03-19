# Before Visual Audit: Tranche 3 (Care Tasks)

## Overview
This document evaluates the UI/UX of the Care Tasks section of the Patch application before integrating the premium layout refactoring logic from Tranches 1 and 2.

### 1. CareTaskListView.swift
- **Hierarchy & Containers**: The `CareTaskHeaderCard` utilizes the generic `.cardStyle()` box styling, creating sharp contrasting edges.
- **Section Headers**: Uses large system text with generic alignments, which does not look cohesive with the `AppTheme` typography.
- **Filtering**: Chips work well but lack premium translucency and soft overlays.

### 2. CareTaskRowView.swift
- **Cards**: The tasks themselves are layered on `.patchBackgroundSecondary` rather than the premium `.ultraThinMaterial` styling standard. Overdue states use heavy `.healthCritical` opacity fills which might distract visually inside a crowded list.
- **Compact View**: Very dense, no distinct hierarchy compared to standard rows.

### 3. AddCareTaskView.swift
- **Structural**: Built inside a standard iOS `Form`, violating the custom `ScrollView` architectural standard defined in `EditPlantView` and `AddPlantView` in Tranche 2. It creates an unbranded 'Settings UI' aesthetic.

### 4. CareHistoryView.swift & CareStatisticsView.swift
- **Charts and Models**: Standard usage of color, missing subtle `.white.opacity(0.6)` or ultra-thin material layering under graphs.
- **Stat Cards**: Standard `.patchBackgroundSecondary`, needing a unified upgrade to our `customCard()` styles.

## Next Steps
- Upgrade `CareTaskListView` header and section layouts.
- Convert `AddCareTaskView` to a custom scrolled card design.
- Implement `.ultraThinMaterial` throughout `CareHistory` and `CareStatistics`.
