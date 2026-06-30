## MODIFIED Requirements

### Requirement: Sample slide file produces a valid slide
`src/sample/slides/deck.js` SHALL export a default function matching the `(pptx, lib) => void` signature expected by `bin/compile.js`. It SHALL produce exactly **7 slides**, one per component category, using `lib` helpers (not raw pptxgenjs calls). Each slide SHALL include a `frame.border`, `frame.slideHeader`, and `frame.slideFooter`. It SHALL include a comment directing the author to `INSTRUCTIONS.md` and `lib.d.ts` for the full API.

#### Scenario: Sample compiles and produces 7 slides
- **WHEN** `bin/compile.js` is run against the sample workspace
- **THEN** the compile succeeds and the output `.pptx` contains exactly 7 slides

#### Scenario: Each showcase slide includes frame chrome
- **WHEN** any showcase slide is inspected
- **THEN** it contains named shapes for border, header wordmark, header badge, footer rule, footer left text, footer right text

### Requirement: Sample slide demonstrates basic lib usage
`src/sample/slides/deck.js` SHALL demonstrate every component exported by `createLib` across its 7 slides. The slide sequence SHALL be: (1) Primitives, (2) Cards & Icon Components, (3) Flow & Steps, (4) Stats, Progress & Tags, (5) Layout Blocks, (6) Tables, (7) Full-Slide Frame Example. Each slide SHALL use `layout.sectionTitle` as its heading.

#### Scenario: Slide 1 demonstrates prim group
- **WHEN** a developer opens `slides/deck.js` and reads slide 1
- **THEN** they see calls to `prim.text`, `prim.roundRect`, `prim.circle`, `prim.hLine`, `prim.vLine`, `prim.bullets`

#### Scenario: Slide 2 demonstrates card components
- **WHEN** a developer reads slide 2
- **THEN** they see calls to `comp.infoCard`, `comp.accentCard`, `comp.overlayCard`, `comp.fileCard`, `comp.iconBox`, `comp.imageCard`, `comp.imageHolder`

#### Scenario: Slide 3 demonstrates flow components
- **WHEN** a developer reads slide 3
- **THEN** they see calls to `comp.flowBox`, `comp.flowArrow`, `comp.stepFlow`, `comp.numberedStep`, `comp.stepBox`, `comp.phaseLabel`

#### Scenario: Slide 4 demonstrates stat and tag components
- **WHEN** a developer reads slide 4
- **THEN** they see calls to `comp.iconStat`, `comp.progressBar`, `comp.tagBadge`, `comp.bulletIconList`, `comp.twoColumnRow`

#### Scenario: Slide 5 demonstrates layout blocks
- **WHEN** a developer reads slide 5
- **THEN** they see calls to `layout.sectionTitle`, `layout.darkPanelHeader`, `layout.labeledDivider`, `layout.calloutBanner`, `layout.pullQuote`, `layout.labeledSection`

#### Scenario: Slide 6 demonstrates table components
- **WHEN** a developer reads slide 6
- **THEN** they see calls to `tables.dataTable` and `tables.comparisonTable`

#### Scenario: Slide 7 demonstrates full frame
- **WHEN** a developer reads slide 7
- **THEN** they see `frame.border`, `frame.slideHeader`, `frame.slideFooter` used explicitly alongside a content example
