import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { setupPptx, patchThemeColors } from '../src/lib/render.js';

test('setupPptx sets author, custom-wide layout, and default fonts', () => {
  const pptx = { defineLayout(opts) { this.definedLayout = opts; } };
  setupPptx(pptx, 'my-deck');
  assert.equal(pptx.author, 'my-deck');
  assert.deepEqual(pptx.definedLayout, { name: 'CUSTOM_WIDE', width: 13.333, height: 7.5 });
  assert.equal(pptx.layout, 'CUSTOM_WIDE');
  assert.deepEqual(pptx.theme, { headFontFace: 'Arial', bodyFontFace: 'Arial', lang: 'en-US' });
});

test('patchThemeColors replaces each named slot with a literal hex color, leaving others untouched', async () => {
  const zip = new JSZip();
  zip.file(
    'ppt/theme/theme1.xml',
    '<a:clrScheme><a:dk1><a:sysClr val="windowText"/></a:dk1>'
    + '<a:accent1><a:srgbClr val="000000"/></a:accent1>'
    + '<a:accent2><a:srgbClr val="ABCDEF"/></a:accent2></a:clrScheme>',
  );

  await patchThemeColors(zip, { dk1: '111827', accent1: '86BC25' });

  const xml = await zip.file('ppt/theme/theme1.xml').async('string');
  assert.match(xml, /<a:dk1><a:srgbClr val="111827"\/><\/a:dk1>/);
  assert.match(xml, /<a:accent1><a:srgbClr val="86BC25"\/><\/a:accent1>/);
  // accent2 wasn't in the scheme map passed in, so it's left as-is
  assert.match(xml, /<a:accent2><a:srgbClr val="ABCDEF"\/><\/a:accent2>/);
});
