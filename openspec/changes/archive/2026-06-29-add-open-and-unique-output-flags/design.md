## Context

`bin/compile.js` is a standalone Node.js ESM script with no argument parsing library — it reads only `process.argv[2]` as a positional workspace slug. It uses `pptxgenjs` to generate `.pptx` files and patches the theme XML via JSZip. The project has no test suite; all verification is manual. `bin/backup.js` similarly reads only `process.argv[2]`.

## Goals / Non-Goals

**Goals:**
- Add `--open/-o`, `--snapshot/-t`, `--help/-h` flags to `bin/forge.js` (renamed from `bin/compile.js`)
- Add `--help/-h` to `bin/backup.js`; show help when no slug is provided
- Keep arg parsing zero-dependency (no minimist/yargs)
- Update all documentation references to the new command names

**Non-Goals:**
- No config file or persistent flag defaults
- No interactive mode
- No global CLI install (`npx` / `npm link`)
- No changes to slide authoring, theme, or output format

## Decisions

### 1. Manual arg parsing over a library

Flag parsing is done inline with `Array.includes` — no `minimist`, `yargs`, or `commander`.

**Why:** The command has one positional and three boolean flags. A parser library would add a transitive dependency and ~50 lines of config for a problem that fits in 5 lines. The `open` package is already the only new dependency; keep it that way.

**Implementation:**
```js
const args = process.argv.slice(2);
const openFlag     = args.includes('--open')     || args.includes('-o');
const snapshotFlag = args.includes('--snapshot') || args.includes('-t');
const helpFlag     = args.includes('--help')     || args.includes('-h');
const slug         = args.find(a => !a.startsWith('-'));
```

Flag position relative to the slug is irrelevant.

### 2. `open` npm package for file launching

The `open` package (pure ESM, v10+) launches a file in the OS default application. It is async and fire-and-forgets — the process can exit immediately after calling it.

**Alternatives considered:** `child_process.exec('open ...')` is macOS-only. The `open` package handles cross-platform correctly.

### 3. Snapshot timestamp format

Reuse the format already established in `bin/backup.js`:
```
YYYY-MM-DD_HH-MM-SS
```
Derived from `new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-')`.

Output path: `out/<slug>_<timestamp>.pptx` alongside the default `out/<slug>.pptx`.

### 4. Help exits 0, checked before slug validation

`--help` is checked before the "missing slug" guard so `npm run forge --help` works without a workspace name. Exits with code 0.

### 5. `backup` shows help on no-slug

Current behavior: `console.error` + `process.exit(1)`. New behavior: print help and `process.exit(0)`. This is consistent with how most CLI tools handle missing required args when no explicit error occurred.

### 6. File rename: `bin/compile.js` → `bin/forge.js`

The `package.json` scripts `forge`, `build`, and `generate` all point to `node bin/forge.js`. The old filename disappears entirely — no symlink or re-export shim.

## Risks / Trade-offs

- **`open` package version** → Pinned to v10+ (ESM). If the project ever needs CommonJS compatibility this becomes an issue, but the project is `"type": "module"` throughout so this is safe.
- **Timestamp collisions** → Two snapshots within the same second produce the same filename and overwrite. Acceptable for the use case (manual compile iterations).
- **`bin/compile.js` rename breaks existing `node bin/compile.js` invocations** → Intentional. All references in docs and `create.js` are updated as part of this change.
