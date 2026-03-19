# Tranche 1 Before Audit (Core Tabs)

## Scope
- Tracker (`PlantListView`)
- Wiki (`WikiHomeView`)
- Gardens (`GardenListView`)
- Design (`MainTabView` -> `DesignTab`)
- Visual references: `ui-review/before/*.png`, `ui-review/before-detail/*.png`

## Page-Level Findings

### Tracker
- Hierarchy is functional but diluted: search, summary, chips, and list feel like stacked modules rather than one intentional top section.
- Toolbar-only sort/filter actions reduce discoverability and create low information scent for active state.
- CTA pattern is split between empty-state primary action and floating add button; this is acceptable behaviorally but feels visually disconnected.
- List section label and summary card do not align to a unified density rhythm.

### Wiki
- Hero card reads clearly but does not provide a strong directional cue into “what to do next.”
- Category and featured cards are close, but card internals vary in icon sizing, typography emphasis, and spacing cadence.
- Search results are readable but a little flat; metadata hierarchy and row affordance can be clearer.

### Gardens
- Overall structure is simpler than Tracker; consistency gap across tabs in top-level scaffolding and action framing.
- Summary card and list transition is abrupt; no connective heading/description layer.
- Floating add CTA works but visual weight is slightly isolated from the content system.

### Design
- Existing content is informative but still feels “coming soon”/placeholder-like for a production destination.
- Primary action lacks supporting secondary pathways and outcome framing.
- The feature list has solid content but limited visual hierarchy depth.

## Cross-Screen System Gaps
- Shared spacing system exists, but top-of-screen information architecture differs notably per tab.
- Card surfaces are consistent but some pages underuse leading context text to orient users quickly.
- Action patterns are not fully harmonized across list-heavy flows.
- Empty/loading states are decent and functional; premium polish can improve through stronger framing copy and surrounding context.

## Accessibility Risks (Observed)
- Small icon-only toolbar controls reduce discoverability and can weaken VoiceOver clarity without explicit labels.
- Secondary metadata in cards/rows may run low contrast in dense sections.
- Dense stacked content near top of screens can increase scan cost for dynamic type users.
