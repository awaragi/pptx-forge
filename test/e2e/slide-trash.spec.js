import { test, expect } from '@playwright/test';
import { gotoApp, slideModule } from './fixtures.js';
import { downloadAsZip } from './helpers/download.js';

test('discarding a slide moves it from Slides to Trash', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Original') },
  });

  await page.locator('#file-list li[data-name="slide-01.js"]').click();

  page.once('dialog', (dialog) => {
    expect(dialog.message()).toContain('trash');
    expect(dialog.message()).not.toContain('cannot be undone');
    dialog.accept();
  });
  await page.locator('#discard-btn').click();

  await expect(page.locator('#file-list li[data-name="slide-01.js"]')).toHaveCount(0);
  await expect(page.locator('#trash-count')).toHaveText('1');
});

test('the Trash group expands and collapses independently of the Slides group', async ({ page }) => {
  await gotoApp(page, {
    files: {
      'slide-01.js': slideModule('Live'),
      '.trash/old-slide.2026-01-01_00-00-00.js': slideModule('Old'),
    },
  });

  await expect(page.locator('#trash-list')).not.toBeVisible();
  await expect(page.locator('#file-list li[data-name="slide-01.js"]')).toBeVisible();

  await page.locator('#trash-toggle').click();
  await expect(page.locator('#trash-list')).toBeVisible();
  await expect(page.locator('#trash-list li')).toContainText('old-slide.js');
  await expect(page.locator('#file-list li[data-name="slide-01.js"]')).toBeVisible();

  await page.locator('#trash-toggle').click();
  await expect(page.locator('#trash-list')).not.toBeVisible();
});

test('clicking a trashed entry restores it under its original name and makes it active', async ({ page }) => {
  await gotoApp(page, {
    files: { '.trash/old-slide.2026-01-01_00-00-00.js': slideModule('Old') },
  });

  await page.locator('#trash-toggle').click();
  await page.locator('#trash-list li').click();

  await expect(page.locator('#file-list li[data-name="old-slide.js"]')).toBeVisible();
  await expect(page.locator('#active-filename')).toHaveText('old-slide.js');
  await expect(page.locator('#trash-count')).toHaveText('0');
});

test('restoring over a live slide with the same name auto-suffixes instead of overwriting', async ({ page }) => {
  await gotoApp(page, {
    files: {
      'foo.js': slideModule('Current'),
      '.trash/foo.2026-01-01_00-00-00.js': slideModule('Old foo'),
    },
  });

  await page.locator('#trash-toggle').click();
  await page.locator('#trash-list li').click();

  await expect(page.locator('#file-list li[data-name="foo.js"]')).toBeVisible();
  await expect(page.locator('#file-list li[data-name="foo (restored).js"]')).toBeVisible();
  await expect(page.locator('.toast-success')).toContainText('foo (restored).js');
});

test('emptying trash permanently removes all entries, and is cancellable', async ({ page }) => {
  await gotoApp(page, {
    files: {
      '.trash/a.2026-01-01_00-00-00.js': slideModule('A'),
      '.trash/b.2026-01-01_00-00-01.js': slideModule('B'),
    },
  });

  await page.locator('#trash-toggle').click();
  await expect(page.locator('#trash-list li')).toHaveCount(2);

  page.once('dialog', (dialog) => dialog.dismiss());
  await page.locator('#empty-trash-btn').click();
  await expect(page.locator('#trash-list li')).toHaveCount(2);

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#empty-trash-btn').click();
  await expect(page.locator('#trash-list li')).toHaveCount(0);
  await expect(page.locator('#trash-count')).toHaveText('0');
});

test('trashed entries survive a page reload', async ({ page }) => {
  await gotoApp(page, {
    files: { 'slide-01.js': slideModule('Original') },
  });

  await page.locator('#file-list li[data-name="slide-01.js"]').click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('#discard-btn').click();
  await expect(page.locator('#trash-count')).toHaveText('1');

  await page.reload();

  await expect(page.locator('#trash-count')).toHaveText('1');
  await page.locator('#trash-toggle').click();
  await expect(page.locator('#trash-list li')).toContainText('slide-01.js');
});

test('Forge output excludes trashed slides', async ({ page }) => {
  await gotoApp(page, {
    files: {
      'slide-01.js': slideModule('Live content'),
      '.trash/slide-02.2026-01-01_00-00-00.js': slideModule('Trashed content'),
    },
  });

  const { zip } = await downloadAsZip(page, () => page.locator('#forge-btn').click());

  const slideFiles = Object.keys(zip.files).filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name));
  const slideXmls = await Promise.all(slideFiles.map((name) => zip.file(name).async('string')));
  expect(slideXmls.some((xml) => xml.includes('Live content'))).toBe(true);
  expect(slideXmls.some((xml) => xml.includes('Trashed content'))).toBe(false);
});

test('Workspace export excludes trashed slides', async ({ page }) => {
  await gotoApp(page, {
    files: {
      'slide-01.js': slideModule('Live content'),
      '.trash/slide-02.2026-01-01_00-00-00.js': slideModule('Trashed content'),
    },
  });

  const { zip } = await downloadAsZip(page, () => page.locator('#workspace-export-btn').click());

  expect(Object.keys(zip.files)).toContain('slides/slide-01.js');
  expect(Object.keys(zip.files).some((name) => name.includes('.trash/'))).toBe(false);
});
