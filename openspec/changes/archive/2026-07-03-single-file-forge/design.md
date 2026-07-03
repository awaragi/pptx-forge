## Context

`bin/forge.js` resolves its `<workspace>` positional argument to a directory (`wsDir`), then reads every `.js` file in `wsDir/slides/` and imports them in alphabetic order. There's no way to render just one slide file without physically removing the others from `slides/`.

## Goals / Non-Goals

**Goals:**
- Let `<workspace>` be a path to a single slide `.js` file. Only that file is imported and rendered.
- Preserve existing output location/naming (`workspaces/<slug>/out/<slug>.pptx`) and theme-override loading (`theme.js`) so single-file runs still produce a deck that matches the workspace's normal output path.
- Keep directory-mode behavior (the current default) completely unchanged.

**Non-Goals:**
- No new CLI flag — detection is based on whether the resolved path is a file vs. a directory.
- No support for passing multiple explicit files in one invocation.
- No change to how `theme.js` itself is authored or merged.

## Decisions

- **Detection**: after resolving the argument to an absolute path (same rule as today: treat as cwd-relative if it contains `/` or starts with `.`, otherwise look under `workspaces/`), `stat` it. If it's a file, enter single-file mode; if it's a directory, keep today's scan behavior. This reuses the existing path-resolution rule instead of adding new argument syntax.
  - Alternative considered: a `--file <path>` flag. Rejected — the positional argument already accepts paths (`workspaceArg.includes('/')`), so overloading it to accept a file path is the smaller, more consistent change.
- **Workspace root inference in single-file mode**: if the file's parent directory is named `slides`, `wsDir` = parent of that `slides` directory (so `theme.js` and `out/` resolve exactly as in directory mode). Otherwise, `wsDir` = the file's own containing directory (theme.js lookup will simply miss and fall back to defaults, same as it does today for a workspace with no `theme.js`).
- **Output naming unchanged**: `workspaceSlug = basename(wsDir)` and the output file is still `out/<workspaceSlug>.pptx` (or the snapshot-timestamped variant). Single-file mode changes *what's rendered*, not *where it's written*.
- **Validation**: the file must end in `.js`. A non-`.js` file, or a path that doesn't exist at all, is an error — reuse the same "no slide files found" / non-zero exit pattern already used for an empty or missing `slides/` directory, so error handling stays consistent for both modes.

## Risks / Trade-offs

- [A file outside any `slides/` directory silently uses its own folder as the workspace root, so `theme.js` in a sibling directory is not picked up] → Mitigation: this matches today's existing fallback (missing `theme.js` = library defaults), so behavior is predictable and documented in the help text, not a new failure mode.
- [Ambiguity if a user passes a directory named `slides` itself] → Mitigation: `stat` distinguishes file vs. directory; a directory argument always goes through the existing scan path regardless of its name.
