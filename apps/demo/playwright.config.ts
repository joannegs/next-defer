import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    // production build: dev mode (Turbopack) doesn't split dynamic import() chunks
    // the same way, which would make RNF01 pass for the wrong reason.
    command: 'pnpm build && pnpm start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
