## MODIFIED Requirements

### Requirement: GitHub Actions release workflow
A `.github/workflows/release.yml` workflow SHALL trigger on pushes to tags matching the pattern `[0-9]+.[0-9]+.[0-9]+`, install dependencies and build the browser tool, create a zip archive of the repository using `git archive`, and publish a GitHub release attaching both the source zip and the built `pptx-forge.html` (renamed to include the version) with auto-generated notes.

#### Scenario: Tag pushed to remote
- **WHEN** a tag such as `1.0.1` is pushed to the GitHub remote
- **THEN** the workflow installs dependencies, runs `npm run build:browser` to produce `pptx-forge.html`, creates `pptx-forge-1.0.1.zip` via `git archive --prefix=pptx-forge-1.0.1/`, publishes a GitHub release named `pptx-forge 1.0.1` with `--generate-notes`, and attaches both `pptx-forge-1.0.1.zip` and `pptx-forge-1.0.1.html` as release assets

#### Scenario: Release archive excludes dev directories
- **WHEN** the zip is extracted
- **THEN** it does NOT contain `openspec/`, `.claude/`, `scripts/`, `.github/`, `.gitattributes`, or `.gitignore`, but DOES contain `src/`, `bin/`, `package.json`, `package-lock.json`, `lib.d.ts`, `README.md`, `INSTRUCTIONS.md`, and `LICENSE`

#### Scenario: Attached html is directly usable
- **WHEN** a user downloads `pptx-forge-1.0.1.html` from the release and opens it via `file://`
- **THEN** the browser tool is fully functional with no build step, `npm install`, or network access required
