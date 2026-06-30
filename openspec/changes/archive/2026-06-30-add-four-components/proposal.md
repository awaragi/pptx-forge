## Why

The component library covers flow diagrams and KPI tiles well but lacks a few high-frequency consulting patterns — dark-background stats, insight callouts, left-accent challenge cards, and team member tiles. These four additions close that gap with minimal content complexity (2–3 scalar fields each), consistent with the existing component API.

## What Changes

- Add `calloutQuote(slide, box, { label, quote }, opts, name)` — left-border accent insight box
- Add `darkStat(slide, box, { value, label, source }, opts, name)` — dark gradient KPI tile, dark-bg counterpart to `iconStat`
- Add `challengeCard(slide, box, { title, body }, opts, name)` — left-bar accent card (variant of `accentCard` with accent on left instead of top)
- Add `teamCard(slide, box, { name, role, bio }, opts, name)` — circular avatar placeholder + name + role
- Add theme tokens for the two new visual styles (`darkStat`, `teamCard`) to `theme.js`

## Capabilities

### New Capabilities

- `components-callout-quote`: Left-border insight/quote box with small-caps label and body text
- `components-dark-stat`: Dark gradient KPI tile with large value, label, and optional source line
- `components-challenge-card`: Left-accent-bar card for challenges or risks
- `components-team-card`: Circular avatar placeholder card with name, role, and optional bio

### Modified Capabilities

- `lib-components-v2`: Four new exported functions added to `makeComponents`; no breaking changes to existing functions

## Impact

- `src/components.js` — four new functions inside `makeComponents`
- `src/theme.js` — new shape token groups: `darkStat`, `teamCard`
- `src/sample/` — optional: one showcase slide demonstrating the new components
