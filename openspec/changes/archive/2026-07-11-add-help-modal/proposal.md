## Why

The browser tool (`pptx-forge.html`) has no in-app guidance. New users land on a blank editor with a busy topbar (workspace switcher, AI button, Forge button) and no explanation of what a workspace is, how import/export works, or — most importantly — how the "✨ AI" button's copy/paste bridge to an external chatbot actually works. A self-contained help modal fixes this without adding a build dependency or external docs site.

## What Changes

- Add a `?` icon button next to the brand/version tag in the topbar that opens a paginated help modal.
- The modal has 6 screens (Welcome, Workspaces, Slides & Editor, Import/Export, AI Tooling, Forge & Download), each with a heading, short explanatory text, and bullet points referencing the real icon glyphs via the existing `.icon-btn`/`.icon-*` CSS classes.
- Navigation: Prev/Next buttons, clickable bottom dot indicators (jump directly to any screen), Escape key closes the modal, Left/Right arrow keys page between screens.
- The modal auto-opens once on true first-ever visit (detected before the existing default-workspace auto-create logic runs, so it isn't masked by that auto-create), and never auto-opens again afterward. It remains reachable any time via the `?` button.
- **Modified**: the existing AI-reference overlay and the Move/Copy transfer-picker overlay both gain Escape-to-close, matching the new help modal's behavior, for consistency across all three overlays.

## Capabilities

### New Capabilities
- `browser-help-modal`: the `?` button, the paginated modal (screens, dot navigation, Prev/Next, Escape/arrow-key handling, click-outside-to-close), its content per screen, and the first-visit auto-open behavior with its own persisted "seen" flag.

### Modified Capabilities
- `browser-ai-reference`: the AI-reference overlay gains Escape-to-close.
- `browser-slide-transfer`: the Move/Copy transfer-picker overlay gains Escape-to-close.

## Impact

- `src/tools/browser/index.html`: new `?` button markup next to the brand, new help-modal overlay markup (screens, dots, Prev/Next/Close controls).
- `src/tools/browser/app.css`: new styles for the help modal (extending the existing `.ai-overlay`/`.ai-panel` pattern), dot indicators, paging controls.
- `src/tools/browser/app.js`: help-modal state/navigation logic, first-visit detection (checked prior to the default-workspace auto-create), Escape/arrow-key handling added to all three overlays (help, AI reference, transfer picker).
- `src/tools/browser/storage.js`: a new localStorage key for "has the user seen the help modal."
- No changes to `bin/`, `scripts/build-browser.js`, or the CLI — this is browser-tool-only.
