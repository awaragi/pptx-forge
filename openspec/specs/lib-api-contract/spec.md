## Purpose

Defines the uniform API contract for all functions exported by `createLib` in `lib.js` — covering the function signature grammar, namespace grouping, naming conventions, and the `unpack` helper for flexible content input.

---

## Requirements

### Requirement: Uniform function signature grammar
Every function exported by `createLib` SHALL follow the grammar `fn(slide, box, content, opts = {}, name)` where `slide` is the PresentationJS slide object, `box` is `{ x, y, w, h }` or `undefined`, `content` is a scalar or content object, `opts` is an optional visual override object defaulting to `{}`, and `name` is an optional trailing string for PowerPoint object naming.

#### Scenario: All exported functions share the same slot structure
- **WHEN** any exported function is called with `(slide, box, content, opts, name)`
- **THEN** the function accepts the call without error

#### Scenario: Unused geometry passed as -1 is accepted
- **WHEN** a function that ignores `h` is called with `box = { x, y, w, h: -1 }`
- **THEN** the function renders correctly and does not use the `-1` value

### Requirement: Namespace grouping — prim, comp, layout, frame, run
`createLib` SHALL return an object with four namespace groups: `prim`, `comp`, `layout`, and `frame`. Each group SHALL be a plain object whose values are the functions belonging to that group. The `theme` object SHALL also be returned at the top level. The `run` helper function (with its sub-helpers `run.bold`, `run.italic`, `run.color`) SHALL be returned as a top-level export named `run`. Callers SHALL destructure `const { theme, prim, comp, layout, frame, run } = lib`.

#### Scenario: Groups are destructurable from lib
- **WHEN** a slide file calls `const { prim, comp, layout, frame, theme, run } = lib`
- **THEN** all six are defined and non-null

#### Scenario: Individual functions are destructurable from groups
- **WHEN** a slide file calls `const { text, roundRect } = lib.prim`
- **THEN** both are functions

#### Scenario: T is not exported
- **WHEN** the return value of `createLib` is inspected
- **THEN** it does NOT contain a key named `T`

#### Scenario: run is a top-level lib export
- **WHEN** the return value of `createLib` is inspected
- **THEN** `lib.run` is a function and `lib.run.bold`, `lib.run.italic`, `lib.run.color` are functions

#### Scenario: theme does not contain run
- **WHEN** `lib.theme` is inspected
- **THEN** it does NOT contain a key named `run`

### Requirement: prim group exports
`lib.prim` SHALL export: `text`, `roundRect`, `fillRect`, `circle`, `hLine`, `vLine`, `bullets`.

#### Scenario: All prim functions accessible
- **WHEN** `lib.prim` is inspected
- **THEN** it contains exactly `text`, `roundRect`, `fillRect`, `circle`, `hLine`, `vLine`, `bullets` as functions

### Requirement: comp group exports
`lib.comp` SHALL export: `phaseLabel`, `flowBox`, `flowArrow`, `smallCard`, `artifactCard`, `benefitCard`, `miniCard`, `phaseBox`, `numberedStep`.

#### Scenario: All comp functions accessible
- **WHEN** `lib.comp` is inspected
- **THEN** it contains all nine component functions

### Requirement: layout group exports
`lib.layout` SHALL export: `sectionTitle`, `darkPanelHeader`, `labeledDivider`, `calloutBanner`, `pullQuote`.

#### Scenario: All layout functions accessible
- **WHEN** `lib.layout` is inspected
- **THEN** it contains all five layout functions

### Requirement: frame group exports
`lib.frame` SHALL export: `border`, `slideHeader`, `slideFooter`.

#### Scenario: All frame functions accessible
- **WHEN** `lib.frame` is inspected
- **THEN** it contains `border`, `slideHeader`, `slideFooter` as functions

### Requirement: unpack helper for flexible content input
Single-content functions SHALL accept content as a scalar value, a `{ field }` object, or an array of run objects. An internal `unpack(val, key)` helper SHALL extract the value from scalar and object forms. If `val` is an array it SHALL be returned as-is. If `val` is a non-array object it returns `val[key]`. Otherwise it returns `val` directly.

#### Scenario: Scalar content accepted
- **WHEN** `prim.text(slide, box, 'Hello world', opts, name)` is called
- **THEN** the text 'Hello world' is rendered

#### Scenario: Object content accepted
- **WHEN** `prim.text(slide, box, { text: 'Hello world' }, opts, name)` is called
- **THEN** the text 'Hello world' is rendered identically

#### Scenario: Array content passes through unmodified
- **WHEN** `unpack([{ text: 'A', options: {} }], 'text')` is called
- **THEN** the original array is returned unchanged

### Requirement: camelCase naming, no abbreviations
All exported function names SHALL be camelCase. No abbreviated names SHALL be used. Specifically: `text` (not `txt`), `roundRect` (not `rrect`), `hLine` (not `hline`), `vLine` (not `vline`), `smallCard` (not `SmallCard`).

#### Scenario: Old abbreviated names no longer exported
- **WHEN** the return value of `createLib` is inspected
- **THEN** it does NOT contain `txt`, `rrect`, `hline`, `vline`, or any PascalCase function names at the top level

### Requirement: lib.d.ts declares ThemeShape and per-component sub-interfaces
`lib.d.ts` SHALL declare a `ThemeShape` interface describing the full structure of `theme.shape`, with nested interfaces for each component namespace. The `Lib` interface's `theme` property SHALL be updated to expose `theme.shape` as `ThemeShape`. All component namespace sub-interfaces (`CardShape`, `ArtifactCardShape`, `MiniCardShape`, `PhaseLabelShape`, `FlowBoxShape`, `FlowArrowShape`, `DividerShape`, `CalloutBannerShape`, `DarkPanelHeaderShape`, `PullQuoteShape`, `SectionTitleShape`, `FrameShape`) SHALL be declared. The `ShadowOpts` interface (already present) SHALL be reused for `CardShape.shadow`.

#### Scenario: ThemeShape is exported and complete
- **WHEN** `lib.d.ts` is inspected
- **THEN** it exports `ThemeShape` with top-level properties `radius`, `borderW`, `card`, `artifactCard`, `miniCard`, `phaseLabel`, `flowBox`, `flowArrow`, `divider`, `calloutBanner`, `darkPanelHeader`, `pullQuote`, `sectionTitle`, `frame`

#### Scenario: CardShape includes shadow
- **WHEN** `lib.d.ts` is inspected
- **THEN** `CardShape` contains `bgColor`, `borderColor`, `accentColor`, `titleColor`, `bodyColor`, and `shadow: ShadowOpts`

#### Scenario: FrameShape includes all frame color and geometry fields
- **WHEN** `lib.d.ts` is inspected
- **THEN** `FrameShape` contains `badgeRadius`, `borderColor`, `badgeColor`, `badgeTextColor`, `wordmarkColor`, `footerLineColor`, `footerTextColor`

#### Scenario: DividerShape includes both geometry and color fields
- **WHEN** `lib.d.ts` is inspected
- **THEN** `DividerShape` contains `color`, `badgeTextColor`, `lineWidth`, `badgeW`, `badgeH`, `gap`

#### Scenario: theme.shape is typed as ThemeShape in Lib
- **WHEN** `lib.d.ts` is inspected
- **THEN** the `Lib` interface exposes `theme: { shape: ThemeShape; scheme: any; color: any; size: any; font: any; grid: any; header: any; footer: any; }` or equivalent

### Requirement: Content field naming standards
Component content objects SHALL use standardized field names: `title` and `body` for card heading and body copy; `label` for short badge or identifier text; `steps` (string array) for structured list content in `phaseBox`; `subtitle` for secondary panel text; `text` for single-text layout functions; `items` (string array) for `bullets`.

#### Scenario: PhaseBox steps is a string array
- **WHEN** `comp.phaseBox(slide, box, { label: 'Foundation', steps: ['Setup', 'Intake'] }, opts, name)` is called
- **THEN** the rendered text joins the array with ' · ' separator

#### Scenario: bullets items is a string array
- **WHEN** `prim.bullets(slide, box, ['Item one', 'Item two'], opts, name)` is called
- **THEN** both items render as bullet points
