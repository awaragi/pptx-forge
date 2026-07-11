## ADDED Requirements

### Requirement: masters.js default-exports a theme-taking factory function
`src/lib/masters.js` SHALL default-export a factory function of shape `(theme) => SlideMasterProps[]`, where each returned element is a plain pptxgenjs `SlideMasterProps` object (`{ title, background?, objects?, slideNumber?, margin? }`) with `title` mandatory and unique. The factory MAY reference `theme` values (colors, sizes, grid coordinates, header/footer text) when building descriptors, so workspace theme overrides cascade into master content. The factory SHALL NOT call any `prim`/`comp`/`layout`/`tables` function, and SHALL NOT receive or use a `pptx`/`slide` object.

#### Scenario: Default export is a function returning plain SlideMasterProps objects
- **WHEN** `src/lib/masters.js`'s default export is inspected
- **THEN** it is a function which, when called with a `theme` object, returns an array where every entry has a string `title` and no function properties

#### Scenario: The factory may read from theme
- **WHEN** the factory needs a color, font size, or grid coordinate
- **THEN** it reads it from the `theme` argument (e.g. `theme.shape.frame.borderColor`, `theme.grid.marginX`) rather than a hardcoded literal, so workspace theme overrides cascade into the master automatically

#### Scenario: The factory is pure
- **WHEN** the factory is called twice with the same `theme` value
- **THEN** it returns equivalent results both times, with no side effects

### Requirement: The library ships exactly one trivial default master
`src/lib/masters.js`'s default factory SHALL return exactly one entry, `{ title: 'BLANK', objects: [] }`, regardless of `theme`. This SHALL NOT reproduce `frame.js`'s border/header/footer chrome or any other visual content — it exists solely to prove that master registration and `masterName` resolution work end-to-end.

#### Scenario: Default master list has exactly one entry
- **WHEN** `src/lib/masters.js`'s default factory is called with any `theme` object
- **THEN** it returns exactly one entry, `{ title: 'BLANK', objects: [] }`

### Requirement: mergeMastersByTitle merges already-generated plain arrays
`masters.js` SHALL export `mergeMastersByTitle(defaults, overrides)`, operating on two arrays of already-generated, plain `SlideMasterProps`-shaped entries — never on factory functions or `theme`. An override entry whose `title` matches a default entry's `title` SHALL replace that default entry — the entire object — wholesale. An override entry whose `title` does not match any default SHALL be appended. This SHALL be implemented independently of `theme.js`'s `deepMerge`, which cannot express by-title array merging (it treats arrays as opaque values to be wholesale-replaced).

#### Scenario: Override with a matching title replaces the default wholesale
- **WHEN** `mergeMastersByTitle(defaults, overrides)` is called and `overrides` contains an entry titled `'CONTENT'` matching a default also titled `'CONTENT'`
- **THEN** the merged result's `'CONTENT'` entry is the override's entry in full, not the default's

#### Scenario: Override with a new title is appended
- **WHEN** `overrides` contains an entry titled `'CUSTOM'` with no matching default
- **THEN** the merged result contains `'CUSTOM'` in addition to every default entry

#### Scenario: No overrides returns the defaults unchanged
- **WHEN** `mergeMastersByTitle(defaults, [])` is called
- **THEN** the merged result equals `defaults`

### Requirement: createLib generates masters exactly once and exposes lib.masters/lib.masterDefinitions
`createLib(themeOverrides, masterOverrides)` SHALL accept an optional second parameter, `masterOverrides` — a factory function of the same `(theme) => SlideMasterProps[]` shape as the library default, or absent. After resolving `theme` (as it already does for `themeOverrides`), `createLib` SHALL call the library's default factory with that `theme`, call `masterOverrides` with that same `theme` if provided, merge the two results via `mergeMastersByTitle` exactly once, and expose the result as two properties: `lib.masters` (a plain array of the merged entries' `title`s, e.g. `['BLANK']`) and `lib.masterDefinitions` (the merged plain `SlideMasterProps[]` itself). Neither factory function SHALL be invoked again after this point.

#### Scenario: lib.masters contains the default master title
- **WHEN** `createLib(themeOverrides)` is called with no `masterOverrides` argument
- **THEN** `lib.masters` is `['BLANK']` and `lib.masterDefinitions` is `[{ title: 'BLANK', objects: [] }]`

#### Scenario: lib.masters includes workspace-added master titles
- **WHEN** `createLib(themeOverrides, (theme) => [{ title: 'CUSTOM', objects: [] }])` is called
- **THEN** `lib.masters` includes `'CUSTOM'` and `lib.masterDefinitions` includes the `'CUSTOM'` entry

#### Scenario: createLib does not require pptx
- **WHEN** `createLib(themeOverrides, masterOverrides)` is called before any `pptxgenjs` instance exists
- **THEN** it returns successfully with both `lib.masters` and `lib.masterDefinitions` populated

### Requirement: applyMasters registers the already-generated masters, without recomputing anything
`masters.js` SHALL export `applyMasters(pptx, masterDefinitions)`, where `masterDefinitions` is the already-merged plain array `createLib` produced (`lib.masterDefinitions`). `applyMasters` SHALL call `pptx.defineSlideMaster(entry)` once per entry, passing each through unmodified. `applyMasters` SHALL NOT accept or require a factory function, `theme`, or the `lib` object — only the plain array.

#### Scenario: Default master is registered with no overrides
- **WHEN** `applyMasters(pptx, [{ title: 'BLANK', objects: [] }])` is called
- **THEN** `pptx.defineSlideMaster({ title: 'BLANK', objects: [] })` is called once

#### Scenario: defineSlideMaster is called exactly once per entry
- **WHEN** `applyMasters` runs against an array of N entries
- **THEN** `pptx.defineSlideMaster()` is called exactly N times

#### Scenario: applyMasters never invokes a factory function
- **WHEN** `applyMasters`'s implementation is inspected
- **THEN** it contains no call to any master factory function and no reference to `theme`

### Requirement: Workspaces may define an optional masters.js override factory
A workspace directory MAY contain `workspaces/<slug>/masters.js`, default-exporting a factory function of the same `(theme) => SlideMasterProps[]` shape as `src/lib/masters.js`'s default export. This file is optional at the compile-pipeline level — a workspace without it SHALL receive only the library's default (`BLANK`) master.

#### Scenario: Workspace without masters.js gets the library default only
- **WHEN** a workspace directory has no `masters.js` file
- **THEN** the compiled deck's registered masters are exactly `[{ title: 'BLANK', objects: [] }]`

#### Scenario: Workspace masters.js overrides and extends defaults
- **WHEN** a workspace's `masters.js` default-exports `(theme) => [{ title: 'BLANK', objects: [...] }, { title: 'CONTENT', objects: [...] }]`
- **THEN** the compiled deck registers the workspace's `'BLANK'` (not the library default) plus the new `'CONTENT'` master

### Requirement: src/sample/masters.js scaffolds new workspaces
`src/sample/masters.js` SHALL exist as a commented-out example of the factory-function shape, demonstrating theme-constant usage, mirroring `src/sample/theme.js`'s existing convention of being copied byte-identical into every new workspace rather than generated fresh per workspace.

#### Scenario: Sample file demonstrates the shape in comments
- **WHEN** `src/sample/masters.js` is inspected
- **THEN** it default-exports a factory function whose body contains a commented-out example entry referencing at least one `theme` value, not a live/active master that changes compiled output by default

### Requirement: Slide files reference a master by its title string directly
Since `title` already is the value pptxgenjs's `masterName` expects, slide files SHALL reference a master with `pptx.addSlide({ masterName: '<title>' })`, a plain string — not through a `lib.masters.<TITLE>` lookup. `lib.masters` exists only as an array for discovering which titles are registered.

#### Scenario: Slide targets a specific master
- **WHEN** a slide file calls `pptx.addSlide({ masterName: 'BLANK' })`
- **THEN** the resulting slide inherits the (empty) content registered under the `'BLANK'` master

### Requirement: Placeholders are supported by pptxgenjs but undocumented and unadvertised
Since a master factory's return value is passed straight through to `pptx.defineSlideMaster()` unmodified, a `{ placeholder: ... }` descriptor SHALL work exactly as pptxgenjs itself supports it — nothing in `applyMasters` or `mergeMastersByTitle` filters, rejects, or special-cases it. `INSTRUCTIONS.md`/`COMPONENTS.md` SHALL NOT document or encourage placeholder usage, since placeholders are PowerPoint-editable regions for a human to fill in after export, which don't fit this library's generate-once authoring model.

#### Scenario: A placeholder descriptor works if an author writes one
- **WHEN** a master factory returns an entry containing a `{ placeholder: {...} }` descriptor
- **THEN** `pptx.defineSlideMaster()` registers it exactly as pptxgenjs would for any other caller — the library does not filter, reject, or special-case it

#### Scenario: Documentation does not teach or recommend placeholders
- **WHEN** `INSTRUCTIONS.md` documents what a master `objects` array may contain
- **THEN** it does not include `placeholder` among the documented/recommended descriptor types, even though it would work if used

### Requirement: comp/layout/prim/tables are not usable inside a master factory
Since masters are plain pptxgenjs object literals parameterized only by `theme`, `comp`, `layout`, `prim`, and `tables` functions SHALL NOT appear anywhere in a master factory. `tables`-shaped content (and any `addTable`/`addMedia`-equivalent descriptor) SHALL NOT be representable at all, since pptxgenjs's master `objects` union has no `table`/`media` variant — this is independent of authoring mechanism.

#### Scenario: Documentation states library functions are not usable in masters
- **WHEN** `INSTRUCTIONS.md`/`COMPONENTS.md` document what a master factory may contain
- **THEN** they state that `prim`/`comp`/`layout`/`tables` functions do not apply — the factory returns plain pptxgenjs descriptors, parameterized only by `theme`
