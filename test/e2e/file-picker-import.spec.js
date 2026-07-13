import { test, expect } from '@playwright/test';
import { gotoApp, slideModule } from './fixtures.js';

test('selecting a new .js file adds it as a slide', async ({ page }) => {
  await gotoApp(page);

  await page.locator('#file-input').setInputFiles({
    name: 'slide-02.js',
    mimeType: 'text/javascript',
    buffer: Buffer.from(slideModule('New slide')),
  });

  await expect(page.locator('#file-list li[data-name="slide-02.js"]')).toBeVisible();
});

test('selecting a .js file matching an existing name replaces it in place', async ({ page }) => {
  await gotoApp(page, {
    files: {
      'slide-01.js': slideModule('First original'),
      'slide-02.js': slideModule('Second original'),
    },
  });

  await page.locator('#file-input').setInputFiles({
    name: 'slide-01.js',
    mimeType: 'text/javascript',
    buffer: Buffer.from(slideModule('First replaced')),
  });

  // Sidebar order is unaffected (sorted by name), and no duplicate entry appears.
  await expect(page.locator('#file-list li')).toHaveCount(2);
  const names = await page.locator('#file-list li').evaluateAll((els) => els.map((el) => el.dataset.name));
  expect(names).toEqual(['slide-01.js', 'slide-02.js']);

  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#editor')).toHaveValue(slideModule('First replaced'));
});

test('selecting a non-.js file is rejected', async ({ page }) => {
  await gotoApp(page);

  await page.locator('#file-input').setInputFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not a slide'),
  });

  await expect(page.locator('#file-list li')).toHaveCount(0);
  await expect(page.locator('.toast-error')).toContainText('only .js files are supported');
});
