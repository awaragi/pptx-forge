## ADDED Requirements

### Requirement: Forge command replaces compile
The system SHALL provide a `bin/forge.js` entrypoint (replacing `bin/compile.js`) invokable via `npm run forge <workspace>`, `npm run build <workspace>`, or `npm run generate <workspace>`.

#### Scenario: Invoke via npm script aliases
- **WHEN** user runs `npm run build my-deck` or `npm run generate my-deck`
- **THEN** the system compiles the workspace identically to `npm run forge my-deck`

### Requirement: Help flag prints usage and exits
The system SHALL accept `--help` or `-h` at any position in the argument list, print usage information to stdout, and exit with code 0.

#### Scenario: Help with no workspace
- **WHEN** user runs `npm run forge --help` (no workspace slug provided)
- **THEN** system prints usage text and exits 0 without producing an error

#### Scenario: Help with workspace present
- **WHEN** user runs `npm run forge my-deck -h`
- **THEN** system prints usage text and exits 0 without compiling

#### Scenario: Help text content
- **WHEN** help is displayed
- **THEN** output SHALL include: usage line, `<workspace>` argument, `-o/--open`, `-t/--snapshot`, `-h/--help` options, and at least one usage example

### Requirement: Open flag launches generated file
The system SHALL accept `--open` or `-o` and, after a successful compile, open the generated `.pptx` file in the OS default application using the `open` npm package.

#### Scenario: File opens after compile
- **WHEN** user runs `npm run forge my-deck --open`
- **THEN** system compiles successfully and opens the generated file in the default app

#### Scenario: Open flag position is irrelevant
- **WHEN** user runs `npm run forge --open my-deck` or `npm run forge my-deck -o`
- **THEN** both forms open the file after compile

### Requirement: Snapshot flag writes timestamped output
The system SHALL accept `--snapshot` or `-t` and write the generated file to `out/<slug>_<timestamp>.pptx` instead of overwriting `out/<slug>.pptx`. Timestamp format: `YYYY-MM-DD_HH-MM-SS`.

#### Scenario: Snapshot creates dated file
- **WHEN** user runs `npm run forge my-deck --snapshot`
- **THEN** output file is `workspaces/my-deck/out/my-deck_2026-06-29_14-30-00.pptx` (date/time varies)

#### Scenario: Default file not written in snapshot mode
- **WHEN** `--snapshot` is used
- **THEN** `out/my-deck.pptx` is NOT written or overwritten

#### Scenario: Snapshot and open combined
- **WHEN** user runs `npm run forge my-deck --snapshot --open`
- **THEN** the timestamped file is written and that same file is opened

### Requirement: Missing workspace slug shows error
The system SHALL print an error and exit non-zero when no workspace slug is provided and `--help` was not requested.

#### Scenario: No arguments
- **WHEN** user runs `npm run forge` with no arguments
- **THEN** system prints a usage error to stderr and exits with a non-zero code
