// Browser-side reimplementation of bin/forge.js's compile + theme-patch pipeline.
// Runs entirely client-side: no disk access, no network calls.

import pptxgen from 'pptxgenjs';
import JSZip from 'jszip';
import { createLib } from '../../lib/lib.js';

export class CompileError extends Error {
  constructor(fileName, cause) {
    super(`${fileName}: ${cause && cause.message ? cause.message : cause}`);
    this.fileName = fileName;
    this.cause = cause;
  }
}

// Executes a JS source string as a real ES module via a Blob URL, so
// `export default ...` works exactly as authors already write it.
export async function importModule(code) {
  const blob = new Blob([code], { type: 'text/javascript' });
  const url = URL.createObjectURL(blob);
  try {
    return await import(url);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// theme: { name, content }; slides: [{ name, content }, ...] in compile order.
export async function compileDeck({ theme, slides, outputName }) {
  let themeOverrides = {};
  try {
    const mod = await importModule(theme.content);
    themeOverrides = mod.default ?? mod;
  } catch (err) {
    throw new CompileError(theme.name, err);
  }

  const lib = createLib(themeOverrides);

  const pptx = new pptxgen();
  pptx.author = outputName;
  pptx.defineLayout({ name: 'CUSTOM_WIDE', width: 13.333, height: 7.5 });
  pptx.layout = 'CUSTOM_WIDE';
  pptx.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial', lang: 'en-US' };

  for (const slide of slides) {
    let mod;
    try {
      mod = await importModule(slide.content);
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
  const zip = await JSZip.loadAsync(arrayBuffer);
  let xml = await zip.file('ppt/theme/theme1.xml').async('string');
  for (const [slot, hex] of Object.entries(lib.theme.scheme)) {
    xml = xml.replace(
      new RegExp(`(<a:${slot}>)[\\s\\S]*?(<\\/a:${slot}>)`),
      `$1<a:srgbClr val="${hex}"/>$2`,
    );
  }
  zip.file('ppt/theme/theme1.xml', xml);
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

// theme: { name, content }; slides: [{ name, content }, ...]. Produces a flat
// zip (no folders) so it round-trips with readWorkspaceZip below.
export async function exportWorkspaceZip({ theme, slides }) {
  const zip = new JSZip();
  zip.file(theme.name, theme.content);
  for (const slide of slides) zip.file(slide.name, slide.content);
  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

// Reads a dropped/selected .zip File into a flat { name: content } map,
// keeping only .js entries — the same .js-only rule loose file import uses.
export async function readWorkspaceZip(file) {
  const zip = await JSZip.loadAsync(file);
  const files = {};
  for (const entry of Object.values(zip.files)) {
    if (entry.dir || !/\.js$/i.test(entry.name)) continue;
    const name = entry.name.split('/').pop();
    files[name] = await entry.async('string');
  }
  return files;
}
