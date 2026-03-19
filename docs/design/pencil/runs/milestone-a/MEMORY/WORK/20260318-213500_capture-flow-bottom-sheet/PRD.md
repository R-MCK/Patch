---
task: Design capture flow bottom sheet screen
slug: 20260318-213500_capture-flow-bottom-sheet
effort: standard
phase: complete
progress: 17/17
mode: interactive
started: 2026-03-18T21:35:00-07:00
updated: 2026-03-18T21:36:30-07:00
---

## Context

Design the Bottom Sheet frame (node `s607E`) for the Capture Flow screen of Patch. This shows the Today screen dimmed behind a semi-transparent overlay, with a white bottom sheet sliding up containing Quick Capture options (Photo, Note, Voice, Task Done), recent plant chips, and the pill tab bar. Must match existing design system using `--green-primary`, `--cream-bg`, `--white-card`, IBM Plex Sans typography, and established component patterns from the Today View screen.

### Risks
- Layered composition requires `layout: none` for z-ordering — resolved
- Grid tiles need consistent sizing within the 2x2 layout — resolved with fill_container
- Must match existing tab bar pattern exactly — matched 4-tab pill style

## Criteria

- [x] ISC-1: s607E uses layout:none for layered composition
- [x] ISC-2: Background layer shows status bar with time and icons
- [x] ISC-3: Background shows Today title 36px and greeting subtitle
- [x] ISC-4: Background shows representative task cards (dimmed appearance)
- [x] ISC-5: Semi-transparent dark overlay covers full 393x852 area
- [x] ISC-6: White bottom sheet has 16px top-left and top-right corner radius
- [x] ISC-7: Drag handle centered (40px wide, 4px tall, muted gray)
- [x] ISC-8: Quick Capture title 18px IBM Plex Sans semibold with primary text fill
- [x] ISC-9: Photo tile has camera icon on green-primary bg with white icon and Photo label
- [x] ISC-10: Note tile has pencil-line icon on white bg with green border and Note label
- [x] ISC-11: Voice tile has mic icon at 50% opacity with Voice label and Coming soon text
- [x] ISC-12: Task Done tile has check-circle icon on white bg with green border and label
- [x] ISC-13: 2x2 grid layout with 16px gap and tiles minimum 80px height
- [x] ISC-14: Recent plants muted label appears below grid
- [x] ISC-15: Four plant chips with cream bg, border, 20px radius, 14px text
- [x] ISC-16: Tab bar matches existing pill style (36px radius, border, 4 tabs)
- [x] ISC-17: Today tab active with green-primary fill in tab bar

## Decisions

- Used layout:none on s607E for 3-layer z-stacking (background → overlay → sheet)
- Built simplified background rather than copying full Today View to keep node count manageable
- Bottom sheet positioned at y:374, height 478px to fit all content without clipping
- Lavender chip intentionally overflows at right edge to suggest horizontal scrollability
- Voice tile uses 50% opacity on the entire tile frame for consistent disabled appearance

## Verification

All 17/17 criteria verified via screenshot. No layout problems detected (snapshot_layout problemsOnly check passed). Design matches existing design system variables and patterns from Today View (Screen 1).
