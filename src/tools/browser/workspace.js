// Workspace switcher: list/switch/create/delete/rename, backed by storage.js.
import {
  listWorkspaceNames,
  workspaceExists,
  readWorkspace,
  writeWorkspace,
  deleteWorkspace,
  renameWorkspace,
  setActiveWorkspaceName,
} from './storage.js';
import { state, THEME_NAME, MASTERS_NAME, THEME_PLACEHOLDER, MASTERS_PLACEHOLDER, DEFAULT_WORKSPACE_NAME, applyWorkspace } from './state.js';
import { el } from './elements.js';
import { createInlineRename } from './inline-rename.js';
import { render } from './view.js';
import { notifySuccess, notifyError, notifyInfo } from './notifications.js';

export function renderWorkspaceSelect() {
  const names = listWorkspaceNames();
  el.workspaceSelect.innerHTML = '';
  for (const name of names) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    opt.selected = name === state.workspaceName;
    el.workspaceSelect.appendChild(opt);
  }
}

export function switchWorkspace(name) {
  if (name === state.workspaceName) return;
  const snapshot = readWorkspace(name);
  if (!snapshot) return;
  applyWorkspace(name, snapshot);
  setActiveWorkspaceName(name);
  renderWorkspaceSelect();
  render();
  notifySuccess(`Switched to "${name}".`);
}

export function createWorkspace() {
  const name = (window.prompt('Name this workspace:') || '').trim();
  if (!name) return;
  if (workspaceExists(name)) {
    notifyError(`"${name}" already exists — choose a different name.`);
    return;
  }
  const snapshot = { [THEME_NAME]: THEME_PLACEHOLDER, [MASTERS_NAME]: MASTERS_PLACEHOLDER };
  writeWorkspace(name, snapshot);
  setActiveWorkspaceName(name);
  applyWorkspace(name, snapshot);
  renderWorkspaceSelect();
  render();
  notifySuccess(`Created workspace "${name}".`);
}

export function deleteActiveWorkspace() {
  const name = state.workspaceName;
  if (!window.confirm(`Delete workspace "${name}"? This cannot be undone.`)) return;
  deleteWorkspace(name);

  const remaining = listWorkspaceNames();
  if (remaining.length > 0) {
    const nextName = remaining[0];
    applyWorkspace(nextName, readWorkspace(nextName));
    setActiveWorkspaceName(nextName);
  } else {
    const blankSnapshot = { [THEME_NAME]: THEME_PLACEHOLDER, [MASTERS_NAME]: MASTERS_PLACEHOLDER };
    writeWorkspace(DEFAULT_WORKSPACE_NAME, blankSnapshot);
    setActiveWorkspaceName(DEFAULT_WORKSPACE_NAME);
    applyWorkspace(DEFAULT_WORKSPACE_NAME, blankSnapshot);
  }
  renderWorkspaceSelect();
  render();
  notifySuccess(`Deleted workspace "${name}".`);
}

export const workspaceRename = createInlineRename({
  input: el.workspaceRenameInput,
  displayEl: el.workspaceSelect,
  hideWhileEditing: [el.workspaceRenameBtn],
  getCurrentValue: () => state.workspaceName,
  validate(newName) {
    if (!newName) return 'a name is required.';
    if (workspaceExists(newName)) return `"${newName}" already exists.`;
    return null;
  },
  commit(oldName, newName) {
    renameWorkspace(oldName, newName);
    state.workspaceName = newName;
    setActiveWorkspaceName(newName);
    renderWorkspaceSelect();
    notifySuccess(`Renamed workspace to "${newName}".`);
  },
});

// Fires when another tab writes a change; only applied here if it touches
// the workspace this tab has open and this tab isn't mid-edit.
export function handleExternalChange(workspaces) {
  if (document.activeElement === el.editor) return;
  const snapshot = workspaces[state.workspaceName];
  if (!snapshot) return;
  applyWorkspace(state.workspaceName, snapshot);
  renderWorkspaceSelect();
  render();
  notifyInfo('Synced from another tab.');
}
