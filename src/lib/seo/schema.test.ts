import { describe, expect, it } from "vitest";
import { caseStudies } from "@/content/case-studies";
import { faq } from "@/content/faq";
import { site } from "@/content/site";
import { breadcrumbSchema, caseStudyGraph, faqSchema, homeGraph, ids, serializeJsonLd } from "./schema";

type Node = Record<string, unknown>;

function collectIds(value: unknown, defined = new Set<string>(), refs = new Set<string>()) {
  if (Array.isArray(value)) value.forEach((v) => collectIds(v, defined, refs));
  else if (value && typeof value === "object") {
    const obj = value as Node;
    const keys = Object.keys(obj);
    if (keys.length === 1 && keys[0] === "@id") refs.add(obj["@id"] as string);
    else if (typeof obj["@id"] === "string") defined.add(obj["@id"] as string);
    Object.values(obj).forEach((v) => collectIds(v, defined, refs));
  }
  return { defined, refs };
}

describe("home graph", () => {
  const graph = homeGraph()["@graph"] as Node[];
  const types = graph.map((n) => n["@type"]);

  it("contains the entity types answer engines look for", () => {
    expect(types).toEqual(expect.arrayContaining(["Person", "ProfessionalService", "WebSite", "FAQPage"]));
  });

  it("gives the person and the service the same plain email address", () => {
    const person = graph.find((n) => n["@type"] === "Person") as Node;
    const service = graph.find((n) => n["@type"] === "ProfessionalService") as Node;
    expect(person.email).toBe(site.email);
    expect(service.email).toBe(site.email);
  });

  it("links the person to LinkedIn and GitHub via sameAs", () => {
    const person = graph.find((n) => n["@type"] === "Person") as Node;
    expect(person.sameAs).toEqual([site.social.linkedin, site.social.github]);
    expect(person.address).toMatchObject({ addressLocality: "Mumbai", addressCountry: "IN" });
  });

  it("resolves every @id reference inside the same document", () => {
    const { defined, refs } = collectIds(homeGraph());
    for (const ref of refs) expect(defined).toContain(ref);
  });

  it("uses the shared @id constants", () => {
    const { defined } = collectIds(homeGraph());
    expect([...defined]).toEqual(expect.arrayContaining([ids.person, ids.service, ids.website]));
  });
});

describe("faqSchema", () => {
  it("mirrors the visible FAQ exactly", () => {
    const s = faqSchema(faq);
    const entities = s.mainEntity as { name: string; acceptedAnswer: { text: string } }[];
    expect(entities).toHaveLength(faq.length);
    entities.forEach((q, i) => {
      expect(q.name).toBe(faq[i].question);
      expect(q.acceptedAnswer.text).toBe(faq[i].answer);
    });
  });
});

describe("case study graph", () => {
  const cs = caseStudies[0];
  const graph = caseStudyGraph(cs)["@graph"] as Node[];

  it("contains a TechArticle authored by the person and a BreadcrumbList", () => {
    const article = graph.find((n) => n["@type"] === "TechArticle") as Node;
    expect(article.author).toEqual({ "@id": ids.person });
    expect(article.datePublished).toBe(cs.datePublished);
    expect(graph.some((n) => n["@type"] === "BreadcrumbList")).toBe(true);
  });

  it("resolves every @id reference inside the same document", () => {
    const { defined, refs } = collectIds(caseStudyGraph(cs));
    for (const ref of refs) expect(defined).toContain(ref);
  });
});

describe("breadcrumbSchema", () => {
  it("numbers items from 1 with absolute URLs", () => {
    const b = breadcrumbSchema([{ name: "Home", path: "/" }, { name: "X", path: "/x" }]);
    const items = b.itemListElement as { position: number; item: string }[];
    expect(items.map((i) => i.position)).toEqual([1, 2]);
    expect(items[1].item).toMatch(/^https?:\/\/.+\/x$/);
  });
});

describe("serializeJsonLd", () => {
  it("escapes < so the payload cannot close its script tag", () => {
    const out = serializeJsonLd({ a: "</script><b>" });
    expect(out).not.toContain("</script>");
    expect(JSON.parse(out).a).toBe("</script><b>");
  });
});
