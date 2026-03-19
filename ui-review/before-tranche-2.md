# Tranche 2 Before Audit (Detail + Form Flows)

## Scope
- Add Plant (`AddPlantView`)
- Add Garden (`AddGardenView`)
- Plant Detail (`PlantDetailView`)
- Wiki Entry Detail (`WikiEntryDetailView`)
- Visual references: `ui-review/before-detail/*.png`

## Findings
- Form screens are solid but lack persistent completion/context indicators, so save readiness is not obvious until validation blocks submission.
- Section headings are present, but subtitle framing is inconsistent, reducing scan clarity for first-time users.
- `PlantDetailView` presents duplicated primary actions (toolbar menu + in-page actions card), creating competing CTA patterns.
- Wiki detail content is rich but section rhythm is flatter than desired for long-scroll readability; action area can align better with shared button system.
- Detail/form flows are close to production quality but not yet fully cohesive with tranche 1 hierarchy standards.
