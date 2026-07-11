## MODIFIED Requirements

### Requirement: lib.frame — frame group
`COMPONENTS.md` SHALL document the `frame` group as repeated slide chrome:

- `border(slide, undefined, opts, name)` — thin outer border around the slide
- `slideHeader(slide, undefined, opts, name)` — top header bar; wordmark (`theme.header.wordmark`) + badge (`theme.header.badge`)
- `slideFooter(slide, undefined, opts, name)` — bottom footer bar; left and right text from `theme.footer`

It SHALL note that all three functions are called with `undefined` as the `box` argument — they self-position using `theme.grid` and `theme.header`/`theme.footer` rather than taking explicit coordinates.

It SHALL also note that `frame.*` is a manual, per-slide alternative to defining a slide master (documented in `INSTRUCTIONS.md`): a slide that calls `frame.border`/`frame.slideHeader`/`frame.slideFooter` directly draws its own one-off chrome instead of inheriting it from a `masterName`, which is useful for chrome variations that don't warrant a dedicated master.

#### Scenario: AI adds frame chrome to every slide when using components
- **WHEN** an AI has been given `COMPONENTS.md` and is building a deck that should have a consistent header/footer/border
- **THEN** it calls `frame.border(slide, undefined, opts, name)`, `frame.slideHeader(slide, undefined, opts, name)`, and `frame.slideFooter(slide, undefined, opts, name)` on each applicable slide, passing `undefined` for `box`

#### Scenario: AI knows frame is a manual alternative to a master
- **WHEN** an AI has been given `COMPONENTS.md` and a specific slide needs one-off chrome that no defined master provides
- **THEN** it calls `frame.*` directly on that slide instead of (or in addition to) using `masterName`
