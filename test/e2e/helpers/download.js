// Captures a download triggered by `trigger()` (a click on Forge/Export/etc.,
// which all go through triggerDownload()'s Blob-URL <a download> click in
// slides.js) and loads its contents as a jszip instance for real content
// assertions instead of just checking that a file appeared.
import { readFile } from 'node:fs/promises';
import JSZip from 'jszip';

export async function downloadAsZip(page, trigger) {
  const [download] = await Promise.all([page.waitForEvent('download'), trigger()]);
  const buffer = await readFile(await download.path());
  return { download, zip: await JSZip.loadAsync(buffer) };
}
