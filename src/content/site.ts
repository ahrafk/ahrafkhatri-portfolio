// NEXT_PUBLIC_* is inlined when `next build` runs, so this guard fires at build time and never at runtime.
// An empty value counts as unset: it would otherwise produce relative canonical, sitemap and JSON-LD URLs.
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL must be set before `next build` (for example https://your-domain.com; see the README's Configuration section).",
  );
}

const raw = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const SITE_URL = raw.replace(/\/+$/, "");

export function absoluteUrl(path = "/"): string {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export const site = {
  name: "Ahraf Khatri",
  brand: "Ahraf Khatri",
  jobTitle: "Data Engineer and Web Intelligence Consultant",
  homeTitle: "Ahraf Khatri | Web Scraping & Data Extraction Consultant",
  description:
    "Data engineer building production-grade web scraping, anti-bot infrastructure, OCR document extraction and ETL pipelines for startups and research teams.",
  location: {
    locality: "Mumbai",
    region: "Maharashtra",
    country: "India",
    countryCode: "IN",
  },
  email: "ahraf.khatri7@gmail.com",
  social: {
    linkedin: "https://www.linkedin.com/in/ahrafkhatri",
    github: "https://github.com/ahrafk",
  },
  knowsAbout: [
    "Web scraping",
    "Data extraction",
    "Anti-bot mitigation",
    "OCR and document processing",
    "ETL pipelines",
    "Data engineering",
    "Python",
    "Playwright",
    "Apache Airflow",
  ],
  keywords: [
    "web scraping consultant",
    "data extraction",
    "anti-bot scraping",
    "OCR document extraction",
    "ETL pipelines",
    "data engineer Mumbai",
  ],
  /** Flip to false to disallow AI-training crawlers in robots.txt. Search/answer crawlers stay allowed. */
  allowAiTrainingCrawlers: true,
  /** ISO date of the last meaningful content change; feeds the sitemap. */
  lastUpdated: "2026-09-19",
} as const;
