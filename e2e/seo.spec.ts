import { expect, test } from "@playwright/test";
import { caseStudies } from "@/content/case-studies";

type Node = Record<string, unknown>;

async function jsonLd(page: import("@playwright/test").Page): Promise<Node[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap((b) => (JSON.parse(b)["@graph"] as Node[]) ?? []);
}

test.describe("server-rendered HTML with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("home has one h1 carrying the full headline", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    expect((await h1.innerText()).replace(/\s+/g, " ").trim()).toBe("Turn Difficult Websites Into Reliable Data.");
  });

  test("animated content is forced visible without JS", async ({ page }) => {
    await page.goto("/");
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll("[data-reveal]")].filter((el) => {
        const s = getComputedStyle(el);
        return s.opacity !== "1" || s.transform !== "none";
      }).length,
    );
    expect(hidden).toBe(0);
  });

  test("every homepage section is present in the HTML", async ({ page }) => {
    await page.goto("/");
    for (const id of ["services", "about", "case-studies", "tech-stack", "testimonials", "faq", "contact"]) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
  });

  test("head tags: title, description, canonical, robots, Open Graph, lang", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Ahraf Khatri | Web Scraping & Data Extraction Consultant");
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description!.length).toBeGreaterThan(70);
    expect(description!.length).toBeLessThanOrEqual(160);
    expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).pathname).toBe("/");
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("index");
    expect(await page.locator('meta[property="og:image"]').first().getAttribute("content")).toContain("/opengraph-image");
    expect(await page.locator('meta[property="og:type"]').getAttribute("content")).toBe("website");
    expect(await page.locator("html").getAttribute("lang")).toBe("en");
  });

  test("JSON-LD graph has Person, ProfessionalService, WebSite and FAQPage", async ({ page }) => {
    await page.goto("/");
    const types = (await jsonLd(page)).map((n) => n["@type"]);
    expect(types).toEqual(expect.arrayContaining(["Person", "ProfessionalService", "WebSite", "FAQPage"]));
  });

  test("FAQ structured data matches the visible FAQ exactly", async ({ page }) => {
    await page.goto("/");
    const faqNode = (await jsonLd(page)).find((n) => n["@type"] === "FAQPage") as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    const visibleQuestions = await page.locator("#faq details h3").allInnerTexts();
    const visibleAnswers = await page.locator("#faq details p").allTextContents();
    expect(faqNode.mainEntity).toHaveLength(8);
    expect(faqNode.mainEntity.map((q) => q.name)).toEqual(visibleQuestions.map((q) => q.trim()));
    expect(faqNode.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(visibleAnswers.map((a) => a.trim()));
  });

  for (const cs of caseStudies) {
    test(`case study "${cs.slug}" is fully server-rendered with article metadata`, async ({ page }) => {
      await page.goto(`/case-studies/${cs.slug}`);
      await expect(page.locator("h1")).toHaveText(cs.title);
      await expect(page).toHaveTitle(`${cs.title} | Ahraf Khatri`);
      expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).pathname).toBe(`/case-studies/${cs.slug}`);
      expect(await page.locator('meta[property="og:type"]').getAttribute("content")).toBe("article");
      const nodes = await jsonLd(page);
      expect(nodes.map((n) => n["@type"])).toEqual(expect.arrayContaining(["TechArticle", "BreadcrumbList"]));
      await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    });
  }
});

test.describe("machine-readable endpoints", () => {
  test("sitemap.xml lists the home page and every case study", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect((xml.match(/<loc>/g) ?? []).length).toBe(1 + caseStudies.length);
    for (const cs of caseStudies) expect(xml).toContain(`/case-studies/${cs.slug}`);
  });

  test("robots.txt allows AI search crawlers and points at the sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const txt = await res.text();
    for (const bot of ["OAI-SearchBot", "PerplexityBot", "Claude-SearchBot", "GPTBot"]) expect(txt).toContain(`User-Agent: ${bot}`);
    expect(txt).toContain("Disallow: /api/");
    expect(txt).toMatch(/Sitemap: http:\/\/127\.0\.0\.1:3100\/sitemap\.xml/);
  });

  test("llms.txt and llms-full.txt are plain-text Markdown", async ({ request }) => {
    const short = await request.get("/llms.txt");
    expect(short.headers()["content-type"]).toContain("text/plain");
    expect(await short.text()).toMatch(/^# Ahraf Khatri/);
    const full = await request.get("/llms-full.txt");
    expect(full.headers()["content-type"]).toContain("text/plain");
    expect(await full.text()).toContain("## Frequently asked questions");
  });

  test("manifest, favicon and social images resolve", async ({ request }) => {
    expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
    expect((await request.get("/icon.svg")).status()).toBe(200);
    const og = await request.get("/opengraph-image");
    expect(og.headers()["content-type"]).toContain("image/png");
    expect((await request.get(`/case-studies/${caseStudies[0].slug}/opengraph-image`)).status()).toBe(200);
  });

  test("unknown routes return a real 404", async ({ request }) => {
    expect((await request.get("/nope")).status()).toBe(404);
    expect((await request.get("/case-studies/nope")).status()).toBe(404);
  });
});
