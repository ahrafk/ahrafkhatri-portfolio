import type { CaseStudy } from "@/content/case-studies";
import { faq, type FaqItem } from "@/content/faq";
import { services } from "@/content/services";
import { absoluteUrl, site, SITE_URL } from "@/content/site";

type Node = Record<string, unknown>;

export const ids = {
  person: `${SITE_URL}/#person`,
  service: `${SITE_URL}/#service`,
  website: `${SITE_URL}/#website`,
} as const;

const address = {
  "@type": "PostalAddress",
  addressLocality: site.location.locality,
  addressRegion: site.location.region,
  addressCountry: site.location.countryCode,
};

export function personSchema(): Node {
  return {
    "@type": "Person",
    "@id": ids.person,
    name: site.name,
    url: SITE_URL,
    jobTitle: site.jobTitle,
    description: site.description,
    email: site.email,
    address,
    knowsAbout: [...site.knowsAbout],
    sameAs: [site.social.linkedin, site.social.github],
    worksFor: { "@id": ids.service },
  };
}

export function serviceSchema(): Node {
  return {
    "@type": "ProfessionalService",
    "@id": ids.service,
    name: `${site.name}: Web Intelligence Consulting`,
    url: SITE_URL,
    description: site.description,
    serviceType: services.map((s) => s.title),
    areaServed: "Worldwide",
    address,
    email: site.email,
    founder: { "@id": ids.person },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Web data services",
      itemListElement: services.map((s) => ({
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: s.title, description: s.description },
      })),
    },
  };
}

export function websiteSchema(): Node {
  return {
    "@type": "WebSite",
    "@id": ids.website,
    url: SITE_URL,
    name: site.name,
    description: site.description,
    inLanguage: "en",
    publisher: { "@id": ids.person },
  };
}

export function faqSchema(items: FaqItem[]): Node {
  return {
    "@type": "FAQPage",
    "@id": `${SITE_URL}/#faq`,
    mainEntity: items.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: { "@type": "Answer", text: q.answer },
    })),
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]): Node {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function techArticleSchema(cs: CaseStudy): Node {
  const url = absoluteUrl(`/case-studies/${cs.slug}`);
  return {
    "@type": "TechArticle",
    "@id": `${url}#article`,
    headline: cs.title,
    description: cs.summary,
    url,
    mainEntityOfPage: url,
    inLanguage: "en",
    about: cs.category,
    datePublished: cs.datePublished,
    dateModified: cs.dateModified,
    image: `${url}/opengraph-image`,
    author: { "@id": ids.person },
    publisher: { "@id": ids.person },
    isPartOf: { "@id": ids.website },
  };
}

const baseNodes = () => [personSchema(), serviceSchema(), websiteSchema()];

export function homeGraph() {
  return { "@context": "https://schema.org", "@graph": [...baseNodes(), faqSchema(faq)] };
}

export function caseStudyGraph(cs: CaseStudy) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      ...baseNodes(),
      techArticleSchema(cs),
      breadcrumbSchema([
        { name: "Home", path: "/" },
        { name: "Case studies", path: "/#case-studies" },
        { name: cs.title, path: `/case-studies/${cs.slug}` },
      ]),
    ],
  };
}

/** JSON.stringify with `<` escaped so the payload can never close its own script tag. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
