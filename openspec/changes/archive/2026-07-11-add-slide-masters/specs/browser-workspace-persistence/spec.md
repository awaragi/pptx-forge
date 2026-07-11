## MODIFIED Requirements

### Requirement: Active workspace restored silently on load
The system SHALL, on page load, check `localStorage` for the active-workspace pointer and, if it names a workspace present in storage, load that workspace's files into the editor in place of the default blank state, with no confirmation prompt and no status message. If no active-workspace pointer is present, or it does not name an existing workspace (e.g. first-ever visit, or all workspaces were deleted), the system SHALL instead auto-create and activate a default workspace so a workspace is always open.

#### Scenario: Reload restores prior state
- **WHEN** the user has edited files, then reloads the page (same tab)
- **THEN** the editor and sidebar show the same active workspace's theme, masters, and slide content as before the reload, with no prompt shown

#### Scenario: First-ever load auto-creates a default workspace
- **WHEN** the page is opened with no workspace data in `localStorage` (e.g. first visit)
- **THEN** a default workspace is created and activated automatically, starting in the default blank state (placeholder `theme.js`, placeholder `masters.js`, no slides), with no prompt shown

#### Scenario: No workspaces remain after deletion falls back the same way
- **WHEN** the page is opened and the previously active workspace no longer exists in storage (e.g. it was the last one and was deleted in another tab)
- **THEN** the system auto-creates and activates a fresh default workspace, the same as a first-ever load

### Requirement: Multi-workspace autosave to localStorage
The system SHALL persist the active workspace's `theme.js`, `masters.js`, and slide file contents to `localStorage`, keyed by the workspace's name, writing on every change to file content, file set, or file names, and SHALL track which workspace is active via a separate `localStorage` key.

#### Scenario: Editing a file triggers a save
- **WHEN** the user edits the content of the active file (theme, masters, or slide)
- **THEN** the active workspace's entry in `localStorage` is updated to reflect the new content

#### Scenario: Adding, discarding, or renaming a slide triggers a save
- **WHEN** the user adds a new slide, discards a slide, or renames a slide
- **THEN** the active workspace's entry in `localStorage` reflects the updated file set

### Requirement: Create a new workspace with an explicit name
The system SHALL provide a "New Workspace" action that prompts the user for a name before creating anything, and, if no workspace with that name already exists, creates a new workspace in the default blank state (placeholder `theme.js`, placeholder `masters.js`, no slides) and activates it, leaving all other workspaces unchanged. If a workspace with the entered name already exists, the system SHALL NOT create or overwrite anything and SHALL report the collision so the user can choose a different name.

#### Scenario: Creating a workspace with a unique name
- **WHEN** the user clicks New Workspace and enters a name that does not match any existing workspace
- **THEN** a new workspace with that name is created in the default blank state and becomes active; every other workspace is unchanged

#### Scenario: Creating a workspace is cancellable
- **WHEN** the user clicks New Workspace and cancels the name prompt
- **THEN** no workspace is created and the active workspace is unchanged

#### Scenario: Creating a workspace with a colliding name is blocked
- **WHEN** the user enters a name that matches an existing workspace
- **THEN** no workspace is created, the existing workspace with that name is unchanged, and an inline message reports the name is already in use
