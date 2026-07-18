// Renders a compiled .pptx buffer to one PNG per slide, using the same
// pptxviewjs canvas renderer the browser preview pane (src/tools/browser/preview.js)
// uses, driven headlessly via playwright-core's chromium-headless-shell so
// exported images stay visually consistent with the in-app preview.
//
// pptxviewjs's browser dist is a UMD build that treats chart.js and jszip as
// externals (it expects window.Chart / window.JSZip already present rather
// than bundling them) — chart.js's and jszip's own package.json "exports"
// maps don't allow deep-importing their UMD dist files via Node module
// resolution, so paths are built directly from this project's own
// node_modules rather than resolved through import/require.
import { chromium } from 'playwright-core';
import { join } from 'path';
import { fileURLToPath } from 'url';

const projectRoot = fileURLToPath(new URL('../..', import.meta.url));
const CHART_UMD = join(projectRoot, 'node_modules/chart.js/dist/chart.umd.min.js');
const JSZIP_UMD = join(projectRoot, 'node_modules/jszip/dist/jszip.min.js');
const PPTXVIEWJS_UMD = join(projectRoot, 'node_modules/pptxviewjs/dist/PptxViewJS.min.js');

// Matches the standard 16:9 slide geometry set in src/lib/render.js
// (13.333in x 7.5in) at a 144dpi-equivalent pixel size.
const RENDER_WIDTH = 1920;
const RENDER_HEIGHT = 1080;

// pptxviewjs's 'fit' sizing reads canvas.style.width/height via parseFloat()
// and treats the numeric result as pixels regardless of unit — a "100%"
// inline style parses to 100 (i.e. 100px), not the intended full-width size.
// Pixel values sidestep that entirely.
const PAGE_HTML = `<!doctype html>
<html><body style="margin:0">
<canvas id="c" style="width:${RENDER_WIDTH}px;height:${RENDER_HEIGHT}px;display:block"></canvas>
</body></html>`;

export class BrowserNotInstalledError extends Error {
  constructor(cause) {
    super(
      'chromium-headless-shell is not installed.\n'
      + 'Run: npx playwright install chromium-headless-shell',
    );
    this.name = 'BrowserNotInstalledError';
    this.cause = cause;
  }
}

// Playwright's launch() error for a missing browser binary always includes
// this phrase, regardless of which browser/channel was requested.
export function isMissingExecutableError(err) {
  return /executable doesn't exist/i.test(err?.message || '');
}

// Renders every slide in `pptxBuffer` to a PNG, returning an array of
// Buffers in slide order. Launches one browser/page and reuses it across
// all slides in the deck rather than relaunching per slide.
export async function renderSlidesToImages(pptxBuffer) {
  let browser;
  try {
    browser = await chromium.launch({ headless: true, channel: 'chromium-headless-shell' });
  } catch (err) {
    if (isMissingExecutableError(err)) throw new BrowserNotInstalledError(err);
    throw err;
  }

  try {
    const page = await browser.newPage();
    await page.setContent(PAGE_HTML);
    await page.addScriptTag({ path: CHART_UMD });
    await page.addScriptTag({ path: JSZIP_UMD });
    await page.addScriptTag({ path: PPTXVIEWJS_UMD });

    const base64 = pptxBuffer.toString('base64');
    const slideCount = await page.evaluate(async (b64) => {
      const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
      const canvas = document.getElementById('c');
      window.__viewer = new window.PptxViewJS.PPTXViewer({ canvas, slideSizeMode: 'fit' });
      await window.__viewer.loadFile(bytes.buffer);
      return window.__viewer.getSlideCount();
    }, base64);

    const images = [];
    for (let i = 0; i < slideCount; i++) {
      const dataUrl = await page.evaluate(async (index) => {
        await window.__viewer.goToSlide(index);
        return document.getElementById('c').toDataURL('image/png');
      }, i);
      images.push(Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64'));
    }
    return images;
  } finally {
    await browser.close();
  }
}
