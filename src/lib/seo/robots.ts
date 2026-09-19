import type { MetadataRoute } from "next";
import { AI_RETRIEVAL_CRAWLERS, AI_TRAINING_CRAWLERS } from "./crawlers";

type Rule = Extract<MetadataRoute.Robots["rules"], unknown[]>[number];

export function buildRobots(opts: { allowAiTraining: boolean; siteUrl: string }): MetadataRoute.Robots {
  // A named user-agent group replaces the `*` group, so the API exclusion is repeated in each allow rule.
  const open = { allow: "/", disallow: ["/api/"] };
  const rules: Rule[] = [
    { userAgent: "*", ...open },
    { userAgent: [...AI_RETRIEVAL_CRAWLERS], ...open },
    opts.allowAiTraining
      ? { userAgent: [...AI_TRAINING_CRAWLERS], ...open }
      : { userAgent: [...AI_TRAINING_CRAWLERS], disallow: "/" },
  ];
  return { rules, sitemap: `${opts.siteUrl}/sitemap.xml` };
}
