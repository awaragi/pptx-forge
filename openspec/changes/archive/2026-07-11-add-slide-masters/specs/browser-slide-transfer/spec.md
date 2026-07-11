## MODIFIED Requirements

### Requirement: theme.js is excluded from move and copy
The system SHALL NOT offer Move or Copy actions for the `theme.js` or `masters.js` entries.

#### Scenario: No transfer controls shown for theme.js
- **WHEN** the active file is `theme.js`
- **THEN** neither a Move nor a Copy control is shown for it

#### Scenario: No transfer controls shown for masters.js
- **WHEN** the active file is `masters.js`
- **THEN** neither a Move nor a Copy control is shown for it
