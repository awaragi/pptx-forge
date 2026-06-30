## Why

The `compile` command lacks conveniences that speed up iterative authoring: you have to manually open the generated file each time, and every compile overwrites the same output so there's no history of builds. The command name `compile` also doesn't reflect the tool's identity.

## What Changes

- Rename `bin/compile.js` to `bin/forge.js` and update `package.json` scripts: primary `forge`, aliases `build` and `generate`
- Add `--open` / `-o` flag to `forge`: opens the generated `.pptx` in the default OS application after compile
- Add `--snapshot` / `-t` flag to `forge`: writes output to a timestamped filename instead of overwriting the default
- Add `--help` / `-h` flag to `forge`: prints usage and exits 0; position-independent
- Add `--help` / `-h` flag to `backup`: prints usage and exits 0; also shown when no workspace slug is provided (replaces current error)
- Install `open` npm package as a dependency
- Update `bin/create.js` post-scaffold instructions to reference `npm run forge` instead of `node bin/compile.js`
- Update `README.md` and `INSTRUCTIONS.md` to reflect new command names and flags

## Capabilities

### New Capabilities

- `cli-forge-command`: The renamed compile entrypoint with `--open`, `--snapshot`, and `--help` flags
- `cli-backup-help`: Help flag and no-slug help display for the backup command

### Modified Capabilities

<!-- None — no existing spec covers CLI command behavior -->

## Impact

- `bin/compile.js` → `bin/forge.js` (file rename + flag parsing added)
- `bin/backup.js` (help flag + no-slug behavior change)
- `bin/create.js` (output text update only)
- `package.json` (scripts + `open` dependency)
- `README.md`, `INSTRUCTIONS.md` (documentation updates)
- New npm dependency: `open`
