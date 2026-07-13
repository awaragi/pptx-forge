// Shared setup for driving the built pptx-forge.html over file://. Seeds
// localStorage to match storage.js's schema so tests start from a known
// workspace instead of re-driving the creation UI every time.
import { fileURLToPath } from 'node:url';

export const APP_PATH = fileURLToPath(new URL('../../pptx-forge.html', import.meta.url));
export const APP_URL = `file://${APP_PATH}`;

const WORKSPACES_KEY = 'pptx-forge.workspaces';
const ACTIVE_KEY = 'pptx-forge.activeWorkspace';
const HELP_SEEN_KEY = 'pptx-forge.helpSeen';

export const DEFAULT_THEME = 'export default {};\n';
export const DEFAULT_MASTERS = 'export default function (theme) {\n  return [];\n};\n';

// A real slide module: renders `text` via the shared lib so the compiled
// pptx has verifiable content, not just "it didn't throw".
export function slideModule(text) {
  return `export default function (pptx, lib) {
  const slide = pptx.addSlide();
  lib.prim.text(slide, { x: 0.5, y: 0.5, w: 9, h: 1 }, ${JSON.stringify(text)});
};
`;
}

// Loads the app once (so its own bootstrap runs and creates whatever default
// state it would anyway), then overwrites localStorage directly and reloads.
// Deliberately NOT context.addInitScript: that re-fires on every subsequent
// navigation in the same context/page, which would clobber in-test edits on
// the reloads that the persistence specs rely on.
export async function gotoApp(page, { workspaceName = 'Untitled', files = {} } = {}) {
  const workspaces = {
    [workspaceName]: {
      'theme.js': DEFAULT_THEME,
      'masters.js': DEFAULT_MASTERS,
      ...files,
    },
  };

  await page.goto(APP_URL);
  await page.evaluate(
    ({ workspacesKey, activeKey, helpSeenKey, workspaces, workspaceName }) => {
      window.localStorage.setItem(workspacesKey, JSON.stringify(workspaces));
      window.localStorage.setItem(activeKey, workspaceName);
      window.localStorage.setItem(helpSeenKey, '1');
    },
    { workspacesKey: WORKSPACES_KEY, activeKey: ACTIVE_KEY, helpSeenKey: HELP_SEEN_KEY, workspaces, workspaceName }
  );
  await page.reload();
}
