import { describe, expect, it } from "vitest";
import { caseStudies } from "@/content/case-studies";
import { faq } from "@/content/faq";
import { site } from "@/content/site";
import { buildLlmsFullTxt, buildLlmsTxt } from "./llms";

describe("llms.txt", () => {
  const out = buildLlmsTxt();

  it("starts with an H1, a blockquote summary and link sections", () => {
    const lines = out.split("\n");
    expect(lines[0]).toBe(`# ${site.name}`);
    expect(out).toContain(`> ${site.description}`);
    expect(out).toContain("## Services");
    expect(out).toContain("## Case studies");
    expect(out).toContain("## Contact");
  });

  it("links every case study with an absolute URL", () => {
    for (const cs of caseStudies) expect(out).toMatch(new RegExp(`\\[${cs.title.replace(/[+]/g, "\\+")}\\]\\(https?://[^)]+/case-studies/${cs.slug}\\)`));
  });

  it("never prints undefined", () => expect(out).not.toContain("undefined"));
});

describe("llms-full.txt", () => {
  const out = buildLlmsFullTxt();

  it("includes every FAQ question and answer", () => {
    for (const f of faq) {
      expect(out).toContain(f.question);
      expect(out).toContain(f.answer);
    }
  });

  it("includes case study problems and outcomes", () => {
    for (const cs of caseStudies) {
      expect(out).toContain(cs.problem);
      for (const o of cs.outcomes) expect(out).toContain(o);
    }
  });

  it("includes the tech stack groups and contact details", () => {
    expect(out).toContain("Scraping & Automation");
    expect(out).toContain(site.email);
    expect(out).not.toContain("undefined");
  });
});
