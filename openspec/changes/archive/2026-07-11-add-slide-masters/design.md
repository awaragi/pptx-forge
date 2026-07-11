## Context

`src/lib/` is a pure factory: `createLib(overrides)` takes theme data and returns namespace groups of functions (`prim`, `comp`, `tables`, `layout`, `frame`) that draw into a `slide` object a caller already obtained from `pptx.addSlide()`. No module in `src/lib/` touches a live `pptxgenjs` instance directly — the two orchestrators (`bin/forge.js` for the CLI, `src/tools/browser/compile.js` for the browser tool) own the `pptx` object's lifecycle.

A regular slide and a pptxgenjs master are structurally different, and that difference shaped this design:

```
REGULAR SLIDE                              MASTER SLIDE
pptx.addSlide()                            pptx.defineSlideMaster({
  → live object, call methods on it           title, background, objects, slideNumber
    as many times as you want:              })
    slide.addText(...)                        → ONE call. `objects` must already be a
    slide.addShape(...)                         complete array of plain descriptors —
                                                 there is no live handle to keep
                                                 drawing into afterward.
```

`SlideMasterProps` (`{ title, background?, objects?, slideNumber?, margin? }`) is plain data — `title` is the one mandatory field, matching what pptxgenjs itself requires. This design went through three iterations before landing here:
1. A private "recording slide" shim capturing imperative draw calls (`prim.text(slide, ...)`) into the descriptor array — dropped in favor of authoring plain descriptors directly.
2. Each master as `{ title, define(theme) }` — a per-entry wrapper function — dropped in favor of a single top-level factory.
3. A fully static array of plain `SlideMasterProps` objects, no function at all — dropped because master content genuinely needs `theme` (colors, radius, grid coordinates) to stay consistent with workspace theme overrides, and a static literal has no way to reference a value that isn't known until `theme.js`'s overrides are resolved.

The design that survives: `masters.js`'s default export (and any workspace `masters.js`) is a single **factory function**, `(theme) => SlideMasterProps[]`, called exactly once per compile — at `createLib` time, when `theme` is already fully resolved. Everything downstream (merging by `title`, registering on `pptx`) works with the resulting plain array and never touches the factory function again. `frame.js`'s existing per-slide chrome pattern is out of scope for replacement — it stays as-is.

## Goals / Non-Goals

**Goals:**
- `masters` becomes a first-class `lib` capability, not folded into `components.js`.
- Master content can reference `theme` (colors, sizes, grid, header/footer text) so workspace theme overrides cascade automatically — via a factory function, not a wrapper-per-entry or a static array.
- The factory function runs exactly once per compile, producing a plain `SlideMasterProps[]` that every downstream consumer (`lib.masters`, `applyMasters`) reuses without recomputation.
- The library ships exactly one trivial default master (`{ title: 'BLANK', objects: [] }`) — proof that registration/merge/`addSlide({ masterName })` wiring works, not an opinionated chrome implementation.
- A new scaffolding file, `src/sample/masters.js`, copied by `bin/create.js` into every new workspace (mirroring `src/sample/theme.js`), gives authors a discoverable, inert starting example.
- Workspaces can define their own masters (`workspaces/<slug>/masters.js`, optional) that add new masters or override library defaults by `title`, using the same by-title merge rule the library default goes through.
- `lib.masters` is a plain array of every registered title (e.g. `['BLANK']`), for discovery — slide files pass a title string directly to `masterName`.
- Zero changes required to `frame.js`, `primitives.js`, `components.js`, `tables.js`, `layout.js`, `theme.js`.

**Non-Goals:**
- Documenting or encouraging placeholder objects (`{ placeholder: {...} }`). They're technically supported — nothing filters them out, since a master factory's return value passes straight through to `pptx.defineSlideMaster()` unmodified — but they're PowerPoint-editable regions meant for a human to fill in after export, which doesn't fit this library's generate-once model, so `INSTRUCTIONS.md`/`COMPONENTS.md` simply don't teach them.
- Replacing or migrating `frame.js`'s existing per-slide chrome pattern.
- Any reuse of `prim`/`comp`/`layout`/`tables` inside a master's factory function. Masters are plain pptxgenjs object literals parameterized only by `theme`; there is no shim translating library-function calls into descriptors.
- `tables.dataTable`/`comparisonTable`, and any `addTable`-shaped object, inside a master. pptxgenjs's `SlideMasterProps.objects` union has no `table` variant at all — this is the one genuinely unrepresentable case. (Images and charts *are* representable, via raw `{ image: ... }`/`{ chart: ... }` descriptors passed straight through — same undocumented-but-supported status as placeholders, see Requirement "Placeholders are supported by pptxgenjs but undocumented and unadvertised".)
- Deep-merging individual objects inside a master's `objects` list. Overrides replace a same-titled master wholesale.
- Folding master definitions into `theme.js`'s `defaultTheme` (see Decision 2).
- Calling the master factory function more than once per compile, or at any point after `pptx` exists. `applyMasters` only ever consumes the already-generated plain array.

## Decisions

### 1. Masters are generated once from a theme-taking factory function
`src/lib/masters.js`'s default export, and any workspace `masters.js`'s default export, is:

```js
export default function(theme) {
  return [
    { title: 'BLANK', objects: [] },
    // { title: 'CONTENT', objects: [
    //   { rect: { shape: 'roundRect', x: 0.12, y: 0.12, w: 13.09, h: 7.26,
    //             line: { color: theme.shape.frame.borderColor, width: theme.shape.borderW } } },
    //   { text: { text: theme.header.wordmark, options: { x: theme.grid.marginX, y: 0.42, w: 5.5, h: 0.25 } } },
    // ] },
  ];
}
```

An author must still know pptxgenjs's own quirks directly (e.g. `{ line: {...} }` vs `{ rect: { shape: 'roundRect', ... } }`) — there's no `prim` layer hiding that. But colors/geometry/text now read from `theme`, so a workspace's `theme.js` override cascades into its `masters.js` automatically, the same way it cascades into everything else.

### 2. `masters.js` stays a separate module — not folded into `theme.js`
`theme.js`'s `deepMerge` treats arrays as opaque values to be fully replaced, not merged:

```js
const isPlain = v => v && typeof v === 'object' && !Array.isArray(v);
result[key] = (isPlain(overrides[key]) && isPlain(defaults[key]))
  ? deepMerge(defaults[key], overrides[key])
  : overrides[key];   // ← arrays hit this branch: wholesale replacement
```

If master definitions lived inside `defaultTheme`, any workspace `theme.js` override touching that key at all would silently wipe out every other default master — not the by-title merge (override-replaces-matching-title, new-titles-appended) this change requires. `masters.js` stays separate, with its own `mergeMastersByTitle`, operating on the plain arrays the factory functions produce.

### 3. Generation happens exactly once, inside createLib — merge and apply never re-invoke the factory
`createLib(themeOverrides, masterOverrides)` resolves `theme` (as it already does today), then:
1. Calls the library default factory with that `theme` → `defaults` (plain array).
2. Calls `masterOverrides` (the workspace factory, if provided) with the same `theme` → `overrides` (plain array).
3. `mergeMastersByTitle(defaults, overrides)` → `masterDefinitions` (plain array) — computed once.
4. Returns `lib.masters = masterDefinitions.map(m => m.title)` and `lib.masterDefinitions = masterDefinitions`.

The orchestrator, once `pptx` exists, calls `applyMasters(pptx, lib.masterDefinitions)` — reusing that same array. `applyMasters` and `mergeMastersByTitle` therefore never see `theme` or a factory function, only plain data; they're exactly as simple as the fully-static design would have been, with generation happening at the one point (`createLib`) where `theme` is naturally already available.

### 4. `masters.js` calls `pptx.defineSlideMaster()` directly — not the orchestrator
The theme XML patch (`ppt/theme/theme1.xml`) is genuinely duplicated between `compile.js` and `forge.js` today, but that's *forced*: one patches an in-memory arraybuffer, the other re-reads a written file from disk. `pptx.defineSlideMaster()` has no such constraint — it's a plain synchronous method on the same `pptx` object both orchestrators already hold. So `applyMasters(pptx, masterDefinitions)` owns the actual registration call, and both orchestrators get it via one identical line.

### 5. The shipped default is a single, empty master — not chrome
`src/lib/masters.js`'s factory returns exactly one entry: `{ title: 'BLANK', objects: [] }`, regardless of `theme` (it doesn't reference `theme` at all, though the signature accepts it for consistency with the workspace factory shape). This is deliberately not a port of `frame.js`'s border/header/footer into master form — that stays out of scope. The single empty default exists purely to prove the wiring works end-to-end.

### 6. `src/sample/masters.js` scaffolding file, copied by `bin/create.js`
Mirrors `src/sample/theme.js`'s existing convention exactly: a commented-out example (not live configuration) copied byte-identical into every new workspace. It demonstrates the factory-function shape and theme-constant usage, since the shipped default deliberately doesn't.

### 7. `lib.masters` is an array, not a name-keyed map
Since `title` already *is* the value a slide file passes to `masterName`, there's no separate identifier to look up through a map. `pptx.addSlide({ masterName: 'CONTENT' })` uses the title directly, as a plain string. `lib.masters` (`['BLANK', 'CONTENT', ...]`) exists purely for discovery.

### 8. The browser tool treats masters.js exactly like theme.js — same mechanism, not a parallel one
`pptx-forge.html` already has a full, working pattern for "a workspace-root file that isn't a slide": `theme.js` is a permanent sidebar entry, pre-populated from a placeholder sourced at build time from `src/sample/theme.js` (`scripts/build-browser.js` reads it into a `themePlaceholder` constant baked into the bundle), muted in the sidebar while unedited, excluded from the alphabetical slide sort, and swaps Discard/Rename for a Reset action. `masters.js` is the same kind of file — workspace-root, optional, not a slide — so it gets the identical treatment rather than a bespoke one: `build-browser.js` gains a matching `mastersPlaceholder` sourced from the new `src/sample/masters.js`, and every place `app.js` special-cases `theme.js` (sidebar permanence/muting, sort exclusion, toolbar Reset-instead-of-Discard/Rename, zip export/import, `localStorage` persistence, Move/Copy exclusion) gains the equivalent branch for `masters.js`. `Forge`'s compile step passes `masters.js`'s default export (the factory function) to `createLib` as `masterOverrides`, exactly as `theme.js`'s default export is already passed as `themeOverrides` — it is never executed as a slide module.

## Risks / Trade-offs

- **Authors must know pptxgenjs's raw master object shapes directly**, including the line-vs-rect key split and per-object option shapes.
  → Mitigation: `INSTRUCTIONS.md` includes a complete worked example.
- **Multi-run rich text is not possible in a master `text` object.** pptxgenjs's `TextProps.text` (used inside master `objects`) is typed as a plain `string`.
  → Mitigation: document as a hard limitation.
- **Silent override on title collision.** If a workspace's `masters.js` factory returns a master whose `title` typo'd-matches a default (or returns two same-titled entries), the last one wins with no warning — same risk profile as `theme.js`'s existing deep-merge overrides.
  → Mitigation: none planned for v1; acceptable given the existing precedent.
- **Raw string `masterName` references have no typo-safety.** `lib.masters` is an array (for discovery), not a dot-accessible map, so a slide file's `masterName: 'CONTENT'` is a bare string with no compile-time check.
  → Mitigation: accepted trade-off — matches pptxgenjs's own convention.
- **The factory function must genuinely be idempotent and side-effect-free**, since callers assume calling it once and reusing the result is safe. If a workspace author's factory relied on mutable module-level state or non-deterministic values, `lib.masters`/`lib.masterDefinitions` and the actual `pptx.defineSlideMaster()` calls could theoretically diverge if the factory were ever called more than once.
  → Mitigation: document that `masters.js` factories must be pure functions of `theme`; the implementation itself only ever calls each factory once per compile, so this is a documentation concern, not a runtime enforcement need.

## Migration Plan

Purely additive — no existing workspace, slide file, or theme override is affected (no workspace has a `masters.js` today, no slide file references `masterName`). Implementation order:
1. `src/lib/masters.js` — default master factory (`(theme) => [{ title: 'BLANK', objects: [] }]`), `mergeMastersByTitle`, `applyMasters`.
2. `src/lib/lib.js` — `createLib` second parameter (`masterOverrides` factory), resolve `theme` → call both factories once → merge → expose `lib.masters`/`lib.masterDefinitions`.
3. `bin/forge.js` and `src/tools/browser/compile.js` — load optional workspace `masters.js` (the factory function itself, not pre-called), pass it into `createLib`, then call `applyMasters(pptx, lib.masterDefinitions)` before the slide loop.
4. `src/sample/masters.js` — scaffolding template; `bin/create.js` copies it alongside `theme.js`/`slides/deck.js`.
5. `lib.d.ts` — types for the factory shape, `lib.masters`, `lib.masterDefinitions`.
6. `INSTRUCTIONS.md`/`COMPONENTS.md` — document the workspace file, the factory shape, theme-constant usage, the encouraged `addSlide({ masterName })` pattern, and the `frame.*`-as-manual-alternative note.
7. Browser tool parity: `scripts/build-browser.js` (embed `mastersPlaceholder`), `src/tools/browser/compile.js` (`compileDeck()` gains a `masters` parameter, passed to `createLib`/`applyMasters`), `src/tools/browser/app.js`/`index.html` (permanent sidebar entry, muting, sort exclusion, toolbar Reset, zip export/import, persistence, Move/Copy exclusion — each mirroring the existing `theme.js` code path).

No rollback complexity — reverting is deleting the new files and the new call sites (library-side and browser-tool-side alike).

## Open Questions

None outstanding.
