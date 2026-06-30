#!/usr/bin/env node
// Orchestrator: loads a workspace's slides in order and compiles them into a PPTX.
// Usage: npm run forge <workspace> [--open|-o] [--snapshot|-t] [--help|-h]

import { readdir, mkdir, readFile, writeFile } from 'fs/promises';
import { spawn } from 'child_process';
import JSZip from 'jszip';
import { resolve, join } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import pptxgen from 'pptxgenjs';
import { createLib } from '../src/lib.js';
import open from 'open';

const args = process.argv.slice(2);
const helpFlag      = args.includes('--help')     || args.includes('-h');
const openFlag      = args.includes('--open')     || args.includes('-o');
const previewFlag   = args.includes('--preview')  || args.includes('-v');
const snapshotFlag  = args.includes('--snapshot') || args.includes('-t');
const workspaceSlug = args.find(a => !a.startsWith('-'));

const HELP = `\
Usage: npm run forge <workspace> [options]
       npm run build <workspace> [options]
       npm run generate <workspace> [options]

Arguments:
  <workspace>     Name of the workspace to compile (e.g. my-deck)

Options:
  -o, --open      Open the generated file after compiling
  -v, --preview   Preview the generated file in QuickLook (macOS only)
  -t, --snapshot  Write to a timestamped filename instead of overwriting
  -h, --help      Show this help message

Examples:
  npm run forge my-deck
  npm run forge my-deck --open
  npm run forge my-deck --preview
  npm run forge my-deck --snapshot
  npm run forge my-deck --open --snapshot
`;

if (helpFlag) {
  process.stdout.write(HELP);
  process.exit(0);
}

if (!workspaceSlug) {
  console.error('Error: workspace name is required.\n');
  process.stderr.write(HELP);
  process.exit(1);
}

const root = fileURLToPath(new URL('..', import.meta.url));
const wsDir = resolve(root, 'workspaces', workspaceSlug);
const slidesDir = join(wsDir, 'slides');
const outDir = join(wsDir, 'out');
await mkdir(outDir, { recursive: true });

// Load workspace theme overrides (optional)
let themeOverrides = {};
try {
  const themeUrl = pathToFileURL(join(wsDir, 'theme.js')).href;
  const mod = await import(themeUrl);
  themeOverrides = mod.default ?? mod;
} catch {
  // no theme.js — use library defaults
}

const lib = createLib(themeOverrides);

// Discover and sort slide files
const slideFiles = (await readdir(slidesDir))
  .filter(f => f.endsWith('.js'))
  .sort();

if (slideFiles.length === 0) {
  console.error(`No slide files found in workspaces/${workspaceSlug}/slides/`);
  process.exit(1);
}

const pptx = new pptxgen();
pptx.author = workspaceSlug;
pptx.defineLayout({ name: 'CUSTOM_WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'CUSTOM_WIDE';
pptx.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial', lang: 'en-US' };

for (const file of slideFiles) {
  const slideUrl = pathToFileURL(join(slidesDir, file)).href;
  const mod = await import(slideUrl);
  mod.default(pptx, lib);
  console.log(`  + ${file}`);
}

const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
const outFilename = snapshotFlag ? `${workspaceSlug}_${timestamp}.pptx` : `${workspaceSlug}.pptx`;
const outPath = join(outDir, outFilename);

await pptx.writeFile({ fileName: outPath });
console.log(`\nGenerated: ${outPath}`);

// Patch ppt/theme/theme1.xml with workspace scheme slot hex values
const raw = await readFile(outPath);
const zip = await JSZip.loadAsync(raw);
let xml = await zip.file('ppt/theme/theme1.xml').async('string');
for (const [slot, hex] of Object.entries(lib.theme.scheme)) {
  xml = xml.replace(
    new RegExp(`(<a:${slot}>)[\\s\\S]*?(<\\/a:${slot}>)`),
    `$1<a:srgbClr val="${hex}"/>$2`,
  );
}
zip.file('ppt/theme/theme1.xml', xml);
await writeFile(outPath, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
console.log('  theme colors patched');

if (openFlag) {
  await open(outPath);
}

if (previewFlag) {
  if (process.platform !== 'darwin') {
    console.warn('Warning: --preview is only supported on macOS.');
  } else {
    spawn('qlmanage', ['-p', outPath], { detached: true, stdio: 'ignore' }).unref();
  }
}
