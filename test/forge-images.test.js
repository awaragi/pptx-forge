import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, cp, readdir, rm, readFile } from 'fs/promises';
import { tmpdir } from 'os';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { chromium } from 'playwright-core';

// Spawns the real bin/forge.js CLI end-to-end against a throwaway copy of the
// sample workspace template (src/sample) and asserts on the PNG files it
// writes. Skipped entirely when chromium-headless-shell isn't installed, so
// `npm test` stays green for contributors who haven't run
// `npx playwright install` — forge --images itself still fails loudly for
// them (see render-images.test.js), this just keeps the unrelated unit-test
// suite from requiring a browser download.

const execFileAsync = promisify(execFile);
const root = fileURLToPath(new URL('..', import.meta.url));
const forgeBin = join(root, 'bin/forge.js');
const sampleDir = join(root, 'src/sample');

let skip = false;
try {
  const browser = await chromium.launch({ headless: true, channel: 'chromium-headless-shell' });
  await browser.close();
} catch {
  skip = 'chromium-headless-shell is not installed (run: npx playwright install chromium-headless-shell)';
}

async function makeWorkspace() {
  const dir = await mkdtemp(join(tmpdir(), 'pptx-forge-images-'));
  await cp(sampleDir, dir, { recursive: true });
  return dir;
}

async function pngFiles(wsDir) {
  return (await readdir(join(wsDir, 'out'))).filter((f) => f.endsWith('.png')).sort();
}

async function expectedSlideCount() {
  const src = await readFile(join(sampleDir, 'slides/deck.js'), 'utf8');
  return (src.match(/\.addSlide\(/g) || []).length;
}

test('forge --images writes one numbered PNG per slide, no timestamp by default', { skip }, async () => {
  const wsDir = await makeWorkspace();
  try {
    await execFileAsync('node', [forgeBin, wsDir, '--images']);
    const slug = basename(wsDir);
    const count = await expectedSlideCount();
    const files = await pngFiles(wsDir);
    assert.equal(files.length, count);
    for (let i = 0; i < count; i++) {
      assert.equal(files[i], `${slug}-${String(i + 1).padStart(2, '0')}.png`);
    }
  } finally {
    await rm(wsDir, { recursive: true, force: true });
  }
});

test('forge --images --snapshot reuses the pptx timestamp in image filenames', { skip }, async () => {
  const wsDir = await makeWorkspace();
  try {
    await execFileAsync('node', [forgeBin, wsDir, '--images', '--snapshot']);
    const slug = basename(wsDir);
    const outFiles = await readdir(join(wsDir, 'out'));
    const pptxFile = outFiles.find((f) => f.endsWith('.pptx'));
    assert.ok(pptxFile, 'expected a timestamped .pptx to be written');
    const timestamp = pptxFile.slice(`${slug}_`.length, -'.pptx'.length);

    const files = await pngFiles(wsDir);
    const count = await expectedSlideCount();
    assert.equal(files.length, count);
    for (let i = 0; i < count; i++) {
      assert.equal(files[i], `${slug}_${timestamp}-${String(i + 1).padStart(2, '0')}.png`);
    }
  } finally {
    await rm(wsDir, { recursive: true, force: true });
  }
});

test('forge --images overwrites prior output on a second run without error', { skip }, async () => {
  const wsDir = await makeWorkspace();
  try {
    await execFileAsync('node', [forgeBin, wsDir, '--images']);
    const firstRun = await pngFiles(wsDir);

    await execFileAsync('node', [forgeBin, wsDir, '--images']);
    const secondRun = await pngFiles(wsDir);

    assert.deepEqual(secondRun, firstRun);
  } finally {
    await rm(wsDir, { recursive: true, force: true });
  }
});
