# React Product Architecture

## Decision

Patch will move toward a React product architecture with a web app and native iOS/Android apps. The mobile app should be an Expo React Native app, not a WebView wrapper. The current SwiftUI app remains available during migration and can be retired once the React Native app reaches parity.

## Shape

The repo now uses npm workspaces:

- `apps/web`: existing React/Vite web app.
- `apps/mobile`: Expo React Native app for iOS and Android.
- `apps/backend`: Node.js Express API and SQLite database.
- `packages/core`: shared product types, validation helpers, scheduling logic, and design tokens.
- `packages/api`: shared backend API client for web and mobile.

## Sharing Rules

Share product logic before UI. Types, API clients, validation, care schedule calculations, date helpers, fixtures, and tokens should live in packages. Web and mobile screens should remain platform-specific unless a component is genuinely universal.

Mobile UI should use React Native primitives and Expo Router. Web UI can keep Vite, React Router, Tailwind, Radix, and browser-specific components.

## Migration Sequence

1. Establish workspace packages and mobile scaffold.
2. Move stable domain types and mapping helpers into `packages/core`.
3. Move backend fetch logic into `packages/api`.
4. Build mobile shell tabs: Today, Plants, Gardens, Wiki, Tasks.
5. Connect mobile read flows to the backend.
6. Add mobile create/update flows.
7. Add offline-first storage and sync.
8. Retire SwiftUI screens after React Native parity.

## Data Direction

The backend should become the shared source of truth for web and mobile. For a serious mobile app, Patch should add offline-first storage after the core React Native flows are working. SQLite via Expo SQLite is the pragmatic first candidate; Realm or WatermelonDB can be evaluated if sync complexity grows.
