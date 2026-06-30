#!/usr/bin/env node
// Backs up all slide and theme files for a workspace into a timestamped zip.
// Usage: npm run backup <workspace> [--help|-h]

import { createWriteStream, mkdirSync } from 'fs';
import { resolve, join } from 'path';
import { fileURLToPath } from 'url';
import { ZipArchive } from 'archiver';

const args = process.argv.slice(2);
const helpFlag      = args.includes('--help') || args.includes('-h');
const workspaceSlug = args.find(a => !a.startsWith('-'));

const HELP = `\
Usage: npm run backup <workspace>

Arguments:
  <workspace>   Name of the workspace to back up (e.g. my-deck)

Options:
  -h, --help    Show this help message
`;

if (helpFlag || !workspaceSlug) {
  process.stdout.write(HELP);
  process.exit(0);
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
