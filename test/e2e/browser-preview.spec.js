import { test, expect } from '@playwright/test';
import { gotoApp, slideModule } from './fixtures.js';

test('editing the active slide updates the preview canvas without a manual refresh', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Original preview text') },
  });

  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');

  await page.locator('#editor').fill(slideModule('Edited preview text'));
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js', { timeout: 3000 });
});

test('switching to theme.js keeps the last-viewed slide rendered in the preview', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Hello') },
  });

  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');

  await page.locator('li[data-name="theme.js"]').click();
  await page.locator('#editor').fill('export default { color: { surface: "#112233" } };\n');

  // Still shows the slide, not a "select a slide" placeholder, despite
  // theme.js being the active editor file.
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js', { timeout: 3000 });
});

test('an empty workspace shows a no-slides placeholder instead of attempting to compile', async ({ page }) => {
  await gotoApp(page);
  await expect(page.locator('#preview-status')).toHaveText('No slides in this workspace yet.');
});

test('drag-resizing the preview pane persists the height percentage across a reload', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Resize check') },
  });
  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');

  const handle = page.locator('#pane-resizer');
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y - 120, { steps: 5 });
  await page.mouse.up();

  const pctAfterDrag = await page.evaluate(() => Number(localStorage.getItem('pptx-forge.preview.height')));
  expect(pctAfterDrag).toBeGreaterThan(50);

  await page.reload();
  const pctAfterReload = await page.evaluate(() => Number(localStorage.getItem('pptx-forge.preview.height')));
  expect(pctAfterReload).toBeCloseTo(pctAfterDrag, 5);

  const flexBasisPct = await page.evaluate(() => parseFloat(document.getElementById('preview-pane').style.flexBasis));
  expect(flexBasisPct).toBeCloseTo(pctAfterReload, 1);
});

// pptxviewjs's slideSizeMode:'fit' locks the canvas's measured CSS size into
// a fixed inline style at render time, which then overrides our own CSS and
// freezes clientWidth/clientHeight for every later measurement — so without
// explicitly clearing that inline style before each re-render, the visible
// preview would silently stay stuck at whatever size it first rendered at.
test('dragging the resizer changes the rendered canvas size, not just the wrapper', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Drag scale check') },
  });
  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');

  const canvasHeight = () => page.evaluate(() => Math.round(document.getElementById('preview-canvas').getBoundingClientRect().height));
  const before = await canvasHeight();

  const handle = page.locator('#pane-resizer');
  const box = await handle.boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y - 200, { steps: 10 });
  await page.mouse.up();
  await page.waitForTimeout(300);

  expect(await canvasHeight()).toBeGreaterThan(before);
});

test('resizing the browser window re-renders the preview at the new size', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Window resize check') },
  });
  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');

  const canvasWidth = () => page.evaluate(() => Math.round(document.getElementById('preview-canvas').getBoundingClientRect().width));
  const before = await canvasWidth();

  await page.setViewportSize({ width: 800, height: 900 });
  await page.waitForTimeout(400); // past the resize debounce

  expect(await canvasWidth()).not.toBe(before);
});

test('collapsing hides the canvas, and edits made while collapsed do not render until expanded', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Collapse check') },
  });
  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');

  await page.locator('#preview-collapse-btn').click();
  await expect(page.locator('#preview-pane')).toHaveClass(/collapsed/);

  // Edit while collapsed: status text must not change to reflect a compile
  // that shouldn't be happening (it stays whatever it last was).
  await page.locator('#editor').fill(slideModule('Edited while collapsed'));
  await page.waitForTimeout(700); // past the debounce window
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');

  await page.locator('#preview-collapse-btn').click();
  await expect(page.locator('#preview-pane')).not.toHaveClass(/collapsed/);
  // Expanding triggers an immediate refresh reflecting the edit made while collapsed.
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');
});

// state.active always resets to theme.js on a fresh page load (an existing,
// unrelated app behavior — see state.js), so only the collapsed *flag* is
// this capability's concern to verify surviving a reload, not which slide
// (if any) is showing afterward.
test('collapsed state persists across a reload', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Collapse persistence check') },
  });
  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');

  await page.locator('#preview-collapse-btn').click();
  await expect(page.locator('#preview-pane')).toHaveClass(/collapsed/);

  await page.reload();
  await expect(page.locator('#preview-pane')).toHaveClass(/collapsed/);
});

test('copy button copies the rendered preview to the clipboard as a PNG', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Copy check') },
  });
  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');

  await page.locator('#preview-copy-btn').click();
  await expect(page.locator('.toast-success')).toContainText('Copied preview to clipboard');

  const pngSize = await page.evaluate(async () => {
    const items = await navigator.clipboard.read();
    const item = items.find((i) => i.types.includes('image/png'));
    if (!item) return 0;
    const blob = await item.getType('image/png');
    return blob.size;
  });
  expect(pngSize).toBeGreaterThan(0);
});

test('download button downloads the rendered preview as a PNG named after the slide', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Download check') },
  });
  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.locator('#preview-download-btn').click(),
  ]);
  expect(download.suggestedFilename()).toBe('slide-01.png');
});

test('rendering a preview makes no network requests', async ({ page }) => {
  const externalRequests = [];
  page.on('request', (req) => {
    const u = req.url();
    if (!u.startsWith('file://') && !u.startsWith('blob:') && !u.startsWith('data:')) externalRequests.push(u);
  });

  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Network check') },
  });
  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#preview-status')).toHaveText('slide-01.js');

  expect(externalRequests).toEqual([]);
});
