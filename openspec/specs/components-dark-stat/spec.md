## Purpose

Defines the `darkStat` primitive component, which renders a dark-background KPI tile displaying a large statistic value with a label and optional source attribution.

## Requirements

### Requirement: darkStat renders a dark-background KPI tile
The system SHALL render a filled rounded-rect with a dark background, a large value string in accent color, a label below it, and an optional small source line at the bottom.

Content fields: `{ value, label, source }`. `value` and `label` are required strings. `source` is an optional string; when omitted, the source line is not rendered.

#### Scenario: Full content provided
- **WHEN** `darkStat` is called with `{ value: '72%', label: 'of members self-serve', source: 'Gartner, 2025' }`
- **THEN** the slide contains a dark-filled card, a large value text, a label text, and a source text element

#### Scenario: Source omitted
- **WHEN** `darkStat` is called with `{ value: '3×', label: 'faster claims' }` and no `source`
- **THEN** the slide contains a dark-filled card, a large value text, and a label text; no source element is added

### Requirement: darkStat uses theme.shape.darkStat tokens
The system SHALL read `bgColor`, `valueColor`, `labelColor`, and `sourceColor` from `theme.shape.darkStat`, with defaults `tx1`, `accent1`, `bg1`, and `accent6` respectively.

#### Scenario: Theme token override
- **WHEN** a workspace sets `theme.shape.darkStat.bgColor` to a custom color
- **THEN** `darkStat` uses that color for the card background
