import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

const packedConsumerDir = process.env.PACKED_EXPO_CONSUMER_DIR;
const packedPackageSmoke = Boolean(packedConsumerDir);
const port = packedPackageSmoke ? 8003 : 8002;

export default defineConfig({
  testDir: "./e2e-web",
  testIgnore: packedPackageSmoke ? [] : ["packed-package.spec.ts"],
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  failOnFlakyTests: Boolean(process.env.CI),
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [["html", { open: "never" }], ["list"]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `${packedPackageSmoke ? "npx" : "yarn"} expo start --web --no-dev --minify --localhost --port ${port} --clear`,
    cwd: packedConsumerDir ?? "./example/app",
    url: packedPackageSmoke
      ? `http://127.0.0.1:${port}`
      : `http://127.0.0.1:${port}/demos/e2e-testing/web-release-smoke`,
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
