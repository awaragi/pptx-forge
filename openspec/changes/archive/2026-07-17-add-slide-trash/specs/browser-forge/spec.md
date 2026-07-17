## MODIFIED Requirements

### Requirement: Discard moves the active slide file to trash
The system SHALL provide a Discard action that, after the user confirms the action, moves the active slide file from the sidebar's "Slides" list into the workspace's Trash list instead of deleting it, excluding it from subsequent Forge runs and workspace export while it remains in trash. This action is unavailable for `theme.js` and `masters.js`. The confirmation prompt SHALL indicate the file is being moved to trash and can be restored, rather than stating the action cannot be undone.

#### Scenario: Discard moves a slide file to trash after confirmation
- **WHEN** the user clicks Discard on a slide file and confirms the prompt
- **THEN** that file's entry is removed from the "Slides" list and appears in the "Trash" list instead, and it is excluded from subsequent Forge runs

#### Scenario: Discard is cancellable
- **WHEN** the user clicks Discard and declines the confirmation prompt
- **THEN** the file is not moved and no state changes

#### Scenario: Discard is unavailable for masters.js
- **WHEN** the active file is `masters.js`
- **THEN** no Discard control is shown for it
