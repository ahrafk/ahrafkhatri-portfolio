import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const ORIGIN = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  outputDir: "e2e/.output",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: ORIGIN, trace: "off" },
  projects: [{ name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: ORIGIN,
    // Always start our own server so the forced-empty email key below cannot be bypassed by a running dev server.
    reuseExistingServer: false,
    timeout: 240_000,
    env: { NEXT_PUBLIC_SITE_URL: ORIGIN, RESEND_API_KEY: "" },
  },
});
