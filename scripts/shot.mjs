import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "@playwright/test";

const [, , url = "http://127.0.0.1:3100/", width = "1440", theme = "dark", out = "e2e/.output/shot.png", full = "true"] = process.argv;

mkdirSync(dirname(out), { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: Number(width), height: 900 },
  colorScheme: theme === "dark" ? "dark" : "light",
});
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" });
// Scroll through the page so whileInView reveals fire before the full-page capture.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(700);
await page.screenshot({ path: out, fullPage: full === "true" });
await browser.close();
console.log(out);
