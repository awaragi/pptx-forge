## Context

`pptx-forge.html` is a single self-contained page (built by `scripts/build-browser.js` from `src/tools/browser/app.js` + `index.html`) meant to be opened via `file://` with no server. State today lives entirely in `src/tools/browser/app.js`'s in-memory `state` object (`theme`, a `Map` of slides, `active`) — a reload or closed tab loses everything. The CSS in `index.html` hardcodes `color-scheme: dark`. There is no build-time bundling of any docs, and `.github/workflows/release.yml` only ever runs `git archive` against source — it never invokes `npm run build:browser`, so `pptx-forge.html` (which is gitignored) is never produced or attached to a release.

## Goals / Non-Goals

**Goals:**
- Survive an accidental reload without losing work, using storage that behaves predictably under `file://`.
- Lay a storage key structure that can grow into multi-project switching later, without building that UI now.
- Make GitHub Releases produce a directly-usable `pptx-forge.html`.
- Keep every addition consistent with the existing "no network, no server, works from `file://`" constraint.

**Non-Goals:**
- A project switcher UI (listing/switching between saved workspaces) — only the storage key shape is provisioned.
- Persistence across closed tabs/browser restarts — `sessionStorage` is scoped to the tab's lifetime by design (see Decisions).
- A hand-maintained `CHANGELOG.md` — release notes stay auto-generated via `gh release create --generate-notes`.
- A manual light/dark toggle — only OS-preference auto-detection.

## Decisions

### sessionStorage over localStorage, keyed per project
Store all workspace state under `sessionStorage`, not `localStorage`. `localStorage` under `file://` is inconsistent across browsers (some partition per path, some block it outright in hardened configs) and persists indefinitely, which risks stale/orphaned projects accumulating silently across sessions. `sessionStorage` is scoped to the tab and cleared when it closes — simpler failure mode ("reload works, closing the tab doesn't"), and it's the behavior the user explicitly chose over durability.

Schema:
```
sessionStorage["pptx-forge.workspaces"] = JSON.stringify({
  "<output-name>": { "theme.js": "<content>", "<slide-name>.js": "<content>", ... },
  ...
})
sessionStorage["pptx-forge.activeWorkspace"] = "<output-name>"
```
The project key is the output filename (`el.outputFilename.value`, defaults to `"deck"`). No project-switcher UI reads the `workspaces` map today — only the entry matching `activeWorkspace` is ever loaded — but the map shape means a future switcher only needs a listing UI, not a storage migration.

**Alternative considered**: a single flat `sessionStorage["pptx-forge.state"]` key with no project concept. Rejected because the user explicitly asked to provision for multi-project now to avoid a storage migration later.

### Autosave on every change, no explicit save action
Every mutation that already calls `render()` or updates `entry.content` (edits, add/rename/discard slide, theme edits) also writes the current project's entry into `sessionStorage["pptx-forge.workspaces"]`. No debounce — writes are synchronous `JSON.stringify` of typically-small text content, cheap enough per keystroke for this tool's scale (a handful of slide files, each a few KB of source).

### Rename creates a new workspace entry; a separate pointer tracks "active"
Because the project key is the output filename and that field is freely editable, renaming output mid-session must not silently discard the workspace that was saved under the old name. Renaming `"deck"` → `"pres-2"` copies current state into a new `workspaces["pres-2"]` entry, updates `activeWorkspace` to `"pres-2"`, and **leaves `workspaces["deck"]` in place** untouched (a snapshot as of the rename). This is deliberately not a `mv` — it's a cheap way to accumulate project history without any explicit "save as" UI, at the cost of `sessionStorage` slowly growing with abandoned entries over a long session (acceptable: `sessionStorage` is tab-scoped and typically capped at several MB, and entries are small).

### Load: silent auto-restore, warn-once on storage failure
On page load, if `activeWorkspace` resolves to an existing `workspaces` entry, it replaces the default (placeholder-only) initial state with no prompt and no status message — reload should feel like nothing happened. If any `sessionStorage` read/write throws (quota exceeded, storage blocked under some `file://` configurations, private browsing), catch it, show a single status-bar message on the *first* failure (e.g. "Session persistence unavailable — changes won't survive a reload"), and suppress the message on subsequent failures so it doesn't spam the status bar on every keystroke. The tool continues to function exactly as it does today (in-memory only) when storage is unavailable.

### AI reference: build-time inlining + clipboard-with-fallback
`scripts/build-browser.js` already does a single marker-replace (`/*__APP_BUNDLE__*/`) to inline the esbuild output into `index.html`. Extend the same approach: read `INSTRUCTIONS.md` and `lib.d.ts` at build time, JSON-stringify their concatenated text, and inject it as a constant the app bundle can reference (either a second marker in `index.html`, or — simpler — pass it into the esbuild entry via `define`/a generated virtual module consumed by `app.js`). The AI button handler tries `navigator.clipboard.writeText(text)` first; if it throws or the API is absent (both realistic under `file://`, where "secure context" rules vary by browser), it falls back to showing a `<textarea readonly>` populated with the same text, pre-selected, so the user can copy manually.

**Alternative considered**: always show the textarea (skip the Clipboard API attempt entirely) for consistency. Rejected — the user chose try-then-fallback, keeping the one-click path for the common case where it works.

### release.yml: build and attach the browser bundle as an additional asset
Add `actions/setup-node`, `npm ci`, and `npm run build:browser` steps before the archive step, then attach `pptx-forge-<tag>.html` via the same `gh release create` invocation (or a follow-up `gh release upload`) alongside the existing `pptx-forge-<tag>.zip`. Both assets ship on every tagged release — the zip serves CLI/source users, the `.html` serves browser-only users who want to double-click and go.

## Risks / Trade-offs

- **`sessionStorage` availability under `file://` is not guaranteed on every browser/config** → mitigated by the warn-once-then-degrade-silently behavior; the tool never becomes unusable, only non-persistent.
- **Renamed-workspace entries accumulate in `sessionStorage` for the life of the tab** → acceptable given tab-scoped storage and small per-entry size; revisit if a project-switcher UI is later built (it would want a way to prune these).
- **Clipboard API behavior under `file://` varies by browser** → mitigated by the textarea fallback; both paths are exercised in manual testing before ship.
- **Autosave writes on every keystroke** → negligible cost at this tool's scale (small text files, synchronous `sessionStorage` writes), but worth reconsidering if slide files grow much larger.

## Open Questions

None outstanding — all decisions above were confirmed during exploration.
