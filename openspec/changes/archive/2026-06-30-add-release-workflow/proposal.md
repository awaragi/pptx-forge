## Why

There is currently no way to distribute pptx-forge without cloning the full repository. A release workflow lets users download a self-contained archive, run `npm install`, and start authoring slides immediately — without access to development artifacts or workspace content.

## What Changes

- Add `.gitattributes` to mark development-only directories as `export-ignore`, so `git archive` excludes them from release packages
- Add `scripts/version.mjs` to bump the version in `package.json` and optionally commit the change
- Add `scripts/publish.mjs` to tag the current version and push it to the remote, triggering a release
- Add `.github/workflows/release.yml` triggered on bare semver tags (e.g. `1.1.0`) that creates a zip archive via `git archive` and publishes a GitHub release with auto-generated notes
- Add `release:prepare` and `release` npm scripts wiring the above
- Fix `bin/create.js` to explicitly ensure the `workspaces/` parent directory exists before scaffolding

## Capabilities

### New Capabilities

- `release-pipeline`: Version bump, tag-and-push, and CI release workflow for distributing pptx-forge as a downloadable archive

### Modified Capabilities

- `workspace-scaffold`: `create.js` must explicitly create the `workspaces/` parent directory when it does not exist, so the tool works correctly after extracting a release archive

## Impact

- New files: `.gitattributes`, `scripts/version.mjs`, `scripts/publish.mjs`, `.github/workflows/release.yml`
- Modified files: `package.json` (new scripts), `bin/create.js` (workspaces parent mkdir)
- No changes to `src/lib.js`, `lib.d.ts`, or any existing bin scripts beyond `create.js`
- No new runtime dependencies
