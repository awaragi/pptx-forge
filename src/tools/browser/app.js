import { compileDeck, CompileError, exportWorkspaceZip, readWorkspaceZip } from './compile.js';
import {
  listWorkspaceNames,
  workspaceExists,
  readWorkspace,
  writeWorkspace,
  deleteWorkspace,
  renameWorkspace,
  getActiveWorkspaceName,
  setActiveWorkspaceName,
  setStorageFailureHandler,
  setNearingQuotaHandler,
  setExternalChangeHandler,
  hasAnyWorkspaceData,
} from './storage.js';
import { isHelpOpen, closeHelp, nextHelpScreen, prevHelpScreen, maybeAutoOpenHelp } from './help.js';
import { notifyInfo, notifySuccess, notifyError } from './notifications.js';

const THEME_NAME = 'theme.js';
const MASTERS_NAME = 'masters.js';
const DEFAULT_WORKSPACE_NAME = 'Untitled';
// __AI_CHAT__, __INSTRUCTIONS__, __COMPONENTS__, __LIB_DTS__, __THEME_PLACEHOLDER__,
// and __MASTERS_PLACEHOLDER__ are injected at build time by scripts/build-browser.js
// (esbuild `define`) as raw file contents — assembly (headers, order, optional
// components splice) happens here, not in the build script. The theme/masters
// placeholders are sourced from src/sample/theme.js and src/sample/masters.js — the
// same scaffolds bin/create.js copies into new CLI workspaces — so both stay in sync
// from one file each.
const AI_CHAT = typeof __AI_CHAT__ === 'string' ? __AI_CHAT__ : '';
const INSTRUCTIONS = typeof __INSTRUCTIONS__ === 'string' ? __INSTRUCTIONS__ : '';
const COMPONENTS = typeof __COMPONENTS__ === 'string' ? __COMPONENTS__ : '';
const LIB_DTS = typeof __LIB_DTS__ === 'string' ? __LIB_DTS__ : '';
const THEME_PLACEHOLDER = typeof __THEME_PLACEHOLDER__ === 'string' ? __THEME_PLACEHOLDER__ : 'export default {};\n';
const MASTERS_PLACEHOLDER = typeof __MASTERS_PLACEHOLDER__ === 'string' ? __MASTERS_PLACEHOLDER__ : 'export default function (theme) {\n  return [];\n};\n';
const VERSION = typeof __VERSION__ === 'string' ? __VERSION__ : '';

const NEW_SLIDE_TEMPLATE = `export default function (pptx, lib) {
  const { theme, prim, comp, tables, layout, frame } = lib;
  const slide = pptx.addSlide();

  prim.text(slide, { x: 0.5, y: 0.4, w: 9, h: 0.6 }, 'New slide', { fontSize: theme.size.title, bold: true });
};
`;

// State: theme and masters are fixed singleton entries (pinned, in that sidebar
// order); slides is a name-keyed map of { name, content } compiled/displayed in
// ascending filename order. workspaceName is both the localStorage key this state
// is saved under (see storage.js) and the base name used for forge/export output.
const state = {
  theme: { name: THEME_NAME, content: THEME_PLACEHOLDER },
  masters: { name: MASTERS_NAME, content: MASTERS_PLACEHOLDER },
  slides: new Map(),
  active: THEME_NAME,
  workspaceName: DEFAULT_WORKSPACE_NAME,
};

let newSlideCounter = 1;
let renaming = false;
let workspaceRenaming = false;
let transferMode = null; // 'move' | 'copy', while the transfer picker is open
let transferSlideName = null;

const el = {
  appVersion: document.getElementById('app-version'),
  themeList: document.getElementById('theme-list'),
  fileList: document.getElementById('file-list'),
  nodeActions: document.getElementById('node-actions'),
  nodeActionsButtons: document.getElementById('node-actions-buttons'),
  editor: document.getElementById('editor'),
  activeFilename: document.getElementById('active-filename'),
  filenameGroup: document.getElementById('filename-group'),
  renameInput: document.getElementById('rename-input'),
  renameExt: document.getElementById('rename-ext'),
  workspaceSelect: document.getElementById('workspace-select'),
  workspaceRenameInput: document.getElementById('workspace-rename-input'),
  workspaceRenameBtn: document.getElementById('workspace-rename-btn'),
  workspaceImportBtn: document.getElementById('workspace-import-btn'),
  workspaceExportBtn: document.getElementById('workspace-export-btn'),
  workspaceDeleteBtn: document.getElementById('workspace-delete-btn'),
  workspaceNewBtn: document.getElementById('workspace-new-btn'),
  timestampToggle: document.getElementById('timestamp-toggle'),
  forgeBtn: document.getElementById('forge-btn'),
  downloadBtn: document.getElementById('download-btn'),
  discardBtn: document.getElementById('discard-btn'),
  resetBtn: document.getElementById('reset-btn'),
  renameBtn: document.getElementById('rename-btn'),
  moveBtn: document.getElementById('move-btn'),
  copyBtn: document.getElementById('copy-btn'),
  addSlideBtn: document.getElementById('add-slide-btn'),
  loadFilesBtn: document.getElementById('load-files-btn'),
  fileInput: document.getElementById('file-input'),
  dropOverlay: document.getElementById('drop-overlay'),
  aiBtn: document.getElementById('ai-btn'),
  aiComponentsToggle: document.getElementById('ai-components-toggle'),
  aiOverlay: document.getElementById('ai-overlay'),
  aiOverlayClose: document.getElementById('ai-overlay-close'),
  aiReferenceTextarea: document.getElementById('ai-reference-textarea'),
  transferOverlay: document.getElementById('transfer-overlay'),
  transferOverlayTitle: document.getElementById('transfer-overlay-title'),
  transferTargetList: document.getElementById('transfer-target-list'),
  transferOverlayClose: document.getElementById('transfer-overlay-close'),
};

setStorageFailureHandler(() => {
  notifyError("Persistent storage unavailable — changes won't survive a reload.");
});

setNearingQuotaHandler(() => {
  notifyInfo('Storage is getting full — consider deleting unused workspaces.');
});

// Fires when another tab writes a change; only applied here if it touches
// the workspace this tab has open and this tab isn't mid-edit.
setExternalChangeHandler((workspaces) => {
  if (document.activeElement === el.editor) return;
  const snapshot = workspaces[state.workspaceName];
  if (!snapshot) return;
  applyWorkspace(state.workspaceName, snapshot);
  renderWorkspaceSelect();
  render();
  notifyInfo('Synced from another tab.');
});

function isPinnedName(name) {
  return name === THEME_NAME || name === MASTERS_NAME;
}

function isPinnedPlaceholder(name, content) {
  if (name === THEME_NAME) return content === THEME_PLACEHOLDER;
  if (name === MASTERS_NAME) return content === MASTERS_PLACEHOLDER;
  return false;
}

function sortedSlideNames() {
  return [...state.slides.keys()].sort((a, b) => a.localeCompare(b));
}

function getActiveEntry() {
  if (state.active === THEME_NAME) return state.theme;
  if (state.active === MASTERS_NAME) return state.masters;
  return state.slides.get(state.active);
}

function currentWorkspaceSnapshot() {
  const snapshot = { [THEME_NAME]: state.theme.content, [MASTERS_NAME]: state.masters.content };
  for (const [name, entry] of state.slides) snapshot[name] = entry.content;
  return snapshot;
}

// Writes the in-memory state into localStorage under state.workspaceName and
// keeps the active-workspace pointer in sync. Called on every state mutation.
function persistWorkspace() {
  writeWorkspace(state.workspaceName, currentWorkspaceSnapshot());
  setActiveWorkspaceName(state.workspaceName);
}

// Replaces in-memory state with a stored snapshot under the given workspace
// name. Keeps the currently active file selected if it still exists in the
// new snapshot (e.g. a cross-tab sync of the same workspace), otherwise
// falls back to theme.js.
function applyWorkspace(name, snapshot) {
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
function restoreOrCreateActiveWorkspace() {
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

function renderWorkspaceSelect() {
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

function switchWorkspace(name) {
  if (name === state.workspaceName) return;
  const snapshot = readWorkspace(name);
  if (!snapshot) return;
  applyWorkspace(name, snapshot);
  setActiveWorkspaceName(name);
  renderWorkspaceSelect();
  render();
  notifySuccess(`Switched to "${name}".`);
}

function createWorkspace() {
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

function deleteActiveWorkspace() {
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

function startWorkspaceRename() {
  if (workspaceRenaming) return;
  workspaceRenaming = true;
  el.workspaceRenameInput.value = state.workspaceName;
  el.workspaceSelect.style.display = 'none';
  el.workspaceRenameBtn.style.display = 'none';
  el.workspaceRenameInput.style.display = 'inline-block';
  el.workspaceRenameInput.focus();
  el.workspaceRenameInput.select();
}

function exitWorkspaceRenameMode() {
  workspaceRenaming = false;
  el.workspaceRenameInput.style.display = 'none';
  el.workspaceSelect.style.display = '';
  el.workspaceRenameBtn.style.display = '';
}

function cancelWorkspaceRename() {
  if (!workspaceRenaming) return;
  exitWorkspaceRenameMode();
}

// keepEditingOnFailure: true while the user can still type (Enter key) —
// stays in the input so they can fix the name. false on blur, where focus
// is already gone, so an invalid name just reverts.
function commitWorkspaceRename(keepEditingOnFailure) {
  if (!workspaceRenaming) return;
  const oldName = state.workspaceName;
  const newName = el.workspaceRenameInput.value.trim();

  if (newName === oldName) {
    exitWorkspaceRenameMode();
    return;
  }

  // Only notify on the Enter-key path: on blur, the input already showed
  // this exact error once (from a prior Enter press) and is now just
  // silently reverting, per the comment above — re-notifying here would
  // duplicate the toast every time focus leaves a still-invalid input.
  const fail = (message) => {
    if (keepEditingOnFailure) {
      notifyError(`Rename failed — ${message}`);
      el.workspaceRenameInput.focus();
      el.workspaceRenameInput.select();
    } else {
      exitWorkspaceRenameMode();
    }
  };

  if (!newName) return fail('a name is required.');
  if (!renameWorkspace(oldName, newName)) return fail(`"${newName}" already exists.`);

  state.workspaceName = newName;
  setActiveWorkspaceName(newName);
  exitWorkspaceRenameMode();
  renderWorkspaceSelect();
  notifySuccess(`Renamed workspace to "${newName}".`);
}

// Reads the toggle at call time (not persisted) — the checkbox's checked
// property is the sole source of truth for this state. Order is fixed:
// AI-CHAT, INSTRUCTIONS, COMPONENTS (optional), lib.d.ts.
// AI-CHAT.md/INSTRUCTIONS.md/COMPONENTS.md each already open with their own
// "# X.md — ..." heading, so no filename header is added for them here.
// lib.d.ts has no heading of its own, so it keeps a "# lib.d.ts" marker.
function assembleAiReference() {
  const parts = [AI_CHAT, INSTRUCTIONS];
  if (el.aiComponentsToggle.checked) parts.push(COMPONENTS);
  parts.push(`# lib.d.ts\n\n${LIB_DTS}`);
  return parts.join('\n\n');
}

function showAiReferenceFallback() {
  el.aiReferenceTextarea.value = assembleAiReference();
  el.aiOverlay.classList.add('visible');
  el.aiReferenceTextarea.focus();
  el.aiReferenceTextarea.select();
}

async function copyAiReference() {
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      throw new Error('Clipboard API unavailable');
    }
    await navigator.clipboard.writeText(assembleAiReference());
    notifySuccess('Copied AI reference to clipboard.');
  } catch {
    showAiReferenceFallback();
    notifyError('Clipboard unavailable — select and copy the reference text below.');
  }
}

function resetPinnedFile() {
  const isTheme = state.active === THEME_NAME;
  const isMasters = state.active === MASTERS_NAME;
  if (!isTheme && !isMasters) return;
  const name = isTheme ? THEME_NAME : MASTERS_NAME;
  if (!window.confirm(`Reset ${name} to its default placeholder? This cannot be undone.`)) return;
  if (isTheme) {
    state.theme.content = THEME_PLACEHOLDER;
  } else {
    state.masters.content = MASTERS_PLACEHOLDER;
  }
  el.editor.value = getActiveEntry().content;
  persistWorkspace();
  render();
  notifySuccess(`Reset ${name} to the default placeholder.`);
}

function nodeNameSpan(name) {
  const span = document.createElement('span');
  span.className = 'node-name';
  span.textContent = name;
  return span;
}

function render() {
  el.themeList.innerHTML = '';
  el.fileList.innerHTML = '';

  for (const pinned of [state.theme, state.masters]) {
    const li = document.createElement('li');
    li.dataset.name = pinned.name;
    const isActive = state.active === pinned.name;
    li.classList.toggle('active', isActive);
    li.classList.toggle('has-actions', isActive);
    li.classList.toggle('placeholder', isPinnedPlaceholder(pinned.name, pinned.content));
    if (isActive) {
      li.appendChild(el.nodeActions);
    } else {
      li.appendChild(nodeNameSpan(pinned.name));
    }
    li.addEventListener('click', () => selectFile(pinned.name));
    el.themeList.appendChild(li);
  }

  for (const name of sortedSlideNames()) {
    const li = document.createElement('li');
    li.dataset.name = name;
    li.className = 'slide-item';
    const isActive = state.active === name;
    li.classList.toggle('active', isActive);
    li.classList.toggle('has-actions', isActive);
    if (isActive) {
      li.appendChild(el.nodeActions);
    } else {
      li.appendChild(nodeNameSpan(name));
    }
    li.addEventListener('click', () => selectFile(name));
    el.fileList.appendChild(li);
  }

  const entry = getActiveEntry();
  el.activeFilename.textContent = entry ? entry.name : '';
  if (entry && document.activeElement !== el.editor) {
    el.editor.value = entry.content;
  }

  const isPinned = isPinnedName(state.active);
  el.discardBtn.style.display = isPinned ? 'none' : '';
  el.resetBtn.style.display = isPinned ? '' : 'none';
  el.moveBtn.style.display = isPinned ? 'none' : '';
  el.copyBtn.style.display = isPinned ? 'none' : '';
  el.filenameGroup.classList.toggle('renamable', !isPinned);
  el.nodeActionsButtons.style.display = renaming ? 'none' : '';
  if (!renaming) {
    el.activeFilename.style.display = '';
    el.renameInput.style.display = 'none';
    el.renameExt.style.display = 'none';
    el.renameBtn.style.display = isPinned ? 'none' : '';
  }
}

function selectFile(name) {
  state.active = name;
  const entry = getActiveEntry();
  el.editor.value = entry ? entry.content : '';
  render();
}

// Adds a new entry, or replaces an existing entry's content in place
// (same sidebar position) when the name already exists. Returns false
// (and reports a status message) for anything not ending in `.js`.
function addOrReplaceFile(name, content) {
  if (!/\.js$/i.test(name)) {
    notifyError(`"${name}" was not loaded — only .js files are supported.`);
    return false;
  }

  if (name === THEME_NAME) {
    state.theme.content = content;
  } else if (name === MASTERS_NAME) {
    state.masters.content = content;
  } else if (state.slides.has(name)) {
    state.slides.get(name).content = content;
  } else {
    state.slides.set(name, { name, content });
  }

  if (state.active === name) {
    el.editor.value = content;
  }
  render();
  persistWorkspace();
  return true;
}

// Imports a dropped/selected .zip: the archive's filename (minus .zip) names
// the target workspace. No matching workspace -> create it directly. A
// matching workspace -> confirm before merging (replace/add files) into it.
// Either way, the resulting workspace becomes active.
async function importZipFile(file) {
  const targetName = file.name.replace(/\.zip$/i, '');
  let files;
  try {
    files = await readWorkspaceZip(file);
  } catch (err) {
    notifyError(`Import failed — could not read "${file.name}": ${err.message}`);
    return;
  }

  if (!workspaceExists(targetName)) {
    writeWorkspace(targetName, files);
    setActiveWorkspaceName(targetName);
    applyWorkspace(targetName, files);
    renderWorkspaceSelect();
    render();
    notifySuccess(`Imported "${targetName}".`);
    return;
  }

  const existing = readWorkspace(targetName) || {};
  if (window.confirm(`"${targetName}" already exists. Merge the imported files into it?`)) {
    const merged = { ...existing, ...files };
    writeWorkspace(targetName, merged);
    setActiveWorkspaceName(targetName);
    applyWorkspace(targetName, merged);
    notifySuccess(`Merged import into "${targetName}".`);
  } else {
    setActiveWorkspaceName(targetName);
    applyWorkspace(targetName, existing);
    notifyInfo(`Switched to "${targetName}" — import cancelled.`);
  }
  renderWorkspaceSelect();
  render();
}

async function handleFiles(fileList) {
  for (const file of fileList) {
    if (/\.zip$/i.test(file.name)) {
      await importZipFile(file);
      continue;
    }
    const text = await file.text();
    addOrReplaceFile(file.name, text);
  }
}

function sanitizeOutputName(raw) {
  const cleaned = (raw || '').trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/^\.+/, '');
  return cleaned || 'deck';
}

function timestampSuffix() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`;
}

// Forge/export output base name derives from the active workspace's
// (sanitized) name; the timestamp toggle appends a suffix on top of it.
function outputBaseName() {
  const base = sanitizeOutputName(state.workspaceName);
  return el.timestampToggle.checked ? `${base} ${timestampSuffix()}` : base;
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadActiveFile() {
  const entry = getActiveEntry();
  if (!entry) return;
  entry.content = el.editor.value;
  const blob = new Blob([entry.content], { type: 'text/javascript' });
  triggerDownload(blob, entry.name);
  notifySuccess(`Downloaded ${entry.name}`);
}

async function exportWorkspace() {
  const entry = getActiveEntry();
  if (entry) entry.content = el.editor.value;
  try {
    const blob = await exportWorkspaceZip({
      theme: state.theme,
      masters: state.masters,
      slides: sortedSlideNames().map((name) => state.slides.get(name)),
    });
    triggerDownload(blob, `${sanitizeOutputName(state.workspaceName)}.zip`);
    notifySuccess(`Exported ${state.workspaceName}.zip`);
  } catch (err) {
    notifyError(`Export failed: ${err.message}`);
  }
}

function discardActiveFile() {
  if (isPinnedName(state.active)) return;
  const name = state.active;
  if (!window.confirm(`Discard ${name}? This cannot be undone.`)) return;
  state.slides.delete(name);
  state.active = THEME_NAME;
  render();
  persistWorkspace();
  notifySuccess(`Discarded ${name}`);
}

function basenameOf(name) {
  return name.replace(/\.js$/i, '');
}

function startRename() {
  if (isPinnedName(state.active) || renaming) return;
  renaming = true;
  el.renameInput.value = basenameOf(state.active);
  el.activeFilename.style.display = 'none';
  el.renameBtn.style.display = 'none';
  el.nodeActionsButtons.style.display = 'none';
  el.renameInput.style.display = 'inline-block';
  el.renameExt.style.display = 'inline';
  el.renameInput.focus();
  el.renameInput.select();
}

function exitRenameMode() {
  renaming = false;
  el.renameInput.style.display = 'none';
  el.renameExt.style.display = 'none';
  el.activeFilename.style.display = '';
  render();
}

function cancelRename() {
  if (!renaming) return;
  exitRenameMode();
}

// keepEditingOnFailure: true while the user can still type (Enter key) —
// stays in the input so they can fix the name. false on blur, where focus
// is already gone, so an invalid name just reverts.
function commitRename(keepEditingOnFailure) {
  if (!renaming) return;
  const oldName = state.active;
  const oldBase = basenameOf(oldName);
  const newBase = el.renameInput.value.trim();

  if (newBase === oldBase) {
    exitRenameMode();
    return;
  }

  // Only notify on the Enter-key path: on blur, the input already showed
  // this exact error once (from a prior Enter press) and is now just
  // silently reverting, per the comment above — re-notifying here would
  // duplicate the toast every time focus leaves a still-invalid input.
  const fail = (message) => {
    if (keepEditingOnFailure) {
      notifyError(`Rename failed — ${message}`);
      el.renameInput.focus();
      el.renameInput.select();
    } else {
      exitRenameMode();
    }
  };

  if (!newBase) return fail('a name is required.');
  if (/[\\/]/.test(newBase)) return fail('the name cannot contain "/" or "\\".');

  const newName = `${newBase}.js`;
  if (isPinnedName(newName)) return fail(`"${newName}" is reserved.`);
  if (state.slides.has(newName)) return fail(`"${newName}" already exists.`);

  const entry = state.slides.get(oldName);
  entry.name = newName;
  entry.content = el.editor.value;
  state.slides.delete(oldName);
  state.slides.set(newName, entry);
  state.active = newName;
  exitRenameMode();
  persistWorkspace();
  notifySuccess(`Renamed ${oldName} → ${newName}`);
}

async function forge() {
  // Sync the in-progress edit of the active file before compiling.
  const entry = getActiveEntry();
  if (entry) entry.content = el.editor.value;

  const slideNames = sortedSlideNames();
  if (slideNames.length === 0) {
    notifyError('Forge needs at least one slide file — add one first.');
    return;
  }

  const outputName = outputBaseName();
  el.forgeBtn.disabled = true;
  try {
    const blob = await compileDeck({
      theme: state.theme,
      masters: state.masters,
      slides: slideNames.map((name) => state.slides.get(name)),
      outputName,
    });
    triggerDownload(blob, `${outputName}.pptx`);
    notifySuccess(`Generated ${outputName}.pptx`);
  } catch (err) {
    // CompileError.message is already "file.js: <error>[ (file.js:line:col)]" —
    // log the full cause (with stack) to the console for devtools inspection,
    // and surface the same detail in the toast so the failure isn't just
    // "there's an error somewhere in this file" with no further clue.
    if (err instanceof CompileError) {
      console.error(err.message, err.cause);
      notifyError(`Failed in ${err.message}`);
    } else {
      console.error(err);
      notifyError(`Forge failed: ${err.message}`);
    }
  } finally {
    el.forgeBtn.disabled = false;
  }
}

function addBlankSlide() {
  let name;
  do {
    name = `slide-${String(newSlideCounter).padStart(2, '0')}.js`;
    newSlideCounter += 1;
  } while (state.slides.has(name));
  state.slides.set(name, { name, content: NEW_SLIDE_TEMPLATE });
  selectFile(name);
  persistWorkspace();
}

// --- Slide move/copy between workspaces ---

function otherWorkspaceNames() {
  return listWorkspaceNames().filter((name) => name !== state.workspaceName);
}

function workspaceHasFile(name, fileName) {
  const snapshot = readWorkspace(name);
  return Boolean(snapshot && Object.prototype.hasOwnProperty.call(snapshot, fileName));
}

function openTransferPicker(mode) {
  if (isPinnedName(state.active)) return;
  transferMode = mode;
  transferSlideName = state.active;
  el.transferOverlayTitle.textContent = mode === 'move'
    ? `Move "${transferSlideName}" to…`
    : `Copy "${transferSlideName}" to…`;
  el.transferTargetList.innerHTML = '';

  const targets = otherWorkspaceNames();
  if (targets.length === 0) {
    const li = document.createElement('li');
    li.className = 'disabled';
    li.textContent = 'No other workspaces exist yet.';
    el.transferTargetList.appendChild(li);
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
    el.transferTargetList.appendChild(li);
  }

  el.transferOverlay.classList.add('visible');
}

function closeTransferPicker() {
  el.transferOverlay.classList.remove('visible');
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
  if (state.active === name) entry.content = el.editor.value;

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

// Single shared listener, gated by which overlay currently has .visible,
// rather than three near-duplicate listeners: Escape closes whichever of
// the three overlays is open, and Left/Right additionally pages the help
// modal when it's the one that's open.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (isHelpOpen()) {
      e.preventDefault();
      closeHelp();
    } else if (el.aiOverlay.classList.contains('visible')) {
      e.preventDefault();
      el.aiOverlay.classList.remove('visible');
    } else if (el.transferOverlay.classList.contains('visible')) {
      e.preventDefault();
      closeTransferPicker();
    }
    return;
  }

  if (!isHelpOpen()) return;
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    nextHelpScreen();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevHelpScreen();
  }
});

el.editor.addEventListener('input', () => {
  const entry = getActiveEntry();
  if (!entry) return;
  entry.content = el.editor.value;
  if (entry === state.theme || entry === state.masters) {
    // Re-render just enough to update the placeholder/muted styling.
    render();
  }
  persistWorkspace();
});

el.addSlideBtn.addEventListener('click', addBlankSlide);
el.resetBtn.addEventListener('click', resetPinnedFile);
el.loadFilesBtn.addEventListener('click', () => el.fileInput.click());
el.fileInput.addEventListener('change', async (e) => {
  await handleFiles(e.target.files);
  e.target.value = '';
});
el.downloadBtn.addEventListener('click', downloadActiveFile);
el.discardBtn.addEventListener('click', discardActiveFile);
el.filenameGroup.addEventListener('click', startRename);
// node-actions is reparented into the active tree row on every render(); its
// clicks must not bubble to that row's own click->selectFile listener.
el.nodeActions.addEventListener('click', (e) => e.stopPropagation());
el.renameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    commitRename(true);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    cancelRename();
  }
});
el.renameInput.addEventListener('blur', () => commitRename(false));
el.forgeBtn.addEventListener('click', forge);
el.aiBtn.addEventListener('click', copyAiReference);
el.aiOverlayClose.addEventListener('click', () => el.aiOverlay.classList.remove('visible'));
el.aiOverlay.addEventListener('click', (e) => {
  if (e.target === el.aiOverlay) el.aiOverlay.classList.remove('visible');
});

el.workspaceSelect.addEventListener('change', () => switchWorkspace(el.workspaceSelect.value));
el.workspaceNewBtn.addEventListener('click', createWorkspace);
el.workspaceDeleteBtn.addEventListener('click', deleteActiveWorkspace);
el.workspaceExportBtn.addEventListener('click', exportWorkspace);
el.workspaceImportBtn.addEventListener('click', () => el.fileInput.click());
el.workspaceRenameBtn.addEventListener('click', startWorkspaceRename);
el.workspaceRenameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    commitWorkspaceRename(true);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    cancelWorkspaceRename();
  }
});
el.workspaceRenameInput.addEventListener('blur', () => commitWorkspaceRename(false));

el.moveBtn.addEventListener('click', () => openTransferPicker('move'));
el.copyBtn.addEventListener('click', () => openTransferPicker('copy'));
el.transferOverlayClose.addEventListener('click', closeTransferPicker);
el.transferOverlay.addEventListener('click', (e) => {
  if (e.target === el.transferOverlay) closeTransferPicker();
});

let dragDepth = 0;
window.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dragDepth += 1;
  el.dropOverlay.classList.add('visible');
});
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('dragleave', () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) el.dropOverlay.classList.remove('visible');
});
window.addEventListener('drop', async (e) => {
  e.preventDefault();
  dragDepth = 0;
  el.dropOverlay.classList.remove('visible');
  if (e.dataTransfer && e.dataTransfer.files.length) {
    await handleFiles(e.dataTransfer.files);
  }
});

// Checked before restoreOrCreateActiveWorkspace() runs, since that call
// unconditionally auto-creates a default workspace and would otherwise make
// "no workspace yet" unobservable by the time we could check for it.
const isFirstVisit = !hasAnyWorkspaceData();

if (VERSION) el.appVersion.textContent = `v${VERSION}`;

restoreOrCreateActiveWorkspace();
renderWorkspaceSelect();
render();
maybeAutoOpenHelp(isFirstVisit);
