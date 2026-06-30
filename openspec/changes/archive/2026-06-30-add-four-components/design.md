## Context

`src/components.js` exports `makeComponents(theme, prim)` which returns a flat object of component functions. Each function has the signature `(slide, box, content, opts, name)` and composes primitives from `prim`. Shape tokens live in `theme.shape.<componentName>` in `src/theme.js`; per-call overrides flow through `opts`.

The four new components are purely additive — no existing function changes.

## Goals / Non-Goals

**Goals:**
- Add `calloutQuote`, `darkStat`, `challengeCard`, `teamCard` to `makeComponents`
- Add `darkStat` and `teamCard` shape token stanzas to `theme.shape` in `theme.js`
- Keep content objects simple: 2–3 scalar fields each, no arrays

**Non-Goals:**
- Modifying any existing component or theme token
- Adding showcase slides (optional, out of scope for this change)
- Responsive or animation behaviour

## Decisions

**`calloutQuote` — left-bar accent using `fillRect` + two text calls**
The existing `calloutBanner` in `layout.js` is a full dark-bg band. `calloutQuote` is a light-bg card-style box with a narrow left accent bar, matching `theme.shape.calloutBanner.accentColor` and `accentW`. No new theme stanza needed — reuses `calloutBanner` tokens.

**`darkStat` — reuses `tx1` as dark bg, `accent1` as value color**
Rather than inventing new color names, `darkStat.bgColor` defaults to `'tx1'` (the darkest semantic slot) and `darkStat.valueColor` to `'accent1'`. Source line uses `'bg2'` at small size. A new `theme.shape.darkStat` stanza is added so workspaces can override.

**`challengeCard` — left 4px bar via narrow `fillRect`, otherwise same as `infoCard`**
Implemented with a `roundRect` background + a narrow `fillRect` accent strip on the left edge, matching `theme.shape.card.accentColor`. No new theme stanza; shares `card` tokens.

**`teamCard` — circle via existing `circle` primitive, avatar placeholder as emoji/initial text**
`prim.circle` already exists. Avatar area is a filled circle; name, role, and optional bio are three stacked `text` calls. New `theme.shape.teamCard` stanza provides `avatarBgColor` and `avatarTextColor`.

## Risks / Trade-offs

- [`darkStat` bg on light-theme workspaces] → The dark bg (`tx1`) may not contrast well if a workspace redefines `tx1` to a light color. Mitigation: workspaces override `theme.shape.darkStat.bgColor` in their theme file.
- [`challengeCard` left bar clip] → The left `fillRect` accent is drawn after the background, so rounded corners on the card bg will expose a slight gap at the left edge corners. Mitigation: use `rectRadius: 0` on the accent strip (matches existing `accentCard` approach for the top bar).
