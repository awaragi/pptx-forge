## ADDED Requirements

### Requirement: Discarded slides move to a per-workspace trash
The system SHALL, when a slide file is discarded, move it into a trash tier scoped to the active workspace instead of removing it from storage, renaming it internally with a delete-timestamp suffix so repeated discards of the same original name do not collide. Trashed files SHALL persist across page reloads the same as live files, travel with the workspace on rename, and SHALL NOT be included in Forge output or workspace export/zip.

#### Scenario: Discarding a slide moves it to trash
- **WHEN** the user discards a slide file
- **THEN** it disappears from the live "Slides" list and appears in the "Trash" list instead, and the workspace's persisted storage entry reflects the move

#### Scenario: Discarding two files with the same name keeps both in trash
- **WHEN** the user discards a slide named `foo.js`, later creates a new `foo.js`, and discards that too
- **THEN** both discarded versions appear as distinct entries in the Trash list

#### Scenario: Trashed files survive a reload
- **WHEN** the page is reloaded after one or more slides have been discarded
- **THEN** the Trash list still shows those discarded files in the same workspace

#### Scenario: Trashed files are excluded from Forge and export
- **WHEN** the user runs Forge or exports the workspace as a zip while the Trash list is non-empty
- **THEN** the generated `.pptx` and the exported zip contain only the live slide files, not any trashed ones

### Requirement: Sidebar Trash group lists trashed slides
The system SHALL display a collapsible "Trash" group in the Explorer sidebar, below the "Slides" group, labeled with the current count of trashed entries (e.g. "Trash (2)"), using the same header style as the existing "Slides" group. The group SHALL be collapsible/expandable by clicking its header, independent of any other sidebar state.

#### Scenario: Trash group shows a count
- **WHEN** the active workspace has two discarded slides
- **THEN** the Trash group header reads "Trash (2)"

#### Scenario: Trash group is empty
- **WHEN** the active workspace has no discarded slides
- **THEN** the Trash group header reads "Trash (0)" and its list area is empty

#### Scenario: Expanding and collapsing the Trash group
- **WHEN** the user clicks the Trash group header
- **THEN** the list of trashed entries toggles between shown and hidden, without affecting the "Slides" group's own expanded state

### Requirement: Clicking a trashed entry restores it after confirmation
The system SHALL, when the user clicks a row in the Trash list and confirms the resulting prompt, restore that trashed slide to the live "Slides" list, recovering its original (pre-discard) file name. If a live slide already exists under that original name, the system SHALL instead restore it under a de-duplicated name (appending " (restored)", and a numeric suffix if that also collides) rather than blocking the restore or overwriting the existing file.

#### Scenario: Restoring a trashed file with no name conflict
- **WHEN** the user clicks a trashed entry whose original name does not match any current live slide, and confirms the prompt
- **THEN** the file reappears in the "Slides" list under its original name, is removed from the Trash list, and becomes the active file

#### Scenario: Restoring a trashed file whose name is now taken
- **WHEN** the user clicks a trashed entry named `foo.js` (originally), a live slide named `foo.js` already exists, and the user confirms the prompt
- **THEN** the restored file appears in the "Slides" list as `foo (restored).js` instead of overwriting the existing `foo.js`, and a toast confirms the restored file's actual name

#### Scenario: Restore is cancellable
- **WHEN** the user clicks a trashed entry and declines the confirmation prompt
- **THEN** the file is not restored and remains in the Trash list unchanged

### Requirement: Empty Trash permanently removes all trashed entries
The system SHALL provide an "empty trash" action in the Trash group header, available whenever the Trash list is non-empty, that permanently deletes every trashed entry for the active workspace after the user confirms the action. This is the only irreversible action in the discard/trash flow.

#### Scenario: Emptying trash after confirmation
- **WHEN** the user clicks "empty trash" and confirms the prompt
- **THEN** every entry in the Trash list is permanently removed and the group header updates to "Trash (0)"

#### Scenario: Emptying trash is cancellable
- **WHEN** the user clicks "empty trash" and declines the confirmation prompt
- **THEN** no trashed entries are removed
