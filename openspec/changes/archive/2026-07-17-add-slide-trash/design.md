## Context

Today, `discardActiveFile()` ([slides.js](../../../src/tools/browser/slides.js)) deletes a slide from `state.slides` (a `Map`) after a `window.confirm`, and `persistWorkspace()` writes the resulting flat `{ fileName: content }` object to `localStorage` under the workspace's name ([state.js](../../../src/tools/browser/state.js), [storage.js](../../../src/tools/browser/storage.js)). There is no separate storage tier for anything workspace-scoped — theme, masters, and slides all live as sibling keys in one object per workspace.

This design adds a trash tier scoped to that same object, reusing the existing storage/render pipeline rather than introducing new mechanism.

## Goals / Non-Goals

**Goals:**
- Make Discard reversible within a workspace, with restore taking one click.
- Reuse the existing flat workspace-snapshot shape — no new `localStorage` key, no nested sub-object.
- Keep trash fully excluded from Forge output and workspace export without new filtering logic.
- Unbounded retention (no auto-purge); user empties trash explicitly.

**Non-Goals:**
- App-level trash for deleted *workspaces* — separate backlog item, not addressed here.
- Any storage-quota mitigation beyond what already exists (`storage.js`'s nearing-quota toast) — trash makes quota pressure worse, not better; that trade-off is accepted, not solved, in this change.
- Automatic pruning by age/count.

## Decisions

### Trash entries live as `.trash/`-prefixed keys in the same workspace object
Instead of a new top-level `localStorage` key or a nested `{ trash: {...} }` sub-object, a trashed file `foo.js` is written back into the same flat snapshot as `.trash/foo.<timestamp>.js` (content unchanged). `currentWorkspaceSnapshot()` emits these alongside live entries; `applyWorkspace()` routes any key starting with `.trash/` into a new `state.trash` Map instead of `state.slides`, stripping the prefix but keeping the timestamped basename as the trash entry's key (so multiple discards of the same original name never collide).

Rationale: this is the simplest option that satisfies "same structure" — no schema change to the workspace object, so rename/reload/cross-tab-sync code paths that already operate on the flat snapshot need no changes to keep working with trash present. The alternative (separate `pptx-forge.trash` `localStorage` key, keyed by workspace name) was rejected because it doubles the places workspace-rename and workspace-delete have to touch, for no benefit given trash is meant to travel with its workspace anyway.

### Timestamp suffix uses seconds resolution
Reuses the existing `YYYY-MM-DD` date portion style from `timestampSuffix()` in slides.js but adds seconds (`HH-mm-ss`) so two discards of the same filename within the same minute still produce distinct trash keys. Format: `<basename>.<YYYY-MM-DD_HH-mm-ss>.js`.

### Export/Forge exclusion is automatic, not filtered
`exportWorkspaceZip()` and `compileDeck()` are both called with an explicit slide list built from `sortedSlideNames()` / `state.slides` ([slides.js](../../../src/tools/browser/slides.js) `exportWorkspace()`, `forge()`) — never the raw snapshot. Since trash lives in `state.trash`, not `state.slides`, it's excluded by construction; no new skip-list or prefix filter needs to be added at those call sites.

### Restore-on-click (confirmed), auto-suffix on name collision
Clicking a trash row calls `restoreFromTrash()`, which confirms via `window.confirm` first (added after initial implementation, since a bare click was judged too easy to trigger by accident for a destructive-feeling action, even though the underlying slide was already recoverable from trash) then: strips the `.trash/` prefix and timestamp suffix to recover the original name, and if `state.slides` already has that name, appends ` (restored)` (and a numeric suffix if that too collides) before inserting. No separate restore button — keeps the row interaction otherwise consistent with how clicking a live slide row already selects it.

### Empty-trash is the one remaining destructive, confirmed action
Discard's `window.confirm` wording changes (no longer "cannot be undone") but stays, since the user asked to keep it — just reworded to describe moving to trash. The Trash group's "empty trash" icon button keeps a `window.confirm` because it's the only irreversible step left in this flow.

### Sidebar rendering mirrors the existing "Slides" group
`.tree-group-header` (already used for "Slides" in [index.html](../../../src/tools/browser/index.html)) is reused for a "Trash (n)" header: a click target that toggles a collapsed/expanded boolean (new, small piece of UI-only state, not persisted) plus one icon-button action (empty trash) in its `.node-actions-buttons` slot, matching the existing Slides header's `[+][⇩]` layout.

## Risks / Trade-offs

- **[Risk] Unbounded trash grows `localStorage` usage indefinitely** → Accepted trade-off per explicit "retain as many" instruction; the existing nearing-quota toast (`browser-workspace-persistence` spec) already nudges users before this becomes a hard failure. No new mitigation added here.
- **[Risk] Restoring into an already-full sidebar could surprise the user with a renamed file (`foo (restored).js`)** → Mitigated by a success toast that names the restored file explicitly, same pattern already used for rename/move/copy toasts.
- **[Risk] A workspace rename or cross-tab sync round-trips `.trash/`-prefixed keys through the same code paths as live files** → Not actually a new risk: since trash entries are ordinary snapshot keys, every existing path that already handles the flat object (rename, cross-tab sync, quota estimate) continues to work unmodified — this is the direct payoff of the "same structure" decision.

## Migration Plan

No data migration needed. Existing persisted workspaces simply have zero `.trash/`-prefixed keys until the first discard under the new behavior; `applyWorkspace()` handles an absent trash tier the same as an empty one. No rollback concerns beyond reverting the code change, since the on-disk shape is backward compatible (an older build would just treat `.trash/foo...js` as a stray slide file — acceptable since this is an unreleased, single-audience browser tool with no version-skew concern across users).

## Open Questions

None outstanding — scope, storage shape, retention, and the discard-confirmation wording were all resolved during exploration before this design was written.
