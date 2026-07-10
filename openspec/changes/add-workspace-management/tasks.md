## 1. Storage layer rewrite (storage.js)

- [ ] 1.1 Replace `sessionStorage` keys/API in `storage.js` with `localStorage`-backed functions keyed by workspace name: `listWorkspaceNames()`, `readWorkspace(name)`, `writeWorkspace(name, snapshot)`, `deleteWorkspace(name)`, `getActiveWorkspaceName()`, `setActiveWorkspaceName(name)`
- [ ] 1.2 Add `renameWorkspace(oldName, newName)` that fails (returns false / throws a typed error) if `newName` already exists, otherwise moves the stored entry
- [ ] 1.3 Add a storage-usage estimate function and a threshold check, reusing the existing single-warning-on-hard-failure pattern (`setStorageFailureHandler`) plus a new repeatable proactive-warning callback
- [ ] 1.4 Add a `storage` event subscription helper that reports when the active workspace's key changed from another tab

## 2. Workspace identity & first-run (app.js)

- [ ] 2.1 Remove the `outputFilename` input and its `handleOutputNameChange`/fork-on-rename logic; remove old `DEFAULT_WORKSPACE_KEY`-based New Project reset behavior
- [ ] 2.2 On load, restore the active workspace from storage; if none exists or it's missing, auto-create and activate a default workspace (no confirmation, no blank-state prompt)
- [ ] 2.3 Update autosave (`persistWorkspace`-equivalent) to write under the active workspace's name on every file/content/file-set change

## 3. Workspace switcher toolbar (index.html, app.js)

- [ ] 3.1 Add switcher dropdown, New Workspace, Rename, Delete, and Export buttons to the toolbar in `index.html`
- [ ] 3.2 Wire the switcher dropdown to list all stored workspace names and activate the selected one with no confirmation
- [ ] 3.3 Wire New Workspace: prompt for a name, block with inline error on collision, otherwise create a blank workspace and activate it
- [ ] 3.4 Wire Rename: reuse the existing slide-rename inline-input pattern for the active workspace's name, block with inline error on collision, no override path
- [ ] 3.5 Wire Delete: `confirm()`-gated, remove active workspace from storage/switcher, activate another existing workspace or auto-create a fresh default if none remain

## 4. Cross-tab sync (app.js, storage.js)

- [ ] 4.1 Subscribe to `storage` events; when the change affects the active workspace and `document.activeElement !== el.editor`, reload in-memory state and re-render
- [ ] 4.2 Show a quiet status-bar note ("Synced from another tab.") after a cross-tab reload, using the existing non-error status styling
- [ ] 4.3 Verify a focused editor is never overwritten by an incoming cross-tab change (manual two-tab test)

## 5. Quota handling (storage.js, app.js)

- [ ] 5.1 After each autosave, check estimated usage against a conservative threshold; show a non-blocking, repeatable status-bar note suggesting deletion of unused workspaces when crossed
- [ ] 5.2 Keep the existing one-time hard-failure warning for actual write failures (reworded for `localStorage`), continuing in-memory-only operation afterward

## 6. Forge output naming (app.js, compile.js)

- [ ] 6.1 Add a filename-sanitize step that derives the forge output base name from the active workspace's name (reusing/adapting the existing `sanitizeOutputName`)
- [ ] 6.2 Add an off-by-default timestamp toggle control near Forge; when enabled, append a timestamp to the sanitized workspace name before the `.pptx` extension
- [ ] 6.3 Update `forge()` to use the derived name (with or without timestamp) instead of the removed `outputFilename` input value

## 7. Zip export (compile.js, app.js, index.html)

- [ ] 7.1 Add an `exportWorkspaceZip({ theme, slides, workspaceName })` function in `compile.js` using the already-vendored `jszip`, packaging `theme.js` + all slide files with current (synced) content
- [ ] 7.2 Wire the Export button to sync the active file's in-progress edit, build the zip, and trigger a download named `<sanitized-workspace-name>.zip`

## 8. Zip import (app.js, compile.js)

- [ ] 8.1 Extend the existing drag-and-drop/file-picker handling to detect a `.zip` file (alongside the current loose-`.js` path) and unzip its entries in memory
- [ ] 8.2 Derive the target workspace name from the zip's filename (minus `.zip`); if no workspace with that name exists, create one from the archive's files and activate it (no confirmation)
- [ ] 8.3 If a workspace with that name exists, show a `confirm()` prompt before merging (replacing matching files, adding new ones); activate that workspace whether confirmed or declined

## 9. Slide move/copy (app.js, index.html, storage.js)

- [ ] 9.1 Add Move-to/Copy-to icon buttons to the active-slide toolbar (not shown for `theme.js`)
- [ ] 9.2 Add a picker listing other workspaces; for each, read its stored slide filenames (read-only) to determine collision and disable/annotate colliding candidates
- [ ] 9.3 Wire Move: remove the slide from the active workspace's storage/in-memory state, add it to the target workspace's storage, activate the target workspace
- [ ] 9.4 Wire Copy: add the slide to the target workspace's storage without removing it from the active workspace; keep the active workspace shown

## 10. Verification

- [ ] 10.1 Rebuild `pptx-forge.html` via `npm run build:browser` and manually verify: workspace create/switch/rename/delete, first-run default workspace, zip export/import (create + merge paths), slide move/copy with a collision-disabled target, timestamp toggle, and cross-tab passive sync across two tabs
- [ ] 10.2 Run `openspec verify-change add-workspace-management` (or equivalent) once implementation is complete
