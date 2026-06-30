## ADDED Requirements

### Requirement: INSTRUCTIONS.md documents theme.shape structure and workspace override pattern
`INSTRUCTIONS.md` SHALL include a `theme.shape` subsection within the Theme Object section. It SHALL document the full two-level structure: global keys (`radius`, `borderW`, `accentW`) and each component namespace with all its properties and defaults. It SHALL show an example of a workspace `theme.js` `shape` export demonstrating a partial override, and explain that unspecified keys retain their defaults.

#### Scenario: AI knows theme.shape exists and is overridable
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it knows that `theme.shape` contains per-component visual defaults and that workspace `theme.js` can export a `shape` object to override any subset

#### Scenario: AI can document what component namespaces exist
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it can enumerate the component namespaces (`card`, `artifactCard`, `miniCard`, `divider`, `frame`, etc.) and their key properties

#### Scenario: AI understands partial override semantics
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it knows that `shape: { card: { borderColor: 'accent4' } }` only changes `card.borderColor` and all other shape properties remain at their defaults

### Requirement: INSTRUCTIONS.md documents resolution order for component visual properties
`INSTRUCTIONS.md` SHALL document the three-level resolution order for component visual properties: (1) per-call `opts` — highest priority, (2) `theme.shape.<namespace>.<prop>` — workspace-level default, (3) `defaultTheme.shape` — system default. It SHALL make clear that slide files can always override any visual property via `opts` without touching theme configuration.

#### Scenario: AI knows opts always win
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it understands that passing `opts.borderColor` to a component always overrides `theme.shape.card.borderColor`

#### Scenario: AI knows theme.shape is for workspace-wide defaults, not per-slide
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it uses `opts` for per-call overrides and advises setting `theme.shape` in `theme.js` only when a style change should apply to all instances of a component across the entire workspace

### Requirement: INSTRUCTIONS.md includes a theme.js shape export example
`INSTRUCTIONS.md` SHALL include a concrete example showing a workspace `theme.js` that exports a `shape` object, demonstrating how to change card borders, shadow opacity, and divider line weight. The example SHALL show partial overrides (not requiring every property to be specified).

#### Scenario: AI can generate a correct theme.js shape export
- **WHEN** an AI reads INSTRUCTIONS.md
- **THEN** it can produce a syntactically correct `theme.js` `shape` export that compiles and takes effect without specifying every property
