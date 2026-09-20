import { expect, test } from "@playwright/test";

test.describe("hero pipeline", () => {
  test("cycles through all five phases", async ({ page }) => {
    await page.goto("/");
    const el = page.locator("[data-phase]");
    const seen = new Set<string>();
    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline && seen.size < 5) {
      const phase = await el.getAttribute("data-phase");
      if (phase) seen.add(phase);
      await page.waitForTimeout(100);
    }
    expect([...seen].sort()).toEqual(["hold", "output", "parse", "raw", "scan"]);
  });

  test("pause freezes it and play resumes", async ({ page }) => {
    await page.goto("/");
    const el = page.locator("[data-phase]");
    await page.getByRole("button", { name: "Pause animation" }).click();
    const frozen = await el.getAttribute("data-phase");
    await page.waitForTimeout(2800);
    expect(await el.getAttribute("data-phase")).toBe(frozen);
    await expect(page.getByRole("button", { name: "Pause animation" })).toHaveAttribute("aria-pressed", "true");
  });

  test("reduced motion shows the finished frame and hides the pause control", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const el = page.locator("[data-phase]");
    await expect(el).toHaveAttribute("data-phase", "hold");
    await page.waitForTimeout(2500);
    await expect(el).toHaveAttribute("data-phase", "hold");
    await expect(page.getByRole("button", { name: /pause animation/i })).toHaveCount(0);
    await context.close();
  });
});

test.describe("theme", () => {
  test.use({ colorScheme: "light" });

  test("toggle switches the theme and the choice persists across reloads", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(html).toHaveClass(/dark/);
    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });
});

test.describe("navigation", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("nav link scrolls to its section and becomes current", async ({ page }) => {
    await page.goto("/");
    const primary = page.getByRole("navigation", { name: "Primary" });
    await primary.getByRole("link", { name: "Services" }).click();
    await expect(page).toHaveURL(/#services$/);
    await expect(primary.getByRole("link", { name: "Services" })).toHaveAttribute("aria-current", "location");
    await expect(page.locator("#services")).toBeInViewport();
  });

  test("case study card opens its page and the breadcrumb returns to the list", async ({ page }) => {
    await page.goto("/#case-studies");
    await page.getByRole("link", { name: /View Details of Multilingual Document Data Extraction/ }).click();
    await expect(page).toHaveURL(/\/case-studies\/document-extraction$/);
    await expect(page.locator("h1")).toHaveText("Multilingual Document Data Extraction");
    await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Case studies" }).click();
    await expect(page).toHaveURL(/\/#case-studies$/);
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("opens, navigates and closes with Escape", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Mobile" })).toHaveCount(0);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "FAQ" }).click();
    await expect(page).toHaveURL(/#faq$/);
    await expect(page.getByRole("navigation", { name: "Mobile" })).toHaveCount(0);
  });
});

test.describe("sections", () => {
  test("stats settle on their final values", async ({ page }) => {
    await page.goto("/");
    const stats = page.locator('section[aria-label="Key figures"]');
    await stats.scrollIntoViewIfNeeded();
    await expect(stats).toContainText("100M+", { timeout: 5000 });
    await expect(stats).toContainText("99%");
  });

  test("marquee pause toggles its pressed state", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Pause capabilities scroll" });
    await button.click();
    await expect(page.getByRole("button", { name: "Pause capabilities scroll" })).toHaveAttribute("aria-pressed", "true");
  });

  test("testimonials use monograms, never images", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#testimonials img")).toHaveCount(0);
    await expect(page.locator("main img")).toHaveCount(0);
  });

  test("FAQ items expand and collapse", async ({ page }) => {
    await page.goto("/#faq");
    const second = page.locator("#faq details").nth(1);
    await expect(second).not.toHaveAttribute("open", "");
    await second.locator("summary").click();
    await expect(second).toHaveAttribute("open", "");
  });
});

test.describe("contact form", () => {
  test("shows friendly errors and focuses the first invalid field", async ({ page }) => {
    await page.goto("/#contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Please enter your name")).toBeVisible();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeFocused();
  });

  async function fill(page: import("@playwright/test").Page) {
    await page.getByLabel("Name").fill("Test Person");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Project type").selectOption("web-scraping");
    await page.getByLabel("Tell me about your project").fill("I need listings from ten portals delivered daily.");
  }

  test("confirms success when the API accepts the message", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ status: 200, json: { ok: true } }));
    await page.goto("/#contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText(/your message is on its way/i)).toBeVisible();
  });

  test("falls back to the mail client against the real route with no email key", async ({ page }) => {
    await page.goto("/#contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText(/Email isn't configured on the server yet/)).toBeVisible();
    await expect(page.getByRole("link", { name: /open email app again/i })).toHaveAttribute("href", /^mailto:/);
  });

  test("honeypot submissions are accepted silently by the real route", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { name: "Bot", email: "bot@example.com", projectType: "other", message: "spam spam spam spam spam spam", website: "http://spam.example" },
    });
    expect(res.status()).toBe(200);
  });
});
