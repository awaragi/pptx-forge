// Browser-side reimplementation of bin/forge.js's compile + theme-patch pipeline.
// Runs entirely client-side: no disk access, no network calls.

import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';
import { createLib } from '../../lib/lib.js';
import { applyMasters } from '../../lib/masters.js';
import { setupPptx, patchThemeColors } from '../../lib/render.js';

export class CompileError extends Error {
  constructor(fileName, cause) {
    const detail = cause && cause.message ? cause.message : String(cause);
    super(`${fileName}: ${detail}${locate(cause, fileName)}`);
    this.fileName = fileName;
    this.cause = cause;
  }
}

// Executes a JS source string as a real ES module via a Blob URL, so
// `export default ...` works exactly as authors already write it.
// The //# sourceURL directive makes thrown errors' stacks (and the devtools
// console) point at the workspace file name instead of an opaque blob: URL.
export async function importModule(code, sourceName) {
  const src = sourceName ? `${code}\n//# sourceURL=${sourceName}` : code;
  const blob = new Blob([src], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  try {
    return await import(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// Best-effort extraction of a "file:line:col" location for sourceName out of an
// error's stack, so the UI can point at exactly where in the workspace file the
// failure happened instead of just naming the file.
function locate(cause, sourceName) {
  if (!cause || !cause.stack) return '';
  const escaped = sourceName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cause.stack.match(new RegExp(`${escaped}:(\\d+):(\\d+)`));
  return match ? ` (${sourceName}:${match[1]}:${match[2]})` : '';
}

// theme: { name, content }; masters: { name, content }; slides: [{ name, content }, ...] in compile order.
export async function compileDeck({ theme, masters, slides, outputName }) {
  let themeOverrides = {};
  try {
    const mod = await importModule(theme.content, theme.name);
    themeOverrides = mod.default ?? mod;
  } catch (err) {
    throw new CompileError(theme.name, err);
  }

  let masterOverrides = () => [];
  if (masters && masters.content) {
    try {
      const mod = await importModule(masters.content, masters.name);
      masterOverrides = mod.default ?? masterOverrides;
    } catch (err) {
      throw new CompileError(masters.name, err);
    }
  }

  // createLib invokes the masters.js factory (and re-resolves theme.js's object) as
  // part of building the library — a throw there is a workspace-file bug too, not
  // just a throw during the initial import, so it needs the same CompileError
  // attribution. lib.js tags which file via err.sourceFile.
  let lib;
  try {
    lib = createLib(themeOverrides, masterOverrides);
  } catch (err) {
    const fileName = err.sourceFile === 'masters.js' ? masters.name : theme.name;
    throw new CompileError(fileName, err.cause ?? err);
  }

  const pptx = new pptxgen();
  setupPptx(pptx, outputName);

  try {
    applyMasters(pptx, lib.masterDefinitions);
  } catch (err) {
    throw new CompileError(masters.name, err);
  }

  for (const slide of slides) {
    let mod;
    try {
      mod = await importModule(slide.content, slide.name);
    } catch (err) {
      throw new CompileError(slide.name, err);
    }
    try {
      mod.default(pptx, lib);
    } catch (err) {
      throw new CompileError(slide.name, err);
    }
  }

  const arrayBuffer = await pptx.write({ outputType: 'arraybuffer' });
  const zip = await patchThemeColors(await JSZip.loadAsync(arrayBuffer), lib.theme.scheme);
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

const SLIDE_ZIP_PATH = /^slides\/([^/]+\.js)$/i;

// theme: { name, content }; masters: { name, content }; slides: [{ name, content }, ...].
// Produces the canonical workspace zip layout: theme.js and masters.js at the root,
// slides under slides/ — the exact structure readWorkspaceZip below requires on import.
export async function exportWorkspaceZip({ theme, masters, slides }) {
  const zip = new JSZip();
  zip.file(theme.name, theme.content);
  zip.file(masters.name, masters.content);
  for (const slide of slides) zip.file(`slides/${slide.name}`, slide.content);
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

// Reads a dropped/selected .zip File into a flat { name: content } map.
// Enforces the strict workspace layout: theme.js must sit at the zip root
// (missing it is a hard failure), masters.js at the root is optional, and
// slides must live directly under slides/*.js. Anything else in the archive —
// stray files, nested folders, slide-shaped files outside slides/ — is
// silently ignored, not an error.
export async function readWorkspaceZip(file) {
  const zip = await JSZip.loadAsync(file);
  const themeEntry = zip.file('theme.js');
  if (!themeEntry) {
    throw new Error('missing theme.js at the root of the zip.');
  }

  const files = { 'theme.js': await themeEntry.async('string') };
  const mastersEntry = zip.file('masters.js');
  if (mastersEntry) {
    files['masters.js'] = await mastersEntry.async('string');
  }
  for (const entry of Object.values(zip.files)) {
    if (entry.dir) continue;
    const match = entry.name.match(SLIDE_ZIP_PATH);
    if (!match) continue;
    files[match[1]] = await entry.async('string');
  }
  return files;
}
