## Context

`bin/forge.js` today: resolves a workspace directory, dynamically `import()`s `theme.js` and each `slides/*.js` file from disk via `pathToFileURL`, builds a `pptxgen()` instance, calls each slide module's default export as `mod.default(pptx, lib)`, writes the file, then re-opens the output as a zip with `JSZip` to patch `ppt/theme/theme1.xml` scheme colors from `lib.theme.scheme`. `src/lib/lib.js` and its sibling modules (`primitives.js`, `components.js`, `tables.js`, `layout.js`, `frame.js`, `theme.js`) have zero Node dependencies — `createLib(overrides)` is pure JS that only touches the `pptxgen` instance passed to it. `pptxgenjs` ships a browser-ready bundle and its `package.json` `browser` field stubs out Node built-ins for bundlers. `jszip` is browser-native. This makes the existing compile pipeline portable to the browser with no changes to `src/`.

## Goals / Non-Goals

**Goals:**
- Ship one static `pptx-forge.html` file: double-click to open, no server, no install, no network calls at runtime.
- Reproduce the CLI's compile pipeline faithfully: same slide-module contract (`default(pptx, lib)`), same theme-override contract (`theme.js` default export), same layout/theme constants, same `theme1.xml` scheme-color patch.
- Let a user load `theme.js` and any number of slide `.js` files by drag-and-drop or click-to-select, edit them in place, and compile to a downloadable `.pptx`.
- Keep the dependency footprint minimal: `esbuild` as the only new devDependency for this change.

**Non-Goals:**
- Syntax highlighting (deferred — plain `<textarea>` for this change).
- Saving edits back to their original file on disk (no File System Access API); "Save" always downloads a copy.
- Sandboxing or isolating executed slide/theme code (e.g. sandboxed iframe, Worker). Explicitly out of scope per product decision — this is a trusted, single-user local tool.
- Multi-tab editing, drag-to-reorder, bulk workspace/directory loading, or in-browser `.pptx` preview.

## Decisions

**Bundling: esbuild, `--bundle`, browser platform, output inlined into one HTML file.**
`esbuild` bundles `pptxgenjs` + `jszip` + `src/lib/lib.js` + new browser app code into a single JS file. esbuild defaults to honoring a package's `browser` field when targeting the browser platform, so `pptxgenjs`'s Node-built-in stubs apply automatically — no manual aliasing needed. A small Node build script then reads that bundle and inlines it into an HTML shell's `<script>` tag, producing one self-contained `pptx-forge.html` with no external `<script src>` or relative-path ES module imports — so it works when opened directly via `file://`, which plain `<script type="module">` imports would not (browsers block module fetches over `file://`).

**Executing loaded/edited code: `Blob` URL + dynamic `import()`, not `new Function()`.**
Slide files use `export default function(pptx, lib) {...}`; `theme.js` uses `export default {...}`. Both need real ES module parsing to support the `export default` syntax authors already write (matching what `bin/forge.js` does today via `pathToFileURL` + `import()`). `new Function(code)` was considered and rejected — it can't parse `export` statements without the app manually rewriting user code first, which is fragile and would make error messages point at transformed code instead of what the user actually typed. Instead: `URL.createObjectURL(new Blob([code], { type: 'text/javascript' }))` fed into `await import(url)` gives real module semantics, real syntax errors, and no source rewriting.

**No execution sandboxing.**
Per product decision, this tool intentionally shows no security friction: no sandboxed iframe, no Worker isolation, no confirmation prompts before running pasted code. This is acceptable because the tool makes no network calls of its own and is meant to be run locally by the same person who authored (or is reviewing) the content being pasted — there is no multi-tenant or shared-hosting scenario here.

**File model: an in-memory list of `{ name, content }`, `theme.js` pinned and non-deletable.**
Sidebar entries are keyed by filename. `theme.js` always exists, seeded with a placeholder default export, rendered in a muted style whenever its content is byte-identical to that placeholder, and has no delete action. All other entries are user-added `.js` files, sorted by filename for both display and Forge execution order — reproducing the CLI's `readdir(slidesDir).filter(...).sort()` behavior without needing a separate manual-reorder UI. Dropping or selecting a file whose name matches an existing entry replaces that entry's content in place (same sidebar position); a new name appends a new entry. Non-`.js` files are rejected with an inline message and not added.

**Save = download, not write-back.**
"Save" on the active file triggers a normal browser download of its current in-editor content under its current filename (`Blob` + synthetic `<a download>` click). No File System Access API, so behavior is identical across all evergreen browsers with no permission prompts. This is independent of Forge: Forge always compiles the live in-memory content of every loaded file, whether or not that file has been downloaded/saved.

**Forge = reimplementation of `bin/forge.js`'s compile+patch steps, browser-side.**
`theme.js` content is imported and its default export used as `createLib()` overrides. Remaining files are imported in sidebar (filename-sorted) order and each default export is called as `(pptx, lib)`, same as the CLI. The assembled deck is written via `pptx.write({ outputType: 'blob' })` (no disk write), loaded into `JSZip`, `ppt/theme/theme1.xml` is patched with `lib.theme.scheme` using the same regex approach as `bin/forge.js`, and the repackaged zip is offered as a `.pptx` download named from a user-editable output filename field (sanitized to strip path separators). Unlike the CLI, a failure while importing/executing a file is caught and shown as a readable inline error naming the failing file, rather than crashing the whole process.

## Risks / Trade-offs

- **[Risk]** Executing arbitrary pasted/dropped JS with full page privileges → **Mitigation**: accepted by design (see "No execution sandboxing" above); no data or network access beyond what the user's own pasted code would do to itself.
- **[Risk]** Blob-URL dynamic `import()` is the one runtime capability the whole tool depends on → **Mitigation**: supported by all current evergreen browsers (Chrome, Edge, Firefox, Safari); no older-browser compatibility target is intended.
- **[Risk]** Two independent implementations of the same compile/theme-patch logic (`bin/forge.js` for Node, new browser app code) can drift apart over time → **Mitigation**: none automatic in this change; flagged as an open question below rather than solved now, since a shared implementation would need to abstract over Node `fs`/`pathToFileURL` vs. browser `Blob`/`File` inputs, which is more complexity than this change's scope justifies.
- **[Risk]** Inlining `pptxgenjs` (a few hundred KB) plus `jszip` and app code into one HTML file makes for a large-ish single file (roughly 1-2MB) → **Mitigation**: acceptable for a locally-opened, double-click tool; not served over a network per load.

## Migration Plan

None — this is a new, additive, standalone tool. It does not change `bin/forge.js`, `src/`, or any existing workspace on disk, and requires no migration of existing content.

## Open Questions

- Should the `theme.js` placeholder body be the bare `export default {};` or the documented scaffold used in `src/sample/theme.js` (commented-out `scheme`/`color` keys)? Leaning toward the documented scaffold for discoverability, to be settled during implementation.
- Should a syntax error in a pasted/edited file surface the browser's raw `SyntaxError` message, or should it be reworded for a non-technical audience? Left as implementation polish.
- Should `bin/forge.js` and the browser app's compile logic eventually share an implementation to prevent drift? Not pursued in this change; worth revisiting if the CLI's compile step changes meaningfully in the future.
