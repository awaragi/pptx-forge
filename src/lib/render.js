// Shared pptxgenjs setup + post-write theme-XML patching.
// Used identically by the Node CLI (bin/forge.js) and the browser tool
// (src/tools/browser/compile.js) so the two compile pipelines can't drift.

// Applies the fixed slide geometry/theme every compile uses, regardless of
// which environment (Node or browser) is producing the pptx.
export function setupPptx(pptx, author) {
  pptx.author = author;
  pptx.defineLayout({ name: 'CUSTOM_WIDE', width: 13.333, height: 7.5 });
  pptx.layout = 'CUSTOM_WIDE';
  pptx.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial', lang: 'en-US' };
}

// pptxgenjs has no API for the 10 PowerPoint theme slot colors, so they're
// patched into ppt/theme/theme1.xml directly after write, on an already-loaded
// JSZip instance. Mutates `zip` in place and returns it for chaining.
export async function patchThemeColors(zip, scheme) {
  let xml = await zip.file('ppt/theme/theme1.xml').async('string');
  for (const [slot, hex] of Object.entries(scheme)) {
    xml = xml.replace(
      new RegExp(`(<a:${slot}>)[\\s\\S]*?(<\\/a:${slot}>)`),
      `$1<a:srgbClr val="${hex}"/>$2`,
    );
  }
  zip.file('ppt/theme/theme1.xml', xml);
  return zip;
}
