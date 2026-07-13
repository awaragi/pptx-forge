import { test, expect } from '@playwright/test';
import { gotoApp, slideModule } from './fixtures.js';
import { downloadAsZip } from './helpers/download.js';

test('Forge produces a pptx containing the seeded slide content', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Hello E2E') },
  });

  const { zip } = await downloadAsZip(page, () => page.locator('#forge-btn').click());

  const slideFiles = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  expect(slideFiles.length).toBeGreaterThan(0);

  const slideXmls = await Promise.all(slideFiles.map((name) => zip.file(name).async('string')));
  expect(slideXmls.some((xml) => xml.includes('Hello E2E'))).toBe(true);
});

test('Forge with no slide files shows an error and downloads nothing', async ({ page }) => {
  await gotoApp(page);

  let downloaded = false;
  page.once('download', () => {
    downloaded = true;
  });

  await page.locator('#forge-btn').click();

  await expect(page.locator('.toast-error')).toContainText('at least one slide');
  expect(downloaded).toBe(false);
});
