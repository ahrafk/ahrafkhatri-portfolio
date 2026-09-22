export type HeadlineSegment = { text: string; accent?: boolean };

export type Hero = {
  eyebrow: string;
  headline: HeadlineSegment[][];
  intro: string;
  ticks: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  facts: { icon: "pin" | "clock" | "globe" | "layers" | "badge" | "briefcase"; label: string }[];
};

export const hero: Hero = {
  eyebrow: "Data Engineer | Web Intelligence Consultant",
  // Three deliberate lines. Concatenated with single spaces they must still read
  // "Turn Difficult Websites Into Reliable Data." (`content.test.ts` enforces it).
  headline: [[{ text: "Turn Difficult" }], [{ text: "Websites Into" }], [{ text: "Reliable Data.", accent: true }]],
  intro:
    "I build production-grade web scraping and data extraction systems for startups, businesses, research teams, and enterprises that need data at scale.",
  ticks: [
    "Complex web scraping",
    "Scalable data pipelines",
    "Anti-bot aware solutions",
    "Cloud-ready infrastructure",
    "OCR & document extraction",
    "Reliable & ethical data solutions",
  ],
  primaryCta: { label: "Discuss Your Project", href: "/#contact" },
  secondaryCta: { label: "View Case Studies", href: "/#case-studies" },
  facts: [
    { icon: "pin", label: "Mumbai, India" },
    { icon: "clock", label: "5+ Years Experience" },
    { icon: "briefcase", label: "35+ Projects Completed" },
    { icon: "globe", label: "Global Clients" },
    { icon: "layers", label: "Scalable Solutions" },
    { icon: "badge", label: "Reliable & Ethical" },
  ],
};
