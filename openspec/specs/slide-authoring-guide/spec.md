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

It SHALL show that `lib` exposes: `theme`, `prim`, `comp`, `layout`, `frame` — and that `theme` is the merged theme object (not a group of functions).

#### Scenario: AI destructures lib correctly
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it writes `const { theme, prim, comp, layout, frame } = lib;` at the top of each slide function

#### Scenario: AI knows theme is not a function group
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it accesses colors as `theme.color.<name>`, grid as `theme.grid.<field>`, sizes as `theme.size.<field>`, not as `lib.theme.someFunction()`

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

### Requirement: lib.comp — components group
`INSTRUCTIONS.md` SHALL document the `comp` group as pre-built composite components that combine multiple primitives, listing each with its `content` object shape:

- `smallCard(slide, box, { title, body }, opts, name)`
- `miniCard(slide, box, { title, body }, opts, name)` — semi-transparent bg variant
- `benefitCard(slide, box, { title, body }, opts, name)` — accent stripe variant
- `artifactCard(slide, box, { filename, purpose, step }, opts, name)`
- `numberedStep(slide, box, { num, title, body }, opts, name)`
- `phaseBox(slide, box, { label, steps[] }, opts, name)` — `steps` is string array joined with ` · `
- `flowBox(slide, box, { label, highlight? }, opts, name)`
- `flowArrow(slide, box, content, opts, name)` — `opts.vertical: true` for ↓, default is →
- `phaseLabel(slide, box, label, opts, name)` — badge + horizontal rule

#### Scenario: AI uses comp functions for cards and phases
- **WHEN** an AI needs a card, phase box, or flow diagram element
- **THEN** it calls the appropriate `comp.*` function and passes a properly-typed content object

---

### Requirement: lib.layout — layout group
`INSTRUCTIONS.md` SHALL document the `layout` group as slide-level structural elements:

- `sectionTitle(slide, box|null, text, opts, name)` — bold section heading; box fields default to theme grid when omitted
- `darkPanelHeader(slide, box, { title, subtitle? }, opts, name)` — dark bar with colored title and optional subtitle
- `labeledDivider(slide, box, label, opts, name)` — vertical line with centered badge at midpoint
- `calloutBanner(slide, box, text, opts, name)` — full-width dark banner with left accent strip
- `pullQuote(slide, box, text, opts, name)` — large italic quotation-style text

#### Scenario: AI uses layout for slide structure elements
- **WHEN** an AI needs a section heading or a dividing panel header
- **THEN** it calls the appropriate `layout.*` function

---

### Requirement: lib.frame — frame group
`INSTRUCTIONS.md` SHALL document the `frame` group as repeated slide chrome:

- `border(slide, box, opts, name)` — outer slide border rect
- `slideHeader(slide, box, opts, name)` — top header bar with wordmark and badge; reads from `theme.header`
- `slideFooter(slide, box, opts, name)` — bottom footer bar; reads from `theme.footer`

It SHALL note that `border`, `slideHeader`, and `slideFooter` should be called on every slide with `undefined` as the box argument (they self-position using theme grid values).

#### Scenario: AI adds frame to every slide
- **WHEN** an AI generates a slide function
- **THEN** it calls `border(slide, undefined, {}, 'sNN-border')`, `slideHeader(slide, undefined, {}, 'sNN')`, and `slideFooter(slide, undefined, {}, 'sNN')` at the start or end of each slide

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
`INSTRUCTIONS.md` SHALL include a complete, minimal, compilable slide example that demonstrates: file structure, lib destructuring, frame call, a layout call, and a prim text call.

#### Scenario: Example is compilable as-is
- **WHEN** the example from INSTRUCTIONS.md is saved as `slide01-example.js` in a workspace
- **THEN** `node compile.js <workspace>` succeeds without errors

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
`INSTRUCTIONS.md` SHALL include a `theme.shape` subsection within the Theme Object section. It SHALL document the full two-level structure: global keys (`radius`, `borderW`) and each component namespace with all its properties and defaults. It SHALL show an example of a workspace `theme.js` `shape` export demonstrating a partial override, and explain that unspecified keys retain their defaults.

#### Scenario: AI knows theme.shape exists and is overridable
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it knows that `theme.shape` contains per-component visual defaults and that workspace `theme.js` can export a `shape` object to override any subset

#### Scenario: AI can document what component namespaces exist
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it can enumerate the component namespaces (`card`, `artifactCard`, `miniCard`, `divider`, `frame`, etc.) and their key properties

#### Scenario: AI understands partial override semantics
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it knows that `shape: { card: { borderColor: 'accent4' } }` only changes `card.borderColor` and all other shape properties remain at their defaults

### Requirement: INSTRUCTIONS.md documents resolution order for component visual properties
`INSTRUCTIONS.md` SHALL document the three-level resolution order for component visual properties: (1) per-call `opts` — highest priority, (2) `theme.shape.<namespace>.<prop>` — workspace-level default, (3) `defaultTheme.shape` — system default. It SHALL make clear that slide files can always override any visual property via `opts` without touching theme configuration.

#### Scenario: AI knows opts always win
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it understands that passing `opts.borderColor` to a component always overrides `theme.shape.card.borderColor`

#### Scenario: AI knows theme.shape is for workspace-wide defaults, not per-slide
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it uses `opts` for per-call overrides and advises setting `theme.shape` in `theme.js` only when a style change should apply to all instances of a component across the entire workspace

### Requirement: INSTRUCTIONS.md includes a theme.js shape export example
`INSTRUCTIONS.md` SHALL include a concrete example showing a workspace `theme.js` that exports a `shape` object, demonstrating how to change card borders, shadow opacity, and divider line weight. The example SHALL show partial overrides (not requiring every property to be specified).

#### Scenario: AI can generate a correct theme.js shape export
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it can produce a syntactically correct `theme.js` `shape` export that compiles and takes effect without specifying every property
