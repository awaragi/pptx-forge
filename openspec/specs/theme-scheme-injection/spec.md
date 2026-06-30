## Purpose

Defines how the build system (`compile.js`) and workspace theme files (`theme.js`) handle PowerPoint theme color slot injection, ensuring that workspace-defined palette values are written directly into the compiled PPTX's theme XML.

---

## Requirements

### Requirement: Workspace defines scheme slot hex values
The workspace `theme.js` SHALL export a `scheme` object containing hex strings (without `#`) for any subset of the 10 PowerPoint theme slots: `dk1`, `lt1`, `dk2`, `lt2`, `accent1`, `accent2`, `accent3`, `accent4`, `accent5`, `accent6`. Values not specified SHALL fall back to `defaultTheme.scheme` in `lib.js`.

#### Scenario: Workspace overrides accent1
- **WHEN** workspace `theme.js` exports `{ scheme: { accent1: '86BC25' } }`
- **THEN** `T.scheme.accent1` equals `'86BC25'` after `createLib(themeOverrides)` merges the override

#### Scenario: Workspace omits a slot
- **WHEN** workspace `theme.js` does not include `dk2` in its `scheme` block
- **THEN** `T.scheme.dk2` equals the `defaultTheme.scheme.dk2` value from lib.js

### Requirement: Compile patches theme1.xml with scheme slot hex values
After `pptx.writeFile()` generates the PPTX, `compile.js` SHALL open the file as a ZIP using jszip, replace the content of each `<a:slotName>` element in `ppt/theme/theme1.xml` with `<a:srgbClr val="HEX"/>` using values from `lib.T.scheme`, and write the patched ZIP back to the same output path.

#### Scenario: Successful scheme injection
- **WHEN** `node compile.js ref-rfx` runs to completion
- **THEN** the terminal logs "theme colors patched"
- **THEN** `ppt/theme/theme1.xml` inside the output PPTX contains `<a:accent1><a:srgbClr val="86BC25"/></a:accent1>`

#### Scenario: PowerPoint color picker reflects injected values
- **WHEN** the output PPTX is opened in Microsoft PowerPoint
- **THEN** the theme color row in the color picker displays the workspace-defined accent colors

### Requirement: lib.js defaultTheme.color contains only scheme slot references
`defaultTheme.color` in `lib.js` SHALL be `{}` (empty). The `createLib` merge still accepts workspace `color` overrides, making workspace-defined tints available as `T.color.*` inside slide functions. No hex color values SHALL appear in `defaultTheme.color`.

#### Scenario: Empty default color block
- **WHEN** `createLib({})` is called with no overrides
- **THEN** `T.color` is an empty object `{}`

#### Scenario: Workspace tints available via T.color
- **WHEN** workspace `theme.js` exports `{ color: { primaryLight: 'EEF7DF' } }`
- **THEN** `T.color.primaryLight` equals `'EEF7DF'` inside any slide function

### Requirement: Workspace color block supplies workspace-internal tints
The workspace `theme.js` `color` block SHALL supply all named tint/derived hex values referenced in that workspace's slides (e.g., `primaryLight`, `dangerSurface`, `primaryBright`). These values SHALL be merged into `T.color` by `createLib`. `lib.js` and `compile.js` SHALL NOT define, default, or inspect these tint entries.

#### Scenario: lib.js has no tint color defaults
- **WHEN** `createLib({})` is called with no overrides
- **THEN** `T.color` does NOT contain keys `primaryLight`, `primaryPale`, `primaryBright`, `dangerSurface`, `dangerBorder`, `warningSurface`, `warningBorder`, `bodyTextMid`, `subtleText`, `border`, `footerText`, `mutedText`, `frameBorder`, or `divider`

### Requirement: lib.js defaultTheme.scheme defines 10 PowerPoint slot defaults
`defaultTheme.scheme` SHALL define hex default values for all 10 PowerPoint theme color slots (`dk1`, `lt1`, `dk2`, `lt2`, `accent1`–`accent6`). `createLib` SHALL merge `overrides.scheme` independently so workspaces can override any subset.

#### Scenario: Default scheme slot accessible
- **WHEN** `createLib({})` is called with no overrides
- **THEN** `T.scheme.accent1` equals the `defaultTheme.scheme.accent1` value

#### Scenario: Workspace scheme override merged correctly
- **WHEN** `createLib({ scheme: { accent1: '86BC25' } })` is called
- **THEN** `T.scheme.accent1` equals `'86BC25'`
- **THEN** all other slots retain their `defaultTheme.scheme` values
