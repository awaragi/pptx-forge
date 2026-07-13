## 1. Dependencies

- [x] 1.1 Add `pptxviewjs` and `chart.js` to `package.json` `dependencies`, pinned to exact versions (no `^`/`~`)
- [x] 1.2 Run `npm install` and confirm `package-lock.json` picks up both as real dependencies

## 2. Layout & markup

- [x] 2.1 In `index.html`, split `.editor-pane` into an `editor-top` wrapper (containing the existing `#editor` textarea) and a new `preview-pane` block
- [x] 2.2 Add a drag-handle element between `editor-top` and `preview-pane`
- [x] 2.3 Add the preview toolbar markup: status text, copy-PNG button, download-PNG button, collapse/expand button
- [x] 2.4 Add the `<canvas>` element the preview renders into
- [x] 2.5 In `app.css`, style the split (flex column, drag handle cursor/hit-area, toolbar layout, canvas sizing so it fills its wrapper instead of the default 300x150 intrinsic canvas size)
- [x] 2.6 Style the collapsed state (canvas hidden, pane shrunk to toolbar-only height)

## 3. DOM element refs

- [x] 3.1 Add refs in `elements.js` for: preview pane container, drag handle, canvas, status text, copy button, download button, collapse/expand button

## 4. Preview module (`src/tools/browser/preview.js`)

- [x] 4.1 Instantiate a single reused `PPTXViewer` bound to the preview canvas
- [x] 4.2 Implement `schedulePreviewUpdate()` (450ms debounce) and `updatePreviewNow()`, reusing `compileDeck({ theme: state.theme, masters: state.masters, slides: [entry] })` from `compile.js`
- [x] 4.3 Add a generation counter so a superseded in-flight compile's result is discarded on arrival
- [x] 4.4 Track `lastViewedSlideName`, updated whenever `state.active` names a slide file; preview compiles use this name's entry when `state.active` is `theme.js`/`masters.js`
- [x] 4.5 Handle the no-slide-viewed-yet and no-slides-in-workspace cases with a placeholder status message instead of attempting to compile
- [x] 4.6 On compile failure, show the `CompileError`-formatted message (or generic error) in the status area, in the same style already used by `slides.js`'s `forge()`, and keep the last successful canvas render rather than clearing it
- [x] 4.7 Implement collapse/expand: collapsing clears any pending debounce and stops scheduling further compiles; expanding calls `updatePreviewNow()` immediately
- [x] 4.8 Implement drag-resize: pointer handlers on the drag handle compute and apply a height percentage of `.editor-pane`, clamped to a sane min/max so neither pane becomes unusably small
- [x] 4.9 Persist `pptx-forge.preview.visible` (boolean) and `pptx-forge.preview.height` (percentage) to `localStorage`, following the existing `HELP_SEEN_KEY`-style global-key convention in `storage.js`; read them back on load to set initial pane state
- [x] 4.10 Implement copy-to-clipboard: `new ClipboardItem({ 'image/png': new Promise(resolve => canvas.toBlob(resolve, 'image/png')) })` passed directly to `navigator.clipboard.write` (not pre-awaited), feature-detected (`navigator.clipboard?.write` and `typeof ClipboardItem`) to hide/disable the button when unsupported; show a success toast via the existing `notifySuccess()` pattern
- [x] 4.11 Implement download-as-PNG: `canvas.toBlob()` → blob → the same temporary-`<a download>` pattern `slides.js`'s `triggerDownload()` uses, naming the file after the active slide
- [x] 4.12 (found via post-implementation bug report: "the preview pane does not scale correctly") `pptxviewjs` locks a fixed inline `width`/`height` style onto the canvas at render time, which then overrides this project's CSS permanently — every later render just re-measures that same frozen value regardless of the pane's actual current size. Fixed by clearing the inline style before every render (compile path, drag-resize, and a new debounced `window resize` listener that previously didn't exist at all). See design.md Decision 11.

## 5. Wiring

- [x] 5.1 In `app.js`, call `schedulePreviewUpdate()` from the existing `el.editor` `input` listener
- [x] 5.2 In `app.js`, call `updatePreviewNow()` once after the initial `render()` on load
- [x] 5.3 In `view.js`'s `selectFile()`, call `updatePreviewNow()` after `render()` so switching slides refreshes the preview immediately

## 6. Tests

- [x] 6.1 ~~Unit test: compiling a single slide via `compileDeck({ slides: [entry] })` produces a valid one-slide `.pptx` buffer~~ — not achievable as a Node unit test: `compile.js`'s `importModule()` dynamic-imports a `blob:` URL, which Node's ESM loader rejects (`ERR_UNSUPPORTED_ESM_URL_SCHEME`); `compile.js` is browser-only, same as the rest of the compile pipeline (`forge.spec.js` covers it exclusively via Playwright). Covered instead by the e2e tests in section 6 below.
- [x] 6.2 Unit test: last-viewed-slide tracking updates correctly across slide/theme/masters selection changes — extracted the pure decision logic into `preview-logic.js`'s `pickPreviewSlideName()` (DOM-free, unlike `preview.js` itself) and unit-tested it directly in `test/browser-preview.test.js`
- [x] 6.3 Playwright e2e: editing a slide updates the preview canvas (debounced) without a manual refresh
- [x] 6.4 Playwright e2e: switching to `theme.js` keeps the last-viewed slide rendered in the preview
- [x] 6.5 Playwright e2e: drag-resize changes and persists the pane height percentage across a reload; plus (added for task 4.12) drag-resize and window-resize both actually re-render the canvas at its new size, not just resize the empty space around a stale render
- [x] 6.6 Playwright e2e: collapse/expand toggles the canvas visibility and persists across a reload, and edits made while collapsed don't render until expanded — split into two specs (collapse/expand behavior; collapsed-flag persistence) since `state.active` always resets to `theme.js` on reload regardless of this change, so which slide (if any) re-renders post-reload isn't this capability's concern
- [x] 6.7 Playwright e2e: copy button writes a PNG to the clipboard (where supported in the test browser) and shows a success toast
- [x] 6.8 Playwright e2e: download button triggers a PNG file download
- [x] 6.9 Playwright e2e: rendering a preview issues zero non-`file:`/`blob:`/`data:` network requests (guards against the `pptxviewjs` CDN-fallback path ever reactivating)
- [x] 6.10 (found during implementation, not originally scoped) Made the `pptxviewjs` import in `preview.js` a lazy `import('pptxviewjs')` inside `getViewer()` instead of a static top-of-file import — `chart.js/auto` self-registers its entire controller set as an import-time side effect, and since `preview.js` loads unconditionally on every page load, a static import measurably slowed every page bootstrap (~560ms → ~3.6s per test) enough to destabilize an unrelated, timing-sensitive existing test (`drag-drop-import.spec.js`) under repeated/back-to-back runs. Verified fixed: the same repeated-run reproduction now passes at original speed.

## 7. Docs

- [x] 7.1 Update the README's "Image export" backlog line to describe the shipped live-preview capability (or remove it if fully superseded) — documented the preview pane in the browser-tool walkthrough, removed the now-superseded backlog line
