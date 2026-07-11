#!/usr/bin/env node
// Creates a new workspace by copying the sample template from src/sample/.
// Usage: node bin/create.js

import { createInterface } from 'readline';
import { cp, mkdir, access } from 'fs/promises';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const root = fileURLToPath(new URL('..', import.meta.url));

const argName = process.argv[2]?.trim();

let name;
if (argName) {
  name = argName;
} else {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const ask = (q) => new Promise((res) => rl.question(q, res));
  name = (await ask('Workspace name: ')).trim();
  rl.close();
}

if (!name) {
  console.error('Error: workspace name cannot be empty.');
  process.exit(1);
}

const workspacesDir = resolve(root, 'workspaces');
await mkdir(workspacesDir, { recursive: true });

const dest = resolve(workspacesDir, name);

try {
  await access(dest);
  console.error(`Error: workspace "${name}" already exists at workspaces/${name}`);
  process.exit(1);
} catch {
  // directory does not exist — proceed
}

const src = resolve(root, 'src', 'sample');
await mkdir(dest, { recursive: true });
await cp(src, dest, { recursive: true });

console.log(`\nCreated workspace: workspaces/${name}/`);
console.log(`  workspaces/${name}/theme.js`);
console.log(`  workspaces/${name}/masters.js`);
console.log(`  workspaces/${name}/slides/deck.js`);
console.log(`\nNext steps:`);
console.log(`  Edit workspaces/${name}/theme.js to set your colors, header, and footer.`);
console.log(`  Edit workspaces/${name}/slides/deck.js or add new slide files.`);
console.log(`  Run: npm run forge ${name}`);
