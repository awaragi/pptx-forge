// Simulates a whole-window file drop the way dragdrop.js expects: a real
// DataTransfer carrying File objects, dispatched as dragenter/drop events
// that bubble to `window` (where the app's listeners live). Playwright has
// no built-in file-drop helper, so this builds the DataTransfer in-page via
// evaluateHandle and passes the handle back into dispatchEvent.
//
// `content` may be a string (.js files) or a Buffer (.zip files) — both are
// base64-encoded before crossing into the page so binary zip bytes survive
// intact rather than being mangled by JSON/UTF-16 string serialization.
export async function dropFiles(page, files) {
  const encoded = files.map(({ name, content }) => ({
    name,
    base64: Buffer.isBuffer(content) ? content.toString('base64') : Buffer.from(content, 'utf8').toString('base64'),
  }));

  const dataTransfer = await page.evaluateHandle((files) => {
    const dt = new DataTransfer();
    for (const { name, base64 } of files) {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      dt.items.add(new File([bytes], name));
    }
    return dt;
  }, encoded);

  await page.dispatchEvent('body', 'dragenter', { dataTransfer });
  await page.dispatchEvent('body', 'drop', { dataTransfer });
}
