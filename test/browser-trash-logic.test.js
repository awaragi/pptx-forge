import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TRASH_PREFIX,
  isTrashKey,
  timestampedTrashKey,
  originalNameFromTrashKey,
  splitSnapshot,
  dedupeRestoredName,
} from '../src/tools/browser/trash-logic.js';

test('timestampedTrashKey encodes the delete time at seconds resolution', () => {
  const key = timestampedTrashKey('foo.js', new Date(2026, 6, 16, 14, 32, 5));
  assert.equal(key, `${TRASH_PREFIX}foo.2026-07-16_14-32-05.js`);
});

test('timestampedTrashKey keeps two discards of the same name distinct', () => {
  const a = timestampedTrashKey('foo.js', new Date(2026, 6, 16, 14, 32, 5));
  const b = timestampedTrashKey('foo.js', new Date(2026, 6, 16, 14, 32, 6));
  assert.notEqual(a, b);
});

test('isTrashKey recognizes prefixed keys only', () => {
  assert.equal(isTrashKey('.trash/foo.2026-07-16_14-32-05.js'), true);
  assert.equal(isTrashKey('foo.js'), false);
});

test('originalNameFromTrashKey round-trips through timestampedTrashKey', () => {
  const key = timestampedTrashKey('04-core-principle.js', new Date(2026, 6, 16, 14, 32, 5));
  assert.equal(originalNameFromTrashKey(key), '04-core-principle.js');
});

test('originalNameFromTrashKey handles a basename with dots in it', () => {
  const key = timestampedTrashKey('foo.bar.js', new Date(2026, 6, 16, 14, 32, 5));
  assert.equal(originalNameFromTrashKey(key), 'foo.bar.js');
});

test('splitSnapshot separates pinned, live, and trash entries', () => {
  const isPinnedName = (name) => name === 'theme.js' || name === 'masters.js';
  const snapshot = {
    'theme.js': 'theme-content',
    'masters.js': 'masters-content',
    'slide-01.js': 'slide-content',
    [`${TRASH_PREFIX}old-slide.2026-07-15_09-02-11.js`]: 'trashed-content',
  };

  const { slides, trash } = splitSnapshot(snapshot, isPinnedName);

  assert.deepEqual(slides, [{ name: 'slide-01.js', content: 'slide-content' }]);
  assert.deepEqual(trash, [
    {
      trashKey: `${TRASH_PREFIX}old-slide.2026-07-15_09-02-11.js`,
      name: 'old-slide.js',
      content: 'trashed-content',
    },
  ]);
});

test('splitSnapshot returns empty arrays when nothing is trashed', () => {
  const isPinnedName = (name) => name === 'theme.js';
  const { slides, trash } = splitSnapshot({ 'theme.js': 'x', 'slide-01.js': 'y' }, isPinnedName);
  assert.deepEqual(slides, [{ name: 'slide-01.js', content: 'y' }]);
  assert.deepEqual(trash, []);
});

test('dedupeRestoredName passes through a name with no conflict', () => {
  assert.equal(dedupeRestoredName('foo.js', new Set(['bar.js'])), 'foo.js');
});

test('dedupeRestoredName appends "(restored)" on a single collision', () => {
  assert.equal(dedupeRestoredName('foo.js', new Set(['foo.js'])), 'foo (restored).js');
});

test('dedupeRestoredName counts up when "(restored)" also collides', () => {
  const existing = new Set(['foo.js', 'foo (restored).js']);
  assert.equal(dedupeRestoredName('foo.js', existing), 'foo (restored 2).js');
});
