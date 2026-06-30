## MODIFIED Requirements

### Requirement: Interactive workspace creation
`bin/create.js` SHALL prompt the user for a workspace name and create a new workspace directory under `workspaces/<name>/` by copying template files from `src/sample/`. The script SHALL explicitly ensure the `workspaces/` parent directory exists before proceeding, creating it if absent.

#### Scenario: Happy path — new workspace name
- **WHEN** the user runs `node bin/create.js` and enters a valid name (e.g. `my-deck`)
- **THEN** the script creates `workspaces/my-deck/theme.js` and `workspaces/my-deck/slides/deck.js`, then prints next-step instructions including `npm run forge my-deck`

#### Scenario: Workspace already exists
- **WHEN** the user enters a name that matches an existing directory under `workspaces/`
- **THEN** the script exits with an error message indicating the workspace already exists and takes no action

#### Scenario: Empty name input
- **WHEN** the user enters an empty string or whitespace-only input
- **THEN** the script re-prompts or exits with a clear error; no workspace is created

#### Scenario: workspaces parent directory does not exist
- **WHEN** the user runs `node bin/create.js` in a freshly extracted release archive where `workspaces/` has never been created
- **THEN** the script creates the `workspaces/` directory and then creates the new workspace inside it without error
