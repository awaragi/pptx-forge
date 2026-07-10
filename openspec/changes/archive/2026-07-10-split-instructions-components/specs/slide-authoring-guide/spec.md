## MODIFIED Requirements

### Requirement: lib object destructuring patterns
`INSTRUCTIONS.md` SHALL document how to destructure `lib` at the top of a slide function.

It SHALL show that `lib` exposes: `theme`, `run`, `prim` — and that `theme` is the merged theme object (not a group of functions). It SHALL note that `lib` also exposes `comp`, `layout`, and `frame` (the pre-built component catalog and slide chrome), documented separately in `COMPONENTS.md`, and that slide files only need to destructure `comp`/`layout`/`frame` when the author has chosen to use standard components.

#### Scenario: AI destructures lib correctly for the components-free path
- **WHEN** an AI reads `INSTRUCTIONS.md` only (no `COMPONENTS.md`)
- **THEN** it writes `const { theme, run, prim } = lib;` at the top of each slide function, without referencing `comp`, `layout`, or `frame`

#### Scenario: AI knows theme is not a function group
- **WHEN** an AI reads `INSTRUCTIONS.md`
- **THEN** it accesses colors as `theme.color.<name>`, grid as `theme.grid.<field>`, sizes as `theme.size.<field>`, not as `lib.theme.someFunction()`

#### Scenario: AI knows comp/layout/frame exist but live in COMPONENTS.md
- **WHEN** an AI reads `INSTRUCTIONS.md` and needs a pre-built card, KPI tile, flow diagram, section heading, or repeated header/footer/border chrome
- **THEN** it recognizes that these are provided by `lib.comp`/`lib.layout`/`lib.frame`, documented in `COMPONENTS.md`, and asks for or uses that file rather than guessing at their shapes

---

### Requirement: INSTRUCTIONS.md documents theme.shape structure and workspace override pattern
`INSTRUCTIONS.md` SHALL include a `theme.shape` subsection within the Theme Object section, scoped to the only two properties consumed directly by `prim` functions: the global keys `radius` (rounded-rectangle corner radius, used by `prim.roundRect`) and `borderW` (default border/line stroke width, used by `prim.roundRect`/`prim.hLine`/`prim.vLine`). It SHALL show an example of a workspace `theme.js` `shape` export demonstrating a partial override of one of these, and explain that unspecified keys retain their defaults. It SHALL note that every other `theme.shape` namespace — including `frame`, `card`, `fileCard`, `flowBox`, etc. — is documented in `COMPONENTS.md` alongside the `comp`/`layout`/`frame` functions they style.

#### Scenario: AI knows theme.shape exists and is overridable
- **WHEN** an AI reads `INSTRUCTIONS.md`
- **THEN** it knows that `theme.shape` contains per-component visual defaults and that workspace `theme.js` can export a `shape` object to override any subset

#### Scenario: AI can document the framework-level shape keys
- **WHEN** an AI reads `INSTRUCTIONS.md`
- **THEN** it can state that only `radius` and `borderW` are documented there, and knows that all namespaced entries (including `frame`) are documented in `COMPONENTS.md`

#### Scenario: AI understands partial override semantics
- **WHEN** an AI reads `INSTRUCTIONS.md`
- **THEN** it knows that `shape: { borderW: 1.2 }` only changes the default border width and all other shape properties remain at their defaults

---

### Requirement: Worked example — minimal compilable slide
`INSTRUCTIONS.md` SHALL include a complete, minimal, compilable slide example that demonstrates: file structure, `lib` destructuring (`theme`, `run`, `prim` only — no `comp`/`layout`/`frame`), and `prim` calls (text and at least one shape), composing a slide using only framework fundamentals and no pre-built chrome.

#### Scenario: Example is compilable as-is
- **WHEN** the example from `INSTRUCTIONS.md` is saved as a slide file in a workspace
- **THEN** `npm run forge <slug>` succeeds without errors

#### Scenario: Example does not reference the component catalog or frame chrome
- **WHEN** an AI reads the worked example in `INSTRUCTIONS.md`
- **THEN** it sees no call to any `comp.*`, `layout.*`, or `frame.*` function, demonstrating that a complete slide is achievable with `prim` alone

## ADDED Requirements

### Requirement: Custom components and creative flexibility guidance
`INSTRUCTIONS.md` SHALL include guidance stating that the AI is not limited to any pre-built component library: it MAY write custom helper functions composing `prim` calls, and MAY drop to raw `pptxgenjs` APIs (`slide.addText()`, `slide.addShape()`, `slide.addImage()`, `slide.addChart()`, etc.) when neither `lib` nor `prim` covers a need. This guidance SHALL appear once, in `INSTRUCTIONS.md`, near the `prim` documentation — it applies regardless of whether `COMPONENTS.md` is also being used.

#### Scenario: AI builds a custom visual treatment
- **WHEN** an AI is generating a slide and the concept calls for a layout or visual treatment not covered by any documented function
- **THEN** it writes a custom helper composing `prim` calls, or drops to raw `pptxgenjs`, rather than forcing the concept into an ill-fitting pre-built component

#### Scenario: Guidance is present whether or not COMPONENTS.md is included
- **WHEN** an AI is given only `INSTRUCTIONS.md` and `lib.d.ts`, or is given `INSTRUCTIONS.md` + `COMPONENTS.md` + `lib.d.ts`
- **THEN** in both cases it has read the creative-flexibility guidance, since it lives solely in `INSTRUCTIONS.md`

### Requirement: INSTRUCTIONS.md references COMPONENTS.md as an optional companion
`INSTRUCTIONS.md` SHALL state, near the top (Overview section), that a companion file `COMPONENTS.md` documents a pre-built `comp`/`layout`/`frame` catalog and is optional — to be read together with `INSTRUCTIONS.md` and `lib.d.ts` only when the author wants to use standard components and/or slide chrome.

#### Scenario: AI knows to ask for COMPONENTS.md when appropriate
- **WHEN** an AI reads `INSTRUCTIONS.md` and the user's request implies wanting standard, consistent components or repeated slide chrome (or the user has supplied `COMPONENTS.md` already)
- **THEN** it treats `COMPONENTS.md` as the authoritative source for `comp`/`layout`/`frame` shapes, requesting it if not yet provided

## REMOVED Requirements

### Requirement: lib.comp — components group
**Reason**: The `comp` catalog moved to the new `components-authoring-guide` capability (`COMPONENTS.md`), so it's no longer part of `INSTRUCTIONS.md`'s contract.
**Migration**: See `components-authoring-guide`'s "lib.comp — components group" requirement.

### Requirement: lib.layout — layout group
**Reason**: The `layout` group moved to the new `components-authoring-guide` capability (`COMPONENTS.md`), so it's no longer part of `INSTRUCTIONS.md`'s contract.
**Migration**: See `components-authoring-guide`'s "lib.layout — layout group" requirement.

### Requirement: lib.frame — frame group
**Reason**: On reconsideration, `frame` (repeated slide chrome — border/header/footer) is a pre-composed, opinionated helper like `comp`/`layout` rather than a raw `prim` wrapper, so it moved to the new `components-authoring-guide` capability (`COMPONENTS.md`) alongside them.
**Migration**: See `components-authoring-guide`'s "lib.frame — frame group" requirement.
