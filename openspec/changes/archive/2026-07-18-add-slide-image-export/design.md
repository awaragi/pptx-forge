## Context

`bin/forge.js` compiles a workspace's slide files into a `.pptx` via `pptxgenjs`, running entirely in plain Node with no DOM. The only existing slide renderer in the codebase, `pptxviewjs` (used by the browser preview pane at `src/tools/browser/preview.js`), is browser-only: it requires a real `<canvas>` element and calls `document.getElementById`, `document.createElement`, and `window.FileReader`, and drives Chart.js for chart-bearing slides. There is no headless/Node-compatible slide renderer today.

`@playwright/test` is already a devDependency used for the e2e suite (`test/e2e/*.spec.js`), and Chromium binaries are already present in the shared Playwright browser cache on developer/CI machines that have run `npx playwright install` for that suite. Investigation during exploration confirmed:
- `playwright-core` (the engine both `playwright` and `@playwright/test` depend on) ships its own CLI with an `install` command that supports `chromium-headless-shell` as a named, installable target (`--only-shell` convenience flag also available).
- `chromium-headless-shell` produced byte-identical `canvas.toDataURL()` and `page.screenshot()` output to full `chromium` in a spike test — same rendering engine, minus the full-browser UI chrome.
- Neither `playwright` nor `@playwright/test` runs a `postinstall` browser download; `npx playwright install` is always a separate, explicit step.

## Goals / Non-Goals

**Goals:**
- Render every compiled slide to a PNG using the same `pptxviewjs` canvas renderer the browser preview already uses, for visual consistency between `--images` output and the in-app preview.
- Fail fast with a clear, actionable error when the required browser binary isn't installed — no silent auto-download, no silent fallback to a different renderer.
- Keep the runtime dependency footprint minimal: use `playwright-core` directly rather than the full `playwright` package or `@playwright/test`.
- If a developer already installed browsers for e2e testing, `--images` works immediately with no extra step (both `chromium` and `chromium-headless-shell` are installed together by default).

**Non-Goals:**
- Auto-installing the browser on first use (rejected: matches Playwright's own rationale for dropping automatic postinstall downloads — silent, unpredictable network operations during `npm install`/CI/first-run are worse than an explicit, documented step).
- Supporting renderers other than `pptxviewjs` (e.g. LibreOffice headless conversion) — out of scope for this change; `pptxviewjs` was chosen for preview-consistency, not maximum PowerPoint-rendering fidelity.
- Configurable image format/DPI — PNG only, fixed dimensions, for the initial version.

## Decisions

- **Use `playwright-core` (not `playwright`, not `@playwright/test`) as the runtime dependency for `--images`.**
  - Rationale: `playwright-core` is the actual engine (12MB) that both `playwright` (4.8MB wrapper) and `@playwright/test` (test-runner framework) depend on. It includes both the CDP driver needed to control the browser and its own `install` CLI with `chromium-headless-shell` as a named target — everything `--images` needs, nothing extra.
  - Alternative considered: full `playwright` package — rejected, adds a wrapper layer with no functionality `--images` needs beyond what `playwright-core` already provides.
  - Alternative considered: hand-rolled CDP over Node's native `WebSocket`, no Playwright dependency at all — rejected, reimplements target attachment, page lifecycle, and evaluate/screenshot protocol handling that `playwright-core` already solves robustly, for a marginal (~4.8MB) footprint saving.

- **Drive `chromium-headless-shell`, not full `chromium`, for image export.**
  - Rationale: same rendering engine (confirmed via spike: identical output for canvas draw + screenshot), purpose-built for headless automation, and already downloaded by default alongside `chromium` when either `npx playwright install` or `npx playwright install chromium` is run — no additional download burden for anyone already set up for e2e testing.
  - Alternative considered: full `chromium` in headless mode — rejected as unnecessarily heavier with no rendering benefit for this use case (no extensions, no PDF generation, no headed UI needed).

- **Fail fast with an explicit install instruction if the browser binary is missing; no auto-install.**
  - Rationale: matches Playwright's own precedent (removed automatic postinstall download years ago due to CI/proxy/Docker fragility) and keeps `--images` from silently triggering a large network download at an unexpected time.
  - Error message SHALL name `chromium-headless-shell` specifically (`npx playwright install chromium-headless-shell`), not `chromium`, since that's the actual binary `--images` needs — even though installing plain `chromium` would also work (both are installed together by default), naming the shell avoids confusion about which binary is actually required.

- **Reuse `pptxviewjs` via a headless page, not a from-scratch renderer.**
  - Rationale: keeps exported images visually consistent with the browser preview pane, and avoids maintaining two independent slide-rendering implementations.
  - Mechanism: a minimal local HTML page (mirroring what `preview.js` sets up) is loaded in the headless page; the compiled `.pptx` buffer is handed to `pptxviewjs`'s `PPTXViewer`, then for each slide index, `goToSlide(i)` is called and the canvas is read back as PNG (e.g. via `page.evaluate` calling `canvas.toDataURL()`, or `locator.screenshot()` on the canvas element) — reusing one browser/page instance across all slides in a workspace rather than launching a new browser per slide.

- **Filename and output-path conventions mirror the existing `--snapshot` behavior exactly.**
  - Rationale: minimizes new concepts — `--images` combined with `--snapshot` reuses the identical timestamp string already computed for the `.pptx` filename in `bin/forge.js`, and images are written to the workspace's existing `out/` directory, the same folder the `.pptx` lands in.

## Risks / Trade-offs

- [Risk] `pptxviewjs` does more than flat canvas draws for chart-bearing slides (drives Chart.js) — the spike only validated a trivial canvas fill+text case, not chart rendering under `chromium-headless-shell`. -> Mitigation: verify against a real chart-bearing slide during implementation/testing before considering the feature done; since `chromium-headless-shell` is the same rendering engine as full `chromium`, no divergence is expected, but this should be confirmed rather than assumed.
- [Risk] Users who haven't run any Playwright browser install yet hit a hard failure on first `--images` use. -> Mitigation: clear, copy-pasteable error message naming the exact command to run; documented in README under both usage and dev-setup sections.
- [Risk] Headless browser launch adds real latency (browser startup) to any `forge --images` invocation compared to the pure-Node `.pptx`-only path. -> Mitigation: acceptable for an opt-in flag; one browser instance is reused across all slides in a single workspace rather than relaunched per slide.
- [Risk] `playwright-core`'s CDP/browser-version compatibility is tied to the installed `playwright-core` version — if a future dependency bump changes the expected browser revision, an already-installed `chromium-headless-shell` from an older revision could stop matching. -> Mitigation: same risk already exists today for `@playwright/test` and e2e tests; no new mitigation needed beyond normal dependency-bump testing.

## Migration Plan

- Purely additive: new flag, new dependency, no changes to existing `--open`/`--preview`/`--snapshot`/default compile behavior.
- No rollback complexity — `playwright-core` is only invoked when `--images` is passed.
