export const navLinks = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "case-studies", label: "Case Studies" },
  { id: "tech-stack", label: "Tech Stack" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
] as const;

export const sectionCopy = {
  capabilities: { label: "In every build" },
  services: {
    eyebrow: "What I do",
    title: "End-to-End Web Data Solutions",
    intro:
      "I design and build complete web data infrastructure, from extraction to structured, usable data. Not just scrapers, but reliable data pipelines that scale with your business.",
  },
  about: { eyebrow: "About me", title: "Data Engineer. Problem Solver. Always Curious." },
  caseStudies: {
    eyebrow: "Case studies",
    title: "Real Problems. Real Solutions.",
    intro: "Examples of complex data challenges I've solved.",
  },
  techStack: {
    eyebrow: "Tech stack",
    title: "Tools I Work With",
    intro: "A combination of modern tools and technologies to build scalable and reliable data systems.",
  },
  testimonials: {
    eyebrow: "Testimonials",
    title: "What Clients Say",
    intro: "Trusted by businesses, research teams and data-driven companies worldwide.",
  },
  faq: {
    eyebrow: "FAQ",
    title: "Questions I Get Asked",
    intro: "Straight answers about web scraping, document extraction and how we would work together.",
  },
  contact: {
    eyebrow: "Ready to work together?",
    title: "Let's Turn Your Data Challenges Into Opportunities.",
    intro:
      "Whether you need a complex scraper, a complete data pipeline, or help with a specific data problem, tell me what you're working on and I'll get back to you.",
  },
} as const;
