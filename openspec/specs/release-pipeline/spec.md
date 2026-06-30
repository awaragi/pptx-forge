# Release Pipeline Spec

## Purpose

Defines the local scripts and CI workflow for versioning and distributing pptx-forge as a downloadable archive via GitHub Releases.

## Requirements

### Requirement: Version bump script
A `scripts/version.js` script SHALL bump the version field in `package.json` by a given increment type (`major`, `minor`, or `patch`) and optionally commit the change.

#### Scenario: Patch bump without commit
- **WHEN** the developer runs `node scripts/version.js patch`
- **THEN** `package.json` version is incremented by one patch (e.g. `1.0.0` → `1.0.1`), the file is written to disk, and the new version is printed to stdout

#### Scenario: Minor bump with commit
- **WHEN** the developer runs `node scripts/version.js minor --commit`
- **THEN** `package.json` version is incremented by one minor (e.g. `1.0.1` → `1.1.0`), a git commit is created with message `chore: bump version to <new-version>`, and the new version is printed to stdout

#### Scenario: Invalid type argument
- **WHEN** the developer runs `node scripts/version.js` with no type argument or an unknown type
- **THEN** the script exits with a non-zero code and prints usage instructions

### Requirement: Publish script
A `scripts/publish.js` script SHALL tag the current version from `package.json` and push the tag to the remote, triggering the CI release workflow.

#### Scenario: Clean state publish
- **WHEN** the developer runs `node scripts/publish.js` with `package.json` committed and no existing tag for the current version
- **THEN** the script pushes the current branch, creates a git tag equal to the version string (e.g. `1.0.1`), pushes the tag to origin, and prints a confirmation message

#### Scenario: Uncommitted version file
- **WHEN** `package.json` has uncommitted changes when `publish.js` runs
- **THEN** the script exits with a non-zero code and an error message before creating any tag or pushing

#### Scenario: Tag already exists
- **WHEN** a git tag matching the current version already exists locally
- **THEN** the script exits with a non-zero code and an error message before pushing

### Requirement: npm release scripts
`package.json` SHALL expose `release:prepare` and `release` scripts as aliases for the version and publish scripts.

#### Scenario: Prepare a patch release
- **WHEN** the developer runs `npm run release:prepare patch`
- **THEN** `node scripts/version.js patch` is executed with any additional arguments forwarded

#### Scenario: Publish a release
- **WHEN** the developer runs `npm run release`
- **THEN** `node scripts/publish.js` is executed

### Requirement: GitHub Actions release workflow
A `.github/workflows/release.yml` workflow SHALL trigger on pushes to tags matching the pattern `[0-9]+.[0-9]+.[0-9]+`, create a zip archive of the repository using `git archive`, and publish a GitHub release with the archive and auto-generated notes.

#### Scenario: Tag pushed to remote
- **WHEN** a tag such as `1.0.1` is pushed to the GitHub remote
- **THEN** the workflow creates `pptx-forge-1.0.1.zip` via `git archive --prefix=pptx-forge-1.0.1/`, publishes a GitHub release named `pptx-forge 1.0.1` with `--generate-notes`, and attaches the zip as a release asset

#### Scenario: Release archive excludes dev directories
- **WHEN** the zip is extracted
- **THEN** it does NOT contain `openspec/`, `.claude/`, `scripts/`, `.github/`, `.gitattributes`, or `.gitignore`, but DOES contain `src/`, `bin/`, `package.json`, `package-lock.json`, `lib.d.ts`, `README.md`, `INSTRUCTIONS.md`, and `LICENSE`

### Requirement: gitattributes export-ignore markers
A `.gitattributes` file SHALL mark `openspec/`, `.claude/`, `scripts/`, `.github/`, `.gitattributes`, and `.gitignore` with the `export-ignore` attribute so they are excluded by `git archive`.

#### Scenario: git archive respects export-ignore
- **WHEN** `git archive HEAD` is run against the repository
- **THEN** the resulting archive contains no files under `openspec/`, `.claude/`, `scripts/`, or `.github/`, and contains no `.gitattributes` or `.gitignore` files
