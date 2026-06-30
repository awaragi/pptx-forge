## Purpose

Defines how `compile.js` discovers and loads slide files for a given workspace slug — covering directory layout, file filter, load order, and error behaviour.

---

## Requirements

### Requirement: Slide files live in a slides/ subfolder
`compile.js` SHALL discover slide files by scanning `workspaces/<slug>/slides/` — a dedicated subdirectory of the workspace root. `theme.js` SHALL remain at the workspace root (`workspaces/<slug>/theme.js`). No filename format or prefix pattern SHALL be required inside the `slides/` directory. Alphabetic sort determines load order. All `.js` files found in `slides/` are treated as slide files.

#### Scenario: slides/ subfolder is scanned for JS files
- **WHEN** a workspace has the structure `workspaces/my-deck/slides/overview.js`
- **THEN** `compile.js` imports and executes `overview.js` as a slide file

#### Scenario: theme.js at workspace root is not in slides/ scope
- **WHEN** a workspace contains `theme.js` at the workspace root and slide files in `slides/`
- **THEN** `theme.js` is loaded as theme overrides and is NOT imported as a slide file

#### Scenario: Alphabetic sort determines load order
- **WHEN** `slides/` contains `a-first.js`, `b-second.js`, and `c-third.js`
- **THEN** they are loaded in that alphabetic order

#### Scenario: Files without slide prefix are loaded
- **WHEN** `slides/` contains `overview.js` (no `slide` prefix or digit prefix)
- **THEN** `compile.js` imports and executes it as a slide file

#### Scenario: Empty slides/ directory errors cleanly
- **WHEN** `slides/` directory exists but contains no `.js` files
- **THEN** `compile.js` exits with an error message indicating no slide files were found

#### Scenario: Missing slides/ directory errors cleanly
- **WHEN** the workspace exists but has no `slides/` subdirectory
- **THEN** `compile.js` exits with an informative error
