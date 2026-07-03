## MODIFIED Requirements

### Requirement: Editor toolbar provides download, discard, and rename actions
The system SHALL present the currently active file's actions as icon buttons in the editor toolbar: Download, and either Discard or Reset depending on the active file, plus Rename. The Rename affordance (a pencil icon) SHALL be displayed immediately next to the active filename, and clicking the filename text itself SHALL also trigger rename. When the active file is `theme.js`, Discard and Rename SHALL NOT be available, and a Reset action SHALL be shown in Discard's toolbar position instead.

#### Scenario: Icon buttons shown for a slide file
- **WHEN** the active file is a slide file (not `theme.js`)
- **THEN** the Download and Discard icon buttons, and the inline rename pencil next to the filename, are all available

#### Scenario: Rename triggered from the filename or the pencil icon
- **WHEN** the active file is a slide file and the user clicks either the filename text or the pencil icon next to it
- **THEN** rename mode is entered (see "Rename changes a slide file's name")

#### Scenario: Discard and Rename unavailable for theme.js, Reset shown instead
- **WHEN** the active file is `theme.js`
- **THEN** the Discard icon and the rename pencil are not shown, clicking the filename text does not enter rename mode, and a Reset icon button is shown in the toolbar position Discard would otherwise occupy

## ADDED Requirements

### Requirement: Reset restores theme.js to the default placeholder
The system SHALL provide a Reset action, available only when the active file is `theme.js`, that after confirmation replaces the `theme.js` entry's content with the default placeholder content and returns its sidebar styling to the muted placeholder state.

#### Scenario: Reset restores the placeholder after confirmation
- **WHEN** the user has edited `theme.js` away from its default content, clicks Reset, and confirms the prompt
- **THEN** the `theme.js` entry's content is replaced with the default placeholder, the editor pane updates to show it, and the sidebar entry returns to its muted placeholder styling

#### Scenario: Reset is cancellable
- **WHEN** the user clicks Reset and declines the confirmation prompt
- **THEN** the `theme.js` content is unchanged
