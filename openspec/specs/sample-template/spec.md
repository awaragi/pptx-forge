# Sample Template Spec

## Purpose

Defines the content and behaviour of the sample template files (`src/sample/theme.js` and `src/sample/slides/deck.js`) that serve as the starting point for every new workspace.

## Requirements

### Requirement: Sample theme file provides working defaults
`src/sample/theme.js` SHALL export a default object that is a valid theme override for `createLib()` — compilable and runnable without modification. It SHALL include commented stubs for the most common override keys: `color`, `header.wordmark`, `header.badge`, `footer.left`, `footer.right`.

#### Scenario: Sample theme compiles without modification
- **WHEN** `bin/compile.js` is run against a workspace created from the sample template
- **THEN** the compile succeeds without errors related to the theme file

#### Scenario: Theme stubs are visible but optional
- **WHEN** a developer opens `theme.js` in a new workspace
- **THEN** they see commented examples for color, header, and footer overrides, with a minimal uncommented export that applies no overrides by default

### Requirement: Sample slide file produces a valid slide
`src/sample/slides/deck.js` SHALL export a default function matching the `(pptx, lib) => void` signature expected by `bin/compile.js`. It SHALL produce at least one slide using `lib` helpers (not raw pptxgenjs calls) and SHALL include a comment directing the author to `INSTRUCTIONS.md` and `lib.d.ts` for the full API.

#### Scenario: Sample slide compiles without modification
- **WHEN** `bin/compile.js` is run against a workspace created from the sample template
- **THEN** the compile succeeds and the output `.pptx` contains at least one slide

#### Scenario: Sample slide demonstrates basic lib usage
- **WHEN** a developer opens `slides/deck.js`
- **THEN** they see at least one example of a `lib` helper call (e.g. `SlideHeader`, `txt`, or `rrect`) so they understand the authoring pattern before reading the full docs
