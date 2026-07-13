// Sidebar tree + active-file editor rendering, and the active-file rename
// control. The single shared render() is called after every state mutation
// across the app (workspace switches, slide CRUD, edits, etc.).
import { state, isPinnedName, isPinnedPlaceholder, sortedSlideNames, getActiveEntry, persistWorkspace } from './state.js';
import { el } from './elements.js';
import { createInlineRename } from './inline-rename.js';
import { notifySuccess } from './notifications.js';

function nodeNameSpan(name) {
  const span = document.createElement('span');
  span.className = 'node-name';
  span.textContent = name;
  return span;
}

export function render() {
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
  const renaming = fileRename.isActive();
  el.nodeActionsButtons.style.display = renaming ? 'none' : '';
  if (!renaming) {
    el.activeFilename.style.display = '';
    el.renameInput.style.display = 'none';
    el.renameExt.style.display = 'none';
    el.renameBtn.style.display = isPinned ? 'none' : '';
  }
}

export function selectFile(name) {
  state.active = name;
  const entry = getActiveEntry();
  el.editor.value = entry ? entry.content : '';
  render();
}

function basenameOf(name) {
  return name.replace(/\.js$/i, '');
}

export const fileRename = createInlineRename({
  input: el.renameInput,
  displayEl: el.activeFilename,
  hideWhileEditing: [el.renameBtn, el.nodeActionsButtons],
  showWhileEditing: [el.renameExt],
  getCurrentValue: () => basenameOf(state.active),
  canStart: () => !isPinnedName(state.active),
  afterExit: render,
  validate(newBase) {
    if (!newBase) return 'a name is required.';
    if (/[\\/]/.test(newBase)) return 'the name cannot contain "/" or "\\".';
    const newName = `${newBase}.js`;
    if (isPinnedName(newName)) return `"${newName}" is reserved.`;
    if (state.slides.has(newName)) return `"${newName}" already exists.`;
    return null;
  },
  commit(oldBase, newBase) {
    const oldName = state.active;
    const newName = `${newBase}.js`;
    const entry = state.slides.get(oldName);
    entry.name = newName;
    entry.content = el.editor.value;
    state.slides.delete(oldName);
    state.slides.set(newName, entry);
    state.active = newName;
    persistWorkspace();
    notifySuccess(`Renamed ${oldName} → ${newName}`);
  },
});
