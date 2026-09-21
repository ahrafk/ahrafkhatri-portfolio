import { expect, test } from "@playwright/test";
import { testimonials } from "@/content/testimonials";

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
    // The accessible name stays "Pause animation" in both states; `aria-pressed` carries the state.
    const toggle = page.getByRole("button", { name: "Pause animation" });
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "true");
    const frozen = await el.getAttribute("data-phase");
    await page.waitForTimeout(2800); // longer than any phase (the longest is 2.7 s), so a running loop would have moved on
    expect(await el.getAttribute("data-phase")).toBe(frozen);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-pressed", "false");
    // Resuming arms a fresh timer for the current phase, so allow the longest phase plus slack instead of sleeping.
    await expect.poll(() => el.getAttribute("data-phase"), { timeout: 4000 }).not.toBe(frozen);
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

  test("unverified placeholder testimonials are never published, and no images appear", async ({ page }) => {
    await page.goto("/");
    for (const t of testimonials.filter((x) => x.placeholder)) {
      await expect(page.getByText(t.quote)).toHaveCount(0);
    }
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

test.describe("header brand link and skip link", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  // WCAG 2.5.3 Label in Name: the accessible name has to contain the text people can see (axe: label-content-name-mismatch).
  test("the brand link's accessible name contains its visible text", async ({ page }) => {
    await page.goto("/");
    const brand = page.getByRole("banner").getByRole("link").first();
    await expect(brand).toHaveAccessibleName(/^Ahraf Khatri\s+Web Intelligence Consultant\W+home$/);
  });

  test("the skip link focuses main without outlining the whole page, and Tab then enters the content", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");

    const main = page.locator("main#main");
    await expect(main).toBeFocused();
    await expect(main).toHaveCSS("outline-style", "none");

    await page.keyboard.press("Tab");
    expect(await page.evaluate(() => document.querySelector("main")!.contains(document.activeElement))).toBe(true);
    expect(await page.evaluate(() => document.activeElement === document.querySelector("main"))).toBe(false);
  });
});

test.describe("keyboard focus", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  type Pg = import("@playwright/test").Page;

  /**
   * Scroll waiting that a stale event cannot satisfy. `arm` runs BEFORE the action and resets the watcher;
   * `settled` then waits for a scroll that really started to finish (`scrollend`), or for a long still
   * window when the action needed no scroll. Frame-counted throughout, never a fixed timeout.
   */
  const arm = (page: Pg) =>
    page.evaluate(() => {
      const w = window as unknown as { __watch?: { moved: boolean; ended: boolean }; __onScroll?: () => void; __onEnd?: () => void };
      if (w.__onScroll) window.removeEventListener("scroll", w.__onScroll);
      if (w.__onEnd) window.removeEventListener("scrollend", w.__onEnd);
      const watch = { moved: false, ended: false };
      w.__watch = watch;
      w.__onScroll = () => {
        watch.moved = true;
        watch.ended = false;
      };
      w.__onEnd = () => {
        watch.ended = true;
      };
      window.addEventListener("scroll", w.__onScroll, { passive: true });
      window.addEventListener("scrollend", w.__onEnd);
    });

  const settled = (page: Pg) =>
    page.waitForFunction(
      () =>
        new Promise((resolve) => {
          const watch = (window as unknown as { __watch: { moved: boolean; ended: boolean } }).__watch;
          let idle = 0;
          let last = window.scrollY;
          const tick = () => {
            if (window.scrollY === last) idle++;
            else {
              idle = 0;
              last = window.scrollY;
            }
            if (watch.moved && watch.ended && idle >= 3) return resolve(true);
            if (idle >= 40) return resolve(true);
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }),
    );

  const focused = (page: Pg) =>
    page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      return { name: el.getAttribute("name") ?? el.id ?? el.tagName, top: Math.round(el.getBoundingClientRect().top) };
    });

  // `html { scroll-padding-top }` in globals.css is what keeps a control the browser scrolls into view
  // from landing behind the fixed header (WCAG 2.2 AA 2.4.11, Focus Not Obscured). Without it the contact
  // form's upper fields settle underneath it.
  test("scrolling a control into view never leaves it behind the fixed header", async ({ page }) => {
    await page.goto("/");
    const headerHeight = await page.getByRole("banner").evaluate((el) => el.getBoundingClientRect().height);
    expect(headerHeight).toBeGreaterThan(0);

    const obscured: { control: string; top: number; headerHeight: number }[] = [];
    const record = async (label: string) => {
      await settled(page);
      const { name, top } = await focused(page);
      if (top < headerHeight) obscured.push({ control: `${label} (${name})`, top, headerHeight });
    };

    // Walk back up the contact form from its submit button: every field above it starts off-screen.
    await arm(page);
    await page.getByRole("button", { name: "Send message" }).focus();
    await settled(page);
    for (const field of ["message", "budget", "project type", "email", "name"]) {
      await arm(page);
      await page.keyboard.press("Shift+Tab");
      await record(`Shift+Tab to ${field}`);
    }

    // The journey ContactForm makes when validation fails: focus() on a field far off-screen.
    // Blur first -- the walk above ended on this very field, and focus() on the focused element does nothing.
    await page.evaluate(() => (document.activeElement as HTMLElement).blur());
    await arm(page);
    await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
    await settled(page);
    await arm(page);
    await page.getByLabel("Name").focus();
    await record("programmatic focus on Name");

    expect(obscured).toEqual([]);
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
