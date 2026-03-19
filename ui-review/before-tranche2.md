# Before Visual Audit: Tranche 2 (Plants)

## Overview
This document covers the UI/UX baseline for the Plants section (Tracker tab) prior to refactoring to the premium production standard.

## 1. PlantListView.swift
**Current State:**
- The `TrackerHeaderCard` uses the basic `.cardStyle()` modifier, which applies a flat background color and a standard shadow.
- The empty state for "No plants" (`EmptyStateView.noPlants`) has a large, overwhelming icon and basic center-aligned text.
- The `FilterChipsView` and `SearchBar` use standard system materials or basic opacities that don't match the new `.ultraThinMaterial` styling.
- The Floating Action Button (FAB) works but needs to ensure it clears the translucent tab bar.

## 2. PlantRowView.swift
**Current State:**
- The rows within the list use `.cardStyle(padding: AppTheme.Spacing.md)` which results in a standard opaque white/gray card.
- The typography (`.patchHeadline` and `.patchSubheadline`) is good but lacks the premium kerning and weight adjustments seen in Tranche 1.
- The `PlantThumbnailView` uses a basic `Color.patchBackgroundTertiary` background when no image is present.

## 3. PlantDetailView.swift
**Current State:**
- The `PlantHeaderSection` has a flat `Color.patchBackgroundSecondary` background with sharp corners.
- `PlantStatsStrip` relies on pill-shaped containers with a 1px border (`Color.patchBackgroundTertiary.opacity(0.8)`), which feels somewhat disconnected from the overarching premium aesthetic.
- The `PlantInfoSection`, `PlantActionsSection`, and others use `.cardStyle` or flat backgrounds, missing the glassy, layered feel.
- Divider lines and section spacing can be tightened.

## 4. AddPlantView.swift & EditPlantView.swift
**Current State:**
- The `AddPlantHeaderCard` uses the old `cardStyle()` and has an icon inside a `RoundedRectangle` instead of the newly standardized light icon in a circle.
- Form sections (`Basic Info`, `Location`, `Status`) use `.cardStyle()` and basic opacity overlays that mimic default iOS settings rather than a bespoke app experience.
- The `GardenPickerView` selection styling and `PatchDatePicker` need to match the updated input row styles from `AddGardenView`.

## Plan for Refactoring
Apply `.ultraThinMaterial` backgrounds, rounded `AppTheme.CornerRadius.xl` corners, lighter/subtler shadows, and upgraded typography (kerning, uppercase captions, light-weight icons in circular containers) across all these views to bring them into alignment with the Navigation & Gardens (Tranche 1) updates.
