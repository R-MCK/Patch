# Patch Design — Pencil CLI

Batch design runs for Patch using [Pencil CLI](https://docs.pencil.dev/for-developers/pencil-cli).

## Requirements

1. Install the [Pencil desktop app](https://pencil.dev)
2. Open Pencil → File menu → "Install `pencil` command into PATH"
3. Reset your terminal

## Running a design batch

```bash
cd docs/design/pencil/runs/milestone-a
pencil --agent-config config.json
```

Opens one Pencil window and generates all 6 Milestone A screens in a single session using `claude-4.6-opus`.

## Runs

### milestone-a

Single session, 6 screens, one `.pen` file (`milestone-a.pen`):

- Today View
- Navigation Shell (3 tab states)
- Capture Flow (3 frames)
- UserProfile Onboarding (4 screens)
- Ask View (2 frames)
- Plant List

The product architecture brief is attached as context.

## Prompt approach

Each prompt specifies:
- iOS 17, SwiftUI-native patterns
- Earth-tone palette (deep green primary, warm cream backgrounds)
- Outdoor use: 44pt minimum touch targets, high contrast
- Full iPhone 15 Pro frame
- Realistic gardening content in mockups

## Adding a new run

1. Create a new directory under `runs/`
2. Create empty `.pen` files: `echo '{"version":"1.0","children":[]}' > screen.pen`
3. Write a `config.json` following the milestone-a pattern
4. Run `pencil --agent-config config.json` from that directory
