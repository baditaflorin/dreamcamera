import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  expect: {
    timeout: 5_000
  },
  use: {
    baseURL: "http://127.0.0.1:4174/dreamcamera/",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npx serve docs -l 4174",
    url: "http://127.0.0.1:4174/dreamcamera/",
    reuseExistingServer: true,
    timeout: 10_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ]
});

