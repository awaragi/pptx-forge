import test from 'node:test';
import assert from 'node:assert/strict';
import { isMissingExecutableError, BrowserNotInstalledError } from '../src/lib/render-images.js';

// isMissingExecutableError/BrowserNotInstalledError are exported specifically so this
// classification logic can be tested without actually removing the installed browser.

test('isMissingExecutableError matches Playwright\'s missing-binary message', () => {
  const err = new Error('browserType.launch: Executable doesn\'t exist at /some/path/headless_shell');
  assert.equal(isMissingExecutableError(err), true);
});

test('isMissingExecutableError is false for unrelated errors', () => {
  assert.equal(isMissingExecutableError(new Error('some other launch failure')), false);
  assert.equal(isMissingExecutableError(new Error('')), false);
});

test('BrowserNotInstalledError names chromium-headless-shell specifically, not plain chromium', () => {
  const err = new BrowserNotInstalledError(new Error('cause'));
  assert.equal(
    err.message,
    'chromium-headless-shell is not installed.\nRun: npx playwright install chromium-headless-shell',
  );
  assert.equal(err.cause.message, 'cause');
});
