## ADDED Requirements

### Requirement: Session-scoped autosave of workspace state
The system SHALL persist the active workspace's `theme.js` and slide file contents to `sessionStorage` under a `pptx-forge.workspaces` entry keyed by the current output filename, writing on every change to file content, file set, or file names, and SHALL track which entry is active via a separate `pptx-forge.activeWorkspace` key.

#### Scenario: Editing a file triggers a save
- **WHEN** the user edits the content of the active file (theme or slide)
- **THEN** the current output filename's entry in `sessionStorage["pptx-forge.workspaces"]` is updated to reflect the new content

#### Scenario: Adding, discarding, or renaming a slide triggers a save
- **WHEN** the user adds a new slide, discards a slide, or renames a slide
- **THEN** the current output filename's entry in `sessionStorage["pptx-forge.workspaces"]` reflects the updated file set

### Requirement: Active workspace restored silently on load
The system SHALL, on page load, check `sessionStorage["pptx-forge.activeWorkspace"]` and if it names an entry present in `sessionStorage["pptx-forge.workspaces"]`, load that entry's files into the editor in place of the default blank state, with no confirmation prompt and no status message.

#### Scenario: Reload restores prior session state
- **WHEN** the user has edited files, then reloads the page (same tab)
- **THEN** the editor and sidebar show the same theme and slide content as before the reload, with no prompt shown

#### Scenario: First-ever load has no active workspace
- **WHEN** the page is opened with no `pptx-forge.activeWorkspace` set (e.g. first visit)
- **THEN** the tool starts in its default blank state (placeholder `theme.js`, no slides)

### Requirement: New Project starts a blank workspace under the default key
The system SHALL provide a New Project action that, after confirmation, clears the editor to its default blank state (placeholder `theme.js`, no slides), resets the output filename to the default (`deck`), and sets `pptx-forge.activeWorkspace` to `deck` — after which subsequent autosaves overwrite any prior `deck` entry.

#### Scenario: New Project clears the workspace after confirmation
- **WHEN** the user clicks New Project and confirms the prompt
- **THEN** all loaded slide files are removed, `theme.js` reverts to its default placeholder, the output filename resets to `deck`, and the active workspace pointer is set to `deck`

#### Scenario: New Project is cancellable
- **WHEN** the user clicks New Project and declines the confirmation prompt
- **THEN** the current workspace is unchanged and no state is reset

### Requirement: Renaming the output filename creates a new workspace entry
The system SHALL, when the output filename is changed to a value that differs from the currently active workspace key, copy the current in-memory state into a new `pptx-forge.workspaces` entry under the new name, repoint `pptx-forge.activeWorkspace` to the new name, and leave the prior entry untouched under its old name.

#### Scenario: Renaming output filename preserves the old snapshot
- **WHEN** the user changes the output filename from `deck` to `pres-2`
- **THEN** `sessionStorage["pptx-forge.workspaces"]["pres-2"]` is created with the current files, `pptx-forge.activeWorkspace` becomes `pres-2`, and `sessionStorage["pptx-forge.workspaces"]["deck"]` still holds its prior content unchanged

### Requirement: Storage-failure warning shown once
The system SHALL detect when a `sessionStorage` read or write fails (e.g. unavailable under the current browser/`file://` configuration, quota exceeded), show a single inline status-bar warning on the first such failure, and SHALL NOT repeat the warning for subsequent failures within the same page load, continuing to operate on in-memory state only.

#### Scenario: First storage failure shows a warning
- **WHEN** the first attempted `sessionStorage` write throws an error
- **THEN** the status bar shows a message indicating session persistence is unavailable, and editing continues to work normally in memory

#### Scenario: Subsequent storage failures stay silent
- **WHEN** further `sessionStorage` writes fail after the first warning has already been shown
- **THEN** no additional warning is shown, and the tool continues to function using in-memory state only
