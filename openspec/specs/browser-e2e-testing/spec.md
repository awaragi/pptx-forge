## Purpose

Defines the Playwright end-to-end suite (`test/e2e/`) that drives the built `pptx-forge.html` directly over `file://` to give real regression coverage of the browser tool's forge, workspace persistence, and file-import flows — behavior/state assertions only, no screenshot-based visual regression.

## Requirements

### Requirement: Forge produces a valid PPTX reflecting workspace content
The end-to-end suite SHALL drive the built `pptx-forge.html` (over `file://`) with a seeded workspace, trigger Forge, capture the downloaded file, and verify — by unzipping it — that its contents reflect the seeded theme/masters/slides.

#### Scenario: Forge with a single slide produces a pptx containing that slide's content
- **WHEN** a workspace with a theme, masters, and one slide file (containing known text) is seeded and the Forge button is clicked
- **THEN** a `.pptx` file is downloaded, and unzipping it with `jszip` shows a slide XML part containing the seeded text

#### Scenario: Forge is blocked when the workspace has no slides
- **WHEN** Forge is clicked on a workspace with theme/masters but zero slide files
- **THEN** no file is downloaded and an error notification is shown

### Requirement: Workspace state persists across page reload
The end-to-end suite SHALL verify that edits to a workspace's active file are persisted to `localStorage` and restored after a full page reload, without relying on any server-side state.

#### Scenario: Edited slide content survives a reload
- **WHEN** a slide file's content is edited in the editor and the page is then reloaded
- **THEN** the same workspace is active after reload and the edited content is shown, not the pre-edit content

#### Scenario: The active workspace selection survives a reload
- **WHEN** a second workspace is created and switched to, then the page is reloaded
- **THEN** the second workspace remains the active one after reload

### Requirement: File import via the file picker adds or replaces files correctly
The end-to-end suite SHALL verify that selecting `.js` files through the file input adds new slide files or replaces existing ones in place, and rejects non-`.js` files.

#### Scenario: Selecting a new .js file adds it as a slide
- **WHEN** a `.js` file whose name doesn't match any existing entry is selected via the file input
- **THEN** it appears as a new slide entry in the workspace

#### Scenario: Selecting a .js file matching an existing name replaces its content in place
- **WHEN** a `.js` file sharing a name with an existing slide is selected via the file input
- **THEN** the existing entry's content is replaced and its position in the sidebar is unchanged

#### Scenario: Selecting a non-.js file is rejected
- **WHEN** a file without a `.js` extension is selected via the file input
- **THEN** it is not added to the workspace and an error notification is shown

### Requirement: Drag-and-drop import routes .js and .zip files correctly
The end-to-end suite SHALL verify that dropping files onto the window routes `.js` files the same way as the file picker, and routes `.zip` files through the workspace import path — creating a new workspace when the name doesn't exist, or prompting to merge when it does.

#### Scenario: Dropping a .js file behaves like selecting it via the file picker
- **WHEN** a `.js` file is dropped onto the window
- **THEN** it is added or replaces an existing entry exactly as the file-picker path would

#### Scenario: Dropping a .zip file whose name matches no existing workspace creates one
- **WHEN** a `.zip` file named after a workspace that doesn't yet exist is dropped onto the window
- **THEN** a new workspace with that name is created, populated from the zip, and made active

#### Scenario: Dropping a .zip file whose name matches an existing workspace prompts to merge
- **WHEN** a `.zip` file named after an existing workspace is dropped onto the window and the resulting confirm prompt is accepted
- **THEN** the existing workspace's files are merged with the zip's contents and it remains active

#### Scenario: Declining the merge prompt switches to the existing workspace unchanged
- **WHEN** a `.zip` file named after an existing workspace is dropped onto the window and the resulting confirm prompt is dismissed
- **THEN** the existing workspace becomes active with its original, unmerged content
