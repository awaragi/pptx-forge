## 1. Workspace persistence storage layer

- [x] 1.1 Add a storage module (in `src/tools/browser/app.js` or a new `storage.js`) wrapping `sessionStorage` reads/writes for `pptx-forge.workspaces` and `pptx-forge.activeWorkspace`, with try/catch around every access
- [x] 1.2 Wire a save-current-workspace function into every state mutation point: editor input, add slide, discard slide, rename slide, theme edit
- [x] 1.3 Implement warn-once status-bar messaging on first storage failure; suppress subsequent failures for the page lifetime
- [x] 1.4 On startup, read `pptx-forge.activeWorkspace` and silently load the matching `workspaces` entry into state if present, before the first `render()`

## 2. New Project and rename-driven workspace switching

- [x] 2.1 Add a New Project button to the sidebar footer, with a confirm-before-clear prompt (mirroring Discard's `window.confirm` pattern)
- [x] 2.2 Implement New Project's reset: clear slides, restore `theme.js` placeholder, reset output filename to `deck`, set active workspace to `deck`
- [x] 2.3 Hook the output filename input's change event to detect a rename (value differs from current active workspace key) and copy state into a new `workspaces` entry, repointing `activeWorkspace`, without deleting the old entry

## 3. Reset theme.js

- [x] 3.1 Add a Reset icon button that occupies the Discard button's toolbar slot when the active file is `theme.js` (Discard hidden, Reset shown, and vice versa for slide files)
- [x] 3.2 Implement Reset behavior: confirm via `window.confirm`, then set `state.theme.content` to `THEME_PLACEHOLDER`, refresh the editor pane, and re-render sidebar muted styling

## 4. Light/dark color scheme

- [x] 4.1 Add a light CSS variable set in `index.html` alongside the existing dark `:root` variables
- [x] 4.2 Add a `@media (prefers-color-scheme: light)` block applying the light variable set; keep dark as the default (no `light-dark()`/toggle needed)
- [ ] 4.3 Manually verify contrast/legibility of all UI elements (buttons, sidebar, editor, status bar, drop overlay) in both modes — **not done**: no browser-driving tool available in this session; needs manual check

## 5. AI reference button

- [x] 5.1 Extend `scripts/build-browser.js` to read `INSTRUCTIONS.md` and `lib.d.ts`, concatenate their text, and inject it into the build (new marker in `index.html`, or passed into the esbuild entry for `app.js` to import)
- [x] 5.2 Add an AI button to the topbar wired to a copy handler
- [x] 5.3 Implement the copy handler: try `navigator.clipboard.writeText`, catch failures/absence and fall back to showing a `<textarea readonly>` with the reference text pre-selected
- [x] 5.4 Add the fallback textarea markup/CSS (hidden by default, shown on fallback) to `index.html`

## 6. Release pipeline: build and attach the browser tool

- [x] 6.1 Add `actions/setup-node` and `npm ci` steps to `.github/workflows/release.yml` before the archive step
- [x] 6.2 Add an `npm run build:browser` step producing `pptx-forge.html`
- [x] 6.3 Rename the built file to `pptx-forge-<tag>.html` and attach it alongside `pptx-forge-<tag>.zip` in the `gh release create` (or a follow-up `gh release upload`) step
- [x] 6.4 Verify locally (e.g. by dry-running the workflow steps or a manual `npm run build:browser` + rename) that the produced html still opens standalone via `file://`

## 7. Manual verification

- [ ] 7.1 Verify reload-restores-session, New Project, and rename-preserves-old-entry flows in a real browser via `file://` — **not done**: needs manual browser check
- [ ] 7.2 Verify storage-failure warning appears once when tested in a private/incognito window where `sessionStorage` is restricted (if reproducible) or by temporarily forcing writes to throw — **not done**: needs manual browser check
- [ ] 7.3 Verify Reset, light/dark auto-detection, and the AI button's clipboard + fallback paths — **not done**: needs manual browser check
- [ ] 7.4 Trigger a test tag/workflow run (or `act`/local simulation) to confirm the release workflow attaches both assets correctly — **not done**: requires pushing a tag (destructive/shared-state action) — left for the user
