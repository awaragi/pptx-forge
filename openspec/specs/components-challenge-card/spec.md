## Purpose

Defines the `challengeCard` primitive component, which renders a left-accent-bar card used to present a challenge or problem statement on a slide.

## Requirements

### Requirement: challengeCard renders a left-accent-bar card
The system SHALL render a rounded-rect card with a narrow vertical accent bar on the left edge, a bold title, and body text below. The accent bar is drawn at the left edge of the box, spanning the full card height.

Content fields: `{ title, body }`. Both are required strings.

#### Scenario: Title and body provided
- **WHEN** `challengeCard` is called with `{ title: 'Legacy Core System', body: 'Policy admin system is 15 years old...' }`
- **THEN** the slide contains a card background, a left accent bar, a title text element, and a body text element

### Requirement: challengeCard reuses card theme tokens
The system SHALL draw the card background using `theme.shape.card.bgColor` and `theme.shape.card.borderColor`, the accent bar using `theme.shape.card.accentColor`, the title using `theme.shape.card.titleColor`, and the body using `theme.shape.card.bodyColor`. Opts may override `accentColor` and `bodyColor`.

#### Scenario: Default colors match card theme
- **WHEN** `challengeCard` is called with no opts
- **THEN** accent bar color equals `theme.shape.card.accentColor`

#### Scenario: Custom accent color via opts
- **WHEN** `opts.accentColor` is provided
- **THEN** the left accent bar uses `opts.accentColor` instead of the theme default
