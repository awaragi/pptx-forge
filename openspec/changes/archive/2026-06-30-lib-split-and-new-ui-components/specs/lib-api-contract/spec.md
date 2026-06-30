## MODIFIED Requirements

### Requirement: comp group exports
`lib.comp` SHALL export exactly: `phaseLabel`, `flowBox`, `flowArrow`, `numberedStep`, `infoCard`, `accentCard`, `overlayCard`, `fileCard`, `stepBox`, `iconStat`, `iconBox`, `bulletIconList`, `imageCard`, `twoColumnRow`, `progressBar`, `tagBadge`, `stepFlow`, `imageHolder`, `labeledSection`. The old names `smallCard`, `benefitCard`, `miniCard`, `artifactCard`, and `phaseBox` SHALL NOT be present.

#### Scenario: All nineteen comp functions accessible
- **WHEN** `lib.comp` is inspected
- **THEN** it contains exactly the nineteen listed functions

#### Scenario: Old names are absent
- **WHEN** `lib.comp` is inspected
- **THEN** it does NOT contain `smallCard`, `benefitCard`, `miniCard`, `artifactCard`, or `phaseBox`

### Requirement: layout group exports
`lib.layout` SHALL export: `sectionTitle`, `darkPanelHeader`, `labeledDivider`, `calloutBanner`, `pullQuote`, `labeledSection`.

#### Scenario: All six layout functions accessible
- **WHEN** `lib.layout` is inspected
- **THEN** it contains `sectionTitle`, `darkPanelHeader`, `labeledDivider`, `calloutBanner`, `pullQuote`, `labeledSection` as functions

### Requirement: camelCase naming, no abbreviations
All exported function names SHALL be camelCase. Specifically: `text` (not `txt`), `roundRect` (not `rrect`), `hLine` (not `hline`), `vLine` (not `vline`), `infoCard` (not `InfoCard` or `smallCard`).

#### Scenario: Old abbreviated and old camelCase names no longer exported
- **WHEN** the return value of `createLib` is inspected
- **THEN** it does NOT contain `txt`, `rrect`, `hline`, `vline`, `smallCard`, `benefitCard`, `miniCard`, `artifactCard`, `phaseBox`, or any PascalCase function names at the top level

### Requirement: lib.d.ts declares ThemeShape and per-component sub-interfaces
`lib.d.ts` SHALL declare a `ThemeShape` interface describing the full structure of `theme.shape`, with nested interfaces for each component namespace including new ones. New interfaces SHALL be declared for: `IconStatShape`, `IconBoxShape`, `ImageCardShape`, `ProgressBarShape`, `TagBadgeShape`, `DataTableShape`, `ComparisonTableShape`. The `Lib` interface SHALL expose `tables` as a `TablesGroup`. All existing shape interfaces SHALL remain.

#### Scenario: ThemeShape includes new component shape interfaces
- **WHEN** `lib.d.ts` is inspected
- **THEN** `ThemeShape` contains properties `iconStat`, `iconBox`, `imageCard`, `progressBar`, `tagBadge`, `dataTable`, `comparisonTable` in addition to all existing properties

#### Scenario: Lib interface includes tables group
- **WHEN** `lib.d.ts` is inspected
- **THEN** the `Lib` interface contains a `tables` property typed as `TablesGroup`

#### Scenario: TablesGroup declares dataTable and comparisonTable
- **WHEN** `lib.d.ts` is inspected
- **THEN** `TablesGroup` contains `dataTable` and `comparisonTable` as function signatures

### Requirement: Content field naming standards
Component content objects SHALL use standardized field names: `title` and `body` for card heading and body copy; `label` for short badge or identifier text; `steps` (string array) for structured list content in `stepBox`; `subtitle` for secondary panel text; `text` for single-text layout functions; `items` (string array) for `bullets`; `value` (number 0–1 or string) for `iconStat` and `progressBar`; `icon` (UTF-8 string) for `iconBox`, `imageCard`, `imageHolder`; `headers` (string array) and `rows` for table components.

#### Scenario: stepBox steps is a string array
- **WHEN** `comp.stepBox(slide, box, { label: 'Foundation', steps: ['Setup', 'Intake'] }, opts, name)` is called
- **THEN** the rendered text joins the array with ' · ' separator

#### Scenario: progressBar value is a number 0–1
- **WHEN** `comp.progressBar(slide, box, { value: 0.72, label: 'Adoption' }, opts, name)` is called
- **THEN** the fill bar renders at 72% of the available width

#### Scenario: stepFlow receives an array of label objects
- **WHEN** `comp.stepFlow(slide, box, [{ label: 'A' }, { label: 'B' }, { label: 'C' }], opts, name)` is called
- **THEN** three flow boxes and two arrows are rendered across box.w

## ADDED Requirements

### Requirement: tables namespace
`createLib` SHALL return a `tables` property containing `dataTable` and `comparisonTable`. The namespace SHALL be destructurable alongside `prim`, `comp`, `layout`, and `frame`.

#### Scenario: tables is destructurable from lib
- **WHEN** a slide file calls `const { tables } = lib`
- **THEN** `tables` is a plain object containing `dataTable` and `comparisonTable` as functions

#### Scenario: tables functions are callable
- **WHEN** `lib.tables.dataTable` and `lib.tables.comparisonTable` are inspected
- **THEN** both are functions
