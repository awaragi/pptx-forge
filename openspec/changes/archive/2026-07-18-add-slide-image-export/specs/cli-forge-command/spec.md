## MODIFIED Requirements

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
- **THEN** output SHALL include: usage line, `<workspace>` argument, `-o/--open`, `-t/--snapshot`, `-i/--images`, `-h/--help` options, and at least one usage example

## ADDED Requirements

### Requirement: Images flag triggers per-slide image export
The system SHALL accept `--images` or `-i` and, after a successful compile, export every slide in the workspace as a PNG image (see the `slide-image-export` capability for filename, output-path, and rendering behavior).

#### Scenario: Images flag position is irrelevant
- **WHEN** user runs `npm run forge --images my-deck` or `npm run forge my-deck -i`
- **THEN** both forms export every slide as a PNG after compiling

#### Scenario: Images flag combined with snapshot
- **WHEN** user runs `npm run forge my-deck --snapshot --images`
- **THEN** the system writes the timestamped `.pptx` and exports images using that same timestamp in their filenames

#### Scenario: Images flag combined with open or preview
- **WHEN** user runs `npm run forge my-deck --images --open` or `npm run forge my-deck --images --preview`
- **THEN** image export happens independently of and in addition to opening/previewing the generated `.pptx`
