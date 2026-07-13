// Whole-window drag-and-drop import of .js/.zip files, self-wired like the
// overlay modules — the only external dependency is handleFiles (slides.js),
// which already knows how to route .zip vs .js drops.
import { handleFiles } from './slides.js';

const dropOverlay = document.getElementById('drop-overlay');

let dragDepth = 0;
window.addEventListener('dragenter', (e) => {
  e.preventDefault();
  dragDepth += 1;
  dropOverlay.classList.add('visible');
});
window.addEventListener('dragover', (e) => e.preventDefault());
window.addEventListener('dragleave', () => {
  dragDepth = Math.max(0, dragDepth - 1);
  if (dragDepth === 0) dropOverlay.classList.remove('visible');
});
window.addEventListener('drop', async (e) => {
  e.preventDefault();
  dragDepth = 0;
  dropOverlay.classList.remove('visible');
  if (e.dataTransfer && e.dataTransfer.files.length) {
    await handleFiles(e.dataTransfer.files);
  }
});
