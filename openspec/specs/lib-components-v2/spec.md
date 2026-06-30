## Purpose

Defines the component library exported by `createLib` in `lib.js` — the full set of slide-building primitives, components, and frame functions available to workspace slide files.

---

## Requirements

### Requirement: SectionTitle component
`createLib` SHALL export a `layout.sectionTitle(slide, box, text, opts = {}, name)` function that renders a bold h2-sized heading. When `box` fields are omitted or `-1`, it SHALL default to `x: T.grid.marginX`, `y: T.grid.contentTop`, `w: T.grid.contentW`, `h: 0.34`. `fontSize` defaults to `T.size.h2`, `color` defaults to `'tx1'`. All defaults SHALL be overridable via `opts`.

#### Scenario: Default section heading placement
- **WHEN** `layout.sectionTitle(slide, {}, 'My Section')` is called with no box fields and no opts
- **THEN** a bold text element is placed at `(T.grid.marginX, T.grid.contentTop)` spanning `T.grid.contentW`
- **THEN** text color is `'tx1'`
- **THEN** font size is `T.size.h2`

#### Scenario: Custom position via box
- **WHEN** `layout.sectionTitle(slide, { x: 1.0, y: 2.0, w: 5.0, h: -1 }, 'Title')` is called
- **THEN** the element is placed at x=1.0, y=2.0, w=5.0

### Requirement: DarkPanelHeader component
`createLib` SHALL export a `layout.darkPanelHeader(slide, box, { title, subtitle }, opts = {}, name)` function that renders a dark section-header bar with a rounded rect background, a bold title on the left, and an optional italic subtitle to its right. `box.h` defaults to `0.44` when `-1`. Opts defaults: `bgColor: 'tx1'`, `titleColor: 'accent1'`, `subtitleColor: 'bg1'`, `titleW: 1.60`. All defaults SHALL be scheme-slot strings.

#### Scenario: Default dark header rendered
- **WHEN** `layout.darkPanelHeader(slide, { x: 0.73, y: 0.88, w: 5.72, h: -1 }, { title: 'Deliberate', subtitle: 'Explore' }, {}, 's-hdr')` is called
- **THEN** a rounded rect fills the area with `'tx1'` background
- **THEN** 'Deliberate' appears in `'accent1'` bold
- **THEN** 'Explore' appears in `'bg1'` italic to the right of the title

#### Scenario: Background color override
- **WHEN** opts includes `{ bgColor: 'bg2', titleColor: 'tx1', subtitleColor: 'tx2' }`
- **THEN** the background uses `'bg2'` instead of `'tx1'`

### Requirement: LabeledDivider component
`createLib` SHALL export a `layout.labeledDivider(slide, box, label, opts = {}, name)` function that renders a vertical line from `box.y` to `box.y + box.h` at `box.x`, with a centered label badge at the midpoint. Defaults: `color: 'accent1'`, `lineWidth: 1.5`, `badgeW: 1.20`, `badgeH: 0.24`.

#### Scenario: Divider renders two line segments and a badge
- **WHEN** `layout.labeledDivider(slide, { x: 6.63, y: 1.34, w: -1, h: 4.26 }, 'Decision Layer', {}, 's-div')` is called
- **THEN** two vertical lines are drawn above and below the midpoint at x=6.63
- **THEN** a rounded rect badge appears at the midpoint containing 'Decision Layer'
- **THEN** the badge fill and both line colors use `'accent1'`

### Requirement: CalloutBanner component
`createLib` SHALL export a `layout.calloutBanner(slide, box, text, opts = {}, name)` function that renders a full-width dark banner with a thin left accent strip and centered text. Opts defaults: `bgColor: 'tx1'`, `accent: 'accent1'`, `textColor: 'bg1'`, `fontSize: T.size.bodyLg`, `italic: true`, `bold: true`, `align: 'center'`. `text` SHALL be accepted as a scalar or `{ text }` object.

#### Scenario: Default callout banner
- **WHEN** `layout.calloutBanner(slide, { x: 0.73, y: 5.78, w: 11.87, h: 0.66 }, 'Some rule text.', {}, 's-rule')` is called
- **THEN** a rounded rect fills the area with `'tx1'` background
- **THEN** a thin rect fills the left edge with `'accent1'`
- **THEN** the text is centered, bold, italic, in `'bg1'`

#### Scenario: Text color override
- **WHEN** opts includes `{ textColor: 'bg1' }`
- **THEN** the banner text renders in `'bg1'`
- **THEN** the text is centered, bold, italic, in `'bg1'`

#### Scenario: Text color override
- **WHEN** opts includes `{ textColor: 'bg1' }`
- **THEN** the banner text renders in `'bg1'`

### Requirement: PullQuote component
`createLib` SHALL export a `layout.pullQuote(slide, box, text, opts = {}, name)` function that renders a large italic quotation-style text block. Opts defaults: `color: 'accent1'`, `fontSize: T.size.pullQuote`, `italic: true`, `bold: false`, `align: 'left'`. `text` SHALL be accepted as a scalar or `{ text }` object.

#### Scenario: Default pull quote
- **WHEN** `layout.pullQuote(slide, { x: 7.18, y: 0.88, w: 5.42, h: 1.08 }, '"Quote text."', {}, 's-pq')` is called
- **THEN** the text is placed at the given position with `'accent1'` color
- **THEN** font size is `T.size.pullQuote` and italic is true

#### Scenario: Bold centered variant
- **WHEN** opts includes `{ bold: true, align: 'center', fontSize: T.size.h2 }`
- **THEN** text is bold, centered, at the specified font size

### Requirement: Lib component implementations use only scheme-slot color references
All lib component function bodies inside `createLib` SHALL only reference colors as direct PowerPoint scheme-slot strings (`'accent1'`–`'accent6'`, `'tx1'`, `'tx2'`, `'bg1'`, `'bg2'`) or as caller-supplied opts values. No workspace tint hex values SHALL appear as hardcoded defaults inside `lib.js` component implementations.

#### Scenario: No tint names in lib function source
- **WHEN** the `lib.js` source is inspected after this change
- **THEN** no function body inside `createLib` references workspace-owned tint names such as `T.color.primaryBright`, `T.color.mutedText`, `T.color.subtleText`, `T.color.bodyTextMid`, `T.color.frameBorder`, `T.color.divider`, `T.color.footerText`, `T.color.border`, `T.color.primaryLight`, `T.color.primaryPale`, `T.color.dangerSurface`, `T.color.dangerBorder`, `T.color.warningSurface`, `T.color.warningBorder`

#### Scenario: defaultTheme.color is empty
- **WHEN** `defaultTheme.color` is inspected in `lib.js`
- **THEN** it is `{}` (an empty object)

### Requirement: Card components accept borderColor opts
`comp.smallCard`, `comp.artifactCard`, `comp.benefitCard`, `comp.phaseBox`, and `comp.numberedStep` SHALL each accept `opts = {}` as the second-to-last parameter. Each SHALL support `opts.borderColor` (default `'accent6'`) to control the card outline color.

#### Scenario: Default card border uses accent6 scheme color
- **WHEN** `comp.smallCard(slide, box, { title, body }, {}, 'name')` is called without borderColor
- **THEN** the card outline renders using `'accent6'`

#### Scenario: Caller overrides border color
- **WHEN** `comp.smallCard(slide, box, { title, body }, { borderColor: 'D8DEE8' }, 'name')` is called
- **THEN** the card outline renders in `'D8DEE8'`

### Requirement: ArtifactCard accepts filenameColor override
`comp.artifactCard` SHALL support `opts.filenameColor` (default `'accent1'`) to control the monospace filename text color.

#### Scenario: Default filename color is accent1
- **WHEN** `comp.artifactCard(slide, box, { filename, purpose, step }, {}, name)` is called without filenameColor
- **THEN** the filename text renders in `'accent1'`

#### Scenario: Custom filename color
- **WHEN** `comp.artifactCard(slide, box, { filename, purpose, step }, { filenameColor: 'C6F174' }, name)` is called
- **THEN** the filename text renders in `'C6F174'`

### Requirement: SmallCard accepts bodyColor override
`comp.smallCard` SHALL support `opts.bodyColor` (default `'accent5'`) to control the body text color.

#### Scenario: Default body color is accent5
- **WHEN** `comp.smallCard(slide, box, { title, body }, {}, name)` is called without bodyColor
- **THEN** body text renders in `'accent5'`

### Requirement: MiniCard accepts titleColor and bodyColor overrides
`comp.miniCard` SHALL accept `opts = {}`. Title color SHALL default to `'accent1'`; body color SHALL default to `'bg1'`. Both SHALL be overridable via opts. `box` SHALL supply `w` and `h` (previously hardcoded to 2.29 × 0.92).

#### Scenario: Default MiniCard colors use scheme slots
- **WHEN** `comp.miniCard(slide, { x, y, w: 2.29, h: 0.92 }, { title, body }, {}, name)` is called without opts overrides
- **THEN** title renders in `'accent1'` and body renders in `'bg1'`

#### Scenario: Caller passes overrides
- **WHEN** `comp.miniCard(slide, box, { title, body }, { titleColor: 'C6F174', bodyColor: 'E5E7EB' }, name)` is called
- **THEN** title renders in `'C6F174'` and body renders in `'E5E7EB'`

### Requirement: NumberedStep accepts bodyColor override
`comp.numberedStep` SHALL support `opts.bodyColor` (default `'tx2'`) for the step description text color. `box` SHALL supply `h` (previously hardcoded to 1.1).

#### Scenario: Default body text uses tx2 scheme color
- **WHEN** `comp.numberedStep(slide, box, { num, title, body }, {}, name)` is called without bodyColor
- **THEN** body text renders in `'tx2'`
