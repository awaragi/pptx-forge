## Context

The browser tool ([src/tools/browser/](../../../src/tools/browser/)) currently keeps one implicit "workspace" in memory, autosaved to `sessionStorage` under a key that mirrors the forge output filename ([storage.js](../../../src/tools/browser/storage.js), [app.js](../../../src/tools/browser/app.js)). This has three problems this change addresses together, because they share one underlying seam — workspace identity:

1. `sessionStorage` dies with the tab; there is no way to resume work after a browser restart.
2. There is exactly one workspace at a time; "switching" only happens by retyping the output filename, which silently forks a new, unreachable storage entry — or worse, silently overwrites an existing entry of the same name.
3. There is no way to get a workspace's source files out of, or into, the browser other than one file at a time via Download/drag-and-drop.

`jszip` is already a runtime dependency (used in [compile.js](../../../src/tools/browser/compile.js) to patch `theme1.xml`'s scheme colors after `pptxgenjs` writes the deck), so zip export/import add no new dependency.

This is a from-scratch redesign of the storage/identity model with **no backward compatibility** — old `sessionStorage` entries are simply abandoned, since sessionStorage does not survive a browser restart in the first place, so there is nothing meaningful to migrate.

## Goals / Non-Goals

**Goals:**
- Workspaces persist across browser restarts (`localStorage`), are explicitly named, and are independently listable/switchable/deletable.
- Workspace identity (name) is fully decoupled from the forge output filename; renaming a workspace or setting the output filename never implicitly forks or overwrites storage.
- A workspace (theme.js + slide files) can be exported to a `.zip` and re-imported, either into a new workspace or merged into an existing one by name match.
- A single slide file can be moved or copied from the active workspace into another existing workspace.
- The tool keeps working (in-memory only) if `localStorage` is unavailable or full, matching the existing one-time-warning pattern in `storage.js`.

**Non-Goals:**
- No real-time collaborative editing or conflict resolution between tabs — cross-tab handling here is "last full autosave wins, and other tabs quietly catch up," not merging concurrent edits.
- No automatic copying of `theme.js` between workspaces (move/copy applies to slide files only; theme content is copy-pasted by hand if needed).
- No workspace sharing/sync across browsers or devices beyond manual zip export/import.
- No migration of existing `sessionStorage` data.

## Decisions

**Workspace identity is a free-form name, not the output filename.**
Today `workspaceKey === outputFilename`, which is why retyping the output filename forks/overwrites storage ([app.js:131-136](../../../src/tools/browser/app.js#L131-L136)). Decoupling means a workspace has a stable name (spaces allowed) used as the `localStorage` key, the switcher label, and the default forge/export base name — but changing what a workspace exports as no longer touches its identity. *Alternative considered*: keep the output filename as identity and just add collision-blocking. Rejected because it keeps a load-bearing UI field (edited live, on every keystroke) as a storage key, which is the exact fragility being removed.

**Workspace CRUD is explicit, not fork-on-edit.**
New Workspace prompts for a name up front and creates a new, independent entry (never resets/destroys the current one — a behavior change from today's confirm-and-clear "New Project"). Rename and (workspace) Create are both blocked outright on a name collision — no merge, no override, no silent overwrite. To reuse a name, the user must explicitly delete the old workspace first. *Alternative considered*: offer an override/merge path on collision (as zip import does). Rejected per explicit direction — collision handling should stay uniform and simple everywhere except the one place (zip import) where merge-by-design is the entire point.

**Zip import is the one deliberate exception to "block on collision."**
A dropped/selected `.zip`'s filename (minus extension) is matched against existing workspace names. Match → merge into that workspace (confirm-gated, since it overwrites files). No match → create a new workspace directly (no confirmation — nothing existing is at risk). Either path ends by switching to the resulting workspace. This mirrors export's own naming convention (`<workspace-name>.zip`), so export → import round-trips by construction.

**Slide move/copy targets are pre-validated, not attempt-then-fail.**
The workspace picker checks each candidate workspace's slide filenames before rendering the list and disables (with an inline reason) any workspace that already has a same-named slide, rather than letting the user pick a target and then reporting failure. This requires reading other workspaces' stored file lists directly via storage (they aren't loaded into memory) — a read-only, non-destructive operation, so no confirmation is needed for the read itself.

**Move switches focus to the target; Copy does not.**
Move behaves like the slide left — following it to the target workspace confirms the result, the same way Discard already removes a slide from view. Copy behaves like the slide is still here too — the source is unchanged, so there's no reason to leave it. `theme.js` is excluded entirely: it has no move/copy affordance, on the theory that theme content is workspace-specific enough that an explicit copy-paste is clearer than an implicit file operation.

**`localStorage` cross-tab writes are handled passively, reusing an existing guard.**
`storage` events fire in every other tab when one tab writes. If the event's key matches the currently active workspace and this tab's editor isn't focused, the tab silently reloads state from the new snapshot and shows a quiet status-bar note. The "don't clobber a focused editor" guard already exists for local re-renders ([app.js:216-218](../../../src/tools/browser/app.js#L216-L218)) and extends naturally to cross-tab updates. *Alternative considered*: a claim/lock mechanism preventing two tabs from opening the same workspace at all. Rejected as unnecessary complexity (heartbeats, staleness timeouts) for a single-user local tool; passive sync plus a status note is enough visibility without blocking anyone.

**Quota handling combines proactive warning and graceful degradation.**
After each autosave, estimate total `localStorage` usage; near a conservative threshold, show a non-blocking status-bar note suggesting the user delete unused workspaces. If a write still fails outright (e.g. a large zip import, or a large asset pasted into a slide), show the existing one-time failure warning (reworded for `localStorage`) and continue operating on in-memory state only, exactly as `storage.js` already does for `sessionStorage` failures today.

**Forge output naming derives from the active workspace, with an optional timestamp toggle.**
The free-text "output filename" field is removed; Forge's output base name is the active workspace's sanitized name. A separate, off-by-default toggle near Forge appends a timestamp suffix (e.g. `Q3 Investor Deck 2026-07-10-1432.pptx`) for users who want non-clobbering repeated exports to their Downloads folder.

## Risks / Trade-offs

- **[Risk]** `localStorage` is shared across all tabs/windows on the origin, unlike `sessionStorage`. Two tabs autosaving the same workspace can still race at the exact moment both are focused and editing simultaneously (the "don't clobber a focused editor" guard only protects an *unfocused* tab). → **Mitigation**: accepted as a known limitation; single-tab-per-workspace is the intended usage, and passive sync means the non-focused tab self-corrects as soon as it's no longer the one being typed into.
- **[Risk]** Origin-wide `localStorage` quota (commonly ~5-10MB) is now shared across every workspace a user has ever created, indefinitely (no tab-close expiry). → **Mitigation**: Delete action plus the proactive nearing-quota warning; no hard workspace-count limit is enforced.
- **[Risk]** Reading other workspaces' file lists for the move/copy picker's collision pre-check touches `localStorage` entries outside the active workspace on every picker open. → **Mitigation**: read-only, small (filenames only, not full content, needed for the check), and only performed when the picker is opened, not on every keystroke.
- **[Trade-off]** Blocking Rename/Create outright on collision (no override) is simpler and safer but less convenient than an in-place override; the user has to Delete-then-Rename to reuse a name. Accepted deliberately per explicit direction — consistency with the rest of the collision handling matters more than saving one extra click.

## Migration Plan

No migration. Old `sessionStorage["pptx-forge.workspaces"]` / `["pptx-forge.workspace"]` entries are left in place, unread, and will disappear naturally with the tab/session as before. On first load under the new code, if no `localStorage` workspace data exists, a default workspace is auto-created — this covers both genuinely new users and anyone returning after this change ships. There is no rollback concern beyond reverting the code, since nothing destructive happens to any existing data store.

## Open Questions

None outstanding — scope, identity model, storage backend, CRUD/collision rules, export/import semantics, cross-tab behavior, quota handling, and slide transfer semantics were all resolved during exploration prior to this proposal.
