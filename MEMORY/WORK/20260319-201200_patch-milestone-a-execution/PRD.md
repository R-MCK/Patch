---
task: Continue Milestone A implementation phases 3-5
slug: 20260319-201200_patch-milestone-a-execution
effort: standard
phase: complete
progress: 17/17
mode: interactive
started: 2026-03-19T20:12:00-07:00
updated: 2026-03-19T20:18:00-07:00
---

## Context

Executing Phases 3-5 of the Milestone A implementation plan. Phase 3 adds semantic color tokens to AppTheme. Phase 4 adds date-windowed fetch methods to NoteRepository and PhotoRepository. Phase 5 builds the TodayView — the centerpiece home screen showing overdue tasks, due-today tasks, recent activity, and a capture FAB.

Phases 1-2 are already complete (MainTabView extraction, new AppTabView navigation shell with Today/Capture/Ask/Plan tabs). Build is green.

### Risks

- CareTaskRepository fetchOverdue/fetchDueToday exist — verified ✓
- Entity properties verified — CareTask.plant, Note.title/content/createdAt, Photo.capturedAt/thumbnailData ✓
- FAB threads via closure from TodayView → TodayTab → AppTabView ✓

## Criteria

### Phase 3 — AppTheme Tokens
- [x] ISC-1: Color.patchOverdue exists as #B8543C
- [x] ISC-2: Color.patchOverdueSoft exists as #F7E5DF
- [x] ISC-3: Color.patchWeatherChip exists as #DCEBF3

### Phase 4 — Repository Additions
- [x] ISC-4: NoteRepository.fetchRecent(days:) returns notes with createdAt >= now - days
- [x] ISC-5: PhotoRepository.fetchRecent(since:) returns photos with capturedAt >= since date

### Phase 5 — TodayViewModel
- [x] ISC-6: TodayViewModel.overdueTasks populated from CareTaskRepository
- [x] ISC-7: TodayViewModel.dueTodayTasks populated from CareTaskRepository
- [x] ISC-8: TodayViewModel.recentNotes populated from NoteRepository.fetchRecent(days:7)
- [x] ISC-9: TodayViewModel.recentPhotos populated from PhotoRepository.fetchRecent(since:)
- [x] ISC-10: TodayViewModel.completeTask marks task done and reloads lists

### Phase 5 — TodayView UI
- [x] ISC-11: TodayTab.swift renders TodayView instead of placeholder stub
- [x] ISC-12: Date header with weather chip placeholder shown at top
- [x] ISC-13: Overdue section renders tasks with red urgency badges grouped by plant
- [x] ISC-14: Due-today section renders tasks with green accent and tap-to-complete
- [x] ISC-15: Recent activity horizontal scroll strip shows photo thumbnails and note snippets
- [x] ISC-16: Empty state with "add first plant" CTA when no tasks or activity exist
- [x] ISC-17: Floating capture button at bottom-right, 56pt diameter, patchGreen fill

## Decisions

- TodayTab is now a thin wrapper (NavigationStack + TodayView), not a standalone view
- Overdue tasks grouped by plant name using Dictionary grouping — nil plant falls under "General"
- Weather chip is a static placeholder ("Add location") until UserProfile lands in Phase 9
- Recent activity strip shows photos first, then notes, in a horizontal ScrollView
- FAB binding uses closure pattern: TodayView receives showCapture closure from TodayTab, which receives it from AppTabView

## Verification

All 17/17 criteria implemented. Build succeeded with zero new errors or warnings. xcodegen regenerated project to include new Today ViewModel directory.
