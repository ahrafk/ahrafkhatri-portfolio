import { describe, expect, it } from "vitest";
import { caseStudies } from "@/content/case-studies";
import { buildSitemap } from "./sitemap";

describe("buildSitemap", () => {
  const entries = buildSitemap();

  it("lists the home page and every case study with absolute URLs", () => {
    expect(entries).toHaveLength(1 + caseStudies.length);
    for (const e of entries) expect(e.url).toMatch(/^https?:\/\//);
    for (const cs of caseStudies) expect(entries.some((e) => e.url.endsWith(`/case-studies/${cs.slug}`))).toBe(true);
  });

  it("gives the home page top priority and a lastModified date", () => {
    expect(entries[0].priority).toBe(1);
    expect(entries.every((e) => Boolean(e.lastModified))).toBe(true);
  });
});
