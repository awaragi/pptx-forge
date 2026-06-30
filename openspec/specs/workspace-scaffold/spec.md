# Workspace Scaffold Spec

## Purpose

Defines the interactive `bin/create.js` script that bootstraps a new named workspace under `workspaces/<name>/` by copying template files from `src/sample/`.

## Requirements

### Requirement: Interactive workspace creation
`bin/create.js` SHALL prompt the user for a workspace name and create a new workspace directory under `workspaces/<name>/` by copying template files from `src/sample/`.

#### Scenario: Happy path — new workspace name
- **WHEN** the user runs `node bin/create.js` and enters a valid name (e.g. `my-deck`)
- **THEN** the script creates `workspaces/my-deck/theme.js` and `workspaces/my-deck/slides/deck.js`, then prints next-step instructions including `node bin/compile.js my-deck`

#### Scenario: Workspace already exists
- **WHEN** the user enters a name that matches an existing directory under `workspaces/`
- **THEN** the script exits with an error message indicating the workspace already exists and takes no action

#### Scenario: Empty name input
- **WHEN** the user enters an empty string or whitespace-only input
- **THEN** the script re-prompts or exits with a clear error; no workspace is created

### Requirement: Workspace name used as directory slug
The workspace name entered by the user SHALL be used verbatim as the directory name under `workspaces/`. The script SHALL NOT transform, lowercase, or slugify the input.

#### Scenario: Name with spaces or special characters
- **WHEN** the user enters a name such as `My Deck`
- **THEN** the workspace is created at `workspaces/My Deck/` with no transformation applied

### Requirement: Template files copied without modification
`bin/create.js` SHALL copy `src/sample/theme.js` and `src/sample/slides/deck.js` into the new workspace, preserving the relative directory structure, without modifying file content.

#### Scenario: Template files are copied as-is
- **WHEN** a workspace is successfully created
- **THEN** `workspaces/<name>/theme.js` is byte-identical to `src/sample/theme.js` and `workspaces/<name>/slides/deck.js` is byte-identical to `src/sample/slides/deck.js`
