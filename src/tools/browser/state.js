import { writeWorkspace, setActiveWorkspaceName, getActiveWorkspaceName, readWorkspace } from './storage.js';

export const THEME_NAME = 'theme.js';
export const MASTERS_NAME = 'masters.js';
export const DEFAULT_WORKSPACE_NAME = 'Untitled';

// __THEME_PLACEHOLDER__ and __MASTERS_PLACEHOLDER__ are injected at build time by
// scripts/build-browser.js (esbuild `define`) as raw file contents, sourced from
// src/sample/theme.js and src/sample/masters.js — the same scaffolds bin/create.js
// copies into new CLI workspaces — so both stay in sync from one file each.
export const THEME_PLACEHOLDER = typeof __THEME_PLACEHOLDER__ === 'string' ? __THEME_PLACEHOLDER__ : 'export default {};\n';
export const MASTERS_PLACEHOLDER = typeof __MASTERS_PLACEHOLDER__ === 'string' ? __MASTERS_PLACEHOLDER__ : 'export default function (theme) {\n  return [];\n};\n';

// State: theme and masters are fixed singleton entries (pinned, in that sidebar
// order); slides is a name-keyed map of { name, content } compiled/displayed in
// ascending filename order. workspaceName is both the localStorage key this state
// is saved under (see storage.js) and the base name used for forge/export output.
export const state = {
  theme: { name: THEME_NAME, content: THEME_PLACEHOLDER },
  masters: { name: MASTERS_NAME, content: MASTERS_PLACEHOLDER },
  slides: new Map(),
  active: THEME_NAME,
  workspaceName: DEFAULT_WORKSPACE_NAME,
};

export function isPinnedName(name) {
  return name === THEME_NAME || name === MASTERS_NAME;
}

export function isPinnedPlaceholder(name, content) {
  if (name === THEME_NAME) return content === THEME_PLACEHOLDER;
  if (name === MASTERS_NAME) return content === MASTERS_PLACEHOLDER;
  return false;
}

export function sortedSlideNames() {
  return [...state.slides.keys()].sort((a, b) => a.localeCompare(b));
}

export function getActiveEntry() {
  if (state.active === THEME_NAME) return state.theme;
  if (state.active === MASTERS_NAME) return state.masters;
  return state.slides.get(state.active);
}

export function currentWorkspaceSnapshot() {
  const snapshot = { [THEME_NAME]: state.theme.content, [MASTERS_NAME]: state.masters.content };
  for (const [name, entry] of state.slides) snapshot[name] = entry.content;
  return snapshot;
}

// Writes the in-memory state into localStorage under state.workspaceName and
// keeps the active-workspace pointer in sync. Called on every state mutation.
export function persistWorkspace() {
  writeWorkspace(state.workspaceName, currentWorkspaceSnapshot());
  setActiveWorkspaceName(state.workspaceName);
}

// Replaces in-memory state with a stored snapshot under the given workspace
// name. Keeps the currently active file selected if it still exists in the
// new snapshot (e.g. a cross-tab sync of the same workspace), otherwise
// falls back to theme.js.
export function applyWorkspace(name, snapshot) {
  const previousActive = state.active;
  state.workspaceName = name;
  state.theme.content = snapshot[THEME_NAME] ?? THEME_PLACEHOLDER;
  state.masters.content = snapshot[MASTERS_NAME] ?? MASTERS_PLACEHOLDER;
  state.slides.clear();
  for (const [fileName, content] of Object.entries(snapshot)) {
    if (isPinnedName(fileName)) continue;
    state.slides.set(fileName, { name: fileName, content });
  }
  state.active = isPinnedName(previousActive) || state.slides.has(previousActive) ? previousActive : THEME_NAME;
}

// Restores the last-active workspace on load; if none is recorded (or it no
// longer exists — e.g. the last workspace was deleted), auto-creates and
// activates a default workspace so one is always open. Adopts a pre-existing
// "Untitled" workspace instead of overwriting it, if one happens to exist.
export function restoreOrCreateActiveWorkspace() {
  const activeName = getActiveWorkspaceName();
  const snapshot = activeName ? readWorkspace(activeName) : null;
  if (activeName && snapshot) {
    applyWorkspace(activeName, snapshot);
    return;
  }

  const existingDefault = readWorkspace(DEFAULT_WORKSPACE_NAME);
  if (existingDefault) {
    setActiveWorkspaceName(DEFAULT_WORKSPACE_NAME);
    applyWorkspace(DEFAULT_WORKSPACE_NAME, existingDefault);
    return;
  }

  const blankSnapshot = { [THEME_NAME]: THEME_PLACEHOLDER, [MASTERS_NAME]: MASTERS_PLACEHOLDER };
  writeWorkspace(DEFAULT_WORKSPACE_NAME, blankSnapshot);
  setActiveWorkspaceName(DEFAULT_WORKSPACE_NAME);
  applyWorkspace(DEFAULT_WORKSPACE_NAME, blankSnapshot);
}
