## Context

`src/tools/browser/` is a small, dependency-free static app (`index.html` + `app.css` + `app.js` + `storage.js` + `compile.js`), bundled by `scripts/build-browser.js` into the single-file `pptx-forge.html`. It already has two centered-overlay popups — the AI-reference viewer (`#ai-overlay`/`.ai-panel`) and the Move/Copy transfer picker (`#transfer-overlay`) — both built on the same `.ai-overlay`/`.ai-panel` CSS pattern: a fixed backdrop, a centered panel with a header (title + ✕ close button), closed by clicking the backdrop or the ✕. Neither currently closes on Escape.

`storage.js` persists workspaces to `localStorage` under a workspaces key and an active-workspace key. Per `browser-workspace-persistence`, on every page load the app auto-creates and activates a default workspace if none exists yet — so by the time `app.js`'s render logic runs, "no workspace" is never observable. First-visit detection for the help modal must happen by reading the raw `localStorage` keys before that auto-create step runs, not by inspecting app state afterward.

Icon buttons already use a CSS mask-image pattern (`.icon-btn` + `.icon-<name>`, e.g. `.icon-plus`, `.icon-arrow-down-tray`) with inline base64 SVG data URIs baked into `app.css`. Help content can reuse these classes directly to render matching glyphs next to explanatory bullets.

## Goals / Non-Goals

**Goals:**
- Add a `?` help button and a paginated help modal covering Welcome, Workspaces, Slides & Editor, Import/Export, AI Tooling, and Forge & Download.
- Auto-open the modal once, on true first-ever visit, without being fooled by the existing default-workspace auto-create.
- Bring Escape-to-close to all three overlays (help, AI reference, transfer picker) in one pass, since they share a pattern and it's a small addition once the help modal needs it.
- Keep everything inline in the existing `index.html`/`app.css`/`app.js`/`storage.js` files — no new files, no new build step, no new dependency.

**Non-Goals:**
- No rich media (screenshots, animations, video) — text + bullets + inline icon glyphs only, per the content-style decision.
- No "don't show again" checkbox or per-screen read-tracking beyond the single first-visit flag.
- No embedded AI chat — the AI Tooling screen documents the existing copy/paste bridge workflow, it does not change that workflow.
- No changes to `bin/`, `scripts/build-browser.js`, or CLI-side code.

## Decisions

**Reuse `.ai-overlay`/`.ai-panel` as the base, add a modifier for paging.** A new `#help-overlay` element follows the exact same backdrop+panel structure as the existing two overlays (so it inherits centering, backdrop dimming, and responsive sizing for free), with an added `.help-panel` body region for the current screen's content and a footer strip for Prev/Next + dots. This keeps the three overlays visually and structurally consistent rather than introducing a competing modal system.

**First-visit detection reads raw `localStorage` before the auto-create runs.** `storage.js` exposes something like `hasAnyWorkspaceData()` — a direct check of the workspaces key's raw presence — called once during app init, before `browser-workspace-persistence`'s "auto-create a default workspace if none exists" logic executes. The result is cached in a local variable for that page load; the auto-open decision is made from that cached value, not from post-init state. A separate, independent key (e.g. `pptx-forge:help-seen`) records that the modal has been auto-shown, checked/set at the same moment, so the two concerns (workspace existence vs. help-seen) don't get tangled — a user who deletes their last workspace later shouldn't cause the help modal to reappear.

**Escape/arrow-key handling is added via one shared `keydown` listener, gated by which overlay is `.visible`.** Rather than three separate listeners, a single document-level `keydown` handler checks which overlay (if any) currently has the `.visible` class and dispatches Escape-to-close (all three) and Left/Right-arrow paging (help modal only) accordingly. This avoids duplicating focus-trap/listener-teardown logic three times in a codebase that otherwise keeps `app.js` as a flat set of module-level event bindings.

**Dots are real buttons, not decorative spans.** Since dots are clickable (jump-to-screen), each dot is a `<button>` with an `aria-label` (e.g. "Go to screen 3: Slides & Editor") and an `aria-current`/active-state class — keeps it keyboard- and screen-reader-accessible rather than a mouse-only affordance.

**Screen content lives as data in `app.js`, not as separate HTML partials.** A small array of `{ title, body }` (body = pre-built content, possibly a template-literal HTML string using existing `.icon-*` classes for glyphs) drives rendering of the current screen into the `.help-panel` body on navigation. This matches how the app already has no templating engine — everything is direct DOM/innerHTML construction in `app.js`.

**Reopening via the `?` button always starts at screen 1.** Simpler than persisting "last viewed screen," and consistent with treating each open as "start of the tour" rather than resuming a session.

## Risks / Trade-offs

- **First-visit detection races with the auto-create logic if not carefully sequenced** → Mitigate by doing the raw-storage check and caching its result as the very first thing in app init, strictly before any call into the workspace auto-create path; add a code comment at that call site (not in the spec) flagging the ordering dependency for future editors.
- **Six screens of hand-written HTML content is a maintenance surface** (button labels, icon classes referenced in help text can drift from the real UI over time) → Accepted trade-off given the no-build, single-file nature of this tool; kept as plain data in `app.js` so it's easy to grep and update alongside UI changes in the same file.
- **A shared keydown handler across three overlays adds a small amount of indirection** (need to check "which overlay is visible" each keystroke) → Acceptable given only three overlays exist and the check is a cheap class-list lookup; simpler than three near-duplicate listeners long-term.

## Open Questions

None outstanding — placement, auto-open condition, screen breakdown, keyboard/dot navigation, and content style were all settled during exploration before this change was created.
