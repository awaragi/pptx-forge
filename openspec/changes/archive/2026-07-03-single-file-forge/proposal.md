## Why

Today `forge` always compiles every `.js` file in a workspace's `slides/` directory. When iterating on a single slide, authors have no way to preview just that slide — they must either temporarily move other slide files out of the way or regenerate the whole deck and hunt for the slide they care about. Letting the `<workspace>` argument point directly at one slide file speeds up this iteration loop.

## What Changes

- `bin/forge.js` accepts a path to a single slide `.js` file (in addition to a workspace name/directory) as the `<workspace>` positional argument.
- When a single file is given, only that file is imported and rendered — the rest of the workspace's `slides/` directory is not scanned.
- Workspace context (theme overrides, output directory, output filename) is still derived from the enclosing workspace so `theme.js` and `out/<slug>.pptx` continue to resolve the same way as directory mode. If the file is not nested under a `slides/` directory, the file's own directory is treated as the workspace root, and a missing `theme.js` falls back to library defaults as it already does today.
- The file must exist and end in `.js`; otherwise the system SHALL error the same way missing/invalid workspaces error today.
- Help text is updated to document the new single-file usage.

## Capabilities

### New Capabilities
(none)

### Modified Capabilities
- `compile-workspace-scan`: adds a new discovery mode where the `<workspace>` argument may resolve to a single slide `.js` file instead of a directory, in which case only that file is loaded instead of scanning `slides/`.

## Impact

- `bin/forge.js`: argument resolution and slide discovery logic (currently `readdir(slidesDir)` + filter/sort).
- `openspec/specs/compile-workspace-scan/spec.md`: gains a requirement for single-file discovery.
- No changes to `bin/create.js`, `bin/backup.js`, or the `src/` rendering library.
