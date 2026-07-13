## Why

The browser tool (`pptx-forge.html`) currently has no way to see what a slide looks like without clicking "⚡ Forge", downloading a `.pptx`, and opening it in PowerPoint — a slow loop for iterating on a single slide's layout. The README's backlog already names this gap ("Image export — generate PNG or JPEG instead of PPTX"). A spike confirmed a better fix than a static export: a live in-app preview pane, built on the third-party `pptxviewjs` renderer, that shows the slide currently being edited and re-renders it as you type, using the exact same `compileDeck` pipeline the CLI and "Forge" button already use — no new rendering logic, no shim of `pptxgenjs`.

## What Changes

- Add a preview pane to the bottom half of the editor pane, showing the currently active slide file rendered live (debounced ~450ms after typing stops), by compiling just that one slide through the existing `compileDeck({ theme, masters, slides: [entry] })` call and rendering the resulting `.pptx` bytes with `pptxviewjs` onto a `<canvas>`.
- While `theme.js` or `masters.js` is the active file (no single "current slide"), the pane instead re-renders the last-viewed slide, so theme/master edits are visible immediately.
- The pane is resizable via a draggable divider and collapsible via a toolbar button; both the collapsed/expanded state and the divider position (stored as a percentage of the editor pane's height, so it scales with viewport size) persist across reloads in `localStorage`.
- The preview toolbar gains two more actions: copy the rendered slide to the clipboard as a PNG (`navigator.clipboard.write` with a `ClipboardItem`), and download it as a PNG file — both operating on the same `<canvas>` already used for the live preview.
- Compiling pauses while the pane is collapsed and resumes (with an immediate re-render) when it's expanded again.
- **New dependencies**: `pptxviewjs` (the renderer) and `chart.js` (an unconditional transitive import inside `pptxviewjs`, unused by any pptx-forge slide but required for the module to load at all) are added to `package.json`, growing the bundled `pptx-forge.html` from ~502KB to ~1.49MB.

Nothing about `bin/forge.js`, the Node CLI, or the "⚡ Forge" full-deck export path changes — this is additive, browser-tool-only.

## Capabilities

### New Capabilities
- `browser-slide-preview`: Live-updating in-app preview pane for the slide currently being edited in the browser tool, with a resizable/collapsible layout and copy/download-as-PNG actions.

### Modified Capabilities
(none — this is additive; no existing capability's requirements change)

## Impact

- **New files**: `src/tools/browser/preview.js` (compile-and-render orchestration, debouncing, clipboard/download actions).
- **Modified files**: `src/tools/browser/index.html` (pane markup), `src/tools/browser/app.css` (split-pane + toolbar styling), `src/tools/browser/elements.js` (new DOM refs), `src/tools/browser/app.js` (wiring), `src/tools/browser/view.js` (trigger preview update on slide switch).
- **New dependencies**: `pptxviewjs`, `chart.js` in `package.json`/`package-lock.json`.
- **New `localStorage` keys**: `pptx-forge.preview.visible` (boolean), `pptx-forge.preview.height` (percentage, 0–100).
- **Bundle size**: `pptx-forge.html` grows roughly 3x (~502KB → ~1.49MB), driven almost entirely by `chart.js`, which no pptx-forge slide ever exercises.
- **Supply chain**: `pptxviewjs` ships a compiled-only distribution (no public source beyond the published bundle); its minified code was manually audited for this change (no eval/obfuscation/exfiltration found) but cannot be source-reviewed the way a normal dependency can.
