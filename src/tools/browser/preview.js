// Live preview pane under the slide editor. Compiles just the active slide
// file (theme.js/masters.js + one slide) via the existing compileDeck
// pipeline, then renders the resulting .pptx with pptxviewjs onto a canvas.
// Self-wires its own DOM listeners (resize handle, collapse/copy/download
// buttons) at import time, the same convention dragdrop.js uses.
//
// `pptxviewjs` is dynamically imported (inside getViewer(), lazily) rather
// than statically at the top of this module: it pulls in chart.js/auto,
// which self-registers its entire controller/scale/plugin set as a side
// effect of being imported, at real cost, every time. Since preview.js is
// imported unconditionally by app.js on every page load, a static import
// here would pay that cost on every load/reload even when no preview is
// ever rendered — this measurably slowed down page bootstrap enough to
// destabilize an unrelated, timing-sensitive test (drag-drop-import.spec.js)
// when run back-to-back. The dynamic import defers it to the first actual
// compile, so pages that never touch the preview never pay for it.
import { compileDeck, CompileError } from './compile.js';
import { state } from './state.js';
import { el } from './elements.js';
import { triggerDownload } from './slides.js';
import { notifySuccess, notifyError } from './notifications.js';
import { getPreviewVisible, setPreviewVisible, getPreviewHeightPct, setPreviewHeightPct } from './storage.js';
import { pickPreviewSlideName } from './preview-logic.js';

const DEBOUNCE_MS = 450;
const MIN_PANE_PX = 80;
const MIN_HEIGHT_PCT = 10;
const MAX_HEIGHT_PCT = 90;

let debounceHandle = null;
let generation = 0;
let viewer = null;
let lastViewedSlideName = null;
let collapsed = !getPreviewVisible();
let heightPct = clampPct(getPreviewHeightPct());

function clampPct(pct) {
  return Math.min(MAX_HEIGHT_PCT, Math.max(MIN_HEIGHT_PCT, pct));
}

async function getViewer() {
  if (!viewer) {
    const { PPTXViewer } = await import('pptxviewjs');
    viewer = new PPTXViewer({ canvas: el.previewCanvas, slideSizeMode: 'fit' });
  }
  return viewer;
}

// pptxviewjs's `slideSizeMode: 'fit'` measures the canvas's CSS box once per
// render() call, then locks that measurement in as a fixed inline
// `style="width:...px;height:...px"` on the canvas — which then overrides
// our own CSS (`width:100%;height:100%`) permanently, so every later
// measurement (even from a fresh render() call) just reads back the same
// frozen value instead of the wrapper's real current size. Clearing the
// inline style before every render lets our CSS re-establish the true
// current size for pptxviewjs to measure.
function clearCanvasInlineSize() {
  el.previewCanvas.style.removeProperty('width');
  el.previewCanvas.style.removeProperty('height');
}

// Re-renders the already-loaded slide at whatever size the canvas's wrapper
// currently is — no recompile, just a fresh draw. No-ops if nothing has
// been rendered yet (nothing loaded into the viewer to re-render).
function reRenderAtCurrentSize() {
  if (!viewer) return;
  clearCanvasInlineSize();
  viewer.render();
}

function setStatus(text, isError = false) {
  el.previewStatus.textContent = text;
  el.previewStatus.classList.toggle('is-error', isError);
}

// Resolves which slide to preview: the active slide file if one is open, or
// the last-viewed slide (with its saved content) if theme.js/masters.js is
// active instead. Returns null if there's nothing to preview at all.
function resolvePreviewEntry() {
  if (state.slides.has(state.active)) lastViewedSlideName = state.active;
  const name = pickPreviewSlideName(state.active, [...state.slides.keys()], lastViewedSlideName);
  if (!name) {
    lastViewedSlideName = null;
    return null;
  }
  if (name === state.active) return { name, content: el.editor.value };
  return { name, content: state.slides.get(name).content };
}

export function schedulePreviewUpdate() {
  if (collapsed) return;
  clearTimeout(debounceHandle);
  debounceHandle = setTimeout(updatePreviewNow, DEBOUNCE_MS);
}

export async function updatePreviewNow() {
  if (collapsed) return;
  const myGeneration = ++generation;
  const entry = resolvePreviewEntry();

  if (!entry) {
    setStatus(state.slides.size === 0 ? 'No slides in this workspace yet.' : 'Select a slide to preview.');
    return;
  }

  setStatus('Rendering…');
  try {
    const blob = await compileDeck({
      theme: state.theme,
      masters: state.masters,
      slides: [{ name: entry.name, content: entry.content }],
      outputName: 'preview',
    });
    if (myGeneration !== generation) return; // a newer edit superseded this one

    const buffer = await blob.arrayBuffer();
    const v = await getViewer();
    if (myGeneration !== generation) return;
    await v.loadFile(buffer);
    if (myGeneration !== generation) return;
    clearCanvasInlineSize();
    await v.render();
    setStatus(entry.name);
  } catch (err) {
    if (myGeneration !== generation) return;
    if (err instanceof CompileError) {
      console.error(err.message, err.cause);
      setStatus(err.message, true);
    } else {
      console.error(err);
      setStatus(`Preview failed: ${err.message}`, true);
    }
  }
}

// --- Collapse / expand -----------------------------------------------------

function applyExpandedHeight() {
  el.previewPane.style.flexBasis = `${heightPct}%`;
}

function setCollapsed(next) {
  collapsed = next;
  setPreviewVisible(!collapsed);
  el.previewPane.classList.toggle('collapsed', collapsed);
  el.paneResizer.style.display = collapsed ? 'none' : '';
  el.previewCollapseBtn.textContent = collapsed ? '▸' : '▾';
  el.previewCollapseBtn.title = collapsed ? 'Expand preview' : 'Collapse preview';
  el.previewCollapseBtn.setAttribute('aria-label', collapsed ? 'Expand preview' : 'Collapse preview');
  if (collapsed) {
    clearTimeout(debounceHandle);
  } else {
    applyExpandedHeight();
    updatePreviewNow();
  }
}

el.previewCollapseBtn.addEventListener('click', () => setCollapsed(!collapsed));

// --- Drag-resize ------------------------------------------------------------

let dragging = false;

el.paneResizer.addEventListener('pointerdown', (e) => {
  dragging = true;
  el.paneResizer.classList.add('dragging');
  el.paneResizer.setPointerCapture(e.pointerId);
});

// Re-rendering on every pointermove tick (which can fire far faster than
// the browser paints) would queue up redundant work; requestAnimationFrame
// collapses that down to at most one real render per painted frame, always
// using whatever the latest pointer position was by the time it fires.
let dragRenderScheduled = false;
function scheduleDragRender() {
  if (dragRenderScheduled) return;
  dragRenderScheduled = true;
  requestAnimationFrame(() => {
    dragRenderScheduled = false;
    reRenderAtCurrentSize();
  });
}

el.paneResizer.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const paneRect = el.previewPane.parentElement.getBoundingClientRect();
  const previewPx = paneRect.bottom - e.clientY;
  const clampedPx = Math.min(paneRect.height - MIN_PANE_PX, Math.max(MIN_PANE_PX, previewPx));
  heightPct = clampPct((clampedPx / paneRect.height) * 100);
  applyExpandedHeight();
  scheduleDragRender();
});

function endDrag(e) {
  if (!dragging) return;
  dragging = false;
  el.paneResizer.classList.remove('dragging');
  el.paneResizer.releasePointerCapture(e.pointerId);
  setPreviewHeightPct(heightPct);
  reRenderAtCurrentSize();
}

el.paneResizer.addEventListener('pointerup', endDrag);
el.paneResizer.addEventListener('pointercancel', endDrag);

// Resizing the browser window itself (not just dragging the divider) also
// changes the preview wrapper's size, so it needs the same re-render.
let resizeHandle = null;
window.addEventListener('resize', () => {
  if (collapsed) return;
  clearTimeout(resizeHandle);
  resizeHandle = setTimeout(reRenderAtCurrentSize, 150);
});

// --- Copy / download as PNG -------------------------------------------------

const clipboardImageSupported = !!(
  navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem !== 'undefined'
);
if (!clipboardImageSupported) {
  el.previewCopyBtn.style.display = 'none';
}

el.previewCopyBtn.addEventListener('click', async () => {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        'image/png': new Promise((resolve, reject) => {
          el.previewCanvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('toBlob failed'))), 'image/png');
        }),
      }),
    ]);
    notifySuccess('Copied preview to clipboard.');
  } catch (err) {
    console.error(err);
    notifyError(`Copy failed: ${err.message}`);
  }
});

el.previewDownloadBtn.addEventListener('click', () => {
  el.previewCanvas.toBlob((blob) => {
    if (!blob) {
      notifyError('Download failed: could not read the preview canvas.');
      return;
    }
    const entry = resolvePreviewEntry();
    const base = entry ? entry.name.replace(/\.js$/i, '') : 'preview';
    triggerDownload(blob, `${base}.png`);
    notifySuccess(`Downloaded ${base}.png`);
  }, 'image/png');
});

// --- Initial state -----------------------------------------------------------

el.previewPane.classList.toggle('collapsed', collapsed);
el.paneResizer.style.display = collapsed ? 'none' : '';
el.previewCollapseBtn.textContent = collapsed ? '▸' : '▾';
el.previewCollapseBtn.title = collapsed ? 'Expand preview' : 'Collapse preview';
if (!collapsed) applyExpandedHeight();
