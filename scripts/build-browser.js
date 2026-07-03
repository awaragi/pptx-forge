#!/usr/bin/env node
// Bundles src/tools/browser/app.js (pptxgenjs + jszip + src/lib + app code)
// and inlines it into the HTML shell, producing one self-contained pptx-forge.html.

import { build } from 'esbuild';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const entry = resolve(root, 'src/tools/browser/app.js');
const shellPath = resolve(root, 'src/tools/browser/index.html');
const outPath = resolve(root, 'pptx-forge.html');
const marker = '/*__APP_BUNDLE__*/';

const instructions = await readFile(resolve(root, 'INSTRUCTIONS.md'), 'utf8');
const libDts = await readFile(resolve(root, 'lib.d.ts'), 'utf8');
const aiReference = `# INSTRUCTIONS.md\n\n${instructions}\n\n# lib.d.ts\n\n${libDts}`;

// theme.js placeholder: sourced from the CLI's own workspace scaffold so the
// browser tool and `bin/create.js` never drift out of sync.
const themePlaceholder = await readFile(resolve(root, 'src/sample/theme.js'), 'utf8');

const result = await build({
  entryPoints: [entry],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  minify: true,
  write: false,
  logLevel: 'info',
  define: {
    __AI_REFERENCE__: JSON.stringify(aiReference),
    __THEME_PLACEHOLDER__: JSON.stringify(themePlaceholder),
  },
});

const bundleCode = result.outputFiles[0].text;
const shell = await readFile(shellPath, 'utf8');

if (!shell.includes(marker)) {
  throw new Error(`Marker ${marker} not found in ${shellPath}`);
}

const html = shell.replace(marker, () => bundleCode);
await writeFile(outPath, html);
console.log(`Generated: ${outPath} (${(html.length / 1024).toFixed(0)} KB)`);
