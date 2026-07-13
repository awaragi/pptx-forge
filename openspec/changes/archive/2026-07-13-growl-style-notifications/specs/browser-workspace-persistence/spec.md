## MODIFIED Requirements

### Requirement: Storage-failure warning shown once
The system SHALL detect when a `localStorage` read or write fails (e.g. unavailable under the current browser/`file://` configuration, quota exceeded), show a single error-tier toast notification on the first such failure, and SHALL NOT repeat that warning for subsequent hard failures within the same page load, continuing to operate on in-memory state only. Independently, the system SHALL show a non-blocking, repeatable info-tier toast notification as estimated total storage usage nears a conservative threshold, before any write actually fails.

#### Scenario: First hard storage failure shows a warning
- **WHEN** the first attempted `localStorage` write throws an error
- **THEN** an error-tier toast notification appears indicating persistent storage is unavailable, and editing continues to work normally in memory

#### Scenario: Subsequent hard storage failures stay silent
- **WHEN** further `localStorage` writes fail after the first hard-failure warning has already been shown
- **THEN** no additional hard-failure warning is shown, and the tool continues to function using in-memory state only

#### Scenario: Nearing quota shows a proactive note
- **WHEN** estimated total `localStorage` usage across all workspaces crosses a conservative threshold after an autosave
- **THEN** an info-tier toast notification appears suggesting the user delete unused workspaces, without blocking editing or forcing any action

#### Scenario: A write can still fail after a proactive warning was already shown
- **WHEN** a `localStorage` write fails outright (e.g. from a large zip import or a large asset pasted into a slide) after the nearing-quota note has already appeared
- **THEN** the one-time hard-failure warning is still shown as normal, and the tool continues operating on in-memory state only

### Requirement: Cross-tab sync for the active workspace
The system SHALL listen for storage change notifications from other tabs/windows on the same origin, and, when a change affects the currently active workspace and the editor is not focused, SHALL silently reload the in-memory state from the updated data and show a non-blocking info-tier toast notification, without prompting for confirmation.

#### Scenario: Background tab picks up a change from another tab
- **WHEN** another tab saves a change to the workspace that is also active (open) in this tab, and this tab's editor is not focused
- **THEN** this tab's in-memory state and rendered file list/editor content update to match, and an info-tier toast notification appears indicating the sync happened

#### Scenario: A focused editor is not silently overwritten
- **WHEN** another tab saves a change to the workspace active in this tab, but this tab's editor currently has focus
- **THEN** this tab's editor content is not overwritten while focus remains, avoiding loss of in-progress typing
