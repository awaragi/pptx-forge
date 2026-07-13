## Context

`src/tools/browser/` is a plain-JS (no framework) single-page app bundled by `scripts/build-browser.js` (esbuild, `format: iife`) into one self-contained `pptx-forge.html` — no server, no network access, works over `file://`. The editor pane (`index.html`'s `.editor-pane`) is currently a single `<textarea id="editor">`; `compile.js`'s `compileDeck({ theme, masters, slides, outputName })` already builds a real `.pptx` in memory (`pptx.write({ outputType: 'arraybuffer' })`) and is the one code path both the "⚡ Forge" button (`slides.js:forge()`) and workspace export use today.

Two renderer candidates were spiked against real output from this pipeline (rounded rects/shadows, a `dataTable`, and a custom `masterName` slide master — the specific fidelity risks called out during exploration):

| | `pptx-vanilla-viewer` (`pptx-viewer-core`, ChristopherVR/pptx-viewer) | `pptxviewjs` (gptsci) |
|---|---|---|
| Rendering | Real DOM/CSS | HTML5 Canvas |
| Fidelity in spike | Correct: cards, shadows, scheme colors, table, custom-master inheritance all rendered right | Same — correct on an identical fixture |
| Forced transitive import | `three` (for optional 3D-model support, imported unconditionally at the top of the ESM entry) | `chart.js/auto` (same shape of problem, smaller) |
| Bundle impact | 502KB → 6.2MB baseline test bundle | 502KB → 1.49MB |
| Source | Full public monorepo, 1,419 commits | Compiled-only distribution; publisher states the source is proprietary |

`pptxviewjs` was chosen for the ~4x smaller footprint. Its compiled bundle (`dist/PptxViewJS.es.js`) was manually audited for this change: no `eval`/`new Function`/obfuscation; `atob(` usage is SVG data-URI decoding; the only externally-reaching code is a fallback that injects a `<script src="https://cdnjs.cloudflare.com/.../jszip.min.js">` tag if `require('jszip')` fails to resolve. A real build + a Playwright network-request-monitoring check confirmed this fallback never fires here, because `jszip` is already a pptx-forge dependency and resolves statically at esbuild's bundle time.

## Goals / Non-Goals

**Goals:**
- Live-updating preview of the slide currently being edited, recompiled through the existing `compileDeck` call — no parallel rendering logic, no `pptxgenjs` shim.
- While `theme.js`/`masters.js` is active (no single "current slide"), keep showing the last-viewed slide, re-rendered with the in-progress theme/master edits.
- A resizable (drag handle) and collapsible (toolbar button) pane, with both states persisted globally across reloads.
- Copy-to-clipboard and download-as-PNG actions on the rendered preview.
- Zero behavior change to `bin/forge.js`, `src/lib/*`, or the Node CLI.

**Non-Goals:**
- A multi-slide thumbnail strip or whole-deck preview — one slide at a time only.
- Eliminating the `chart.js` bundle-size cost (e.g. forking/patching `pptxviewjs`) — accepted as-is for v1.
- Any edit-in-preview interactivity — `pptxviewjs` is used purely as a read-only renderer.
- Replacing or changing the "⚡ Forge" full-deck download flow.
- Automated supply-chain scanning/gating for `pptxviewjs` beyond the manual audit already performed for this change.

## Decisions

### 1. `pptxviewjs`, pinned to an exact version, not a range
Chosen over `pptx-vanilla-viewer` purely on bundle-size grounds (1.49MB vs 6.2MB+ for a feature both render correctly). Because it ships compiled-only, with no upstream source to diff against, `package.json` pins the exact version (no `^`/`~`) so an upgrade is a deliberate, re-auditable action rather than a silent `npm install` change.

### 2. Reuse `compileDeck` with `slides: [entry]` for single-slide preview compiles
No new compile path. The preview passes the **live `<textarea>` value**, not the last-persisted `state.slides` entry, so it reflects in-progress unsaved edits exactly like `forge()` already does by syncing `entry.content = el.editor.value` first.

### 3. Debounce + generation counter
Typing triggers a ~450ms debounced recompile; an incrementing `generation` token (set at the start of each `updatePreviewNow()`, checked before each subsequent await resolves) discards results from a compile that a newer edit has already superseded — same pattern validated in the spike.

### 4. Track "last-viewed slide" separately from `state.active`
A module-level (or `state.js`-held) `lastViewedSlideName` updates whenever `state.active` names a slide file, and is left untouched when `state.active` names `theme.js`/`masters.js`. The preview always compiles `{ theme: state.theme, masters: state.masters, slides: [<entry for lastViewedSlideName>] }`, so editing theme/masters re-renders that slide live.

### 5. Persistence: two new global `localStorage` keys, not per-workspace state
`pptx-forge.preview.visible` (boolean) and `pptx-forge.preview.height` (percentage, 0–100, of `.editor-pane`'s content-box height) follow the existing `pptx-forge.helpSeen` precedent in `storage.js` — a UI preference independent of any workspace's content, not folded into `state.js`'s per-workspace autosave. Height is stored as a percentage (not raw pixels) specifically so the divider position scales correctly across different window sizes instead of pinning to a stale pixel value.

### 6. Collapsing pauses compiling; expanding recomputes immediately
When the pane is collapsed, no debounce timer is armed and no compile runs on further edits — avoids burning CPU on a preview nobody can see. Expanding calls `updatePreviewNow()` immediately.

### 7. Clipboard copy constructs `ClipboardItem` from the `toBlob` promise directly
`new ClipboardItem({ 'image/png': new Promise(resolve => canvas.toBlob(resolve, 'image/png')) })`, not an already-awaited blob — required for Safari's stricter user-gesture call-stack rule; harmless on Chrome/Firefox. Empirically confirmed working under `file://` (`window.isSecureContext === true`, write succeeds) via a Playwright spike against the real built `pptx-forge.html`.
Feature-detected at render time (`navigator.clipboard?.write` and `typeof ClipboardItem`); the copy button is hidden/disabled where unsupported rather than throwing.

### 8. Download-as-PNG reuses the existing download pattern
Same blob + temporary `<a download>` + click approach already used by `slides.js`'s `triggerDownload()`, applied to a `canvas.toBlob()` PNG instead of a text blob.

### 9. New dependencies are real `dependencies`, not `devDependencies`
`pptxviewjs` and `chart.js` are bundled into the shipped `pptx-forge.html` by `scripts/build-browser.js`, the same tier `pptxgenjs`/`jszip` already occupy.

## Risks / Trade-offs

- **Bundle size grows ~3x (502KB → ~1.49MB)**, almost entirely from `chart.js`, which no pptx-forge slide ever uses. → Mitigation: accepted trade-off for v1; revisit if a lighter renderer appears.
- **`pptxviewjs` is compiled-only** — no way to review source beyond the shipped bundle. → Mitigation: manual bundle audit performed (documented above); version pinned exactly, not ranged.
- **The CDN-fallback for `jszip` inside `pptxviewjs` could reactivate** if a future build-tooling change stops `jszip` resolving statically at bundle time, silently reintroducing a network dependency in a tool whose whole premise is offline `file://` use. → Mitigation: the e2e test for this capability asserts zero non-`file:`/`blob:`/`data:` network requests during a preview render, so this regression fails CI instead of degrading silently.
- **Recompiling on every keystroke could be janky** for large/complex slide files. → Mitigation: debounce + generation-counter guard; compiling stops entirely while collapsed.
- **Clipboard-write support varies by browser** (older browsers may lack `ClipboardItem` entirely). → Mitigation: feature-detected; copy action degrades gracefully to download-only where unsupported.
- **Percentage-based height could compute a degenerate pixel size** on extreme window dimensions. → Mitigation: clamp the applied percentage to a sane min/max pixel range at apply-time.

## Migration Plan

Purely additive — no existing workspace/slide/theme file format changes, no data migration. Implementation order:
1. `package.json` — add `pptxviewjs` and `chart.js` as exact-pinned dependencies.
2. `index.html` / `app.css` — split `.editor-pane` into editor-top + preview-pane, add the drag handle and the preview toolbar (status text, copy, download, collapse/expand controls).
3. `elements.js` — new DOM refs for the added elements.
4. `preview.js` (new) — compile/render orchestration, debounce + generation guard, last-viewed-slide tracking, drag-resize + collapse logic, `localStorage` persistence, clipboard/download actions.
5. `app.js` / `view.js` — wire the editor `input` listener and `selectFile()` to trigger preview updates.
6. Tests — unit coverage for the new compile-single-slide/last-viewed-slide logic, Playwright e2e coverage for the live-update loop, collapse/expand + persisted height, copy, and download actions, and the zero-external-requests assertion.
7. `README.md` — resolve the "Image export" backlog line to describe what shipped.

Rollback is reverting the above files/dependency additions; nothing downstream depends on the new `localStorage` keys, so old code ignores them harmlessly if this were ever reverted after being deployed.

## Open Questions

None blocking. The debounce interval (450ms) and the min/max clamp values for the percentage-based height are tunable during implementation without further design review.
