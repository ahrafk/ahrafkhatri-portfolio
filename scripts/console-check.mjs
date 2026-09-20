import { chromium } from "@playwright/test";

const base = (process.argv[2] ?? "http://127.0.0.1:3100").replace(/\/$/, "");
// `status` is the HTTP status each path must answer with; the last one is the deliberate missing page.
const routes = [
  { path: "/", status: 200 },
  { path: "/case-studies/real-estate-scraping", status: 200 },
  { path: "/case-studies/document-extraction", status: 200 },
  { path: "/case-studies/etl-pipeline", status: 200 },
  { path: "/does-not-exist", status: 404 },
];

let failures = 0;
const browser = await chromium.launch({ channel: "chrome" });
try {
  for (const scheme of ["light", "dark"]) {
    const context = await browser.newContext({ colorScheme: scheme });
    try {
      for (const { path, status: expected } of routes) {
        const url = base + path;
        const page = await context.newPage();
        try {
          const problems = [];
          page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
          page.on("console", (msg) => {
            const text = msg.text();
            if (!["error", "warning"].includes(msg.type())) return;
            // Chrome logs "status of 404" for the missing page's own navigation. Ignore that one line only:
            // a 404 for any other resource (font, image, chunk) or on any real page is still a failure.
            if (expected === 404 && text.includes("status of 404") && msg.location().url === url) return;
            problems.push(`${msg.type()}: ${text}`);
          });
          const response = await page.goto(url, { waitUntil: "networkidle" });
          await page.waitForTimeout(1500);
          const actual = response ? response.status() : "no response";
          if (actual !== expected) problems.push(`status: expected ${expected}, got ${actual}`);
          console.log(`${scheme.padEnd(5)} ${path.padEnd(38)} ${problems.length ? "PROBLEMS" : "ok"} (${actual})`);
          for (const p of problems) console.log("     ", p);
          failures += problems.length;
        } finally {
          await page.close();
        }
      }
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}
process.exit(failures ? 1 : 0);
