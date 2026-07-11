## Purpose

Defines the source code module structure for `src/`. `src/lib.js` SHALL be refactored from a monolithic file into seven focused modules with a clean one-directional dependency graph and a barrel re-export at `src/index.js`.

---

## Requirements

### Requirement: Source split into eight modules
The `src/lib/` directory SHALL contain exactly these files after the change: `theme.js`, `primitives.js`, `components.js`, `tables.js`, `layout.js`, `frame.js`, `masters.js`, `lib.js` (factory), plus a barrel re-export at `src/lib/index.js`. Each file SHALL contain only the concerns named by its filename. `masters.js` SHALL contain the default master definitions, `mergeMastersByTitle`, and `applyMasters` — no other module SHALL implement master-registration logic.

#### Scenario: All module files exist in src/lib/
- **WHEN** the `src/lib/` directory is listed
- **THEN** it contains `theme.js`, `primitives.js`, `components.js`, `tables.js`, `layout.js`, `frame.js`, `masters.js`, `lib.js`, and `index.js`

#### Scenario: theme.js contains defaultTheme and deepMerge
- **WHEN** `src/lib/theme.js` is inspected
- **THEN** it exports `defaultTheme` and `deepMerge` and contains no function implementations for slide-building primitives, components, or masters

#### Scenario: lib.js is the factory assembler
- **WHEN** `src/lib/lib.js` is inspected
- **THEN** it imports from all sibling modules, including `masters.js`, and exports `createLib` — it contains no component or master logic itself

#### Scenario: masters.js owns all master-registration logic
- **WHEN** `src/lib/masters.js` is inspected
- **THEN** it is the only module that calls `pptx.defineSlideMaster()`, and no other module in `src/lib/` references `defineSlideMaster`

### Requirement: One-directional dependency graph — no circular imports
Module imports SHALL strictly follow the layer order: `theme.js` → `primitives.js` → `{components,tables,layout,frame}.js` → `lib.js` → `index.js`. No module in a lower layer SHALL import from a module in a higher layer.

#### Scenario: primitives.js does not import from components.js or layout.js
- **WHEN** `src/primitives.js` is inspected for import statements
- **THEN** it imports only from `theme.js` or has no `src/` imports at all

#### Scenario: components.js does not import from layout.js or frame.js
- **WHEN** `src/components.js` is inspected for import statements
- **THEN** it does not import from `layout.js` or `frame.js`

#### Scenario: tables.js does not import from components.js, layout.js, or frame.js
- **WHEN** `src/tables.js` is inspected for import statements
- **THEN** it does not import from `components.js`, `layout.js`, or `frame.js`

### Requirement: src/index.js barrel re-exports createLib only
`src/index.js` SHALL re-export `createLib` from `./lib.js` and SHALL export nothing else.

#### Scenario: Barrel export resolves createLib
- **WHEN** a slide file does `import { createLib } from '../../src/index.js'`
- **THEN** `createLib` is the same function as obtained from `import { createLib } from '../../src/lib.js'`

#### Scenario: Barrel contains no other exports
- **WHEN** `src/index.js` is inspected
- **THEN** it contains exactly one re-export statement for `createLib`

### Requirement: Existing src/lib/lib.js import path remains valid
`src/lib/lib.js` SHALL continue to export `createLib` as a named export. Workspaces that currently import `{ createLib } from '.../lib.js'` SHALL work without modification.

#### Scenario: Named import from src/lib/lib.js still resolves
- **WHEN** a file does `import { createLib } from '.../lib/lib.js'`
- **THEN** the import resolves without error and `createLib` is a callable function

#### Scenario: createLib() returns a valid Lib object
- **WHEN** `createLib()` is called with no arguments
- **THEN** the returned object contains `theme`, `run`, `prim`, `comp`, `tables`, `layout`, `frame`, and `masters`
