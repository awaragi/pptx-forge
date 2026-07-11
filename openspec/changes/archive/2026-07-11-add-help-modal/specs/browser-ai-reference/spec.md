## ADDED Requirements

### Requirement: Escape key closes the AI reference overlay
The system SHALL close the AI-reference overlay (shown by the clipboard-fallback textarea) when it is open and the user presses Escape.

#### Scenario: Escape dismisses the fallback overlay
- **WHEN** the AI-reference fallback overlay is open and the user presses Escape
- **THEN** the overlay is hidden

#### Scenario: Escape does nothing when the overlay is closed
- **WHEN** the AI-reference overlay is not open and the user presses Escape
- **THEN** no change occurs to the AI-reference overlay
