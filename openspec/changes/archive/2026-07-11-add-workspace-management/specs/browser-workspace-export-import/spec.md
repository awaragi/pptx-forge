## ADDED Requirements

### Requirement: Export the active workspace as a zip archive
The system SHALL provide an Export action that downloads the active workspace's `theme.js` and all slide files as a single `.zip` archive named after the workspace (its sanitized name plus a `.zip` extension), using each file's current in-editor content (synced from the active file first, the same way Forge and Download already sync in-progress edits before acting).

#### Scenario: Export downloads a zip named after the workspace
- **WHEN** the user clicks Export on a workspace named "Q3 Investor Deck"
- **THEN** the browser downloads a file named `Q3 Investor Deck.zip`

#### Scenario: Zip contains theme.js and all slide files
- **WHEN** the user clicks Export
- **THEN** the downloaded archive contains `theme.js` and every currently loaded slide file, each with its current content (including any in-progress edit to the active file)

### Requirement: Import a zip creates or merges a workspace by name match
The system SHALL let the user import a `.zip` archive (via drag-and-drop or file selection, alongside the existing loose-`.js`-file import path), deriving a target workspace name from the zip's filename (minus the `.zip` extension). If no workspace with that name exists, the system SHALL create one populated with the archive's `theme.js` and slide files and activate it, with no confirmation required. If a workspace with that name already exists, the system SHALL prompt for confirmation before merging the archive's files into it (adding new slide files and replacing files with matching names), and SHALL activate that workspace afterward regardless of whether the merge was confirmed or declined.

#### Scenario: Importing a zip with no matching workspace creates one
- **WHEN** the user imports `Draft Pitch.zip` and no workspace named "Draft Pitch" exists
- **THEN** a new workspace named "Draft Pitch" is created from the archive's files, with no confirmation prompt, and it becomes the active workspace

#### Scenario: Importing a zip matching an existing workspace prompts before merging
- **WHEN** the user imports `Draft Pitch.zip` and a workspace named "Draft Pitch" already exists
- **THEN** the system asks for confirmation before making any change to that workspace's files

#### Scenario: Confirming the merge updates the existing workspace
- **WHEN** the user confirms the merge prompt for an imported zip matching an existing workspace
- **THEN** the archive's `theme.js` replaces the existing one, slide files with matching names are replaced, and any new slide files in the archive are added

#### Scenario: Declining the merge leaves the workspace untouched
- **WHEN** the user declines the merge prompt for an imported zip matching an existing workspace
- **THEN** that workspace's files are unchanged

#### Scenario: Import always activates the resulting workspace
- **WHEN** a zip import completes, whether by creating a new workspace or by merging (confirmed or declined) into an existing one
- **THEN** the workspace matching the zip's name becomes the active workspace
