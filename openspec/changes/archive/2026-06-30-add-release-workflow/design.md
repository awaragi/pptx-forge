## Context

pptx-forge has no distribution mechanism. Users must clone the repository to use the tool, which brings in workspaces, development artifacts (`openspec/`, `.claude/`, `scripts/`), and git history. The goal is a minimal, downloadable archive containing only the files needed to run the tool.

The project has no build step — it is pure ESM JavaScript run directly with Node.js. A "release" is therefore a packaging problem: select the right files from the repository and attach them to a GitHub release.

## Goals / Non-Goals

**Goals:**
- Allow users to download a zip archive, extract it, run `npm install`, and start using the tool
- Provide a local `release:prepare` script to bump the version in `package.json` and commit it
- Provide a local `release` script to tag the current version and push, triggering CI
- Have CI create a GitHub release with a zip archive and auto-generated release notes
- Exclude development directories from the release archive automatically via `.gitattributes`

**Non-Goals:**
- Publishing to npm
- Bundling or transpiling JavaScript
- Including `node_modules` in the archive
- Automated testing in CI (no test suite exists)

## Decisions

### D1: Use `git archive` + `.gitattributes` for packaging

**Decision:** Create the release zip with `git archive HEAD`, and mark dev-only directories in `.gitattributes` with `export-ignore`.

**Rationale:** `git archive` is the standard way to export a clean snapshot of a repository. It respects `export-ignore` attributes, so any new file added to the repository is automatically included in releases unless explicitly opted out. This is the most future-proof approach — adding a new `bin/` script or top-level file requires no workflow changes.

**Alternative considered:** An explicit include-list in the workflow (`git archive ... -- src/ bin/ package.json ...`). Rejected because it requires updating the workflow whenever new files are added.

**Directories marked `export-ignore`:**
- `openspec/` — change planning artifacts, dev-only
- `.claude/` — AI assistant config, dev-only
- `scripts/` — release tooling scripts, dev-only (not needed at runtime)

### D2: Bare semver tags, no `v` prefix

**Decision:** Tags are bare semver strings: `1.0.0`, `1.1.0`, `2.0.0`.

**Rationale:** The version in `package.json` is already a bare semver. Using the same string as the tag eliminates any prefix-stripping logic in scripts and the workflow. The GitHub Actions tag pattern `[0-9]*.*` matches bare semver without matching other tag shapes.

### D3: Two-step local release process (prepare + publish)

**Decision:** Split into `release:prepare <type>` (bumps version, commits) and `release` (tags, pushes).

**Rationale:** Keeping the steps separate allows the developer to inspect the version bump commit before pushing, or to make additional changes (e.g., update CHANGELOG) between bumping and tagging. The `release` script guards against releasing with uncommitted version files or a tag that already exists.

### D4: Auto-generated release notes via `--generate-notes`

**Decision:** Use `gh release create --generate-notes` in the workflow.

**Rationale:** GitHub generates notes from PR titles and commit messages since the last release. This requires no manual authoring and improves over time as commit discipline improves. No custom release notes template is added at this stage.

### D5: `create.js` explicitly creates the `workspaces/` parent

**Decision:** `create.js` SHALL ensure the `workspaces/` parent directory exists before checking for or creating the target workspace.

**Rationale:** `workspaces/` is gitignored and therefore absent from a freshly extracted release archive. The current implicit behavior (relying on `mkdir --parents`) works but is fragile — a future refactor could break it silently. Making the intent explicit also makes the script work correctly without requiring the user to manually create the directory.

## Risks / Trade-offs

- **`.gitattributes` must be kept up to date** → Any new dev-only top-level directory must be added manually. Mitigation: the consequence of forgetting is minimal (a non-harmful extra directory in the archive, not a broken release).
- **`git archive` does not run `npm install`** → Users must run `npm install` after extracting. Mitigation: documented in README; this is standard practice for Node.js projects.
- **`release` script pushes to remote before tagging** → If the push fails, the tag is never created. Mitigation: this is the correct order; pushing first ensures the tag points to a commit already on the remote.
