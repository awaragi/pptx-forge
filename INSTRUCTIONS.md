---
title: INSTRUCTIONS.md — AI Slide Authoring Reference
companion: COMPONENTS.md (optional — pre-built comp/layout/frame catalog; include only when the author wants standard components and/or slide chrome)
---

# INSTRUCTIONS.md — AI Slide Authoring Reference

> Read this file alongside `lib.d.ts(.txt)` to generate correct, compilable slide files.

---

## Overview

JavaScript slide files compile into PowerPoint decks via [pptxgenjs](https://gitbrent.github.io/PptxGenJS/). Project library wraps pptxgenjs in a design-system API.

**You only need two files:** `INSTRUCTIONS.md` (this file) and `lib.d.ts(.txt)` (authoritative typed signatures). If lib.d.ts is missing, prompt the user for it.

---

## Workspace Structure

```
workspaces/<slug>/
├── theme.js       # required — color scheme + header/footer text
└── slides/        # all .js files here, sorted alphabetically → slide order
```

Build: `npm run forge <slug> [-- --open]`

### Before generating slides — ask the user

> **One file per slide, or a single deck file?**
> - **One file per slide** (e.g. `01-title.js`, `02-problem.js`) — easier to navigate and reorder
> - **Single deck file** (e.g. `deck.js`) — simpler for short decks

Default to **one file per slide** for decks with more than 3 slides.

### Deck/Slide file contract

Every deck/slide file exports a default function `(pptx, lib)`. At the top of the function, destructure only what you use:

```js
export default function Slide_Or_Deck(pptx, lib) { // or Deck(pptx, lib) for a single-file deck
  const { theme, run, prim } = lib;
  const slide = pptx.addSlide();
  slide.background = { color: theme.scheme.dk1 }; // optional
  // render content via prim...
}
```

`theme`, `run`, and `prim` cover everything needed for a components-free deck. `lib` exposes other properties too (see `lib.d.ts`); don't destructure or guess at their shapes without documentation for them — ask for it rather than guessing.


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

PowerPoint also exposes four **role aliases** — `tx1`, `bg1`, `tx2`, `bg2` — that are not separate colors but fixed redirects onto the ten slots above: `tx1`→`dk1`, `bg1`→`lt1`, `tx2`→`dk2`, `bg2`→`lt2`. You set `dk1`/`lt1`/`dk2`/`lt2` in `theme.scheme`; anywhere a color is expected — including `theme.color` and `theme.shape` — you may write either the slot name (`dk1`/`lt1`/`dk2`/`lt2`) or the role alias (`tx1`/`bg1`/`tx2`/`bg2`); `createLib` normalizes slot names to their role alias automatically before handing colors to pptxgenjs, since pptxgenjs's own color enum only recognizes the role-alias form.

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
Values are either hex strings (`'EEF7DF'`) or scheme-slot shorthands (`'accent1'`, `'dk1'`/`'lt1'`/`'dk2'`/`'lt2'`, or their `tx1`/`bg1`/`tx2`/`bg2` role-alias equivalents). All forms work — `createLib` resolves slot names to role aliases before they reach pptxgenjs.

`theme.js` is the single source of truth for every color used in a deck. Slide/deck files MUST NOT define their own colors — not as inline hex literals, not as local constants, not as any other kind of color map or palette. Every color a slide file references must resolve back to `theme.scheme` or `theme.color`.

**Color preference order:**
1. **`theme.scheme` slots first** (`'accent1'`, `'tx1'`, `'bg1'`, etc.) — these are the PowerPoint theme palette and should be the default choice for most fills, text, and borders.
2. **`theme.color.<name>` aliases** — semantic names defined in the workspace `theme.js`. Prefer these when you need a color that already has a semantic meaning in the workspace.
3. **Add a new alias to `theme.color`** — if a slide genuinely needs a color not already named, add a new semantic entry in `theme.js` (e.g. `highlight: 'accent3'`) and reference it by name in the slide file. Never define it locally in the slide file instead.

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
| `radius` | `0.08` | Rounded rectangle corner radius, consumed by `prim.roundRect` |
| `borderW` | `0.8` | Default border/line stroke width, consumed by `prim.roundRect`/`prim.hLine`/`prim.vLine` |

These two are the only `theme.shape` keys documented here. Other namespaces may exist beyond these two — same rule as above: don't guess, ask for documentation.

**Partial overrides** — `theme.js` must export a **single default object**. Include only the keys you want to change; all other properties keep their library defaults. Deep merging applies at every level:

```js
// theme.js — export default; include only what you need to override
export default {
  shape: {
    borderW: 1.2,
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

## Custom Components & Full Creative Flexibility

**You are not limited to the built-in component library.** The available `comp`, `layout`, and `frame` functions are a library of useful functions — not a ceiling on what you can produce.

When the visual concept calls for something the library doesn't cover:

1. **Write a custom helper function** — a plain function `(slide, box, content, opts)` that makes `prim` calls; no registration needed.

2. **Compose `prim` calls freely.** Any layout, grid, repeated element, or visual treatment that fits the concept — build it from primitives.

3. **Drop to raw pptxgenjs** when neither `lib` nor `prim` covers the need (`slide.addText()`, `slide.addShape()`, `slide.addImage()`, `slide.addChart()`, etc.). Use the [pptxgenjs docs](https://gitbrent.github.io/PptxGenJS/) as reference.

**Decision rule:** reach for a built-in component when it genuinely fits the concept. When it doesn't, build what fits. Never force a concept into an ill-fitting component just because it exists.

If you create something reusable and well-tested, sharing it back with the forge is highly appreciated.

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
  const { theme, run, prim } = lib;
  const { text, roundRect, bullets } = prim;

  const slide = pptx.addSlide();
  slide.background = { color: theme.color.surface };

  text(slide, { x: theme.grid.marginX, y: 0.6, w: theme.grid.contentW, h: 0.6 }, [
    run('Example Section', { bold: true, fontSize: theme.size.h2, color: theme.color.ink }),
  ], {}, 's01-section');

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

  text(slide, { x: theme.grid.marginX + 0.2, y: 2.3, w: theme.grid.colLeftW - 0.4, h: 0.4 },
    'Card Title', { bold: true, fontSize: theme.size.cardTitle, color: theme.color.ink }, 's01-card-title');

  bullets(slide,
    { x: theme.grid.marginX + 0.2, y: 2.7, w: theme.grid.colLeftW - 0.4, h: 1.4 },
    ['Supporting detail one.', 'Supporting detail two.'],
    { color: theme.color.bodyText },
    's01-card-body'
  );

  text(slide, { x: theme.grid.colRight, y: 1.4, w: theme.grid.colRightW, h: 1.2 },
    '"A well-structured slide communicates at a glance."',
    { italic: true, fontSize: theme.size.pullQuote, color: theme.color.ink }, 's01-pullquote');
}
```
