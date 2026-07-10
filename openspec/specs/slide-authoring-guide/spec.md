## Purpose

Defines the requirements for `INSTRUCTIONS.md` — the AI-facing slide authoring reference that, when read alongside `lib.d.ts`, provides complete information to generate correct, compilable slide files with no additional context.

---

## Requirements

### Requirement: INSTRUCTIONS.md exists at the project root
A file `INSTRUCTIONS.md` SHALL exist at the project root alongside `lib.d.ts`. It SHALL be a self-contained markdown reference that, when read together with `lib.d.ts`, provides complete information for an AI to generate correct slide files.

#### Scenario: File is present and readable
- **WHEN** an AI is given `lib.d.ts` and `INSTRUCTIONS.md`
- **THEN** it can generate a compilable slide file without reading any other project file

---

### Requirement: Workspace layout and compile pipeline contract
`INSTRUCTIONS.md` SHALL document the workspace directory layout and the compile pipeline contract.

Specifically it SHALL cover:
- Project root structure: `lib.js`, `lib.d.ts`, `compile.js`, `workspaces/<slug>/`
- Inside a workspace: `theme.js` (optional), `slide01-*.js` … `slideNN-*.js`, `out/` (generated)
- How compile.js discovers and sorts slide files (`/^slide\d+.*\.js$/` sorted alphabetically)
- The compile command: `node compile.js <workspace-slug>`
- The slide file export contract: `export default function SlideNN_Name(pptx, lib) { ... }`
- That each slide function MUST call `pptx.addSlide()` internally and render all content to that slide

#### Scenario: AI knows slide file naming convention
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it names new slide files as `slide01-<topic>.js`, `slide02-<topic>.js`, etc. using zero-padded two-digit numbers

#### Scenario: AI knows the export signature
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it writes `export default function Slide01_Topic(pptx, lib) { ... }` as the module shape

---

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

### Requirement: Coordinate system and grid constants
`INSTRUCTIONS.md` SHALL document the coordinate system and the default grid constants from `lib.js`.

It SHALL specify:
- Coordinates are in inches; origin is top-left of the slide
- Slide canvas: `13.333 × 7.5` inches (wide layout)
- Default grid constants: `marginX: 0.73`, `contentW: 11.87`, `colRight: 7.18`, `colLeftW: 5.85`, `colRightW: 5.42`, `contentTop: 0.88`, `contentBottom: 6.86`, `footerY: 7.18`
- The `box` parameter shape: `{ x, y, w, h }` in inches
- When a geometry field is unused by a function (e.g., `h` for `hLine`), pass `-1` or simply omit it

#### Scenario: AI uses correct coordinate units
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** all box values it generates are decimal numbers representing inches, not pixels

#### Scenario: AI uses theme.grid constants instead of magic numbers
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it uses `theme.grid.marginX` for left margin, `theme.grid.colRight` for right column start, etc.

---

### Requirement: Theme object shape
`INSTRUCTIONS.md` SHALL document the shape of the `theme` object:

- `theme.scheme`: 10 PowerPoint scheme slot hex values (`dk1`, `lt1`, `dk2`, `lt2`, `accent1`–`accent6`)
- `theme.color`: workspace semantic aliases (e.g. `primary`, `ink`, `surface`, `bodyText`) — values are either hex strings or scheme-slot shorthand strings
- `theme.size`: named font sizes (`h1`–`h6`, `body`, `bodyLg`, `small`, etc.)
- `theme.grid`: layout grid constants (all in inches)
- `theme.font`: `body` and `mono` font face names
- `run(text, opts)`: top-level lib helper that returns a pptxgenjs rich-text run object `{ text, options }` for use in text arrays; also exposes `run.bold`, `run.italic`, `run.color` shorthands

#### Scenario: AI knows how to reference colors
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it uses `theme.color.primary`, `theme.color.ink`, etc. for color values in `opts` — never hardcoded hex

#### Scenario: AI knows how to compose multi-style text
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it passes an array of `run(...)` objects to `prim.text()` for multi-style text blocks

---

### Requirement: lib.prim — primitives group
`INSTRUCTIONS.md` SHALL document the `prim` group as the raw drawing layer, listing each function and its key usage notes:

- `text(slide, box, text|run[], opts, name)` — text frame; `text` can be a string or array of run objects for mixed styles
- `roundRect(slide, box, content, opts, name)` — rounded rectangle; `opts.fill`, `opts.line`, `opts.shadow` are the common opts fields
- `fillRect(slide, box, content, opts, name)` — sharp rectangle
- `circle(slide, box, content, opts, name)` — `box.w` is diameter; `box.h` ignored
- `hLine(slide, box, content, opts, name)` — horizontal line; `box.h` ignored; use `opts.color` and `opts.lineWidth`
- `vLine(slide, box, content, opts, name)` — vertical line; `box.w` ignored
- `bullets(slide, box, items[], opts, name)` — bulleted list from string array

#### Scenario: AI uses prim for basic shapes and text
- **WHEN** an AI needs a simple text frame or shape
- **THEN** it calls the appropriate `prim.*` function, not a comp function

#### Scenario: AI knows text accepts run arrays
- **WHEN** an AI needs bold + normal text in the same text frame
- **THEN** it passes `[run('Bold part', { bold: true }), run(' normal part', {})]` as the text argument

---

### Requirement: Object naming conventions
`INSTRUCTIONS.md` SHALL document the PowerPoint object naming convention used as the trailing `name` argument.

- Format: `'sNN-<role>'` where `NN` is the zero-padded slide number and `role` is a short kebab-case description
- Names must be unique within a slide
- Examples: `'s01-title'`, `'s01-purpose-bg'`, `'s03-flow-arrow-1'`

#### Scenario: AI names objects consistently
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** all `name` arguments it generates follow the `sNN-<role>` pattern

---

### Requirement: Worked example — minimal compilable slide
`INSTRUCTIONS.md` SHALL include a complete, minimal, compilable slide example that demonstrates: file structure, `lib` destructuring (`theme`, `run`, `prim` only — no `comp`/`layout`/`frame`), and `prim` calls (text and at least one shape), composing a slide using only framework fundamentals and no pre-built chrome.

#### Scenario: Example is compilable as-is
- **WHEN** the example from `INSTRUCTIONS.md` is saved as a slide file in a workspace
- **THEN** `npm run forge <slug>` succeeds without errors

#### Scenario: Example does not reference the component catalog or frame chrome
- **WHEN** an AI reads the worked example in `INSTRUCTIONS.md`
- **THEN** it sees no call to any `comp.*`, `layout.*`, or `frame.*` function, demonstrating that a complete slide is achievable with `prim` alone

---

### Requirement: Relationship to pptxgenjs
`INSTRUCTIONS.md` SHALL explain how this system relates to pptxgenjs:

- `pptx` is a `pptxgenjs` `PptxGenJS` instance; slide files call `pptx.addSlide()` directly (once per slide) and may set `slide.background`
- All shape/text rendering goes through `lib` — slide files do not need to call `slide.addText()`, `slide.addShape()`, etc. directly
- `run()` produces pptxgenjs run objects; these are passed to `prim.text()` as arrays

#### Scenario: AI does not use raw pptxgenjs API
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it does not call `slide.addText()`, `slide.addShape()`, or other raw pptxgenjs methods in slide files

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

### Requirement: INSTRUCTIONS.md documents resolution order for component visual properties
`INSTRUCTIONS.md` SHALL document the three-level resolution order for visual properties in general terms: (1) per-call `opts` — highest priority, (2) `theme.shape.<namespace>.<prop>` — workspace-level default, (3) library default. It SHALL make clear that slide files can always override any visual property via `opts` without touching theme configuration, and that the concrete namespaced keys this resolution order applies to (beyond the two global keys `radius`/`borderW`) are documented in `COMPONENTS.md`.

#### Scenario: AI knows opts always win
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it understands that passing a visual property via `opts` to a component always overrides the corresponding `theme.shape.<namespace>.<prop>` value, wherever that namespace is documented

#### Scenario: AI knows theme.shape is for workspace-wide defaults, not per-slide
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it uses `opts` for per-call overrides and advises setting `theme.shape` in `theme.js` only when a style change should apply to all instances of a component across the entire workspace

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
