## Why

Workspace authors currently have no way to get raster images of their slides without manually opening the generated `.pptx` and exporting each slide by hand (or using the browser preview pane's single-slide PNG download, one slide at a time). A CLI flag that exports every slide as an image in one pass removes that manual step and enables scripting (e.g. attaching slide thumbnails to a review, or diffing visual output across snapshots).

## What Changes

- Add `--images`/`-i` flag to `bin/forge.js` (alongside existing `--open`, `--preview`, `--snapshot`, `--help`) that renders every compiled slide to a PNG file after the `.pptx` is written.
- Image filenames follow `<workspaceSlug>[_<timestamp>]-NN.png`, reusing the exact same timestamp string `--snapshot` already computes when both flags are combined, and omitting it otherwise. `NN` is a zero-padded slide index.
- Images are written to the workspace's existing `out/` directory (same folder as the generated `.pptx`), overwriting any file that already exists at that path.
- Rendering is done via a headless browser (`playwright-core`, driving the `chromium-headless-shell` binary) loading the same `pptxviewjs` canvas renderer already used by the browser preview pane, so exported images are pixel-consistent with what the in-app preview shows.
- If the required browser binary is not installed, `forge --images` fails fast with a clear error instructing the user to run `npx playwright install chromium-headless-shell` — no silent fallback, no auto-download.
- `playwright-core` is added as a production dependency (used at runtime by `--images`); `@playwright/test` remains a dev dependency (used only by the e2e test suite). Both are documented in `README.md`: `@playwright/test` under development setup, `playwright-core`/`chromium-headless-shell` under end-user/CLI usage for `--images`.
- If a user already ran `npx playwright install` for e2e testing (which installs both `chromium` and `chromium-headless-shell` by default), `--images` works immediately with no extra install step.

## Capabilities

### New Capabilities
- `slide-image-export`: Headless-browser-based rendering of compiled slides to PNG files, including filename/output-path conventions and the missing-browser error path.

### Modified Capabilities
- `cli-forge-command`: Add the `--images`/`-i` flag, its interaction with `--snapshot`, and updated `--help` text.

## Impact

- Affected code: `bin/forge.js` (new flag, orchestration), a new rendering module that drives `playwright-core` + `pptxviewjs`, `package.json` (new `playwright-core` dependency).
- Affected docs: `README.md` (usage section for `--images`, dev-setup section noting Playwright browser install).
- Dependencies: `playwright-core` (new production dependency); relies on the same Chromium browser cache already used by `@playwright/test` for e2e tests.
