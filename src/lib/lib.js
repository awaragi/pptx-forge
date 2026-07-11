// Factory assembler — imports all modules and wires createLib().
// Slide files should import createLib from this file or from src/lib/index.js.

import { defaultTheme, deepMerge, resolveThemeColors } from './theme.js';
import { makePrimitives } from './primitives.js';
import { makeComponents } from './components.js';
import { makeTables }     from './tables.js';
import { makeLayout }     from './layout.js';
import { makeFrame }      from './frame.js';
import defaultMasters, { mergeMastersByTitle } from './masters.js';

// Wraps an error thrown while evaluating a workspace override (theme.js's object
// literal or masters.js's factory function) with the file it came from, so callers
// (bin/forge.js, the browser tool) can attribute the failure instead of losing it
// to a generic "createLib failed" message.
function taggedError(sourceFile, cause) {
  const err = new Error(`${sourceFile}: ${cause.message}`);
  err.sourceFile = sourceFile;
  err.cause = cause;
  return err;
}

export function createLib(themeOverrides = {}, masterOverrides) {
  function run(textOrRun, opts = {}) {
    if (typeof textOrRun === 'string') {
      return { text: textOrRun, options: { ...opts } };
    }
    return { text: textOrRun.text, options: { ...textOrRun.options, ...opts } };
  }
  run.bold   = (textOrRun)           => run(textOrRun, { bold: true });
  run.italic = (textOrRun)           => run(textOrRun, { italic: true });
  run.color  = (textOrRun, colorVal) => run(textOrRun, { color: colorVal });

  let theme;
  try {
    theme = resolveThemeColors(deepMerge(defaultTheme, themeOverrides));
  } catch (cause) {
    throw taggedError('theme.js', cause);
  }
  const prim   = makePrimitives(theme);
  const comp   = makeComponents(theme, prim);
  const tables = makeTables(theme, prim);
  const layout = makeLayout(theme, prim);
  const frame  = makeFrame(theme, prim);

  let overrideMasters;
  try {
    overrideMasters = typeof masterOverrides === 'function' ? masterOverrides(theme) : [];
  } catch (cause) {
    throw taggedError('masters.js', cause);
  }
  const masterDefinitions = mergeMastersByTitle(defaultMasters(theme), overrideMasters);
  const masters = masterDefinitions.map((entry) => entry.title);

  return { theme, run, prim, comp, tables, layout, frame, masters, masterDefinitions };
}

// ── Logic lives in sibling modules ────────────────────────────────────────────
// theme.js · primitives.js · components.js · tables.js · layout.js · frame.js · masters.js
