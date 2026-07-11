## 1. src/lib/masters.js — recorder

- [ ] 1.1 Create `src/lib/masters.js` with a private `beginMaster(pptx, name)` that returns a recorder object exposing `addShape(shapeName, opts)` and `addText(text, opts)`, matching the call signatures `prim.js` already uses.
- [ ] 1.2 Implement `addText` capture: pushes `{ text: { text, options: opts } }` onto the recorder's internal list.
- [ ] 1.3 Implement `addShape` capture with the line/rect dispatch: `shapeName === 'line'` → `{ line: opts }`; otherwise → `{ rect: { shape: shapeName, ...opts } }`.
- [ ] 1.4 Implement `endMaster(rec)`: calls `pptx.defineSlideMaster({ title: rec.name, objects: rec.recorded })` exactly once.
- [ ] 1.5 Verify `prim.text`, `prim.roundRect`, `prim.fillRect`, `prim.circle`, `prim.hLine`, `prim.vLine` all run unmodified against the recorder (write a throwaway script or test invoking each and inspecting the captured descriptors).
- [ ] 1.6 Check whether `prim.bullets` (multi-run text array) produces a valid master `text` descriptor; if not, note the limitation in a code comment — do not attempt to special-case it in the recorder.

## 2. src/lib/masters.js — default masters and applyMasters

- [ ] 2.1 Define the default export: an array of `{ name, build(pptx, slide) }` entries. Start with a minimal, real default set (e.g. `CONTENT`, reusing `frame.border`/`frame.slideHeader`/`frame.slideFooter` inside `build`).
- [ ] 2.2 Implement `mergeMastersByName(defaults, overrides)`: override entries replace a same-named default wholesale; entries with new names are appended. Extract this as a shared helper used by both `applyMasters` (full entries) and the name-only merge in `lib.js` (see 3.2).
- [ ] 2.3 Implement and export `applyMasters(pptx, lib, masterOverrides)`: merges via 2.2, then for each merged entry runs `beginMaster` → `build(pptx, rec)` → `endMaster(rec)`.
- [ ] 2.4 Confirm `pptx.defineSlideMaster()` is called exactly once per merged master and only from within `masters.js` (no other module calls it).

## 3. src/lib/lib.js — createLib wiring

- [ ] 3.1 Change `createLib(overrides = {})` to `createLib(themeOverrides = {}, masterOverrides = [])`.
- [ ] 3.2 Import the default master list and `mergeMastersByName` from `masters.js`; compute `lib.masters` as a plain object mapping each merged entry's `name` to itself (names only — no `build` invocation, no `pptx` reference).
- [ ] 3.3 Add `masters` to the returned `lib` object alongside `theme`, `run`, `prim`, `comp`, `tables`, `layout`, `frame`.
- [ ] 3.4 Confirm `createLib()` and `createLib(themeOverrides)` (no second argument) still work and populate `lib.masters` with just the library defaults.

## 4. Orchestrator wiring

- [ ] 4.1 `src/tools/browser/compile.js`: load the workspace's optional `masters.js` the same way `theme.js` is loaded (import, default export, empty array if absent/missing).
- [ ] 4.2 `src/tools/browser/compile.js`: call `createLib(themeOverrides, masterOverrides)`, then after `pptx` is constructed and before the slide loop, call `applyMasters(pptx, lib, masterOverrides)`.
- [ ] 4.3 `bin/forge.js`: same two changes — optional `masters.js` load (try/catch like the existing `theme.js` load) and `applyMasters(pptx, lib, masterOverrides)` call before the slide loop.
- [ ] 4.4 Confirm both orchestrators register masters in the same order and produce identical `pptx.defineSlideMaster()` calls for the same workspace.

## 5. Types

- [ ] 5.1 `lib.d.ts`: add a type for the `{ name, build(pptx, slide) }` master-definition shape.
- [ ] 5.2 `lib.d.ts`: add `masters: Record<string, string>` (or equivalent) to the `Lib` interface.
- [ ] 5.3 `lib.d.ts`: update `createLib`'s declared signature to `createLib(themeOverrides?, masterOverrides?)`.

## 6. Documentation

- [ ] 6.1 `INSTRUCTIONS.md`: update the workspace structure listing to include optional `masters.js`.
- [ ] 6.2 `INSTRUCTIONS.md`: add the `lib.masters` / master-authoring-shape section (mirrors the `slide-authoring-guide` ADDED requirement).
- [ ] 6.3 `INSTRUCTIONS.md`: add guidance encouraging `pptx.addSlide({ masterName: lib.masters.<NAME> })` over manual `frame.*` chrome calls, while noting `frame.*` remains available for one-off chrome.
- [ ] 6.4 Add a worked example (a minimal `masters.js` + a slide file using `masterName`) to `INSTRUCTIONS.md` or `COMPONENTS.md`, wherever the existing worked example lives.

## 7. Verification

- [ ] 7.1 Build a throwaway workspace with no `masters.js` and confirm it compiles using only library default masters.
- [ ] 7.2 Build a throwaway workspace with a `masters.js` that overrides one default master by name and adds one new master; confirm both take effect and every other default master is unaffected.
- [ ] 7.3 Open a generated `.pptx` in PowerPoint (or inspect the underlying `ppt/slideMasters/*.xml`) and confirm the registered masters appear as real, independently editable PowerPoint slide masters.
- [ ] 7.4 Confirm existing workspaces (with no `masters.js`, no `masterName` usage) compile identically to before this change — no regression.
