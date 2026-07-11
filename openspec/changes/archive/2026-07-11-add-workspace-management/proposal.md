## Why

The browser tool currently persists a single implicit workspace to `sessionStorage`, keyed by the forge output filename — state is lost on browser restart, there is no way to manage more than one in-flight deck, and retyping an existing output filename silently overwrites whatever was saved under that name. Users need work to survive across sessions, the ability to hold multiple decks at once, and a safe way to move a deck in or out of the browser.

## What Changes

- **BREAKING**: session-scoped, single-implicit-workspace persistence (`sessionStorage["pptx-forge.workspaces"]`) is replaced entirely by `localStorage`-backed, explicitly named, multi-workspace persistence. No migration of old session data — the prior keys are simply abandoned.
- Workspace identity becomes a free-form name (spaces allowed), decoupled from the forge output filename. Creating or renaming a workspace is blocked outright if the target name already matches an existing workspace — no silent overwrite, no merge path.
- New toolbar workspace controls, all acting on the active workspace: a switcher dropdown listing saved workspaces, **New Workspace** (prompts for a name up front, blocked on collision), **Rename** (blocked on collision), **Delete** (confirm-gated, falls back to another workspace or a fresh default if none remain), and **Export**.
- A completely fresh browser (no saved workspaces) auto-creates and activates a default workspace so the switcher is never empty.
- Cross-tab sync via the `storage` event: if the active workspace's data changes in another tab and this tab's editor isn't focused, state is silently reloaded and a quiet status-bar note is shown ("Synced from another tab").
- Storage-quota handling: a proactive status-bar warning as usage nears the browser's quota, plus graceful fallback to in-memory-only operation (with a one-time notice) if a write still fails outright.
- **Zip export**: download the active workspace's `theme.js` + all slide files as `<workspace-name>.zip`, reusing the `jszip` dependency already vendored for theme-color patching.
- **Zip import**: dropping/selecting a `.zip` whose filename matches an existing workspace name merges its contents into that workspace (confirm-gated, since destructive); no match creates a new workspace instead (no confirmation needed). Either way, the app switches to the resulting workspace afterward.
- **Slide move/copy**: two new icon actions on the active slide file open a workspace picker (targets that already contain a same-named slide are disabled with a reason shown inline). Move removes the slide from the source and switches to the target; Copy duplicates it and leaves the source active. `theme.js` is out of scope for both — never moved or copied automatically.
- Forge's output filename is no longer an independently editable field set immediately before compiling; it derives from the active workspace's (sanitized) name, with an optional timestamp-suffix toggle appended at forge time (e.g. `Q3 Investor Deck 2026-07-10-1432.pptx`).

## Capabilities

### New Capabilities
- `browser-workspace-export-import`: zip export of a workspace's files; zip import that merges into an existing workspace by filename match or creates a new one.
- `browser-slide-transfer`: move or copy a single slide file from the active workspace into another existing workspace, blocked on a colliding slide name.

### Modified Capabilities
- `browser-workspace-persistence`: replaces session-scoped, single-implicit-workspace autosave with a `localStorage`-backed, explicitly named, multi-workspace model — switcher/CRUD actions, first-run default workspace, quota handling, and cross-tab sync.
- `browser-forge`: forge output naming changes from a free-text, independently-set "output filename" field to the active workspace's name, with an optional timestamp-suffix toggle.

## Impact

- `src/tools/browser/storage.js`: rewritten for `localStorage`, multi-entry CRUD, cross-tab `storage` event handling, and quota estimation.
- `src/tools/browser/app.js`: workspace switcher/CRUD UI wiring, slide move/copy UI and logic, zip export/import handling, forge output-naming changes.
- `src/tools/browser/index.html`: new toolbar controls (workspace dropdown, New Workspace, Rename, Delete, Export, timestamp toggle) and slide move/copy icon buttons.
- `src/tools/browser/compile.js`: zip export path added alongside existing `compileDeck`/theme-patch zip usage; no new dependency (`jszip` already vendored).
- No changes expected to `bin/`, `lib/`, or `scripts/build-browser.js` — this is browser-tool-only; the build step still bundles the same file set into `pptx-forge.html`.
- Old `sessionStorage` keys (`pptx-forge.workspaces`, `pptx-forge.workspace`) are abandoned with no migration path, per the explicit no-backward-compatibility decision for this change.
