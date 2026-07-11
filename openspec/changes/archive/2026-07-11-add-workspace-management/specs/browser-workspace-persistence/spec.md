## REMOVED Requirements

### Requirement: Session-scoped autosave of workspace state
**Reason**: Replaced by explicitly named, `localStorage`-backed multi-workspace autosave (see ADDED "Multi-workspace autosave to localStorage"). Keying storage by the output filename is removed along with the field itself.
**Migration**: None. `sessionStorage` does not survive a browser restart, so there is no meaningful prior state to carry forward; old entries are left in place, unread.

### Requirement: New Project starts a blank workspace under the default key
**Reason**: Replaced by the explicit "Create a new workspace" action (see ADDED), which creates a distinct, independently named workspace rather than clearing and reusing a fixed default key. Clearing/destroying the current workspace is no longer how a new one is started.
**Migration**: None. Use the New Workspace action instead of New Project; existing workspace content is never cleared as a side effect of creating another one.

### Requirement: Renaming the output filename creates a new workspace entry
**Reason**: Output filename is no longer an independent, live-edited field that drives workspace identity (see the modified `browser-forge` capability). Workspace identity now changes only through the explicit, collision-blocked Rename action.
**Migration**: None. Use the workspace Rename action to change a workspace's name; changing the forge output naming (via the timestamp toggle) has no effect on workspace identity.

## MODIFIED Requirements

### Requirement: Active workspace restored silently on load
The system SHALL, on page load, check `localStorage` for the active-workspace pointer and, if it names a workspace present in storage, load that workspace's files into the editor in place of the default blank state, with no confirmation prompt and no status message. If no active-workspace pointer is present, or it does not name an existing workspace (e.g. first-ever visit, or all workspaces were deleted), the system SHALL instead auto-create and activate a default workspace so a workspace is always open.

#### Scenario: Reload restores prior state
- **WHEN** the user has edited files, then reloads the page (same tab)
- **THEN** the editor and sidebar show the same active workspace's theme and slide content as before the reload, with no prompt shown

#### Scenario: First-ever load auto-creates a default workspace
- **WHEN** the page is opened with no workspace data in `localStorage` (e.g. first visit)
- **THEN** a default workspace is created and activated automatically, starting in the default blank state (placeholder `theme.js`, no slides), with no prompt shown

#### Scenario: No workspaces remain after deletion falls back the same way
- **WHEN** the page is opened and the previously active workspace no longer exists in storage (e.g. it was the last one and was deleted in another tab)
- **THEN** the system auto-creates and activates a fresh default workspace, the same as a first-ever load

### Requirement: Storage-failure warning shown once
The system SHALL detect when a `localStorage` read or write fails (e.g. unavailable under the current browser/`file://` configuration, quota exceeded), show a single inline status-bar warning on the first such failure, and SHALL NOT repeat that warning for subsequent hard failures within the same page load, continuing to operate on in-memory state only. Independently, the system SHALL show a non-blocking, repeatable status-bar note as estimated total storage usage nears a conservative threshold, before any write actually fails.

#### Scenario: First hard storage failure shows a warning
- **WHEN** the first attempted `localStorage` write throws an error
- **THEN** the status bar shows a message indicating persistent storage is unavailable, and editing continues to work normally in memory

#### Scenario: Subsequent hard storage failures stay silent
- **WHEN** further `localStorage` writes fail after the first hard-failure warning has already been shown
- **THEN** no additional hard-failure warning is shown, and the tool continues to function using in-memory state only

#### Scenario: Nearing quota shows a proactive note
- **WHEN** estimated total `localStorage` usage across all workspaces crosses a conservative threshold after an autosave
- **THEN** the status bar shows a note suggesting the user delete unused workspaces, without blocking editing or forcing any action

#### Scenario: A write can still fail after a proactive warning was already shown
- **WHEN** a `localStorage` write fails outright (e.g. from a large zip import or a large asset pasted into a slide) after the nearing-quota note has already appeared
- **THEN** the one-time hard-failure warning is still shown as normal, and the tool continues operating on in-memory state only

## ADDED Requirements

### Requirement: Multi-workspace autosave to localStorage
The system SHALL persist the active workspace's `theme.js` and slide file contents to `localStorage`, keyed by the workspace's name, writing on every change to file content, file set, or file names, and SHALL track which workspace is active via a separate `localStorage` key.

#### Scenario: Editing a file triggers a save
- **WHEN** the user edits the content of the active file (theme or slide)
- **THEN** the active workspace's entry in `localStorage` is updated to reflect the new content

#### Scenario: Adding, discarding, or renaming a slide triggers a save
- **WHEN** the user adds a new slide, discards a slide, or renames a slide
- **THEN** the active workspace's entry in `localStorage` reflects the updated file set

### Requirement: Workspace switcher lists and activates saved workspaces
The system SHALL provide a switcher control listing every workspace currently in storage by name, and SHALL, when the user selects a different workspace from it, load that workspace's files into the editor as the new active workspace, with no confirmation prompt.

#### Scenario: Switching loads the selected workspace
- **WHEN** the user selects a workspace other than the currently active one from the switcher
- **THEN** the editor and sidebar update to show that workspace's theme and slide content, and it becomes the active workspace

### Requirement: Create a new workspace with an explicit name
The system SHALL provide a "New Workspace" action that prompts the user for a name before creating anything, and, if no workspace with that name already exists, creates a new workspace in the default blank state (placeholder `theme.js`, no slides) and activates it, leaving all other workspaces unchanged. If a workspace with the entered name already exists, the system SHALL NOT create or overwrite anything and SHALL report the collision so the user can choose a different name.

#### Scenario: Creating a workspace with a unique name
- **WHEN** the user clicks New Workspace and enters a name that does not match any existing workspace
- **THEN** a new workspace with that name is created in the default blank state and becomes active; every other workspace is unchanged

#### Scenario: Creating a workspace is cancellable
- **WHEN** the user clicks New Workspace and cancels the name prompt
- **THEN** no workspace is created and the active workspace is unchanged

#### Scenario: Creating a workspace with a colliding name is blocked
- **WHEN** the user enters a name that matches an existing workspace
- **THEN** no workspace is created, the existing workspace with that name is unchanged, and an inline message reports the name is already in use

### Requirement: Rename the active workspace, blocked on collision
The system SHALL provide a Rename action for the active workspace that changes its name in place (all persisted files and identity moving to the new name) when the new name does not match any other existing workspace, and SHALL block the rename with an inline message, leaving both workspaces unchanged, when it does.

#### Scenario: Renaming to a unique name succeeds
- **WHEN** the user renames the active workspace to a name that does not match any other existing workspace
- **THEN** the workspace's stored entry moves to the new name, the switcher reflects the new name, and its files are unchanged

#### Scenario: Renaming to a colliding name is blocked
- **WHEN** the user attempts to rename the active workspace to a name that matches another existing workspace
- **THEN** the rename does not happen, both workspaces remain exactly as they were, and an inline message reports the name is already in use

### Requirement: Delete the active workspace
The system SHALL provide a Delete action for the active workspace that, after confirmation, removes it from storage and the switcher, then activates another existing workspace if one remains, or auto-creates and activates a fresh default workspace if none remain.

#### Scenario: Deleting with other workspaces remaining
- **WHEN** the user deletes the active workspace and confirms, while at least one other workspace exists
- **THEN** the deleted workspace is removed from storage and the switcher, and another existing workspace becomes active

#### Scenario: Deleting the last remaining workspace
- **WHEN** the user deletes the active workspace and confirms, and no other workspace exists
- **THEN** the deleted workspace is removed, and a fresh default workspace is auto-created and activated in its place

#### Scenario: Delete is cancellable
- **WHEN** the user clicks Delete and declines the confirmation prompt
- **THEN** the active workspace and all others are unchanged

### Requirement: Cross-tab sync for the active workspace
The system SHALL listen for storage change notifications from other tabs/windows on the same origin, and, when a change affects the currently active workspace and the editor is not focused, SHALL silently reload the in-memory state from the updated data and show a non-blocking status-bar note, without prompting for confirmation.

#### Scenario: Background tab picks up a change from another tab
- **WHEN** another tab saves a change to the workspace that is also active (open) in this tab, and this tab's editor is not focused
- **THEN** this tab's in-memory state and rendered file list/editor content update to match, and the status bar shows a brief note indicating the sync happened

#### Scenario: A focused editor is not silently overwritten
- **WHEN** another tab saves a change to the workspace active in this tab, but this tab's editor currently has focus
- **THEN** this tab's editor content is not overwritten while focus remains, avoiding loss of in-progress typing
