#!/usr/bin/env node
// Bundles src/tools/browser/app.js (pptxgenjs + jszip + src/lib + app code)
// and inlines it into the HTML shell, producing one self-contained pptx-forge.html.

import { build } from 'esbuild';
import { readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));
const entry = resolve(root, 'src/tools/browser/app.js');
const cssPath = resolve(root, 'src/tools/browser/app.css');
const shellPath = resolve(root, 'src/tools/browser/index.html');
const outPath = resolve(root, 'pptx-forge.html');
const scriptMarker = '/*__APP_BUNDLE__*/';
const styleMarker = '/*__APP_STYLES__*/';

// Frontmatter (--- ... ---) on INSTRUCTIONS.md/COMPONENTS.md carries cross-file
// pointers for humans/tooling reading the raw file; it's stripped here so it
// never leaks into the AI-facing bundled reference.
const stripFrontmatter = (text) => text.replace(/^---\n[\s\S]*?\n---\n+/, '');

// Raw pieces only — app.js assembles them (headers, order, optional
// components splice) at runtime.
const aiChat = await readFile(resolve(root, 'AI-CHAT.md'), 'utf8');
const instructions = stripFrontmatter(await readFile(resolve(root, 'INSTRUCTIONS.md'), 'utf8'));
const components = stripFrontmatter(await readFile(resolve(root, 'COMPONENTS.md'), 'utf8'));
const libDts = await readFile(resolve(root, 'lib.d.ts'), 'utf8');

// theme.js/masters.js placeholders: sourced from the CLI's own workspace scaffold
// so the browser tool and `bin/create.js` never drift out of sync.
const themePlaceholder = await readFile(resolve(root, 'src/sample/theme.js'), 'utf8');
const mastersPlaceholder = await readFile(resolve(root, 'src/sample/masters.js'), 'utf8');

const { version } = JSON.parse(await readFile(resolve(root, 'package.json'), 'utf8'));

const result = await build({
  entryPoints: [entry],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  minify: true,
  write: false,
  logLevel: 'info',
  define: {
    __AI_CHAT__: JSON.stringify(aiChat),
    __INSTRUCTIONS__: JSON.stringify(instructions),
    __COMPONENTS__: JSON.stringify(components),
    __LIB_DTS__: JSON.stringify(libDts),
    __THEME_PLACEHOLDER__: JSON.stringify(themePlaceholder),
    __MASTERS_PLACEHOLDER__: JSON.stringify(mastersPlaceholder),
    __VERSION__: JSON.stringify(version),
  },
});

const bundleCode = result.outputFiles[0].text;
const appCss = await readFile(cssPath, 'utf8');
const shell = await readFile(shellPath, 'utf8');

if (!shell.includes(styleMarker)) {
  throw new Error(`Marker ${styleMarker} not found in ${shellPath}`);
}
if (!shell.includes(scriptMarker)) {
  throw new Error(`Marker ${scriptMarker} not found in ${shellPath}`);
}

const html = shell
  .replace(styleMarker, () => appCss)
  .replace(scriptMarker, () => bundleCode);
await writeFile(outPath, html);
console.log(`Generated: ${outPath} (${(html.length / 1024).toFixed(0)} KB)`);
