## ADDED Requirements

### Requirement: defaultTheme.shape contains component namespaces with geometry and color defaults
`defaultTheme.shape` in `lib.js` SHALL be restructured to contain global geometry primitives at the top level plus per-component namespace sub-objects. The global keys SHALL be `radius` (0.08) and `borderW` (0.8). The component namespaces SHALL be: `card`, `artifactCard`, `miniCard`, `phaseLabel`, `flowBox`, `flowArrow`, `divider`, `calloutBanner`, `darkPanelHeader`, `pullQuote`, `sectionTitle`, and `frame`. The `radiusLg`, `shadowDark`, and `accentW` keys SHALL be removed from the global level. The `shadow` key SHALL move into `card.shadow`. `accentW` SHALL move into `calloutBanner.accentW`.

#### Scenario: card namespace contains geometry and color defaults
- **WHEN** `defaultTheme.shape.card` is inspected
- **THEN** it contains `bgColor: 'bg1'`, `borderColor: 'accent6'`, `accentColor: 'accent1'`, `titleColor: 'tx1'`, `bodyColor: 'tx2'`, and a `shadow` object with `type`, `color`, `opacity`, `blur`, `angle`, `offset`

#### Scenario: divider namespace contains geometry and color defaults
- **WHEN** `defaultTheme.shape.divider` is inspected
- **THEN** it contains `color: 'accent1'`, `badgeTextColor: 'bg1'`, `lineWidth: 1.5`, `badgeW: 1.20`, `badgeH: 0.24`, `gap: 0.10`

#### Scenario: frame namespace contains geometry and color defaults
- **WHEN** `defaultTheme.shape.frame` is inspected
- **THEN** it contains `badgeRadius: 0.15`, `borderColor: 'accent6'`, `badgeColor: 'accent1'`, `badgeTextColor: 'bg1'`, `wordmarkColor: 'accent5'`, `footerLineColor: 'accent6'`, `footerTextColor: 'accent5'`

#### Scenario: radiusLg is removed from global shape
- **WHEN** `defaultTheme.shape` is inspected
- **THEN** it does NOT contain a key named `radiusLg`

#### Scenario: shadowDark is removed
- **WHEN** `defaultTheme.shape` is inspected
- **THEN** it does NOT contain a key named `shadowDark`

#### Scenario: shadow is NOT at the global shape level
- **WHEN** `defaultTheme.shape` is inspected at the top level
- **THEN** it does NOT contain a key named `shadow` (it lives at `theme.shape.card.shadow`)

#### Scenario: accentW is NOT at the global shape level
- **WHEN** `defaultTheme.shape` is inspected at the top level
- **THEN** it does NOT contain a key named `accentW` (it lives at `theme.shape.calloutBanner.accentW`)

### Requirement: createLib uses deepMerge to merge the full theme including shape
`createLib` SHALL use a recursive `deepMerge(defaults, overrides)` helper to merge `defaultTheme` with workspace overrides. `deepMerge` SHALL recursively merge plain objects and replace all other value types. The result SHALL make `theme.shape` fully overridable from workspace `theme.js`.

#### Scenario: Workspace radius override is applied
- **WHEN** `createLib({ shape: { radius: 0.16 } })` is called
- **THEN** `theme.shape.radius` equals `0.16`
- **THEN** all other shape properties retain their `defaultTheme.shape` values

#### Scenario: Workspace card namespace partial override is applied
- **WHEN** `createLib({ shape: { card: { borderColor: 'accent4' } } })` is called
- **THEN** `theme.shape.card.borderColor` equals `'accent4'`
- **THEN** `theme.shape.card.bgColor` equals `'bg1'` (default retained)
- **THEN** `theme.shape.card.shadow` retains all default properties

#### Scenario: Workspace shadow partial override is applied
- **WHEN** `createLib({ shape: { card: { shadow: { opacity: 0.15 } } } })` is called
- **THEN** `theme.shape.card.shadow.opacity` equals `0.15`
- **THEN** `theme.shape.card.shadow.type` equals `'outer'` (default retained)
- **THEN** `theme.shape.card.shadow.blur` equals `1` (default retained)

#### Scenario: Workspace without shape export is unaffected
- **WHEN** `createLib({})` is called with no shape key
- **THEN** `theme.shape` equals `defaultTheme.shape` exactly

#### Scenario: Workspace scheme and color merges still work
- **WHEN** `createLib({ scheme: { accent1: 'FF0000' }, color: { primary: 'red' } })` is called
- **THEN** `theme.scheme.accent1` equals `'FF0000'`
- **THEN** `theme.color.primary` equals `'red'`
- **THEN** `theme.scheme.accent2` retains its default value
