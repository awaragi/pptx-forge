## 1. Dependencies

- [ ] 1.1 Add `pptxviewjs` and `chart.js` to `package.json` `dependencies`, pinned to exact versions (no `^`/`~`)
- [ ] 1.2 Run `npm install` and confirm `package-lock.json` picks up both as real dependencies

## 2. Layout & markup

- [ ] 2.1 In `index.html`, split `.editor-pane` into an `editor-top` wrapper (containing the existing `#editor` textarea) and a new `preview-pane` block
- [ ] 2.2 Add a drag-handle element between `editor-top` and `preview-pane`
- [ ] 2.3 Add the preview toolbar markup: status text, copy-PNG button, download-PNG button, collapse/expand button
- [ ] 2.4 Add the `<canvas>` element the preview renders into
- [ ] 2.5 In `app.css`, style the split (flex column, drag handle cursor/hit-area, toolbar layout, canvas sizing so it fills its wrapper instead of the default 300x150 intrinsic canvas size)
- [ ] 2.6 Style the collapsed state (canvas hidden, pane shrunk to toolbar-only height)

## 3. DOM element refs

- [ ] 3.1 Add refs in `elements.js` for: preview pane container, drag handle, canvas, status text, copy button, download button, collapse/expand button

## 4. Preview module (`src/tools/browser/preview.js`)

- [ ] 4.1 Instantiate a single reused `PPTXViewer` bound to the preview canvas
- [ ] 4.2 Implement `schedulePreviewUpdate()` (450ms debounce) and `updatePreviewNow()`, reusing `compileDeck({ theme: state.theme, masters: state.masters, slides: [entry] })` from `compile.js`
- [ ] 4.3 Add a generation counter so a superseded in-flight compile's result is discarded on arrival
- [ ] 4.4 Track `lastViewedSlideName`, updated whenever `state.active` names a slide file; preview compiles use this name's entry when `state.active` is `theme.js`/`masters.js`
- [ ] 4.5 Handle the no-slide-viewed-yet and no-slides-in-workspace cases with a placeholder status message instead of attempting to compile
- [ ] 4.6 On compile failure, show the `CompileError`-formatted message (or generic error) in the status area, in the same style already used by `slides.js`'s `forge()`, and keep the last successful canvas render rather than clearing it
- [ ] 4.7 Implement collapse/expand: collapsing clears any pending debounce and stops scheduling further compiles; expanding calls `updatePreviewNow()` immediately
- [ ] 4.8 Implement drag-resize: pointer handlers on the drag handle compute and apply a height percentage of `.editor-pane`, clamped to a sane min/max so neither pane becomes unusably small
- [ ] 4.9 Persist `pptx-forge.preview.visible` (boolean) and `pptx-forge.preview.height` (percentage) to `localStorage`, following the existing `HELP_SEEN_KEY`-style global-key convention in `storage.js`; read them back on load to set initial pane state
- [ ] 4.10 Implement copy-to-clipboard: `new ClipboardItem({ 'image/png': new Promise(resolve => canvas.toBlob(resolve, 'image/png')) })` passed directly to `navigator.clipboard.write` (not pre-awaited), feature-detected (`navigator.clipboard?.write` and `typeof ClipboardItem`) to hide/disable the button when unsupported; show a success toast via the existing `notifySuccess()` pattern
- [ ] 4.11 Implement download-as-PNG: `canvas.toBlob()` → blob → the same temporary-`<a download>` pattern `slides.js`'s `triggerDownload()` uses, naming the file after the active slide

## 5. Wiring

- [ ] 5.1 In `app.js`, call `schedulePreviewUpdate()` from the existing `el.editor` `input` listener
- [ ] 5.2 In `app.js`, call `updatePreviewNow()` once after the initial `render()` on load
- [ ] 5.3 In `view.js`'s `selectFile()`, call `updatePreviewNow()` after `render()` so switching slides refreshes the preview immediately

## 6. Tests

- [ ] 6.1 Unit test: compiling a single slide via `compileDeck({ slides: [entry] })` produces a valid one-slide `.pptx` buffer (reuses existing `compile.js` test patterns)
- [ ] 6.2 Unit test: last-viewed-slide tracking updates correctly across slide/theme/masters selection changes
- [ ] 6.3 Playwright e2e: editing a slide updates the preview canvas (debounced) without a manual refresh
- [ ] 6.4 Playwright e2e: switching to `theme.js` keeps the last-viewed slide rendered in the preview
- [ ] 6.5 Playwright e2e: drag-resize changes and persists the pane height percentage across a reload
- [ ] 6.6 Playwright e2e: collapse/expand toggles the canvas visibility and persists across a reload, and edits made while collapsed don't render until expanded
- [ ] 6.7 Playwright e2e: copy button writes a PNG to the clipboard (where supported in the test browser) and shows a success toast
- [ ] 6.8 Playwright e2e: download button triggers a PNG file download
- [ ] 6.9 Playwright e2e: rendering a preview issues zero non-`file:`/`blob:`/`data:` network requests (guards against the `pptxviewjs` CDN-fallback path ever reactivating)

## 7. Docs

- [ ] 7.1 Update the README's "Image export" backlog line to describe the shipped live-preview capability (or remove it if fully superseded)
