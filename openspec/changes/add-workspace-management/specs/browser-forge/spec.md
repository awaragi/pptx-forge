## MODIFIED Requirements

### Requirement: Forge compiles loaded files into a downloadable .pptx
The system SHALL provide a Forge action that compiles the `theme.js` entry's default export as theme overrides and every other loaded entry's default export as a slide module receiving `(pptx, lib)`, executed in sidebar (filename-sorted) order, and SHALL offer the resulting presentation as a `.pptx` download.

#### Scenario: Forge produces a downloadable file
- **WHEN** the user has loaded a `theme.js` and at least one valid slide file, and clicks Forge
- **THEN** the browser downloads a `.pptx` file reflecting the slides added by each loaded file's default export, in sidebar order

#### Scenario: Forge patches theme scheme colors
- **WHEN** `theme.js` overrides include `scheme` colors
- **THEN** the downloaded `.pptx`'s `ppt/theme/theme1.xml` reflects those scheme colors, matching the CLI's theme-patching behavior

#### Scenario: Forge with placeholder theme.js uses library defaults
- **WHEN** the user runs Forge without having changed `theme.js` from its default placeholder
- **THEN** the compiled deck uses the rendering library's default theme, equivalent to running the CLI with no `theme.js` present

#### Scenario: Forge output filename derives from the active workspace name
- **WHEN** the user clicks Forge
- **THEN** the downloaded file's base name is the active workspace's name, sanitized for use as a filename, with a `.pptx` extension

#### Scenario: A failing file surfaces a readable error
- **WHEN** one of the loaded files throws an error while being imported or executed (e.g. a syntax error or a runtime exception)
- **THEN** Forge does not produce a download, and an inline error message identifies which file failed and includes the error's message

#### Scenario: Forge requires at least one slide file
- **WHEN** the user clicks Forge with no slide files loaded (only the `theme.js` entry present)
- **THEN** no download is produced and an inline message explains that at least one slide file is required

## ADDED Requirements

### Requirement: Optional timestamp suffix on forge output filename
The system SHALL provide a toggle control, off by default, that when enabled appends a timestamp to the forge output filename after the active workspace's sanitized name, and does not otherwise affect the active workspace's name or identity.

#### Scenario: Timestamp toggle appends a timestamp
- **WHEN** the user enables the timestamp toggle and clicks Forge
- **THEN** the downloaded file's name is the active workspace's sanitized name followed by a timestamp, before the `.pptx` extension

#### Scenario: Timestamp toggle off uses the workspace name alone
- **WHEN** the timestamp toggle is off (its default state) and the user clicks Forge
- **THEN** the downloaded file's name matches the active workspace's sanitized name alone, with no timestamp appended
