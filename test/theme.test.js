import test from 'node:test';
import assert from 'node:assert/strict';
import { deepMerge, resolveThemeColors } from '../src/lib/theme.js';

test('deepMerge returns defaults unchanged when overrides is missing or not an object', () => {
  const defaults = { a: 1, b: { c: 2 } };
  assert.deepEqual(deepMerge(defaults, undefined), defaults);
  assert.deepEqual(deepMerge(defaults, null), defaults);
  assert.deepEqual(deepMerge(defaults, 'nope'), defaults);
});

test('deepMerge recurses into plain objects, preserving un-overridden sibling keys', () => {
  const defaults = { size: { h1: 28, h2: 22 }, font: { body: 'Arial' } };
  const overrides = { size: { h1: 32 } };
  const merged = deepMerge(defaults, overrides);
  assert.deepEqual(merged, { size: { h1: 32, h2: 22 }, font: { body: 'Arial' } });
  // original inputs are untouched
  assert.equal(defaults.size.h1, 28);
});

test('deepMerge replaces arrays wholesale rather than merging element-wise', () => {
  const defaults = { list: [1, 2, 3] };
  const overrides = { list: [9] };
  assert.deepEqual(deepMerge(defaults, overrides), { list: [9] });
});

test('resolveThemeColors aliases dk1/lt1/dk2/lt2 to tx1/bg1/tx2/bg2 in color and shape', () => {
  const theme = {
    scheme: { dk1: '111827', lt1: 'FFFFFF' },
    color: { brand: 'dk1', neutral: 'lt2' },
    shape: { card: { borderColor: 'dk2', nested: ['lt1', 'accent1'] } },
  };
  const resolved = resolveThemeColors(theme);
  assert.deepEqual(resolved.color, { brand: 'tx1', neutral: 'bg2' });
  assert.deepEqual(resolved.shape, { card: { borderColor: 'tx2', nested: ['bg1', 'accent1'] } });
  // scheme itself is literal hex, not a scheme-name reference — left untouched
  assert.deepEqual(resolved.scheme, { dk1: '111827', lt1: 'FFFFFF' });
});
