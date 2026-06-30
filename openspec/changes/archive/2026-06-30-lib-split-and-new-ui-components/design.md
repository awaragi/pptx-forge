## Context

`src/lib.js` is a single 750-line file containing theme defaults, deep-merge logic, and every exported function. As components are added the file is increasingly hard to navigate and isolate for testing. In parallel, five `comp` functions carry domain-baked or size-as-role names (`smallCard`, `benefitCard`, `miniCard`, `artifactCard`, `phaseBox`) that misrepresent their visual role to new authors. Finally, many recurring slide patterns — KPI stats, icon callouts, progress bars, auto-flowing step diagrams, image-backed cards, and native tables — are absent, forcing authors to compose from raw primitives per deck.

## Goals / Non-Goals

**Goals:**
- Split `src/lib.js` into 7 focused modules with a clean, one-directional dependency graph
- Add `src/index.js` barrel so workspaces can import from `src/` or `src/lib.js` interchangeably
- Rename 5 `comp` functions to role-based camelCase names
- Add 10 new `comp` functions and a new `tables` namespace with 2 functions
- Add new `theme.shape` stanzas for each new component (emoji-safe defaults)
- Replace single-slide sample with a 7-slide showcase demonstrating the full library
- Produce `workspaces/RENAME-SUMMARY.md` for workspace authors updating existing slides

**Non-Goals:**
- Backward compatibility — no shims or deprecated aliases
- Updating existing workspace slide files (handled separately via rename summary)
- Real `addImage` API surface — emoji placeholders cover the visual authoring use case

## Decisions

### 1. Modules receive theme and primitives via factory parameter — no module-level globals

Each module (`components.js`, `layout.js`, etc.) exports a make function that receives the closed-over `theme` object and, where needed, the `prim` helpers. The factory in `lib.js` calls each make function in order and assembles the final namespace object.

```
theme.js  ──▶  primitives.js  ──▶  components.js  ─┐
                                ──▶  tables.js       │──▶  lib.js  ──▶  index.js
                                ──▶  layout.js       │
                                ──▶  frame.js      ──┘
```

No circular imports exist because the graph is strictly layered. `components.js` never imports from `layout.js` or `frame.js`.

**Alternative considered**: Classes with constructor injection — rejected as overkill for a pure-function, side-effect-free library.

### 2. Emoji-as-image placeholder — no addImage API

`imageCard` and `imageHolder` render the `image` field as a large `prim.text` call inside a colored `prim.fillRect`. The default value is `'🖼'`. Authors replace the shape with a real image in PowerPoint designer after export.

**Alternative considered**: `addImage` with a `path` field — rejected because it requires workspace-level path management and breaks the emoji-first authoring model used everywhere else.

### 3. `stepFlow` auto-distributes box width across items

Given `box.w`, `n` items, and a fixed arrow width of `0.22"`:

```
itemW = (box.w - (n - 1) × 0.22) / n
xItem[i] = box.x + i × (itemW + 0.22)
xArrow[i] = xItem[i] + itemW
```

When `n = 1` no arrows are drawn; the single box occupies `box.w`.

**Alternative considered**: Returning a `[{ x, y, w, h }]` array for manual placement — rejected because it defeats the ergonomic purpose of the function.

### 4. `tables` as a separate top-level namespace

pptxgenjs tables use `slide.addTable()` — a distinct rendering API from shapes. Separating them signals the different model to callers and keeps `comp` homogeneous (all shape-based).

**Alternative considered**: Folding tables into `comp` — rejected because it mixes two rendering models and pollutes the `comp` destructure.

### 5. Existing `../../src/lib.js` import paths still resolve

`src/lib.js` continues to export `createLib` as a named export. Its internals change but its public surface is identical. No workspace file needs updating to keep using `src/lib.js`.

### 6. `labeledSection` belongs in `layout`, not `comp`

`labeledSection` composes `sectionTitle` and `darkPanelHeader` into one call — it is a layout shorthand, not a new visual component. It goes in `layout` alongside the two functions it wraps.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Module split introduces a circular dep | Dependency graph is one-directional by design; enforced via import order in lib.js |
| Existing workspaces break on renamed comp functions | RENAME-SUMMARY.md documents every change; workspace update is a separate, tracked task |
| stepFlow width overflows for many items in a narrow box | Auto-distribution is exact by formula; callers control `box.w` |
| pptxgenjs table opts surface is large; thin wrapper may hide power | `opts` pass-through is unconstrained; callers supply raw pptxgenjs opts freely |
| new theme.shape stanzas increase defaultTheme size | Each stanza is ≤6 lines; total growth is ~60 lines — acceptable |

## Open Questions

None. All decisions confirmed during explore session.
