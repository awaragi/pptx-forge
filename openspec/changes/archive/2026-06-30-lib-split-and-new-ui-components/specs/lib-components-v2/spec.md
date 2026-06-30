## RENAMED Requirements

### Requirement: SmallCard accepts bodyColor override
FROM: SmallCard accepts bodyColor override
TO: infoCard accepts bodyColor override

### Requirement: ArtifactCard accepts filenameColor override
FROM: ArtifactCard accepts filenameColor override
TO: fileCard accepts filenameColor override

### Requirement: MiniCard accepts titleColor and bodyColor overrides
FROM: MiniCard accepts titleColor and bodyColor overrides
TO: overlayCard accepts titleColor and bodyColor overrides

## MODIFIED Requirements

### Requirement: Card components accept borderColor opts
`comp.infoCard`, `comp.fileCard`, `comp.accentCard`, `comp.stepBox`, and `comp.numberedStep` SHALL each accept `opts = {}`. Each SHALL support `opts.borderColor` (default `theme.shape.card.borderColor`) to control the card outline color.

#### Scenario: Default card border uses theme.shape.card.borderColor
- **WHEN** `comp.infoCard(slide, box, { title, body }, {}, 'name')` is called without borderColor
- **THEN** the card outline renders using `theme.shape.card.borderColor`

#### Scenario: Caller overrides border color
- **WHEN** `comp.infoCard(slide, box, { title, body }, { borderColor: 'D8DEE8' }, 'name')` is called
- **THEN** the card outline renders in `'D8DEE8'`

## ADDED Requirements

### Requirement: iconStat component
`createLib` SHALL export a `comp.iconStat(slide, box, { value, label, icon }, opts, name)` function that renders a large value string in accent color, a small label below it, and an optional UTF-8 icon above the value. Defaults: `valueColor: theme.shape.iconStat.valueColor` (`'accent1'`), `labelColor: theme.shape.iconStat.labelColor` (`'tx2'`), `fontSize: theme.size.h1`. Icon is omitted when not provided.

#### Scenario: Value and label render at correct sizes
- **WHEN** `comp.iconStat(slide, { x, y, w, h }, { value: '94%', label: 'Adoption' }, {}, 'stat')` is called
- **THEN** '94%' renders at `theme.size.h1` in `'accent1'`
- **THEN** 'Adoption' renders at `theme.size.small` in `'tx2'` below the value

#### Scenario: Icon renders above value when provided
- **WHEN** `comp.iconStat(slide, box, { value: '94%', label: 'Adoption', icon: '✓' }, {}, 'stat')` is called
- **THEN** '✓' renders above '94%' centered in the box

#### Scenario: Icon is omitted when not provided
- **WHEN** `comp.iconStat(slide, box, { value: '94%', label: 'Adoption' }, {}, 'stat')` is called without icon
- **THEN** no icon element is rendered

### Requirement: iconBox component
`createLib` SHALL export a `comp.iconBox(slide, box, { icon, title, body }, opts, name)` function that renders a rounded-rect card with a large centered UTF-8 icon, a bold title below it, and optional body text. Defaults from `theme.shape.iconBox`: `bgColor: 'bg2'`, `borderColor: 'accent6'`, `iconColor: 'accent1'`, `titleColor: 'tx1'`, `bodyColor: 'tx2'`. Default `icon` is `'★'`.

#### Scenario: Icon, title, and body render in correct positions
- **WHEN** `comp.iconBox(slide, { x, y, w, h }, { icon: '✦', title: 'Security', body: 'Zero trust.' }, {}, 'ib')` is called
- **THEN** '✦' renders large and centered horizontally in the upper portion of the box
- **THEN** 'Security' renders bold below the icon
- **THEN** 'Zero trust.' renders in body color below the title

#### Scenario: Body is optional
- **WHEN** `comp.iconBox(slide, box, { icon: '★', title: 'Speed' }, {}, 'ib')` is called without body
- **THEN** no body text element is rendered

### Requirement: bulletIconList component
`createLib` SHALL export a `comp.bulletIconList(slide, box, items, opts, name)` function where `items` is `Array<{ icon: string; text: string }>`. Each item SHALL render as a single line with the icon character followed by the text. Defaults: `iconColor: theme.shape.iconBox.iconColor` (`'accent1'`), `textColor: 'tx2'`, `fontSize: theme.size.small`. Items render top-to-bottom with equal vertical spacing.

#### Scenario: Each item renders icon then text
- **WHEN** `comp.bulletIconList(slide, box, [{ icon: '✓', text: 'Fast' }, { icon: '✓', text: 'Secure' }], {}, 'list')` is called
- **THEN** two lines render, each prefixed with '✓'
- **THEN** the icon portion uses `'accent1'` and the text portion uses `'tx2'`

#### Scenario: Mixed icons per item
- **WHEN** items include `{ icon: '✓', text: 'Pro' }` and `{ icon: '✗', text: 'Con' }`
- **THEN** each line uses its own icon character

### Requirement: imageCard component
`createLib` SHALL export a `comp.imageCard(slide, box, { image, title, body, imageH }, opts, name)` function that renders a card with a filled image placeholder band at the top containing a large centered `image` UTF-8 character, followed by a title and body below. `imageH` defaults to `1.0`. Default `image` is `'🖼'`. Card background, border, title, body colors default from `theme.shape.imageCard`.

#### Scenario: Image band renders at top of card
- **WHEN** `comp.imageCard(slide, { x, y, w, h }, { image: '🏗', title: 'Platform', body: 'Cloud-native.' }, {}, 'ic')` is called
- **THEN** a filled rect appears at the top of the card spanning card width at `imageH` height
- **THEN** '🏗' renders large and centered within the image band

#### Scenario: Title and body render below image band
- **WHEN** the imageCard is rendered
- **THEN** 'Platform' renders as bold title below the image band
- **THEN** 'Cloud-native.' renders as body text below the title

#### Scenario: Default image is the picture frame emoji
- **WHEN** `comp.imageCard(slide, box, { title: 'X', body: 'Y' }, {}, 'ic')` is called without image
- **THEN** '🖼' renders in the image band

### Requirement: twoColumnRow component
`createLib` SHALL export a `comp.twoColumnRow(slide, box, { label, content }, opts, name)` function that renders a left label cell and a right content cell side by side. `opts.splitRatio` controls the width split (default `0.35` — 35% label, 65% content). Label uses bold `'tx1'`, content uses `'tx2'`. Both cells share the same `box.y` and `box.h`.

#### Scenario: Label and content render side by side
- **WHEN** `comp.twoColumnRow(slide, { x, y, w, h }, { label: 'Cost', content: 'Low' }, {}, 'row')` is called
- **THEN** 'Cost' renders left-aligned in the left 35% of box.w
- **THEN** 'Low' renders left-aligned in the right 65% of box.w

#### Scenario: splitRatio override
- **WHEN** `opts.splitRatio = 0.5` is provided
- **THEN** both cells each occupy 50% of box.w

### Requirement: progressBar component
`createLib` SHALL export a `comp.progressBar(slide, box, { value, label, showPct }, opts, name)` function. `value` is a number from 0 to 1. A filled track renders across `box.w` at height `opts.trackH` (default `0.12`). The filled portion width is `box.w × value`. An optional label renders below and an optional percentage string renders to the right of the track when `showPct` is true. Colors from `theme.shape.progressBar`: `fillColor: 'accent1'`, `trackColor: 'bg2'`.

#### Scenario: Fill width matches value
- **WHEN** `comp.progressBar(slide, { x, y, w: 4.0, h: 0.5 }, { value: 0.72, label: 'Adoption' }, {}, 'pb')` is called
- **THEN** the filled rect has width `4.0 × 0.72 = 2.88`
- **THEN** the track background rect has width `4.0`

#### Scenario: Label renders below track
- **WHEN** progressBar is called with label 'Adoption'
- **THEN** 'Adoption' renders below the track bar in `theme.shape.progressBar.labelColor`

#### Scenario: Percentage shown when showPct is true
- **WHEN** `showPct: true` is passed and `value: 0.72`
- **THEN** '72%' renders to the right of the filled bar

### Requirement: tagBadge component
`createLib` SHALL export a `comp.tagBadge(slide, box, { label }, opts, name)` function that renders a small filled rounded-rect pill with centered label text. Defaults: `bgColor: theme.shape.tagBadge.bgColor` (`'accent1'`), `textColor: theme.shape.tagBadge.textColor` (`'bg1'`), `fontSize: theme.size.badge`.

#### Scenario: Badge renders with accent background and light text
- **WHEN** `comp.tagBadge(slide, { x, y, w: 0.8, h: 0.22 }, { label: 'BETA' }, {}, 'tag')` is called
- **THEN** a rounded rect fills the box with `'accent1'`
- **THEN** 'BETA' renders centered in `'bg1'`

#### Scenario: Color overrides accepted
- **WHEN** `opts.bgColor = 'accent2'` and `opts.textColor = 'bg1'` are passed
- **THEN** the badge background uses `'accent2'`

### Requirement: stepFlow component
`createLib` SHALL export a `comp.stepFlow(slide, box, items, opts, name)` function where `items` is `Array<{ label: string; highlight?: boolean }>`. It SHALL auto-distribute `flowBox` elements and `flowArrow` elements across `box.w`. When `n` items are given: arrow width is `0.22`; each box width is `(box.w - (n-1) × 0.22) / n`. When `n = 1`, no arrows are drawn.

#### Scenario: Three items produce three boxes and two arrows
- **WHEN** `comp.stepFlow(slide, { x: 0.73, y: 2.0, w: 6.0, h: 0.44 }, [{ label: 'A' }, { label: 'B' }, { label: 'C' }], {}, 'sf')` is called
- **THEN** three flow boxes render at computed x positions
- **THEN** two flow arrows render between them

#### Scenario: Single item fills full width with no arrow
- **WHEN** `comp.stepFlow(slide, { x, y, w: 3.0, h: 0.44 }, [{ label: 'Only' }], {}, 'sf')` is called
- **THEN** one box renders at width `3.0` with no arrow

#### Scenario: Highlighted item uses highlight styling
- **WHEN** an item has `highlight: true`
- **THEN** that box renders with `flowBox` highlight styles (accent fill, light text)

### Requirement: imageHolder component
`createLib` SHALL export a `comp.imageHolder(slide, box, { icon, label }, opts, name)` function that renders a visually distinct placeholder box — a dashed or thin-border rect with a large centered `icon` character and a small label string below it. Default `icon` is `'🖼'`. Intent is to mark areas that will be replaced by real images in PowerPoint.

#### Scenario: Placeholder renders icon and label
- **WHEN** `comp.imageHolder(slide, { x, y, w, h }, { icon: '📊', label: 'chart goes here' }, {}, 'ph')` is called
- **THEN** a bordered rect appears at the given box
- **THEN** '📊' renders large and centered in the rect
- **THEN** 'chart goes here' renders small below the icon

#### Scenario: Default icon is the picture frame emoji
- **WHEN** `comp.imageHolder(slide, box, { label: 'image' }, {}, 'ph')` is called without icon
- **THEN** '🖼' is used as the icon

### Requirement: labeledSection layout component
`createLib` SHALL export a `layout.labeledSection(slide, box, { title, subtitle }, opts, name)` function that composes `layout.sectionTitle` (title line) and `layout.darkPanelHeader` (subtitle bar) into one call. When `subtitle` is absent only `sectionTitle` is rendered. `box` fields default to theme grid values when omitted.

#### Scenario: Title and subtitle both render
- **WHEN** `layout.labeledSection(slide, { x, y, w, h }, { title: 'Section', subtitle: 'Context' }, {}, 'ls')` is called
- **THEN** a bold section title renders at the top of the box
- **THEN** a dark panel header with 'Context' renders below it

#### Scenario: No subtitle — only title renders
- **WHEN** `layout.labeledSection(slide, box, { title: 'Section Only' }, {}, 'ls')` is called without subtitle
- **THEN** only the section title element is rendered

### Requirement: dataTable component
`createLib` SHALL export a `tables.dataTable(slide, box, { headers, rows }, opts, name)` function. `headers` is a string array; `rows` is a string[][]. The first row renders with `theme.shape.dataTable.headerBgColor` fill and `headerTextColor` text. Data rows alternate between `rowBgColor` and `altBgColor`. Column widths are distributed equally across `box.w`. The call uses `slide.addTable()` internally.

#### Scenario: Header row renders with accent fill
- **WHEN** `tables.dataTable(slide, { x, y, w: 8.0, h: 2.0 }, { headers: ['A', 'B', 'C'], rows: [['1','2','3']] }, {}, 'tbl')` is called
- **THEN** the first row cells have `theme.shape.dataTable.headerBgColor` fill
- **THEN** header text uses `theme.shape.dataTable.headerTextColor`

#### Scenario: Column widths distribute equally across box.w
- **WHEN** three columns are provided and `box.w = 9.0`
- **THEN** each column is `3.0` wide

#### Scenario: Empty rows produce header-only table
- **WHEN** `rows: []` is passed
- **THEN** only the header row is rendered without error

### Requirement: comparisonTable component
`createLib` SHALL export a `tables.comparisonTable(slide, box, { headers, rows }, opts, name)` function. `headers` is a string array (first column is criteria label, rest are option headers). `rows` is `Array<string[]>` where the first element is the criteria label and remaining elements are values (may use UTF-8 symbols like `'✓'` or `'✗'`). The header row uses `theme.shape.comparisonTable.headerBgColor`. The first column of data rows uses `criteriaColor`; value columns use `valueColor`. Column widths: first column is `opts.criteriaW` (default `2.5`), remaining columns distribute equally across remaining width.

#### Scenario: Criteria column is wider than value columns
- **WHEN** `tables.comparisonTable(slide, { x, y, w: 8.0, h: 2.0 }, { headers: ['', 'Option A', 'Option B'], rows: [['Cost', '✓', '✗']] }, {}, 'ct')` is called with default `criteriaW`
- **THEN** the first column is `2.5` wide
- **THEN** remaining two columns split `8.0 - 2.5 = 5.5` equally at `2.75` each

#### Scenario: Check and cross symbols render as text
- **WHEN** a value cell contains `'✓'`
- **THEN** the cell renders '✓' as text with `theme.shape.comparisonTable.valueColor`

### Requirement: New theme.shape stanzas for all new components
`defaultTheme.shape` SHALL include stanzas for each new component: `iconStat`, `iconBox`, `imageCard`, `progressBar`, `tagBadge`, `dataTable`, `comparisonTable`. Each stanza SHALL use only scheme-slot color strings as defaults.

#### Scenario: iconStat stanza present in defaultTheme.shape
- **WHEN** `defaultTheme.shape` is inspected
- **THEN** it contains `iconStat: { valueColor: 'accent1', labelColor: 'tx2' }`

#### Scenario: dataTable stanza uses scheme-slot colors only
- **WHEN** `defaultTheme.shape.dataTable` is inspected
- **THEN** all color fields contain scheme-slot strings (e.g., `'accent1'`, `'bg1'`, `'tx2'`) and no hex literals
