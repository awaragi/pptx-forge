## 1. Watch Script Scaffolding

- [x] 1.1 Add a new npm watch script in `package.json` that accepts a workspace slug and starts watch mode.
- [x] 1.2 Create a thin shell watch runner under `bin/` using the CLI `watch` command.
- [x] 1.3 Add clear usage and runtime behavior output so users know how to run and stop watch mode.

## 2. Change Detection and Snapshot Triggering

- [x] 2.1 Implement watch polling for workspace source inputs (slides, theme, masters).
- [x] 2.2 Add hash-based change detection so unchanged polling cycles do not trigger generation.
- [x] 2.3 Reuse forge snapshot generation behavior for watch-triggered runs so output naming remains timestamped and consistent.

## 3. Loop and Stability Controls

- [x] 3.1 Scope watched fingerprint inputs to source files (`slides/`, `theme.js`, `masters.js`) so generated paths do not retrigger.
- [x] 3.2 Ensure each polling interval triggers at most one generation run when fingerprint changes.
- [x] 3.3 Surface clear invocation and error behavior for watch mode.

## 4. Verification and Documentation

- [x] 4.1 Validate the simplified watch script behavior manually with real workspace changes.
- [x] 4.2 Validate that one-shot forge behavior (`forge`, `--snapshot`, `--open`) is unchanged when watch mode is not used.
- [x] 4.3 Update README usage docs for the new watch script and clean up backlog entries that are fulfilled by this change.
