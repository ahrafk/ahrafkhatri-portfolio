import { mkdirSync, writeFileSync } from "node:fs";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";

const base = process.env.LH_BASE_URL ?? "http://127.0.0.1:3100";
const pages = ["/", "/case-studies/real-estate-scraping"];
const targets = { performance: 95, accessibility: 95, "best-practices": 95, seo: 100 };

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  chromeFlags: ["--headless=new", "--no-sandbox"],
});
mkdirSync("lighthouse-reports", { recursive: true });

let below = 0;
for (const path of pages) {
  const result = await lighthouse(base + path, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: Object.keys(targets),
  });
  const { categories, audits } = result.lhr;
  writeFileSync(`lighthouse-reports/${path === "/" ? "home" : path.split("/").pop()}.json`, result.report);

  console.log(`\n${path}  (mobile profile)`);
  for (const [id, min] of Object.entries(targets)) {
    const score = Math.round((categories[id].score ?? 0) * 100);
    if (score < min) below++;
    console.log(`  ${id.padEnd(15)} ${String(score).padStart(3)}  (target ${min})${score < min ? "  BELOW TARGET" : ""}`);
  }
  for (const id of ["largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time"]) {
    console.log(`  ${id.padEnd(26)} ${audits[id].displayValue}`);
  }
}

await chrome.kill();
process.exit(below ? 1 : 0);
