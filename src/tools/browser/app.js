// Composition root: wires shared state/view/feature modules to DOM events and
// bootstraps the app. Each feature (workspace switching, slide CRUD, the AI
// reference overlay, the transfer picker, drag-and-drop) lives in its own
// module — see state.js, view.js, workspace.js, slides.js, ai-reference.js,
// transfer.js, dragdrop.js.
import {
  setStorageFailureHandler,
  setNearingQuotaHandler,
  setExternalChangeHandler,
  hasAnyWorkspaceData,
} from './storage.js';
import { isHelpOpen, closeHelp, nextHelpScreen, prevHelpScreen, maybeAutoOpenHelp } from './help.js';
import { notifyInfo, notifyError } from './notifications.js';
import { getActiveEntry, persistWorkspace, restoreOrCreateActiveWorkspace, state } from './state.js';
import { el } from './elements.js';
import { render, fileRename, toggleTrashGroup } from './view.js';
import { renderWorkspaceSelect, switchWorkspace, createWorkspace, deleteActiveWorkspace, workspaceRename, handleExternalChange } from './workspace.js';
import { addBlankSlide, resetPinnedFile, handleFiles, downloadActiveFile, discardActiveFile, forge, exportWorkspace } from './slides.js';
import { emptyTrash } from './trash.js';
import { isAiReferenceOpen, closeAiReference } from './ai-reference.js';
import { isTransferOpen, closeTransferPicker } from './transfer.js';
import { schedulePreviewUpdate, updatePreviewNow } from './preview.js';
import './dragdrop.js';

// __VERSION__ is injected at build time by scripts/build-browser.js (esbuild `define`).
const VERSION = typeof __VERSION__ === 'string' ? __VERSION__ : '';

setStorageFailureHandler(() => {
  notifyError("Persistent storage unavailable — changes won't survive a reload.");
});

setNearingQuotaHandler(() => {
  notifyInfo('Storage is getting full — consider deleting unused workspaces.');
});

setExternalChangeHandler(handleExternalChange);

// Single shared listener, gated by which overlay currently has .visible,
// rather than three near-duplicate listeners: Escape closes whichever of
// the three overlays is open, and Left/Right additionally pages the help
// modal when it's the one that's open.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (isHelpOpen()) {
      e.preventDefault();
      closeHelp();
    } else if (isAiReferenceOpen()) {
      e.preventDefault();
      closeAiReference();
    } else if (isTransferOpen()) {
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
  schedulePreviewUpdate();
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
el.trashToggle.addEventListener('click', toggleTrashGroup);
el.emptyTrashBtn.addEventListener('click', emptyTrash);
el.filenameGroup.addEventListener('click', fileRename.start);
// node-actions is reparented into the active tree row on every render(); its
// clicks must not bubble to that row's own click->selectFile listener.
el.nodeActions.addEventListener('click', (e) => e.stopPropagation());
el.renameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    fileRename.commitValue(true);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    fileRename.cancel();
  }
});
el.renameInput.addEventListener('blur', () => fileRename.commitValue(false));
el.forgeBtn.addEventListener('click', forge);

el.workspaceSelect.addEventListener('change', () => switchWorkspace(el.workspaceSelect.value));
el.workspaceNewBtn.addEventListener('click', createWorkspace);
el.workspaceDeleteBtn.addEventListener('click', deleteActiveWorkspace);
el.workspaceExportBtn.addEventListener('click', exportWorkspace);
el.workspaceImportBtn.addEventListener('click', () => el.fileInput.click());
el.workspaceRenameBtn.addEventListener('click', workspaceRename.start);
el.workspaceRenameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    workspaceRename.commitValue(true);
  } else if (e.key === 'Escape') {
    e.preventDefault();
    workspaceRename.cancel();
  }
});
el.workspaceRenameInput.addEventListener('blur', () => workspaceRename.commitValue(false));

// Checked before restoreOrCreateActiveWorkspace() runs, since that call
// unconditionally auto-creates a default workspace and would otherwise make
// "no workspace yet" unobservable by the time we could check for it.
const isFirstVisit = !hasAnyWorkspaceData();

if (VERSION) el.appVersion.textContent = `v${VERSION}`;

restoreOrCreateActiveWorkspace();
renderWorkspaceSelect();
render();
updatePreviewNow();
maybeAutoOpenHelp(isFirstVisit);
