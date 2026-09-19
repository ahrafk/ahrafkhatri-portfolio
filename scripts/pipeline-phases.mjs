import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

mkdirSync("e2e/.output", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await page.goto(process.argv[2] ?? "http://127.0.0.1:3100/", { waitUntil: "networkidle" });

const seen = new Set();
const deadline = Date.now() + 25000;
while (Date.now() < deadline && seen.size < 5) {
  const el = page.locator("[data-phase]").first();
  const phase = await el.getAttribute("data-phase");
  if (phase && !seen.has(phase)) {
    seen.add(phase);
    await el.screenshot({ path: `e2e/.output/pipeline-${phase}.png` });
  }
  await page.waitForTimeout(100);
}
console.log([...seen].join(","));
await browser.close();
