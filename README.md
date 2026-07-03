# pptx-forge

Compile JavaScript slide files into PowerPoint decks. Author slides as plain `.js` files using a design-system API — no PowerPoint, no drag-and-drop.

## How it works

Each workspace is a folder under `workspaces/`. You write slide files in `workspaces/<slug>/slides/`, optionally define a color scheme in `theme.js`, and run forge to get a `.pptx`.

```
workspaces/my-deck/
├── theme.js          # colors, header text, footer text
├── slides/
│   ├── 01-overview.js
│   └── 02-approach.js
└── out/
    └── my-deck.pptx  # generated
```

## Prerequisites

- Node.js 18+

## Install

```bash
npm install
```

## Create a workspace

```bash
npm run create
# Workspace name: my-deck
```

Copies the starter template into `workspaces/my-deck/` and prints next steps.

## Forge

```bash
npm run forge my-deck
npm run forge workspaces/my-deck   # relative path — useful for tab completion
npm run forge workspaces/my-deck/slides/overview.js   # single slide file — only that slide is included
```

Aliases: `npm run build my-deck`, `npm run generate my-deck`

Output: `workspaces/my-deck/out/my-deck.pptx`

Pass a path to a single slide `.js` file instead of a workspace to compile just that slide — the rest of `slides/` is skipped, but `theme.js` and the output path still resolve from the enclosing workspace.

### Options

| Flag | Short | Description |
|------|-------|-------------|
| `--open` | `-o` | Open the generated file in the default app after compiling |
| `--preview` | `-v` | Preview the generated file in QuickLook — macOS only |
| `--snapshot` | `-t` | Write to a timestamped file (`my-deck_2026-06-29_14-30-00.pptx`) instead of overwriting |
| `--help` | `-h` | Show usage and exit |

> **Note:** Due to how npm parses arguments, flags must be separated from the script name with `--`.

```bash
npm run forge my-deck -- --open            # compile and open
npm run forge my-deck -- --preview         # quick preview via QuickLook (macOS)
npm run forge my-deck -- --snapshot        # timestamped output
npm run forge my-deck -- --open --snapshot # both
npm run forge -- --help                    # show help
```

## Backup

```bash
npm run backup my-deck
npm run backup workspaces/my-deck   # relative path — useful for tab completion
```

Zips slide and theme files into `workspaces/my-deck/backups/my-deck_<timestamp>.zip`.

## Browser tool

A no-install alternative to the CLI: `pptx-forge.html` is a single self-contained HTML file that runs the same compile pipeline entirely client-side. Double-click it to open — no Node, no server, no network access required.

Download a pre-built copy from [GitHub Releases](https://github.com/awaragi/pptx-forge/releases) — no build step required:

- **Latest version:** [pptx-forge.html](https://github.com/awaragi/pptx-forge/releases/latest/download/pptx-forge.html) — always resolves to the newest release
- **A specific version:** `https://github.com/awaragi/pptx-forge/releases/download/<version>/pptx-forge-<version>.html` (e.g. [1.1.0](https://github.com/awaragi/pptx-forge/releases/download/1.1.0/pptx-forge-1.1.0.html))

Or build it yourself from source:

```bash
npm run build:browser
```

This bundles `pptxgenjs`, `jszip`, and the `src/` rendering library into `pptx-forge.html` at the repo root (gitignored — rebuild it locally when you need it).

Open the generated `pptx-forge.html` in a browser and:

1. Drag and drop, click "Load files…", or click "New slide" to add `theme.js` (optional — a placeholder is preloaded) and one or more slide `.js` files.
2. Click a file in the sidebar to edit it. Dropping a file with a name that already exists replaces its content in place.
3. Click the filename above the editor (or its pencil icon) to rename it in place — edit the name directly (the `.js` extension is fixed and shown separately, not editable), Enter to confirm or Escape to cancel. Use the toolbar's Discard/Download icons to remove or download the file, or click "⚡ Forge" to compile everything currently loaded into a downloadable `.pptx`. Rename and Discard aren't available for `theme.js`.

Only `.js` files are accepted, and Forge requires at least one slide file besides `theme.js`. This tool has no special sandboxing around the code it runs — it's meant for the same trusted, local use case as the CLI, just without requiring Node.

## Authoring slides

Each slide file exports a default function:

```js
export default function Slide01_Title(pptx, lib) {
  const { theme, prim, layout, frame } = lib;
  const slide = pptx.addSlide();
  slide.background = { color: theme.color.surface };

  frame.border(slide, undefined, {}, 's01-border');
  frame.slideHeader(slide, undefined, {}, 's01');
  frame.slideFooter(slide, undefined, {}, 's01');

  layout.sectionTitle(slide, null, 'Hello World', {}, 's01-title');
}
```

For AI-assisted authoring, share `INSTRUCTIONS.md` and `lib.d.ts` with your model. These two files contain everything needed to generate correct slide files.

## Versioning

pptx-forge makes no backward compatibility guarantees between versions. The tool's purpose is to generate a `.pptx` and move on — a workspace is a point-in-time artifact, not a long-lived application. When the library changes, existing slide files may need updating. New projects should start from the current version.

## License

GPL-3.0-or-later — see [LICENSE](LICENSE). You are free to use, modify, and distribute this software under the terms of the GNU General Public License v3 or any later version; you may not incorporate it verbatim into proprietary software without releasing your changes under the same license.

## Component library

All components are available via `lib.comp`. Destructure the ones you need at the top of each slide function.

### Cards

| Component | Content | Description |
|-----------|---------|-------------|
| `infoCard` | `{ title, body }` | Standard card with title + body |
| `accentCard` | `{ title, body }` | Card with a thin top accent bar |
| `challengeCard` | `{ title, body }` | Card with a left accent bar — for challenges or risks |
| `overlayCard` | `{ title, body }` | Semi-transparent variant for dark backgrounds |
| `fileCard` | `{ filename, purpose, step }` | Named file/artifact with purpose + next step |
| `numberedStep` | `{ num, title, body }` | Circle number badge + title + body |
| `stepBox` | `{ label, steps: string[] }` | Phase/step container; steps joined with ` · ` |
| `imageCard` | `{ image?, title, body?, imageH? }` | Card with an image placeholder band at top |
| `iconBox` | `{ icon?, title, body? }` | Centered large icon + title + optional body |
| `teamCard` | `{ name, role, bio? }` | Circular avatar placeholder + name + role + optional bio |

### KPI & Stats

| Component | Content | Description |
|-----------|---------|-------------|
| `iconStat` | `{ value, label, icon? }` | Large KPI value + label, optional icon above |
| `darkStat` | `{ value, label, source? }` | Dark-background KPI tile with optional citation line |

### Flow & Process

| Component | Content | Description |
|-----------|---------|-------------|
| `flowBox` | `{ label, highlight? }` | Flow diagram box; `highlight: true` applies accent fill |
| `flowArrow` | (none) | Arrow connector; `opts.vertical: true` for ↓ |
| `stepFlow` | `{ label, highlight? }[]` | Auto-lays out flow boxes + arrows across the box width |
| `phaseLabel` | `label` (string) | Accent badge + horizontal rule — section divider |

### Insight & Callout

| Component | Content | Description |
|-----------|---------|-------------|
| `calloutQuote` | `{ label?, quote }` | Left accent bar + optional label + insight/quote text |

### Lists & Tables

| Component | Content | Description |
|-----------|---------|-------------|
| `bulletIconList` | `{ icon, text }[]` | Icon-prefixed bullet lines |
| `twoColumnRow` | `{ label, content }` | Left label / right content row — stack to build key-value tables |

### Indicators & Placeholders

| Component | Content | Description |
|-----------|---------|-------------|
| `progressBar` | `{ value, label?, showPct? }` | Horizontal fill bar; `value` is 0–1 |
| `tagBadge` | `{ label }` | Small filled pill badge |
| `imageHolder` | `{ icon?, label? }` | Dashed placeholder box — swap with a real image in PowerPoint |

## Custom components

If the built-in `comp` components don't meet your design needs, it is entirely acceptable to build new ones directly in your slide files using `prim` primitives. There is no requirement to stay within the existing component set.

It is also acceptable to use pptxgenjs directly (e.g. `slide.addText()`, `slide.addShape()`, `slide.addImage()`) when `lib` doesn't cover what you need. Prefer `lib` where it applies — fall back to raw pptxgenjs only when necessary. See the [pptxgenjs docs](https://gitbrent.github.io/PptxGenJS/) for reference.

If you create something reusable and well-tested, sharing it back with the forge is highly appreciated — open a PR with the implementation or file an issue and paste the function code. Contributions help grow the shared component library for everyone.

## Backlog

Planned features and improvements:

- **Project export** — Download complete projects (theme.js + all slide files) as a zip archive
- **Syntax highlighting** — Add JavaScript syntax coloring to the code editor for better readability
- **Version compatibility** — `theme.js` and slide `.js` files should export a version number that must match the library version; mismatch causes runtime errors or bad output
