# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Ahraf Khatri's consulting portfolio (landing page plus 3 case study pages) with an animated extraction-pipeline hero, light/dark themes, a working contact form, and first-class SEO, AEO and GEO.

**Architecture:** Next.js App Router with server components by default; all copy lives in `src/content/*.ts` and feeds both the UI and the machine-readable outputs (JSON-LD, `llms.txt`, sitemap). Motion (Framer Motion's successor) runs in small client islands behind one `LazyMotion` provider. Pure logic (schema builders, robots, rate limit, form validation) is unit-tested with Vitest; the assembled site is verified with Playwright and Lighthouse.

**Tech Stack:** Next.js 16, React 19, TypeScript 5.9, Tailwind CSS 4, Motion 13 (`motion/react`), next-themes, zod 4, Resend 6, lucide-react, simple-icons, Vitest 5, Playwright, Lighthouse.

**Spec:** `docs/superpowers/specs/2026-09-19-portfolio-website-design.md`

## Global Constraints

Every task's requirements implicitly include these, copied from the spec.

- No people imagery: no photo, no face, no human illustration, no avatars. Testimonials use initial monograms.
- Stack: Next.js (App Router), TypeScript, React Server Components by default, Tailwind CSS v4 with CSS-variable design tokens, Motion used through `LazyMotion` + `domAnimation` and `m.*` components, `next-themes`, `next/font`, `lucide-react`, `simple-icons`, `zod`, Resend.
- Motion: animate only `transform` and `opacity` (plus SVG stroke offset). Durations 150–300ms for UI feedback, 500–800ms for entrances. Ease-out curve for entrances; springs (stiffness about 300, damping about 30) for interaction. `MotionConfig reducedMotion="user"` wraps the app.
- Content must stay visible without JavaScript: every element that starts hidden carries `data-reveal`, and a `<noscript>` style forces it visible.
- Copy lives in `src/content/`; components hold no section copy. `site.ts` is the single source for name, title, contact details, social links, canonical URL and location.
- Titles under 60 characters (including the `| Ahraf Khatri` template) and descriptions under 160 characters.
- WCAG 2.2 AA: contrast, visible focus rings, keyboard access, skip-to-content link, 44px minimum touch targets, form labels tied to inputs, error text linked with `aria-describedby`.
- Breakpoints 375, 768, 1024 and 1440px checked; no horizontal scroll on any.
- Nav links: About, Services, Case Studies, Tech Stack, FAQ, Contact. No Blog or Experience link.
- Core Web Vitals on a production build: LCP under 2.5s, CLS under 0.1, INP under 200ms. Lighthouse targets: Performance 95+, Accessibility 95+, Best Practices 95+, SEO 100. Report measured scores honestly.
- Do not invent facts. Testimonials, statistics and case study outcomes are user-owned placeholders taken from the design. No metrics beyond those in the design are added. The case study `stack` field is set only where the design names tools.
- American spelling in copy (normalize, not normalise), matching the source design.
- Commits end with the trailer `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`.

Working directory for every command: `/home/ahraf/Documents/portfolio_consulting` (call it `$ROOT`). The folder is not yet a git repository; Task 1 initialises one locally.

## File Structure

```
$ROOT/
├─ package.json  tsconfig.json  next.config.ts  postcss.config.mjs  eslint.config.mjs
├─ vitest.config.ts  vitest.setup.ts  playwright.config.ts  .gitignore  .env.example  README.md
├─ scripts/  shot.mjs (screenshots)  lighthouse.mjs (audits)
├─ e2e/      seo.spec.ts  site.spec.ts  responsive.spec.ts
└─ src/
   ├─ content/            site.ts hero.ts sections.ts services.ts capabilities.ts stats.ts
   │                      about.ts case-studies.ts stack.ts testimonials.ts faq.ts contact.ts
   ├─ lib/                cn.ts contact.ts rate-limit.ts og.tsx
   │  └─ seo/             metadata.ts schema.ts llms.ts crawlers.ts robots.ts sitemap.ts
   ├─ app/                layout.tsx page.tsx globals.css not-found.tsx icon.svg
   │                      opengraph-image.tsx sitemap.ts robots.ts manifest.ts
   │  ├─ llms.txt/route.ts   llms-full.txt/route.ts
   │  ├─ api/contact/route.ts
   │  └─ case-studies/[slug]/  page.tsx opengraph-image.tsx
   └─ components/
      ├─ providers/       theme-provider.tsx motion-provider.tsx
      ├─ seo/             json-ld.tsx
      ├─ ui/              container.tsx section.tsx button.tsx reveal.tsx spotlight-card.tsx
      │                   count-up.tsx theme-toggle.tsx social-icons.tsx
      ├─ layout/          nav.tsx use-active-section.ts footer.tsx
      ├─ hero/            hero.tsx hero-headline.tsx split-headline.ts
      ├─ pipeline/        frames.ts extraction-pipeline.tsx
      ├─ case-study/      architecture-diagram.tsx
      └─ sections/        capabilities-marquee.tsx services.tsx stats.tsx about.tsx
                          case-studies.tsx tech-stack.tsx testimonials.tsx faq.tsx
                          contact.tsx contact-form.tsx
```

Unit tests sit beside their subjects as `*.test.ts(x)`.

---

### Task 1: Scaffold the project and tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `vitest.setup.ts`, `.gitignore`, `.env.example`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css` (temporary placeholders, replaced in Task 5)
- Create: `src/lib/cn.ts`
- Test: `src/lib/cn.test.ts`

**Interfaces:**
- Produces: `cn(...inputs: ClassValue[]): string` (Tailwind-aware class merge). Path alias `@/*` → `src/*`. npm scripts `dev build start lint typecheck test test:watch e2e lighthouse`.

- [ ] **Step 1: Initialise git and package.json**

```bash
cd /home/ahraf/Documents/portfolio_consulting
git init -b main
cat > package.json <<'EOF'
{
  "name": "portfolio-consulting",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test",
    "lighthouse": "node scripts/lighthouse.mjs"
  }
}
EOF
```

- [ ] **Step 2: Install dependencies**

```bash
npm install next@16 react@19 react-dom@19 motion@13 next-themes@0.4 zod@4 resend@6 simple-icons@16 lucide-react@1 geist@1 clsx@2 tailwind-merge@3
npm install -D typescript@5.9 @types/node@22 @types/react@19 @types/react-dom@19 tailwindcss@4 @tailwindcss/postcss@4 postcss eslint@9 eslint-config-next@16 vitest@5 @vitejs/plugin-react@6 jsdom @testing-library/react@16 @testing-library/jest-dom @testing-library/user-event @playwright/test@1 lighthouse@13 chrome-launcher
```

Expected: both commands finish without `ERR!`. If a peer-dependency conflict is reported for `eslint`, re-run with `eslint@latest` that `eslint-config-next` accepts and note the version used in the commit message.

- [ ] **Step 3: Write config files**

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { optimizePackageImports: ["simple-icons", "lucide-react"] },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
        ],
      },
    ];
  },
};

export default nextConfig;
```

`postcss.config.mjs`:

```js
const config = { plugins: { "@tailwindcss/postcss": {} } };
export default config;
```

`eslint.config.mjs`:

```js
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts", "node_modules/**", "e2e/.output/**", "scripts/**"]),
]);
```

`vitest.config.ts`:

```ts
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
```

`vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

`.gitignore`:

```
node_modules
.next
out
.env
.env*.local
next-env.d.ts
*.tsbuildinfo
e2e/.output
playwright-report
test-results
lighthouse-reports
.DS_Store
```

`.env.example`:

```
# Canonical origin used for canonical URLs, sitemap, JSON-LD and llms.txt. No trailing slash.
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# Contact form delivery via Resend. Without RESEND_API_KEY the form falls back to the visitor's mail client.
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=
```

- [ ] **Step 4: Write the failing test**

`src/lib/cn.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("merges conflicting Tailwind utilities, keeping the last", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});
```

- [ ] **Step 5: Run it to verify it fails**

Run: `npx vitest run src/lib/cn.test.ts`
Expected: FAIL, "Failed to resolve import ./cn".

- [ ] **Step 6: Implement**

`src/lib/cn.ts`:

```ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS, 2 tests.

- [ ] **Step 8: Add temporary app files and prove the toolchain builds**

`src/app/globals.css`:

```css
@import "tailwindcss";
```

`src/app/layout.tsx`:

```tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

`src/app/page.tsx`:

```tsx
export default function HomePage() {
  return <main className="p-8">Portfolio scaffold</main>;
}
```

Run: `npm run typecheck && npm run lint && npm run build`
Expected: all three exit 0; the build output lists route `/`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold Next.js, Tailwind, Vitest and Playwright tooling" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 2: Content layer

**Files:**
- Create: `src/content/site.ts`, `hero.ts`, `sections.ts`, `services.ts`, `capabilities.ts`, `stats.ts`, `about.ts`, `case-studies.ts`, `stack.ts`, `testimonials.ts`, `faq.ts`, `contact.ts`
- Test: `src/content/content.test.ts`

**Interfaces:**
- Produces (all named exports):
  - `site.ts`: `site` (object: `name, brand, jobTitle, homeTitle, description, location{locality,region,country,countryCode}, email, social{linkedin,github}, knowsAbout: string[], keywords: string[], allowAiTrainingCrawlers: boolean, lastUpdated: string`), `SITE_URL: string`, `absoluteUrl(path?: string): string`.
  - `hero.ts`: `hero` with `eyebrow, headline: HeadlineSegment[][], intro, ticks: string[], primaryCta{label,href}, secondaryCta{label,href}, facts: {icon: "pin"|"clock"|"globe"|"layers"|"badge"; label: string}[]`; type `HeadlineSegment = { text: string; accent?: boolean }`.
  - `sections.ts`: `navLinks: readonly {id: string; label: string}[]`, `sectionCopy` (keys `capabilities, services, about, caseStudies, techStack, testimonials, faq, contact`, each `{eyebrow?, title?, intro?, label?}`).
  - `services.ts`: `services: {id: string; icon: "globe"|"shield"|"scan"|"database"|"cloud"|"braces"; title: string; description: string}[]`.
  - `capabilities.ts`: `capabilities: string[]`. `stats.ts`: `stats: {value: number; suffix: string; label: string}[]`.
  - `about.ts`: `about: {paragraphs: string[]; quote: string}`.
  - `case-studies.ts`: type `CaseStudy`, `caseStudies: CaseStudy[]`, `getCaseStudy(slug: string): CaseStudy | undefined`.
  - `stack.ts`: types `StackItem`, `StackGroup`, `stackGroups: StackGroup[]`.
  - `testimonials.ts`: `testimonials: {quote: string; role: string; company: string; monogram: string; placeholder: true}[]`.
  - `faq.ts`: `faq: {question: string; answer: string}[]`.
  - `contact.ts`: `projectTypeValues`, `budgetValues`, types `ProjectType`, `Budget`, `projectTypeLabels`, `budgetLabels`, `contactCopy`.

- [ ] **Step 1: Write the failing content contract test**

`src/content/content.test.ts`:

```ts
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
import { testimonials } from "./testimonials";

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
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/content/content.test.ts`
Expected: FAIL, cannot resolve `./about` (and the other content modules).

- [ ] **Step 3: Write `src/content/site.ts`**

```ts
const raw = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
```

- [ ] **Step 4: Write `src/content/hero.ts`**

```ts
export type HeadlineSegment = { text: string; accent?: boolean };

export type Hero = {
  eyebrow: string;
  headline: HeadlineSegment[][];
  intro: string;
  ticks: string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  facts: { icon: "pin" | "clock" | "globe" | "layers" | "badge"; label: string }[];
};

export const hero: Hero = {
  eyebrow: "Data Engineer | Web Intelligence Consultant",
  headline: [[{ text: "Turn Difficult Websites" }], [{ text: "Into" }, { text: "Reliable Data.", accent: true }]],
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
    { icon: "globe", label: "Global Clients" },
    { icon: "layers", label: "Scalable Solutions" },
    { icon: "badge", label: "Reliable & Ethical" },
  ],
};
```

- [ ] **Step 5: Write `src/content/sections.ts`**

```ts
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
```

- [ ] **Step 6: Write `services.ts`, `capabilities.ts`, `stats.ts`, `about.ts`**

`src/content/services.ts`:

```ts
export type Service = {
  id: string;
  icon: "globe" | "shield" | "scan" | "database" | "cloud" | "braces";
  title: string;
  description: string;
};

export const services: Service[] = [
  { id: "web-scraping", icon: "globe", title: "Complex Web Scraping", description: "Extract data from JavaScript-heavy, protected, and dynamic websites." },
  { id: "anti-bot", icon: "shield", title: "Anti-Bot Infrastructure", description: "Session management, proxy rotation, CAPTCHA handling, and more." },
  { id: "ocr", icon: "scan", title: "OCR & Document Extraction", description: "Extract data from PDFs, scanned documents, and images using AI/OCR." },
  { id: "etl", icon: "database", title: "ETL & Data Pipelines", description: "Clean, normalize, and deliver structured data to your systems." },
  { id: "infrastructure", icon: "cloud", title: "Scalable Infrastructure", description: "Cloud-based scraping systems with monitoring, logging, and alerting." },
  { id: "integration", icon: "braces", title: "API & Data Integration", description: "Integrate extracted data with your existing tools and workflows." },
];
```

`src/content/capabilities.ts`:

```ts
export const capabilities: string[] = [
  "Session rotation",
  "Proxy management",
  "CAPTCHA handling",
  "JavaScript rendering",
  "OCR pipelines",
  "Document extraction",
  "Airflow DAGs",
  "Cloud scrapers",
  "Data validation",
  "Monitoring & alerting",
  "API delivery",
];
```

`src/content/stats.ts`:

```ts
export type Stat = { value: number; suffix: string; label: string };

/** User-supplied figures from the original design; only the owner can vouch for them. */
export const stats: Stat[] = [
  { value: 5, suffix: "+", label: "Years of Experience" },
  { value: 10, suffix: "+", label: "Production Scrapers" },
  { value: 100, suffix: "M+", label: "Pages Processed" },
  { value: 99, suffix: "%", label: "Uptime Focus" },
];
```

`src/content/about.ts`:

```ts
export const about = {
  paragraphs: [
    "I'm Ahraf Khatri, a Data Engineer with 5+ years of experience building web intelligence infrastructure, scraping systems, OCR-driven data extraction, and high-throughput ETL pipelines.",
    "I help businesses solve complex web data problems and turn unstructured data into clean, reliable, and actionable information.",
  ],
  quote: "I build reliable web data infrastructure for businesses that need data at scale.",
};
```

- [ ] **Step 7: Write `src/content/case-studies.ts`**

Detail copy is drafted only from the design's one-line summaries; the owner must confirm it. No metrics are invented and `stack` is set only where the design names tools.

```ts
export type CaseStudy = {
  slug: string;
  category: string;
  title: string;
  summary: string;
  metaDescription: string;
  problem: string;
  approach: { title: string; body: string }[];
  /** Simplified pipeline stages drawn on the detail page. */
  architecture: string[];
  /** Only set when the design names the tools used. */
  stack?: string[];
  outcomes: string[];
  datePublished: string;
  dateModified: string;
};

export const caseStudies: CaseStudy[] = [
  {
    slug: "real-estate-scraping",
    category: "Real Estate Data Scraping",
    title: "Scraping 10+ Protected Real Estate Portals",
    summary:
      "Built anti-bot-aware scraping infrastructure with session rotation, proxy rotation, and dynamic parameter handling.",
    metaDescription:
      "Case study: anti-bot-aware scraping with session rotation, proxy rotation and dynamic parameter handling across 10+ protected real estate portals.",
    problem:
      "Real estate portals guard their listings. Session checks, rotating request parameters and bot detection cause a straightforward scraper to be blocked within a few requests, and every portal behaves differently. The goal was dependable data from more than ten protected portals, not a one-off export.",
    approach: [
      { title: "Study each portal", body: "Map how every site issues sessions, builds requests and paginates, so the scraper follows the site's real flow instead of guessing." },
      { title: "Rotate sessions and proxies", body: "Session management and proxy rotation keep request patterns natural and spread the load, which reduces blocks." },
      { title: "Handle dynamic parameters", body: "Portals generate tokens and query parameters on the fly. The scrapers read and reproduce them per request rather than hard-coding values." },
      { title: "Normalize the output", body: "Listings from every portal are mapped into one consistent schema, so downstream systems see a single clean format." },
    ],
    architecture: ["Protected portals", "Session & proxy manager", "Scraper workers", "Parser & validator", "Structured listings"],
    outcomes: [
      "One scraping layer covering 10+ protected portals",
      "Consistent, structured listing data across every source",
      "Session, proxy and parameter handling built in from the start",
    ],
    datePublished: "2026-09-19",
    dateModified: "2026-09-19",
  },
  {
    slug: "document-extraction",
    category: "OCR & Document Processing",
    title: "Multilingual Document Data Extraction",
    summary: "Extracted structured data from PDFs and scanned documents using EasyOCR, Tesseract, and spaCy.",
    metaDescription:
      "Case study: extracting structured data from multilingual PDFs and scanned documents with EasyOCR, Tesseract and spaCy.",
    problem:
      "Important information was locked inside PDFs and scanned documents, often in more than one language, where copy-and-paste and simple text extraction fail. The goal was to turn those documents into structured, usable data.",
    approach: [
      { title: "Prepare the documents", body: "Clean up scans so text recognition starts from the best possible input." },
      { title: "Recognize the text", body: "EasyOCR and Tesseract handle text recognition across languages and layouts." },
      { title: "Extract structured fields", body: "spaCy identifies and pulls out the fields that matter from the recognized text." },
      { title: "Validate before delivery", body: "Extracted values are checked and uncertain results are flagged, so errors are caught before data reaches your systems." },
    ],
    architecture: ["PDFs & scans", "Document preparation", "OCR (EasyOCR, Tesseract)", "NLP extraction (spaCy)", "Validated records"],
    stack: ["EasyOCR", "Tesseract", "spaCy"],
    outcomes: [
      "Structured data from scanned and multilingual documents",
      "Repeatable extraction in place of manual data entry",
      "Uncertain values flagged for review",
    ],
    datePublished: "2026-09-19",
    dateModified: "2026-09-19",
  },
  {
    slug: "etl-pipeline",
    category: "ETL & Data Pipeline",
    title: "High-Volume ETL Pipeline",
    summary:
      "Designed and implemented a scalable ETL pipeline processing millions of records with data cleaning, validation, and normalization.",
    metaDescription:
      "Case study: a scalable ETL pipeline that cleans, validates and normalizes millions of records, built for high-volume data processing.",
    problem:
      "Raw data arrived inconsistent, duplicated and incomplete, and volumes reached millions of records. The pipeline had to clean and standardize that data reliably at scale.",
    approach: [
      { title: "Extract from the sources", body: "Pull raw records from every source into a single, well-defined entry point." },
      { title: "Clean and deduplicate", body: "Fix formatting problems, drop duplicates and fill or flag gaps." },
      { title: "Validate against rules", body: "Every record is checked against explicit rules, and failures are separated instead of silently loaded." },
      { title: "Normalize and load", body: "Records are mapped to a consistent schema and delivered to the destination systems." },
    ],
    architecture: ["Data sources", "Extract", "Clean & validate", "Normalize", "Load to your systems"],
    outcomes: [
      "Millions of records processed through one scalable pipeline",
      "Clean, validated and consistently formatted output",
      "A pipeline that scales with data volume",
    ],
    datePublished: "2026-09-19",
    dateModified: "2026-09-19",
  },
];

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((c) => c.slug === slug);
}
```

- [ ] **Step 8: Write `src/content/stack.ts`**

Playwright, AWS and Tesseract have no `simple-icons` logo, so they use a monogram tile.

```ts
import {
  siApacheairflow,
  siCelery,
  siDjango,
  siDocker,
  siMongodb,
  siNumpy,
  siOpencv,
  siPandas,
  siPostgresql,
  siPython,
  siRabbitmq,
  siSelenium,
  siSpacy,
  siTensorflow,
} from "simple-icons";

export type StackIcon = { path: string; hex: string };
export type StackItem = { name: string; monogram: string; icon?: StackIcon };
export type StackGroup = { id: string; label: string; blurb: string; items: StackItem[] };

const icon = (i: { path: string; hex: string }): StackIcon => ({ path: i.path, hex: i.hex });

export const stackGroups: StackGroup[] = [
  {
    id: "scraping",
    label: "Scraping & Automation",
    blurb: "Browser automation for dynamic, protected sites.",
    items: [
      { name: "Playwright", monogram: "Pw" },
      { name: "Selenium", monogram: "Se", icon: icon(siSelenium) },
    ],
  },
  {
    id: "data",
    label: "Data & Storage",
    blurb: "Processing and storing data at volume.",
    items: [
      { name: "Python", monogram: "Py", icon: icon(siPython) },
      { name: "Pandas", monogram: "Pd", icon: icon(siPandas) },
      { name: "NumPy", monogram: "Np", icon: icon(siNumpy) },
      { name: "PostgreSQL", monogram: "Pg", icon: icon(siPostgresql) },
      { name: "MongoDB", monogram: "Mg", icon: icon(siMongodb) },
    ],
  },
  {
    id: "infrastructure",
    label: "Infrastructure",
    blurb: "Queues, orchestration and cloud deployment.",
    items: [
      { name: "Docker", monogram: "Dk", icon: icon(siDocker) },
      { name: "AWS", monogram: "AWS" },
      { name: "Airflow", monogram: "Af", icon: icon(siApacheairflow) },
      { name: "Celery", monogram: "Ce", icon: icon(siCelery) },
      { name: "RabbitMQ", monogram: "Rq", icon: icon(siRabbitmq) },
      { name: "Django", monogram: "Dj", icon: icon(siDjango) },
    ],
  },
  {
    id: "ai-ocr",
    label: "AI & OCR",
    blurb: "Reading documents and understanding text.",
    items: [
      { name: "Tesseract", monogram: "Ts" },
      { name: "EasyOCR", monogram: "Ez" },
      { name: "OpenCV", monogram: "Cv", icon: icon(siOpencv) },
      { name: "spaCy", monogram: "Sp", icon: icon(siSpacy) },
      { name: "TensorFlow", monogram: "Tf", icon: icon(siTensorflow) },
    ],
  },
];
```

- [ ] **Step 9: Write `testimonials.ts`, `faq.ts`, `contact.ts`**

`src/content/testimonials.ts`:

```ts
export type Testimonial = {
  quote: string;
  role: string;
  company: string;
  monogram: string;
  /** PLACEHOLDER quotes carried over from the original design. Replace with real, permissioned quotes before launch. */
  placeholder: true;
};

export const testimonials: Testimonial[] = [
  {
    quote: "Ahraf helped us extract complex data from a highly protected website. His understanding of anti-bot systems and scalable architecture is impressive.",
    role: "Product Manager",
    company: "Real Estate Tech Company",
    monogram: "RT",
    placeholder: true,
  },
  {
    quote: "Professional, reliable, and technically very strong. He delivered a robust data pipeline that has been running smoothly for months.",
    role: "CTO",
    company: "Data Research Firm",
    monogram: "DR",
    placeholder: true,
  },
  {
    quote: "Great expertise in web scraping and document data extraction. Highly recommended for any complex data project.",
    role: "Founder",
    company: "SaaS Company",
    monogram: "SC",
    placeholder: true,
  },
];
```

`src/content/faq.ts`:

```ts
export type FaqItem = { question: string; answer: string };

export const faq: FaqItem[] = [
  {
    question: "What does a web scraping consultant do?",
    answer:
      "A web scraping consultant designs and builds systems that collect data from websites reliably and at scale. That includes handling JavaScript-heavy pages, anti-bot protection, proxies and sessions, then cleaning and delivering the data in a structured form your team can use. I also monitor the scrapers so they keep working when sites change.",
  },
  {
    question: "Can you scrape websites with anti-bot protection?",
    answer:
      "Yes. I build anti-bot-aware infrastructure using session management, proxy rotation, CAPTCHA handling and realistic browser automation. Each site is different, so I start by studying how the target behaves, then design a scraper that stays reliable and respectful of the site's load. I only work on data you are entitled to collect.",
  },
  {
    question: "Can you extract data from scanned PDFs and images?",
    answer:
      "Yes. I build OCR and document extraction pipelines using tools such as EasyOCR, Tesseract, OpenCV and spaCy. They turn scanned PDFs, images and multilingual documents into clean, structured fields, with validation steps that flag uncertain results so errors are caught before the data reaches your systems.",
  },
  {
    question: "Is web scraping legal?",
    answer:
      "It depends on what you collect, where, and how. Public, non-personal data is generally treated differently from personal data or content behind a login, and site terms and local laws matter. I build ethical, compliant systems and will flag risks early, but this is not legal advice, so check your specific case with a lawyer.",
  },
  {
    question: "What technologies do you use?",
    answer:
      "My core stack is Python with Playwright and Selenium for scraping, Pandas and NumPy for processing, and PostgreSQL or MongoDB for storage. I run pipelines with Celery, RabbitMQ and Airflow, deploy with Docker on AWS, and use Tesseract, OpenCV, spaCy and TensorFlow for OCR and language work.",
  },
  {
    question: "Can you deliver data into our existing systems?",
    answer:
      "Yes. I integrate extracted data through APIs, databases, files or scheduled exports, so it lands directly in the tools and workflows you already use. I clean, normalize and validate the data first, and add monitoring and alerting so you know quickly if a feed breaks or a source changes.",
  },
  {
    question: "What kinds of clients do you work with?",
    answer:
      "I work with startups, established businesses, research teams and enterprises that need reliable web data at scale. My case studies cover real estate data, document processing and large ETL pipelines. I'm based in Mumbai, India, and work with clients globally, so time zones are rarely a problem.",
  },
  {
    question: "How do we start a project?",
    answer:
      "Send a short description of the data you need, the sites or documents involved, and how you want it delivered, using the contact form. I'll review it, ask any follow-up questions, and suggest an approach. From there we agree on scope and a plan before any build work begins.",
  },
];
```

`src/content/contact.ts`:

```ts
export const projectTypeValues = ["web-scraping", "document-extraction", "etl-pipeline", "infrastructure", "other"] as const;
export const budgetValues = ["under-2k", "2k-5k", "5k-15k", "15k-plus", "not-sure"] as const;

export type ProjectType = (typeof projectTypeValues)[number];
export type Budget = (typeof budgetValues)[number];

export const projectTypeLabels: Record<ProjectType, string> = {
  "web-scraping": "Web scraping",
  "document-extraction": "Document / OCR extraction",
  "etl-pipeline": "ETL & data pipeline",
  infrastructure: "Scraping infrastructure",
  other: "Something else",
};

/** Budget bands are placeholders the owner may edit freely. */
export const budgetLabels: Record<Budget, string> = {
  "under-2k": "Under $2k",
  "2k-5k": "$2k to $5k",
  "5k-15k": "$5k to $15k",
  "15k-plus": "$15k+",
  "not-sure": "Not sure yet",
};

export const contactCopy = {
  fields: {
    name: "Name",
    email: "Email",
    projectType: "Project type",
    budget: "Budget (optional)",
    message: "Tell me about your project",
  },
  placeholders: {
    name: "Your name",
    email: "you@company.com",
    message: "What data do you need, from where, and how should it be delivered?",
    projectType: "Choose one",
    budget: "Select a range",
  },
  submit: "Send message",
  submitting: "Sending…",
  success: "Thanks, your message is on its way. I'll reply by email soon.",
  fallback: "Email isn't configured on the server yet, so I've opened your email app with your message filled in.",
  error: "Something went wrong sending your message. Please try again, or email me directly.",
  rateLimited: "Too many messages from this connection. Please try again in a few minutes.",
  validation: {
    name: "Please enter your name",
    email: "Enter a valid email address",
    projectType: "Choose a project type",
    message: "Please write at least 20 characters so I can understand your project",
  },
};
```

- [ ] **Step 10: Run tests to verify they pass**

Run: `npx vitest run src/content/content.test.ts`
Expected: PASS. If a length assertion fails (title, description or FAQ word count), shorten the offending string; do not loosen the test.

- [ ] **Step 11: Type-check and commit**

```bash
npm run typecheck
git add src/content
git commit -m "feat: add content layer (site, hero, services, case studies, FAQ, stack)" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 3: SEO / AEO / GEO library

**Files:**
- Create: `src/lib/seo/metadata.ts`, `schema.ts`, `llms.ts`, `crawlers.ts`, `robots.ts`, `sitemap.ts`, `src/components/seo/json-ld.tsx`
- Test: `src/lib/seo/metadata.test.ts`, `schema.test.ts`, `llms.test.ts`, `robots.test.ts`, `sitemap.test.ts`

**Interfaces:**
- Consumes: everything from Task 2 (`site`, `SITE_URL`, `absoluteUrl`, `services`, `faq`, `caseStudies`, `stackGroups`, `about`, `CaseStudy`).
- Produces:
  - `buildMetadata(input: { title: string; description: string; path: string; type?: "website" | "article"; absoluteTitle?: boolean; publishedTime?: string; modifiedTime?: string }): Metadata`
  - `ids: { person; service; website }` (JSON-LD `@id` strings), `personSchema()`, `serviceSchema()`, `websiteSchema()`, `faqSchema(items: FaqItem[])`, `breadcrumbSchema(items: {name: string; path: string}[])`, `techArticleSchema(cs: CaseStudy)`, `homeGraph()`, `caseStudyGraph(cs: CaseStudy)`, `serializeJsonLd(data: unknown): string`
  - `buildLlmsTxt(): string`, `buildLlmsFullTxt(): string`
  - `AI_RETRIEVAL_CRAWLERS`, `AI_TRAINING_CRAWLERS`, `buildRobots(opts: { allowAiTraining: boolean; siteUrl: string }): MetadataRoute.Robots`
  - `buildSitemap(): MetadataRoute.Sitemap`
  - `<JsonLd data={object} />` server component

- [ ] **Step 1: Write failing tests for metadata and schema**

`src/lib/seo/metadata.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildMetadata } from "./metadata";

describe("buildMetadata", () => {
  it("sets canonical, Open Graph and Twitter fields", () => {
    const m = buildMetadata({ title: "Case A", description: "Desc", path: "/case-studies/a" });
    expect(m.alternates?.canonical).toBe("/case-studies/a");
    expect(m.openGraph).toMatchObject({ type: "website", url: "/case-studies/a", siteName: "Ahraf Khatri", locale: "en_US" });
    expect(m.twitter).toMatchObject({ card: "summary_large_image" });
  });

  it("uses an absolute title when asked, without the site template", () => {
    const m = buildMetadata({ title: "Home Title", description: "D", path: "/", absoluteTitle: true });
    expect(m.title).toEqual({ absolute: "Home Title" });
    expect(m.openGraph?.title).toBe("Home Title");
  });

  it("appends the site name to Open Graph titles otherwise", () => {
    const m = buildMetadata({ title: "Case A", description: "D", path: "/x" });
    expect(m.openGraph?.title).toBe("Case A | Ahraf Khatri");
  });

  it("emits article times for articles", () => {
    const m = buildMetadata({ title: "T", description: "D", path: "/x", type: "article", publishedTime: "2026-09-19", modifiedTime: "2026-09-19" });
    expect(m.openGraph).toMatchObject({ type: "article", publishedTime: "2026-09-19", modifiedTime: "2026-09-19", authors: ["Ahraf Khatri"] });
  });
});
```

`src/lib/seo/schema.test.ts`:

```ts
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
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/lib/seo`
Expected: FAIL, cannot resolve `./metadata` and `./schema`.

- [ ] **Step 3: Implement `metadata.ts`**

```ts
import type { Metadata } from "next";
import { site } from "@/content/site";

type Input = {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  /** Use the title as-is instead of applying the `%s | Ahraf Khatri` template. */
  absoluteTitle?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
};

export function buildMetadata(i: Input): Metadata {
  const shareTitle = i.absoluteTitle ? i.title : `${i.title} | ${site.name}`;
  const common = {
    url: i.path,
    title: shareTitle,
    description: i.description,
    siteName: site.name,
    locale: "en_US",
  };
  const openGraph: NonNullable<Metadata["openGraph"]> =
    i.type === "article"
      ? { type: "article", ...common, publishedTime: i.publishedTime, modifiedTime: i.modifiedTime, authors: [site.name] }
      : { type: "website", ...common };

  return {
    title: i.absoluteTitle ? { absolute: i.title } : i.title,
    description: i.description,
    alternates: { canonical: i.path },
    openGraph,
    twitter: { card: "summary_large_image", title: shareTitle, description: i.description },
  };
}
```

- [ ] **Step 4: Implement `schema.ts`**

```ts
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
    email: `mailto:${site.email}`,
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
```

- [ ] **Step 5: Run to verify the metadata and schema tests pass**

Run: `npx vitest run src/lib/seo/metadata.test.ts src/lib/seo/schema.test.ts`
Expected: PASS.

- [ ] **Step 6: Write failing tests for llms, robots and sitemap**

`src/lib/seo/llms.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { caseStudies } from "@/content/case-studies";
import { faq } from "@/content/faq";
import { site } from "@/content/site";
import { buildLlmsFullTxt, buildLlmsTxt } from "./llms";

describe("llms.txt", () => {
  const out = buildLlmsTxt();

  it("starts with an H1, a blockquote summary and link sections", () => {
    const lines = out.split("\n");
    expect(lines[0]).toBe(`# ${site.name}`);
    expect(out).toContain(`> ${site.description}`);
    expect(out).toContain("## Services");
    expect(out).toContain("## Case studies");
    expect(out).toContain("## Contact");
  });

  it("links every case study with an absolute URL", () => {
    for (const cs of caseStudies) expect(out).toMatch(new RegExp(`\\[${cs.title.replace(/[+]/g, "\\+")}\\]\\(https?://[^)]+/case-studies/${cs.slug}\\)`));
  });

  it("never prints undefined", () => expect(out).not.toContain("undefined"));
});

describe("llms-full.txt", () => {
  const out = buildLlmsFullTxt();

  it("includes every FAQ question and answer", () => {
    for (const f of faq) {
      expect(out).toContain(f.question);
      expect(out).toContain(f.answer);
    }
  });

  it("includes case study problems and outcomes", () => {
    for (const cs of caseStudies) {
      expect(out).toContain(cs.problem);
      for (const o of cs.outcomes) expect(out).toContain(o);
    }
  });

  it("includes the tech stack groups and contact details", () => {
    expect(out).toContain("Scraping & Automation");
    expect(out).toContain(site.email);
    expect(out).not.toContain("undefined");
  });
});
```

`src/lib/seo/robots.test.ts`:

```ts
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
```

`src/lib/seo/sitemap.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { caseStudies } from "@/content/case-studies";
import { buildSitemap } from "./sitemap";

describe("buildSitemap", () => {
  const entries = buildSitemap();

  it("lists the home page and every case study with absolute URLs", () => {
    expect(entries).toHaveLength(1 + caseStudies.length);
    for (const e of entries) expect(e.url).toMatch(/^https?:\/\//);
    for (const cs of caseStudies) expect(entries.some((e) => e.url.endsWith(`/case-studies/${cs.slug}`))).toBe(true);
  });

  it("gives the home page top priority and a lastModified date", () => {
    expect(entries[0].priority).toBe(1);
    expect(entries.every((e) => Boolean(e.lastModified))).toBe(true);
  });
});
```

- [ ] **Step 7: Run to verify they fail**

Run: `npx vitest run src/lib/seo`
Expected: FAIL for llms, robots and sitemap (unresolved imports); metadata and schema still pass.

- [ ] **Step 8: Implement `crawlers.ts`, `robots.ts`, `sitemap.ts`**

`src/lib/seo/crawlers.ts`:

```ts
/** Crawlers that fetch pages to answer a user's query or power AI search. Always allowed. */
export const AI_RETRIEVAL_CRAWLERS = [
  "OAI-SearchBot",
  "ChatGPT-User",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
] as const;

/** Crawlers that collect content for model training. Controlled by `site.allowAiTrainingCrawlers`. */
export const AI_TRAINING_CRAWLERS = ["GPTBot", "ClaudeBot", "Google-Extended", "Applebot-Extended", "CCBot"] as const;
```

`src/lib/seo/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { AI_RETRIEVAL_CRAWLERS, AI_TRAINING_CRAWLERS } from "./crawlers";

type Rule = Exclude<MetadataRoute.Robots["rules"], unknown[]>;

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
```

`src/lib/seo/sitemap.ts`:

```ts
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
```

- [ ] **Step 9: Implement `llms.ts`**

```ts
import { about } from "@/content/about";
import { caseStudies } from "@/content/case-studies";
import { faq } from "@/content/faq";
import { services } from "@/content/services";
import { absoluteUrl, site } from "@/content/site";
import { stackGroups } from "@/content/stack";

const contactLines = () => [
  `- Email: ${site.email}`,
  `- LinkedIn: ${site.social.linkedin}`,
  `- GitHub: ${site.social.github}`,
  `- Location: ${site.location.locality}, ${site.location.country}`,
];

/** Summary index following the llms.txt convention. */
export function buildLlmsTxt(): string {
  return [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    `${site.name} is a ${site.jobTitle.toLowerCase()} based in ${site.location.locality}, ${site.location.country}, working with clients globally.`,
    "",
    "## Services",
    ...services.map((s) => `- [${s.title}](${absoluteUrl("/#services")}): ${s.description}`),
    "",
    "## Case studies",
    ...caseStudies.map((c) => `- [${c.title}](${absoluteUrl(`/case-studies/${c.slug}`)}): ${c.summary}`),
    "",
    "## Optional",
    `- [Full content as Markdown](${absoluteUrl("/llms-full.txt")}): every page in one file`,
    "",
    "## Contact",
    ...contactLines(),
    "",
  ].join("\n");
}

/** The whole site's substance as one Markdown document. */
export function buildLlmsFullTxt(): string {
  const parts: string[] = [
    `# ${site.name}`,
    "",
    `> ${site.description}`,
    "",
    "## About",
    ...about.paragraphs.flatMap((p) => [p, ""]),
    "## Services",
    ...services.flatMap((s) => [`### ${s.title}`, s.description, ""]),
  ];

  parts.push("## Case studies", "");
  for (const c of caseStudies) {
    parts.push(
      `### ${c.title}`,
      `URL: ${absoluteUrl(`/case-studies/${c.slug}`)}`,
      `Category: ${c.category}`,
      "",
      c.summary,
      "",
      "**Problem**",
      c.problem,
      "",
      "**Approach**",
      ...c.approach.map((a, i) => `${i + 1}. ${a.title}: ${a.body}`),
      "",
      "**Outcomes**",
      ...c.outcomes.map((o) => `- ${o}`),
      "",
    );
    if (c.stack) parts.push(`**Tools named**: ${c.stack.join(", ")}`, "");
  }

  parts.push("## Tech stack", "");
  for (const g of stackGroups) parts.push(`- ${g.label}: ${g.items.map((i) => i.name).join(", ")}`);

  parts.push("", "## Frequently asked questions", "");
  for (const f of faq) parts.push(`### ${f.question}`, f.answer, "");

  parts.push("## Contact", ...contactLines(), "");
  return parts.join("\n");
}
```

- [ ] **Step 10: Add the JSON-LD component**

`src/components/seo/json-ld.tsx`:

```tsx
import { serializeJsonLd } from "@/lib/seo/schema";

export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
```

- [ ] **Step 11: Run the full unit suite, type-check, commit**

Run: `npx vitest run && npm run typecheck`
Expected: all tests PASS, type-check exits 0.

```bash
git add src
git commit -m "feat(seo): add metadata, JSON-LD graph, llms.txt, robots and sitemap builders" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 4: Machine-readable routes (sitemap, robots, llms, manifest, icon)

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/manifest.ts`, `src/app/icon.svg`
- Create: `src/app/llms.txt/route.ts`, `src/app/llms-full.txt/route.ts`
- Test: `src/app/machine-routes.test.ts`

**Interfaces:**
- Consumes: `buildSitemap`, `buildRobots`, `buildLlmsTxt`, `buildLlmsFullTxt`, `site`, `SITE_URL`.
- Produces: HTTP endpoints `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/manifest.webmanifest`, and the favicon `/icon.svg`.

- [ ] **Step 1: Write the failing test**

`src/app/machine-routes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import manifest from "./manifest";
import robots from "./robots";
import sitemap from "./sitemap";
import { GET as llmsFull } from "./llms-full.txt/route";
import { GET as llms } from "./llms.txt/route";

describe("machine routes", () => {
  it("serves llms.txt as UTF-8 plain text", async () => {
    const res = llms();
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toMatch(/^# Ahraf Khatri/);
  });

  it("serves llms-full.txt as UTF-8 plain text", async () => {
    const res = llmsFull();
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await res.text()).toContain("## Frequently asked questions");
  });

  it("exposes a sitemap, robots rules and a manifest", () => {
    expect(sitemap().length).toBeGreaterThanOrEqual(4);
    expect(robots().sitemap).toMatch(/\/sitemap\.xml$/);
    expect(manifest()).toMatchObject({ name: "Ahraf Khatri", start_url: "/", display: "standalone" });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/app/machine-routes.test.ts`
Expected: FAIL, cannot resolve `./manifest` and the route modules.

- [ ] **Step 3: Implement the routes**

`src/app/sitemap.ts`:

```ts
import type { MetadataRoute } from "next";
import { buildSitemap } from "@/lib/seo/sitemap";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemap();
}
```

`src/app/robots.ts`:

```ts
import type { MetadataRoute } from "next";
import { site, SITE_URL } from "@/content/site";
import { buildRobots } from "@/lib/seo/robots";

export default function robots(): MetadataRoute.Robots {
  return buildRobots({ allowAiTraining: site.allowAiTrainingCrawlers, siteUrl: SITE_URL });
}
```

`src/app/manifest.ts`:

```ts
import type { MetadataRoute } from "next";
import { site } from "@/content/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.name,
    short_name: "Ahraf Khatri",
    description: site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a1020",
    theme_color: "#0a1020",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
```

`src/app/llms.txt/route.ts`:

```ts
import { buildLlmsTxt } from "@/lib/seo/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
```

`src/app/llms-full.txt/route.ts`:

```ts
import { buildLlmsFullTxt } from "@/lib/seo/llms";

export const dynamic = "force-static";

export function GET() {
  return new Response(buildLlmsFullTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
```

`src/app/icon.svg` (an "AK" monogram drawn as strokes, so it needs no font):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="AK">
  <rect width="64" height="64" rx="14" fill="#0a1020"/>
  <g fill="none" stroke="#4c9aff" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 47 23 17 34 47"/>
    <path d="M16.5 37h13"/>
    <path d="M42 17v30"/>
    <path d="M53 17 42 33"/>
    <path d="M45.5 30 54 47"/>
  </g>
</svg>
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: all PASS.

- [ ] **Step 5: Verify against a real server**

```bash
npm run build
npx next start -p 3100 &
sleep 4
for p in sitemap.xml robots.txt llms.txt llms-full.txt manifest.webmanifest icon.svg; do
  printf "%-22s" "/$p"; curl -s -o /dev/null -w "%{http_code} %{content_type}\n" "http://127.0.0.1:3100/$p"
done
curl -s http://127.0.0.1:3100/robots.txt | head -30
kill %1
```

Expected: every path prints `200`; content types are `application/xml`, `text/plain`, `text/plain; charset=utf-8` (twice), `application/manifest+json`, `image/svg+xml`. `robots.txt` shows the `*` group, the AI retrieval group, the AI training group and a `Sitemap:` line.

- [ ] **Step 6: Commit**

```bash
git add src/app
git commit -m "feat(seo): serve sitemap, robots, llms.txt, manifest and favicon" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 5: Design tokens, providers, layout shell and UI primitives

**Files:**
- Create: `src/lib/contrast.ts`, `src/app/globals.test.ts`, `src/lib/contrast.test.ts`
- Modify: `src/app/globals.css` (replace), `src/app/layout.tsx` (replace), `src/app/page.tsx` (temporary smoke page)
- Create: `src/components/providers/theme-provider.tsx`, `motion-provider.tsx`
- Create: `src/components/ui/container.tsx`, `section.tsx`, `button.tsx`, `reveal.tsx`, `spotlight-card.tsx`, `count-up.tsx`, `theme-toggle.tsx`, `social-icons.tsx`
- Create: `scripts/shot.mjs`

**Interfaces:**
- Consumes: `cn`, `site`, `SITE_URL`, `buildMetadata` (Task 1–3).
- Produces:
  - CSS tokens: `--bg --surface --surface-2 --border --fg --muted --accent --accent-fg --ok --glow` with Tailwind colors `bg surface surface-2 line fg muted accent accent-fg ok` (e.g. `bg-surface`, `text-muted`, `border-line`). Utility classes `.bg-grid`, `.marquee`, `.marquee-track`.
  - `contrastRatio(a: string, b: string): number` (hex in, WCAG ratio out).
  - `<Container className?>`, `<Section id className?>`, `<SectionHeading id eyebrow title intro? className?>` (server).
  - `<Button href variant?: "primary"|"secondary"|"ghost" arrow? external? className?>` (server-safe).
  - `<Reveal delay? y? className?>`, `<SpotlightCard className?>`, `<CountUp value suffix? className?>`, `<ThemeToggle />` (client). `EASE_OUT` constant from `reveal.tsx`.
  - `<GitHubIcon className?>`, `<LinkedInMark className?>`.
  - `<MotionProvider>`, `<ThemeProvider>`.
  - `scripts/shot.mjs <url> <width> <light|dark> <outfile> [fullPage=true]` prints the saved path.
  - Any element that starts hidden must carry `data-reveal` (the layout's `<noscript>` style forces it visible).

- [ ] **Step 1: Write the failing tests for contrast and tokens**

`src/lib/contrast.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for identical colors", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1);
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
  });
  it("is symmetric", () => {
    expect(contrastRatio("#2563eb", "#f7f9fc")).toBeCloseTo(contrastRatio("#f7f9fc", "#2563eb"), 6);
  });
});
```

`src/app/globals.test.ts`:

```ts
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { contrastRatio } from "@/lib/contrast";

const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");

function tokens(selector: string): Record<string, string> {
  const block = css.match(new RegExp(`${selector}\\s*\\{([^}]*)\\}`))?.[1] ?? "";
  return Object.fromEntries([...block.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)].map((m) => [m[1], m[2]]));
}

// [foreground token, background token]; every pair must meet WCAG AA for body text (4.5:1).
const pairs: [string, string][] = [
  ["fg", "bg"],
  ["fg", "surface"],
  ["muted", "bg"],
  ["muted", "surface"],
  ["muted", "surface-2"],
  ["accent", "bg"],
  ["accent", "surface"],
  ["accent-fg", "accent"],
  ["ok", "bg"],
  ["ok", "surface"],
];

describe.each([
  ["light", ":root"],
  ["dark", "\\.dark"],
])("%s theme tokens", (_name, selector) => {
  const t = tokens(selector);

  it("defines every token the components rely on", () => {
    for (const key of ["bg", "surface", "surface-2", "border", "fg", "muted", "accent", "accent-fg", "ok"]) {
      expect(t[key], `--${key}`).toMatch(/^#[0-9a-fA-F]{6}$/);
    }
  });

  it.each(pairs)("%s on %s meets WCAG AA (4.5:1)", (fg, bg) => {
    expect(contrastRatio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/lib/contrast.test.ts src/app/globals.test.ts`
Expected: FAIL, cannot resolve `./contrast`; the tokens tests fail because `globals.css` has no token blocks yet.

- [ ] **Step 3: Implement `contrast.ts`**

```ts
function channel(value: number): number {
  const s = value / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

/** WCAG 2.x contrast ratio between two `#rrggbb` colors. */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
```

- [ ] **Step 4: Replace `src/app/globals.css`**

```css
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));

:root {
  color-scheme: light;
  --bg: #f7f9fc;
  --surface: #ffffff;
  --surface-2: #eef3fb;
  --border: #dde5f0;
  --fg: #0b1220;
  --muted: #4b5a72;
  --accent: #2563eb;
  --accent-fg: #ffffff;
  --ok: #15803d;
  --glow: 37 99 235;
}

.dark {
  color-scheme: dark;
  --bg: #0a1020;
  --surface: #111a2e;
  --surface-2: #182338;
  --border: #243250;
  --fg: #eaf0fb;
  --muted: #9fb0cb;
  --accent: #4c9aff;
  --accent-fg: #06101f;
  --ok: #4ade80;
  --glow: 76 154 255;
}

@theme inline {
  --color-bg: var(--bg);
  --color-surface: var(--surface);
  --color-surface-2: var(--surface-2);
  --color-line: var(--border);
  --color-fg: var(--fg);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-accent-fg: var(--accent-fg);
  --color-ok: var(--ok);
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), ui-monospace, SFMono-Regular, Menlo, monospace;
}

@layer base {
  *,
  ::after,
  ::before {
    border-color: var(--border);
  }
  html {
    scroll-behavior: smooth;
    scroll-padding-top: 5rem;
    -webkit-text-size-adjust: 100%;
  }
  body {
    background: var(--bg);
    color: var(--fg);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }
  ::selection {
    background: rgb(var(--glow) / 0.25);
  }
  :focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 3px;
    border-radius: 6px;
  }
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}

/* Grid backdrop that fades out toward the edges. */
.bg-grid {
  background-image:
    linear-gradient(var(--border) 1px, transparent 1px),
    linear-gradient(90deg, var(--border) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 30%, #000 30%, transparent 75%);
}

/* Capabilities marquee: CSS-only loop, pausable, wraps into a static list under reduced motion. */
@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}
.marquee-track {
  animation: marquee 45s linear infinite;
  width: max-content;
}
.marquee:hover .marquee-track,
.marquee:focus-within .marquee-track,
.marquee[data-paused="true"] .marquee-track {
  animation-play-state: paused;
}
@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
    width: auto;
    flex-wrap: wrap;
    justify-content: center;
  }
  .marquee-dup {
    display: none;
  }
}
```

- [ ] **Step 5: Run to verify contrast tests pass**

Run: `npx vitest run src/lib/contrast.test.ts src/app/globals.test.ts`
Expected: PASS. If a pair fails, darken the offending token in `globals.css` (not the threshold) and re-run.

- [ ] **Step 6: Write the providers**

`src/components/providers/theme-provider.tsx`:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}
```

`src/components/providers/motion-provider.tsx`:

```tsx
"use client";

import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** One provider for the whole app: reduced-motion aware, and only the lightweight feature set is loaded. */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
```

- [ ] **Step 7: Write the UI primitives**

`src/components/ui/container.tsx`:

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-[1200px] px-4 sm:px-6", className)}>{children}</div>;
}
```

`src/components/ui/reveal.tsx`:

```tsx
"use client";

import { m } from "motion/react";
import type { ReactNode } from "react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

type Props = { children: ReactNode; delay?: number; y?: number; className?: string };

/** Fades and lifts its children into view once. `data-reveal` lets the noscript style keep it visible without JS. */
export function Reveal({ children, delay = 0, y = 18, className }: Props) {
  return (
    <m.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
    >
      {children}
    </m.div>
  );
}
```

`src/components/ui/section.tsx`:

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Reveal } from "./reveal";

export function Section({ id, className, children }: { id: string; className?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-20 py-20 sm:py-28", className)}>
      {children}
    </section>
  );
}

type HeadingProps = { id: string; eyebrow: string; title: string; intro?: string; className?: string };

export function SectionHeading({ id, eyebrow, title, intro, className }: HeadingProps) {
  return (
    <div className={cn("mb-12 grid gap-6 lg:mb-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-end", className)}>
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{eyebrow}</p>
        <h2 id={`${id}-title`} className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
          {title}
        </h2>
      </Reveal>
      {intro ? (
        <Reveal delay={0.08}>
          <p className="text-pretty text-base text-muted sm:text-lg">{intro}</p>
        </Reveal>
      ) : null}
    </div>
  );
}
```

`src/components/ui/button.tsx`:

```tsx
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost";

type Props = {
  href: string;
  variant?: Variant;
  arrow?: boolean;
  external?: boolean;
  className?: string;
  children: ReactNode;
};

const base =
  "group inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition-[transform,background-color,border-color] duration-200 ease-out hover:-translate-y-0.5 active:scale-[0.97]";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-fg shadow-[0_8px_24px_-10px_rgb(var(--glow)/0.7)] hover:brightness-110",
  secondary: "border border-line bg-surface text-fg hover:bg-surface-2",
  ghost: "text-fg hover:bg-surface-2",
};

export function Button({ href, variant = "primary", arrow, external, className, children }: Props) {
  const classes = cn(base, variants[variant], className);
  const content = (
    <>
      {children}
      {arrow ? <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" aria-hidden /> : null}
    </>
  );

  if (external || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a href={href} className={classes} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}
```

`src/components/ui/spotlight-card.tsx`:

```tsx
"use client";

import { m } from "motion/react";
import { useRef, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Card with a spring lift on hover and a soft light that follows the cursor. */
export function SpotlightCard({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
    el.style.setProperty("--my", `${e.clientY - rect.top}px`);
  }

  return (
    <m.div
      ref={ref}
      onPointerMove={onPointerMove}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={cn("group relative h-full overflow-hidden rounded-2xl border border-line bg-surface", className)}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: "radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), rgb(var(--glow) / 0.14), transparent 65%)" }}
      />
      <div className="relative h-full">{children}</div>
    </m.div>
  );
}
```

`src/components/ui/count-up.tsx`:

```tsx
"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

type Props = { value: number; suffix?: string; className?: string };

/** Server-renders the final number (so crawlers and no-JS visitors see it) and counts up from 0 when scrolled into view. */
export function CountUp({ value, suffix = "", className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -15% 0px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduced) return;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return (
    <span className={className}>
      <span ref={ref}>{value}</span>
      {suffix}
    </span>
  );
}
```

`src/components/ui/theme-toggle.tsx`:

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      className="grid size-11 place-items-center rounded-full border border-line bg-surface text-fg transition-colors duration-200 hover:bg-surface-2"
    >
      {mounted ? isDark ? <Sun className="size-[18px]" aria-hidden /> : <Moon className="size-[18px]" aria-hidden /> : <span className="size-[18px]" />}
    </button>
  );
}
```

`src/components/ui/social-icons.tsx` (GitHub from `simple-icons`; LinkedIn is not in `simple-icons` or `lucide-react`, so it is a text mark):

```tsx
import { siGithub } from "simple-icons";
import { cn } from "@/lib/cn";

export function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", className)} fill="currentColor" aria-hidden>
      <path d={siGithub.path} />
    </svg>
  );
}

export function LinkedInMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("grid size-5 place-items-center rounded-[5px] border-[1.5px] border-current font-sans text-[10px] font-bold leading-none", className)}
    >
      in
    </span>
  );
}
```

- [ ] **Step 8: Replace the root layout**

`src/app/layout.tsx`:

```tsx
import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { site, SITE_URL } from "@/content/site";
import "./globals.css";

// If the build machine is offline, swap this for `GeistMono` from "geist/font/mono".
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: site.homeTitle, template: `%s | ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.name, url: SITE_URL }],
  creator: site.name,
  keywords: [...site.keywords],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f9fc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1020" },
  ],
};

/** Keeps content that starts hidden (for entrance animation) visible when JavaScript is off. */
const NOSCRIPT_CSS = "[data-reveal]{opacity:1!important;transform:none!important}";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        <noscript>
          <style>{NOSCRIPT_CSS}</style>
        </noscript>
        <a
          href="#main"
          className="sr-only rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-accent-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100]"
        >
          Skip to content
        </a>
        <ThemeProvider>
          <MotionProvider>
            <main id="main">{children}</main>
          </MotionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 9: Add a temporary smoke page and the screenshot helper**

`src/app/page.tsx` (replaced in Task 13):

```tsx
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading } from "@/components/ui/section";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CountUp } from "@/components/ui/count-up";

export default function HomePage() {
  return (
    <Section id="smoke">
      <Container>
        <SectionHeading id="smoke" eyebrow="Design system" title="Smoke test" intro="Tokens, buttons, cards and reveals render in both themes." />
        <div className="flex flex-wrap items-center gap-3">
          <Button href="/#smoke" arrow>Primary</Button>
          <Button href="/#smoke" variant="secondary">Secondary</Button>
          <ThemeToggle />
          <CountUp value={100} suffix="M+" className="font-mono text-3xl" />
        </div>
        <div className="mt-8 max-w-sm">
          <SpotlightCard className="p-6">
            <p className="text-muted">Hover me: spring lift and cursor light.</p>
          </SpotlightCard>
        </div>
      </Container>
    </Section>
  );
}
```

`scripts/shot.mjs`:

```js
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { chromium } from "@playwright/test";

const [, , url = "http://127.0.0.1:3100/", width = "1440", theme = "dark", out = "e2e/.output/shot.png", full = "true"] = process.argv;

mkdirSync(dirname(out), { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const context = await browser.newContext({
  viewport: { width: Number(width), height: 900 },
  colorScheme: theme === "dark" ? "dark" : "light",
});
const page = await context.newPage();
await page.goto(url, { waitUntil: "networkidle" });
// Scroll through the page so whileInView reveals fire before the full-page capture.
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 500) {
    window.scrollTo(0, y);
    await new Promise((r) => setTimeout(r, 120));
  }
  window.scrollTo(0, 0);
});
await page.waitForTimeout(700);
await page.screenshot({ path: out, fullPage: full === "true" });
await browser.close();
console.log(out);
```

- [ ] **Step 10: Build, run tests, and look at the result in both themes**

```bash
npx vitest run && npm run typecheck && npm run lint && npm run build
npx next start -p 3100 &
sleep 4
node scripts/shot.mjs http://127.0.0.1:3100/ 1440 light e2e/.output/t5-light.png
node scripts/shot.mjs http://127.0.0.1:3100/ 375 dark e2e/.output/t5-dark-375.png
kill %1
```

Expected: all commands exit 0. Open both PNGs (Read tool): background, text and accent colors match the tokens; the buttons, card and counter render; the page has no horizontal scroll at 375px. Fix any visible defect before committing.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: add design tokens, theming, motion provider and UI primitives" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 6: Navigation and footer

**Files:**
- Create: `src/components/layout/use-active-section.ts`, `nav.tsx`, `footer.tsx`
- Test: `src/components/layout/use-active-section.test.ts`
- Modify: `src/app/layout.tsx` (mount `<Nav/>` and `<Footer/>`)

**Interfaces:**
- Consumes: `navLinks`, `site`, `caseStudies`, `Button`, `ThemeToggle`, `Container`, `GitHubIcon`, `LinkedInMark`, `cn`.
- Produces: `pickActiveSection(intersecting: ReadonlySet<string>, order: readonly string[]): string | null`, `useActiveSection(ids: readonly string[]): string | null`, `<Nav />`, `<Footer />`. The nav links use `/#id` hrefs, so they also work from case study pages.

- [ ] **Step 1: Write the failing test**

`src/components/layout/use-active-section.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { pickActiveSection } from "./use-active-section";

const order = ["about", "services", "case-studies", "faq"];

describe("pickActiveSection", () => {
  it("returns null when nothing intersects", () => {
    expect(pickActiveSection(new Set(), order)).toBeNull();
  });
  it("returns the only intersecting section", () => {
    expect(pickActiveSection(new Set(["services"]), order)).toBe("services");
  });
  it("prefers the later section in page order when two intersect", () => {
    expect(pickActiveSection(new Set(["services", "case-studies"]), order)).toBe("case-studies");
  });
  it("ignores ids that are not in the order list", () => {
    expect(pickActiveSection(new Set(["hero"]), order)).toBeNull();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npx vitest run src/components/layout`
Expected: FAIL, cannot resolve `./use-active-section`.

- [ ] **Step 3: Implement the hook**

`src/components/layout/use-active-section.ts`:

```ts
"use client";

import { useEffect, useState } from "react";

export function pickActiveSection(intersecting: ReadonlySet<string>, order: readonly string[]): string | null {
  let active: string | null = null;
  for (const id of order) {
    if (intersecting.has(id)) active = id;
  }
  return active;
}

/** Tracks which section crosses a thin band near the top of the viewport. */
export function useActiveSection(ids: readonly string[]): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const intersecting = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) intersecting.add(entry.target.id);
          else intersecting.delete(entry.target.id);
        }
        setActive(pickActiveSection(intersecting, ids));
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `npx vitest run src/components/layout`
Expected: PASS, 4 tests.

- [ ] **Step 5: Implement the nav**

`src/components/layout/nav.tsx`:

```tsx
"use client";

import { AnimatePresence, m } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { navLinks } from "@/content/sections";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";
import { useActiveSection } from "./use-active-section";

const SECTION_IDS = navLinks.map((l) => l.id);

function subscribeToScroll(callback: () => void) {
  window.addEventListener("scroll", callback, { passive: true });
  return () => window.removeEventListener("scroll", callback);
}

function useScrolled(threshold = 8) {
  return useSyncExternalStore(subscribeToScroll, () => window.scrollY > threshold, () => false);
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled();
  const active = useActiveSection(SECTION_IDS);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color] duration-300",
        scrolled || open ? "border-line bg-bg/80 backdrop-blur-xl" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" aria-label={`${site.name}, home`}>
          <span aria-hidden className="grid size-9 place-items-center rounded-lg bg-accent font-mono text-sm font-bold text-accent-fg">
            AK
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">{site.brand}</span>
            <span className="hidden text-[11px] text-muted sm:block">Web Intelligence Consultant</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.id}
              href={`/#${link.id}`}
              aria-current={active === link.id ? "location" : undefined}
              className={cn(
                "rounded-full px-3.5 py-2 text-sm text-muted transition-colors duration-200 hover:text-fg",
                active === link.id && "bg-surface-2 text-fg",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button href="/#contact" arrow className="hidden lg:inline-flex">
            Let&apos;s Work Together
          </Button>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full border border-line bg-surface lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            {open ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <m.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="border-t border-line bg-bg/95 backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Mobile" className="mx-auto flex max-w-[1200px] flex-col gap-1 px-4 py-4 sm:px-6">
              {navLinks.map((link) => (
                <Link
                  key={link.id}
                  href={`/#${link.id}`}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-lg px-3 text-base text-fg hover:bg-surface-2"
                >
                  {link.label}
                </Link>
              ))}
              <Button href="/#contact" arrow className="mt-2 w-full">
                Let&apos;s Work Together
              </Button>
            </nav>
          </m.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
```

- [ ] **Step 6: Implement the footer**

`src/components/layout/footer.tsx`:

```tsx
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { GitHubIcon, LinkedInMark } from "@/components/ui/social-icons";
import { caseStudies } from "@/content/case-studies";
import { navLinks } from "@/content/sections";
import { site } from "@/content/site";

const linkClass = "inline-flex min-h-8 items-center text-sm text-muted transition-colors hover:text-fg";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface/50">
      <Container className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.2fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <span aria-hidden className="grid size-9 place-items-center rounded-lg bg-accent font-mono text-sm font-bold text-accent-fg">
              AK
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">{site.brand}</p>
              <p className="text-[11px] text-muted">Web Intelligence Consultant</p>
            </div>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted">{site.jobTitle}. Web scraping, OCR extraction and ETL pipelines.</p>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted">
            <MapPin className="size-4" aria-hidden />
            {site.location.locality}, {site.location.country}
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-fg">Quick links</h2>
          <ul className="mt-4 space-y-1">
            <li>
              <Link href="/" className={linkClass}>Home</Link>
            </li>
            {navLinks.map((l) => (
              <li key={l.id}>
                <Link href={`/#${l.id}`} className={linkClass}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Case studies">
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-fg">Case studies</h2>
          <ul className="mt-4 space-y-1">
            {caseStudies.map((c) => (
              <li key={c.slug}>
                <Link href={`/case-studies/${c.slug}`} className={linkClass}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-fg">Connect</h2>
          <ul className="mt-4 space-y-1">
            <li>
              <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer me" className={`${linkClass} gap-2`}>
                <LinkedInMark /> LinkedIn
              </a>
            </li>
            <li>
              <a href={site.social.github} target="_blank" rel="noopener noreferrer me" className={`${linkClass} gap-2`}>
                <GitHubIcon /> GitHub
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className={`${linkClass} gap-2`}>
                <Mail className="size-5" aria-hidden /> Email
              </a>
            </li>
          </ul>
        </div>
      </Container>

      <Container className="flex flex-col gap-2 border-t border-line py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}. All rights reserved.
        </p>
        <p>Building a more open and data-driven world.</p>
      </Container>
    </footer>
  );
}
```

- [ ] **Step 7: Mount them in the layout**

In `src/app/layout.tsx`, add the imports and render `<Nav />` before and `<Footer />` after `<main>`:

```tsx
import { Footer } from "@/components/layout/footer";
import { Nav } from "@/components/layout/nav";
```

```tsx
<MotionProvider>
  <Nav />
  <main id="main">{children}</main>
  <Footer />
</MotionProvider>
```

- [ ] **Step 8: Verify**

```bash
npx vitest run && npm run typecheck && npm run lint && npm run build
npx next start -p 3100 &
sleep 4
node scripts/shot.mjs http://127.0.0.1:3100/ 1440 dark e2e/.output/t6-desktop.png false
node scripts/shot.mjs http://127.0.0.1:3100/ 375 light e2e/.output/t6-mobile.png false
kill %1
```

Expected: exit 0. In the desktop shot, the nav shows the AK mark, six links, the theme toggle and the CTA. At 375px it shows the brand, toggle and a menu button and no horizontal overflow. Then `npm run dev`, open the menu at 375px in a browser, press Escape (menu closes) and confirm the theme toggle flips the page colors.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add sticky navigation with active-section tracking, mobile menu and footer" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 7: Hero and the live extraction pipeline

**Files:**
- Create: `src/components/hero/split-headline.ts`, `hero-headline.tsx`, `hero.tsx`
- Create: `src/components/pipeline/frames.ts`, `extraction-pipeline.tsx`
- Create: `scripts/pipeline-phases.mjs`
- Test: `src/components/hero/split-headline.test.ts`, `src/components/pipeline/frames.test.ts`
- Modify: `src/app/page.tsx` (temporary: render `<Hero />`)

**Interfaces:**
- Consumes: `hero`, `HeadlineSegment` (content), `Container`, `Button`, `EASE_OUT`, `cn`.
- Produces:
  - `splitHeadline(lines: readonly (readonly HeadlineSegment[])[]): HeadlineWord[][]` where `HeadlineWord = { text: string; accent: boolean; index: number; last: boolean }`.
  - `frames.ts`: `PHASES`, `Phase`, `PHASE_MS`, `nextPhase`, `phaseAtLeast`, `phaseFromCursor`, `INITIAL_CURSOR`, `RAW_LINES`, `CHECKS`, `RECORDS`, `SAMPLE_TOTAL`.
  - `<ExtractionPipeline />` (client). Its outer element carries `data-phase` (`raw|scan|parse|output|hold`), which e2e tests read. The animated card is `role="img"` with an `aria-label`; a Pause/Play button sits outside it and is hidden under reduced motion.
  - `<Hero />` (server) with `id="hero-title"` on the `<h1>`.

- [ ] **Step 1: Write the failing tests**

`src/components/hero/split-headline.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { hero } from "@/content/hero";
import { splitHeadline } from "./split-headline";

describe("splitHeadline", () => {
  const lines = splitHeadline(hero.headline);
  const flat = lines.flat();

  it("splits the headline into words in reading order", () => {
    expect(flat.map((w) => w.text)).toEqual(["Turn", "Difficult", "Websites", "Into", "Reliable", "Data."]);
  });
  it("numbers words contiguously from 0", () => {
    expect(flat.map((w) => w.index)).toEqual([0, 1, 2, 3, 4, 5]);
  });
  it("carries the accent flag only on the accented words", () => {
    expect(flat.filter((w) => w.accent).map((w) => w.text)).toEqual(["Reliable", "Data."]);
  });
  it("marks the final word of each line", () => {
    expect(lines.map((l) => l.filter((w) => w.last).map((w) => w.text))).toEqual([["Websites"], ["Data."]]);
  });
});
```

`src/components/pipeline/frames.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { INITIAL_CURSOR, PHASES, PHASE_MS, RAW_LINES, RECORDS, nextPhase, phaseAtLeast, phaseFromCursor } from "./frames";

describe("pipeline phases", () => {
  it("cycles raw, scan, parse, output, hold and back", () => {
    expect(PHASES.map((_, i) => nextPhase(PHASES[i]))).toEqual(["scan", "parse", "output", "hold", "raw"]);
  });
  it("orders phases for phaseAtLeast", () => {
    expect(phaseAtLeast("output", "parse")).toBe(true);
    expect(phaseAtLeast("hold", "output")).toBe(true);
    expect(phaseAtLeast("scan", "output")).toBe(false);
  });
  it("starts on the completed frame and wraps cleanly", () => {
    expect(phaseFromCursor(INITIAL_CURSOR)).toBe("hold");
    expect(phaseFromCursor(INITIAL_CURSOR + 1)).toBe("raw");
    expect(phaseFromCursor(INITIAL_CURSOR + 7)).toBe("parse");
    expect(phaseFromCursor(-1)).toBe("hold");
  });
  it("keeps a full cycle between 7 and 11 seconds", () => {
    const total = PHASES.reduce((sum, p) => sum + PHASE_MS[p], 0);
    expect(total).toBeGreaterThanOrEqual(7000);
    expect(total).toBeLessThanOrEqual(11000);
  });
});

describe("pipeline sample data", () => {
  it("has three well-formed records", () => {
    expect(RECORDS).toHaveLength(3);
    for (const r of RECORDS) {
      expect(r.title.length).toBeGreaterThan(3);
      expect(Number.isInteger(r.price_inr)).toBe(true);
      expect(Number.isInteger(r.area_sqft)).toBe(true);
    }
  });
  it("highlights at least one raw line", () => {
    expect(RAW_LINES.some((l) => l.hot)).toBe(true);
  });
});
```

- [ ] **Step 2: Run to verify they fail**

Run: `npx vitest run src/components/hero src/components/pipeline`
Expected: FAIL, cannot resolve `./split-headline` and `./frames`.

- [ ] **Step 3: Implement `split-headline.ts` and `frames.ts`**

`src/components/hero/split-headline.ts`:

```ts
import type { HeadlineSegment } from "@/content/hero";

export type HeadlineWord = { text: string; accent: boolean; index: number; last: boolean };

/** Flattens headline lines into words, numbering them across lines so entrance delays can stagger. */
export function splitHeadline(lines: readonly (readonly HeadlineSegment[])[]): HeadlineWord[][] {
  let index = 0;
  return lines.map((segments) => {
    const words = segments.flatMap((segment) =>
      segment.text
        .split(" ")
        .filter(Boolean)
        .map((text) => ({ text, accent: Boolean(segment.accent) })),
    );
    return words.map((word, i) => ({ ...word, index: index++, last: i === words.length - 1 }));
  });
}
```

`src/components/pipeline/frames.ts`:

```ts
export const PHASES = ["raw", "scan", "parse", "output", "hold"] as const;
export type Phase = (typeof PHASES)[number];

/** Milliseconds each phase lasts. One full cycle is about nine seconds. */
export const PHASE_MS: Record<Phase, number> = { raw: 1000, scan: 1300, parse: 1000, output: 2700, hold: 2200 };

export function nextPhase(phase: Phase): Phase {
  return PHASES[(PHASES.indexOf(phase) + 1) % PHASES.length];
}

export function phaseAtLeast(current: Phase, target: Phase): boolean {
  return PHASES.indexOf(current) >= PHASES.indexOf(target);
}

export function phaseFromCursor(cursor: number): Phase {
  const n = PHASES.length;
  return PHASES[((cursor % n) + n) % n];
}

/** Cursor whose phase is "hold": the finished frame that the server renders. */
export const INITIAL_CURSOR = PHASES.length - 1;

/** Illustrative sample data. The pipeline is labeled "Sample run" in the UI and makes no real-world claim. */
export const RAW_LINES: { text: string; hot?: boolean }[] = [
  { text: '<div class="x9f2 _k3" data-v="8a1f">' },
  { text: '  <span class="p__7d">₹ 2,45,00,000</span>', hot: true },
  { text: '  <a href="/p?id=4821&s=e3b0c4">3 BHK · Bandra West</a>', hot: true },
  { text: '  <script>window.__ch="9f3a…"</script>' },
  { text: "  <!-- captcha · session · fingerprint -->" },
  { text: "</div>" },
];

export const CHECKS = ["Session rotated", "Proxy #14", "CAPTCHA solved"] as const;

export const RECORDS = [
  { title: "3 BHK · Bandra West", price_inr: 24500000, area_sqft: 1180 },
  { title: "2 BHK · Powai", price_inr: 13800000, area_sqft: 860 },
  { title: "4 BHK · Worli", price_inr: 61000000, area_sqft: 2150 },
] as const;

export const SAMPLE_TOTAL = 12480;
```

- [ ] **Step 4: Run to verify they pass**

Run: `npx vitest run src/components/hero src/components/pipeline`
Expected: PASS.

- [ ] **Step 5: Implement the pipeline component**

`src/components/pipeline/extraction-pipeline.tsx`:

```tsx
"use client";

import { animate, m, useReducedMotion } from "motion/react";
import { CircleCheck, Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { EASE_OUT } from "@/components/ui/reveal";
import { cn } from "@/lib/cn";
import { CHECKS, INITIAL_CURSOR, PHASE_MS, RAW_LINES, RECORDS, SAMPLE_TOTAL, phaseAtLeast, phaseFromCursor, type Phase } from "./frames";

const format = (n: number) => new Intl.NumberFormat("en-US").format(n);

const RAW_OPACITY: Record<Phase, number> = { raw: 1, scan: 1, parse: 0.55, output: 0.4, hold: 0.4 };

/** Advances an ever-increasing cursor on a timer; the phase is derived from it. */
function usePipelineCursor(running: boolean) {
  const [cursor, setCursor] = useState(INITIAL_CURSOR);
  useEffect(() => {
    if (!running) return;
    const delay = cursor === INITIAL_CURSOR ? 600 : PHASE_MS[phaseFromCursor(cursor)];
    const id = window.setTimeout(() => setCursor((c) => c + 1), delay);
    return () => window.clearTimeout(id);
  }, [cursor, running]);
  return cursor;
}

/** Shows the final total on the server; counts up whenever the output phase starts. */
function Counter({ active, reduced }: { active: boolean; reduced: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!active) {
      el.textContent = "0";
      return;
    }
    if (reduced) {
      el.textContent = format(SAMPLE_TOTAL);
      return;
    }
    const controls = animate(0, SAMPLE_TOTAL, {
      duration: 2.2,
      ease: "easeOut",
      onUpdate: (v) => {
        el.textContent = format(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [active, reduced]);
  return (
    <span ref={ref} className="tabular-nums">
      {format(SAMPLE_TOTAL)}
    </span>
  );
}

export function ExtractionPipeline() {
  const reduced = Boolean(useReducedMotion());
  const [paused, setPaused] = useState(false);
  const cursor = usePipelineCursor(!paused && !reduced);
  const phase: Phase = reduced ? "hold" : phaseFromCursor(cursor);
  const scanning = phase === "scan";
  const outputShown = phaseAtLeast(phase, "output");

  return (
    <div className="relative mx-auto w-full max-w-[560px]" data-phase={phase}>
      <div
        aria-hidden
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-[radial-gradient(closest-side,rgb(var(--glow)/0.22),transparent)] blur-2xl"
      />
      <div
        role="img"
        aria-label="Animated sample: raw HTML from a protected page is parsed into validated JSON records."
        className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-40px_rgb(var(--glow)/0.55)]"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-xs text-muted">
            <span className="size-2 rounded-full bg-ok" />
            target-site.com/listings
          </div>
          <span className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted">Sample run</span>
        </div>

        <div className="relative overflow-hidden border-b border-line bg-surface-2/60 px-4 py-3 font-mono text-[11px] leading-5">
          <p className="mb-1 text-[10px] uppercase tracking-wider text-muted">Raw response</p>
          {RAW_LINES.map((line, i) => (
            <m.div
              key={i}
              initial={false}
              animate={{ opacity: RAW_OPACITY[phase] }}
              transition={{ duration: 0.3, delay: phase === "raw" ? i * 0.09 : 0 }}
              className={cn("overflow-hidden text-ellipsis whitespace-pre text-muted transition-colors duration-300", line.hot && phaseAtLeast(phase, "parse") && "text-accent")}
            >
              {line.text}
            </m.div>
          ))}
          <m.div
            aria-hidden
            initial={false}
            animate={scanning ? { y: ["-100%", "100%"], opacity: [0, 1, 1, 0] } : { y: "-100%", opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-x-0 top-0 h-full border-b border-accent bg-gradient-to-b from-transparent to-[rgb(var(--glow)/0.16)]"
          />
        </div>

        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-2.5 text-[11px]">
          {CHECKS.map((label, i) => {
            const done = phaseAtLeast(phase, "scan");
            return (
              <m.li
                key={label}
                initial={false}
                animate={{ opacity: done ? 1 : 0.35 }}
                transition={{ duration: 0.3, delay: phase === "scan" ? 0.25 + i * 0.3 : 0 }}
                className="flex items-center gap-1.5 text-muted"
              >
                <CircleCheck
                  className={cn("size-3.5 transition-colors duration-300", done ? "text-ok" : "text-muted")}
                  style={{ transitionDelay: phase === "scan" ? `${250 + i * 300}ms` : "0ms" }}
                  aria-hidden
                />
                {label}
              </m.li>
            );
          })}
        </ul>

        <div aria-hidden className="flex h-6 justify-center">
          <svg width="12" height="24" viewBox="0 0 12 24" fill="none">
            <m.path
              d="M6 0V20M2 16l4 5 4-5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-accent"
              initial={false}
              animate={{ pathLength: phaseAtLeast(phase, "parse") ? 1 : 0, opacity: phaseAtLeast(phase, "parse") ? 1 : 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
            />
          </svg>
        </div>

        <div className="min-h-[190px] px-4 pb-3">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-wider text-muted">Structured output</p>
          <ul className="space-y-2" data-testid="pipeline-records">
            {RECORDS.map((r, i) => (
              <m.li
                key={r.title}
                initial={false}
                animate={outputShown ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                transition={{ duration: 0.4, delay: phase === "output" ? i * 0.35 : 0, ease: EASE_OUT }}
                className="flex items-start justify-between gap-3 font-mono text-[11px] leading-5"
              >
                <span className="min-w-0 break-words">
                  <span className="text-muted">{"{ "}</span>
                  <span className="text-accent">&quot;title&quot;</span>
                  <span className="text-muted">: </span>
                  <span>&quot;{r.title}&quot;</span>
                  <span className="text-muted">, </span>
                  <span className="text-accent">&quot;price_inr&quot;</span>
                  <span className="text-muted">: </span>
                  <span>{r.price_inr}</span>
                  <span className="text-muted">, </span>
                  <span className="text-accent">&quot;area_sqft&quot;</span>
                  <span className="text-muted">: </span>
                  <span>{r.area_sqft}</span>
                  <span className="text-muted">{" }"}</span>
                </span>
                <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-ok" aria-hidden />
              </m.li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between border-t border-line bg-surface-2/60 px-4 py-3 font-mono text-xs">
          <span className="text-muted">Records validated</span>
          <span className="text-fg">
            <Counter active={outputShown} reduced={reduced} />
          </span>
        </div>
      </div>

      {reduced ? null : (
        <div className="mt-2 flex justify-end">
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-pressed={paused}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-xs text-muted transition-colors hover:text-fg"
          >
            {paused ? <Play className="size-3.5" aria-hidden /> : <Pause className="size-3.5" aria-hidden />}
            {paused ? "Play animation" : "Pause animation"}
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Implement the headline and hero**

`src/components/hero/hero-headline.tsx`:

```tsx
"use client";

import { m } from "motion/react";
import { EASE_OUT } from "@/components/ui/reveal";
import type { HeadlineSegment } from "@/content/hero";
import { cn } from "@/lib/cn";
import { splitHeadline } from "./split-headline";

/** The page's single <h1>, revealed word by word. Text stays in the server HTML; `data-reveal` keeps it visible without JS. */
export function HeroHeadline({ lines }: { lines: HeadlineSegment[][] }) {
  const split = splitHeadline(lines);
  return (
    <h1 id="hero-title" className="mt-5 text-balance text-[clamp(2.5rem,6.2vw,4.4rem)] font-semibold leading-[1.04] tracking-[-0.035em]">
      {split.map((words, lineIndex) => (
        <span key={lineIndex}>
          <span className="block">
            {words.map((word) => (
              <span key={word.index}>
                <span className="inline-block overflow-hidden pb-[0.14em] align-bottom">
                  <m.span
                    data-reveal
                    className={cn("inline-block", word.accent && "text-accent")}
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 + word.index * 0.08, ease: EASE_OUT }}
                  >
                    {word.text}
                  </m.span>
                </span>
                {word.last ? null : " "}
              </span>
            ))}
          </span>
          {lineIndex < split.length - 1 ? " " : null}
        </span>
      ))}
    </h1>
  );
}
```

`src/components/hero/hero.tsx`:

```tsx
import { BadgeCheck, CircleCheck, Clock, Globe, Layers, MapPin } from "lucide-react";
import { ExtractionPipeline } from "@/components/pipeline/extraction-pipeline";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { hero } from "@/content/hero";
import { HeroHeadline } from "./hero-headline";

const factIcons = { pin: MapPin, clock: Clock, globe: Globe, layers: Layers, badge: BadgeCheck } as const;

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute left-1/2 top-[-12%] h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--glow)/0.2),transparent)] blur-2xl" />
      </div>

      <Container className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <Reveal y={10}>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{hero.eyebrow}</p>
          </Reveal>
          <HeroHeadline lines={hero.headline} />
          <Reveal delay={0.35}>
            <p className="mt-6 max-w-xl text-pretty text-lg text-muted">{hero.intro}</p>
            <ul className="mt-8 grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {hero.ticks.map((tick) => (
                <li key={tick} className="flex items-center gap-2.5 text-sm">
                  <CircleCheck className="size-[18px] shrink-0 text-accent" aria-hidden />
                  {tick}
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button href={hero.primaryCta.href} arrow>
                {hero.primaryCta.label}
              </Button>
              <Button href={hero.secondaryCta.href} variant="secondary">
                {hero.secondaryCta.label}
              </Button>
            </div>
          </Reveal>
        </div>

        <ExtractionPipeline />
      </Container>

      <Container className="mt-14">
        <Reveal delay={0.1}>
          <ul className="flex flex-wrap gap-x-8 gap-y-3 border-t border-line pt-6 text-sm text-muted">
            {hero.facts.map((fact) => {
              const Icon = factIcons[fact.icon];
              return (
                <li key={fact.label} className="flex items-center gap-2">
                  <Icon className="size-4 text-accent" aria-hidden />
                  {fact.label}
                </li>
              );
            })}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
```

- [ ] **Step 7: Render the hero on the temporary page and add the phase-capture script**

`src/app/page.tsx`:

```tsx
import { Hero } from "@/components/hero/hero";

export default function HomePage() {
  return <Hero />;
}
```

`scripts/pipeline-phases.mjs`:

```js
import { mkdirSync } from "node:fs";
import { chromium } from "@playwright/test";

mkdirSync("e2e/.output", { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await page.goto(process.argv[2] ?? "http://127.0.0.1:3100/", { waitUntil: "networkidle" });

const seen = new Set();
const deadline = Date.now() + 25000;
while (Date.now() < deadline && seen.size < 5) {
  const el = page.locator("[data-phase]").first();
  const phase = await el.getAttribute("data-phase");
  if (phase && !seen.has(phase)) {
    seen.add(phase);
    await el.screenshot({ path: `e2e/.output/pipeline-${phase}.png` });
  }
  await page.waitForTimeout(100);
}
console.log([...seen].join(","));
await browser.close();
```

- [ ] **Step 8: Verify visually and functionally**

```bash
npx vitest run && npm run typecheck && npm run lint && npm run build
npx next start -p 3100 &
sleep 4
node scripts/pipeline-phases.mjs
node scripts/shot.mjs http://127.0.0.1:3100/ 1440 dark e2e/.output/t7-dark.png false
node scripts/shot.mjs http://127.0.0.1:3100/ 1440 light e2e/.output/t7-light.png false
node scripts/shot.mjs http://127.0.0.1:3100/ 375 dark e2e/.output/t7-375.png false
kill %1
```

Expected: `pipeline-phases.mjs` prints all five phases (`hold,raw,scan,parse,output` in some order). Open `pipeline-raw.png`, `pipeline-scan.png` and `pipeline-output.png`: raw lines visible, a highlighted band mid-scan, JSON rows present in output. The hero shows no photo or person. At 375px the pipeline card fits without horizontal scroll and the JSON rows wrap instead of clipping. Fix visible defects, then re-run.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: add hero with animated extraction-pipeline visual" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 8: Capabilities marquee, services and stats

**Files:**
- Create: `src/components/sections/capabilities-marquee.tsx`, `services.tsx`, `stats.tsx`
- Modify: `src/app/page.tsx` (temporary: append the three sections)

**Interfaces:**
- Consumes: `capabilities`, `services`, `stats`, `sectionCopy`, `Section`, `SectionHeading`, `Container`, `Reveal`, `SpotlightCard`, `CountUp`, CSS classes `.marquee`, `.marquee-track`, `.marquee-dup`.
- Produces: `<CapabilitiesMarquee />` (client), `<Services />` (server, `id="services"`), `<Stats />` (server).

- [ ] **Step 1: Implement the marquee**

`src/components/sections/capabilities-marquee.tsx`:

```tsx
"use client";

import { Pause, Play } from "lucide-react";
import { useState } from "react";
import { Container } from "@/components/ui/container";
import { capabilities } from "@/content/capabilities";
import { sectionCopy } from "@/content/sections";

function Pill({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-fg">
      <span aria-hidden className="size-1.5 rounded-full bg-accent" />
      {children}
    </span>
  );
}

/** Concrete capabilities in a slow loop. Pausable, and a static wrapped list under reduced motion. */
export function CapabilitiesMarquee() {
  const [paused, setPaused] = useState(false);

  return (
    <section aria-label="Capabilities" className="border-y border-line bg-surface/40">
      <Container className="flex items-center gap-4 py-5 sm:gap-8">
        <p className="hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.18em] text-muted sm:block">
          {sectionCopy.capabilities.label}
        </p>
        <div
          className="marquee relative min-w-0 flex-1 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
          data-paused={paused}
        >
          <ul className="marquee-track flex">
            {capabilities.map((c) => (
              <li key={c} className="shrink-0 pr-3">
                <Pill>{c}</Pill>
              </li>
            ))}
            {capabilities.map((c) => (
              <li key={`${c}-dup`} aria-hidden className="marquee-dup shrink-0 pr-3">
                <Pill>{c}</Pill>
              </li>
            ))}
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-pressed={paused}
          aria-label={paused ? "Play capabilities scroll" : "Pause capabilities scroll"}
          className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:text-fg motion-reduce:hidden"
        >
          {paused ? <Play className="size-4" aria-hidden /> : <Pause className="size-4" aria-hidden />}
        </button>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Implement services**

`src/components/sections/services.tsx`:

```tsx
import { Braces, Cloud, Database, Globe, ScanText, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { sectionCopy } from "@/content/sections";
import { services } from "@/content/services";

const icons = { globe: Globe, shield: ShieldCheck, scan: ScanText, database: Database, cloud: Cloud, braces: Braces } as const;

export function Services() {
  const copy = sectionCopy.services;
  return (
    <Section id="services">
      <Container>
        <SectionHeading id="services" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = icons[service.icon];
            return (
              <li key={service.id}>
                <Reveal delay={(i % 3) * 0.07} className="h-full">
                  <SpotlightCard className="p-6">
                    <span className="grid size-11 place-items-center rounded-xl bg-surface-2 text-accent">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <h3 className="mt-5 text-lg font-semibold tracking-[-0.01em]">{service.title}</h3>
                    <p className="mt-2 text-sm text-muted">{service.description}</p>
                  </SpotlightCard>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 3: Implement stats**

`src/components/sections/stats.tsx`:

```tsx
import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";
import { stats } from "@/content/stats";

export function Stats() {
  return (
    <section aria-label="Key figures" className="pb-4">
      <Container>
        <Reveal>
          <ul className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line lg:grid-cols-4">
            {stats.map((stat) => (
              <li key={stat.label} className="bg-surface px-6 py-8 text-center">
                <p className="font-mono text-4xl font-semibold tracking-tight text-accent sm:text-5xl">
                  <CountUp value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm text-muted">{stat.label}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
    </section>
  );
}
```

- [ ] **Step 4: Append the sections to the temporary page**

`src/app/page.tsx`:

```tsx
import { Hero } from "@/components/hero/hero";
import { CapabilitiesMarquee } from "@/components/sections/capabilities-marquee";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CapabilitiesMarquee />
      <Services />
      <Stats />
    </>
  );
}
```

- [ ] **Step 5: Verify**

```bash
npx vitest run && npm run typecheck && npm run lint && npm run build
npx next start -p 3100 &
sleep 4
node scripts/shot.mjs http://127.0.0.1:3100/ 1440 dark e2e/.output/t8-dark.png
node scripts/shot.mjs http://127.0.0.1:3100/ 1440 light e2e/.output/t8-light.png
node scripts/shot.mjs http://127.0.0.1:3100/ 768 light e2e/.output/t8-768.png
node scripts/shot.mjs http://127.0.0.1:3100/ 375 dark e2e/.output/t8-375.png
kill %1
```

Expected: exit 0. In the screenshots the marquee shows capability pills with faded edges; services render as a 3-column grid at 1440, 2 at 768 and 1 at 375, each with its icon; the stats band shows `5+`, `10+`, `100M+`, `99%` (final values, since reveals have fired). No horizontal scroll at 375px. Then in a browser: hover a service card (lift plus cursor light), click the marquee pause button (scrolling stops, `aria-pressed` true), and with DevTools "prefers-reduced-motion: reduce" emulation confirm the marquee becomes a static wrapped list with no pause button.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add capabilities marquee, services grid and stats band" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 9: About and testimonials

**Files:**
- Create: `src/components/sections/about.tsx`, `src/components/sections/testimonials.tsx`
- Modify: `src/app/page.tsx` (temporary composition)

**Interfaces:**
- Consumes: `about`, `testimonials`, `site`, `sectionCopy`, `Section`, `SectionHeading`, `Container`, `Reveal`, `Button`, `GitHubIcon`, `LinkedInMark`.
- Produces: `<About />` (`id="about"`, with its own `<h2 id="about-title">`), `<Testimonials />` (`id="testimonials"`).

- [ ] **Step 1: Implement the About section**

`src/components/sections/about.tsx`:

```tsx
import { Mail, MapPin, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { GitHubIcon, LinkedInMark } from "@/components/ui/social-icons";
import { about } from "@/content/about";
import { sectionCopy } from "@/content/sections";
import { site } from "@/content/site";

const rowClass = "flex min-h-11 items-center gap-3 text-sm transition-colors hover:text-accent";

export function About() {
  const copy = sectionCopy.about;
  return (
    <Section id="about">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr]">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{copy.eyebrow}</p>
            <h2 id="about-title" className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              {copy.title}
            </h2>
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-pretty text-muted">
                {paragraph}
              </p>
            ))}
            <Button href="/#contact" variant="secondary" arrow className="mt-8">
              Get in touch
            </Button>
          </Reveal>

          <Reveal delay={0.08} className="h-full">
            <ul className="h-full space-y-1 rounded-2xl border border-line bg-surface p-5">
              <li className={rowClass}>
                <MapPin className="size-5 text-accent" aria-hidden />
                {site.location.locality}, {site.location.country}
              </li>
              <li>
                <a href={`mailto:${site.email}`} className={rowClass}>
                  <Mail className="size-5 text-accent" aria-hidden />
                  {site.email}
                </a>
              </li>
              <li>
                <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer me" className={rowClass}>
                  <LinkedInMark className="text-accent" />
                  {site.social.linkedin.replace("https://www.", "")}
                </a>
              </li>
              <li>
                <a href={site.social.github} target="_blank" rel="noopener noreferrer me" className={rowClass}>
                  <GitHubIcon className="text-accent" />
                  {site.social.github.replace("https://", "")}
                </a>
              </li>
            </ul>
          </Reveal>

          <Reveal delay={0.16} className="h-full">
            <figure className="h-full rounded-2xl border border-line bg-surface-2 p-6">
              <Quote className="size-8 text-accent/40" aria-hidden />
              <blockquote className="mt-4 text-pretty text-xl leading-snug">{about.quote}</blockquote>
              <figcaption className="mt-6 text-sm font-medium text-muted">{site.name}</figcaption>
            </figure>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 2: Implement testimonials (monograms, no avatars)**

`src/components/sections/testimonials.tsx`:

```tsx
import { Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { sectionCopy } from "@/content/sections";
import { testimonials } from "@/content/testimonials";

export function Testimonials() {
  const copy = sectionCopy.testimonials;
  return (
    <Section id="testimonials">
      <Container>
        <SectionHeading id="testimonials" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
        <ul className="grid gap-4 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <li key={t.company}>
              <Reveal delay={i * 0.08} className="h-full">
                <figure data-placeholder={t.placeholder} className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6">
                  <Quote className="size-7 text-accent/40" aria-hidden />
                  <blockquote className="mt-4 flex-1 text-pretty leading-relaxed">{t.quote}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3">
                    <span aria-hidden className="grid size-10 place-items-center rounded-xl bg-surface-2 font-mono text-xs font-semibold text-accent">
                      {t.monogram}
                    </span>
                    <span className="text-sm">
                      <span className="block font-medium">{t.role}</span>
                      <span className="text-muted">{t.company}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 3: Extend the temporary page**

`src/app/page.tsx`:

```tsx
import { Hero } from "@/components/hero/hero";
import { About } from "@/components/sections/about";
import { CapabilitiesMarquee } from "@/components/sections/capabilities-marquee";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";
import { Testimonials } from "@/components/sections/testimonials";

export default function HomePage() {
  return (
    <>
      <Hero />
      <CapabilitiesMarquee />
      <Services />
      <Stats />
      <About />
      <Testimonials />
    </>
  );
}
```

- [ ] **Step 4: Verify**

```bash
npm run typecheck && npm run lint && npm run build
npx next start -p 3100 &
sleep 4
node scripts/shot.mjs http://127.0.0.1:3100/ 1440 light e2e/.output/t9-light.png
node scripts/shot.mjs http://127.0.0.1:3100/ 375 dark e2e/.output/t9-375.png
kill %1
```

Expected: exit 0. About shows heading, two paragraphs, a contact card and a quote card; testimonials show three cards with monogram tiles (no images). At 375px everything stacks with no horizontal scroll.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add About and testimonials sections" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 10: Case studies (section, detail pages, diagram, social images)

**Files:**
- Create: `src/content/case-study-page.ts`
- Create: `src/components/sections/case-studies.tsx`, `src/components/case-study/architecture-diagram.tsx`
- Create: `src/app/case-studies/[slug]/page.tsx`, `src/app/case-studies/[slug]/opengraph-image.tsx`
- Create: `src/lib/og.tsx`, `src/app/opengraph-image.tsx`
- Modify: `src/app/page.tsx` (temporary composition)

**Interfaces:**
- Consumes: `caseStudies`, `getCaseStudy`, `CaseStudy`, `buildMetadata`, `caseStudyGraph`, `JsonLd`, `sectionCopy`, `SpotlightCard`, `Reveal`, `EASE_OUT`, `Button`, `site`.
- Produces:
  - `caseStudyPageCopy` (labels for the detail page).
  - `<CaseStudies />` (`id="case-studies"`); each card links to `/case-studies/[slug]` through a stretched link whose accessible name includes the title.
  - `<ArchitectureDiagram stages={string[]} />` (client).
  - `renderOg({ eyebrow, title, subtitle }): ImageResponse`.
  - Routes `/case-studies/[slug]` (statically generated, `dynamicParams = false`), `/opengraph-image`, `/case-studies/[slug]/opengraph-image`.

- [ ] **Step 1: Add the detail-page copy**

`src/content/case-study-page.ts`:

```ts
export const caseStudyPageCopy = {
  problem: "The problem",
  approach: "How I approached it",
  architecture: "Simplified architecture",
  architectureNote: "A simplified view of the stages, not a full system diagram.",
  stack: "Tools named",
  outcomes: "Outcomes",
  ctaTitle: "Have a similar problem?",
  ctaBody: "Tell me what data you need and where it lives. I'll suggest an approach.",
  ctaLabel: "Discuss your project",
  more: "More case studies",
  published: "Published",
} as const;
```

- [ ] **Step 2: Implement the case studies section**

`src/components/sections/case-studies.tsx`:

```tsx
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { SpotlightCard } from "@/components/ui/spotlight-card";
import { caseStudies } from "@/content/case-studies";
import { sectionCopy } from "@/content/sections";

export function CaseStudies() {
  const copy = sectionCopy.caseStudies;
  return (
    <Section id="case-studies">
      <Container>
        <SectionHeading id="case-studies" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
        <ul className="grid gap-4 lg:grid-cols-3">
          {caseStudies.map((cs, i) => (
            <li key={cs.slug}>
              <Reveal delay={i * 0.08} className="h-full">
                <SpotlightCard>
                  <div className="flex h-full flex-col p-6">
                    <span className="w-fit rounded-md bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-accent">{cs.category}</span>
                    <h3 className="mt-5 text-xl font-semibold tracking-[-0.01em]">{cs.title}</h3>
                    <p className="mt-3 flex-1 text-sm text-muted">{cs.summary}</p>
                    <Link
                      href={`/case-studies/${cs.slug}`}
                      className="group mt-6 inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-accent after:absolute after:inset-0 after:content-['']"
                    >
                      View Details
                      <span className="sr-only"> of {cs.title}</span>
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                    </Link>
                  </div>
                </SpotlightCard>
              </Reveal>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 3: Implement the architecture diagram**

`src/components/case-study/architecture-diagram.tsx`:

```tsx
"use client";

import { m } from "motion/react";
import { EASE_OUT } from "@/components/ui/reveal";

const view = { once: true, margin: "0px 0px -10% 0px" } as const;

/** Stages as boxes joined by connectors that draw in. Vertical on phones, horizontal from md up. */
export function ArchitectureDiagram({ stages }: { stages: string[] }) {
  return (
    <ol aria-label="Pipeline stages" className="flex flex-col items-stretch md:flex-row md:items-center">
      {stages.map((stage, i) => (
        <li key={stage} className="flex flex-col items-center md:flex-1 md:flex-row">
          <m.div
            data-reveal
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={view}
            transition={{ duration: 0.5, delay: i * 0.12, ease: EASE_OUT }}
            className="w-full rounded-xl border border-line bg-surface px-4 py-4 text-center text-sm font-medium md:min-h-[88px] md:flex-1 md:content-center"
          >
            <span className="mb-1 block font-mono text-[10px] text-accent">{String(i + 1).padStart(2, "0")}</span>
            {stage}
          </m.div>
          {i < stages.length - 1 ? (
            <>
              <m.span
                aria-hidden
                data-reveal
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={view}
                transition={{ duration: 0.4, delay: i * 0.12 + 0.2, ease: EASE_OUT }}
                className="block h-6 w-px origin-top bg-accent md:hidden"
              />
              <m.span
                aria-hidden
                data-reveal
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={view}
                transition={{ duration: 0.4, delay: i * 0.12 + 0.2, ease: EASE_OUT }}
                className="hidden h-px w-6 origin-left bg-accent md:block"
              />
            </>
          ) : null}
        </li>
      ))}
    </ol>
  );
}
```

- [ ] **Step 4: Implement the shared social-image renderer and the two image routes**

Next reads `size`, `contentType` and `alt` from these files, so they are written as literals in each file.

`src/lib/og.tsx`:

```tsx
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

type Input = { eyebrow: string; title: string; subtitle: string };

export function renderOg({ eyebrow, title, subtitle }: Input) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "#eaf0fb",
          background: "linear-gradient(135deg, #0a1020 0%, #111a2e 58%, #16305e 100%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "#4c9aff",
              color: "#06101f",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            AK
          </div>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 600 }}>{site.name}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 26, letterSpacing: 4, textTransform: "uppercase", color: "#4c9aff" }}>{eyebrow}</div>
          <div style={{ display: "flex", marginTop: 20, fontSize: 68, fontWeight: 700, lineHeight: 1.06 }}>{title}</div>
          <div style={{ display: "flex", marginTop: 24, fontSize: 28, lineHeight: 1.35, color: "#9fb0cb" }}>{subtitle}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#9fb0cb" }}>
          <div style={{ display: "flex" }}>
            {site.location.locality}, {site.location.country}
          </div>
          <div style={{ display: "flex" }}>Web scraping · OCR extraction · ETL pipelines</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
```

`src/app/opengraph-image.tsx`:

```tsx
import { site } from "@/content/site";
import { renderOg } from "@/lib/og";

export const alt = site.homeTitle;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOg({
    eyebrow: "Data Engineer · Web Intelligence Consultant",
    title: "Turn Difficult Websites Into Reliable Data.",
    subtitle: site.description,
  });
}
```

`src/app/case-studies/[slug]/opengraph-image.tsx`:

```tsx
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { renderOg } from "@/lib/og";

export const alt = "Case study by Ahraf Khatri";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  return renderOg({
    eyebrow: cs?.category ?? "Case study",
    title: cs?.title ?? "Case study",
    subtitle: cs?.summary ?? "",
  });
}
```

- [ ] **Step 5: Implement the detail page**

`src/app/case-studies/[slug]/page.tsx`:

```tsx
import { ArrowRight, ChevronRight, CircleCheck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArchitectureDiagram } from "@/components/case-study/architecture-diagram";
import { JsonLd } from "@/components/seo/json-ld";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { caseStudies, getCaseStudy } from "@/content/case-studies";
import { caseStudyPageCopy as copy } from "@/content/case-study-page";
import { buildMetadata } from "@/lib/seo/metadata";
import { caseStudyGraph } from "@/lib/seo/schema";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return caseStudies.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) return {};
  return buildMetadata({
    title: cs.title,
    description: cs.metaDescription,
    path: `/case-studies/${cs.slug}`,
    type: "article",
    publishedTime: cs.datePublished,
    modifiedTime: cs.dateModified,
  });
}

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

const h2 = "text-2xl font-semibold tracking-[-0.02em] sm:text-3xl";

export default async function CaseStudyPage({ params }: Props) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  if (!cs) notFound();
  const others = caseStudies.filter((c) => c.slug !== cs.slug);

  return (
    <>
      <JsonLd data={caseStudyGraph(cs)} />
      <article className="pb-20 pt-28 sm:pt-36">
        <Container className="max-w-[860px]">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
              <li>
                <Link href="/" className="hover:text-fg">Home</Link>
              </li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li>
                <Link href="/#case-studies" className="hover:text-fg">Case studies</Link>
              </li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li aria-current="page" className="text-fg">{cs.title}</li>
            </ol>
          </nav>

          <header className="mt-8">
            <p className="w-fit rounded-md bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-accent">{cs.category}</p>
            <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">{cs.title}</h1>
            <p className="mt-5 text-pretty text-lg text-muted">{cs.summary}</p>
            <p className="mt-4 text-sm text-muted">
              {copy.published} <time dateTime={cs.datePublished}>{formatDate(cs.datePublished)}</time>
            </p>
          </header>

          <Reveal className="mt-14">
            <section aria-labelledby="problem-title">
              <h2 id="problem-title" className={h2}>{copy.problem}</h2>
              <p className="mt-4 text-pretty text-muted">{cs.problem}</p>
            </section>
          </Reveal>

          <Reveal className="mt-14">
            <section aria-labelledby="approach-title">
              <h2 id="approach-title" className={h2}>{copy.approach}</h2>
              <ol className="mt-6 space-y-4">
                {cs.approach.map((step, i) => (
                  <li key={step.title} className="flex gap-4 rounded-2xl border border-line bg-surface p-5">
                    <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2 font-mono text-sm font-semibold text-accent">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold">{step.title}</h3>
                      <p className="mt-1 text-sm text-muted">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          </Reveal>

          <section aria-labelledby="architecture-title" className="mt-14">
            <h2 id="architecture-title" className={h2}>{copy.architecture}</h2>
            <div className="mt-6">
              <ArchitectureDiagram stages={cs.architecture} />
            </div>
            <p className="mt-4 text-sm text-muted">{copy.architectureNote}</p>
          </section>

          {cs.stack ? (
            <Reveal className="mt-14">
              <section aria-labelledby="stack-title">
                <h2 id="stack-title" className={h2}>{copy.stack}</h2>
                <ul className="mt-6 flex flex-wrap gap-2.5">
                  {cs.stack.map((tool) => (
                    <li key={tool} className="rounded-xl border border-line bg-surface px-4 py-2 font-mono text-sm">{tool}</li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ) : null}

          <Reveal className="mt-14">
            <section aria-labelledby="outcomes-title">
              <h2 id="outcomes-title" className={h2}>{copy.outcomes}</h2>
              <ul className="mt-6 space-y-3">
                {cs.outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-3">
                    <CircleCheck className="mt-0.5 size-5 shrink-0 text-ok" aria-hidden />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </section>
          </Reveal>

          <Reveal className="mt-16">
            <aside className="rounded-2xl border border-line bg-surface-2 p-8 text-center">
              <h2 className="text-2xl font-semibold tracking-[-0.02em]">{copy.ctaTitle}</h2>
              <p className="mx-auto mt-3 max-w-md text-muted">{copy.ctaBody}</p>
              <Button href="/#contact" arrow className="mt-6">{copy.ctaLabel}</Button>
            </aside>
          </Reveal>

          <nav aria-label={copy.more} className="mt-16">
            <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-muted">{copy.more}</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {others.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/case-studies/${c.slug}`}
                    className="group flex min-h-11 items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3 transition-colors hover:bg-surface-2"
                  >
                    <span className="font-medium">{c.title}</span>
                    <ArrowRight className="size-4 shrink-0 text-accent transition-transform duration-200 group-hover:translate-x-1" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </article>
    </>
  );
}
```

- [ ] **Step 6: Add the section to the temporary page**

In `src/app/page.tsx` import `CaseStudies` from `@/components/sections/case-studies` and render `<CaseStudies />` between `<About />` and `<Testimonials />`.

- [ ] **Step 7: Verify**

```bash
npx vitest run && npm run typecheck && npm run lint && npm run build
npx next start -p 3100 &
sleep 4
curl -s http://127.0.0.1:3100/case-studies/etl-pipeline | grep -o '<h1[^>]*>[^<]*</h1>'
curl -s http://127.0.0.1:3100/case-studies/etl-pipeline | grep -o '"@type":"TechArticle"'
curl -s http://127.0.0.1:3100/case-studies/etl-pipeline | grep -o '<link rel="canonical"[^>]*>'
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3100/case-studies/does-not-exist
curl -s http://127.0.0.1:3100/opengraph-image -o e2e/.output/og-home.png && file e2e/.output/og-home.png
curl -s http://127.0.0.1:3100/case-studies/document-extraction/opengraph-image -o e2e/.output/og-cs.png && file e2e/.output/og-cs.png
node scripts/shot.mjs http://127.0.0.1:3100/case-studies/real-estate-scraping 1440 dark e2e/.output/t10-cs-dark.png
node scripts/shot.mjs http://127.0.0.1:3100/case-studies/real-estate-scraping 375 light e2e/.output/t10-cs-375.png
kill %1
```

Expected: the `<h1>` prints the case study title; `"@type":"TechArticle"` and a canonical link are found; the unknown slug returns `404`; both `file` lines report `PNG image data, 1200 x 630`. Open `og-home.png`, `og-cs.png` and the screenshots: the OG images show the AK mark, eyebrow, title and subtitle without clipped text; the diagram runs horizontally at 1440 and vertically at 375; no horizontal scroll.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add case study cards, detail pages, architecture diagram and social images" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 11: Tech stack section

**Files:**
- Create: `src/components/sections/tech-stack.tsx`
- Modify: `src/content/stack.ts` (add `stackFootnote`), `src/app/globals.css` (append chip hover styles), `src/app/page.tsx`

**Interfaces:**
- Consumes: `stackGroups`, `StackItem`, `sectionCopy`, `Section`, `SectionHeading`, `Container`, `Reveal`.
- Produces: `<TechStack />` (`id="tech-stack"`, server component); `stackFootnote: string`. Logos are monochrome and take their brand color (mixed toward the foreground for legibility on both themes) on hover; items without a logo show a monogram tile.

- [ ] **Step 1: Add the footnote to the content**

Append to `src/content/stack.ts`:

```ts
export const stackFootnote = "…and more, chosen to fit each project.";
```

- [ ] **Step 2: Add the hover styles**

Append to `src/app/globals.css`:

```css
/* Tech chips: monochrome by default, brand color (mixed toward the foreground so dark brands stay legible) on hover. */
.tech-chip {
  transition: border-color 200ms ease;
}
.tech-chip .tech-icon {
  transition: color 200ms ease;
}
.tech-chip:hover {
  border-color: color-mix(in oklab, var(--brand, var(--accent)) 50%, var(--border));
}
.tech-chip:hover .tech-icon {
  color: color-mix(in oklab, var(--brand, var(--accent)) 65%, var(--fg));
}
```

- [ ] **Step 3: Implement the section**

`src/components/sections/tech-stack.tsx`:

```tsx
import type { CSSProperties } from "react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { sectionCopy } from "@/content/sections";
import { stackFootnote, stackGroups, type StackItem } from "@/content/stack";

function TechChip({ item }: { item: StackItem }) {
  const style = item.icon ? ({ "--brand": `#${item.icon.hex}` } as CSSProperties) : undefined;
  return (
    <li style={style} className="tech-chip flex min-h-11 items-center gap-2.5 rounded-xl border border-line bg-bg px-3 py-2 text-sm">
      <span className="tech-icon grid size-8 place-items-center rounded-lg bg-surface-2 text-muted">
        {item.icon ? (
          <svg viewBox="0 0 24 24" className="size-[18px]" fill="currentColor" aria-hidden>
            <path d={item.icon.path} />
          </svg>
        ) : (
          <span aria-hidden className="font-mono text-[10px] font-bold">
            {item.monogram}
          </span>
        )}
      </span>
      {item.name}
    </li>
  );
}

export function TechStack() {
  const copy = sectionCopy.techStack;
  return (
    <Section id="tech-stack">
      <Container>
        <SectionHeading id="tech-stack" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
        <div className="grid gap-4 md:grid-cols-2">
          {stackGroups.map((group, i) => (
            <Reveal key={group.id} delay={(i % 2) * 0.08} className="h-full">
              <div className="h-full rounded-2xl border border-line bg-surface p-6">
                <h3 className="text-base font-semibold">{group.label}</h3>
                <p className="mt-1 text-sm text-muted">{group.blurb}</p>
                <ul className="mt-5 flex flex-wrap gap-2.5">
                  {group.items.map((item) => (
                    <TechChip key={item.name} item={item} />
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted">{stackFootnote}</p>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 4: Add it to the temporary page**

In `src/app/page.tsx` import `TechStack` from `@/components/sections/tech-stack` and render `<TechStack />` after `<CaseStudies />`.

- [ ] **Step 5: Verify, including the hover state in dark mode**

```bash
npx vitest run && npm run typecheck && npm run lint && npm run build
npx next start -p 3100 &
sleep 4
node scripts/shot.mjs http://127.0.0.1:3100/ 1440 dark e2e/.output/t11-dark.png
node scripts/shot.mjs http://127.0.0.1:3100/ 375 light e2e/.output/t11-375.png
node --input-type=module -e '
import { chromium } from "@playwright/test";
const b = await chromium.launch({ channel: "chrome" });
const p = await b.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: "dark" });
await p.goto("http://127.0.0.1:3100/#tech-stack", { waitUntil: "networkidle" });
await p.locator("#tech-stack").scrollIntoViewIfNeeded();
await p.waitForTimeout(800);
await p.getByText("Django", { exact: true }).hover();
await p.waitForTimeout(400);
await p.locator("#tech-stack").screenshot({ path: "e2e/.output/t11-hover.png" });
await b.close();
'
kill %1
```

Expected: exit 0. Four cards (Scraping & Automation, Data & Storage, Infrastructure, AI & OCR) with consistent chips. Playwright, AWS, Tesseract and EasyOCR show monogram tiles; the rest show monochrome logos. In `t11-hover.png` the hovered Django chip is tinted green and still legible on the dark surface.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add grouped, unified tech stack section" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 12: FAQ and contact (form, validation, API route)

**Files:**
- Modify: `src/app/globals.css` (add `--danger`), `src/app/globals.test.ts`
- Create: `src/lib/contact.ts`, `src/lib/rate-limit.ts`, `src/app/api/contact/route.ts`
- Create: `src/components/sections/faq.tsx`, `contact.tsx`, `contact-form.tsx`
- Test: `src/lib/contact.test.ts`, `src/lib/rate-limit.test.ts`, `src/app/api/contact/route.test.ts`, `src/components/sections/contact-form.test.tsx`

**Interfaces:**
- Consumes: `contactCopy`, `projectTypeValues`, `budgetValues`, `projectTypeLabels`, `budgetLabels`, `site`, `faq`, `sectionCopy`, `Section`, `SectionHeading`, `Reveal`, `Button`.
- Produces:
  - `contactSchema` (zod object: `name, email, projectType, budget?, message, website?`), `type ContactInput`.
  - `buildEmailSubject(d: ContactInput): string`, `buildEmailText(d: ContactInput): string`, `buildMailto(d: ContactInput): string`, `openMailClient(url: string): void`.
  - `createRateLimiter({ limit: number; windowMs: number }): { check(key: string, now?: number): { ok: boolean; remaining: number; retryAfterSeconds: number } }`.
  - `POST /api/contact`: `200 {ok:true}`, `400 {error:"invalid_json"}`, `422 {error:"validation", fieldErrors}`, `429 {error:"rate_limited"}` + `Retry-After`, `502 {error:"send_failed"}`, `503 {error:"email_not_configured"}`. A non-empty honeypot `website` field returns `200` without sending.
  - `<Faq />` (`id="faq"`, native `<details>`, all answers present in the HTML), `<Contact />` (`id="contact"`), `<ContactForm />` (client). Field ids are `contact-name`, `contact-email`, `contact-projectType`, `contact-budget`, `contact-message`.
  - CSS token `--danger` (Tailwind `text-danger`, `border-danger`).

- [ ] **Step 1: Add the `--danger` token, test first**

In `src/app/globals.test.ts` add `"danger"` to the required keys list and these two pairs to `pairs`:

```ts
  ["danger", "bg"],
  ["danger", "surface"],
```

```ts
    for (const key of ["bg", "surface", "surface-2", "border", "fg", "muted", "accent", "accent-fg", "ok", "danger"]) {
```

Run: `npx vitest run src/app/globals.test.ts`
Expected: FAIL, `--danger` is not defined in either theme.

- [ ] **Step 2: Add the token**

In `src/app/globals.css`, add `--danger: #b91c1c;` to the `:root` block, `--danger: #f87171;` to the `.dark` block, and `--color-danger: var(--danger);` to `@theme inline`.

Run: `npx vitest run src/app/globals.test.ts`
Expected: PASS.

- [ ] **Step 3: Write the failing tests for validation, mail helpers and rate limiting**

`src/lib/contact.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { site } from "@/content/site";
import { buildEmailSubject, buildEmailText, buildMailto, contactSchema } from "./contact";

const valid = {
  name: "  Test Person ",
  email: " test@example.com ",
  projectType: "web-scraping",
  message: "I need listings from ten portals delivered daily.",
};

describe("contactSchema", () => {
  it("accepts a valid submission and trims text fields", () => {
    const r = contactSchema.safeParse(valid);
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.name).toBe("Test Person");
      expect(r.data.email).toBe("test@example.com");
    }
  });

  it("returns friendly messages for each invalid field", () => {
    const r = contactSchema.safeParse({ name: "A", email: "nope", projectType: "", message: "short" });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fields = z.flattenError(r.error).fieldErrors;
      expect(fields.name?.[0]).toBe("Please enter your name");
      expect(fields.email?.[0]).toBe("Enter a valid email address");
      expect(fields.projectType?.[0]).toBe("Choose a project type");
      expect(fields.message?.[0]).toContain("at least 20 characters");
    }
  });

  it("treats budget as optional but rejects unknown values", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, budget: "under-2k" }).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, budget: "lots" }).success).toBe(false);
  });

  it("rejects an over-long message", () => {
    expect(contactSchema.safeParse({ ...valid, message: "x".repeat(4001) }).success).toBe(false);
  });
});

describe("mail helpers", () => {
  const data = contactSchema.parse({ ...valid, budget: "2k-5k" });

  it("writes a readable subject and body", () => {
    expect(buildEmailSubject(data)).toBe("New project enquiry: Web scraping (Test Person)");
    const text = buildEmailText(data);
    expect(text).toContain("Name: Test Person");
    expect(text).toContain("Budget: $2k to $5k");
    expect(text).toContain(data.message);
  });

  it("marks a missing budget as not specified", () => {
    expect(buildEmailText(contactSchema.parse(valid))).toContain("Budget: Not specified");
  });

  it("builds a mailto link that round-trips", () => {
    const url = buildMailto(data);
    expect(url.startsWith(`mailto:${site.email}?subject=`)).toBe(true);
    const params = new URLSearchParams(url.split("?")[1]);
    expect(params.get("subject")).toBe(buildEmailSubject(data));
    expect(params.get("body")).toBe(buildEmailText(data));
  });
});
```

`src/lib/rate-limit.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createRateLimiter } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows up to the limit, then blocks with a retry hint", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 60_000 });
    expect([1, 2, 3].map((i) => limiter.check("ip", i * 1000).ok)).toEqual([true, true, true]);
    const blocked = limiter.check("ip", 4000);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSeconds).toBe(57);
  });

  it("frees capacity once the window has passed", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000 });
    expect(limiter.check("ip", 0).ok).toBe(true);
    expect(limiter.check("ip", 500).ok).toBe(false);
    expect(limiter.check("ip", 1001).ok).toBe(true);
  });

  it("tracks keys independently and reports remaining capacity", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 60_000 });
    expect(limiter.check("a", 0).remaining).toBe(1);
    expect(limiter.check("a", 1).remaining).toBe(0);
    expect(limiter.check("b", 2).ok).toBe(true);
  });
});
```

`src/app/api/contact/route.test.ts`:

```ts
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { send } = vi.hoisted(() => ({ send: vi.fn() }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send };
  },
}));

import { POST } from "./route";

const valid = {
  name: "Test Person",
  email: "test@example.com",
  projectType: "web-scraping",
  message: "I need listings from ten portals delivered daily to Postgres.",
};

let counter = 0;
function post(body: unknown, ip = `10.0.0.${++counter}`) {
  return POST(
    new Request("http://localhost/api/contact", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": ip },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  send.mockReset();
  send.mockResolvedValue({ data: { id: "1" }, error: null });
  vi.stubEnv("RESEND_API_KEY", "re_test");
  vi.stubEnv("CONTACT_TO_EMAIL", "owner@example.com");
});
afterEach(() => vi.unstubAllEnvs());

describe("POST /api/contact", () => {
  it("emails the owner with the visitor as reply-to", async () => {
    const res = await post(valid);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@example.com",
        replyTo: "test@example.com",
        subject: expect.stringContaining("Web scraping"),
        text: expect.stringContaining(valid.message),
      }),
    );
  });

  it("returns 422 with field errors for invalid input", async () => {
    const res = await post({ ...valid, email: "nope" });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error).toBe("validation");
    expect(body.fieldErrors.email).toBeTruthy();
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 400 for a body that is not JSON", async () => {
    expect((await post("not json")).status).toBe(400);
  });

  it("pretends success but sends nothing when the honeypot is filled", async () => {
    const res = await post({ ...valid, website: "http://spam.example" });
    expect(res.status).toBe(200);
    expect(send).not.toHaveBeenCalled();
  });

  it("returns 503 so the client can fall back to the mail client when email is not configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    const res = await post(valid);
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "email_not_configured" });
  });

  it("returns 502 when the email provider rejects the message", async () => {
    send.mockResolvedValue({ data: null, error: { name: "validation_error", message: "bad" } });
    expect((await post(valid)).status).toBe(502);
  });

  it("rate limits repeated submissions from one IP", async () => {
    const ip = "203.0.113.9";
    const statuses: number[] = [];
    for (let i = 0; i < 6; i++) statuses.push((await post(valid, ip)).status);
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429]);
    const blocked = await post(valid, ip);
    expect(blocked.headers.get("retry-after")).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run to verify they fail**

Run: `npx vitest run src/lib/contact.test.ts src/lib/rate-limit.test.ts src/app/api`
Expected: FAIL, cannot resolve `./contact`, `./rate-limit`, `./route`.

- [ ] **Step 5: Implement the validation, mail helpers and rate limiter**

`src/lib/contact.ts`:

```ts
import { z } from "zod";
import { budgetLabels, budgetValues, contactCopy, projectTypeLabels, projectTypeValues } from "@/content/contact";
import { site } from "@/content/site";

export const contactSchema = z.object({
  name: z.string().trim().min(2, contactCopy.validation.name).max(80),
  email: z.string().trim().max(120).pipe(z.email(contactCopy.validation.email)),
  projectType: z.enum(projectTypeValues, { error: contactCopy.validation.projectType }),
  budget: z.enum(budgetValues).optional(),
  message: z.string().trim().min(20, contactCopy.validation.message).max(4000),
  /** Honeypot: real visitors never see or fill this. The server treats any value as spam. */
  website: z.string().max(200).optional(),
});

export type ContactInput = z.infer<typeof contactSchema>;

export function buildEmailSubject(d: ContactInput): string {
  return `New project enquiry: ${projectTypeLabels[d.projectType]} (${d.name})`;
}

export function buildEmailText(d: ContactInput): string {
  return [
    `Name: ${d.name}`,
    `Email: ${d.email}`,
    `Project type: ${projectTypeLabels[d.projectType]}`,
    `Budget: ${d.budget ? budgetLabels[d.budget] : "Not specified"}`,
    "",
    d.message,
  ].join("\n");
}

export function buildMailto(d: ContactInput): string {
  return `mailto:${site.email}?subject=${encodeURIComponent(buildEmailSubject(d))}&body=${encodeURIComponent(buildEmailText(d))}`;
}

/** Hands the message to the visitor's mail client. Separate from the form so tests can replace it. */
export function openMailClient(url: string): void {
  window.location.assign(url);
}
```

`src/lib/rate-limit.ts`:

```ts
type Options = { limit: number; windowMs: number };
type Result = { ok: boolean; remaining: number; retryAfterSeconds: number };

/** In-memory sliding window. Best effort per server instance; use a shared store if the site is scaled out. */
export function createRateLimiter({ limit, windowMs }: Options) {
  const hits = new Map<string, number[]>();

  function prune(now: number) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= windowMs)) hits.delete(key);
    }
  }

  return {
    check(key: string, now = Date.now()): Result {
      if (hits.size > 1000) prune(now);
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { ok: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000)) };
      }
      recent.push(now);
      hits.set(key, recent);
      return { ok: true, remaining: limit - recent.length, retryAfterSeconds: 0 };
    },
  };
}
```

- [ ] **Step 6: Implement the route**

`src/app/api/contact/route.ts`:

```ts
import { Resend } from "resend";
import { z } from "zod";
import { site } from "@/content/site";
import { buildEmailSubject, buildEmailText, contactSchema } from "@/lib/contact";
import { createRateLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Best effort, per server instance. Put a shared store behind this if the site is scaled out.
const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 });

const json = (body: unknown, status = 200, headers?: HeadersInit) => Response.json(body, { status, headers });

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const limit = limiter.check(ip);
  if (!limit.ok) return json({ error: "rate_limited" }, 429, { "Retry-After": String(limit.retryAfterSeconds) });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // Honeypot: report success so bots learn nothing.
  if (typeof body === "object" && body !== null && "website" in body && (body as { website?: unknown }).website) {
    return json({ ok: true });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return json({ error: "validation", fieldErrors: z.flattenError(parsed.error).fieldErrors }, 422);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return json({ error: "email_not_configured" }, 503);

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
    to: process.env.CONTACT_TO_EMAIL || site.email,
    replyTo: parsed.data.email,
    subject: buildEmailSubject(parsed.data),
    text: buildEmailText(parsed.data),
  });

  if (error) {
    console.error("contact: email provider rejected the message:", error.name);
    return json({ error: "send_failed" }, 502);
  }
  return json({ ok: true });
}
```

- [ ] **Step 7: Run to verify they pass**

Run: `npx vitest run src/lib src/app`
Expected: PASS.

- [ ] **Step 8: Write the failing form test**

`src/components/sections/contact-form.test.tsx`:

```tsx
// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/contact", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/contact")>()),
  openMailClient: vi.fn(),
}));

import { openMailClient } from "@/lib/contact";
import { ContactForm } from "./contact-form";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

async function fillValid(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Name"), "Test Person");
  await user.type(screen.getByLabelText("Email"), "test@example.com");
  await user.selectOptions(screen.getByLabelText("Project type"), "web-scraping");
  await user.type(screen.getByLabelText("Tell me about your project"), "I need listings from ten portals delivered daily.");
}

const send = (user: ReturnType<typeof userEvent.setup>) => user.click(screen.getByRole("button", { name: "Send message" }));

describe("ContactForm", () => {
  it("shows friendly errors, marks fields invalid and does not call the API", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<ContactForm />);

    await send(user);

    expect(await screen.findByText("Please enter your name")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address")).toBeInTheDocument();
    expect(screen.getByText("Choose a project type")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText("Name")).toHaveAttribute("aria-describedby", "contact-name-error");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("posts clean JSON without an empty budget and confirms success", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValid(user);
    await send(user);

    expect(await screen.findByText(/your message is on its way/i)).toBeInTheDocument();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/contact");
    expect(JSON.parse(init.body)).toEqual({
      name: "Test Person",
      email: "test@example.com",
      projectType: "web-scraping",
      message: "I need listings from ten portals delivered daily.",
      website: "",
    });
    expect(screen.getByLabelText("Name")).toHaveValue("");
  });

  it("falls back to the visitor's mail client when the server has no email configured", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503, json: async () => ({ error: "email_not_configured" }) }));
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValid(user);
    await send(user);

    expect(await screen.findByText(/Email isn't configured on the server yet/)).toBeInTheDocument();
    expect(openMailClient).toHaveBeenCalledWith(expect.stringMatching(/^mailto:/));
    expect(screen.getByRole("link", { name: /open email app again/i })).toHaveAttribute("href", expect.stringMatching(/^mailto:/));
  });

  it("explains rate limiting", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 429, json: async () => ({}) }));
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValid(user);
    await send(user);

    expect(await screen.findByRole("alert")).toHaveTextContent(/too many messages/i);
  });

  it("shows a generic error when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    const user = userEvent.setup();
    render(<ContactForm />);

    await fillValid(user);
    await send(user);

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent(/something went wrong/i));
  });
});
```

- [ ] **Step 9: Run to verify it fails**

Run: `npx vitest run src/components/sections/contact-form.test.tsx`
Expected: FAIL, cannot resolve `./contact-form`.

- [ ] **Step 10: Implement the form**

`src/components/sections/contact-form.tsx`:

```tsx
"use client";

import { CircleAlert, CircleCheck, LoaderCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { budgetLabels, budgetValues, contactCopy, projectTypeLabels, projectTypeValues } from "@/content/contact";
import { cn } from "@/lib/cn";
import { buildMailto, contactSchema, openMailClient } from "@/lib/contact";

type Status = "idle" | "submitting" | "success" | "fallback" | "error" | "rate-limited";
type FieldName = "name" | "email" | "projectType" | "budget" | "message";
type FieldErrors = Partial<Record<FieldName, string[]>>;

const control =
  "mt-2 block min-h-11 w-full rounded-lg border border-line bg-bg px-3.5 py-2.5 text-base text-fg placeholder:text-muted transition-colors focus:border-accent aria-[invalid=true]:border-danger";
const label = "text-sm font-medium";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [mailto, setMailto] = useState<string | null>(null);

  const a11y = (name: FieldName) => ({
    id: `contact-${name}`,
    name,
    "aria-invalid": Boolean(errors[name]),
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });
  const fieldError = (name: FieldName) =>
    errors[name] ? (
      <p id={`contact-${name}-error`} className="mt-1.5 text-sm text-danger">
        {errors[name]?.[0]}
      </p>
    ) : null;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const parsed = contactSchema.safeParse({
      name: raw.name,
      email: raw.email,
      projectType: raw.projectType,
      budget: raw.budget || undefined,
      message: raw.message,
      website: raw.website ?? "",
    });

    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors as FieldErrors);
      setStatus("idle");
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }

    setErrors({});
    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (res.ok) {
        form.reset();
        setStatus("success");
        return;
      }
      if (res.status === 503) {
        const href = buildMailto(parsed.data);
        setMailto(href);
        setStatus("fallback");
        openMailClient(href);
        return;
      }
      if (res.status === 422) {
        const data = await res.json();
        setErrors((data.fieldErrors ?? {}) as FieldErrors);
        setStatus("idle");
        return;
      }
      setStatus(res.status === 429 ? "rate-limited" : "error");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="relative space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={label}>{contactCopy.fields.name}</label>
          <input type="text" autoComplete="name" required placeholder={contactCopy.placeholders.name} className={control} {...a11y("name")} />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor="contact-email" className={label}>{contactCopy.fields.email}</label>
          <input type="email" autoComplete="email" required placeholder={contactCopy.placeholders.email} className={control} {...a11y("email")} />
          {fieldError("email")}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-projectType" className={label}>{contactCopy.fields.projectType}</label>
          <select required defaultValue="" className={control} {...a11y("projectType")}>
            <option value="" disabled>{contactCopy.placeholders.projectType}</option>
            {projectTypeValues.map((v) => (
              <option key={v} value={v}>{projectTypeLabels[v]}</option>
            ))}
          </select>
          {fieldError("projectType")}
        </div>
        <div>
          <label htmlFor="contact-budget" className={label}>{contactCopy.fields.budget}</label>
          <select defaultValue="" className={control} {...a11y("budget")}>
            <option value="">{contactCopy.placeholders.budget}</option>
            {budgetValues.map((v) => (
              <option key={v} value={v}>{budgetLabels[v]}</option>
            ))}
          </select>
          {fieldError("budget")}
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={label}>{contactCopy.fields.message}</label>
        <textarea rows={5} required placeholder={contactCopy.placeholders.message} className={cn(control, "resize-y")} {...a11y("message")} />
        {fieldError("message")}
      </div>

      {/* Honeypot: hidden from people and assistive tech, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 text-sm font-semibold text-accent-fg transition-[transform,filter] duration-200 hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
      >
        {status === "submitting" ? (
          <LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
        ) : (
          <Send className="size-4" aria-hidden />
        )}
        {status === "submitting" ? contactCopy.submitting : contactCopy.submit}
      </button>

      <div aria-live="polite" className="min-h-6">
        {status === "success" ? (
          <p role="status" className="flex items-start gap-2 text-sm text-ok">
            <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            {contactCopy.success}
          </p>
        ) : null}
        {status === "fallback" && mailto ? (
          <p role="status" className="flex items-start gap-2 text-sm text-fg">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
            <span>
              {contactCopy.fallback}{" "}
              <a href={mailto} className="font-medium text-accent underline underline-offset-2">
                Open email app again
              </a>
            </span>
          </p>
        ) : null}
        {status === "error" || status === "rate-limited" ? (
          <p role="alert" className="flex items-start gap-2 text-sm text-danger">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            {status === "error" ? contactCopy.error : contactCopy.rateLimited}
          </p>
        ) : null}
      </div>
    </form>
  );
}
```

- [ ] **Step 11: Run to verify the form tests pass**

Run: `npx vitest run`
Expected: all PASS. If `getByLabelText("Name")` matches more than one element, the honeypot label text must not be exactly "Name" (it is "Website"); fix the label rather than the test.

- [ ] **Step 12: Implement the FAQ and contact sections**

`src/components/sections/faq.tsx`:

```tsx
import { ChevronDown } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { faq } from "@/content/faq";
import { sectionCopy } from "@/content/sections";

/** Native <details>: keyboard accessible, works without JS, and every answer stays in the HTML for crawlers and AI engines. */
export function Faq() {
  const copy = sectionCopy.faq;
  return (
    <Section id="faq">
      <Container className="max-w-[860px]">
        <SectionHeading id="faq" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} className="lg:grid-cols-1" />
        <div className="space-y-3">
          {faq.map((item, i) => (
            <Reveal key={item.question} delay={Math.min(i, 4) * 0.04}>
              <details open={i === 0} className="group rounded-2xl border border-line bg-surface open:bg-surface-2/60">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                  <h3 className="text-base font-semibold">{item.question}</h3>
                  <ChevronDown className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" aria-hidden />
                </summary>
                <p className="text-pretty px-5 pb-5 text-muted">{item.answer}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
```

`src/components/sections/contact.tsx`:

```tsx
import { Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Section } from "@/components/ui/section";
import { GitHubIcon, LinkedInMark } from "@/components/ui/social-icons";
import { sectionCopy } from "@/content/sections";
import { site } from "@/content/site";
import { ContactForm } from "./contact-form";

const row = "flex min-h-11 items-center gap-3 text-sm transition-colors hover:text-accent";

export function Contact() {
  const copy = sectionCopy.contact;
  return (
    <Section id="contact" className="border-t border-line bg-surface/40">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">{copy.eyebrow}</p>
            <h2 id="contact-title" className="mt-3 text-balance text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">
              {copy.title}
            </h2>
            <p className="mt-5 max-w-md text-pretty text-muted">{copy.intro}</p>
            <ul className="mt-8 space-y-1">
              <li className={row}>
                <MapPin className="size-5 text-accent" aria-hidden />
                {site.location.locality}, {site.location.country}
              </li>
              <li>
                <a href={`mailto:${site.email}`} className={row}>
                  <Mail className="size-5 text-accent" aria-hidden />
                  {site.email}
                </a>
              </li>
              <li>
                <a href={site.social.linkedin} target="_blank" rel="noopener noreferrer me" className={row}>
                  <LinkedInMark className="text-accent" />
                  LinkedIn
                </a>
              </li>
              <li>
                <a href={site.social.github} target="_blank" rel="noopener noreferrer me" className={row}>
                  <GitHubIcon className="text-accent" />
                  GitHub
                </a>
              </li>
            </ul>
            <Button href={`mailto:${site.email}`} variant="secondary" className="mt-8">
              Send an Email
            </Button>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 13: Add both to the temporary page and verify against a real server**

In `src/app/page.tsx`, import `Faq` and `Contact` and render `<Faq />` and `<Contact />` after `<Testimonials />`. Then:

```bash
npx vitest run && npm run typecheck && npm run lint && npm run build
RESEND_API_KEY= npx next start -p 3100 &
sleep 4
curl -s -X POST http://127.0.0.1:3100/api/contact -H 'content-type: application/json' \
  -d '{"name":"Test Person","email":"test@example.com","projectType":"web-scraping","message":"I need listings from ten portals delivered daily."}' -w "\n%{http_code}\n"
curl -s -X POST http://127.0.0.1:3100/api/contact -H 'content-type: application/json' -d '{"name":"A"}' -w "\n%{http_code}\n"
node scripts/shot.mjs http://127.0.0.1:3100/ 1440 dark e2e/.output/t12-dark.png
node scripts/shot.mjs http://127.0.0.1:3100/ 375 light e2e/.output/t12-375.png
kill %1
```

Expected: the first `curl` prints `{"error":"email_not_configured"}` and `503` (no key set, so nothing is sent); the second prints a `validation` error with `fieldErrors` and `422`. In the screenshots: the FAQ shows the first answer open and the rest collapsed; the contact section shows the form beside the contact details; at 375px nothing scrolls horizontally and the inputs are at least 44px tall.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: add FAQ, contact section, validated form and contact API with mail fallback" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 13: Assemble the homepage, 404 page and console-error check

**Files:**
- Modify: `src/app/page.tsx` (final composition)
- Create: `src/app/not-found.tsx`, `scripts/console-check.mjs`

**Interfaces:**
- Consumes: every section component, `JsonLd`, `homeGraph`, `buildMetadata`, `site`, `Button`, `Container`.
- Produces: the finished `/` route (metadata + JSON-LD graph + ten sections in spec order) and a styled `404` that is `noindex`. `scripts/console-check.mjs [baseUrl]` exits non-zero if any page logs a console error or warning, or throws a page error.

- [ ] **Step 1: Write the final homepage**

`src/app/page.tsx`:

```tsx
import type { Metadata } from "next";
import { Hero } from "@/components/hero/hero";
import { JsonLd } from "@/components/seo/json-ld";
import { About } from "@/components/sections/about";
import { CapabilitiesMarquee } from "@/components/sections/capabilities-marquee";
import { CaseStudies } from "@/components/sections/case-studies";
import { Contact } from "@/components/sections/contact";
import { Faq } from "@/components/sections/faq";
import { Services } from "@/components/sections/services";
import { Stats } from "@/components/sections/stats";
import { TechStack } from "@/components/sections/tech-stack";
import { Testimonials } from "@/components/sections/testimonials";
import { site } from "@/content/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { homeGraph } from "@/lib/seo/schema";

export const metadata: Metadata = buildMetadata({
  title: site.homeTitle,
  description: site.description,
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={homeGraph()} />
      <Hero />
      <CapabilitiesMarquee />
      <Services />
      <Stats />
      <About />
      <CaseStudies />
      <TechStack />
      <Testimonials />
      <Faq />
      <Contact />
    </>
  );
}
```

- [ ] **Step 2: Add the 404 page**

`src/app/not-found.tsx`:

```tsx
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export const metadata: Metadata = { title: "Page not found", robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <Container className="flex min-h-[70dvh] flex-col items-start justify-center py-32">
      <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">404</p>
      <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">This page could not be found.</h1>
      <p className="mt-4 max-w-md text-muted">The link may be old or mistyped. These will get you back on track.</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href="/" arrow>
          Back to home
        </Button>
        <Button href="/#case-studies" variant="secondary">
          View case studies
        </Button>
      </div>
    </Container>
  );
}
```

- [ ] **Step 3: Add the console-error checker**

`scripts/console-check.mjs`:

```js
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://127.0.0.1:3100";
const paths = [
  "/",
  "/case-studies/real-estate-scraping",
  "/case-studies/document-extraction",
  "/case-studies/etl-pipeline",
  "/does-not-exist",
];

const browser = await chromium.launch({ channel: "chrome" });
let failures = 0;
for (const scheme of ["light", "dark"]) {
  const context = await browser.newContext({ colorScheme: scheme });
  for (const path of paths) {
    const page = await context.newPage();
    const problems = [];
    page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
    page.on("console", (msg) => {
      const text = msg.text();
      if (["error", "warning"].includes(msg.type()) && !text.includes("status of 404")) problems.push(`${msg.type()}: ${text}`);
    });
    await page.goto(base + path, { waitUntil: "networkidle" });
    await page.waitForTimeout(1500);
    console.log(`${scheme.padEnd(5)} ${path.padEnd(38)} ${problems.length ? "PROBLEMS" : "ok"}`);
    for (const p of problems) console.log("     ", p);
    failures += problems.length;
    await page.close();
  }
  await context.close();
}
await browser.close();
process.exit(failures ? 1 : 0);
```

- [ ] **Step 4: Build and check the whole site**

```bash
npx vitest run && npm run typecheck && npm run lint && npm run build
RESEND_API_KEY= npx next start -p 3100 &
sleep 4
node scripts/console-check.mjs
curl -s http://127.0.0.1:3100/ | grep -c 'application/ld+json'
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3100/does-not-exist
node scripts/shot.mjs http://127.0.0.1:3100/ 1440 dark e2e/.output/t13-dark.png
node scripts/shot.mjs http://127.0.0.1:3100/ 1440 light e2e/.output/t13-light.png
kill %1
```

Expected: every `console-check` row prints `ok` (a hydration warning or React key warning shows up here; fix its cause, do not filter it). The JSON-LD count is `1`. The unknown URL returns `404`. Open `t13-dark.png` and `t13-light.png`: sections appear in the spec order (hero, marquee, services, stats, about, case studies, tech stack, testimonials, FAQ, contact), followed by the footer.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: assemble homepage with JSON-LD, add 404 page and console checker" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

### Task 14: End-to-end tests, Lighthouse audit, README and launch checklist

**Files:**
- Create: `playwright.config.ts`, `e2e/seo.spec.ts`, `e2e/site.spec.ts`, `e2e/responsive.spec.ts`
- Create: `scripts/lighthouse.mjs`, `README.md`

**Interfaces:**
- Consumes: the built site on `http://127.0.0.1:3100`; `caseStudies` and the FAQ from `src/content`.
- Produces: `npm run e2e` (starts its own production server with `RESEND_API_KEY` forced empty, so no test can send real email), `npm run lighthouse` (prints measured scores and exits non-zero below target), and `README.md` with the owner's launch checklist.

- [ ] **Step 1: Playwright config**

`playwright.config.ts`:

```ts
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const ORIGIN = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "e2e",
  outputDir: "e2e/.output",
  fullyParallel: true,
  reporter: "list",
  use: { baseURL: ORIGIN, trace: "off" },
  projects: [{ name: "chrome", use: { ...devices["Desktop Chrome"], channel: "chrome" } }],
  webServer: {
    command: `npm run build && npm run start -- -p ${PORT}`,
    url: ORIGIN,
    // Always start our own server so the forced-empty email key below cannot be bypassed by a running dev server.
    reuseExistingServer: false,
    timeout: 240_000,
    env: { NEXT_PUBLIC_SITE_URL: ORIGIN, RESEND_API_KEY: "" },
  },
});
```

- [ ] **Step 2: SEO, AEO and GEO tests against the raw server HTML (JavaScript disabled)**

`e2e/seo.spec.ts`:

```ts
import { expect, test } from "@playwright/test";
import { caseStudies } from "@/content/case-studies";

type Node = Record<string, unknown>;

async function jsonLd(page: import("@playwright/test").Page): Promise<Node[]> {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks.flatMap((b) => (JSON.parse(b)["@graph"] as Node[]) ?? []);
}

test.describe("server-rendered HTML with JavaScript disabled", () => {
  test.use({ javaScriptEnabled: false });

  test("home has one h1 carrying the full headline", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toHaveCount(1);
    expect((await h1.innerText()).replace(/\s+/g, " ").trim()).toBe("Turn Difficult Websites Into Reliable Data.");
  });

  test("animated content is forced visible without JS", async ({ page }) => {
    await page.goto("/");
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll("[data-reveal]")].filter((el) => {
        const s = getComputedStyle(el);
        return s.opacity !== "1" || s.transform !== "none";
      }).length,
    );
    expect(hidden).toBe(0);
  });

  test("every homepage section is present in the HTML", async ({ page }) => {
    await page.goto("/");
    for (const id of ["services", "about", "case-studies", "tech-stack", "testimonials", "faq", "contact"]) {
      await expect(page.locator(`section#${id}`)).toHaveCount(1);
    }
  });

  test("head tags: title, description, canonical, robots, Open Graph, lang", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Ahraf Khatri | Web Scraping & Data Extraction Consultant");
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description!.length).toBeGreaterThan(70);
    expect(description!.length).toBeLessThanOrEqual(160);
    expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).pathname).toBe("/");
    expect(await page.locator('meta[name="robots"]').getAttribute("content")).toContain("index");
    expect(await page.locator('meta[property="og:image"]').first().getAttribute("content")).toContain("/opengraph-image");
    expect(await page.locator('meta[property="og:type"]').getAttribute("content")).toBe("website");
    expect(await page.locator("html").getAttribute("lang")).toBe("en");
  });

  test("JSON-LD graph has Person, ProfessionalService, WebSite and FAQPage", async ({ page }) => {
    await page.goto("/");
    const types = (await jsonLd(page)).map((n) => n["@type"]);
    expect(types).toEqual(expect.arrayContaining(["Person", "ProfessionalService", "WebSite", "FAQPage"]));
  });

  test("FAQ structured data matches the visible FAQ exactly", async ({ page }) => {
    await page.goto("/");
    const faqNode = (await jsonLd(page)).find((n) => n["@type"] === "FAQPage") as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
    const visibleQuestions = await page.locator("#faq details h3").allInnerTexts();
    const visibleAnswers = await page.locator("#faq details p").allTextContents();
    expect(faqNode.mainEntity).toHaveLength(8);
    expect(faqNode.mainEntity.map((q) => q.name)).toEqual(visibleQuestions.map((q) => q.trim()));
    expect(faqNode.mainEntity.map((q) => q.acceptedAnswer.text)).toEqual(visibleAnswers.map((a) => a.trim()));
  });

  for (const cs of caseStudies) {
    test(`case study "${cs.slug}" is fully server-rendered with article metadata`, async ({ page }) => {
      await page.goto(`/case-studies/${cs.slug}`);
      await expect(page.locator("h1")).toHaveText(cs.title);
      await expect(page).toHaveTitle(`${cs.title} | Ahraf Khatri`);
      expect(new URL((await page.locator('link[rel="canonical"]').getAttribute("href"))!).pathname).toBe(`/case-studies/${cs.slug}`);
      expect(await page.locator('meta[property="og:type"]').getAttribute("content")).toBe("article");
      const nodes = await jsonLd(page);
      expect(nodes.map((n) => n["@type"])).toEqual(expect.arrayContaining(["TechArticle", "BreadcrumbList"]));
      await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    });
  }
});

test.describe("machine-readable endpoints", () => {
  test("sitemap.xml lists the home page and every case study", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const xml = await res.text();
    expect((xml.match(/<loc>/g) ?? []).length).toBe(1 + caseStudies.length);
    for (const cs of caseStudies) expect(xml).toContain(`/case-studies/${cs.slug}`);
  });

  test("robots.txt allows AI search crawlers and points at the sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const txt = await res.text();
    for (const bot of ["OAI-SearchBot", "PerplexityBot", "Claude-SearchBot", "GPTBot"]) expect(txt).toContain(`User-Agent: ${bot}`);
    expect(txt).toContain("Disallow: /api/");
    expect(txt).toMatch(/Sitemap: http:\/\/127\.0\.0\.1:3100\/sitemap\.xml/);
  });

  test("llms.txt and llms-full.txt are plain-text Markdown", async ({ request }) => {
    const short = await request.get("/llms.txt");
    expect(short.headers()["content-type"]).toContain("text/plain");
    expect(await short.text()).toMatch(/^# Ahraf Khatri/);
    const full = await request.get("/llms-full.txt");
    expect(full.headers()["content-type"]).toContain("text/plain");
    expect(await full.text()).toContain("## Frequently asked questions");
  });

  test("manifest, favicon and social images resolve", async ({ request }) => {
    expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
    expect((await request.get("/icon.svg")).status()).toBe(200);
    const og = await request.get("/opengraph-image");
    expect(og.headers()["content-type"]).toContain("image/png");
    expect((await request.get(`/case-studies/${caseStudies[0].slug}/opengraph-image`)).status()).toBe(200);
  });

  test("unknown routes return a real 404", async ({ request }) => {
    expect((await request.get("/nope")).status()).toBe(404);
    expect((await request.get("/case-studies/nope")).status()).toBe(404);
  });
});
```

- [ ] **Step 3: Behaviour tests with JavaScript enabled**

`e2e/site.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test.describe("hero pipeline", () => {
  test("cycles through all five phases", async ({ page }) => {
    await page.goto("/");
    const el = page.locator("[data-phase]");
    const seen = new Set<string>();
    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline && seen.size < 5) {
      const phase = await el.getAttribute("data-phase");
      if (phase) seen.add(phase);
      await page.waitForTimeout(100);
    }
    expect([...seen].sort()).toEqual(["hold", "output", "parse", "raw", "scan"]);
  });

  test("pause freezes it and play resumes", async ({ page }) => {
    await page.goto("/");
    const el = page.locator("[data-phase]");
    await page.getByRole("button", { name: "Pause animation" }).click();
    const frozen = await el.getAttribute("data-phase");
    await page.waitForTimeout(2800);
    expect(await el.getAttribute("data-phase")).toBe(frozen);
    await expect(page.getByRole("button", { name: "Play animation" })).toHaveAttribute("aria-pressed", "true");
  });

  test("reduced motion shows the finished frame and hides the pause control", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/");
    const el = page.locator("[data-phase]");
    await expect(el).toHaveAttribute("data-phase", "hold");
    await page.waitForTimeout(2500);
    await expect(el).toHaveAttribute("data-phase", "hold");
    await expect(page.getByRole("button", { name: /pause animation/i })).toHaveCount(0);
    await context.close();
  });
});

test.describe("theme", () => {
  test.use({ colorScheme: "light" });

  test("toggle switches the theme and the choice persists across reloads", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).not.toHaveClass(/dark/);
    await page.getByRole("button", { name: "Switch to dark theme" }).click();
    await expect(html).toHaveClass(/dark/);
    await page.reload();
    await expect(html).toHaveClass(/dark/);
  });
});

test.describe("navigation", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("nav link scrolls to its section and becomes current", async ({ page }) => {
    await page.goto("/");
    const primary = page.getByRole("navigation", { name: "Primary" });
    await primary.getByRole("link", { name: "Services" }).click();
    await expect(page).toHaveURL(/#services$/);
    await expect(primary.getByRole("link", { name: "Services" })).toHaveAttribute("aria-current", "location");
    await expect(page.locator("#services")).toBeInViewport();
  });

  test("case study card opens its page and the breadcrumb returns to the list", async ({ page }) => {
    await page.goto("/#case-studies");
    await page.getByRole("link", { name: /View Details of Multilingual Document Data Extraction/ }).click();
    await expect(page).toHaveURL(/\/case-studies\/document-extraction$/);
    await expect(page.locator("h1")).toHaveText("Multilingual Document Data Extraction");
    await page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Case studies" }).click();
    await expect(page).toHaveURL(/\/#case-studies$/);
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("opens, navigates and closes with Escape", async ({ page }) => {
    await page.goto("/");
    const toggle = page.getByRole("button", { name: "Open menu" });
    await toggle.click();
    await expect(page.getByRole("navigation", { name: "Mobile" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("navigation", { name: "Mobile" })).toHaveCount(0);
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "FAQ" }).click();
    await expect(page).toHaveURL(/#faq$/);
    await expect(page.getByRole("navigation", { name: "Mobile" })).toHaveCount(0);
  });
});

test.describe("sections", () => {
  test("stats settle on their final values", async ({ page }) => {
    await page.goto("/");
    const stats = page.locator('section[aria-label="Key figures"]');
    await stats.scrollIntoViewIfNeeded();
    await expect(stats).toContainText("100M+", { timeout: 5000 });
    await expect(stats).toContainText("99%");
  });

  test("marquee pause toggles its pressed state", async ({ page }) => {
    await page.goto("/");
    const button = page.getByRole("button", { name: "Pause capabilities scroll" });
    await button.click();
    await expect(page.getByRole("button", { name: "Play capabilities scroll" })).toHaveAttribute("aria-pressed", "true");
  });

  test("testimonials use monograms, never images", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#testimonials img")).toHaveCount(0);
    await expect(page.locator("main img")).toHaveCount(0);
  });

  test("FAQ items expand and collapse", async ({ page }) => {
    await page.goto("/#faq");
    const second = page.locator("#faq details").nth(1);
    await expect(second).not.toHaveAttribute("open", "");
    await second.locator("summary").click();
    await expect(second).toHaveAttribute("open", "");
  });
});

test.describe("contact form", () => {
  test("shows friendly errors and focuses the first invalid field", async ({ page }) => {
    await page.goto("/#contact");
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText("Please enter your name")).toBeVisible();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByLabel("Name")).toBeFocused();
  });

  async function fill(page: import("@playwright/test").Page) {
    await page.getByLabel("Name").fill("Test Person");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Project type").selectOption("web-scraping");
    await page.getByLabel("Tell me about your project").fill("I need listings from ten portals delivered daily.");
  }

  test("confirms success when the API accepts the message", async ({ page }) => {
    await page.route("**/api/contact", (route) => route.fulfill({ status: 200, json: { ok: true } }));
    await page.goto("/#contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText(/your message is on its way/i)).toBeVisible();
  });

  test("falls back to the mail client against the real route with no email key", async ({ page }) => {
    await page.goto("/#contact");
    await fill(page);
    await page.getByRole("button", { name: "Send message" }).click();
    await expect(page.getByText(/Email isn't configured on the server yet/)).toBeVisible();
    await expect(page.getByRole("link", { name: /open email app again/i })).toHaveAttribute("href", /^mailto:/);
  });

  test("honeypot submissions are accepted silently by the real route", async ({ request }) => {
    const res = await request.post("/api/contact", {
      data: { name: "Bot", email: "bot@example.com", projectType: "other", message: "spam spam spam spam spam spam", website: "http://spam.example" },
    });
    expect(res.status()).toBe(200);
  });
});
```

- [ ] **Step 4: Responsive and overflow tests with screenshots**

`e2e/responsive.spec.ts`:

```ts
import { expect, test, type Page } from "@playwright/test";
import { caseStudies } from "@/content/case-studies";

const widths = [375, 768, 1024, 1440];
const schemes = ["light", "dark"] as const;

async function revealEverything(page: Page) {
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 100));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(600);
}

const overflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);

for (const width of widths) {
  for (const scheme of schemes) {
    test(`home at ${width}px (${scheme}): no horizontal scroll`, async ({ browser }) => {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
      const page = await context.newPage();
      await page.goto("/", { waitUntil: "networkidle" });
      await revealEverything(page);
      expect(await overflow(page)).toBeLessThanOrEqual(0);
      await page.screenshot({ path: `e2e/.output/home-${width}-${scheme}.png`, fullPage: true });
      await context.close();
    });
  }

  test(`case study pages at ${width}px: no horizontal scroll`, async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    for (const cs of caseStudies) {
      await page.goto(`/case-studies/${cs.slug}`, { waitUntil: "networkidle" });
      await revealEverything(page);
      expect(await overflow(page), cs.slug).toBeLessThanOrEqual(0);
      await page.screenshot({ path: `e2e/.output/cs-${cs.slug}-${width}.png`, fullPage: true });
    }
    await context.close();
  });
}

test("buttons and form controls are at least 44px tall on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/", { waitUntil: "networkidle" });
  const tooSmall = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("button, [role=button], input:not([type=hidden]), select, textarea")]
      .filter((el) => el.offsetParent !== null && !el.closest("[aria-hidden=true]"))
      .map((el) => ({ el: el.outerHTML.slice(0, 80), h: el.getBoundingClientRect().height }))
      .filter((x) => x.h > 0 && x.h < 44),
  );
  expect(tooSmall).toEqual([]);
});
```

- [ ] **Step 5: Run the end-to-end suite**

Run: `npm run e2e`
Expected: every test passes. For each failure, read the assertion and fix the component, not the test, unless the test itself is wrong (for example a selector that does not match the real accessible name). After a pass, open several screenshots in `e2e/.output/` (`home-375-dark.png`, `home-768-light.png`, `home-1440-light.png`, one `cs-*-375.png`) and confirm there are no clipped, overlapping or unstyled elements.

- [ ] **Step 6: Lighthouse audit script**

`scripts/lighthouse.mjs`:

```js
import { mkdirSync, writeFileSync } from "node:fs";
import * as chromeLauncher from "chrome-launcher";
import lighthouse from "lighthouse";

const base = process.env.LH_BASE_URL ?? "http://127.0.0.1:3100";
const pages = ["/", "/case-studies/real-estate-scraping"];
const targets = { performance: 95, accessibility: 95, "best-practices": 95, seo: 100 };

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH ?? "/usr/bin/google-chrome",
  chromeFlags: ["--headless=new", "--no-sandbox"],
});
mkdirSync("lighthouse-reports", { recursive: true });

let below = 0;
for (const path of pages) {
  const result = await lighthouse(base + path, {
    port: chrome.port,
    output: "json",
    logLevel: "error",
    onlyCategories: Object.keys(targets),
  });
  const { categories, audits } = result.lhr;
  writeFileSync(`lighthouse-reports/${path === "/" ? "home" : path.split("/").pop()}.json`, result.report);

  console.log(`\n${path}  (mobile profile)`);
  for (const [id, min] of Object.entries(targets)) {
    const score = Math.round((categories[id].score ?? 0) * 100);
    if (score < min) below++;
    console.log(`  ${id.padEnd(15)} ${String(score).padStart(3)}  (target ${min})${score < min ? "  BELOW TARGET" : ""}`);
  }
  for (const id of ["largest-contentful-paint", "cumulative-layout-shift", "total-blocking-time"]) {
    console.log(`  ${id.padEnd(26)} ${audits[id].displayValue}`);
  }
}

await chrome.kill();
process.exit(below ? 1 : 0);
```

- [ ] **Step 7: Run Lighthouse against the production build and act on the results**

```bash
npm run build
RESEND_API_KEY= NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100 npx next start -p 3100 &
sleep 4
npm run lighthouse
kill %1
```

Expected: scores and Core Web Vitals print for both pages. Targets are Performance 95+, Accessibility 95+, Best Practices 95+, SEO 100, LCP under 2.5s, CLS under 0.1. If any score is below target, open `lighthouse-reports/*.json`, read the failing audits, fix the cause (typical: an image or font without dimensions or `display: swap`, low-contrast text, a missing accessible name, or a layout shift from the hero pipeline) and re-run. Record the final measured scores. Do not lower targets and do not report unmeasured numbers. If a target cannot be met after fixes, report the measured value and the reason.

- [ ] **Step 8: Write the README and launch checklist**

`README.md`:

````markdown
# Ahraf Khatri: portfolio website

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Motion · zod · Resend.
A landing page plus three case study pages, with light and dark themes, an animated
extraction-pipeline hero, a working contact form, and SEO, AEO and GEO built in.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build && npm start` | Production build and server |
| `npm test` | Unit tests (Vitest) |
| `npm run e2e` | End-to-end tests (Playwright; starts its own server on port 3100) |
| `npm run lighthouse` | Lighthouse audit against a running production server on port 3100 |
| `npm run typecheck` · `npm run lint` | Static checks |

## Configuration

Copy `.env.example` to `.env.local`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, no trailing slash. Drives canonical URLs, the sitemap, JSON-LD and `llms.txt`. Required in production. |
| `RESEND_API_KEY` | Enables email delivery from the contact form. Without it, the form opens the visitor's mail client instead. |
| `CONTACT_TO_EMAIL` | Where enquiries are delivered. Defaults to the email in `src/content/site.ts`. |
| `CONTACT_FROM_EMAIL` | Verified sender, for example `Portfolio <hello@yourdomain.com>`. Defaults to Resend's test sender. |

## Editing content

All copy is in `src/content/`. Components hold none.

- `site.ts`: name, title, description, email, social links, location, `allowAiTrainingCrawlers`, `lastUpdated`.
- `hero.ts`, `sections.ts`, `services.ts`, `about.ts`, `stats.ts`, `stack.ts`, `faq.ts`, `contact.ts`.
- `case-studies.ts`: add an entry and the page, sitemap, JSON-LD, `llms.txt` and social image follow automatically.
- Keep titles under 60 characters and descriptions under 160. `npm test` enforces this.

## Launch checklist (only you can do these)

1. **Replace the placeholder testimonials** in `src/content/testimonials.ts` with real, permissioned quotes. The current three come from the original design and are marked `placeholder: true`.
2. **Confirm the numbers** in `src/content/stats.ts` (5+ years, 10+ scrapers, 100M+ pages, 99% uptime) and the copy in `src/content/case-studies.ts`. The case study detail text was drafted from the one-line summaries in the design; add real outcomes and metrics only if you can stand behind them.
3. **Check the contact details** in `src/content/site.ts` (email, LinkedIn, GitHub).
4. **Register a domain**, deploy, and set `NEXT_PUBLIC_SITE_URL` to it.
5. **Turn on email**: create a Resend account, verify your sending domain, then set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`.
6. **Verify the site** in Google Search Console and Bing Webmaster Tools, and submit `/sitemap.xml`.
7. **Link back to the site** from your LinkedIn and GitHub profiles. The `sameAs` links in the structured data are more credible when the profiles link back.
8. **Earn a few real mentions** (a talk, a guest post, a directory listing). Structured data helps engines understand you; mentions help them trust you.
9. **Re-run** `npm run e2e` and `npm run lighthouse` against the deployed URL (set `LH_BASE_URL`).

## SEO, AEO and GEO: what is built in

- **SEO:** per-page titles, descriptions, canonical URLs, Open Graph and Twitter cards, generated social images, sitemap, robots, semantic HTML, a real 404, and a Core Web Vitals-conscious build.
- **AEO:** a visible FAQ of eight direct answers, mirrored exactly by `FAQPage` structured data. Section intros open with a concise summary sentence.
- **GEO:** fully server-rendered content, a linked `Person` / `ProfessionalService` / `WebSite` entity graph with `sameAs`, `robots.txt` rules that allow AI search and answer crawlers, and `/llms.txt` plus `/llms-full.txt`.

Honest limits: nothing here guarantees a ranking or an AI citation. `llms.txt` is an emerging convention that no major engine has confirmed it reads. AI training crawlers are allowed by default; set `allowAiTrainingCrawlers` to `false` in `src/content/site.ts` to block them while keeping AI search and answer crawlers allowed. Google restricts FAQ rich results to a narrow set of sites, so the FAQ's value here is for other engines and assistants that read structured data.
````

- [ ] **Step 9: Final full verification**

```bash
npm run typecheck && npm run lint && npx vitest run && npm run e2e
```

Then, with the production server running as in Step 7, run `node scripts/console-check.mjs` and `npm run lighthouse` one last time.

Expected: type-check and lint exit 0; every unit and e2e test passes; `console-check` prints `ok` for every row; Lighthouse results are recorded. Report the actual outputs, including any target that was not met.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "test: add end-to-end, responsive and Lighthouse checks; document launch checklist" -m "Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Self-Review Notes

**Spec coverage** (each spec section mapped to tasks):

| Spec section | Task |
|---|---|
| 3 Stack | 1 (install), 5 (providers), 7–12 (usage) |
| 4 Information architecture, routes, content model | 2, 4, 10, 13 |
| 5 Visual system (tokens, themes, type, background, monograms) | 5, 7, 9 |
| 6 Section notes (hero, marquee, services, stats, about, case studies, tech stack, testimonials, contact) | 7, 8, 9, 10, 11, 12 |
| 7 Motion (pipeline, headline, scroll, cards, nav, diagram draw, MotionConfig, no-JS visibility) | 5, 6, 7, 8, 10, 14 |
| 8 SEO / AEO / GEO (metadata, OG images, sitemap, robots, JSON-LD graph, FAQ, llms files, AI crawlers, local signals, owner actions) | 3, 4, 10, 12, 13, 14 (README) |
| 9 Contact form (fields, zod both sides, Resend, honeypot, rate limit, mail fallback, aria-live states) | 12 |
| 10 Accessibility and responsiveness | 5 (contrast tests, skip link, focus), 6, 12, 14 |
| 11 Verification list (build, screenshots, curl of HTML, JSON-LD validation, endpoints, Lighthouse, form) | each task's verify step, 13, 14 |
| 12 Open items (placeholders flagged) | 2 (content flags), 14 (README checklist) |

**Deviations from the spec, all deliberate:**
- The nav's "animated pill" is a background-color transition on the active link rather than a shared-layout pill. A shared pill needs Motion's `domMax` feature set, which would grow the bundle for a small effect.
- Hero pipeline renders the completed frame on the server, then restarts the loop after hydration (about 0.6s later), as the spec describes.
- The 404 page's copy is inline in the component; it is not a section, so it does not fall under the "no section copy in components" rule.

**Known risks the executor should watch:**
- `next/font/google` fetches JetBrains Mono at build time and needs network access; the layout comment gives the offline fallback.
- Versions are current as of planning (Next 16.3, Motion 13, zod 4, TypeScript pinned to 5.9). If `eslint@9` conflicts with `eslint-config-next@16`, use the version that config accepts.
- The pipeline's beam and reveal timings are eyeballed defaults; tune them against the phase screenshots in Task 7, keeping durations within the constraints above.

