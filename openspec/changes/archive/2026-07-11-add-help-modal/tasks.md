## 1. Storage: first-visit detection and help-seen flag

- [x] 1.1 In `storage.js`, add a function that checks raw `localStorage` for any existing workspace data (returns a boolean), safe to call before any auto-create logic runs
- [x] 1.2 In `storage.js`, add get/set helpers for a `pptx-forge:help-seen` (or similarly namespaced) `localStorage` key, wrapped in the same try/catch convention as the rest of the file

## 2. Markup: help button and modal structure

- [x] 2.1 In `index.html`, add a `?` icon button immediately next to the brand/version tag in the topbar
- [x] 2.2 In `index.html`, add a `#help-overlay` element following the existing `.ai-overlay`/`.ai-panel` structure, with: header (title + ✕ close), a body region for the current screen's content, and a footer with Prev button, dot indicators container, Next button

## 3. Styles

- [x] 3.1 In `app.css`, style the `?` button consistently with other `.icon-btn` topbar controls
- [x] 3.2 In `app.css`, add styles for the help modal's screen body, Prev/Next buttons (including a visually distinct `:disabled` state), and dot indicators (default vs. active state), extending the existing `.ai-overlay`/`.ai-panel` rules rather than duplicating them
- [x] 3.3 In `app.css`, add a visually distinct callout style (e.g. accent border/background, icon) for the Welcome screen's local-only execution statement, reusable if any other screen later needs a similar callout

## 4. Content

- [x] 4.1 In `app.js`, add a data array of 6 screens (Welcome, Workspaces, Slides & Editor, Import/Export, AI Tooling, Forge & Download), each with a title and body content
- [x] 4.2 Write Welcome screen content: lead with a visually distinct callout stating the tool runs 100% locally in the browser and never transmits user scripts, slide content, or workspace data anywhere (no network requests at all) — this must be the first thing shown, not a buried sentence — followed by what the tool is and workspace = theme.js + slides
- [x] 4.3 Write Workspaces screen content: switcher, new/rename/delete, one workspace = one deck-in-progress; reference the workspace-group icon buttons inline via their `.icon-*` classes
- [x] 4.4 Write Slides & Editor screen content: sidebar file tree, add/rename/discard/reset slide, editing in the textarea; reference the relevant icon buttons inline
- [x] 4.5 Write Import/Export screen content: drag-and-drop, Load files, workspace zip import/export layout (`theme.js` at root, `slides/` folder), Move/Copy to another workspace; reference the relevant icon buttons inline
- [x] 4.6 Write AI Tooling screen content: explain the ✨ AI button copies a reference bundle to the clipboard for pasting into an external AI chat, generated code is pasted back manually, include-components toggle behavior
- [x] 4.7 Write Forge & Download screen content: ⚡ Forge button, timestamp toggle, per-file Download button

## 5. Navigation and interaction logic

- [x] 5.1 In `app.js`, implement screen-render logic: given a screen index, update the modal body, update Prev/Next disabled state, update active dot
- [x] 5.2 Wire the `?` button to open the modal at screen 1 (index 0)
- [x] 5.3 Wire Prev/Next button clicks to move one screen, respecting first/last-screen limits
- [x] 5.4 Render one clickable dot per screen; wire dot clicks to jump directly to that screen
- [x] 5.5 Wire the help modal's ✕ button and backdrop click to close it (reuse existing overlay-close pattern)
- [x] 5.6 Add a shared `keydown` listener that, based on which overlay currently has `.visible`, closes that overlay on Escape, and additionally pages the help modal on Left/Right arrow when the help modal is the visible one
- [x] 5.7 Apply the same Escape-to-close handling to the existing AI-reference overlay and transfer-picker overlay via the shared listener from 5.6

## 6. First-visit auto-open wiring

- [x] 6.1 In `app.js` init, call the storage check from 1.1 and cache its result before invoking the existing default-workspace auto-create logic
- [x] 6.2 After init/render completes, if the cached first-visit result was true and the help-seen flag (1.2) is not already set, open the help modal at screen 1 and set the help-seen flag

## 7. Verification

- [x] 7.1 Run `npm run build:browser` and manually exercise the built `pptx-forge.html` in a browser: clear site data, reload, confirm the modal auto-opens once and not again on a second reload
- [x] 7.2 Manually verify Prev/Next, dot-click navigation, Escape, backdrop click, and arrow-key paging all behave per spec, including disabled Prev on screen 1 and disabled Next on screen 6
- [x] 7.3 Manually verify Escape now also closes the AI-reference overlay and the Move/Copy transfer picker without side effects
- [x] 7.4 Manually verify deleting the last workspace (triggering the default-workspace fallback) and reloading does not retrigger the help modal for a returning (help-seen) user
