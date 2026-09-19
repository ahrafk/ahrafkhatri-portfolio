import { describe, expect, it } from "vitest";
import { AI_RETRIEVAL_CRAWLERS, AI_TRAINING_CRAWLERS } from "./crawlers";
import { buildRobots } from "./robots";

type Rule = { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] };
const rulesOf = (r: ReturnType<typeof buildRobots>) => (Array.isArray(r.rules) ? r.rules : [r.rules]) as Rule[];

describe("buildRobots", () => {
  it("allows everything except the API for all crawlers", () => {
    const star = rulesOf(buildRobots({ allowAiTraining: true, siteUrl: "https://x.test" })).find((r) => r.userAgent === "*");
    expect(star?.allow).toBe("/");
    expect(star?.disallow).toContain("/api/");
  });

  it("always allows AI search and answer crawlers", () => {
    for (const allowAiTraining of [true, false]) {
      const rules = rulesOf(buildRobots({ allowAiTraining, siteUrl: "https://x.test" }));
      const rule = rules.find((r) => Array.isArray(r.userAgent) && AI_RETRIEVAL_CRAWLERS.every((c) => (r.userAgent as string[]).includes(c)));
      expect(rule?.allow).toBe("/");
    }
  });

  it("allows training crawlers when enabled", () => {
    const rules = rulesOf(buildRobots({ allowAiTraining: true, siteUrl: "https://x.test" }));
    const rule = rules.find((r) => Array.isArray(r.userAgent) && (r.userAgent as string[]).includes("GPTBot"));
    expect(rule?.allow).toBe("/");
    expect(rule?.disallow).not.toBe("/");
  });

  it("blocks training crawlers when disabled", () => {
    const rules = rulesOf(buildRobots({ allowAiTraining: false, siteUrl: "https://x.test" }));
    const rule = rules.find((r) => Array.isArray(r.userAgent) && AI_TRAINING_CRAWLERS.every((c) => (r.userAgent as string[]).includes(c)));
    expect(rule?.disallow).toBe("/");
  });

  it("points at the sitemap", () => {
    expect(buildRobots({ allowAiTraining: true, siteUrl: "https://x.test" }).sitemap).toBe("https://x.test/sitemap.xml");
  });
});
