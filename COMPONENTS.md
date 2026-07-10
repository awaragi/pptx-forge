---
title: COMPONENTS.md — Pre-built Component Catalog
requires: INSTRUCTIONS.md (read first — grid, theme, run, and prim concepts defined there are assumed here)
---

# COMPONENTS.md — Pre-built Component Catalog

> The library also includes a pre-built `comp`/`layout`/`frame` catalog — standard cards, KPI tiles, flow diagrams, section headings, and repeated slide chrome (border/header/footer). Reach for it whenever a standard treatment fits the slide's concept, instead of assembling the same shapes from primitives by hand.

`comp`, `layout`, and `frame` are pre-composed, opinionated building blocks layered on top of the `prim` primitives and `theme` object. Use them first when a card, KPI tile, flow diagram, section heading, or repeated slide chrome fits the concept; drop to `prim` only when nothing here fits. Destructure them alongside `theme`, `run`, and `prim`:

```js
const { theme, run, prim, comp, layout, frame } = lib;
```

---

## `comp` — Components

Pre-built composite components — each renders multiple primitives with consistent internal layout. Use these instead of assembling cards and phase diagrams manually.

### Cards

| Function | `content` shape | Notes |
|----------|----------------|-------|
| `infoCard` | `{ title, body }` | Standard card with title + body text |
| `overlayCard` | `{ title, body }` | Semi-transparent glassmorphic variant for dark backgrounds |
| `accentCard` | `{ title, body }` | Card with a thin top accent bar |
| `challengeCard` | `{ title, body }` | Card with a left accent bar — use for challenges or risks |
| `fileCard` | `{ filename, purpose, step }` | Shows a named file/artifact with purpose + next step |
| `numberedStep` | `{ num, title, body }` | Circle number badge + title + body |
| `stepBox` | `{ label, steps: string[] }` | Phase/step container; steps joined with ` · ` |
| `imageCard` | `{ image?, title, body?, imageH? }` | Card with an image placeholder band at top; swap emoji for real image in PowerPoint |
| `iconBox` | `{ icon?, title, body? }` | Centered large icon + title + optional body |
| `teamCard` | `{ name, role, bio? }` | Circular avatar placeholder (shows initial letter) + name + role + optional bio |

### KPI & Stats

| Function | `content` shape | Notes |
|----------|----------------|-------|
| `iconStat` | `{ value, label, icon? }` | Large KPI value + label; optional UTF-8 icon above value. `opts.fontSize` overrides value size |
| `darkStat` | `{ value, label, source? }` | Dark-background KPI tile — use on light slides for contrast. `source` renders a small citation line at the bottom |

### Flow & Process

| Function | `content` shape | Notes |
|----------|----------------|-------|
| `flowBox` | `{ label, highlight?: boolean }` | Flow diagram box; `highlight: true` applies accent fill |
| `flowArrow` | (unused) | Arrow connector between flow boxes; `opts.vertical: true` for ↓, default is → |
| `stepFlow` | `items: { label, highlight? }[]` | Auto-distributes `flowBox` + `flowArrow` items across `box.w` |
| `phaseLabel` | `label: string` (3rd arg, not object) | Accent badge + horizontal rule — use as a section divider |

### Insight & Callout

| Function | `content` shape | Notes |
|----------|----------------|-------|
| `calloutQuote` | `{ label?, quote }` | Left accent bar + optional small-caps label + quote/insight text |

### Lists & Tables

| Function | `content` shape | Notes |
|----------|----------------|-------|
| `bulletIconList` | `items: { icon, text }[]` | Icon-prefixed bullet lines; icons in `opts.iconColor`, text in `opts.textColor` |
| `twoColumnRow` | `{ label, content }` | Left bold label / right content — stack calls to build key-value tables. `opts.splitRatio` (default `0.35`) controls column widths |

### Indicators & Placeholders

| Function | `content` shape | Notes |
|----------|----------------|-------|
| `progressBar` | `{ value, label?, showPct? }` | Horizontal fill bar; `value` is `0–1`. `showPct: true` renders a percentage label next to the fill |
| `tagBadge` | `{ label }` | Small filled rounded-rect pill with centered label |
| `imageHolder` | `{ icon?, label? }` | Dashed-border placeholder box with an emoji icon; user swaps for a real image in PowerPoint |

---

## `layout` — Layout

Slide-level structural elements. Use for section headings, panel headers, dividers, and banners.

| Function | Key notes |
|----------|-----------|
| `sectionTitle(slide, box\|null, text, opts, name)` | Bold h2 heading. When `box` fields are omitted or `-1`, defaults to `x: marginX, y: contentTop, w: contentW`. |
| `darkPanelHeader(slide, box, { title, subtitle? }, opts, name)` | Dark bar. `opts`: `bgColor`, `titleColor`, `subtitleColor`, `titleW`. `box.h` defaults to `0.44`. |
| `labeledDivider(slide, box, label, opts, name)` | Vertical line from `box.y` to `box.y + box.h` at `box.x`, with a centered label badge at midpoint. |
| `calloutBanner(slide, box, text, opts, name)` | Full-width dark banner with thin left accent strip + centered bold italic text. |
| `pullQuote(slide, box, text, opts, name)` | Large italic quotation-style text block. |

All `layout` functions accept `text` as a plain string or `{ text: string }` object.

---

## `frame` — Frame Chrome

Repeated chrome that goes on **applicable slides**. Always pass `undefined` as `box` — these functions self-position using `theme.grid` and `theme.header`/`theme.footer`.

| Function | What it renders |
|----------|----------------|
| `border(slide, undefined, opts, name)` | Thin outer border around the slide |
| `slideHeader(slide, undefined, opts, name)` | Top header bar — wordmark (`theme.header.wordmark`) + badge (`theme.header.badge`) |
| `slideFooter(slide, undefined, opts, name)` | Bottom footer bar — left and right text from `theme.footer` |

If required, call at the top of the deck/slide function.

---

## `theme.shape` — component-specific namespaces

The two global `theme.shape` keys (`radius`, `borderW`), consumed directly by `prim`, are documented above. Every other `theme.shape` namespace styles a specific `comp`/`layout`/`frame` function and is documented here:

| Namespace | Properties |
|-----------|------------|
| `card` | `bgColor`, `borderColor`, `accentColor`, `titleColor`, `bodyColor`, `shadow` — shared by `infoCard`, `accentCard`, `stepBox`, `numberedStep`, `challengeCard` |
| `fileCard` | `bgColor`, `borderColor`, `filenameColor`, `purposeColor`, `stepColor` |
| `overlayCard` | `titleColor`, `bodyColor` |
| `phaseLabel` | `badgeColor`, `badgeTextColor`, `lineColor` |
| `flowBox` | `bgColor`, `borderColor`, `textColor`, `highlightBgColor`, `highlightTextColor` |
| `flowArrow` | `color` |
| `divider` | `color`, `badgeTextColor`, `lineWidth`, `badgeW`, `badgeH`, `gap` |
| `calloutBanner` | `bgColor`, `accentColor`, `textColor`, `accentW` — also used by `calloutQuote` |
| `darkPanelHeader` | `bgColor`, `titleColor`, `subtitleColor` |
| `pullQuote` | `color` |
| `sectionTitle` | `color` |
| `frame` | `badgeRadius`, `borderColor`, `badgeColor`, `badgeTextColor`, `wordmarkColor`, `footerLineColor`, `footerTextColor` |
| `iconStat` | `valueColor`, `labelColor` |
| `iconBox` | `bgColor`, `borderColor`, `iconColor`, `titleColor`, `bodyColor` |
| `imageCard` | `imageColor`, `bgColor`, `borderColor`, `titleColor`, `bodyColor`, `shadow` |
| `progressBar` | `fillColor`, `trackColor`, `labelColor`, `pctColor` |
| `tagBadge` | `bgColor`, `textColor` |
| `dataTable` | `headerBgColor`, `headerTextColor`, `rowBgColor`, `altBgColor`, `borderColor`, `textColor` |
| `darkStat` | `bgColor`, `valueColor`, `labelColor`, `sourceColor` |
| `teamCard` | `avatarBgColor`, `avatarTextColor` |
| `comparisonTable` | `headerBgColor`, `headerTextColor`, `criteriaColor`, `valueColor`, `borderColor` |

**Partial overrides** — `theme.js` must export a **single default object**. Include only the keys you want to change; all other properties keep their library defaults. Deep merging applies at every level, so you can override a single shadow property without touching the rest:

```js
// theme.js — export default; include only what you need to override
export default {
  shape: {
    card: { borderColor: 'accent4', shadow: { opacity: 0.05 } },
    frame: { wordmarkColor: 'accent1' },
  },
};
```

---

## Worked Example

```js
// workspaces/my-deck/slides/01-example.js
export default function Example(pptx, lib) {
  const { theme, run, prim, comp, layout, frame } = lib;
  const { text, roundRect } = prim;
  const { infoCard } = comp;
  const { sectionTitle, pullQuote } = layout;
  const { border, slideHeader, slideFooter } = frame;

  const slide = pptx.addSlide();
  slide.background = { color: theme.color.surface };

  border(slide, undefined, {}, 's01-border');
  slideHeader(slide, undefined, {}, 's01');
  slideFooter(slide, undefined, {}, 's01');

  sectionTitle(slide, null, 'Example Section', {}, 's01-section');

  text(slide, { x: theme.grid.marginX, y: 1.4, w: theme.grid.colLeftW, h: 0.5 }, [
    run('Bold intro.  ', { bold: true, color: theme.color.ink }),
    run('Regular follow-on text.', { color: theme.color.bodyText }),
  ], { fontSize: theme.size.bodyLg }, 's01-intro');

  roundRect(slide,
    { x: theme.grid.marginX, y: 2.1, w: theme.grid.colLeftW, h: 2.2 },
    undefined,
    { fill: { color: theme.color.surfaceAlt }, line: { color: 'accent6' } },
    's01-card-bg'
  );

  infoCard(slide,
    { x: theme.grid.marginX + 0.2, y: 2.3, w: theme.grid.colLeftW - 0.4, h: 1.0 },
    { title: 'Card Title', body: 'Supporting detail text goes here.' },
    {},
    's01-card'
  );

  pullQuote(slide,
    { x: theme.grid.colRight, y: 1.4, w: theme.grid.colRightW, h: 1.2 },
    '"A well-structured slide communicates at a glance."',
    {},
    's01-pullquote'
  );
}
```
