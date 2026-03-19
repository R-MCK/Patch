# Tranche 2 After Audit (Detail + Form Flows)

## Scope Completed
- Add Plant (`AddPlantView`)
- Add Garden (`AddGardenView`)
- Plant Detail (`PlantDetailView`)
- Wiki Entry Detail (`WikiEntryDetailView`)
- Visual references: `ui-review/after-detail/*-t2.png`

## What Changed

### Add Plant
- Added `AddPlantProgressCard` to expose save readiness and current garden linkage at a glance.
- Upgraded section hierarchy with title+subtitle framing for Basic Info, Location, Status, Details, and Wiki context.

### Add Garden
- Added `AddGardenProgressCard` to signal completion state and visible size context.
- Applied consistent section heading/subheading rhythm across all form blocks.

### Plant Detail
- Removed duplicate toolbar action menu to eliminate competing CTAs.
- Kept action behaviors intact via the in-page `PlantActionsSection`.
- Improved header context by showing garden name under species when available.

### Wiki Detail
- Added section subtitles for About, Care Guide, Planting Guide, Companion Planting, and Actions.
- Normalized share CTA to shared `SecondaryButton` pattern for stronger system consistency.
- Preserved existing share metrics and tracking behavior.

## Before vs After Findings
- **CTA clarity:** no longer split between competing action surfaces on Plant Detail.
- **Form confidence:** readiness state is visible before save attempts on add forms.
- **Hierarchy:** long-scroll detail pages have clearer chapter-like structure and scanning rhythm.
- **Consistency:** button language and section framing now align better with tranche 1 design system.

## Remaining Polish
- Care Tasks and Photos flows still need the same full visual refactor pass.
- Some typography density could be further tuned for very large Dynamic Type settings.
- If desired, next tranche can unify microcopy tone across every empty state and alert.
