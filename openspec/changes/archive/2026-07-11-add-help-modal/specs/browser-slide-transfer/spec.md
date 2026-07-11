## ADDED Requirements

### Requirement: Escape key closes the transfer picker overlay
The system SHALL close the Move/Copy transfer-picker overlay when it is open and the user presses Escape, without performing any transfer.

#### Scenario: Escape dismisses the transfer picker
- **WHEN** the Move or Copy transfer-picker overlay is open and the user presses Escape
- **THEN** the overlay is hidden and no move or copy action is performed

#### Scenario: Escape does nothing when the overlay is closed
- **WHEN** the transfer-picker overlay is not open and the user presses Escape
- **THEN** no change occurs to the transfer-picker overlay
