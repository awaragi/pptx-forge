### Requirement: Backup help flag prints usage and exits
The system SHALL accept `--help` or `-h` in `bin/backup.js`, print usage information to stdout, and exit with code 0.

#### Scenario: Explicit help flag
- **WHEN** user runs `npm run backup --help` or `npm run backup -h`
- **THEN** system prints usage text and exits 0

#### Scenario: Help text content
- **WHEN** help is displayed
- **THEN** output SHALL include: usage line, `<workspace>` argument description, and `-h/--help` option

### Requirement: Missing slug shows help instead of error
The system SHALL display the help text and exit 0 when `bin/backup.js` is invoked with no workspace slug (and no help flag), replacing the previous error-and-exit-1 behavior.

#### Scenario: No arguments provided
- **WHEN** user runs `npm run backup` with no arguments
- **THEN** system prints usage/help text and exits 0 (not 1)
