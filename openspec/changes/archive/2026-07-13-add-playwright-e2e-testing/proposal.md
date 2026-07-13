## Why

The browser tool (`src/tools/browser/`, bundled to `pptx-forge.html`) has no automated coverage — only the `src/lib` compile engine is unit-tested (`test/*.test.js`). Regressions in the forge pipeline, workspace persistence, or file import currently surface only when a human clicks through the tool by hand, and verifying them mid-task by spinning up an ad hoc headless browser has already been explicitly rejected. A deliberate, checked-in Playwright suite gives repeatable coverage of the actual user-facing flows without either gap.

## What Changes

- Add `@playwright/test` as a devDependency and a `test/e2e/` suite that drives the **built** `pptx-forge.html` directly over `file://` (no dev server needed — the bundle is a self-contained IIFE).
- Add `pretest:e2e` (runs `npm run build:browser`) and `test:e2e` (runs `playwright test`) npm scripts, so the suite always exercises a fresh build.
- Cover three flows in this change: forge roundtrip (compile → download → unzip with JSZip → assert slide content), workspace persistence across reload, and file import (`<input type=file>` and drag-drop `DataTransfer`, covering `.js` replace and `.zip` create/merge branches including their `window.confirm()` prompts).
- Assertions are behavior/state-based only (DOM state, `localStorage`, downloaded file contents, notification toasts) — no screenshot/pixel-diff testing.
- Out of scope for this change (left for a later pass): export/import zip roundtrip, compile-error toast attribution, overlay chrome (help modal, AI reference, transfer picker), and CI wiring — no workflow currently runs any test suite on push/PR, and this change doesn't add one.

## Capabilities

### New Capabilities
- `browser-e2e-testing`: Playwright-based end-to-end suite covering the browser tool's forge, persistence, and import flows against the built `pptx-forge.html`.

### Modified Capabilities
(none — this adds test coverage only; no product-facing requirement changes)

## Impact

- **New files**: `test/e2e/*.spec.js` (or similar), `playwright.config.js`.
- **package.json**: new `devDependency` (`@playwright/test`), new scripts (`pretest:e2e`, `test:e2e`).
- **Local dev only** for now: no `.github/workflows` changes in this change.
- No changes to `src/tools/browser/` or `src/lib/` application code.
