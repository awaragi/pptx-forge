## ADDED Requirements

### Requirement: createLib normalizes scheme slot names to role aliases in theme.color and theme.shape
`createLib` SHALL apply a `resolveThemeColors` step to the merged theme, after `deepMerge`, that rewrites any string value found in `theme.color` or `theme.shape` (recursively, at any nesting depth) equal to `dk1`, `lt1`, `dk2`, or `lt2` to its role-alias equivalent `tx1`, `bg1`, `tx2`, or `bg2` respectively. `theme.scheme` SHALL NOT be affected by this normalization, since its values are literal hex strings rather than scheme-name references.

#### Scenario: Workspace color alias uses slot name form
- **WHEN** workspace `theme.js` exports `{ color: { surface: 'lt1' } }` and `createLib(themeOverrides)` is called
- **THEN** `T.color.surface` equals `'bg1'`

#### Scenario: Workspace color alias uses role-alias form
- **WHEN** workspace `theme.js` exports `{ color: { surface: 'bg1' } }` and `createLib(themeOverrides)` is called
- **THEN** `T.color.surface` equals `'bg1'` (unchanged)

#### Scenario: Workspace shape color override uses slot name form
- **WHEN** workspace `theme.js` exports `{ shape: { card: { bgColor: 'lt1', titleColor: 'dk1' } } }` and `createLib(themeOverrides)` is called
- **THEN** `T.shape.card.bgColor` equals `'bg1'`
- **THEN** `T.shape.card.titleColor` equals `'tx1'`

#### Scenario: theme.scheme is not normalized
- **WHEN** workspace `theme.js` exports `{ scheme: { dk1: '1A1A1A', lt1: 'FFFFFF' } }` and `createLib(themeOverrides)` is called
- **THEN** `T.scheme.dk1` equals `'1A1A1A'`
- **THEN** `T.scheme.lt1` equals `'FFFFFF'`
- **THEN** `T.scheme` still has keys named `dk1` and `lt1` (the keys themselves are not renamed to `tx1`/`bg1`)

#### Scenario: accent and hex values pass through unchanged
- **WHEN** workspace `theme.js` exports `{ color: { primary: 'accent1', highlight: 'EEF7DF' } }` and `createLib(themeOverrides)` is called
- **THEN** `T.color.primary` equals `'accent1'`
- **THEN** `T.color.highlight` equals `'EEF7DF'`
