// The "copy AI reference bundle to clipboard" overlay. Self-contained like
// help.js: queries its own DOM, wires its own listeners, and exposes only
// the small surface app.js needs for shared Escape-key coordination.
import { notifySuccess, notifyError } from './notifications.js';

// __AI_CHAT__, __INSTRUCTIONS__, __COMPONENTS__, and __LIB_DTS__ are injected at
// build time by scripts/build-browser.js (esbuild `define`) as raw file contents —
// assembly (headers, order, optional components splice) happens here, not in the
// build script.
const AI_CHAT = typeof __AI_CHAT__ === 'string' ? __AI_CHAT__ : '';
const INSTRUCTIONS = typeof __INSTRUCTIONS__ === 'string' ? __INSTRUCTIONS__ : '';
const COMPONENTS = typeof __COMPONENTS__ === 'string' ? __COMPONENTS__ : '';
const LIB_DTS = typeof __LIB_DTS__ === 'string' ? __LIB_DTS__ : '';

const el = {
  btn: document.getElementById('ai-btn'),
  componentsToggle: document.getElementById('ai-components-toggle'),
  overlay: document.getElementById('ai-overlay'),
  closeBtn: document.getElementById('ai-overlay-close'),
  textarea: document.getElementById('ai-reference-textarea'),
};

// Reads the toggle at call time (not persisted) — the checkbox's checked
// property is the sole source of truth for this state. Order is fixed:
// AI-CHAT, INSTRUCTIONS, COMPONENTS (optional), lib.d.ts.
// AI-CHAT.md/INSTRUCTIONS.md/COMPONENTS.md each already open with their own
// "# X.md — ..." heading, so no filename header is added for them here.
// lib.d.ts has no heading of its own, so it keeps a "# lib.d.ts" marker.
function assembleAiReference() {
  const parts = [AI_CHAT, INSTRUCTIONS];
  if (el.componentsToggle.checked) parts.push(COMPONENTS);
  parts.push(`# lib.d.ts\n\n${LIB_DTS}`);
  return parts.join('\n\n');
}

function showAiReferenceFallback() {
  el.textarea.value = assembleAiReference();
  el.overlay.classList.add('visible');
  el.textarea.focus();
  el.textarea.select();
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

export function isAiReferenceOpen() {
  return el.overlay.classList.contains('visible');
}

export function closeAiReference() {
  el.overlay.classList.remove('visible');
}

el.btn.addEventListener('click', copyAiReference);
el.closeBtn.addEventListener('click', closeAiReference);
el.overlay.addEventListener('click', (e) => {
  if (e.target === el.overlay) closeAiReference();
});
