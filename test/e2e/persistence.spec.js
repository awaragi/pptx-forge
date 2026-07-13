import { test, expect } from '@playwright/test';
import { gotoApp, slideModule } from './fixtures.js';

test('an edited slide survives a page reload', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Original') },
  });

  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  const editedContent = slideModule('Edited after seed');
  await page.locator('#editor').fill(editedContent);
  // Blur so the app's own input-driven persistWorkspace() has definitely run.
  await page.locator('#editor').blur();

  await page.reload();

  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  await expect(page.locator('#editor')).toHaveValue(editedContent);
});

test('the active workspace survives a page reload', async ({ page }) => {
  await gotoApp(page, { workspaceName: 'First' });

  page.once('dialog', (dialog) => dialog.accept('Second'));
  await page.locator('#workspace-new-btn').click();
  await expect(page.locator('#workspace-select')).toHaveValue('Second');

  await page.reload();

  await expect(page.locator('#workspace-select')).toHaveValue('Second');
});
