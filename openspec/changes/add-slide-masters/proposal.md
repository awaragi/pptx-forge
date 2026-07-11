## Why

pptxgenjs supports real PowerPoint slide masters (`pptx.defineSlideMaster()` / `pptx.addSlide({ masterName })`), but nothing in `src/lib/` exposes them today — every slide instead redraws its own chrome (border, header, footer) by hand via `frame.js`, called from every slide file. Masters are core PowerPoint functionality, not an optional add-on, and slide authors currently have no way to select between different chrome/background treatments per slide (e.g. a title slide vs. a content slide) without duplicating draw calls. This change adds masters as a first-class `lib` capability, on par with `prim`/`comp`/`layout`/`frame`, and makes workspaces able to define their own master variants the same way they already override `theme.js`.

## What Changes

- Add `src/lib/masters.js`: a new sibling module (same tier as `frame.js`, `layout.js`) exporting:
  - a default list of named masters, each `{ name, build(pptx, slide) }` — `build` is authored exactly like a slide file's default export, calling the same `prim`/`frame`/`comp` functions against `slide`.
  - a private recorder (`beginMaster`/`endMaster`) that hands `build()` a slide-like object whose `addShape`/`addText` calls are captured into pptxgenjs's `SlideMasterProps.objects` descriptor format instead of rendering immediately, then flushes them via the one real `pptx.defineSlideMaster()` call. This is internal to `masters.js`, not exposed on `lib`.
  - `applyMasters(pptx, lib, masterOverrides)` — merges the default master list with workspace-supplied overrides by `name` (an override with a matching name replaces the default wholesale; new names are appended), then runs the recorder for each and registers it on `pptx`.
- `createLib(themeOverrides, masterOverrides)` gains a second, optional parameter. It merges master *names* (not build functions — no `pptx` exists at this point) into a new `lib.masters` object of name constants (e.g. `lib.masters.CONTENT === 'CONTENT'`), so slide files reference `pptx.addSlide({ masterName: lib.masters.CONTENT })` instead of a raw string.
- `bin/forge.js` and `src/tools/browser/compile.js` (the two orchestrators) each gain one new step: after `pptx` is constructed and before the slide-loop runs, load the workspace's optional `masters.js` (mirroring how `theme.js` is already optionally loaded) and call `applyMasters(pptx, lib, masterOverrides)`.
- Workspaces may add an optional `workspaces/<slug>/masters.js`, exporting a default list in the same `{ name, build(pptx, slide) }` shape as the library defaults, to add new masters or override existing ones by name. Unlike `theme.js`, this file is not required and workspaces without one simply get the library's default masters.
- `INSTRUCTIONS.md` documents the `masters.js` workspace file, the `{ name, build(pptx, slide) }` authoring shape, and `pptx.addSlide({ masterName: lib.masters.X })` as the encouraged default for `addSlide` calls (over the bare `pptx.addSlide()` + manual `frame.border`/`slideHeader`/`slideFooter` chrome pattern, which remains available for one-off custom chrome).
- No placeholder (`{ placeholder: ... }`) support — out of scope. Placeholders are PowerPoint-editable regions meant for a human editing the deck afterward, not for content the slide-generation pipeline itself fills in, so they don't fit this library's generate-once model.

## Capabilities

### New Capabilities
- `lib-slide-masters`: `src/lib/masters.js` — default masters, the recorder mechanism, `applyMasters`, and the workspace override/merge-by-name contract.

### Modified Capabilities
- `lib-api-contract`: `createLib` signature changes from `createLib(overrides)` to `createLib(themeOverrides, masterOverrides)`, and the returned object gains a fifth namespace-like member, `masters` (name constants, not functions — distinct in kind from `prim`/`comp`/`layout`/`frame`).
- `lib-module-split`: the enumerated `src/lib/` file list gains `masters.js`.
- `slide-authoring-guide`: `INSTRUCTIONS.md` must document the workspace `masters.js` file, the master-authoring function shape, and `addSlide({ masterName: lib.masters.X })` as the encouraged pattern.

## Impact

- New file: `src/lib/masters.js`.
- Modified: `src/lib/lib.js` (`createLib` signature + wiring), `bin/forge.js`, `src/tools/browser/compile.js` (both orchestrators gain an `applyMasters` call and optional `masters.js` loading), `INSTRUCTIONS.md`, `lib.d.ts` (new types for `lib.masters` and the master-authoring shape).
- No changes to `frame.js`, `primitives.js`, `components.js`, `tables.js`, `layout.js` — all reused unmodified by the recorder.
- No breaking change to existing workspaces: `masters.js` is optional, and slide files that never reference `masterName` are unaffected.
