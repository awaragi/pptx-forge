import { defineConfig, devices } from '@playwright/test';

// Drives the built pptx-forge.html directly over file:// — no dev server,
// no baseURL. `npm run test:e2e` always rebuilds first via the pretest:e2e
// script so this never runs against a stale bundle.
//
// SLOWMO_MS (used by the `test:e2e:demo` script) adds a per-action delay so a
// --headed run is watchable instead of a blur — not for normal CI/local runs.
export default defineConfig({
  testDir: 'test/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    ...devices['Desktop Chrome'],
    launchOptions: {
      slowMo: process.env.SLOWMO_MS ? Number(process.env.SLOWMO_MS) : undefined,
    },
  },
  projects: [{ name: 'chromium' }],
});
