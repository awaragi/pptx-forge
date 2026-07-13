## Context

`src/tools/browser/` is a set of real ES modules (`state.js`, `view.js`, `workspace.js`, `slides.js`, `compile.js`, `dragdrop.js`, `storage.js`, ...) bundled by `scripts/build-browser.js` (esbuild, `format: iife`, minified) into a single self-contained `pptx-forge.html`. That file is gitignored and only produced on demand (`npm run build:browser`) or on tag push for release/pages.

The tool has no server dependency and no File System Access API: persistence is `localStorage`, file import is `<input type=file>` / drag-drop `DataTransfer`, and output is `Blob` + `<a download>`. `forge()` (`src/tools/browser/compile.js`) dynamically `import()`s Blob URLs to run workspace `theme.js`/`masters.js`/slide files as real ES modules, then produces a `.pptx` via `pptxgenjs` + `jszip` — this only works inside a real browser, which is exactly the gap unit tests (`test/*.test.js`, `src/lib` only) can't cover.

Only `test/*.test.js` (Node's built-in `node --test`) exists today; no CI workflow runs any test suite (both GitHub Actions workflows are tag-triggered builds).

## Goals / Non-Goals

**Goals:**
- Stand up a Playwright suite that drives the built `pptx-forge.html` and gives real regression coverage of the forge pipeline, workspace persistence, and file import — the flows most likely to break silently and hardest to verify by hand every time.
- Keep the suite fast and dependency-free to run locally: no dev server, no mocked filesystem, always tests a fresh build.
- Keep assertions behavioral (DOM/state/localStorage/downloaded-file-content) so the suite reads as deliberate regression coverage, not the ad hoc visual-check pattern already rejected once.

**Non-Goals:**
- No screenshot / pixel-diff visual regression testing.
- No CI wiring in this change (no workflow currently runs any test suite; that's a separate decision).
- No coverage in this change for: export/import zip roundtrip, compile-error toast attribution, or overlay chrome (help modal, AI reference, transfer picker) — flagged in the proposal as later-pass scope.
- Does not touch `src/tools/browser/` or `src/lib/` application code.

## Decisions

**Target the built bundle over `file://`, not the unbundled source over a dev server.**
`pptx-forge.html` is a plain IIFE with no runtime `import` statements, so Chromium loads it fine directly off disk (`page.goto('file://' + path)`). The unbundled `src/tools/browser/index.html` uses real `<script type=module>` imports, which Chromium refuses under `file://` — testing it would require standing up a static server for every run. Testing the actual shipped artifact also means the suite exercises the real esbuild/minify step, not just the pre-bundle source.

**`pretest:e2e` rebuilds the bundle; `test:e2e` runs Playwright.**
```json
"pretest:e2e": "npm run build:browser",
"test:e2e": "playwright test"
```
npm's automatic pre-hook guarantees `playwright test` never runs against a bundle older than the current source, without needing `&&` chaining or a globalSetup step that shells out.

**Seed state via a direct `localStorage` write + one reload, not UI clicks — and not `addInitScript`.**
Each spec that needs a non-empty workspace (slides/theme/masters already present) seeds `localStorage` directly, mirroring how `storage.js` serializes workspaces, then reloads once so the app's bootstrap re-reads it. This keeps tests focused on the flow under test (e.g. "does Forge produce the right pptx") rather than re-driving unrelated setup UI in every spec.
Originally planned as `context.addInitScript`, but that re-fires on *every* navigation in the context/page — including a spec's own `page.reload()` later on — which would silently reset `localStorage` back to the seed and defeat the persistence specs (§3) that reload deliberately to check an in-test edit survived. `fixtures.js`'s `gotoApp()` instead does `page.goto()` (letting the app's normal first-boot run), then `page.evaluate()` to overwrite `localStorage`, then a single `page.reload()` — no init script left registered, so later reloads in the test body reflect real app state, not the fixture's.

**Drive file import via `setInputFiles` and an in-page `DataTransfer` dispatch.**
`<input type=file>` (`el.fileInput`) is covered by Playwright's built-in `locator.setInputFiles()`. Drag-drop (`dragdrop.js`, whole-window `dragenter`/`drop` listeners reading `e.dataTransfer.files`) has no Playwright-native helper, so tests construct a `DataTransfer` with `page.evaluate`/`evaluateHandle` inside the page and dispatch synthetic `dragenter`/`drop` events carrying it — the same mechanism real Chromium drag-drop delivers to the listeners, without needing OS-level drag simulation.

**Capture downloads via `page.waitForEvent('download')`; verify content with `jszip` (already a project dependency).**
`triggerDownload()` (`slides.js`) does a same-page Blob-URL anchor click, which Playwright's download event captures regardless of page origin scheme. Forge output is unzipped with `jszip` in the test itself and asserted against expected slide XML/text — real content verification, not just "a file appeared."

**Handle `window.confirm()` via `page.on('dialog')`.**
Import merge/replace and workspace delete/reset flows gate on `window.confirm()`. Tests register a `dialog` handler (accept/dismiss as the scenario needs) before triggering the action, matching how a user would answer the native prompt.

## Risks / Trade-offs

- **[Risk]** Testing only the bundled artifact means a bug introduced in one source module but masked by esbuild's bundling/minification (unlikely but possible) wouldn't be caught by anything closer to the source. → **Mitigation**: existing `test/*.test.js` already covers `src/lib` in isolation; this suite is deliberately about the shipped integration, not a substitute for unit coverage.
- **[Risk]** `pretest:e2e` rebuilding on every run adds a few seconds to local iteration. → **Mitigation**: esbuild is fast (sub-second for this bundle size); acceptable given it guarantees correctness over speed.
- **[Risk]** No CI enforcement means the suite can silently rot (pass locally, never run on PRs). → **Mitigation**: explicitly deferred, not forgotten — called out in the proposal's Impact section as follow-up scope.

## Open Questions

- Should CI wiring (a PR-triggered workflow running `npm test` + `npm run test:e2e`) be its own follow-up change once this lands, or folded in later as an amendment? (Proposal currently defers it.)
