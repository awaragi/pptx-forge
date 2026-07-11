## Purpose

Defines the requirements for `COMPONENTS.md` — the optional AI-facing reference documenting the pre-built `comp`/`layout`/`frame` component catalog, intended as a companion to `INSTRUCTIONS.md` and `lib.d.ts` for AI slide authoring when the author wants to use standard components and/or slide chrome.

## Requirements

### Requirement: COMPONENTS.md exists at the project root
A file `COMPONENTS.md` SHALL exist at the project root alongside `INSTRUCTIONS.md` and `lib.d.ts`. It SHALL be a self-contained markdown reference for the pre-built `comp`/`layout`/`frame` catalog, intended as an optional companion to `INSTRUCTIONS.md` for AI slide authoring — read together with `INSTRUCTIONS.md` and `lib.d.ts` when the author wants to use standard components and/or slide chrome, and omitted otherwise.

#### Scenario: File is present and readable
- **WHEN** an AI is given `INSTRUCTIONS.md`, `lib.d.ts`, and `COMPONENTS.md`
- **THEN** it can generate a compilable slide file that uses `comp`/`layout`/`frame` functions without reading any other project file

#### Scenario: INSTRUCTIONS.md remains complete without it
- **WHEN** an AI is given only `INSTRUCTIONS.md` and `lib.d.ts` (no `COMPONENTS.md`)
- **THEN** it can still generate a correct, compilable slide file using `prim` only, with no reference to undocumented `comp`/`layout`/`frame` functions

### Requirement: lib.comp — components group
`COMPONENTS.md` SHALL document the `comp` group as pre-built composite components that combine multiple primitives, listing each with its `content` object shape, grouped by category:

- Cards: `infoCard` `{ title, body }`, `overlayCard` `{ title, body }` (glassmorphic, dark backgrounds), `accentCard` `{ title, body }` (top accent bar), `challengeCard` `{ title, body }` (left accent bar), `fileCard` `{ filename, purpose, step }`, `numberedStep` `{ num, title, body }`, `stepBox` `{ label, steps: string[] }`, `imageCard` `{ image?, title, body?, imageH? }`, `iconBox` `{ icon?, title, body? }`, `teamCard` `{ name, role, bio? }`
- KPI & Stats: `iconStat` `{ value, label, icon? }`, `darkStat` `{ value, label, source? }`
- Flow & Process: `flowBox` `{ label, highlight? }`, `flowArrow` (connector; `opts.vertical` for ↓), `stepFlow` `{ items: { label, highlight? }[] }`, `phaseLabel` (label string, 3rd arg — badge + horizontal rule)
- Insight & Callout: `calloutQuote` `{ label?, quote }`
- Lists & Tables: `bulletIconList` `{ items: { icon, text }[] }`, `twoColumnRow` `{ label, content }`
- Indicators & Placeholders: `progressBar` `{ value, label?, showPct? }`, `tagBadge` `{ label }`, `imageHolder` `{ icon?, label? }`

#### Scenario: AI uses comp functions for cards, stats, and flow diagrams
- **WHEN** an AI has been given `COMPONENTS.md` and needs a card, KPI tile, flow diagram element, or callout
- **THEN** it calls the appropriate `comp.*` function and passes a properly-shaped content object per this reference

### Requirement: lib.layout — layout group
`COMPONENTS.md` SHALL document the `layout` group as slide-level structural elements:

- `sectionTitle(slide, box|null, text, opts, name)` — bold heading; box fields default to theme grid when omitted
- `darkPanelHeader(slide, box, { title, subtitle? }, opts, name)` — dark bar with colored title and optional subtitle
- `labeledDivider(slide, box, label, opts, name)` — vertical line with centered badge at midpoint
- `calloutBanner(slide, box, text, opts, name)` — full-width dark banner with left accent strip
- `pullQuote(slide, box, text, opts, name)` — large italic quotation-style text

#### Scenario: AI uses layout for slide structure elements
- **WHEN** an AI has been given `COMPONENTS.md` and needs a section heading, panel header, divider, or callout banner
- **THEN** it calls the appropriate `layout.*` function

### Requirement: lib.frame — frame group
`COMPONENTS.md` SHALL document the `frame` group as repeated slide chrome:

- `border(slide, undefined, opts, name)` — thin outer border around the slide
- `slideHeader(slide, undefined, opts, name)` — top header bar; wordmark (`theme.header.wordmark`) + badge (`theme.header.badge`)
- `slideFooter(slide, undefined, opts, name)` — bottom footer bar; left and right text from `theme.footer`

It SHALL note that all three functions are called with `undefined` as the `box` argument — they self-position using `theme.grid` and `theme.header`/`theme.footer` rather than taking explicit coordinates.

It SHALL also note that `frame.*` is a manual, per-slide alternative to defining a slide master (documented in `INSTRUCTIONS.md`): a slide that calls `frame.border`/`frame.slideHeader`/`frame.slideFooter` directly draws its own one-off chrome instead of inheriting it from a `masterName`, which is useful for chrome variations that don't warrant a dedicated master.

#### Scenario: AI adds frame chrome to every slide when using components
- **WHEN** an AI has been given `COMPONENTS.md` and is building a deck that should have a consistent header/footer/border
- **THEN** it calls `frame.border(slide, undefined, opts, name)`, `frame.slideHeader(slide, undefined, opts, name)`, and `frame.slideFooter(slide, undefined, opts, name)` on each applicable slide, passing `undefined` for `box`

#### Scenario: AI knows frame is a manual alternative to a master
- **WHEN** an AI has been given `COMPONENTS.md` and a specific slide needs one-off chrome that no defined master provides
- **THEN** it calls `frame.*` directly on that slide instead of (or in addition to) using `masterName`

### Requirement: COMPONENTS.md documents component-specific theme.shape namespaces
`COMPONENTS.md` SHALL document the `theme.shape` namespaces that style `comp`/`layout`/`frame` functions: `frame`, `card`, `fileCard`, `overlayCard`, `phaseLabel`, `flowBox`, `flowArrow`, `divider`, `calloutBanner`, `darkPanelHeader`, `pullQuote`, `sectionTitle`, `iconStat`, `iconBox`, `imageCard`, `progressBar`, `tagBadge`, `dataTable`, `darkStat`, `teamCard`, `comparisonTable` — each with its properties and defaults. It SHALL note that only the global `radius`/`borderW` keys are documented in `INSTRUCTIONS.md` instead, since those two are consumed directly by `prim` functions independent of any catalog function.

#### Scenario: AI can enumerate component-specific shape namespaces
- **WHEN** an AI reads `COMPONENTS.md`
- **THEN** it can enumerate the component-specific `theme.shape` namespaces, including `frame`, and their properties, and knows the two global keys live in `INSTRUCTIONS.md`

#### Scenario: AI writes a correct partial theme.js shape override for a component
- **WHEN** an AI reads `COMPONENTS.md` and the workspace `theme.js` needs to override one component's visual default (e.g. `card.borderColor` or `frame.wordmarkColor`)
- **THEN** it produces a `theme.js` `shape` export containing only that namespace/property, leaving all other properties at their defaults

### Requirement: Worked example using standard components
`COMPONENTS.md` SHALL include a complete, minimal, compilable slide example that uses at least one `comp` function, one `layout` function, and the `frame` group, in addition to `prim` calls, demonstrating how the catalog composes with the framework fundamentals from `INSTRUCTIONS.md`.

#### Scenario: Example is compilable as-is
- **WHEN** the example from `COMPONENTS.md` is saved as a slide file in a workspace
- **THEN** `npm run forge <slug>` succeeds without errors
