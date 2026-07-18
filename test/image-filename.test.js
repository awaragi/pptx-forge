import test from 'node:test';
import assert from 'node:assert/strict';
import { imageFilename } from '../src/lib/image-filename.js';

test('imageFilename omits the timestamp when none is given', () => {
  assert.equal(imageFilename('my-deck', null, 1), 'my-deck-01.png');
});

test('imageFilename includes the timestamp when given', () => {
  assert.equal(
    imageFilename('my-deck', '2026-06-29_14-30-00', 1),
    'my-deck_2026-06-29_14-30-00-01.png',
  );
});

test('imageFilename zero-pads single-digit indexes to 2 digits', () => {
  assert.equal(imageFilename('my-deck', null, 9), 'my-deck-09.png');
});

test('imageFilename does not truncate indexes wider than 2 digits', () => {
  assert.equal(imageFilename('my-deck', null, 123), 'my-deck-123.png');
});
