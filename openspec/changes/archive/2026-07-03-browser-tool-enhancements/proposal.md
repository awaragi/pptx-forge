## Why

The browser tool (`pptx-forge.html`) currently loses all work on reload or tab close, always renders in a fixed dark theme, offers no way to reset `theme.js` without manual retyping, has no built-in way to hand a chatbot the library's API reference, and — most acutely — isn't actually distributable as a working tool: GitHub releases today ship source only, so anyone arriving via Releases (rather than cloning and building) cannot get a working `pptx-forge.html` without running `npm install` themselves, defeating the tool's own "no install, no server" premise.

## What Changes

- Add session-scoped autosave: every edit is written to `sessionStorage` under a per-project key, and the active project is silently restored on page load. Storage failures (private browsing, blocked `file://` storage) surface a one-time status-bar warning, then degrade silently to today's in-memory-only behavior.
- Add a **New project** action that starts a blank workspace under a new storage key, provisioning (without yet building UI for) future multi-project support.
- Add a **Reset** action for `theme.js` that restores it to the default placeholder, occupying the toolbar slot Discard already vacates for `theme.js`.
- Add light/dark mode: auto-detect `prefers-color-scheme` and apply a matching CSS variable set; no manual toggle.
- Add an **AI** button that copies a bundled `INSTRUCTIONS.md` + `lib.d.ts` reference to the clipboard (with a visible-textarea fallback when the Clipboard API is unavailable), for pasting into an AI chat.
- Update `release.yml` to build the browser bundle and attach `pptx-forge-<tag>.html` as a second release asset alongside the existing source zip, so releases ship a working browser tool directly.

## Capabilities

### New Capabilities
- `browser-workspace-persistence`: sessionStorage-backed autosave/restore of the browser tool's in-editor state, keyed per project, plus the New Project action and storage-failure warning.
- `browser-color-scheme`: light/dark CSS variable sets applied automatically from the OS/browser color-scheme preference.
- `browser-ai-reference`: build-time bundling of `INSTRUCTIONS.md` + `lib.d.ts` into the browser tool, and the AI button's copy-to-clipboard (with fallback) behavior.

### Modified Capabilities
- `browser-forge`: adds a Reset action for the `theme.js` toolbar entry (restores default placeholder content).
- `release-pipeline`: the GitHub Actions release workflow now builds `pptx-forge.html` and attaches it as an additional versioned asset on each release.

## Impact

- `src/tools/browser/app.js` and `src/tools/browser/index.html`: new storage logic, New Project / Reset / AI buttons, light/dark CSS variables.
- `scripts/build-browser.js`: extended to inline `INSTRUCTIONS.md` and `lib.d.ts` alongside the existing app-bundle marker replacement.
- `.github/workflows/release.yml`: adds an `npm ci` + `npm run build:browser` step and a second `gh release` asset upload.
- No changes to the CLI (`bin/`, `src/lib/`) or its specs — this change is scoped entirely to the browser tool and its release packaging.
