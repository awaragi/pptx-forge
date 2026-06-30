## Purpose

Defines the `calloutQuote` primitive component, which renders a left-accent insight/pull-quote card on a slide.

## Requirements

### Requirement: calloutQuote renders a left-accent insight box
The system SHALL render a rounded-rect card with a narrow vertical accent bar on the left edge, a small-caps label above, and body quote text below.

Content fields: `{ label, quote }`. Both are strings. `label` is optional; when omitted, only `quote` is rendered.

#### Scenario: Both label and quote provided
- **WHEN** `calloutQuote` is called with `{ label: 'INSIGHT', quote: 'Some key finding.' }`
- **THEN** the slide contains a card background, a left accent bar, a label text element, and a quote text element

#### Scenario: Label omitted
- **WHEN** `calloutQuote` is called with `{ quote: 'Some key finding.' }` and no `label`
- **THEN** the slide contains a card background, a left accent bar, and a quote text element; no label element is added

### Requirement: calloutQuote opts allow color overrides
The system SHALL accept `opts.accentColor`, `opts.labelColor`, and `opts.quoteColor` to override the defaults drawn from `theme.shape.calloutBanner`.

#### Scenario: Custom accent color
- **WHEN** `opts.accentColor` is set to a valid color string
- **THEN** the left accent bar uses that color instead of the theme default
