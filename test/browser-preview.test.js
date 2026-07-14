import test from 'node:test';
import assert from 'node:assert/strict';
import { pickPreviewSlideName, clampSlideIndex, shouldResetSlideIndex } from '../src/tools/browser/preview-logic.js';

// compileDeck() itself (src/tools/browser/compile.js) can't be unit-tested
// under plain Node: its importModule() dynamic-imports a `blob:` URL to run
// slide source as a real ES module, and Node's ESM loader only supports
// file/data/node schemes (ERR_UNSUPPORTED_ESM_URL_SCHEME). Like the rest of
// the browser tool's compile pipeline (see forge.spec.js), it's covered by
// Playwright e2e tests instead — see test/e2e/browser-preview.spec.js.

test('pickPreviewSlideName prefers the active slide when it exists', () => {
  assert.equal(pickPreviewSlideName('slide-02.js', ['slide-01.js', 'slide-02.js'], 'slide-01.js'), 'slide-02.js');
});

test('pickPreviewSlideName falls back to the last-viewed slide while theme.js/masters.js is active', () => {
  assert.equal(pickPreviewSlideName('theme.js', ['slide-01.js', 'slide-02.js'], 'slide-02.js'), 'slide-02.js');
  assert.equal(pickPreviewSlideName('masters.js', ['slide-01.js'], 'slide-01.js'), 'slide-01.js');
});

test('pickPreviewSlideName returns null when the last-viewed slide no longer exists', () => {
  assert.equal(pickPreviewSlideName('theme.js', ['slide-02.js'], 'slide-01.js'), null);
});

test('pickPreviewSlideName returns null when nothing has ever been viewed', () => {
  assert.equal(pickPreviewSlideName('theme.js', ['slide-01.js'], null), null);
});

test('clampSlideIndex keeps an in-range index unchanged', () => {
  assert.equal(clampSlideIndex(1, 3), 1);
});

test('clampSlideIndex clamps an index that is now out of range (e.g. a trailing addSlide() was removed)', () => {
  assert.equal(clampSlideIndex(4, 3), 2);
});

test('clampSlideIndex clamps a negative index up to 0', () => {
  assert.equal(clampSlideIndex(-1, 3), 0);
});

test('clampSlideIndex returns 0 for a zero or invalid slide count', () => {
  assert.equal(clampSlideIndex(2, 0), 0);
  assert.equal(clampSlideIndex(2, NaN), 0);
});

test('shouldResetSlideIndex is true when the previewed file changes', () => {
  assert.equal(shouldResetSlideIndex('slide-01.js', 'slide-02.js'), true);
});

test('shouldResetSlideIndex is false when recompiling the same file', () => {
  assert.equal(shouldResetSlideIndex('slide-01.js', 'slide-01.js'), false);
});
