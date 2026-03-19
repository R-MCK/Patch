# Tranche 1: Navigation & Gardens - Before Visual Audit

## `MainTabView.swift`
- **Layout & Spacing**: Uses an opaque tab bar with customized tinting. Contains placeholder views for tabs other than Design.
- **Visuals**: Incorporates a shared floating leaves background, but relying on `UIColor` instead of the pure SwiftUI semantic colors from `AppTheme`. The "Design" tab has a hero card which looks alright, but spacing needs strict enforcement against `AppTheme.Spacing`.

## `GardenListView.swift`
- **Current State**: Displays a count, an empty state, or a list of `GardenCard`s.
- **Issues**:
  - The `FloatingActionButton` might obscure the lowest list items.
  - The `GardensHeaderCard` feels slightly squashed; text hierarchy (`.patchCaption1`, `.patchTitle2`) is decent but could use more breathing room.
  - The background is `.hidden` on `List`, but the safe area transitions at the bottom navigation might look jarring.
  - Empty states must feel intentional and premium, per the prompt.

## `GardenDetailView.swift`
- **Current State**: Uses a standard ScrollView with a Hero section, stats, info, and plants.
- **Issues**:
  - `GardenHeaderSection` takes up a lot of space but doesn't feel like a rich, premium header. The icon `square.grid.2x2.fill` is large but bare.
  - `GardenStatsSection` puts stats in small cards that may feel disparate.
  - `GardenPlantsSection` lists plants, but the Empty state for "no plants" uses a standard system icon and gray text.

## `AddGardenView.swift`
- **Current State**: Uses standard SwiftUI `Form` elements wrapped in custom `cardStyle()` modifiers.
- **Issues**:
  - Form sections look functional but not "premium".
  - Numeric input row format is very static. Width/Length inputs feel slightly clunky against a trailing alignment.
  - `AppTheme` is present but the layout lacks the "wow" micro-interactions or lush visual depth.

## Objective
Refactor these 4 views to use premium gradients, rigorous spacing, high-end Apple-esque translucent materials (`.ultraThinMaterial`), and better typography. We will upgrade the empty states and card layouts to meet a top-tier production standard.
