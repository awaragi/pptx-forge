## Purpose

Defines the `run` helper — a top-level export of `createLib` — for creating and merging PresentationJS run objects (`{ text, options }`) used to compose multi-style text within a single text box.

---

## Requirements

### Requirement: run smart run factory
`run(textOrRun, opts)` SHALL be a top-level export of `createLib` (accessible as `lib.run`). It is not a property of the `theme` object. When `textOrRun` is a string, it SHALL return a new plain object `{ text: textOrRun, options: { ...opts } }`. When `textOrRun` is an existing run object (plain object with `text` and `options` fields), it SHALL return a new plain object `{ text: textOrRun.text, options: { ...textOrRun.options, ...opts } }` — merging opts onto the existing options with `opts` winning on collision. The returned object SHALL always be a plain `{ text, options }` data object with no methods or prototype.

#### Scenario: String arg creates a new run
- **WHEN** `run('Hello', { bold: true })` is called
- **THEN** it returns `{ text: 'Hello', options: { bold: true } }`

#### Scenario: Run object arg merges opts onto existing options
- **WHEN** `run({ text: 'Hello', options: { bold: true } }, { color: 'accent1' })` is called
- **THEN** it returns `{ text: 'Hello', options: { bold: true, color: 'accent1' } }`

#### Scenario: opts win on collision when merging
- **WHEN** `run({ text: 'Hello', options: { color: 'accent1' } }, { color: 'accent2' })` is called
- **THEN** it returns `{ text: 'Hello', options: { color: 'accent2' } }`

#### Scenario: Original run object is not mutated
- **WHEN** `run(existingRun, { bold: true })` is called
- **THEN** `existingRun.options` is unchanged

#### Scenario: No opts arg produces empty options
- **WHEN** `run('Hello')` is called with no second argument
- **THEN** it returns `{ text: 'Hello', options: {} }`

### Requirement: run.bold shorthand
`run.bold(textOrRun)` SHALL be equivalent to `run(textOrRun, { bold: true })`. It is a sub-property of the `run` function (not a property of `theme`). It SHALL accept either a string or an existing run object as its first argument and SHALL follow the same merging semantics as `run`.

#### Scenario: String arg produces bold run
- **WHEN** `run.bold('Hello')` is called
- **THEN** it returns `{ text: 'Hello', options: { bold: true } }`

#### Scenario: Run object arg merges bold onto existing options
- **WHEN** `run.bold({ text: 'Hello', options: { color: 'accent1' } })` is called
- **THEN** it returns `{ text: 'Hello', options: { color: 'accent1', bold: true } }`

### Requirement: run.italic shorthand
`run.italic(textOrRun)` SHALL be equivalent to `run(textOrRun, { italic: true })`. It is a sub-property of the `run` function (not a property of `theme`). It SHALL accept either a string or an existing run object and SHALL follow the same merging semantics as `run`.

#### Scenario: String arg produces italic run
- **WHEN** `run.italic('Hello')` is called
- **THEN** it returns `{ text: 'Hello', options: { italic: true } }`

#### Scenario: Run object arg merges italic onto existing options
- **WHEN** `run.italic({ text: 'Hello', options: { bold: true } })` is called
- **THEN** it returns `{ text: 'Hello', options: { bold: true, italic: true } }`

### Requirement: run.color shorthand
`run.color(textOrRun, colorVal)` SHALL be equivalent to `run(textOrRun, { color: colorVal })`. It is a sub-property of the `run` function (not a property of `theme`). It SHALL accept either a string or an existing run object as its first argument and SHALL follow the same merging semantics as `run`.

#### Scenario: String arg produces colored run
- **WHEN** `run.color('Hello', 'accent1')` is called
- **THEN** it returns `{ text: 'Hello', options: { color: 'accent1' } }`

#### Scenario: Color overrides existing color
- **WHEN** `run.color({ text: 'Hello', options: { color: 'accent1' } }, 'accent2')` is called
- **THEN** it returns `{ text: 'Hello', options: { color: 'accent2' } }`

### Requirement: prim.text accepts run arrays as content
`prim.text` SHALL accept an array of run objects (each `{ text, options }`) as its `content` argument. When an array is passed, it SHALL be forwarded directly to `slide.addText`. This requirement is unchanged from the previous version — the change is only in how runs are constructed (via `run(...)` instead of `theme.run(...)`).

#### Scenario: Array of runs renders as multi-run text
- **WHEN** `prim.text(slide, box, [run('A', { bold: true }), run('B', { color: 'accent1' })], { fontSize: 14 }, 'name')` is called
- **THEN** `slide.addText` is called with the array as its first argument and shared opts as its second

#### Scenario: layout.calloutBanner accepts run array as content
- **WHEN** `layout.calloutBanner(slide, box, [run.bold('Note: '), run('details here')], {}, 'name')` is called
- **THEN** the run array is forwarded to `slide.addText` without modification

#### Scenario: layout.pullQuote accepts run array as content
- **WHEN** `layout.pullQuote(slide, box, [run.italic('Quote'), run(' — Author')], {}, 'name')` is called
- **THEN** the run array is forwarded to `slide.addText` without modification
