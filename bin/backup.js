#!/usr/bin/env node
// Backs up all slide and theme files for a workspace into a timestamped zip.
// Usage: node bin/backup.js <workspace-slug>

import { createWriteStream, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { ZipArchive } from 'archiver';

const [,, workspaceSlug] = process.argv;
if (!workspaceSlug) {
  console.error('Usage: node bin/backup.js <workspace-slug>');
  process.exit(1);
}

const root = fileURLToPath(new URL('..', import.meta.url));
const wsDir = resolve(root, 'workspaces', workspaceSlug);
const backupsDir = join(wsDir, 'backups');
mkdirSync(backupsDir, { recursive: true });

const timestamp = new Date().toISOString().slice(0, 19).replace('T', '_').replace(/:/g, '-');
const outPath = join(backupsDir, `${workspaceSlug}_${timestamp}.zip`);

const output = createWriteStream(outPath);
const archive = new ZipArchive({ zlib: { level: 9 } });
archive.pipe(output);

archive.glob('slide*.js', { cwd: wsDir });
archive.glob('theme.js',  { cwd: wsDir });

await new Promise((res, rej) => {
  output.on('close', res);
  archive.on('error', rej);
  archive.finalize();
});

console.log(`Backed up to: ${outPath} (${archive.pointer()} bytes)`);
