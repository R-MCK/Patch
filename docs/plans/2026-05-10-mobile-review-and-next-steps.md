# Mobile Review and Next Steps (iOS/Android)

Date: 2026-05-10
Scope: `apps/mobile` audit for reliability, UX quality, and launch-readiness.

## What Was Fixed In This Pass

1. Fixed local ID generation in React Native data mutations:
- Replaced `crypto.randomUUID()` usage with a runtime-safe helper using `globalThis.crypto?.randomUUID` and a fallback ID generator.
- File: `apps/mobile/src/data/usePatchData.ts`

2. Fixed offline sync entity-ID reconciliation (critical data integrity issue):
- When pending local gardens/plants/tasks are pushed and backend returns new IDs, local rows are now remapped to backend IDs.
- Child references are updated (`plants.garden_id`, `care_tasks.plant_id`) before local placeholder rows are removed.
- Completed local tasks now also call `completeTask` after creation during sync push.
- File: `apps/mobile/src/data/sync.ts`

3. Fixed nullish-number handling in sync payloads and local inserts:
- Replaced `||` with `??` for numeric width/length fields to avoid accidentally dropping valid `0` values.
- Files: `apps/mobile/src/data/sync.ts`, `apps/mobile/src/data/usePatchData.ts`

4. Fixed wiki local persistence fallback:
- Ensures `common_name` gets a non-null fallback (`title`) during pull sync writes.
- File: `apps/mobile/src/data/sync.ts`

5. UX improvements for core creation flow:
- Added Today screen quick action to create a task.
- Added Add Task empty-state CTA to create a first plant.
- Files: `apps/mobile/app/(tabs)/index.tsx`, `apps/mobile/app/add-task.tsx`

6. Added mobile auth/session bootstrap for iOS/Android:
- Introduced secure token persistence via Expo SecureStore.
- Added auth provider with session restore, sign in, register, and sign out flows.
- Protected tab routes with redirect to login when unauthenticated.
- Added `login` and `register` screens, plus sign-out action in Wiki tab.
- Files: `apps/mobile/src/api/authTokens.ts`, `apps/mobile/src/auth/AuthProvider.tsx`, `apps/mobile/app/login.tsx`, `apps/mobile/app/register.tsx`, `apps/mobile/app/(tabs)/_layout.tsx`, `apps/mobile/app/(tabs)/wiki.tsx`

7. Added task completion actions to daily flows:
- Added Complete actions in Today and Tasks lists.
- Added local offline-first completion writes (`pending_update`) and push handling.
- Files: `apps/mobile/src/components/TaskRow.tsx`, `apps/mobile/app/(tabs)/index.tsx`, `apps/mobile/app/(tabs)/tasks.tsx`, `apps/mobile/src/data/usePatchData.ts`, `apps/mobile/src/data/sync.ts`

8. Fixed local DB init retry reliability:
- Moved DB initialization flag set to occur only inside successful load path, so a failed init can be retried on next refresh.
- File: `apps/mobile/src/data/usePatchData.ts`

## Remaining High-Value Improvements

1. Shared data store instead of per-screen `usePatchData` instances:
- Current screens each run hook-local load/sync logic.
- Move to a shared store (e.g., Zustand) for single source of truth, reduced duplicate syncs, and predictable refresh.

2. Explicit sync status and conflict feedback:
- Show last sync timestamp, sync in progress indicator, and actionable error banners.
- Surface pending local changes count.

3. Mobile auth UX:
- Add login/register/profile flow in mobile to avoid reliance on env token.
- Persist secure access token (SecureStore) and restore session at boot.

4. Task completion UX depth:
- Add swipe actions and undo for task completion to reduce accidental taps.

5. Better form ergonomics:
- KeyboardAvoidingView, submit labels (`next`/`done`), and field validation hints.

6. Accessibility pass:
- Audit touch targets, semantic labels, dynamic text scaling, and contrast consistency.

## UI/UX Research Notes (iOS + Android)

1. Keep bottom navigation focused to top-level sections:
- Apple HIG tab bars: use tab bars for navigation (not actions), avoid overflow, keep labels visible.
- Android bottom navigation: best for 3-5 top-level destinations.
- Implication for Patch mobile: keep tabs for Today/Plants/Gardens/Tasks/Wiki, and keep create actions as explicit buttons/FAB/modal actions rather than extra tabs.

2. Improve form usability and validation:
- Apple text fields guidance emphasizes explicit labels + placeholders and context-appropriate keyboard/input behavior.
- Android guidance recommends input-type-specific keyboards and real-time validation feedback.
- Implication for Patch mobile: add keyboard type hints (email/numeric where applicable), inline validation for required fields, and clear error timing before submit.

3. Strengthen offline-first semantics:
- Android offline-first architecture guidance recommends local data as source of truth, queued writes, and controlled sync execution.
- Implication for Patch mobile: centralize sync orchestration and expose sync state, while keeping local UI interactive when offline.

Sources:
- Apple HIG Tab Bars: https://developer.apple.com/design/human-interface-guidelines/tab-bars/
- Apple HIG Text Fields: https://developer.apple.com/design/human-interface-guidelines/text-fields
- Android Offline-first architecture: https://developer.android.com/topic/architecture/data-layer/offline-first
- Android input validation guide: https://developer.android.com/develop/ui/compose/quick-guides/content/validate-input
- Android text input types: https://developer.android.com/guide/topics/ui/controls/text

## iPhone/Android Start Plan

1. Foundation:
- Introduce shared mobile store + one sync controller.
- Add app-level auth/session bootstrap.

2. Core Daily Loop:
- Today > complete task > capture note/photo > sync confirmation.

3. Create Flows:
- Plant, Garden, Task forms with stronger validation and optimistic confirmation.

4. Quality Gates:
- Typecheck (`npm --workspace mobile run typecheck`)
- Basic offline/online manual test matrix (airplane mode, reconnect, duplicate prevention).

## Verification Run For This Pass

- `npm --workspace mobile run typecheck`
- `npm run packages:check`
