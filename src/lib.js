// Factory assembler — imports all modules and wires createLib().
// Slide files should import createLib from this file or from src/index.js.

import { defaultTheme, deepMerge } from './theme.js';
import { makePrimitives } from './primitives.js';
import { makeComponents } from './components.js';
import { makeTables }     from './tables.js';
import { makeLayout }     from './layout.js';
import { makeFrame }      from './frame.js';

export function createLib(overrides = {}) {
  function run(textOrRun, opts = {}) {
    if (typeof textOrRun === 'string') {
      return { text: textOrRun, options: { ...opts } };
    }
    return { text: textOrRun.text, options: { ...textOrRun.options, ...opts } };
  }
  run.bold   = (textOrRun)           => run(textOrRun, { bold: true });
  run.italic = (textOrRun)           => run(textOrRun, { italic: true });
  run.color  = (textOrRun, colorVal) => run(textOrRun, { color: colorVal });

  const theme = deepMerge(defaultTheme, overrides);
  const prim   = makePrimitives(theme);
  const comp   = makeComponents(theme, prim);
  const tables = makeTables(theme, prim);
  const layout = makeLayout(theme, prim);
  const frame  = makeFrame(theme, prim);

  return { theme, run, prim, comp, tables, layout, frame };
}

// ── Logic lives in sibling modules ────────────────────────────────────────────
// theme.js · primitives.js · components.js · tables.js · layout.js · frame.js
