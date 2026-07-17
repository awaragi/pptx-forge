## 1. State: trash tier in `state.js`

- [x] 1.1 Add unit tests (`test/browser-trash-logic.test.js`, targeting new pure module `trash-logic.js` — following the existing preview-logic.js split so tests don't have to import `storage.js`'s `window`-dependent module) covering: snapshot split into live vs. `.trash/`-prefixed entries; a snapshot with no `.trash/` keys yields an empty trash list.
- [x] 1.2 Add `state.trash = new Map()` to the state object in `state.js`, alongside `state.slides`.
- [x] 1.3 Update `applyWorkspace()` to split incoming snapshot entries via `splitSnapshot()`: `.trash/`-prefixed keys go into `state.trash` (keyed by the full trash key, value `{ name, trashKey, content }`), non-prefixed non-pinned keys continue into `state.slides` as today.
- [x] 1.4 Update `currentWorkspaceSnapshot()` to also emit each `state.trash` entry back into the snapshot object under its `.trash/`-prefixed key.
- [x] 1.5 Add a `timestampedTrashKey(name)` helper (seconds-resolution suffix, e.g. `foo.2026-07-16_14-32-05.js`) and an `originalNameFromTrashKey(trashKey)` helper that recovers the pre-discard basename, in `trash-logic.js`. Unit-tested both directions, including the round trip.
- [x] 1.6 Run the unit tests from 1.1 and confirm they pass against the 1.2–1.5 implementation.

## 2. Discard moves to trash, restore, empty trash

- [x] 2.1 `moveToTrash`/`restoreFromTrash`/`emptyTrash` (new `trash.js`) import `state.js`, which imports `storage.js`'s module-scope `window.addEventListener` — like `compileDeck`, not importable under plain Node (see `browser-preview.test.js`'s note on the same constraint). Their only non-trivial logic (key encoding, name dedup) is already unit-tested via `trash-logic.js` in task 1.1; the Map-wiring/persist/select behavior on top of that is covered by the e2e spec in task 4.1 instead, matching existing project convention.
- [x] 2.2 Implement `moveToTrash(name)`: removes the entry from `state.slides`, inserts it into `state.trash` keyed by `timestampedTrashKey(name)`, persists.
- [x] 2.3 Implement `restoreFromTrash(trashKey)` with the de-duplication behavior from 2.1, persists, and selects the restored file as active (mirrors existing `addBlankSlide()`'s `selectFile()` call).
- [x] 2.4 Implement `emptyTrash()`: clears all of `state.trash`, persists.
- [x] 2.5 Update `discardActiveFile()` in `slides.js` to call `moveToTrash(name)` instead of `state.slides.delete(name)`, and change the confirmation message from "cannot be undone" wording to reflect the file moving to trash (now `Move "${name}" to trash?`).
- [x] 2.6 N/A as unit tests per 2.1 — verified instead via the e2e spec in task 4.1.

## 3. Sidebar UI: Trash group

- [x] 3.1 Add markup in `index.html` for a "Trash" `.tree-group-header` (clickable label showing count, e.g. `Trash (2)`, plus an "empty trash" icon button reusing the `icon-trash` icon) and a `<ul id="trash-list" class="file-tree trash-list">` below it, following the existing "Slides" group's structure. Added matching `.trash-toggle`/`.trash-list.expanded` rules to `app.css`.
- [x] 3.2 Added the new element refs (`trashToggle`, `trashToggleIcon`, `trashCount`, `trashList`, `emptyTrashBtn`) to `elements.js`.
- [x] 3.3 Added a `trashExpanded` module-local boolean in `view.js` (collapsed by default) plus `toggleTrashGroup()`, wired to `el.trashToggle`'s click in `app.js` (matching that file's central-wiring convention for sidebar buttons), independent of the "Slides" group (which has no such state).
- [x] 3.4 Extended `render()` in `view.js` to populate `#trash-list` from `state.trash` (via `sortedTrashKeys()`, which sorts lexically = chronologically since the timestamp is embedded right after the trash-key prefix), update the "Trash (n)" count label, and toggle the `.expanded` class per `trashExpanded`.
- [x] 3.5 Wired each trash row's click handler to `restoreFromTrash(trashKey)` (which itself persists and calls `selectFile()`, triggering a re-render).
- [x] 3.6 Wired `el.emptyTrashBtn` to `emptyTrash()` in `app.js`; `emptyTrash()` itself does the `window.confirm` (worded for permanent deletion); the button is hidden via `render()` when `state.trash` is empty.
- [x] 3.7 `restoreFromTrash()`/`emptyTrash()` (in `trash.js`) already call `notifySuccess()`, naming the restored file explicitly when auto-suffixed.

## 4. End-to-end coverage

- [x] 4.1 Added `test/e2e/slide-trash.spec.js` covering: discard moves a slide to trash and the confirm message no longer says "cannot be undone"; the Trash group shows a count and toggles independently of Slides; restore-on-click recovers the original name and becomes active; restoring over a same-named live slide auto-suffixes `(restored)`; empty-trash is confirmable/cancellable; trash survives a reload; Forge and workspace export both exclude trashed content. All 8 pass.
- [x] 4.2 Ran the full e2e suite (`npx playwright test`): 37/37 passed, no regressions in `forge.spec.js`, `persistence.spec.js`, `drag-drop-import.spec.js`, `file-picker-import.spec.js`, or `browser-preview.spec.js`.

## 5. Docs

- [x] 5.1 Removed the README Backlog entry "Trash can for deleted slides" now that it's implemented, leaving "Trash can for deleted workspaces" in place as still pending.
