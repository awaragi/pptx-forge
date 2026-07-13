## Context

The browser tool (`src/tools/browser/`) currently reports every outcome — success confirmations, passive info, and errors — through one persistent `#status-bar` line at the bottom of the editor pane (`app.js` `setStatus(message, isError)`, `app.css` `#status-bar`/`#status-bar.error`, `index.html`'s `<div id="status-bar">`). It has no auto-dismiss, no stacking, no tiering beyond a red/neutral toggle, and no `aria-live` announcement. ~30 call sites across `app.js` call `setStatus` directly, plus two listeners that manually blank the bar when the user retypes into a rename field after a failed rename.

This is a UI-only change confined to `src/tools/browser/`. `pptx-forge.html` is a generated bundle (via `scripts/build-browser.js`) and is not edited directly.

## Goals / Non-Goals

**Goals:**
- Replace the status bar with a stacked, top-right, auto-dismissing toast system (info/success/error tiers).
- Extract the notification logic into a standalone `notifications.js` module with a small API (`notifyInfo`, `notifySuccess`, `notifyError`) so `app.js` no longer owns rendering/timing logic inline.
- Preserve every existing user-facing message's content and intent — this changes *how* feedback is delivered, not *what* is reported (with the two explicitly-agreed exceptions below).
- Make notifications screen-reader-visible via `aria-live`, which the status bar never was.

**Non-Goals:**
- No change to *when* the app decides to notify (e.g. still one-time storage-failure warning, still repeatable nearing-quota note) — only the delivery mechanism changes.
- No persistent/always-visible feedback surface remains; a toast that has dismissed (auto or manual) leaves no residual UI state to inspect later.
- Not building a generic pub/sub or app-wide event bus — `notifications.js` is a self-contained UI widget the rest of `app.js` calls into directly, matching how `help.js`/`storage.js` are already consumed.

## Decisions

**Toast stack, not a queue.** Multiple toasts render simultaneously, newest appended below/above the others (see Migration Plan for exact ordering), each independently timed. Rejected a single-slot "replace" model (today's behavior) because it's the exact problem being fixed — errors get stepped on by the next info/success message before anyone reads them.

**Three tiers via three named functions, not one function with a type argument.** `notifyInfo(message)` / `notifySuccess(message)` / `notifyError(message)` rather than `notify(message, { type })`. Matches the user's explicit preference and keeps call sites terse and self-documenting at a glance (`notifyError('Forge failed: ...')` reads better than `notify('Forge failed: ...', { type: 'error' })`). All three delegate to one internal `pushToast(message, tier)` so there's no duplicated rendering/timer logic.

**Per-tier auto-dismiss duration: info/success ~4s, error ~8s.** Errors are the messages most worth actually reading, so they get roughly double the time. Both are finite — an error does *not* persist until manually dismissed — so the stack can never grow unbounded if the user walks away mid-session. Hovering any toast pauses its own timer (not the whole stack); moving off resumes it. A per-toast × always allows early dismissal regardless of tier or hover state.

**Drop `"Forging…"` entirely rather than adapt it.** It's the only status message today that describes an in-flight operation rather than a completed one. A toast with a fixed dismiss timer is a poor fit for "this is happening right now" (it would auto-vanish before the operation resolves, or need bespoke non-timed handling that the other ~29 call sites don't need). The forge button already disables itself for the duration (`el.forgeBtn.disabled = true`), which is sufficient busy-signal; the eventual `notifySuccess`/`notifyError` reports the outcome. Confirmed with the user — accepted as a scope reduction, not a gap.

**Drop the clear-on-retype listeners rather than port them.** Today, editing the rename input after a failed rename blanks the status bar's error state (`el.renameInput`'s and `el.workspaceRenameInput`'s `input` listeners). Once errors live in an independently-timed toast stack, there's no single "the current error" to blank — the failed-rename toast is just one entry in a stack that may already contain other, unrelated toasts. Confirmed with the user — the toast's own timer/× is sufficient; no replacement mechanism is added.

**Toast container is a fixed-position, viewport-anchored element outside the normal document flow (top-right).** It does not participate in the `.editor-shell`/`.status-bar` flex layout the old bar did — removing `#status-bar` lets the editor pane grow to fill that space, and the toast stack overlays on top rather than reserving permanent layout space.

**`aria-live="polite"` on the toast container, not `"assertive"`, even for errors.** `assertive` can interrupt a screen reader mid-sentence, which is disproportionate for messages a sighted user is not forced to act on immediately either (errors here are all recoverable, non-blocking states — nothing crashes the app). `polite` announces once the reader is idle, consistent with how a growl notification is expected to behave (present, but not siren-like).

## Risks / Trade-offs

- **[Risk]** Removing the persistent status line means there is no way to glance back at "what just happened" once a toast has auto-dismissed (today's bar, while easy to miss, at least held its last message indefinitely). → **Mitigation**: This is the intended trade-off per the proposal (explicitly agreed: "replace — no need for status bar anymore"); error tier gets a longer timeout specifically to reduce the chance of missing something important, and `console.error` calls already present for compile failures (`forge()` in `app.js`) remain untouched as a durable fallback record in devtools.
- **[Risk]** Stacking with no cap could visually flood the corner if many actions fire in quick succession (e.g. rapid rename retries). → **Mitigation**: Out of scope for this change per the user's explicit "stacking" decision; can be revisited later (e.g. de-dup identical consecutive messages, or a max-visible cap) if it proves to be a problem in practice.
- **[Trade-off]** `pptx-forge.html` must be rebuilt (`npm run build:browser`) for the toast system to appear in the distributed single-file bundle — not a new risk (true of any browser-tool source change today) but worth calling out since this change touches CSS/markup/JS across three source files simultaneously.

## Migration Plan

1. Add `notifications.js` (container creation, `pushToast`, timer/hover/dismiss logic, the three exported functions) and its markup/styles (toast container + toast element structure in `index.html`/`app.css`).
2. Update every `setStatus(message, isError)` call site in `app.js` to the matching `notifyInfo`/`notifySuccess`/`notifyError` call, per the tier mapping below; remove the `setStatus` function itself.
3. Remove the two clear-on-retype listeners and the `"Forging…"` call.
4. Remove `#status-bar` from `index.html` and its rules from `app.css`; remove `el.statusBar` from the `el` lookup object.
5. Update `openspec/specs/browser-workspace-persistence/spec.md`-covered requirements' wording (via this change's delta spec) to describe toast delivery instead of "status bar".
6. Rebuild `pptx-forge.html` via `npm run build:browser` and manually verify each tier (trigger at least one info/success/error path) plus stacking, hover-pause, and manual dismiss.

No rollback complexity beyond reverting the commit — no data migration, no persisted state format changes (this is UI-only).

## Open Questions

None outstanding — tier mapping, timing, stacking, module API, and the two edge cases (`"Forging…"`, clear-on-retype) were all confirmed with the user during exploration.
