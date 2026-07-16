## Context

The project already supports one-shot workspace generation via `npm run forge <workspace>` and timestamped output via `--snapshot`. During iterative authoring, users repeatedly rerun commands to capture progress snapshots. This change introduces a watch-driven loop so snapshots are generated automatically when workspace files change.

## Goals / Non-Goals

**Goals:**
- Provide a package-level watch command for a workspace slug.
- Regenerate timestamped snapshots automatically after workspace file changes.
- Keep repeated triggers stable with hash comparison and clear logs.
- Include documentation/backlog hygiene as part of completion criteria.

**Non-Goals:**
- Replacing the existing one-shot `forge` command behavior.
- Introducing a long-running GUI process.
- Adding cloud sync, remote watch, or cross-workspace multiplexing.

## Decisions

- Add a dedicated npm script for watch mode rather than overloading default forge invocation.
  - Rationale: preserves backwards compatibility for one-shot compile flows.
  - Alternative considered: adding implicit watch behavior to `forge`; rejected due to surprising runtime behavior.
- Reuse existing snapshot generation path so watch mode only orchestrates triggers.
  - Rationale: keeps output contract consistent with current timestamp naming.
  - Alternative considered: separate watch-specific output writer; rejected to avoid duplicated output logic.
- Implement watch mode as a thin shell wrapper over the CLI `watch` command and a workspace fingerprint file.
  - Rationale: simpler implementation with no custom Node watcher runtime.
  - Alternative considered: Node-based watcher module; rejected as unnecessary complexity.
- Limit watch scope to workspace source inputs (e.g., slides/theme/masters) and ignore output/backups.
  - Rationale: prevents self-trigger loops and unnecessary CPU usage.

## Risks / Trade-offs

- [Risk] Rapid edits can cause frequent polling checks -> Mitigation: one-second interval and hash-change gate before invoking forge.
- [Risk] Output files might accidentally be watched, causing loops -> Mitigation: explicit ignore patterns for `out/`, `backups/`, and generated artifacts.
- [Risk] Long-running watch process may be left active unintentionally -> Mitigation: startup/shutdown logs and documented Ctrl+C usage.
- [Risk] README backlog entries may drift from implementation state -> Mitigation: include backlog cleanup in task completion checklist.

## Migration Plan

- Ship watch command as additive behavior with no breaking changes.
- Validate one-shot forge/snapshot flows still work unchanged.
- Update README usage/backlog section to reflect completed watch workflow work.

## Open Questions

- Should watch mode trigger once immediately on startup before the first file change?
