# After Visual Audit: Tranche 2 (Plants)

## Overview
This document covers the UI/UX changes made to the Plants section of the Patch app, aligning it with the production standard established in Tranche 1.

### Key Refactor Goals Achieved
- Substituted arbitrary standard colors for a cohesive palette using `.patchPrimary.opacity(...)`.
- Reduced sharp shadows and generic `.cardStyle()` box-borders in favor of smoother `.ultraThinMaterial` backgrounds.
- Converted entire `Form` views (`EditPlantView`, `AddPlantCareTaskView`) into modern `ScrollView` formats using `AppTheme` padding constants and custom cards.

---

## 1. PlantListView.swift
**Changes Made:**
1. The `TrackerHeaderCard` was upgraded to `.ultraThinMaterial` with a semi-transparent white background, softer `AppTheme.CornerRadius.xl`, and refined drop shadows. 
2. Typography was given tracking (kerning) and `.uppercase` text styling, replacing the standard labels.
3. The Floating Action Button (FAB) padding was updated to clear the translucent tab bar effectively.

**Before & After:**
- *Before*: [before-tranche2.md](./before-tranche2.md)
- *After*: [after-tranche2-plantlist.png](./after-tranche2-plantlist.png)

---

## 2. PlantRowView.swift
**Changes Made:**
1. Upgraded row containers to use `.ultraThinMaterial` natively rather than the legacy `.cardStyle()`.
2. Changed the fallback standard `Image` background from a solid gray (`Color.patchBackgroundTertiary`) to an expensive, translucent primary treatment (`Color.patchPrimary.opacity(0.08)`).
3. The default fallback icon (`leaf.fill`) was adjusted to use `.light` font weights.

---

## 3. PlantDetailView.swift
**Changes Made:**
1. All sections (`PlantHeaderSection`, `PlantInfoSection`, `PlantPhotosSection`, `PlantNotesSection`, etc.) were refactored to `.ultraThinMaterial`.
2. Replaced flat, unstyled backgrounds with the premium layering logic introduced in Tranche 1.
3. Upgraded the `StatPill` metrics to use pill-shaped containers with matching material overlays.

---

## 4. AddPlantView.swift & EditPlantView.swift
**Changes Made:**
1. Completely rewrote `EditPlantView` from using the native iOS `Form` and `Section` elements to utilizing a `ScrollView` with custom form cards. This matches `AddPlantView` and prevents the application from looking like an iOS Settings clone.
2. The `AddPlantHeaderCard` was refactored to use a lightweight `leaf.fill` icon on a circular background layer.
3. All form sections in `AddPlantView` were converted to `.ultraThinMaterial` panels.

---

## 5. AddPlantCareTaskView.swift
**Changes Made:**
1. Remapped the view from a default `Form` to a `ScrollView`.
2. Structured form elements (Types, Recurrence flags, Note fields) inside premium `AppTheme.Spacing.lg` styled cards.
3. Removed redundant and unmaintained enums/helpers (`iconForType`), opting to utilize the models' inherent `type.icon` capabilities directly within custom label rows.
