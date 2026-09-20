import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://127.0.0.1:3100";
const paths = [
  "/",
  "/case-studies/real-estate-scraping",
  "/case-studies/document-extraction",
  "/case-studies/etl-pipeline",
  "/does-not-exist",
];

const browser = await chromium.launch({ channel: "chrome" });
let failures = 0;
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ colorScheme: scheme });
  for (const path of paths) {
    const page = await context.newPage();
    const problems = [];
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("console", (msg) => {
      const text = msg.text();
      if (["error", "warning"].includes(msg.type()) && !text.includes("status of 404")) problems.push(`${msg.type()}: ${text}`);
    });
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    console.log(`${scheme.padEnd(5)} ${path.padEnd(38)} ${problems.length ? "PROBLEMS" : "ok"}`);
    for (const p of problems) console.log("     ", p);
    failures += problems.length;
    await page.close();
  }
  await context.close();
}
await browser.close();
process.exit(failures ? 1 : 0);
