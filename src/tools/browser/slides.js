// Slide/file CRUD (add, replace, discard, download, export, forge) and the
// zip import path that can create/merge a whole workspace at once.
import { compileDeck, CompileError, exportWorkspaceZip, readWorkspaceZip } from './compile.js';
import { workspaceExists, writeWorkspace, setActiveWorkspaceName, readWorkspace } from './storage.js';
import {
  state,
  THEME_NAME,
  MASTERS_NAME,
  THEME_PLACEHOLDER,
  MASTERS_PLACEHOLDER,
  isPinnedName,
  sortedSlideNames,
  getActiveEntry,
  persistWorkspace,
  applyWorkspace,
} from './state.js';
import { el } from './elements.js';
import { render, selectFile } from './view.js';
import { renderWorkspaceSelect } from './workspace.js';
import { notifySuccess, notifyError, notifyInfo } from './notifications.js';

const NEW_SLIDE_TEMPLATE = `export default function (pptx, lib) {
  const { theme, prim, comp, tables, layout, frame } = lib;
  const slide = pptx.addSlide();

  prim.text(slide, { x: 0.5, y: 0.4, w: 9, h: 0.6 }, 'New slide', { fontSize: theme.size.title, bold: true });
};
`;

let newSlideCounter = 1;

export function resetPinnedFile() {
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

// Adds a new entry, or replaces an existing entry's content in place
// (same sidebar position) when the name already exists. Returns false
// (and reports a status message) for anything not ending in `.js`.
export function addOrReplaceFile(name, content) {
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

export async function handleFiles(fileList) {
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

export function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadActiveFile() {
  const entry = getActiveEntry();
  if (!entry) return;
  entry.content = el.editor.value;
  const blob = new Blob([entry.content], { type: 'text/javascript' });
  triggerDownload(blob, entry.name);
  notifySuccess(`Downloaded ${entry.name}`);
}

export async function exportWorkspace() {
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

export function discardActiveFile() {
  if (isPinnedName(state.active)) return;
  const name = state.active;
  if (!window.confirm(`Discard ${name}? This cannot be undone.`)) return;
  state.slides.delete(name);
  state.active = THEME_NAME;
  render();
  persistWorkspace();
  notifySuccess(`Discarded ${name}`);
}

export async function forge() {
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

export function addBlankSlide() {
  let name;
  do {
    name = `slide-${String(newSlideCounter).padStart(2, '0')}.js`;
    newSlideCounter += 1;
  } while (state.slides.has(name));
  state.slides.set(name, { name, content: NEW_SLIDE_TEMPLATE });
  selectFile(name);
  persistWorkspace();
}
