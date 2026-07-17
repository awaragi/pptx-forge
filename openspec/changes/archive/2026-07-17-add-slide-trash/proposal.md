## Why

Discarding a slide is currently permanent — one confirmation click and the content is gone with no way back. This is the top item in the README backlog ("Trash can for deleted slides") and the risk grows as workspaces accumulate more slides worth keeping around by accident-proofing the delete path.

## What Changes

- **BREAKING** (behavioral): Discard no longer deletes a slide outright — it moves the file into a per-workspace trash instead, renamed with a delete-timestamp suffix to avoid collisions.
- The Discard confirmation prompt's wording changes from "cannot be undone" to reflect that the file is recoverable from trash.
- The Explorer sidebar gains a collapsible "Trash (n)" group, below "Slides", using the same header pattern as the existing "Slides" group.
- The Trash group header has a chevron (expand/collapse) and a single "empty trash" icon button that permanently purges all trashed entries for the active workspace, guarded by a confirmation prompt.
- Clicking a trashed entry restores it to the live slide list under its original name; if that name is already taken by a live slide, the restored copy is auto-suffixed (e.g. `foo (restored).js`) rather than blocked.
- Trashed entries are stored as ordinary keys in the same per-workspace snapshot object (namespaced with a `.trash/` prefix), so no new `localStorage` key or nested structure is introduced. They are excluded from Forge and workspace export, and unbounded in count (no auto-purge) until manually emptied.
- Out of scope: trash for deleted *workspaces* (app-level) — tracked separately as a lower-priority backlog item.

## Capabilities

### New Capabilities
- `browser-slide-trash`: Per-workspace trash for discarded slides — sidebar UI, restore-by-click, and manual empty-trash action.

### Modified Capabilities
- `browser-forge`: The "Discard removes the active slide file" requirement changes from permanent deletion to moving the file into the workspace trash; its confirmation-prompt wording changes accordingly.

## Impact

- `src/tools/browser/slides.js` — `discardActiveFile()` moves the entry into `state.trash` instead of deleting it; confirmation message text changes.
- `src/tools/browser/state.js` — new `state.trash` Map; `applyWorkspace()` and `currentWorkspaceSnapshot()` split/merge `.trash/`-prefixed keys.
- `src/tools/browser/view.js` — sidebar render() gains the Trash group (collapsed/expanded state, item list, restore-on-click).
- `src/tools/browser/index.html` — new `.tree-group-header` markup for "Trash", plus its item list container.
- `src/tools/browser/elements.js` — new element refs for the Trash group's DOM nodes.
- No changes to `storage.js`'s key structure, `compile.js`/export, or CLI — trash is purely an in-browser-tool, per-workspace concept.
