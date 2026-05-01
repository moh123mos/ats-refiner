import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: /performance-payload\.spec\.ts/,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: 'list',
  timeout: 120000,
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'cmd /c "set MOCK_AI=true&& set GEMINI_API_KEY=&& set NUXT_GEMINI_API_KEY=&& pnpm.cmd exec nuxt dev --port 3001"',
    url: 'http://localhost:3001',
    reuseExistingServer: false,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
