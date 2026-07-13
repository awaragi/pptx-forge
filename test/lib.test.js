import test from 'node:test';
import assert from 'node:assert/strict';
import { createLib } from '../src/lib/lib.js';

test('createLib with no overrides wires up the default theme and BLANK master', () => {
  const lib = createLib();
  assert.equal(lib.theme.font.body, 'Arial');
  assert.deepEqual(lib.masters, ['BLANK']);
  assert.deepEqual(lib.masterDefinitions, [{ title: 'BLANK', objects: [] }]);
});

test('run() wraps a plain string with the given options', () => {
  const lib = createLib();
  assert.deepEqual(lib.run('hello'), { text: 'hello', options: {} });
  assert.deepEqual(lib.run('hello', { bold: true }), { text: 'hello', options: { bold: true } });
});

test('run() merges options onto an existing run object without losing its text', () => {
  const lib = createLib();
  const base = lib.run('hello', { italic: true });
  assert.deepEqual(lib.run(base, { bold: true }), { text: 'hello', options: { italic: true, bold: true } });
});

test('run.bold/run.italic/run.color set exactly one option each and compose', () => {
  const { run } = createLib();
  assert.deepEqual(run.bold('hi'), { text: 'hi', options: { bold: true } });
  assert.deepEqual(run.italic('hi'), { text: 'hi', options: { italic: true } });
  assert.deepEqual(run.color('hi', 'FF0000'), { text: 'hi', options: { color: 'FF0000' } });
  assert.deepEqual(run.bold(run.italic('hi')), { text: 'hi', options: { italic: true, bold: true } });
});

test('a throwing masters.js override is tagged with sourceFile and the original error as cause', () => {
  const boom = new Error('boom');
  assert.throws(
    () => createLib({}, () => { throw boom; }),
    (err) => {
      assert.equal(err.sourceFile, 'masters.js');
      assert.equal(err.cause, boom);
      assert.match(err.message, /^masters\.js: boom/);
      return true;
    },
  );
});
