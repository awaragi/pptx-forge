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

const result = await build({
  entryPoints: [entry],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  minify: true,
  write: false,
  logLevel: 'info',
});

const bundleCode = result.outputFiles[0].text;
const shell = await readFile(shellPath, 'utf8');

if (!shell.includes(marker)) {
  throw new Error(`Marker ${marker} not found in ${shellPath}`);
}

const html = shell.replace(marker, () => bundleCode);
await writeFile(outPath, html);
console.log(`Generated: ${outPath} (${(html.length / 1024).toFixed(0)} KB)`);
