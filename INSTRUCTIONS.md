# INSTRUCTIONS.md — AI Slide Authoring Reference

> Read this file alongside `lib.d.ts` to generate correct, compilable slide files.
> `lib.d.ts` is the authoritative type source for every function signature.
> This file explains the system, conventions, and patterns that types alone cannot.

---

## Overview

This project compiles JavaScript slide files into PowerPoint decks using [pptxgenjs](https://gitbrent.github.io/PptxGenJS/). The authoring layer (`lib.js`) wraps pptxgenjs in a design-system API — slide files do not need to call pptxgenjs directly.

**As an AI, you only need these two files to generate slides:**
1. `INSTRUCTIONS.md` (this file) — system conventions, patterns, examples
2. `lib.d.ts` — full typed signatures for every `lib` function

See [pptxgenjs Boundary](#pptxgenjs-boundary) for what slide files interact with directly vs. through `lib`.

---

## Project Layout

```
pptx-forge/
├── src/
│   └── lib.js          # Design-system library — createLib(themeOverrides)
├── bin/
│   ├── forge.js        # Orchestrator — discovers slide files, runs them, writes .pptx
│   ├── backup.js       # Backup — zips workspace slides into a timestamped archive
│   └── create.js       # Scaffold — prompts for a name and creates a new workspace
├── lib.d.ts            # TypeScript declarations — authoritative signatures
├── INSTRUCTIONS.md     # This file
└── workspaces/
    └── <slug>/
        ├── theme.js    # Optional — workspace color scheme + header/footer text
        ├── slides/     # All slide files live here (any .js filename, sorted alphabetically)
        │   ├── 01-overview.js
        │   └── 02-problem.js
        └── out/        # Generated — created by forge.js
            └── <slug>.pptx
```

---

## Forge Pipeline

### Running a workspace
```bash
npm run forge <workspace-slug>
# e.g.
npm run forge my-deck
# aliases: npm run build my-deck, npm run generate my-deck
```

### How forge.js discovers slides
- Scans `workspaces/<slug>/slides/` for all `.js` files — no naming format required
- Sorts alphabetically — filename order equals presentation order
- Imports each file and calls its default export with `(pptx, lib)`

### Slide file naming
No filename format is enforced. Files are loaded in alphabetic sort order, so use any naming scheme that sorts correctly for the desired slide order. A common convention is zero-padded numbers:
```
01-overview.js
02-problem.js
03-approach.js
```
The `slides/` directory is the only place forge.js looks. `theme.js` stays at the workspace root and is never treated as a slide file.

### Slide file module contract
Every slide file must:
1. Export a **default function** with signature `(pptx, lib)`
2. Call `pptx.addSlide()` for each slide it creates
3. Render all content using `lib`

Typically each file contains one slide. Multiple slides per file are allowed — call `pptx.addSlide()` multiple times, once per slide.

```js
// slide01-overview.js  — typical: one slide per file
export default function Slide01_Overview(pptx, lib) {
  const slide = pptx.addSlide();
  // ... render content to slide using lib
}
```

Function naming convention: `SlideNN_TopicName` (PascalCase topic, matching the file number).

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

All lib functions take a `box` as their second argument:
```js
{ x: number, y: number, w: number, h: number }  // all in inches
```

When a geometry field is not used by a function (documented in `lib.d.ts`), pass `-1` or omit it:
```js
hLine(slide, { x: 0.73, y: 2.0, w: 11.87 }, ...)       // h unused — omit it
circle(slide, { x: 1.0, y: 1.0, w: 0.5 }, ...)          // h unused — omit it
vLine(slide, { x: 6.67, y: 1.0, h: 5.0 }, ...)          // w unused — omit it
```

---

## Theme Object

`theme` is the merged theme object returned by `createLib(themeOverrides)`. It is **not** a function group — it is a plain data object.

### Shape

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

```js
theme.scheme = {
  dk1: '111827',  lt1: 'FFFFFF',   // Dark 1 / Light 1
  dk2: '374151',  lt2: 'F9FAFB',   // Dark 2 / Light 2
  accent1: '86BC25', accent2: 'EF4444',
  accent3: 'F59E0B', accent4: '5B9BD5',
  accent5: '70AD47', accent6: 'A5A5A5',
}
```

Lib component defaults use scheme-slot string shorthands (`'accent1'`, `'tx1'`, `'bg1'`, etc.) — pptxgenjs resolves these to the actual hex at render time.

### `theme.color` — semantic workspace aliases

Workspaces define their own color names in `theme.js`. Always reference colors by semantic name:
```js
theme.color.primary      // e.g. 'accent1'
theme.color.ink          // e.g. 'tx1'
theme.color.surface      // e.g. 'bg1'
theme.color.bodyText     // e.g. 'tx2'
theme.color.surfaceAlt   // e.g. 'bg2'
```
Values are either hex strings (`'EEF7DF'`) or scheme-slot shorthands (`'accent1'`). Both work in pptxgenjs `color` fields.

**Never hardcode hex values** — always use `theme.color.<name>`.

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

### `theme.font`

```js
theme.font.body   // 'Arial'        — main text
theme.font.mono   // 'Courier New'  — code/mono text
```

## `run` — rich-text runs

`run` is a top-level lib export (alongside `prim`, `comp`, etc.). Use it to create mixed-style text in a single text frame. Returns a pptxgenjs run object `{ text, options }`.

```js
const { run } = lib;   // or: const { theme, prim, comp, layout, frame, run } = lib;

// Plain run with explicit opts
run('Hello world', { fontSize: 14, color: theme.color.ink })

// Shorthand helpers
run.bold('Bold text')
run.italic('Italic text')
run.color('Colored text', theme.color.primary)

// Compose: pass an existing run to add/override opts
run(run.bold('text'), { color: theme.color.primary })  // bold + colored

// Pass an array of runs to prim.text for mixed styles
prim.text(slide, { x: 0.73, y: 1.0, w: 5.0, h: 0.5 }, [
  run('Heading\n', { bold: true, color: theme.color.ink }),
  run('Subtitle text', { color: theme.color.bodyText }),
], { fontSize: 14 }, 's01-title');
```

---

## lib Destructuring

`lib` exposes six top-level exports. Destructure at the top of each slide function:

```js
export default function Slide01_Overview(pptx, lib) {
  const { theme, run, prim, comp, layout, frame } = lib;

  // Further destructure groups as needed:
  const { text, roundRect, fillRect } = prim;
  const { smallCard, phaseBox, accentBlock } = comp;
  const { sectionTitle, darkPanelHeader } = layout;
  const { border, slideHeader, slideFooter } = frame;

  const slide = pptx.addSlide();
  // ...
}
```

`theme` is the plain data object (not a function group). Access it as `theme.color.primary`, `theme.grid.marginX`, etc. `run` is the rich-text helper — see the [`run` section](#run--rich-text-runs) above.

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

| Function | `content` shape | Notes |
|----------|----------------|-------|
| `smallCard` | `{ title, body }` | Standard card with title + body text |
| `miniCard` | `{ title, body }` | Semi-transparent background variant |
| `benefitCard` | `{ title, body }` | Left accent stripe variant |
| `artifactCard` | `{ filename, purpose, step }` | Shows a named artifact with purpose + next step |
| `numberedStep` | `{ num, title, body }` | Circle number badge + title + body |
| `phaseBox` | `{ label, steps: string[] }` | Phase container; steps joined with ` · ` |
| `flowBox` | `{ label, highlight?: boolean }` | Flow diagram box; `highlight: true` applies accent style |
| `flowArrow` | `content` (unused) | Arrow connector; `opts.vertical: true` for ↓, default is → |
| `accentBlock` | `{ bgColor, accent, border?, title?, titleColor? }` | Returns `AccentBlockRegion` — **capture the return value** |
| `phaseLabel` | `label: string` (3rd arg, not object) | Badge + horizontal rule |

### `accentBlock` return value

`accentBlock` returns an `AccentBlockRegion` object for positioning content inside the block:
```js
const region = comp.accentBlock(slide,
  { x: 0.73, y: 1.0, w: 5.85, h: 3.0 },
  { bgColor: theme.color.surfaceAlt, accent: theme.color.primary, title: 'Section' },
  {}, 's02-block'
);
// region = { ix, iw, contentY }
// ix      = inner content left edge (x after accent strip)
// iw      = inner content width
// contentY = y to start placing content inside the block
prim.text(slide, { x: region.ix, y: region.contentY, w: region.iw, h: 0.4 },
  'Content inside block', {}, 's02-block-text');
```

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

Repeated chrome that goes on **every slide**. Always pass `undefined` as `box` — these functions self-position using `theme.grid` and `theme.header`/`theme.footer`.

| Function | What it renders |
|----------|----------------|
| `border(slide, undefined, opts, name)` | Thin outer border around the slide |
| `slideHeader(slide, undefined, opts, name)` | Top header bar — wordmark (`theme.header.wordmark`) + badge (`theme.header.badge`) |
| `slideFooter(slide, undefined, opts, name)` | Bottom footer bar — left and right text from `theme.footer` |

Call all three at the beginning or end of every slide function:
```js
border(slide, undefined, {}, 's01-border');
slideHeader(slide, undefined, {}, 's01');
slideFooter(slide, undefined, {}, 's01');
```

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

## pptxgenjs Boundary

Slide files interact with pptxgenjs directly only for slide creation:
- `pptx.addSlide()` — call once per slide to get the slide object
- `slide.background` — optionally set the slide background color

Everything else goes through `lib` — there is no need to call `slide.addText()`, `slide.addShape()`, `slide.addImage()`, etc. directly. Using `lib` ensures consistent styling and correct positioning.

```js
// Prefer lib over raw pptxgenjs methods
prim.text(slide, { x: 1, y: 1, w: 4, h: 0.5 }, 'Hello', {}, 's01-hello');
// rather than: slide.addText('Hello', { x: 1, y: 1, w: 4, h: 0.5 });
```

`run()` produces pptxgenjs run objects — pass them as arrays to `prim.text()`. The run format does not need to be constructed manually.

---

## Worked Example

A complete, minimal, compilable slide file:

```js
// workspaces/my-deck/slides/01-example.js
export default function Example(pptx, lib) {
  // 1. Destructure lib
  const { theme, run, prim, comp, layout, frame } = lib;
  const { text, roundRect } = prim;
  const { smallCard } = comp;
  const { sectionTitle } = layout;
  const { border, slideHeader, slideFooter } = frame;

  // 2. Create the slide
  const slide = pptx.addSlide();
  slide.background = { color: theme.color.surface };

  // 3. Frame chrome — call on every slide
  border(slide, undefined, {}, 's01-border');
  slideHeader(slide, undefined, {}, 's01');
  slideFooter(slide, undefined, {}, 's01');

  // 4. Section heading (self-positions at contentTop when box is null)
  sectionTitle(slide, null, 'Example Section', {}, 's01-section');

  // 5. Mixed-style text using run
  text(slide, { x: theme.grid.marginX, y: 1.4, w: theme.grid.colLeftW, h: 0.5 }, [
    run('Bold intro.  ', { bold: true, color: theme.color.ink }),
    run('Regular follow-on text that explains the point.', { color: theme.color.bodyText }),
  ], { fontSize: theme.size.bodyLg }, 's01-intro');

  // 6. A simple rounded-rect background behind the card column
  roundRect(slide,
    { x: theme.grid.marginX, y: 2.1, w: theme.grid.colLeftW, h: 2.2 },
    undefined,
    { fill: { color: theme.color.surfaceAlt }, line: { color: theme.color.border } },
    's01-card-bg'
  );

  // 7. A component card
  smallCard(slide,
    { x: theme.grid.marginX + 0.2, y: 2.3, w: theme.grid.colLeftW - 0.4, h: 1.0 },
    { title: 'Card Title', body: 'Supporting detail text goes here.' },
    {},
    's01-card'
  );

  // 8. Right column — a pull quote using layout
  layout.pullQuote(slide,
    { x: theme.grid.colRight, y: 1.4, w: theme.grid.colRightW, h: 1.2 },
    '"A well-structured slide communicates at a glance."',
    {},
    's01-pullquote'
  );
}
```

**To test:** save the file in `workspaces/<slug>/slides/` and run `npm run forge <slug>`. The output `.pptx` will appear in `workspaces/<slug>/out/`.
