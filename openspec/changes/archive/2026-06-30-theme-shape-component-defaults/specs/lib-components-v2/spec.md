## ADDED Requirements

### Requirement: Components read visual defaults from theme.shape namespaces
All component functions inside `createLib` SHALL read their color and geometry defaults from `theme.shape.<namespace>.*` rather than hardcoding scheme-slot string literals. Per-call `opts` values SHALL continue to override theme defaults at the highest priority. The resolution order for any visual property SHALL be: `opts.<prop>` → `theme.shape.<namespace>.<prop>` → (not reached, defaults are in theme).

#### Scenario: Card border color reads from theme.shape.card.borderColor
- **WHEN** `comp.smallCard(slide, box, { title: 'T', body: 'B' }, {}, 'name')` is called without borderColor in opts
- **THEN** the card border renders using `theme.shape.card.borderColor`

#### Scenario: Per-call opts override theme.shape defaults
- **WHEN** `comp.smallCard(slide, box, { title: 'T', body: 'B' }, { borderColor: 'accent2' }, 'name')` is called
- **THEN** the card border renders in `'accent2'` regardless of `theme.shape.card.borderColor`

#### Scenario: Card shadow reads from theme.shape.card.shadow
- **WHEN** `comp.benefitCard(slide, box, { title: 'T', body: 'B' }, {}, 'name')` is called
- **THEN** the drop shadow parameters match `theme.shape.card.shadow`

#### Scenario: Divider defaults read from theme.shape.divider
- **WHEN** `layout.labeledDivider(slide, box, 'Label', {}, 'name')` is called with no opts
- **THEN** line color is `theme.shape.divider.color`, lineWidth is `theme.shape.divider.lineWidth`, badgeW is `theme.shape.divider.badgeW`, badgeH is `theme.shape.divider.badgeH`

#### Scenario: Frame colors read from theme.shape.frame
- **WHEN** `frame.slideHeader(slide, undefined, {}, 's01')` is called
- **THEN** the badge fill uses `theme.shape.frame.badgeColor` and the wordmark uses `theme.shape.frame.wordmarkColor`

#### Scenario: calloutBanner reads from theme.shape.calloutBanner
- **WHEN** `layout.calloutBanner(slide, box, 'Text', {}, 'name')` is called with no opts
- **THEN** the background uses `theme.shape.calloutBanner.bgColor`, accent uses `theme.shape.calloutBanner.accentColor`, text uses `theme.shape.calloutBanner.textColor`, stripe width uses `theme.shape.calloutBanner.accentW`

### Requirement: No scheme-slot color strings hardcoded in component function bodies
All lib component function bodies inside `createLib` SHALL read color values from `theme.shape.<namespace>.<prop>` or from caller-supplied `opts`. No bare scheme-slot string literals (`'accent1'`, `'accent6'`, `'tx1'`, `'tx2'`, `'bg1'`, `'bg2'`) SHALL appear as hardcoded defaults inside component or layout function bodies. The `defaultTheme.shape` definitions are the sole place for default color strings.

#### Scenario: No hardcoded color strings in component bodies
- **WHEN** the `lib.js` source is inspected for component and layout function bodies
- **THEN** no function body inside `createLib` contains a bare scheme-slot string literal used as a direct color default (e.g., `color: 'accent6'` hardcoded — it must read from `theme.shape.*`)

## REMOVED Requirements

### Requirement: accentBlock component
**Reason**: `accentBlock` was never called from any workspace or slide file. It is dead code with no known users.
**Migration**: Build the same layout using `prim.roundRect`, `prim.fillRect`, and `prim.text` directly — see the Custom Components section of INSTRUCTIONS.md.

## MODIFIED Requirements

### Requirement: SmallCard accepts bodyColor override
`comp.smallCard` SHALL support `opts.bodyColor` (default `theme.shape.card.bodyColor`, which is `'tx2'`) to control the body text color. The previous default of `'accent5'` is replaced by `'tx2'` to unify `smallCard` with the rest of the card family (`benefitCard`, `phaseBox`, `numberedStep`).

#### Scenario: Default body color is tx2 (unified with card family)
- **WHEN** `comp.smallCard(slide, box, { title, body }, {}, 'name')` is called without bodyColor
- **THEN** body text renders in `theme.shape.card.bodyColor` which defaults to `'tx2'`

#### Scenario: Caller overrides body color
- **WHEN** `comp.smallCard(slide, box, { title, body }, { bodyColor: 'accent5' }, 'name')` is called
- **THEN** body text renders in `'accent5'`

#### Scenario: Workspace restores accent5 via theme.shape
- **WHEN** `createLib({ shape: { card: { bodyColor: 'accent5' } } })` is called
- **THEN** `comp.smallCard` body text renders in `'accent5'` without per-call opts
