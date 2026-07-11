## MODIFIED Requirements

### Requirement: Workspace layout and compile pipeline contract
`INSTRUCTIONS.md` SHALL document the workspace directory layout and the compile pipeline contract.

Specifically it SHALL cover:
- Project root structure: `lib.js`, `lib.d.ts`, `compile.js`, `workspaces/<slug>/`
- Inside a workspace: `theme.js` (optional), `masters.js` (optional — adds/overrides master definitions), `slide01-*.js` … `slideNN-*.js`, `out/` (generated)
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

#### Scenario: AI knows masters.js is an optional workspace file
- **WHEN** an AI reads INSTRUCTIONS.md and the deck calls for a custom or additional slide master
- **THEN** it knows it can add `workspaces/<slug>/masters.js` alongside `theme.js`, and that decks without one simply use the library's default master

## ADDED Requirements

### Requirement: lib.masters and the masters.js factory-function shape
`INSTRUCTIONS.md` SHALL document `lib.masters` as a top-level `lib` member alongside `theme`/`run`/`prim`: a plain array of every registered master `title` (e.g. `['BLANK']`), populated from the library default plus any workspace `masters.js`. It SHALL document that a workspace's `masters.js` default-exports a **factory function**, `(theme) => SlideMasterProps[]`, returning plain pptxgenjs `SlideMasterProps` objects — `{ title, background?, objects?, slideNumber?, margin? }` — with `title` mandatory and unique, and no `prim`/`comp`/`layout`/`tables` call involved anywhere. It SHALL explain that this factory runs once per compile (not per slide), so it should be a pure function of `theme` with no side effects. It SHALL show that colors/sizes/geometry/text SHOULD be read from `theme` (e.g. `theme.shape.frame.borderColor`, `theme.grid.marginX`, `theme.header.wordmark`) rather than hardcoded, so workspace theme overrides cascade automatically. It SHALL include the specific pptxgenjs object shapes an author needs inside `objects` (`{ rect: { shape, x, y, w, h, ... } }` for rectangles/rounded-rectangles, `{ line: {...} }` for lines — a different key, not a `shape` variant of `rect` — and `{ text: { text, options } }` for text). A workspace's `masters.js` factory returning entries whose `title` matches a library default replaces that entire default entry, and new titles are added alongside the defaults.

#### Scenario: AI knows lib.masters exists and how to read it
- **WHEN** an AI reads `INSTRUCTIONS.md`
- **THEN** it knows `lib.masters` is an array of registered master titles, populated from the library's default master plus any workspace `masters.js`

#### Scenario: AI can author a workspace masters.js file
- **WHEN** an AI needs a deck-specific master not covered by the library default
- **THEN** it creates `workspaces/<slug>/masters.js` default-exporting a function `(theme) => [...]` that returns plain `SlideMasterProps` objects, not calling `prim`/`comp`/`layout` functions

#### Scenario: AI reads theme constants instead of hardcoding values
- **WHEN** an AI authors a master needing a border color, corner radius, or margin
- **THEN** it references `theme.shape.*`/`theme.grid.*`/`theme.header`/`theme.footer` (the `theme` parameter its factory function receives) rather than writing a literal hex color or number

#### Scenario: AI knows the line-vs-rect key distinction
- **WHEN** an AI authors a master that needs a horizontal or vertical rule
- **THEN** it uses `{ line: {...} }`, not `{ rect: { shape: 'line', ... } }`

#### Scenario: AI knows title is mandatory and is the merge key
- **WHEN** an AI authors a master definition (library default or workspace `masters.js`)
- **THEN** it writes `{ title: '<TITLE>', ... }` as a plain object returned from the factory, and knows a workspace override with a matching `title` replaces that entire default entry wholesale

#### Scenario: AI knows the factory runs once, not per slide
- **WHEN** an AI authors a workspace `masters.js` factory function
- **THEN** it writes a pure function of `theme` with no side effects, knowing it is only ever called once per compile

### Requirement: addSlide masterName usage is the encouraged default, using the title directly
`INSTRUCTIONS.md` SHALL encourage `pptx.addSlide({ masterName: '<title>' })` as the default way to start a slide when the deck has masters defined beyond the library's `BLANK` default, in preference to a bare `pptx.addSlide()`. Since `title` already is the value `masterName` expects, this SHALL be a literal string, not a `lib.masters.<TITLE>` lookup — `lib.masters` is documented purely as a discovery aid (the array of what titles exist), not as the value passed into `addSlide`.

#### Scenario: AI defaults to masterName when masters are available
- **WHEN** an AI generates a new slide in a deck that has masters defined beyond `BLANK` (library defaults or workspace-provided)
- **THEN** it writes `pptx.addSlide({ masterName: '<title>' })` rather than a bare `pptx.addSlide()`

#### Scenario: AI passes the title as a literal string, not through lib.masters
- **WHEN** an AI writes `pptx.addSlide({ masterName: ... })`
- **THEN** it passes the master's `title` as a string literal, and does not write `lib.masters.<TITLE>` (since `lib.masters` is an array, not a name-keyed object)

#### Scenario: Guidance does not reference optional components
- **WHEN** `INSTRUCTIONS.md`'s masterName guidance is inspected
- **THEN** it contains no mention of `comp`, `layout`, or `frame`
