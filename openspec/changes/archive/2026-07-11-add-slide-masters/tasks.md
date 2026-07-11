## 1. src/lib/masters.js — default factory and merge

- [x] 1.1 Create `src/lib/masters.js` default-exporting a factory function `(theme) => SlideMasterProps[]` that returns exactly one entry: `{ title: 'BLANK', objects: [] }`, ignoring `theme`.
- [x] 1.2 Implement and export `mergeMastersByTitle(defaults, overrides)`, operating on two already-generated plain arrays: an override entry whose `title` matches a default replaces that default entry wholesale; a new `title` is appended. Keep this independent of `theme.js`'s `deepMerge` (which cannot express by-title array merging).
- [x] 1.3 Implement and export `applyMasters(pptx, masterDefinitions)`: takes the already-merged plain array and calls `pptx.defineSlideMaster(entry)` once per entry, unmodified — no `theme` parameter, no factory invocation.
- [x] 1.4 Confirm `pptx.defineSlideMaster()` is called only from `masters.js`, nowhere else in `src/lib/`.

## 2. src/lib/lib.js — createLib wiring

- [x] 2.1 Change `createLib(overrides = {})` to `createLib(themeOverrides = {}, masterOverrides)`, where `masterOverrides` is an optional factory function `(theme) => SlideMasterProps[]`.
- [x] 2.2 After resolving `theme` (existing `deepMerge`/`resolveThemeColors` logic), import the default master factory from `masters.js`, call it with `theme`, call `masterOverrides` with `theme` if provided (else treat as `[]`), and merge the two results via `mergeMastersByTitle` — exactly once.
- [x] 2.3 Add `masters` (array of merged titles) and `masterDefinitions` (the merged plain array) to the returned `lib` object, alongside `theme`, `run`, `prim`, `comp`, `tables`, `layout`, `frame`.
- [x] 2.4 Confirm `createLib()` and `createLib(themeOverrides)` (no second argument) still work, populating `lib.masters` as `['BLANK']` and `lib.masterDefinitions` as `[{ title: 'BLANK', objects: [] }]`.

## 3. Orchestrator wiring

- [x] 3.1 `src/tools/browser/compile.js`: `compileDeck({ theme, masters, slides, outputName })` gains a `masters` parameter (`{ name, content }`, same shape as the existing `theme` parameter) — import its module, default export is the factory function itself (not pre-called), `() => []` if absent/missing.
- [x] 3.2 `src/tools/browser/compile.js`: call `createLib(themeOverrides, masterOverridesFn)`, then after `pptx` is constructed and before the slide loop, call `applyMasters(pptx, lib.masterDefinitions)` — reusing what `createLib` already generated, not recalling any factory.
- [x] 3.3 `bin/forge.js`: same two changes — optional `masters.js` load (try/catch like the existing `theme.js` load) and `applyMasters(pptx, lib.masterDefinitions)` call before the slide loop.
- [x] 3.4 Confirm both orchestrators register masters in the same order and produce identical `pptx.defineSlideMaster()` calls for the same workspace.

## 4. Scaffolding

- [x] 4.1 Create `src/sample/masters.js`: a default-exported factory function with a commented-out example `SlideMasterProps` entry referencing at least one `theme` value (e.g. a border rect reading `theme.shape.frame.borderColor`), mirroring `src/sample/theme.js`'s existing style and header comment.
- [x] 4.2 `bin/create.js`: copy `src/sample/masters.js` to `workspaces/<name>/masters.js`, alongside the existing `theme.js` and `slides/deck.js` copies.

## 5. Types

- [x] 5.1 `lib.d.ts`: add/confirm a type for `SlideMasterProps` (or import pptxgenjs's own type) and for the factory function shape `(theme: Theme) => SlideMasterProps[]`.
- [x] 5.2 `lib.d.ts`: add `masters: string[]` and `masterDefinitions: SlideMasterProps[]` to the `Lib` interface.
- [x] 5.3 `lib.d.ts`: update `createLib`'s declared signature to `createLib(themeOverrides?, masterOverrides?: (theme: Theme) => SlideMasterProps[])`.

## 6. Browser tool parity (masters.js treated exactly like theme.js)

- [x] 6.1 `scripts/build-browser.js`: read `src/sample/masters.js` into a `mastersPlaceholder` constant, mirroring the existing `themePlaceholder` read from `src/sample/theme.js`; inline it into the built `pptx-forge.html`.
- [x] 6.2 `src/tools/browser/app.js`: add a permanent, non-deletable `masters.js` sidebar entry pre-populated from `mastersPlaceholder`, muted while content matches the placeholder, normal styling once edited — same code path as `theme.js`'s existing entry.
- [x] 6.3 `src/tools/browser/app.js`: exclude `theme.js` and `masters.js` from the alphabetical slide-file sort (both stay in fixed pinned sidebar positions).
- [x] 6.4 `src/tools/browser/app.js`: when the active file is `masters.js`, hide Discard/Rename and show Reset in Discard's position (same branch as `theme.js`); Reset replaces content with `mastersPlaceholder` and restores muted styling.
- [x] 6.5 `src/tools/browser/app.js`: reject renaming any slide file to `masters.js` (alongside the existing `theme.js` collision check); reject dropping/selecting a non-`.js` file named `masters.js` the same way `theme.js` already is handled — dropping a file named `masters.js` replaces that entry's content in place.
- [x] 6.6 `src/tools/browser/app.js`: wire Forge to pass the `masters.js` entry's content into `compileDeck`'s new `masters` parameter (task 3.1), alongside the existing `theme` parameter.
- [x] 6.7 `src/tools/browser/app.js`: exclude `masters.js` from the Move/Copy transfer picker, same as `theme.js`.
- [x] 6.8 `src/tools/browser/app.js`/`storage.js`: include `masters.js` content in the per-workspace `localStorage` autosave/restore payload, and in the default blank-workspace state (placeholder `theme.js` + placeholder `masters.js`, no slides) used for first-load and New Workspace.
- [x] 6.9 `src/tools/browser/compile.js` (`exportWorkspaceZip`/`readWorkspaceZip`): include `masters.js` at the zip root alongside `theme.js`, on both export and import; on merge-import, replace the existing `masters.js` only if the archive includes one.

## 7. Documentation

- [x] 7.1 `INSTRUCTIONS.md`: update the workspace structure listing to include `masters.js`.
- [x] 7.2 `INSTRUCTIONS.md`: add the `lib.masters` / factory-function shape section — no reference to `prim`/`comp`/`layout`/`frame`/`tables`. Explain the factory runs once per compile, not per slide, and must be pure.
- [x] 7.3 `INSTRUCTIONS.md`: show theme-constant usage explicitly (colors via `theme.shape.*`, geometry via `theme.grid.*`, text via `theme.header`/`theme.footer`) instead of hardcoded literals.
- [x] 7.4 `INSTRUCTIONS.md`: document the raw pptxgenjs object shapes needed inside `objects` (`{ rect: { shape, ... } }` vs `{ line: {...} }` vs `{ text: { text, options } }`), including the line-vs-rect key distinction.
- [x] 7.5 `INSTRUCTIONS.md`: add guidance encouraging `pptx.addSlide({ masterName: '<title>' })` (a literal string) as the default way to start a slide when masters beyond `BLANK` are defined — self-contained, no comparison to `frame.*`, explicit that `lib.masters` is for discovery only.
- [x] 7.6 `INSTRUCTIONS.md`: add a complete worked example — a minimal `masters.js` factory (one custom master using a theme constant) plus a slide file using `masterName`.
- [x] 7.7 `COMPONENTS.md`: update the `lib.frame` section to note `frame.*` is a manual, one-off alternative to a dedicated master.
- [x] 7.8 `COMPONENTS.md`/`INSTRUCTIONS.md`: document that `tables`/`addTable`-shaped content cannot be used inside a master — a hard pptxgenjs limitation (no `table` variant exists), not a planned future capability. Note, alongside the placeholder disclosure, that images/charts (`{ image: ... }`/`{ chart: ... }`) are technically supported but intentionally undocumented — not the same hard limitation as tables.

## 8. Verification

- [x] 8.1 Build a throwaway workspace with no `masters.js` and confirm it compiles using only the `BLANK` default master.
- [x] 8.2 Build a throwaway workspace with a `masters.js` factory that overrides `BLANK` and adds one new master (referencing a `theme` value); confirm both take effect and the value matches the resolved theme.
- [x] 8.3 Run `node bin/create.js` for a fresh workspace and confirm `masters.js` is scaffolded byte-identical to `src/sample/masters.js`.
- [x] 8.4 Open a generated `.pptx` in PowerPoint (or inspect `ppt/slideMasters/*.xml`) and confirm registered masters appear as real, independently editable PowerPoint slide masters.
- [x] 8.5 Confirm each master factory function is called exactly once per compile (e.g. via a call-count spy in a throwaway test), not once per slide or per `applyMasters` invocation.
- [x] 8.6 Confirm existing workspaces (no `masters.js`, no `masterName` usage) compile identically to before this change — no regression.
- [x] 8.7 In `pptx-forge.html`: confirm `masters.js` behaves identically to `theme.js` for every mirrored behavior — permanence, muting, Reset, sort exclusion, rename/discard/transfer exclusion, zip export/import, and `localStorage` persistence across reload.
