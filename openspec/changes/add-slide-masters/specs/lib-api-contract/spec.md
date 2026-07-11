## MODIFIED Requirements

### Requirement: Namespace grouping — prim, comp, tables, layout, frame, masters, run
`createLib` SHALL return an object with five function-namespace groups: `prim`, `comp`, `tables`, `layout`, and `frame`. Each group SHALL be a plain object whose values are the functions belonging to that group. The `theme` object SHALL also be returned at the top level. `createLib` SHALL additionally accept an optional second parameter, `masterOverrides` — a factory function `(theme) => SlideMasterProps[]`, or absent. `createLib` SHALL resolve `theme`, invoke the library's default master factory and (if provided) `masterOverrides` with that `theme`, merge the results by title exactly once, and return two additional members: `masters` — a plain array of every registered title (e.g. `masters === ['BLANK']`) — and `masterDefinitions` — the merged plain `SlideMasterProps[]` array, for orchestrator use in registering masters on `pptx`. `masters` is distinct in kind from the function groups since it's an array of strings, not a group of functions. The `run` helper function (with its sub-helpers `run.bold`, `run.italic`, `run.color`) SHALL be returned as a top-level export named `run`. Callers SHALL destructure `const { theme, prim, comp, tables, layout, frame, masters, run } = lib`.

#### Scenario: Groups are destructurable from lib
- **WHEN** a slide file calls `const { prim, comp, tables, layout, frame, masters, theme, run } = lib`
- **THEN** all eight are defined and non-null

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

#### Scenario: masters is a plain array of title strings, not a function group or map
- **WHEN** `lib.masters` is inspected
- **THEN** it is an array, every element is a string, and it contains no functions

#### Scenario: masterDefinitions is the merged plain array, generated once
- **WHEN** `lib.masterDefinitions` is inspected
- **THEN** it is an array of plain `SlideMasterProps`-shaped objects (each with a `title` matching an entry in `lib.masters`), produced by calling the master factory function(s) exactly once during `createLib`

#### Scenario: createLib works with zero or one argument, masters still populated
- **WHEN** `createLib()` or `createLib(themeOverrides)` is called without a `masterOverrides` argument
- **THEN** `lib.masters` is still populated, equal to exactly the default master titles from `src/lib/masters.js` (i.e. `['BLANK']`), and `lib.masterDefinitions` is `[{ title: 'BLANK', objects: [] }]`

#### Scenario: masterOverrides is a factory function, not an array
- **WHEN** `createLib`'s second parameter is inspected
- **THEN** it is documented and typed as `(theme) => SlideMasterProps[]`, not as a plain array of master entries
