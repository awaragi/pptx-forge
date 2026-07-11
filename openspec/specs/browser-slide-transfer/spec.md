# browser-slide-transfer Specification

## Purpose
TBD - created by syncing change add-workspace-management. Update Purpose after archive.
## Requirements
### Requirement: Workspace picker for slide transfer marks colliding targets upfront
The system SHALL, when the user opens the Move or Copy picker for the active slide file, list every other existing workspace as a candidate target, and SHALL disable any candidate whose slide files already include a file with the same name as the slide being transferred, showing an inline reason on the disabled candidate.

#### Scenario: A target without a colliding slide is selectable
- **WHEN** the user opens the Move or Copy picker for `slide-02.js` and a candidate workspace has no file named `slide-02.js`
- **THEN** that candidate is shown as selectable

#### Scenario: A target with a colliding slide is disabled with a reason
- **WHEN** the user opens the Move or Copy picker for `slide-02.js` and a candidate workspace already has a file named `slide-02.js`
- **THEN** that candidate is shown disabled, with an inline message indicating the file already exists there

### Requirement: Move the active slide file to another workspace
The system SHALL provide a Move action on the active slide file that, after the user picks a non-disabled target workspace, removes the slide from the active workspace, adds it to the target workspace, and activates the target workspace.

#### Scenario: Moving a slide relocates it and switches workspace
- **WHEN** the user moves `slide-02.js` from the active workspace to a selectable target workspace
- **THEN** `slide-02.js` no longer appears in the source workspace, it appears in the target workspace with the same content, and the target workspace becomes active

#### Scenario: Move is unavailable to a colliding target
- **WHEN** the user opens the Move picker and every other workspace already has a file named the same as the active slide
- **THEN** no candidate in the picker is selectable

### Requirement: Copy the active slide file to another workspace
The system SHALL provide a Copy action on the active slide file that, after the user picks a non-disabled target workspace, adds the slide to the target workspace without removing it from the active workspace, and leaves the active workspace as the currently shown workspace.

#### Scenario: Copying a slide duplicates it without switching workspace
- **WHEN** the user copies `slide-02.js` from the active workspace to a selectable target workspace
- **THEN** `slide-02.js` continues to appear unchanged in the source (active) workspace, it also appears in the target workspace with the same content, and the active workspace remains the one shown

#### Scenario: Copy is unavailable to a colliding target
- **WHEN** the user opens the Copy picker and every other workspace already has a file named the same as the active slide
- **THEN** no candidate in the picker is selectable

### Requirement: theme.js is excluded from move and copy
The system SHALL NOT offer Move or Copy actions for the `theme.js` entry.

#### Scenario: No transfer controls shown for theme.js
- **WHEN** the active file is `theme.js`
- **THEN** neither a Move nor a Copy control is shown for it
