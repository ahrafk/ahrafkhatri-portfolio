import { describe, expect, it } from "vitest";
import { about } from "./about";
import { caseStudies, getCaseStudy } from "./case-studies";
import { budgetLabels, budgetValues, projectTypeLabels, projectTypeValues } from "./contact";
import { faq } from "./faq";
import { hero } from "./hero";
import { navLinks } from "./sections";
import { services } from "./services";
import { absoluteUrl, site } from "./site";
import { stackGroups } from "./stack";
import { stats } from "./stats";
import { publishedTestimonials, testimonials } from "./testimonials";

const words = (s: string) => s.trim().split(/\s+/).length;

describe("site", () => {
  it("keeps the home title within 60 characters", () => {
    expect(site.homeTitle.length).toBeLessThanOrEqual(60);
  });
  it("keeps the description within 160 characters", () => {
    expect(site.description.length).toBeLessThanOrEqual(160);
    expect(site.description.length).toBeGreaterThan(70);
  });
  it("builds absolute URLs without doubled slashes", () => {
    expect(absoluteUrl("/x")).toMatch(/^https?:\/\/[^/]+\/x$/);
    expect(absoluteUrl("y")).toMatch(/^https?:\/\/[^/]+\/y$/);
  });
});

describe("hero", () => {
  it("has six capability ticks", () => expect(hero.ticks).toHaveLength(6));
  it("headline reads as one sentence", () => {
    const text = hero.headline.map((line) => line.map((s) => s.text).join(" ")).join(" ");
    expect(text).toBe("Turn Difficult Websites Into Reliable Data.");
  });
});

describe("navigation", () => {
  it("lists the six in-scope sections in order", () => {
    expect(navLinks.map((l) => l.id)).toEqual(["about", "services", "case-studies", "tech-stack", "faq", "contact"]);
  });
});

describe("services and stats", () => {
  it("has six services with unique ids", () => {
    expect(services).toHaveLength(6);
    expect(new Set(services.map((s) => s.id)).size).toBe(6);
  });
  it("has four stats", () => expect(stats).toHaveLength(4));
});

describe("about", () => {
  it("has at least two paragraphs and a quote", () => {
    expect(about.paragraphs.length).toBeGreaterThanOrEqual(2);
    expect(about.quote.length).toBeGreaterThan(10);
  });
});

describe("case studies", () => {
  it("has three studies with unique slugs", () => {
    expect(caseStudies).toHaveLength(3);
    expect(new Set(caseStudies.map((c) => c.slug)).size).toBe(3);
  });
  it("keeps every <title> within 60 characters including the template", () => {
    for (const cs of caseStudies) expect(`${cs.title} | ${site.name}`.length).toBeLessThanOrEqual(60);
  });
  it("keeps meta descriptions between 70 and 160 characters", () => {
    for (const cs of caseStudies) {
      expect(cs.metaDescription.length).toBeGreaterThanOrEqual(70);
      expect(cs.metaDescription.length).toBeLessThanOrEqual(160);
    }
  });
  it("has at least three approach steps, four architecture stages and two outcomes", () => {
    for (const cs of caseStudies) {
      expect(cs.approach.length).toBeGreaterThanOrEqual(3);
      expect(cs.architecture.length).toBeGreaterThanOrEqual(4);
      expect(cs.outcomes.length).toBeGreaterThanOrEqual(2);
    }
  });
  it("looks studies up by slug", () => {
    expect(getCaseStudy("etl-pipeline")?.title).toBe("High-Volume ETL Pipeline");
    expect(getCaseStudy("nope")).toBeUndefined();
  });
});

describe("tech stack", () => {
  it("has four groups and every item is named", () => {
    expect(stackGroups).toHaveLength(4);
    for (const g of stackGroups) {
      expect(g.items.length).toBeGreaterThan(0);
      for (const item of g.items) {
        expect(item.name.length).toBeGreaterThan(0);
        expect(item.monogram.length).toBeGreaterThan(0);
        if (item.icon) {
          expect(item.icon.path.length).toBeGreaterThan(10);
          expect(item.icon.hex).toMatch(/^[0-9A-Fa-f]{6}$/);
        }
      }
    }
  });
});

describe("testimonials", () => {
  it("has three entries with monograms and no image fields", () => {
    expect(testimonials).toHaveLength(3);
    for (const t of testimonials) {
      expect(t.monogram).toMatch(/^[A-Z]{1,3}$/);
      expect(Object.keys(t)).not.toContain("avatar");
      expect(Object.keys(t)).not.toContain("image");
    }
  });
});

describe("published testimonials", () => {
  it("never publishes entries flagged as placeholders", () => {
    expect(publishedTestimonials.every((t) => !t.placeholder)).toBe(true);
    expect(publishedTestimonials.length).toBe(testimonials.filter((t) => !t.placeholder).length);
  });
  it("publishes nothing while every entry is still a placeholder", () => {
    // The three quotes from the original design are unverified, so the section stays hidden until real ones replace them.
    expect(testimonials.every((t) => t.placeholder)).toBe(true);
    expect(publishedTestimonials).toHaveLength(0);
  });
});

describe("faq", () => {
  it("has eight unique questions ending in a question mark", () => {
    expect(faq).toHaveLength(8);
    expect(new Set(faq.map((f) => f.question)).size).toBe(8);
    for (const f of faq) expect(f.question.endsWith("?")).toBe(true);
  });
  it("answers each question directly in 30 to 70 words", () => {
    for (const f of faq) {
      expect(words(f.answer)).toBeGreaterThanOrEqual(30);
      expect(words(f.answer)).toBeLessThanOrEqual(70);
    }
  });
});

describe("contact options", () => {
  it("has a label for every project type and budget value", () => {
    for (const v of projectTypeValues) expect(projectTypeLabels[v]).toBeTruthy();
    for (const v of budgetValues) expect(budgetLabels[v]).toBeTruthy();
  });
});
