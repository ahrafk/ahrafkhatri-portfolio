import type { MetadataRoute } from "next";
import { site, SITE_URL } from "@/content/site";
import { buildRobots } from "@/lib/seo/robots";

export default function robots(): MetadataRoute.Robots {
  return buildRobots({ allowAiTraining: site.allowAiTrainingCrawlers, siteUrl: SITE_URL });
}
