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

## Additional Follow-Up Fixes Landed

1. Sync pull conflict safety:
- Pull upserts now avoid overwriting locally pending rows (`pending_create` / `pending_update`) for gardens, plants, tasks, and wiki entries.
- This prevents local offline edits from being clobbered by remote pulls.
- File: `apps/mobile/src/data/sync.ts`

2. Auth protection for modal creation routes:
- Added auth guards to `/add-plant`, `/add-garden`, and `/add-task` so deep links cannot bypass auth.
- Files: `apps/mobile/app/add-plant.tsx`, `apps/mobile/app/add-garden.tsx`, `apps/mobile/app/add-task.tsx`

3. Refreshed token persistence:
- API client now persists refreshed access tokens via `setAuthToken`, preventing stale-token retries after refresh.
- File: `apps/mobile/src/api/client.ts`

4. Session privacy hardening:
- Sign-out now clears local user data (`care_tasks`, `plants`, `gardens`) from SQLite.
- File: `apps/mobile/src/data/db.ts`, `apps/mobile/src/auth/AuthProvider.tsx`

5. Offline session bootstrap behavior:
- Boot restore now clears local session only for real auth failures (`401/403`), not generic network failures.
- `isAuthenticated` now respects an available local token during bootstrap fallback so offline users can still access cached data.
- File: `apps/mobile/src/auth/AuthProvider.tsx`

6. Accessibility and touch-target improvements:
- Added missing semantic labels for tab header icon actions (`Add plant`, `Add garden`, `Add task`).
- Added explicit button labels for modal header actions (`Cancel` / `Save`) and set minimum 44pt header button height for add flows.
- Added contextual accessibility labels/hints for in-list action buttons (`Water <plant>`, `Complete <task> for <plant>`).
- Files: `apps/mobile/app/(tabs)/plants.tsx`, `apps/mobile/app/(tabs)/gardens.tsx`, `apps/mobile/app/(tabs)/tasks.tsx`, `apps/mobile/app/add-plant.tsx`, `apps/mobile/app/add-garden.tsx`, `apps/mobile/app/add-task.tsx`, `apps/mobile/src/components/PlantCard.tsx`, `apps/mobile/src/components/TaskRow.tsx`

7. Auth form input ergonomics:
- Added platform autofill hints (`autoComplete`, `textContentType`) and keyboard return flow (`next`/`done`) for login/register fields.
- Added submit-on-keyboard behavior for final password confirmation fields.
- Files: `apps/mobile/app/login.tsx`, `apps/mobile/app/register.tsx`

8. Auth token write de-duplication:
- Removed duplicate SecureStore token writes from `AuthProvider` sign-in/sign-up paths.
- Token persistence now consistently happens through `PatchApiClient` token callback wiring.
- File: `apps/mobile/src/auth/AuthProvider.tsx`

9. Cross-screen local data consistency:
- Added a lightweight in-memory data-change subscription in `usePatchData` so all mounted hook instances reload local SQLite after any mutation and after sync completion.
- Fixes stale lists when creating/updating data from modal flows (e.g., create plant/task) and returning to tab screens.
- File: `apps/mobile/src/data/usePatchData.ts`

10. Keyboard-safe create forms:
- Added `KeyboardAvoidingView` wrappers to add flows so form content and controls are less likely to be obscured while typing on iOS/Android keyboards.
- Files: `apps/mobile/app/add-plant.tsx`, `apps/mobile/app/add-garden.tsx`, `apps/mobile/app/add-task.tsx`

11. Sync-status UX feedback:
- Added shared sync metadata (`isSyncing`, `lastSyncedAt`, `lastSyncError`) in `usePatchData`.
- Today screen now surfaces syncing, offline fallback, and last sync time so users understand data freshness.
- Files: `apps/mobile/src/data/usePatchData.ts`, `apps/mobile/app/(tabs)/index.tsx`

12. Consistent sync feedback across tabs:
- Added reusable `SyncStatusBanner` component and surfaced sync/offline/freshness state in Plants, Gardens, Tasks, and Wiki tabs.
- Files: `apps/mobile/src/components/SyncStatusBanner.tsx`, `apps/mobile/app/(tabs)/plants.tsx`, `apps/mobile/app/(tabs)/gardens.tsx`, `apps/mobile/app/(tabs)/tasks.tsx`, `apps/mobile/app/(tabs)/wiki.tsx`

13. Sync retry affordance:
- Added explicit `Retry now` action in offline sync banner and wired it to each tab’s `refresh` handler.
- Gives users an immediate retry path without requiring pull-to-refresh gestures.
- Files: `apps/mobile/src/components/SyncStatusBanner.tsx`, `apps/mobile/app/(tabs)/index.tsx`, `apps/mobile/app/(tabs)/plants.tsx`, `apps/mobile/app/(tabs)/gardens.tsx`, `apps/mobile/app/(tabs)/tasks.tsx`, `apps/mobile/app/(tabs)/wiki.tsx`

14. Sync error propagation correctness:
- Updated sync engine to rethrow pull and push failures after logging so upstream sync state reflects real failures.
- Push path now aggregates per-row failures and surfaces an error summary when any local pending rows fail to sync.
- File: `apps/mobile/src/data/sync.ts`

15. Pending-changes visibility:
- Added `pendingChangesCount` to mobile data state by counting `pending_%` rows in local plants/gardens/tasks tables.
- Sync banner now displays queued local changes while syncing/offline so users understand what is waiting to upload.
- Files: `apps/mobile/src/data/usePatchData.ts`, `apps/mobile/src/components/SyncStatusBanner.tsx`, `apps/mobile/app/(tabs)/index.tsx`, `apps/mobile/app/(tabs)/plants.tsx`, `apps/mobile/app/(tabs)/gardens.tsx`, `apps/mobile/app/(tabs)/tasks.tsx`, `apps/mobile/app/(tabs)/wiki.tsx`

16. Create-form keyboard flow:
- Added `next`/`done` return-key navigation and submit-on-done behavior for add-plant and add-garden forms.
- Reduced extra taps and improved form completion speed on iOS/Android keyboards.
- Files: `apps/mobile/app/add-plant.tsx`, `apps/mobile/app/add-garden.tsx`

17. Sync-state subscription consistency:
- Updated sync-state subscription to emit the current shared snapshot immediately on subscribe.
- Initialized hook-local sync state from a cloned snapshot to avoid shared-reference drift.
- Prevents mount-timing gaps where a screen could miss current sync metadata.
- File: `apps/mobile/src/data/usePatchData.ts`

18. Task creation flow ergonomics:
- Added keyboard return-key progression from custom task input to notes field.
- Added selected-state accessibility metadata for plant/task choice pills to improve VoiceOver/TalkBack clarity.
- File: `apps/mobile/app/add-task.tsx`

19. Keyboard interaction reliability in create flows:
- Added `keyboardShouldPersistTaps="handled"` and `keyboardDismissMode="on-drag"` to create-form scroll containers.
- Improves tap responsiveness on pills/buttons while keyboard is open and provides smoother dismissal behavior.
- Also set notes field in add-task to submit on `Done` more reliably with `blurOnSubmit`.
- Files: `apps/mobile/app/add-plant.tsx`, `apps/mobile/app/add-garden.tsx`, `apps/mobile/app/add-task.tsx`

## Updated UX/Accessibility References

- Apple HIG, Managing Accounts: https://developer.apple.com/design/human-interface-guidelines/managing-accounts
- Apple HIG, Accessibility: https://developer.apple.com/design/human-interface-guidelines/accessibility/
- W3C WCAG 2.2 updates: https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- W3C Focus Appearance (2.4.13): https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
