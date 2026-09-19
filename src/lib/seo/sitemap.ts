import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/case-studies";
import { absoluteUrl, site } from "@/content/site";

export function buildSitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), lastModified: site.lastUpdated, changeFrequency: "monthly", priority: 1 },
    ...caseStudies.map((cs) => ({
      url: absoluteUrl(`/case-studies/${cs.slug}`),
      lastModified: cs.dateModified,
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
  ];
}
