# INSTRUCTIONS.md — AI Slide Authoring Reference

> Read this file alongside `lib.d.ts(.txt)` to generate correct, compilable slide files.

---

## Overview

JavaScript slide files compile into PowerPoint decks via [pptxgenjs](https://gitbrent.github.io/PptxGenJS/). Project library wraps pptxgenjs in a design-system API.

**You only need two files:** `INSTRUCTIONS.md` (this file) and `lib.d.ts(.txt)` (authoritative typed signatures). If lib.d.ts is missing, prompt the user for it.

**Creative freedom:** Built-in `lib` components are a starting point, not a constraint. If a concept calls for a layout or visual treatment the library doesn't cover, implement it — write custom helpers in the slide file, compose `prim` calls freely, or drop to raw pptxgenjs. The goal is the best slide for the concept, not maximum use of the component library.

---

## Workspace Structure

```
workspaces/<slug>/
├── theme.js       # optional — color scheme + header/footer text
└── slides/        # all .js files here, sorted alphabetically → slide order
```

Build: `npm run forge <slug> [-- --open]`

### Before generating slides — ask the user

> **One file per slide, or a single deck file?**
> - **One file per slide** (e.g. `01-title.js`, `02-problem.js`) — easier to navigate and reorder
> - **Single deck file** (e.g. `deck.js`) — simpler for short decks

Default to **one file per slide** for decks with more than 3 slides.

### Deck/Slide file contract

Every deck/slide file exports a default function `(pptx, lib)`. 

```js
export default function Slide_Or_Deck(pptx, lib) { // or Deck(pptx, lib) for a single-file deck
  const slide = pptx.addSlide();
  slide.background = { color: theme.scheme.dk1 }; // optional
  // render content via lib...
}
```


---

## Coordinate System & Grid

All coordinates and dimensions are in **inches**. Origin is the **top-left** of the slide.

**Canvas size:** `13.333 × 7.5` inches (widescreen 16:9)

### Default grid constants (`theme.grid`)

| Constant       | Value  | Meaning                                  |
|---------------|--------|------------------------------------------|
| `slideW`      | 13.333 | Full slide width                         |
| `slideH`      | 7.5    | Full slide height                        |
| `marginX`     | 0.73   | Left content margin                      |
| `contentW`    | 11.87  | Usable content width                     |
| `colRight`    | 7.18   | Left edge of right column (two-col layout) |
| `colLeftW`    | 5.85   | Width of left column                     |
| `colRightW`   | 5.42   | Width of right column                    |
| `contentTop`  | 0.88   | Top of content area (below header)       |
| `contentBottom`| 6.86  | Bottom of content area (above footer)    |
| `footerY`     | 7.18   | Top of footer bar                        |

Always use `theme.grid.*` constants rather than hardcoding these numbers.

### The `box` parameter

All lib functions take `{ x, y, w, h }` (Box object in inches) as their second argument. Omit or pass `-1` for geometry fields unused by a given function (noted in `lib.d.ts`).

---

## Theme Object

`theme` is a plain data object.

```js
theme.scheme   // 10 PowerPoint scheme slot hex values
theme.color    // workspace semantic color aliases
theme.size     // named font sizes
theme.font     // font face names
theme.grid     // layout constants (see table above)
theme.header   // { wordmark, badge } — used by frame.slideHeader
theme.footer   // { left, right }    — used by frame.slideFooter
```

### `theme.scheme` — PowerPoint scheme slots

Ten slots: `dk1`, `lt1`, `dk2`, `lt2`, `accent1`–`accent6`. Use as string shorthands in color fields — pptxgenjs resolves them at render time.

PowerPoint also exposes four **role aliases** — `tx1`, `bg1`, `tx2`, `bg2` — that are not separate colors but fixed redirects onto the ten slots above: `tx1`→`dk1`, `bg1`→`lt1`, `tx2`→`dk2`, `bg2`→`lt2`. You never set `tx1`/`bg1`/`tx2`/`bg2` directly (they aren't keys in `theme.scheme`); you set `dk1`/`lt1`/`dk2`/`lt2` and use the role aliases anywhere a color is expected, including as values in `theme.color` (see below), when you want to say "the text color" or "the background color" rather than naming the underlying slot.

### `theme.color` — semantic workspace aliases

Workspaces define their own color names in `theme.js`. Always reference colors by semantic name:
```js
theme.color.primary      // e.g. 'accent1'
theme.color.danger       // e.g. 'accent2'
theme.color.warning      // e.g. 'accent3'
theme.color.link         // e.g. 'accent4'
theme.color.ink          // e.g. 'tx1'
theme.color.surface      // e.g. 'bg1'
theme.color.bodyText     // e.g. 'tx2'
theme.color.surfaceAlt   // e.g. 'bg2'
```
Values are either hex strings (`'EEF7DF'`) or scheme-slot shorthands (`'accent1'`). Both work in pptxgenjs `color` fields.

**Color preference order:**
1. **`theme.scheme` slots first** (`'accent1'`, `'tx1'`, `'bg1'`, etc.) — these are the PowerPoint theme palette and should be the default choice for most fills, text, and borders.
2. **`theme.color.<name>` aliases** — semantic names defined in the workspace `theme.js`. Prefer these when you need a color that already has a semantic meaning in the workspace.
3. **Add a new alias to `theme.color`** — if a slide genuinely needs a color not already named, add a new semantic entry in `theme.js` (e.g. `highlight: 'accent3'`) and reference it by name in the slide file.
4. **Avoid inline hex values** — do not hardcode hex strings directly in slide files (e.g. `color: 'FF0000'`). The rare exception is a one-off decorative value with no semantic meaning, but this should be uncommon.

### `theme.size` — named font sizes

```js
theme.size.h1       // 28    theme.size.h2       // 22
theme.size.h3       // 15    theme.size.h4       // 13
theme.size.h5       // 12    theme.size.h6       // 11
theme.size.bodyLg   // 11.5  theme.size.body     // 10
theme.size.small    // 9.5   theme.size.xsmall   // 8.6
theme.size.cardTitle // 10.3 theme.size.cardBody  // 8.6
theme.size.pullQuote // 13.5
```

`theme.font.body` (`'Arial'`) and `theme.font.mono` (`'Courier New'`) — reference instead of hardcoding font names.

### `theme.shape` — component visual defaults

`theme.shape` holds per-component geometry and color defaults.

**Resolution order for any visual property:**
```
opts.<prop>  →  theme.shape.<namespace>.<prop>  →  (library default)
```

Global keys (apply across all components):

| Key | Default | Notes |
|-----|---------|-------|
| `radius` | `0.08` | Rounded rectangle corner radius |
| `borderW` | `0.8` | Default border/line stroke width |

Component namespaces and their properties:

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

## `run` — rich-text runs

Use `run` to build mixed-style text — pass an array of runs to `prim.text`.

```js
run('text', { fontSize: 14, color: theme.color.ink })     // plain
run.bold('text') / run.italic('text') / run.color('text', color)  // shorthands

prim.text(slide, box, [
  run('Heading\n', { bold: true, color: theme.color.ink }),
  run('Body text', { color: theme.color.bodyText }),
], { fontSize: 14 }, 's01-title');
```

---

## `prim` — Primitives

Raw drawing layer. Use for text frames, basic shapes, and lines.

| Function | Key notes |
|----------|-----------|
| `text(slide, box, text\|run[], opts, name)` | `text` is a string OR an array of `run(...)` objects for mixed styles. Common opts: `fontSize`, `bold`, `italic`, `color`, `align`, `valign`, `fit`. |
| `roundRect(slide, box, content, opts, name)` | `opts.fill: { color }`, `opts.line: { color, width }`, `opts.shadow` for drop shadow. |
| `fillRect(slide, box, content, opts, name)` | Sharp corners. Same opts as `roundRect`. |
| `circle(slide, box, content, opts, name)` | `box.w` = diameter. `box.h` is **ignored**. |
| `hLine(slide, box, content, opts, name)` | Horizontal line. `box.h` is **ignored**. Use `opts.color` and `opts.lineWidth`. |
| `vLine(slide, box, content, opts, name)` | Vertical line. `box.w` is **ignored**. Use `opts.color` and `opts.lineWidth`. |
| `bullets(slide, box, items[], opts, name)` | `items` is a `string[]`. Same text opts as `text`. |

**Use `prim` when:** you need a plain text frame, a geometric shape, a line, or a bullet list.

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

## Custom Components & Full Creative Flexibility

**You are not limited to the built-in component library.** The available `comp`, `layout`, and `frame` functions are a library of useful defaults — not a ceiling on what you can produce.

When the visual concept calls for something the library doesn't cover:

1. **Write a custom helper function** — a plain function `(slide, box, content, opts)` that makes `prim` calls; no registration needed.

2. **Compose `prim` calls freely.** Any layout, grid, repeated element, or visual treatment that fits the concept — build it from primitives.

3. **Drop to raw pptxgenjs** when neither `lib` nor `prim` covers the need (`slide.addText()`, `slide.addShape()`, `slide.addImage()`, `slide.addChart()`, etc.). Use the [pptxgenjs docs](https://gitbrent.github.io/PptxGenJS/) as reference.

**Decision rule:** reach for a built-in component when it genuinely fits the concept. When it doesn't, build what fits. Never force a concept into an ill-fitting component just because it exists.

If you create something reusable and well-tested, sharing it back with the forge is highly appreciated.

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


Repeated chrome that goes on **applicable slide**. Always pass `undefined` as `box` — these functions self-position using `theme.grid` and `theme.header`/`theme.footer`.
| Function | What it renders |
|----------|----------------|
| `border(slide, undefined, opts, name)` | Thin outer border around the slide |
| `slideHeader(slide, undefined, opts, name)` | Top header bar — wordmark (`theme.header.wordmark`) + badge (`theme.header.badge`) |
| `slideFooter(slide, undefined, opts, name)` | Bottom footer bar — left and right text from `theme.footer` |

If required, call at the top of deck/slide function:

---

## Object Naming

Every `lib` call takes an optional trailing `name` string. This becomes the PowerPoint object name — use it consistently.

**Format:** `'sNN-<role>'`
- `NN` = zero-padded slide number matching the file name
- `<role>` = short kebab-case description of what the element is

```js
's01-border'
's01-title'
's01-purpose-bg'
's01-purpose-label'
's03-flow-arrow-1'
's03-flow-arrow-2'
```

Names must be **unique within a slide**.

---

## Worked Example

```js
// workspaces/my-deck/slides/01-example.js
export default function Example(pptx, lib) {
  const { theme, run, prim, comp, layout, frame } = lib;
  const { text, roundRect } = prim;
  const { infoCard } = comp;
  const { sectionTitle } = layout;
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
    { fill: { color: theme.color.surfaceAlt }, line: { color: theme.color.border } },
    's01-card-bg'
  );

  infoCard(slide,
    { x: theme.grid.marginX + 0.2, y: 2.3, w: theme.grid.colLeftW - 0.4, h: 1.0 },
    { title: 'Card Title', body: 'Supporting detail text goes here.' },
    {},
    's01-card'
  );

  layout.pullQuote(slide,
    { x: theme.grid.colRight, y: 1.4, w: theme.grid.colRightW, h: 1.2 },
    '"A well-structured slide communicates at a glance."',
    {},
    's01-pullquote'
  );
}
```
