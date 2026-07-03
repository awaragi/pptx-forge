## 1. Build tooling

- [x] 1.1 Add `esbuild` as a devDependency in `package.json`.
- [x] 1.2 Create `src/tools/browser/` with an `app.js` entry point and an `index.html` shell (placeholder markup/CSS, no logic yet).
- [x] 1.3 Write a build script (e.g. `scripts/build-browser.js`) that runs esbuild in `--bundle` browser-platform mode on `src/tools/browser/app.js`, then inlines the resulting JS into `src/tools/browser/index.html`'s `<script>` tag, writing the combined output to `pptx-forge.html` (repo root or a `dist/`-style location — decide during implementation and keep it out of `bin/`/`src/` which are CLI-only).
- [x] 1.4 Add an npm script (e.g. `build:browser`) that runs the build script.
- [x] 1.5 Confirm the build output has no external `<script src>` or relative-path ES module imports (single self-contained file, per the "Single self-contained HTML distribution" requirement).

## 2. In-browser compile core

- [x] 2.1 In `app.js`, import `pptxgenjs`, `jszip`, and `src/lib/lib.js` (verify esbuild resolves `pptxgenjs`'s `browser` field correctly, no Node built-ins leak into the bundle).
- [x] 2.2 Implement a helper that takes a JS source string and returns its imported module via `Blob` + `URL.createObjectURL` + dynamic `import()`, revoking the object URL after import resolves or rejects.
- [x] 2.3 Implement the compile function: import `theme.js` content for overrides, call `createLib(overrides)`, construct `pptxgen()` with the same layout/theme constants `bin/forge.js` uses (`CUSTOM_WIDE` 13.333x7.5, Arial theme fonts), import and run each non-`theme.js` file's default export as `(pptx, lib)` in filename-sorted order.
- [x] 2.4 Implement the theme-color patch step: `pptx.write({ outputType: 'blob' })` (or arraybuffer), load into `JSZip`, patch `ppt/theme/theme1.xml` scheme slots from `lib.theme.scheme` using the same regex approach as `bin/forge.js`, regenerate the zip.
- [x] 2.5 Wrap file import/execution in try/catch that identifies the failing filename and error message for surfacing in the UI (per "A failing file surfaces a readable error").
- [x] 2.6 Manually verify: a known-good `theme.js` + slide file compiled via this browser path produces a `.pptx` that opens correctly and matches (visually) the same input compiled via `bin/forge.js`. (Verified via headless-browser script: identical slide count and identical patched `theme1.xml` scheme colors against `bin/forge.js` output for the same `src/sample` input.)

## 3. File/sidebar state model

- [x] 3.1 Implement an in-memory file list: `theme.js` as a fixed, non-deletable entry seeded with the default placeholder content, plus a dynamic list of other `.js` entries.
- [x] 3.2 Decide and implement the placeholder body content (bare `export default {};` vs. the documented scaffold from `src/sample/theme.js` — see design.md open question). (Went with the documented/commented scaffold for discoverability.)
- [x] 3.3 Implement "is this entry's content still the placeholder" check (exact match) to drive muted/normal styling.
- [x] 3.4 Implement add/replace-by-name logic: new filename appends an entry; existing filename replaces content in place without changing position.
- [x] 3.5 Implement `.js`-only validation with a rejection path that surfaces an inline message and does not mutate the file list.
- [x] 3.6 Implement filename-ascending sort for display/compile order of non-`theme.js` entries, with `theme.js` always shown separately/first.

## 4. UI

- [x] 4.1 Build the sidebar: list of entries (theme.js pinned, others sorted), click to select/load into the editor, muted style for placeholder `theme.js`, no delete control on `theme.js`.
- [x] 4.2 Build the single active editor pane as a `<textarea>` bound to the selected entry's content; edits update in-memory state live.
- [x] 4.3 Wire drag-and-drop (page-level and/or a drop zone) and a click-to-select `<input type="file">` to the add/replace logic from 3.4-3.5.
- [x] 4.4 Add a "+ new" affordance for creating an empty slide entry directly in the UI (without dropping a file).
- [x] 4.5 Add a Save button that downloads the active entry's current content as a file named after that entry.
- [x] 4.6 Add an editable output-filename field (sanitized against path separators/unsafe characters) and a Forge button that runs the compile pipeline from section 2 and downloads the result as `<filename>.pptx`.
- [x] 4.7 Add inline error/status messaging for: rejected non-`.js` files, Forge with no slide files loaded, and Forge failures naming the failing file.
- [x] 4.8 Style the layout per the VSCode-style sidebar/editor split (dark theme optional but consistent with the "gray placeholder" affordance needing visible contrast against normal entries).

## 5. Verification

- [x] 5.1 Open the built `pptx-forge.html` directly via `file://` (double-click, no server) and confirm it loads with no console errors and no blocked network/module requests. (Verified headlessly via Playwright against the `file://` URL — zero console/page errors.)
- [x] 5.2 Walk through each scenario in `openspec/changes/browser-forge/specs/browser-forge/spec.md` manually and confirm behavior matches. (Scripted walkthroughs covering: initial placeholder state, non-.js rejection, same-name replace-in-place, sort order, live edit clearing placeholder styling, Save download, Forge success/failure paths, no-slide-files guard — all passed.)
- [x] 5.3 Verify a deck compiled in-browser against one of the existing `workspaces/*/slides` + `theme.js` pairs visually matches the CLI-generated `.pptx` for the same input. (Ran `workspaces/jira-kpi/theme.js` + `slides/deck.js` through both `bin/forge.js` and the browser tool: identical slide count (5) and identical patched theme scheme colors.)

## 6. Documentation

- [x] 6.1 Add a section to `README.md` or `INSTRUCTIONS.md` describing the browser tool: what it is, how to build it (`npm run build:browser`), and how to open/use it.

## 7. Editor toolbar: download/discard/rename

- [x] 7.1 Replace the text "Save" button with three icon buttons in the editor toolbar: Download, Discard, Rename.
- [x] 7.2 Hide (not just disable) Discard and Rename when the active file is `theme.js`; only Download is shown.
- [x] 7.3 Implement Discard: confirm via a native confirmation prompt, then remove the active slide file from state and select `theme.js` as the new active file.
- [x] 7.4 Implement Rename: prompt for a new name, validate it ends in `.js`, is not `theme.js`, and does not collide with another loaded file; on success update the entry's name (content unchanged) and keep it selected; on failure show an inline message and leave the file unchanged.
- [x] 7.5 Verify via headless browser: icons appear/hide correctly per active file, discard removes a file and is cancellable, rename succeeds and rejects invalid/colliding names. (All 6 scripted checks passed; prior regression scripts re-run clean with zero console errors.)
- [x] 7.6 Move the rename affordance so the pencil icon sits directly next to the active filename (not grouped with Discard/Download at the far right), and make clicking the filename text itself also trigger rename; keep both disabled/hidden for `theme.js`. (Restructured the toolbar: filename + pencil are a single clickable group with a shared click handler, pushed left; Discard/Download remain right-aligned via a spacer. Verified via headless browser: 8/8 checks pass, including that clicking the filename on `theme.js` fires no dialog.)
- [x] 7.7 Replace the `window.prompt()`-based rename with an inline text input: entering rename mode swaps the filename display for a focused/selected `<input>` pre-filled with the current name; Enter validates and commits (staying open with an error on invalid/colliding names so the user can fix it); Escape cancels without validating; blur (clicking away) commits like Enter but reverts silently-with-error on invalid input since focus can't be retained. (Verified via headless browser: 7/7 checks pass — open/prefill/focus, Enter commit, invalid-Enter keeps editing, Escape cancels, blur commits valid, blur reverts invalid, theme.js never enters rename mode. Re-ran all other regression scripts — Discard, sort order, replace-by-name, Forge error paths, initial load — all still pass with zero console errors.)
- [x] 7.8 Fix stale error message: clear the inline error status as soon as the user edits the rename input again (before re-committing), instead of leaving it stuck until the next commit attempt. (Root cause was confirmed empirically, not assumed: the error correctly cleared on a successful re-commit already — the gap was specifically while still typing the fix, before pressing Enter/blurring. Added an `input` listener on the rename field that clears the status bar's error state immediately. Verified via headless browser.)
- [x] 7.9 Split the `.js` extension out of the rename input: the editable field holds only the basename, with a fixed `.js` label displayed next to it (not editable); committing appends `.js` to the typed basename automatically. Validation changed accordingly — reject empty basenames and basenames containing `/` or `\`, reject a basename that resolves to `theme.js`, reject collisions after appending `.js`. (Verified via headless browser: 6/6 checks — basename-only prefill with separate `.js` label, auto-appending `.js` on commit, slash rejected, error-clears-on-edit still works, fixed name commits, empty basename rejected. Full regression sweep re-run clean.)
