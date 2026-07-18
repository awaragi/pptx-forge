#!/usr/bin/env node
// Orchestrator: loads a workspace's slides in order and compiles them into a PPTX.
// Usage: npm run forge <workspace> [--open|-o] [--snapshot|-t] [--help|-h]

import { readdir, mkdir, readFile, writeFile, stat } from 'fs/promises';
import { spawn } from 'child_process';
import JSZip from 'jszip';
import { resolve, join, basename, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import pptxgen from 'pptxgenjs';
import { createLib } from '../src/lib/lib.js';
import { applyMasters } from '../src/lib/masters.js';
import { setupPptx, patchThemeColors } from '../src/lib/render.js';
import { renderSlidesToImages, BrowserNotInstalledError } from '../src/lib/render-images.js';
import { imageFilename } from '../src/lib/image-filename.js';
import open from 'open';

const args = process.argv.slice(2);
const helpFlag      = args.includes('--help')     || args.includes('-h');
const openFlag      = args.includes('--open')     || args.includes('-o');
const previewFlag   = args.includes('--preview')  || args.includes('-v');
const snapshotFlag  = args.includes('--snapshot') || args.includes('-t');
const imagesFlag    = args.includes('--images')   || args.includes('-i');
const workspaceArg  = args.find(a => !a.startsWith('-'));

const HELP = `\
Usage: npm run forge <workspace> [options]
       npm run build <workspace> [options]
       npm run generate <workspace> [options]

Arguments:
  <workspace>     Name of the workspace to compile (e.g. my-deck), or a path
                  to a single slide .js file to compile just that slide

Options:
  -o, --open      Open the generated file after compiling
  -v, --preview   Preview the generated file in QuickLook (macOS only)
  -t, --snapshot  Write to a timestamped filename instead of overwriting
  -i, --images    Export every slide as a PNG next to the generated file
  -h, --help      Show this help message

Examples:
  npm run forge my-deck
  npm run forge my-deck --open
  npm run forge my-deck --preview
  npm run forge my-deck --snapshot
  npm run forge my-deck --open --snapshot
  npm run forge my-deck --images
  npm run forge my-deck --images --snapshot
  npm run forge workspaces/my-deck/slides/overview.js
`;

if (helpFlag) {
  process.stdout.write(HELP);
  process.exit(0);
}

if (!workspaceArg) {
  console.error('Error: workspace name is required.\n');
  process.stderr.write(HELP);
  process.exit(1);
}

const root = fileURLToPath(new URL('..', import.meta.url));
const resolvedArg = (workspaceArg.includes('/') || workspaceArg.startsWith('.'))
  ? resolve(process.cwd(), workspaceArg)
  : resolve(root, 'workspaces', workspaceArg);

let resolvedStat;
try {
  resolvedStat = await stat(resolvedArg);
} catch {
  console.error(`Error: workspace or file not found: ${workspaceArg}`);
  process.exit(1);
}

// Single-file mode: <workspace> points directly at one slide .js file
let singleSlidePath = null;
let wsDir;
if (resolvedStat.isFile()) {
  if (!resolvedArg.endsWith('.js')) {
    console.error(`Error: single-file mode requires a .js file, got: ${workspaceArg}`);
    process.exit(1);
  }
  singleSlidePath = resolvedArg;
  const parentDir = dirname(resolvedArg);
  wsDir = basename(parentDir) === 'slides' ? dirname(parentDir) : parentDir;
} else if (resolvedStat.isDirectory()) {
  wsDir = resolvedArg;
} else {
  console.error(`Error: ${workspaceArg} is neither a workspace directory nor a slide file.`);
  process.exit(1);
}

const workspaceSlug = basename(wsDir);
const slidesDir = join(wsDir, 'slides');
const outDir = join(wsDir, 'out');
await mkdir(outDir, { recursive: true });

// Loads an optional workspace override module. A missing file is not an error —
// the caller falls back to library defaults. Anything else (syntax error, throw
// during module evaluation) is a real bug in the workspace file and must fail the
// build loudly instead of silently compiling with defaults.
async function loadOptionalModule(filePath, label) {
  try {
    await stat(filePath);
  } catch (err) {
    if (err.code === 'ENOENT') return undefined;
    throw err;
  }
  try {
    const mod = await import(pathToFileURL(filePath).href);
    return mod.default ?? mod;
  } catch (err) {
    console.error(`Error: failed to load ${label}:\n`);
    console.error(err.stack || err.message);
    process.exit(1);
  }
}

const themeOverrides = (await loadOptionalModule(join(wsDir, 'theme.js'), 'theme.js')) ?? {};
const masterOverrides = await loadOptionalModule(join(wsDir, 'masters.js'), 'masters.js');

let lib;
try {
  lib = createLib(themeOverrides, masterOverrides);
} catch (err) {
  console.error(`Error: ${err.message}`);
  console.error((err.cause && err.cause.stack) || err.stack);
  process.exit(1);
}

// Discover and sort slide files (or use the single file given in single-file mode)
const slideFiles = singleSlidePath
  ? [singleSlidePath]
  : (await readdir(slidesDir))
    .filter(f => f.endsWith('.js'))
    .sort()
    .map(f => join(slidesDir, f));

if (slideFiles.length === 0) {
  console.error(`No slide files found in ${slidesDir}`);
  process.exit(1);
}

const pptx = new pptxgen();
setupPptx(pptx, workspaceSlug);

try {
  applyMasters(pptx, lib.masterDefinitions);
} catch (err) {
  console.error(`Error: failed to register slide masters from masters.js:\n`);
  console.error(err.stack || err.message);
  process.exit(1);
}

for (const filePath of slideFiles) {
  let mod;
  try {
    mod = await import(pathToFileURL(filePath).href);
  } catch (err) {
    console.error(`Error: failed to load ${basename(filePath)}:\n`);
    console.error(err.stack || err.message);
    process.exit(1);
  }
  try {
    mod.default(pptx, lib);
  } catch (err) {
    console.error(`Error: ${basename(filePath)} threw while rendering:\n`);
    console.error(err.stack || err.message);
    process.exit(1);
  }
  console.log(`  + ${basename(filePath)}`);
}

const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
const outFilename = snapshotFlag ? `${workspaceSlug}_${timestamp}.pptx` : `${workspaceSlug}.pptx`;
const outPath = join(outDir, outFilename);

await pptx.writeFile({ fileName: outPath });
console.log(`\nGenerated: ${outPath}`);

// Patch ppt/theme/theme1.xml with workspace scheme slot hex values
const raw = await readFile(outPath);
const zip = await patchThemeColors(await JSZip.loadAsync(raw), lib.theme.scheme);
const patchedBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
await writeFile(outPath, patchedBuffer);
console.log('  theme colors patched');

if (imagesFlag) {
  console.log('\nRendering slide images...');
  let images;
  try {
    images = await renderSlidesToImages(patchedBuffer);
  } catch (err) {
    if (err instanceof BrowserNotInstalledError) {
      console.error(`\nError: ${err.message}`);
    } else {
      console.error('Error: failed to render slide images:\n');
      console.error(err.stack || err.message);
    }
    process.exit(1);
  }
  for (let i = 0; i < images.length; i++) {
    const filename = imageFilename(workspaceSlug, snapshotFlag ? timestamp : null, i + 1);
    await writeFile(join(outDir, filename), images[i]);
    console.log(`  + ${filename}`);
  }
}

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
