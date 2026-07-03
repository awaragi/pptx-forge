import { compileDeck, CompileError } from './compile.js';

const THEME_NAME = 'theme.js';

const THEME_PLACEHOLDER = `export default {
  // PowerPoint theme slot hex values — injected into ppt/theme/theme1.xml.
  // Uncomment and edit to override the library's default colors.
  // scheme: {
  //   dk1: '111827', lt1: 'FFFFFF', dk2: '374151', lt2: 'F9FAFB',
  //   accent1: '86BC25',  // primary brand color
  //   accent2: 'EF4444',  // danger / highlight
  //   accent3: 'F59E0B',  // warning
  //   accent4: '5B9BD5',  // link / secondary
  //   accent5: '70AD47',  // subtle text
  //   accent6: 'A5A5A5',  // border grey
  // },

  // Semantic color names used in slide files.
  // color: { primary: 'accent1', ink: 'tx1', surface: 'bg1', bodyText: 'tx2', surfaceAlt: 'bg2', border: 'accent6' },

  // Header text shown in the top bar on every slide.
  // header: { wordmark: 'MY DECK', badge: 'TAG' },

  // Footer text shown in the bottom bar on every slide.
  // footer: { left: 'My Deck  |  Subtitle', right: 'Tag  •  Tag  •  Tag' },
};
`;

const NEW_SLIDE_TEMPLATE = `export default function (pptx, lib) {
  const { theme, prim, comp, tables, layout, frame } = lib;
  const slide = pptx.addSlide();

  prim.text(slide, { x: 0.5, y: 0.4, w: 9, h: 0.6 }, 'New slide', { fontSize: theme.size.title, bold: true });
};
`;

// State: theme is a fixed singleton entry; slides is a name-keyed map of
// { name, content } compiled/displayed in ascending filename order.
const state = {
  theme: { name: THEME_NAME, content: THEME_PLACEHOLDER },
  slides: new Map(),
  active: THEME_NAME,
};

let newSlideCounter = 1;
let renaming = false;

const el = {
  fileList: document.getElementById('file-list'),
  editor: document.getElementById('editor'),
  activeFilename: document.getElementById('active-filename'),
  filenameGroup: document.getElementById('filename-group'),
  renameInput: document.getElementById('rename-input'),
  renameExt: document.getElementById('rename-ext'),
  outputFilename: document.getElementById('output-filename'),
  forgeBtn: document.getElementById('forge-btn'),
  downloadBtn: document.getElementById('download-btn'),
  discardBtn: document.getElementById('discard-btn'),
  renameBtn: document.getElementById('rename-btn'),
  addSlideBtn: document.getElementById('add-slide-btn'),
  loadFilesBtn: document.getElementById('load-files-btn'),
  fileInput: document.getElementById('file-input'),
  dropOverlay: document.getElementById('drop-overlay'),
  statusBar: document.getElementById('status-bar'),
};

function isThemePlaceholder(content) {
  return content === THEME_PLACEHOLDER;
}

function sortedSlideNames() {
  return [...state.slides.keys()].sort((a, b) => a.localeCompare(b));
}

function getActiveEntry() {
  return state.active === THEME_NAME ? state.theme : state.slides.get(state.active);
}

function setStatus(message, isError = false) {
  el.statusBar.textContent = message || '';
  el.statusBar.classList.toggle('error', Boolean(isError));
}

function render() {
  el.fileList.innerHTML = '';

  const themeLi = document.createElement('li');
  themeLi.textContent = THEME_NAME;
  themeLi.dataset.name = THEME_NAME;
  themeLi.classList.toggle('active', state.active === THEME_NAME);
  themeLi.classList.toggle('placeholder', isThemePlaceholder(state.theme.content));
  themeLi.addEventListener('click', () => selectFile(THEME_NAME));
  el.fileList.appendChild(themeLi);

  for (const name of sortedSlideNames()) {
    const li = document.createElement('li');
    li.textContent = name;
    li.dataset.name = name;
    li.classList.toggle('active', state.active === name);
    li.addEventListener('click', () => selectFile(name));
    el.fileList.appendChild(li);
  }

  const entry = getActiveEntry();
  el.activeFilename.textContent = entry ? entry.name : '';
  if (entry && document.activeElement !== el.editor) {
    el.editor.value = entry.content;
  }

  const isTheme = state.active === THEME_NAME;
  el.discardBtn.style.display = isTheme ? 'none' : '';
  el.filenameGroup.classList.toggle('renamable', !isTheme);
  if (!renaming) {
    el.activeFilename.style.display = '';
    el.renameInput.style.display = 'none';
    el.renameExt.style.display = 'none';
    el.renameBtn.style.display = isTheme ? 'none' : '';
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
    setStatus(`"${name}" was not loaded — only .js files are supported.`, true);
    return false;
  }

  if (name === THEME_NAME) {
    state.theme.content = content;
  } else if (state.slides.has(name)) {
    state.slides.get(name).content = content;
  } else {
    state.slides.set(name, { name, content });
  }

  if (state.active === name) {
    el.editor.value = content;
  }
  render();
  return true;
}

async function handleFiles(fileList) {
  for (const file of fileList) {
    const text = await file.text();
    addOrReplaceFile(file.name, text);
  }
}

function sanitizeOutputName(raw) {
  const cleaned = (raw || '').trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/^\.+/, '');
  return cleaned || 'deck';
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
  setStatus(`Downloaded ${entry.name}`);
}

function discardActiveFile() {
  if (state.active === THEME_NAME) return;
  const name = state.active;
  if (!window.confirm(`Discard ${name}? This cannot be undone.`)) return;
  state.slides.delete(name);
  state.active = THEME_NAME;
  render();
  setStatus(`Discarded ${name}`);
}

function basenameOf(name) {
  return name.replace(/\.js$/i, '');
}

function startRename() {
  if (state.active === THEME_NAME || renaming) return;
  renaming = true;
  el.renameInput.value = basenameOf(state.active);
  el.activeFilename.style.display = 'none';
  el.renameBtn.style.display = 'none';
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

  const fail = (message) => {
    setStatus(`Rename failed — ${message}`, true);
    if (keepEditingOnFailure) {
      el.renameInput.focus();
      el.renameInput.select();
    } else {
      exitRenameMode();
    }
  };

  if (!newBase) return fail('a name is required.');
  if (/[\\/]/.test(newBase)) return fail('the name cannot contain "/" or "\\".');

  const newName = `${newBase}.js`;
  if (newName === THEME_NAME) return fail(`"${THEME_NAME}" is reserved.`);
  if (state.slides.has(newName)) return fail(`"${newName}" already exists.`);

  const entry = state.slides.get(oldName);
  entry.name = newName;
  entry.content = el.editor.value;
  state.slides.delete(oldName);
  state.slides.set(newName, entry);
  state.active = newName;
  exitRenameMode();
  setStatus(`Renamed ${oldName} → ${newName}`);
}

async function forge() {
  // Sync the in-progress edit of the active file before compiling.
  const entry = getActiveEntry();
  if (entry) entry.content = el.editor.value;

  const slideNames = sortedSlideNames();
  if (slideNames.length === 0) {
    setStatus('Forge needs at least one slide file — add one first.', true);
    return;
  }

  const outputName = sanitizeOutputName(el.outputFilename.value);
  el.forgeBtn.disabled = true;
  setStatus('Forging…');
  try {
    const blob = await compileDeck({
      theme: state.theme,
      slides: slideNames.map((name) => state.slides.get(name)),
      outputName,
    });
    triggerDownload(blob, `${outputName}.pptx`);
    setStatus(`Generated ${outputName}.pptx`);
  } catch (err) {
    if (err instanceof CompileError) {
      setStatus(`Failed in ${err.fileName}: ${err.cause && err.cause.message ? err.cause.message : err.cause}`, true);
    } else {
      setStatus(`Forge failed: ${err.message}`, true);
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
}

el.editor.addEventListener('input', () => {
  const entry = getActiveEntry();
  if (!entry) return;
  entry.content = el.editor.value;
  if (entry === state.theme) {
    // Re-render just enough to update the placeholder/muted styling.
    render();
  }
});

el.addSlideBtn.addEventListener('click', addBlankSlide);
el.loadFilesBtn.addEventListener('click', () => el.fileInput.click());
el.fileInput.addEventListener('change', async (e) => {
  await handleFiles(e.target.files);
  e.target.value = '';
});
el.downloadBtn.addEventListener('click', downloadActiveFile);
el.discardBtn.addEventListener('click', discardActiveFile);
el.filenameGroup.addEventListener('click', startRename);
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
el.renameInput.addEventListener('input', () => {
  if (el.statusBar.classList.contains('error')) setStatus('');
});
el.forgeBtn.addEventListener('click', forge);

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

render();
