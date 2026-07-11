## MODIFIED Requirements

### Requirement: Namespace grouping — prim, comp, layout, frame, masters, run
`createLib` SHALL return an object with four function-namespace groups: `prim`, `comp`, `layout`, and `frame`. Each group SHALL be a plain object whose values are the functions belonging to that group. The `theme` object SHALL also be returned at the top level. `createLib` SHALL additionally accept an optional second parameter, `masterOverrides`, and return a `masters` group — a plain object mapping each registered master name to itself (e.g. `masters.CONTENT === 'CONTENT'`), distinct in kind from the function groups since its values are name constants, not functions. The `run` helper function (with its sub-helpers `run.bold`, `run.italic`, `run.color`) SHALL be returned as a top-level export named `run`. Callers SHALL destructure `const { theme, prim, comp, layout, frame, masters, run } = lib`.

#### Scenario: Groups are destructurable from lib
- **WHEN** a slide file calls `const { prim, comp, layout, frame, masters, theme, run } = lib`
- **THEN** all seven are defined and non-null

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

#### Scenario: masters is a name-constant map, not a function group
- **WHEN** `lib.masters` is inspected
- **THEN** every value is a string equal to its own key, and none are functions

#### Scenario: createLib works with zero or one argument, masters still populated
- **WHEN** `createLib()` or `createLib(themeOverrides)` is called without a `masterOverrides` argument
- **THEN** `lib.masters` is still populated, containing exactly the default master names from `src/lib/masters.js`
