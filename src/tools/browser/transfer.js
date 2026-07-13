// Slide move/copy-to-another-workspace picker overlay. Self-contained like
// help.js: queries its own DOM, wires its own listeners, and exposes only
// the small surface app.js needs for shared Escape-key coordination.
import { listWorkspaceNames, readWorkspace, writeWorkspace, setActiveWorkspaceName } from './storage.js';
import { state, THEME_NAME, isPinnedName, applyWorkspace, persistWorkspace } from './state.js';
import { el as sharedEl } from './elements.js';
import { render } from './view.js';
import { renderWorkspaceSelect } from './workspace.js';
import { notifySuccess, notifyError } from './notifications.js';

const el = {
  moveBtn: document.getElementById('move-btn'),
  copyBtn: document.getElementById('copy-btn'),
  overlay: document.getElementById('transfer-overlay'),
  title: document.getElementById('transfer-overlay-title'),
  targetList: document.getElementById('transfer-target-list'),
  closeBtn: document.getElementById('transfer-overlay-close'),
};

let transferMode = null; // 'move' | 'copy', while the transfer picker is open
let transferSlideName = null;

function otherWorkspaceNames() {
  return listWorkspaceNames().filter((name) => name !== state.workspaceName);
}

function workspaceHasFile(name, fileName) {
  const snapshot = readWorkspace(name);
  return Boolean(snapshot && Object.prototype.hasOwnProperty.call(snapshot, fileName));
}

export function isTransferOpen() {
  return el.overlay.classList.contains('visible');
}

export function openTransferPicker(mode) {
  if (isPinnedName(state.active)) return;
  transferMode = mode;
  transferSlideName = state.active;
  el.title.textContent = mode === 'move'
    ? `Move "${transferSlideName}" to…`
    : `Copy "${transferSlideName}" to…`;
  el.targetList.innerHTML = '';

  const targets = otherWorkspaceNames();
  if (targets.length === 0) {
    const li = document.createElement('li');
    li.className = 'disabled';
    li.textContent = 'No other workspaces exist yet.';
    el.targetList.appendChild(li);
  }
  for (const name of targets) {
    const li = document.createElement('li');
    li.textContent = name;
    if (workspaceHasFile(name, transferSlideName)) {
      li.classList.add('disabled');
      const reason = document.createElement('span');
      reason.className = 'reason';
      reason.textContent = `already has ${transferSlideName}`;
      li.appendChild(reason);
    } else {
      li.addEventListener('click', () => performTransfer(name));
    }
    el.targetList.appendChild(li);
  }

  el.overlay.classList.add('visible');
}

export function closeTransferPicker() {
  el.overlay.classList.remove('visible');
  transferMode = null;
  transferSlideName = null;
}

function performTransfer(targetName) {
  const mode = transferMode;
  const name = transferSlideName;
  const entry = state.slides.get(name);
  if (!entry) {
    closeTransferPicker();
    return;
  }
  if (state.active === name) entry.content = sharedEl.editor.value;

  const targetSnapshot = readWorkspace(targetName) || {};
  if (Object.prototype.hasOwnProperty.call(targetSnapshot, name)) {
    // Shouldn't happen (the picker pre-filters collisions), but don't clobber.
    notifyError(`${mode === 'move' ? 'Move' : 'Copy'} failed — "${name}" already exists in "${targetName}".`);
    closeTransferPicker();
    return;
  }
  targetSnapshot[name] = entry.content;
  writeWorkspace(targetName, targetSnapshot);

  if (mode === 'move') {
    state.slides.delete(name);
    state.active = THEME_NAME;
    persistWorkspace();
    setActiveWorkspaceName(targetName);
    applyWorkspace(targetName, targetSnapshot);
    renderWorkspaceSelect();
    render();
    notifySuccess(`Moved "${name}" to "${targetName}".`);
  } else {
    notifySuccess(`Copied "${name}" to "${targetName}".`);
  }
  closeTransferPicker();
}

el.moveBtn.addEventListener('click', () => openTransferPicker('move'));
el.copyBtn.addEventListener('click', () => openTransferPicker('copy'));
el.closeBtn.addEventListener('click', closeTransferPicker);
el.overlay.addEventListener('click', (e) => {
  if (e.target === el.overlay) closeTransferPicker();
});
