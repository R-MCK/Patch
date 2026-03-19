# After Visual Audit: Tranche 3 (Care Tasks)

## Overview
This document covers the UI adjustments to the Care Tasks sections holding to the established premium standard of translucent materials, soft contours, and elevated typography.

### 1. CareTaskListView.swift & CareTaskRowView.swift
**Changes:**
- Converted `CareTaskHeaderCard`'s solid container to an `.ultraThinMaterial` styling with improved tracked casing on the subtitle.
- Reworked `CareTaskRowView`. It now renders inside an `.ultraThinMaterial` base. Overdue tasks subtly amplify their priority using a soft `healthCritical` opacity wash and thin structural border, instead of thick distracting solid fills.

### 2. AddCareTaskView.swift
**Changes:**
- Completely stripped out the default iOS `Form` architecture. 
- Integrated custom `ScrollView` stacks carrying `.ultraThinMaterial` panels with segmented inputs that exactly match our `EditPlantView` and `AddPlantView` layouts, eliminating the generic prototype feel.

### 3. CareHistoryView.swift & CareStatisticsView.swift
**Changes:**
- Migrated the global statistic boxes, history row trackers, and visual breakdown charts from basic `.patchBackgroundSecondary` wrappers to sophisticated `.ultraThinMaterial` sheets with unified soft drop shadows (`AppTheme.Shadow.sm`).

### 4. Empty States
**Changes:**
- Aligned `EmptyCareTaskView` iconography perfectly with the `EmptyStateView` standard setup in `States.swift` (light font weight, larger icons, primary circular washes).

**Before & After**
- *Before*: [before-tranche3.md](./before-tranche3.md)
- *After*: [after-tranche3.png](./after-tranche3.png)
