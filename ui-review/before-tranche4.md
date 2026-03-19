# Before Visual Audit: Tranche 4 (Wiki)

## Overview
This document evaluates the UI/UX of the Plant Wiki section of the Patch application before integrating the premium layout refactoring logic from Tranches 1-3.

### 1. WikiHomeView.swift
- **Hierarchy & Containers**: The `WikiHeroCard`, `CategoryCardView`, and `FeaturedEntryCard` utilize the generic `.cardStyle()` box styling, creating sharp edges and solid blocks of color.
- **Search Results**: The `SearchResultRow` uses a flat `.patchBackgroundSecondary` background, dropping the elevated premium feel we established in earlier lists.

### 2. WikiCategoryView.swift
- **Cards**: The `CategoryEntryCard` is exceptionally plain, using a hardcoded `Color(.systemGray6)` background and native iOS font modifiers (`.font(.subheadline)`, etc.) instead of mapping to the tight `AppTheme` typography engine.

### 3. WikiEntryDetailView.swift
- **Structure**: Highly dense with good information, but every section wrapper falls back on `.cardStyle(padding: AppTheme.Spacing.lg)`.
- **Inner Rows**: Elements like `CareGuideRow`, `PlantingGuideRow`, and `CompanionPlantsCard` use flat `Color.patchBackgroundSecondary.opacity(0.55)` backgrounds, which feel inexpensive.

### 4. WikiEntryReferenceCard.swift
- **Architecture**: A very basic helper card missing `.ultraThinMaterial` styling and `AppTheme.Shadow.sm`. It uses `Color.patchBackgroundSecondary` directly.

## Next Steps
- Implement global `.ultraThinMaterial` layering across the Wiki Hero and Category cards.
- Refactor `WikiCategoryView` to rely entirely on `AppTheme` rather than raw iOS modifiers.
- Upgrade the complex data-densified `WikiEntryDetailView` components with glossy material sheets to create a highly readable, premium reference experience.
