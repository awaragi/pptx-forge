import test from 'node:test';
import assert from 'node:assert/strict';
import defaultMasters, { mergeMastersByTitle, applyMasters } from '../src/lib/masters.js';

test('default masters factory returns the single BLANK entry', () => {
  assert.deepEqual(defaultMasters({}), [{ title: 'BLANK', objects: [] }]);
});

test('mergeMastersByTitle replaces a matching title in place and appends new ones', () => {
  const defaults = [{ title: 'BLANK', objects: [] }, { title: 'DIVIDER', objects: [1] }];
  const overrides = [{ title: 'DIVIDER', objects: [2] }, { title: 'EXTRA', objects: [3] }];
  const merged = mergeMastersByTitle(defaults, overrides);
  assert.deepEqual(merged, [
    { title: 'BLANK', objects: [] },
    { title: 'DIVIDER', objects: [2] },
    { title: 'EXTRA', objects: [3] },
  ]);
});

test('mergeMastersByTitle does not mutate the defaults array', () => {
  const defaults = [{ title: 'BLANK', objects: [] }];
  mergeMastersByTitle(defaults, [{ title: 'EXTRA', objects: [] }]);
  assert.equal(defaults.length, 1);
});

test('applyMasters registers each merged entry on the pptx instance unmodified', () => {
  const registered = [];
  const fakePptx = { defineSlideMaster: (entry) => registered.push(entry) };
  const definitions = [{ title: 'A', objects: [] }, { title: 'B', objects: [] }];
  applyMasters(fakePptx, definitions);
  assert.deepEqual(registered, definitions);
});
