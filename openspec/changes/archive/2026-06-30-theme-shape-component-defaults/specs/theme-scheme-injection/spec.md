## ADDED Requirements

### Requirement: createLib merges theme.shape from workspace overrides
`createLib` SHALL merge `overrides.shape` into `defaultTheme.shape` using `deepMerge`, making workspace-defined `shape` exports effective. Partial overrides at any nesting level SHALL be supported — only specified keys change, all others retain their `defaultTheme.shape` values.

#### Scenario: Workspace shape override takes effect
- **WHEN** workspace `theme.js` exports `{ shape: { radius: 0.16 } }` and `createLib(themeOverrides)` is called
- **THEN** `theme.shape.radius` equals `0.16` after merge

#### Scenario: Workspace card color override takes effect
- **WHEN** workspace `theme.js` exports `{ shape: { card: { borderColor: 'accent4' } } }` and `createLib(themeOverrides)` is called
- **THEN** `theme.shape.card.borderColor` equals `'accent4'`
- **THEN** `theme.shape.card.bgColor` equals `'bg1'` (default retained)

#### Scenario: Workspace without shape export uses all defaults
- **WHEN** workspace `theme.js` does not export a `shape` key
- **THEN** `theme.shape` contains all `defaultTheme.shape` values unchanged
