## 1. Dependencies

- [x] 1.1 Add `playwright-core` to `dependencies` in `package.json` (not `playwright`, not `@playwright/test`)
- [x] 1.2 Confirm `@playwright/test` remains in `devDependencies`, unchanged

## 2. Slide image renderer module

- [x] 2.1 Create a rendering module (e.g. `src/lib/render-images.js`) that launches `chromium-headless-shell` via `playwright-core`, detects a missing-browser launch failure, and throws a typed/identifiable error for that case
- [x] 2.2 Build a minimal local HTML page (mirroring the setup in `src/tools/browser/preview.js`) that mounts `pptxviewjs`'s `PPTXViewer` against a canvas, loadable in the headless page
- [x] 2.3 Implement loading the compiled `.pptx` buffer into the headless page's `PPTXViewer` and reading `getSlideCount()`
- [x] 2.4 Implement iterating `goToSlide(i)` for each slide index and capturing the canvas as PNG bytes (e.g. via `canvas.toDataURL()` through `page.evaluate`, or a locator screenshot), reusing a single browser/page instance for all slides in one run
- [x] 2.5 Implement the filename convention: `<workspaceSlug>[_<timestamp>]-NN.png`, zero-padded `NN`, matching the `--snapshot` timestamp string when present
- [x] 2.6 Write each PNG to the workspace's `out/` directory, overwriting existing files

## 3. `bin/forge.js` integration

- [x] 3.1 Add `--images`/`-i` flag parsing alongside the existing `--open`/`--preview`/`--snapshot`/`--help` flags
- [x] 3.2 Update the `HELP` usage text to document `-i, --images` and add/update a usage example
- [x] 3.3 After the `.pptx` is written and theme-patched, invoke the image renderer module when `--images` is set, passing the workspace slug, `outDir`, and the same timestamp used for `--snapshot` (or none)
- [x] 3.4 On a missing-browser error from the renderer module, print an error naming `chromium-headless-shell` and the exact command `npx playwright install chromium-headless-shell`, then exit non-zero — after the `.pptx` has already been written successfully
- [x] 3.5 Print per-image progress lines (e.g. `  + my-deck-01.png`) consistent with the existing per-slide compile log output

## 4. Documentation

- [x] 4.1 Add `--images`/`-i` to the CLI usage/options section of `README.md`, including the filename convention and its interaction with `--snapshot`
- [x] 4.2 Add a dev-setup note in `README.md` distinguishing the two Playwright usages: `@playwright/test` for `npm run test:e2e` (devDependency) vs. `playwright-core` + `chromium-headless-shell` for `forge --images` (runtime dependency), and document `npx playwright install chromium-headless-shell` as the install step (noting that running plain `npx playwright install` for e2e testing already covers it)

## 5. Tests

- [x] 5.1 Add unit tests for the filename-convention logic (base/timestamp/index formatting, zero-padding) as pure functions, independent of browser launch
- [x] 5.2 Add a unit test asserting the missing-browser error path produces the correct message and does not attempt an auto-install
- [x] 5.3 Add a Playwright e2e (or Node integration) test that runs `forge --images` against a sample workspace and asserts the expected PNG files are created in `out/`, including the `--images --snapshot` combined case
- [x] 5.4 Add a test covering re-running `--images` overwrites prior output files without error
- [x] 5.5 Add a test verifying a slide file with multiple `pptx.addSlide()` calls exports one image per resulting slide, numbered consistently with overall deck order

## 6. Verification

- [x] 6.1 Manually run `forge <sample-workspace> --images` against the repo's sample/showcase workspace (including a chart-bearing slide) and visually confirm output PNGs match the browser preview pane's rendering
- [x] 6.2 Confirm the missing-browser error path by testing in an environment/user-data-dir where `chromium-headless-shell` is not installed
