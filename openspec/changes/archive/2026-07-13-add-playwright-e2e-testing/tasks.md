## 1. Harness setup

- [x] 1.1 Add `@playwright/test` as a devDependency; install the Chromium browser (`npx playwright install chromium`).
- [x] 1.2 Add `playwright.config.js` at the repo root: `testDir: 'test/e2e'`, Chromium project only, no `webServer`/`baseURL` (tests navigate directly to `file://` paths).
- [x] 1.3 Add `pretest:e2e` (`npm run build:browser`) and `test:e2e` (`playwright test`) scripts to `package.json`.
- [x] 1.4 Add `test/e2e/fixtures.js` with a shared helper to open `pptx-forge.html`: resolves the built file's absolute path, exposes a `gotoApp(page, { seed } = {})` helper that optionally calls `context.addInitScript` with a serialized workspace (matching `storage.js`'s `localStorage` format) before navigating.
- [x] 1.5 Add a `test/e2e/helpers/drag-drop.js` helper that builds a `DataTransfer` in-page (via `page.evaluateHandle`) from a list of `{ name, content }` files and dispatches `dragenter`/`drop` on `window`.
- [x] 1.6 Add a `test/e2e/helpers/download.js` helper that wraps `page.waitForEvent('download')`, saves the download to a temp path, and returns it loaded as a `jszip` instance.
- [x] 1.7 Add a `test:e2e:demo` script (`--headed --workers=1`, `SLOWMO_MS` env var read by `playwright.config.js` into `launchOptions.slowMo`) for watchable manual demos.

## 2. Forge roundtrip

- [x] 2.1 Test: seeded workspace (theme + masters + one slide with known text) → click Forge → downloaded `.pptx` unzips and contains that text in a slide XML part.
- [x] 2.2 Test: workspace with theme/masters but no slides → click Forge → no download occurs and an error notification is shown.

## 3. Workspace persistence

- [x] 3.1 Test: edit the active slide's content in the editor, reload the page, assert the edited content (not the original) is shown and the same workspace is active.
- [x] 3.2 Test: create a second workspace and switch to it, reload the page, assert the second workspace is still the active one.

## 4. File-picker import

- [x] 4.1 Test: `setInputFiles` with a `.js` file whose name doesn't match any existing entry → appears as a new slide.
- [x] 4.2 Test: `setInputFiles` with a `.js` file sharing a name with an existing slide → existing entry's content is replaced, sidebar position unchanged.
- [x] 4.3 Test: `setInputFiles` with a non-`.js` file → not added, error notification shown.

## 5. Drag-and-drop import

- [x] 5.1 Test: dropping a `.js` file behaves like the file-picker path (new entry / in-place replace).
- [x] 5.2 Test: dropping a `.zip` named after a workspace that doesn't exist → new workspace created, populated, made active.
- [x] 5.3 Test: dropping a `.zip` named after an existing workspace, accepting the merge confirm dialog (`page.on('dialog')`) → files merged, workspace stays active.
- [x] 5.4 Test: dropping a `.zip` named after an existing workspace, dismissing the confirm dialog → existing workspace active with original, unmerged content.

## 6. Wrap-up

- [x] 6.1 Run `npm run test:e2e` locally end-to-end and confirm all specs pass against a fresh build.
- [x] 6.2 Confirm `npm test` (existing unit suite) is unaffected and still passes.
