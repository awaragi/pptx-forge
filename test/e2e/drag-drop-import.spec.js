import { test, expect } from '@playwright/test';
import JSZip from 'jszip';
import { gotoApp, slideModule, DEFAULT_THEME, DEFAULT_MASTERS } from './fixtures.js';
import { dropFiles } from './helpers/drag-drop.js';

async function buildWorkspaceZip(slides) {
  const zip = new JSZip();
  zip.file('theme.js', DEFAULT_THEME);
  zip.file('masters.js', DEFAULT_MASTERS);
  for (const [name, content] of Object.entries(slides)) zip.file(`slides/${name}`, content);
  return zip.generateAsync({ type: 'nodebuffer' });
}

test('dropping a .js file adds it as a new slide', async ({ page }) => {
  await gotoApp(page);

  await dropFiles(page, [{ name: 'slide-02.js', content: slideModule('Dropped slide') }]);

  await expect(page.locator('#file-list li[data-name="slide-02.js"]')).toBeVisible();
});

test('dropping a .zip named after a workspace that does not exist creates it', async ({ page }) => {
  await gotoApp(page, { workspaceName: 'Untitled' });
  const zipBuffer = await buildWorkspaceZip({ 'imported.js': slideModule('From zip') });

  await dropFiles(page, [{ name: 'Imported.zip', content: zipBuffer }]);

  await expect(page.locator('#workspace-select')).toHaveValue('Imported');
  await expect(page.locator('#file-list li[data-name="imported.js"]')).toBeVisible();
});

test('dropping a .zip named after an existing workspace merges on confirm', async ({ page }) => {
  await gotoApp(page, {
    workspaceName: 'Untitled',
    files: { 'existing.js': slideModule('Kept') },
  });
  const zipBuffer = await buildWorkspaceZip({ 'imported.js': slideModule('Merged in') });

  page.once('dialog', (dialog) => dialog.accept());
  await dropFiles(page, [{ name: 'Untitled.zip', content: zipBuffer }]);

  await expect(page.locator('#workspace-select')).toHaveValue('Untitled');
  await expect(page.locator('#file-list li[data-name="existing.js"]')).toBeVisible();
  await expect(page.locator('#file-list li[data-name="imported.js"]')).toBeVisible();
});

test('dropping a .zip named after an existing workspace leaves it unchanged when merge is declined', async ({ page }) => {
  await gotoApp(page, {
    workspaceName: 'Untitled',
    files: { 'existing.js': slideModule('Kept') },
  });
  const zipBuffer = await buildWorkspaceZip({ 'imported.js': slideModule('Should not appear') });

  page.once('dialog', (dialog) => dialog.dismiss());
  await dropFiles(page, [{ name: 'Untitled.zip', content: zipBuffer }]);

  await expect(page.locator('#workspace-select')).toHaveValue('Untitled');
  await expect(page.locator('#file-list li[data-name="existing.js"]')).toBeVisible();
  await expect(page.locator('#file-list li[data-name="imported.js"]')).toHaveCount(0);
});
