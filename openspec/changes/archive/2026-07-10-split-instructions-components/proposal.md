## Why

`INSTRUCTIONS.md` currently documents the pre-built `comp`/`layout` component catalog alongside the low-level framework (grid, theme, `prim`, `frame`). Because the catalog is the largest, most concrete part of the reference, AI chatbots given this file default to reusing the same cards/KPI tiles/flow boxes instead of composing something bespoke for the deck's concept. Splitting the catalog into its own optional file, and only including it in the AI reference when the user actually wants standard components, lets the default authoring path favor `prim`/`frame`-driven creative layouts while still making the catalog available on request.

## What Changes

- Split `INSTRUCTIONS.md` into two files:
  - `INSTRUCTIONS.md` keeps only true low-level primitives that wrap `pptxgenjs` directly: overview, workspace structure, coordinate system/grid, theme object (minus all component-specific `theme.shape` namespaces, keeping only the global `radius`/`borderW` keys — these are consumed directly by `prim.roundRect`/`hLine`/`vLine`), `run`, `prim`, the custom-components/creative-flexibility guidance, object naming, and a components-free worked example (no `frame` chrome, no `comp`/`layout`).
  - New `COMPONENTS.md` holds everything pre-composed and opinionated: the `comp` catalog (cards, KPI/stats, flow, insight/callout, lists, indicators), the `layout` group (sectionTitle, darkPanelHeader, labeledDivider, calloutBanner, pullQuote), and the `frame` group (border, slideHeader, slideFooter — repeated slide chrome), each with their `theme.shape` namespace docs (including `theme.shape.frame`, which only `frame.js` consumes), plus its own worked example showing `comp`/`layout`/`frame` usage.
- **BREAKING**: `lib.d.ts` is not split — it continues to be bundled in full regardless of whether components are included, so type signatures for `comp`/`layout` remain visible to the AI even when `COMPONENTS.md` is left out.
- Update `scripts/build-browser.js` to bundle `COMPONENTS.md` as its own build-time constant, separate from the base `AI-CHAT.md` + `INSTRUCTIONS.md` + `lib.d.ts` reference.
- Update the browser tool (`src/tools/browser/{index.html,app.js}`) to add an "Include components" toggle next to the "🤖 AI" button, defaulting to off, with no persistence (resets on reload). When on, the copied/shown AI reference additionally includes `COMPONENTS.md` content; when off, it's left out.
- Update `AI-CHAT.md` wording so it no longer names `INSTRUCTIONS.md`/`lib.d.ts` specifically, instead referring generically to "the reference sections below" — which may be just the framework reference or the framework reference plus the components catalog, depending on the toggle.

## Capabilities

### New Capabilities
- `components-authoring-guide`: `COMPONENTS.md` — the AI-facing reference for the pre-built `comp`/`layout` component catalog, its `theme.shape` namespace docs, and a worked example using components. Optional companion to `slide-authoring-guide`, included only when the user opts in.

### Modified Capabilities
- `slide-authoring-guide`: `INSTRUCTIONS.md` drops the `comp`/`layout`/`frame` catalog requirements and their component-specific `theme.shape` docs (moved to `components-authoring-guide`), keeping only the global `radius`/`borderW` shape keys, and its worked example changes from a components-using example to a components-free one with no chrome.
- `browser-ai-reference`: build step bundles `COMPONENTS.md` as an additional, separately-injected constant; the AI reference assembly becomes conditional on a runtime "include components" toggle; `AI-CHAT.md`'s instruction text is genericized to not name specific reference files.

## Impact

- Affected files: `INSTRUCTIONS.md` (trimmed), new `COMPONENTS.md`, `AI-CHAT.md` (wording), `scripts/build-browser.js`, `src/tools/browser/index.html`, `src/tools/browser/app.js`.
- No changes to `lib.js`/`lib.d.ts` or slide compilation behavior — this is a documentation/reference-bundling and browser-tool UX change only.
- `pptx-forge.html` (the built artifact) changes shape and must be regenerated via `npm run build:browser`.
