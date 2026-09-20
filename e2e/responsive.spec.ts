import { expect, test, type Page } from "@playwright/test";
import { caseStudies } from "@/content/case-studies";

const widths = [375, 768, 1024, 1440];
const schemes = ["light", "dark"] as const;

async function revealEverything(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

for (const width of widths) {
  for (const scheme of schemes) {
    test(`home at ${width}px (${scheme}): no horizontal scroll`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "networkidle" });
      await revealEverything(page);
      expect(await overflow(page)).toBeLessThanOrEqual(0);
      await page.screenshot({ path: `e2e/.output/home-${width}-${scheme}.png`, fullPage: true });
      await context.close();
    });
  }

  test(`case study pages at ${width}px: no horizontal scroll`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const cs of caseStudies) {
      await page.goto(`/case-studies/${cs.slug}`, { waitUntil: "networkidle" });
      await revealEverything(page);
      expect(await overflow(page), cs.slug).toBeLessThanOrEqual(0);
      await page.screenshot({ path: `e2e/.output/cs-${cs.slug}-${width}.png`, fullPage: true });
    }
    await context.close();
  });
}

// The nav header is `position: fixed`, so overflow inside it never widens the document and the checks above cannot
// see it. At 1024px the desktop nav has just switched on and uses `whitespace-nowrap`, which is the tightest fit.
test.describe("desktop nav at the 1024px breakpoint", () => {
  test.use({ viewport: { width: 1024, height: 900 } });

  for (const path of ["/", `/case-studies/${caseStudies[0].slug}`]) {
    test(`header ${path} does not overflow and every nav control is inside the viewport`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" });
      const header = page.getByRole("banner");
      await expect(header).toBeVisible();

      const { scrollWidth, clientWidth } = await header.evaluate((el) => ({ scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);

      const innerWidth = await page.evaluate(() => window.innerWidth);
      const controls = [
        ...(await header.getByRole("navigation", { name: "Primary" }).getByRole("link").all()),
        header.getByRole("link", { name: /Let's Work Together/ }),
      ];
      expect(controls.length).toBeGreaterThan(1);
      for (const control of controls) {
        await expect(control).toBeVisible();
        const box = (await control.boundingBox())!;
        const label = (await control.innerText()).trim();
        expect(box.x, `${label} left edge`).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width, `${label} right edge`).toBeLessThanOrEqual(innerWidth);
      }
    });
  }
});

test("buttons and form controls are at least 44px tall on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/", { waitUntil: "networkidle" });
  const tooSmall = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("button, [role=button], input:not([type=hidden]), select, textarea")]
      .filter((el) => el.offsetParent !== null && !el.closest("[aria-hidden=true]"))
      .map((el) => ({ el: el.outerHTML.slice(0, 80), h: el.getBoundingClientRect().height }))
      .filter((x) => x.h > 0 && x.h < 44),
  );
  expect(tooSmall).toEqual([]);
});
