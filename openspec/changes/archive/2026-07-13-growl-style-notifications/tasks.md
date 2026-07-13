## 1. Notification module

- [x] 1.1 Add toast-stack container markup to `src/tools/browser/index.html` (fixed, top-right, `aria-live="polite"`), replacing the `<div id="status-bar"></div>` element
- [x] 1.2 Create `src/tools/browser/notifications.js` exporting `notifyInfo(message)`, `notifySuccess(message)`, `notifyError(message)`, all delegating to a shared internal `pushToast(message, tier)`
- [x] 1.3 Implement per-toast rendering (tier-specific styling/icon), stacking (new toasts append without removing existing ones), and manual close control
- [x] 1.4 Implement per-tier auto-dismiss timers (info/success ~4s, error ~8s) with hover-to-pause/resume scoped to the individual toast
- [x] 1.5 Add toast/stack styles to `src/tools/browser/app.css`; remove `#status-bar` and `#status-bar.error` rules

## 2. Migrate app.js call sites

- [x] 2.1 Add `import { notifyInfo, notifySuccess, notifyError } from './notifications.js';` to `app.js`; remove `el.statusBar` from the `el` lookup and the `setStatus` function
- [x] 2.2 Migrate storage-handler call sites: storage-failure warning (error), nearing-quota note (info), cross-tab sync note (info)
- [x] 2.3 Migrate workspace management call sites: switch/create/delete/rename workspace (success on completion, error on name collisions and rename failures)
- [x] 2.4 Migrate AI reference call sites: clipboard copy success, clipboard-unavailable fallback error
- [x] 2.5 Migrate file/slide call sites: reset pinned file, load/import rejection (non-`.js`), zip import (success/merge/cancel/failure), download, export (success/error), discard, rename (success/error)
- [x] 2.6 Migrate forge call site: slide-required guard (error), compile success, `CompileError`/generic failure (error) — drop the in-progress `"Forging…"` call entirely, per design.md
- [x] 2.7 Migrate slide move/copy call sites: success and target-collision failure
- [x] 2.8 Remove the two clear-on-retype listeners on `el.renameInput` and `el.workspaceRenameInput` (`input` handlers that blanked the status bar's error state), per design.md

## 3. Verification

- [x] 3.1 Rebuild the browser bundle (`npm run build:browser`) and confirm `pptx-forge.html` reflects the new toast UI
- [x] 3.2 Manually exercise at least one info, one success, and one error path; confirm tier styling, `aria-live` announcement, hover-pause, manual close, and stacking (trigger two notifications before the first dismisses)
- [x] 3.3 Confirm no residual `#status-bar` references remain in `index.html`, `app.css`, or `app.js`
- [x] 3.4 Confirm the editor pane visibly reclaims the space the status bar previously occupied
