## Why

The browser tool's only feedback mechanism today is a single-line `#status-bar` pinned under the editor — every confirmation, warning, and error (including compile errors) overwrites the same line with no visual distinction beyond a red tint, no history, and nothing that draws the eye. Errors in particular are easy to miss since nothing calls attention to them. Consolidating all of this into a proper notification system, extracted from `app.js` into its own module, fixes both the visibility problem and the current sprawl of ~30 inline `setStatus(...)` call sites.

## What Changes

- **BREAKING**: Remove `#status-bar` from the browser tool UI entirely (markup, CSS, and the `setStatus` function) — no persistent status line remains; the editor pane reclaims the vertical space.
- Add a new `src/tools/browser/notifications.js` module implementing a stacked, top-right, growl-style toast system:
  - Toasts stack (newest appended to the stack; no replace-in-place).
  - Three tiers: info, success, error — each with distinct styling.
  - Auto-dismiss on a per-tier timer (success/info dismiss sooner than error, since errors are the ones worth reading); hovering a toast pauses its timer; each toast has a manual close (×).
  - Exposes `notifyInfo(message)`, `notifySuccess(message)`, `notifyError(message)`.
- Migrate all ~30 existing `setStatus(message, isError)` call sites in `app.js` to the matching `notifyInfo` / `notifySuccess` / `notifyError` call.
- Drop the in-progress `"Forging…"` status message (the forge button already disables itself during the operation; a transient toast mid-async is misleading since it would auto-dismiss before the operation finishes).
- Drop the "clear status bar on retype" listeners on the rename/workspace-rename inputs — meaningless once errors live in an independent, self-timing toast stack rather than a single mutable line.
- Add an `aria-live` region so toasts are announced to assistive technology (a gap that exists today too, since `#status-bar` isn't currently marked up as live).

## Capabilities

### New Capabilities
- `browser-notifications`: Stacked, top-right, auto-dismissing toast notifications (info/success/error tiers) that replace the status bar as the browser tool's sole feedback surface.

### Modified Capabilities
- `browser-workspace-persistence`: The storage-failure warning, nearing-quota note, and cross-tab-sync note requirements currently specify "status-bar" as the delivery mechanism by name; these are rewritten to specify toast notifications (via `browser-notifications`) instead, with tiers assigned (storage failure/quota → error/info as appropriate, cross-tab sync → info).

## Impact

- `src/tools/browser/app.js`: every `setStatus(...)` call site updated to `notifyInfo`/`notifySuccess`/`notifyError`; `setStatus` function removed; two clear-on-input listeners removed; `"Forging…"` call removed.
- `src/tools/browser/index.html`: `#status-bar` div removed; new toast-stack container element added.
- `src/tools/browser/app.css`: `#status-bar` rules removed; new toast/stack styling added.
- `src/tools/browser/notifications.js`: new module.
- `pptx-forge.html` (built bundle): regenerated via `scripts/build-browser.js`, not hand-edited.
- No changes to `storage.js`, `compile.js`, `help.js`, or any CLI/library code — this is scoped entirely to the browser tool's UI feedback layer.
