import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { readWorkspaceZip } from '../src/tools/browser/compile.js';

// compileDeck() can't be unit-tested under plain Node (see browser-preview.test.js
// for why); readWorkspaceZip only touches JSZip, so it's safe to exercise directly.

async function buildZip(entries) {
  const zip = new JSZip();
  for (const [name, content] of Object.entries(entries)) zip.file(name, content);
  return zip.generateAsync({ type: 'nodebuffer' });
}

test('readWorkspaceZip reads the canonical flat layout', async () => {
  const zip = await buildZip({
    'theme.js': 'export default {};',
    'masters.js': 'export default function () { return []; };',
    'slides/01-intro.js': 'export default function () {};',
  });
  const files = await readWorkspaceZip(zip);
  assert.deepEqual(files, {
    'theme.js': 'export default {};',
    'masters.js': 'export default function () { return []; };',
    '01-intro.js': 'export default function () {};',
  });
});

test('readWorkspaceZip transparently strips a single wrapping top-level folder', async () => {
  const zip = await buildZip({
    'sdlc-mythos-deck/theme.js': 'export default {};',
    'sdlc-mythos-deck/masters.js': 'export default function () { return []; };',
    'sdlc-mythos-deck/slides/01-ouverture.js': 'export default function () {};',
  });
  const files = await readWorkspaceZip(zip);
  assert.deepEqual(files, {
    'theme.js': 'export default {};',
    'masters.js': 'export default function () { return []; };',
    '01-ouverture.js': 'export default function () {};',
  });
});

test('readWorkspaceZip ignores a __MACOSX metadata folder when unwrapping', async () => {
  const zip = await buildZip({
    'deck/theme.js': 'export default {};',
    'deck/slides/01.js': 'export default function () {};',
    '__MACOSX/deck/._theme.js': 'resource-fork-junk',
  });
  const files = await readWorkspaceZip(zip);
  assert.deepEqual(files, {
    'theme.js': 'export default {};',
    '01.js': 'export default function () {};',
  });
});

test('readWorkspaceZip still fails when theme.js is missing everywhere', async () => {
  const zip = await buildZip({ 'slides/01.js': 'export default function () {};' });
  await assert.rejects(readWorkspaceZip(zip), /missing theme\.js at the root of the zip/);
});

test('readWorkspaceZip does not unwrap when multiple top-level folders exist', async () => {
  const zip = await buildZip({
    'a/theme.js': 'export default {};',
    'b/slides/01.js': 'export default function () {};',
  });
  await assert.rejects(readWorkspaceZip(zip), /missing theme\.js at the root of the zip/);
});
