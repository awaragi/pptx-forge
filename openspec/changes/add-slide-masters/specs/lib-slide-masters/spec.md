## ADDED Requirements

### Requirement: masters.js exports named master definitions
`src/lib/masters.js` SHALL export a default array of master definitions, each of shape `{ name, build(pptx, slide) }`, where `name` is a unique string identifying the master and `build` is a function called with the live `pptx` instance and a slide-like object, authored the same way a slide file's default export is authored — calling `prim`/`frame`/`comp` functions against `slide`.

#### Scenario: Default export is an array of name/build pairs
- **WHEN** `src/lib/masters.js`'s default export is inspected
- **THEN** it is an array where every entry has a string `name` and a function `build`

#### Scenario: build() draws using existing lib functions
- **WHEN** a default master's `build(pptx, slide)` function is inspected
- **THEN** it calls functions from `prim`/`frame`/`comp` against `slide`, the same functions a slide file would call against a real `pptx.addSlide()` result

### Requirement: Recorder captures draw calls into pptxgenjs master object descriptors
`masters.js` SHALL implement a private recorder — not exposed on `lib` — that a master's `build()` function draws into instead of a real slide. The recorder SHALL expose `addShape(shapeName, opts)` and `addText(text, opts)` with the same call signatures `prim.js` already uses against a real `slide`. `addText` calls SHALL be captured as `{ text: { text, options: opts } }`. `addShape` calls SHALL be captured as `{ line: opts }` when `shapeName` is `'line'`, and as `{ rect: { shape: shapeName, ...opts } }` for every other `shapeName` (including `'rect'`, `'roundRect'`, `'ellipse'`).

#### Scenario: Text capture matches pptxgenjs TextProps shape
- **WHEN** a `build()` function calls `prim.text(slide, box, 'Hello', opts, name)` against the recorder
- **THEN** the recorder's captured objects list gains one entry `{ text: { text: 'Hello', options: { ...box, ...opts, objectName: name } } }`

#### Scenario: roundRect capture carries the shape field
- **WHEN** a `build()` function calls `prim.roundRect(slide, box, undefined, opts, name)` against the recorder
- **THEN** the recorder's captured objects list gains one entry `{ rect: { shape: 'roundRect', ...box, rectRadius: <theme radius>, ...opts, objectName: name } }`

#### Scenario: hLine/vLine capture uses the line key, not rect
- **WHEN** a `build()` function calls `prim.hLine(slide, box, undefined, opts, name)` against the recorder
- **THEN** the recorder's captured objects list gains one entry keyed `line`, not `rect`

#### Scenario: Recorder is not reachable from lib
- **WHEN** the return value of `createLib()` is inspected
- **THEN** it does not expose `beginMaster`, `endMaster`, or any recorder function

### Requirement: applyMasters registers merged masters on the live pptx instance
`masters.js` SHALL export `applyMasters(pptx, lib, masterOverrides)`. It SHALL merge the default master list with `masterOverrides` (an array of the same `{ name, build }` shape) keyed by `name`: an override entry whose `name` matches a default entry SHALL replace that default entry wholesale; an override entry whose `name` does not match any default SHALL be appended. For each entry in the merged list, `applyMasters` SHALL run the recorder (`beginMaster`/`build`/`endMaster`) and SHALL make exactly one `pptx.defineSlideMaster({ title: name, objects })` call per master.

#### Scenario: Default masters are registered with no overrides
- **WHEN** `applyMasters(pptx, lib, [])` is called
- **THEN** `pptx.defineSlideMaster()` is called once per entry in the default master list, each with `title` equal to that entry's `name`

#### Scenario: Override with a matching name replaces the default wholesale
- **WHEN** `masterOverrides` contains an entry with `name: 'CONTENT'` and the default list also has an entry named `'CONTENT'`
- **THEN** `pptx.defineSlideMaster()` is called for `'CONTENT'` using only the override's `build` function — the default `'CONTENT'` build function does not also run

#### Scenario: Override with a new name is appended
- **WHEN** `masterOverrides` contains an entry with `name: 'CUSTOM'` that does not match any default master name
- **THEN** `pptx.defineSlideMaster()` is called for `'CUSTOM'` in addition to every default master

#### Scenario: defineSlideMaster is called exactly once per merged master
- **WHEN** `applyMasters` runs against a merged list of N masters
- **THEN** `pptx.defineSlideMaster()` is called exactly N times, once per merged entry

### Requirement: createLib exposes registered master names as lib.masters
`createLib(themeOverrides, masterOverrides)` SHALL accept an optional second parameter, an array of `{ name }`-shaped entries (the same `masterOverrides` array consumed by `applyMasters`). It SHALL merge the default master names with `masterOverrides`' names, by the same replace-on-match / append-if-new rule as `applyMasters`, and return the result as `lib.masters`, a plain object mapping each name to itself (`lib.masters.CONTENT === 'CONTENT'`). This resolution SHALL NOT require a `pptx` instance and SHALL NOT invoke any `build` function.

#### Scenario: lib.masters contains default master names
- **WHEN** `createLib(themeOverrides)` is called with no `masterOverrides` argument
- **THEN** `lib.masters` contains one key per default master in `masters.js`, each mapping to its own name string

#### Scenario: lib.masters includes workspace-added master names
- **WHEN** `createLib(themeOverrides, [{ name: 'CUSTOM', build() {} }])` is called
- **THEN** `lib.masters.CUSTOM === 'CUSTOM'`

#### Scenario: createLib does not require pptx to resolve lib.masters
- **WHEN** `createLib(themeOverrides, masterOverrides)` is called before any `pptxgenjs` instance exists
- **THEN** it returns successfully and `lib.masters` is populated

### Requirement: Workspaces may define an optional masters.js override file
A workspace directory MAY contain `workspaces/<slug>/masters.js`, exporting a default array in the same `{ name, build(pptx, slide) }` shape as `src/lib/masters.js`'s default export. Unlike `theme.js`, this file is optional — a workspace without it SHALL receive only the library's default masters.

#### Scenario: Workspace without masters.js gets library defaults only
- **WHEN** a workspace directory has no `masters.js` file
- **THEN** the compiled deck's registered masters are exactly the library's default master list

#### Scenario: Workspace masters.js overrides and extends defaults
- **WHEN** a workspace's `masters.js` exports `[{ name: 'CONTENT', build(pptx, slide) {...} }, { name: 'DIVIDER', build(pptx, slide) {...} }]` and the library defaults include a `'CONTENT'` master
- **THEN** the compiled deck registers the workspace's `'CONTENT'` build (not the library default) plus a new `'DIVIDER'` master, plus every other unmodified library default

### Requirement: Slide files reference masters via lib.masters, not raw strings
`INSTRUCTIONS.md` guidance and generated slide files SHALL reference a master by `pptx.addSlide({ masterName: lib.masters.<NAME> })` rather than a hardcoded string literal.

#### Scenario: Slide targets a specific master
- **WHEN** a slide file calls `pptx.addSlide({ masterName: lib.masters.CONTENT })`
- **THEN** the resulting slide inherits the chrome/background registered under the `'CONTENT'` master

### Requirement: No placeholder object support
The recorder and `masters.js` SHALL NOT provide a mechanism for capturing pptxgenjs `placeholder` master objects. Master `build()` functions are limited to the shape/text primitives already available through `prim`.

#### Scenario: Placeholder objects are out of scope
- **WHEN** `src/lib/masters.js` and its recorder are inspected
- **THEN** no function or code path produces a `{ placeholder: ... }` descriptor
