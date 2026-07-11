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
- **THEN** it knows it can add `workspaces/<slug>/masters.js` alongside `theme.js`, and that decks without one simply use the library's default masters

## ADDED Requirements

### Requirement: lib.masters and the masters.js authoring shape
`INSTRUCTIONS.md` SHALL document `lib.masters` as a top-level `lib` member alongside `theme`/`run`/`prim`: a plain object mapping each registered master name to itself. It SHALL document that master definitions (both the library defaults and an optional workspace `masters.js`) are authored as `{ name, build(pptx, slide) }` entries, where `build` is written exactly like a slide file's default export — calling `prim`/`frame`/`comp` functions against `slide` — and that a workspace's `masters.js` default-exports an array of such entries, with entries whose `name` matches a library default replacing it, and new names being added alongside the defaults.

#### Scenario: AI knows lib.masters exists and how to read it
- **WHEN** an AI reads `INSTRUCTIONS.md`
- **THEN** it knows `lib.masters` is a map of master names to themselves, populated from the library's default masters plus any workspace `masters.js`

#### Scenario: AI can author a workspace masters.js file
- **WHEN** an AI needs a deck-specific master not covered by the library defaults
- **THEN** it creates `workspaces/<slug>/masters.js` exporting an array of `{ name, build(pptx, slide) }` entries, writing `build` the same way it writes a slide file's body

### Requirement: addSlide masterName usage is the encouraged default
`INSTRUCTIONS.md` SHALL encourage `pptx.addSlide({ masterName: lib.masters.<NAME> })` as the default way to start a slide when the deck uses masters, over `pptx.addSlide()` followed by manually calling `frame.border`/`frame.slideHeader`/`frame.slideFooter` on every slide. It SHALL note that the manual `frame.*` chrome pattern remains available for one-off custom chrome that doesn't warrant a dedicated master.

#### Scenario: AI defaults to masterName over manual chrome
- **WHEN** an AI generates a new slide in a deck that has masters defined (library defaults or workspace-provided)
- **THEN** it writes `pptx.addSlide({ masterName: lib.masters.<NAME> })` rather than `pptx.addSlide()` plus manual `frame.*` calls, unless the slide needs one-off chrome no existing master provides

#### Scenario: AI references masters through lib.masters, not string literals
- **WHEN** an AI writes `pptx.addSlide({ masterName: ... })`
- **THEN** it passes `lib.masters.<NAME>`, never a bare string literal
