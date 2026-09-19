import { describe, expect, it } from "vitest";
import manifest from "./manifest";
import robots from "./robots";
import sitemap from "./sitemap";
import { GET as llmsFull } from "./llms-full.txt/route";
import { GET as llms } from "./llms.txt/route";

describe("machine routes", () => {
  it("serves llms.txt as UTF-8 plain text", async () => {
    const res = llms();
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toMatch(/^# Ahraf Khatri/);
  });

  it("serves llms-full.txt as UTF-8 plain text", async () => {
    const res = llmsFull();
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toContain("## Frequently asked questions");
  });

  it("exposes a sitemap, robots rules and a manifest", () => {
    expect(sitemap().length).toBeGreaterThanOrEqual(4);
    expect(robots().sitemap).toMatch(/\/sitemap\.xml$/);
    expect(manifest()).toMatchObject({ name: "Ahraf Khatri", start_url: "/", display: "standalone" });
  });
});
