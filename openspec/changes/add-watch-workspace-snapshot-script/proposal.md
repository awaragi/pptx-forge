## Why

Workspace authors currently need to manually rerun snapshot generation after editing workspace files, which is error-prone and slows iteration. Adding an automated watch flow keeps snapshots current during active editing and reduces missed updates before sharing or review.

## What Changes

- Add a new npm package script that watches a selected workspace directory for source changes.
- Trigger automatic snapshot generation when watched files change, with debouncing to avoid duplicate runs.
- Surface clear terminal output for watch start, changed files, generation success, and failures.
- Define and document completion criteria that include cleaning up fulfilled README backlog entries when this feature lands.

## Capabilities

### New Capabilities
- `workspace-watch-snapshot`: Watch workspace content changes and automatically generate an updated snapshot artifact.

### Modified Capabilities
- `cli-forge-command`: Extend command/script invocation behavior to cover workspace watch mode and automatic snapshot generation flow.

## Impact

- Affected code: npm scripts in `package.json`, CLI/runtime helper(s) used for snapshot generation, and file-watch orchestration code.
- Affected docs: `README.md` workflow and backlog sections.
- Dependencies/systems: Node.js file watching APIs and existing snapshot generation command path.
