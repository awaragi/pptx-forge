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
```

Aliases: `npm run build my-deck`, `npm run generate my-deck`

Output: `workspaces/my-deck/out/my-deck.pptx`

### Options

| Flag | Short | Description |
|------|-------|-------------|
| `--open` | `-o` | Open the generated file in the default app after compiling |
| `--snapshot` | `-t` | Write to a timestamped file (`my-deck_2026-06-29_14-30-00.pptx`) instead of overwriting |
| `--help` | `-h` | Show usage and exit |

```bash
npm run forge my-deck --open            # compile and open
npm run forge my-deck --snapshot        # timestamped output
npm run forge my-deck --open --snapshot # both
npm run forge -- --help                 # show help
```

## Backup

```bash
npm run backup my-deck
```

Zips slide and theme files into `workspaces/my-deck/backups/my-deck_<timestamp>.zip`.

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
