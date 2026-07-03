## ADDED Requirements

### Requirement: A single slide file may be given instead of a workspace
`compile.js` SHALL accept a path to a single slide `.js` file as the `<workspace>` argument. When the resolved argument is a file rather than a directory, only that file SHALL be imported and executed as a slide — the `slides/` directory SHALL NOT be scanned.

If the file's parent directory is named `slides`, the workspace root (used to load `theme.js` and to resolve the `out/` output directory) SHALL be the parent of that `slides` directory, matching the workspace root that would be used if the whole workspace were compiled. Otherwise, the file's own containing directory SHALL be treated as the workspace root.

#### Scenario: Single file inside a workspace's slides/ directory
- **WHEN** user runs `npm run forge workspaces/my-deck/slides/overview.js`
- **THEN** only `overview.js` is imported and rendered
- **AND** `workspaces/my-deck/theme.js` is loaded as theme overrides (if present)
- **AND** output is written to `workspaces/my-deck/out/my-deck.pptx`

#### Scenario: Other slide files in the same workspace are ignored
- **WHEN** user runs `npm run forge workspaces/my-deck/slides/overview.js` and `workspaces/my-deck/slides/` also contains `agenda.js` and `closing.js`
- **THEN** `agenda.js` and `closing.js` are NOT imported or rendered

#### Scenario: Single file not nested under a slides/ directory
- **WHEN** user runs `npm run forge ./scratch/draft-slide.js` and `draft-slide.js` is not inside a directory named `slides`
- **THEN** only `draft-slide.js` is imported and rendered
- **AND** the workspace root is treated as `./scratch/`, so a `./scratch/theme.js` (if present) is loaded as theme overrides and output is written to `./scratch/out/scratch.pptx`

#### Scenario: Non-.js file is rejected
- **WHEN** user runs `npm run forge workspaces/my-deck/slides/notes.txt`
- **THEN** `compile.js` exits with a non-zero code and an informative error, and no file is generated

#### Scenario: Directory argument is unaffected
- **WHEN** user runs `npm run forge my-deck` where `my-deck` resolves to a directory
- **THEN** behavior is unchanged: `slides/` is scanned and all `.js` files in it are loaded in alphabetic order
