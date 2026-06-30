## 1. Repository configuration

- [x] 1.1 Create `.gitattributes` marking `openspec/`, `.claude/`, and `scripts/` as `export-ignore`

## 2. Version bump script

- [x] 2.1 Create `scripts/version.mjs` with `bump()` helper (major/minor/patch), `currentVersion()` export, and `bumpVersion(type, { commit })` export
- [x] 2.2 Wire CLI entrypoint in `version.mjs`: parse `<major|minor|patch>` and `--commit` from `process.argv`, print usage and exit non-zero on missing/invalid type

## 3. Publish script

- [x] 3.1 Create `scripts/publish.mjs` that reads current version, guards against uncommitted `package.json` and duplicate tags, then pushes branch, creates bare semver tag, and pushes tag

## 4. npm scripts

- [x] 4.1 Add `"release:prepare": "node scripts/version.mjs"` and `"release": "node scripts/publish.mjs"` to `package.json`

## 5. GitHub Actions workflow

- [x] 5.1 Create `.github/workflows/release.yml` triggered on `push: tags: ["[0-9]*.*"]`
- [x] 5.2 Add checkout and `git archive --format=zip --prefix=pptx-forge-<tag>/` step to produce the release zip
- [x] 5.3 Add `gh release create` step with `--title`, `--generate-notes`, and the zip as the only asset

## 6. Workspace scaffold fix

- [x] 6.1 Update `bin/create.js` to explicitly `mkdir` the `workspaces/` parent directory with `{ recursive: true }` before the workspace existence check
