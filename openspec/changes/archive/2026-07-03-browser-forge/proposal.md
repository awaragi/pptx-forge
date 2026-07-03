## Why

Generating a `.pptx` today requires Node, the CLI, and a local workspace directory on disk. Anyone who just wants to paste or drop a `theme.js` and a handful of slide `.js` files and get a `.pptx` back — without installing anything — has no way to do that. A single self-contained HTML page that runs the existing `src/` rendering library entirely client-side removes that barrier: open the file, load slides, click Forge, get a download.

## What Changes

- New build step (`esbuild`, added as a devDependency) bundles `pptxgenjs`, `jszip`, and the existing `src/lib/lib.js` rendering library together with new browser UI code into a single dependency-free `.js` bundle, which is then inlined into one static `pptx-forge.html` file — openable by double-click, no server required.
- New in-browser UI: a VSCode-style layout with a file sidebar (`theme.js` plus any number of slide `.js` files) and a single active `<textarea>` editor pane that shows whichever file is selected.
- `theme.js` is a permanent, non-removable sidebar entry, pre-populated with `export default {};` and rendered in a muted/gray style whenever its content still matches that placeholder; it turns to normal styling the moment its content differs (by edit or by drop-replace).
- Slide files are added via drag-and-drop, click-to-select, or a "+ new" action. Only `.js` files are accepted. Dropping or selecting a file whose name matches an existing sidebar entry silently replaces that entry's content; a new name adds a new entry. Sidebar order follows filename sort, matching the CLI's `readdir().sort()` discovery order, with `theme.js` pinned separately from the sorted slide list.
- A "Save" action on the active file downloads its current in-editor content as a file with its current name (browser's normal save/download dialog — no File System Access API, no special permissions).
- A "Forge" action compiles every currently loaded file (independent of whether any individual file has been saved/downloaded) using the same logic as `bin/forge.js`: each non-`theme.js` file is executed in sidebar order as a slide module receiving `(pptx, lib)`; `theme.js` is parsed as the theme-override object; the assembled presentation is written to bytes, the `ppt/theme/theme1.xml` scheme colors are patched via JSZip exactly as the CLI does, and the result is offered as a `.pptx` download named from a user-editable output filename field.
- Syntax highlighting is explicitly deferred to a future change; v1 uses a plain styled `<textarea>`.

## Capabilities

### New Capabilities
- `browser-forge`: an in-browser, no-install version of the forge compile pipeline — file loading/editing/replacing, theme.js placeholder handling, and client-side compilation to a downloadable `.pptx` — packaged as a single static HTML file.

### Modified Capabilities
(none — `bin/forge.js` and the `src/` rendering library are reused as-is by the new bundle, not changed)

## Impact

- New source directory (e.g. `src/tools/browser/`) holding the HTML shell and browser-side app code (file/editor state, drag-and-drop handling, compile-and-download logic).
- New devDependency: `esbuild`.
- New npm script (e.g. `build:browser`) that bundles and inlines the app into a single distributable `pptx-forge.html`.
- Reuses `src/lib/lib.js` (and its sibling modules) and `pptxgenjs`/`jszip` unmodified — no changes to `bin/forge.js` or the existing CLI-focused specs.
- Documentation (README/INSTRUCTIONS.md) gains a section describing the browser tool and how to build/open it.
