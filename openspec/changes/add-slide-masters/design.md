## Context

`src/lib/` is a pure factory: `createLib(overrides)` takes theme data and returns namespace groups of functions (`prim`, `comp`, `tables`, `layout`, `frame`) that draw into a `slide` object a caller already obtained from `pptx.addSlide()`. No module in `src/lib/` touches a live `pptxgenjs` instance directly — the two orchestrators (`bin/forge.js` for the CLI, `src/tools/browser/compile.js` for the browser tool) own the `pptx` object's lifecycle (`new pptxgen()`, `pptx.layout`, `pptx.theme`, the slide-file loop, `pptx.write()`).

`frame.js` already hand-draws what amounts to master-slide chrome (`border`, `slideHeader`, `slideFooter`), called from every slide file via a local `addChrome()` helper. That pattern is staying as-is (confirmed out of scope for replacement) — this change adds real pptxgenjs masters (`pptx.defineSlideMaster()` / `pptx.addSlide({ masterName })`) as an additional, separate capability.

pptxgenjs's `SlideMasterProps.objects` array takes plain descriptor objects (`{ rect: ShapeProps }`, `{ text: TextProps }`, `{ line: ShapeProps }`, `{ image: ImageProps }`, `{ placeholder: {...} }`) built entirely upfront in one `defineSlideMaster()` call — there is no incremental "master slide" handle to draw into the way `pptx.addSlide()` returns a mutable `slide`. This is the core mismatch this design has to bridge: master authors want to write `build(pptx, slide)` functions that call `lib.prim.text(slide, ...)` exactly like a normal slide body, but the underlying pptxgenjs API is fully declarative and upfront.

## Goals / Non-Goals

**Goals:**
- `masters` becomes a first-class `lib` capability (`lib.masters`), same conceptual tier as `prim`/`comp`/`layout`/`frame`, not folded into `components.js`.
- Master-authoring functions are written exactly like slide-authoring functions: `build(pptx, slide)`, calling existing `prim`/`frame`/`comp` functions against `slide` unmodified.
- Workspaces can define their own masters (`workspaces/<slug>/masters.js`, optional) that add new masters or override library defaults by name, mirroring the existing `theme.js` override pattern without pretending master `objects` arrays deep-merge the way theme hex leaves do.
- `lib.masters.<NAME>` name constants exist so slide authors reference `pptx.addSlide({ masterName: lib.masters.CONTENT })` instead of a raw string.
- Zero changes required to `frame.js`, `primitives.js`, `components.js`, `tables.js`, `layout.js` — all reused unmodified.

**Non-Goals:**
- Placeholder objects (`{ placeholder: {...} }`). These are PowerPoint-editable regions meant for a human to fill in after export; this library generates fully-authored decks in one pass, so there's no "remaining slide content" a placeholder would serve — anything an AI/author puts there is only usable by a subsequent human editor, not by the generation pipeline itself.
- Replacing or migrating `frame.js`'s existing per-slide chrome pattern.
- Deep-merging individual objects inside a master's shape list. Overrides replace a same-named master wholesale.
- `chart`/`image` master objects — no existing `prim` function produces these, so the recorder doesn't need to support them yet (see Open Questions).

## Decisions

### 1. The recorder is a private implementation detail of `masters.js`
`beginMaster(pptx, name)` returns a slide-like object exposing `addShape(shapeName, opts)` / `addText(text, opts)` with the exact same call signatures `prim.js` already uses — but instead of mutating a real slide, each call pushes a descriptor onto an internal array. `endMaster(rec)` takes that array plus the master's `name` and makes the single real `pptx.defineSlideMaster({ title: name, objects })` call.

This stays private to `masters.js` rather than becoming a general `lib` capability. Nothing else in the codebase needs a "recording slide" — exposing it broadly would be speculative surface area for a need that doesn't exist yet.

**`addShape` dispatch nuance:** `SlideMasterProps.objects` has *separate* `line` and `rect` keys (unlike a real slide, where `slide.addShape('line', opts)` and `slide.addShape('roundRect', opts)` are both just `addShape` calls with a different `shapeName` string). The recorder's `addShape` must special-case this: `shapeName === 'line'` → `{ line: opts }`; anything else (`rect`, `roundRect`, `ellipse`, ...) → `{ rect: { shape: shapeName, ...opts } }`, using `ShapeProps.shape` to carry the geometry. This is exactly what lets `prim.roundRect`/`prim.circle`/`prim.hLine`/`prim.vLine` all port through unmodified.

### 2. `masters.js` calls `pptx.defineSlideMaster()` directly — not the orchestrator
The theme XML patch (`ppt/theme/theme1.xml`) is genuinely duplicated between `compile.js` and `forge.js` today, but that's *forced*: one patches an in-memory arraybuffer, the other re-reads a written file from disk — there's no shared call either could make. `pptx.defineSlideMaster()` has no such constraint; it's a plain synchronous method on the same `pptx` object both orchestrators already hold, before `write()`/`writeFile()` runs. So `applyMasters(pptx, lib, masterOverrides)` owns the actual registration call, and both orchestrators get it via one identical line — consistent with how orchestrators never reach into `prim`/`frame`/`comp` drawing logic directly, only ever calling into `lib`.

### 3. Two-tier merge: names (pure, pre-`pptx`) vs. build functions (side-effecting, post-`pptx`)
`lib.masters` (name constants) must exist before any slide file runs, but slide files run inside the orchestrator's loop, which happens after `pptx` is constructed. Meanwhile `createLib()` runs *before* `pptx` exists at all (mirroring today's `theme` resolution). So the same `masterOverrides` data gets consumed twice, for different purposes:
- `createLib(themeOverrides, masterOverrides)` — pure, merges `{name}` entries by `name` into `lib.masters = { NAME: 'NAME', ... }`. No `pptx`, no build functions invoked.
- `applyMasters(pptx, lib, masterOverrides)` — merges `{name, build}` entries by `name` (workspace entry with a matching name replaces the default wholesale) and actually runs each `build(pptx, rec)` through the recorder, registering on `pptx`.

Both merges use the same `name`-keyed replace-or-append rule, applied to the same `masterOverrides` array, just extracting different fields.

### 4. No `theme.js` split; `masters.js` is self-contained
Unlike `theme.shape.frame` (data) + `frame.js` (code), master definitions are not simple leaf-value data — they're ordered draw-call sequences that only make sense as code. `masters.js` owns both the default master list and the logic that builds/registers them, taking `theme`-derived `lib` as a plain argument the way `frame.js` does. Nothing is added to `defaultTheme`.

### 5. Single file, not a folder — at both the library and workspace level
No file in `src/lib/` or any workspace uses a folder for a growing collection of similar things (`components.js` holds ~15 components, `tables.js` holds 2, `theme.js` holds 7 namespaces — all single files with `── section ──` comment dividers). `src/lib/masters.js` and `workspaces/<slug>/masters.js` both follow that convention. A realistic master count (Title/Content/Section/Blank, maybe a couple more) doesn't approach the scale where a folder would earn its keep, and introducing one here would be the first exception to an otherwise universal pattern.

## Risks / Trade-offs

- **Rich multi-run text may not port through the recorder.** pptxgenjs's `TextProps.text` (used inside master `objects`) is typed as a plain `string`, but `prim.bullets()` calls `slide.addText()` with an *array* of `{ text, options }` runs — a shape real slides accept but master text objects may not render correctly, since the declared type only allows a single string. None of the existing `frame.js` chrome functions (`border`/`slideHeader`/`slideFooter`) use `bullets()`, so this won't surface for the default masters, but a workspace author's custom `build()` function could hit it.
  → Mitigation: verify during implementation; if unsupported, document that master `build()` functions should stick to `prim.text`/shape primitives (no `bullets`) rather than trying to special-case it in the recorder.
- **Silent override on name collision.** If a workspace's `masters.js` defines a master whose `name` typo'd-matches a default (or the workspace list has two same-named entries), the last one wins with no warning — same risk profile as `theme.js`'s existing deep-merge overrides, which also fail silently on typos'd keys.
  → Mitigation: none planned for v1; acceptable given the existing precedent, revisit only if it proves to be a real papercut.
- **Two call sites (`createLib` and `applyMasters`) must both receive `masterOverrides`.** A future orchestrator change that updates one call but not the other would desync `lib.masters` name constants from what's actually registered on `pptx`.
  → Mitigation: both calls sit a few lines apart in each orchestrator, same locality as the existing `themeOverrides` usage; add a scenario test asserting a workspace-defined master name resolves through both paths.

## Migration Plan

Purely additive — no existing workspace, slide file, or theme override is affected by this change (no workspace has a `masters.js` today, and no slide file references `masterName`). Implementation order:
1. `src/lib/masters.js` — recorder, default master list (can start with zero or one trivial default master), `applyMasters`.
2. `src/lib/lib.js` — `createLib` second parameter, `lib.masters` name-constant merge.
3. `bin/forge.js` and `src/tools/browser/compile.js` — load optional workspace `masters.js`, call `applyMasters`.
4. `lib.d.ts` — types for `lib.masters` and the `{ name, build(pptx, slide) }` shape.
5. `INSTRUCTIONS.md` — document the workspace file and the encouraged `addSlide({ masterName: lib.masters.X })` pattern.

No rollback complexity — reverting is deleting the new file and the two new call sites.

## Open Questions

- Should the recorder support `addImage`/`addChart` now for future-proofing, or stay scoped to exactly what `prim.js` currently produces (shapes + text) and grow later if a real need shows up? Leaning toward the latter (YAGNI), flagging here rather than deciding unilaterally.
- Should `applyMasters` warn (console) on duplicate `name`s within a single merged list, or stay silent like `theme.js` overrides do? Leaning toward silent-for-now per the Risks section, but worth a explicit call before implementation.
