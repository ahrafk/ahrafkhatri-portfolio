# Portfolio Website: Design Spec

Date: 2026-09-19
Owner: Ahraf Khatri (Data Engineer, Web Intelligence Consultant)
Source: user-supplied screenshot of a landing-page design, plus the decisions recorded below.

## 1. Goal

Rebuild the supplied portfolio design as a production website that wins consulting leads for web scraping, document extraction and ETL work. Keep the design's identity (navy and electric blue, section order, copy), fix its weak spots, and make it discoverable by search engines, answer engines and generative AI engines.

## 2. Decisions already made

| Topic | Decision |
|---|---|
| People imagery | None. No photo, no face, no human illustration, no avatars. |
| Hero visual | Animated "live extraction pipeline": raw HTML is parsed and streams out as validated JSON rows with a records counter. |
| Scope | Single-page landing plus 3 case study detail pages. Blog and full About page are not built; the nav does not link to them. |
| Improvements | Unified tech-stack look, real-proof trust strip, working contact form, light/dark theme with a polish and mobile pass. |
| Optimisation | SEO, AEO and GEO are first-class requirements (section 8). |

## 3. Stack

- Next.js (App Router), TypeScript, React Server Components by default.
- Tailwind CSS v4 with CSS-variable design tokens.
- Motion (`motion/react`, the current Framer Motion package), used through `LazyMotion` + `domAnimation` and `m.*` components to keep the bundle small.
- `next-themes` for the theme toggle, `next/font` for Geist and JetBrains Mono, `lucide-react` for UI icons, `simple-icons` data for technology logos.
- `zod` for form validation. Resend for delivery (see section 9).

## 4. Information architecture

Routes:

- `/` homepage.
- `/case-studies/[slug]` for `real-estate-scraping`, `document-extraction`, `etl-pipeline` (statically generated with `generateStaticParams`).
- `/not-found`.
- Machine routes: `/sitemap.xml`, `/robots.txt`, `/llms.txt`, `/llms-full.txt`, `/manifest.webmanifest`, generated Open Graph images.

Homepage section order (each has a stable anchor id used by the nav):

1. Nav (sticky; blur on scroll; active-section indicator; theme toggle; "Let's Work Together" CTA). Links: About, Services, Case Studies, Tech Stack, FAQ, Contact. The design's "Experience" and "Blog" links are dropped because those pages are out of scope.
2. Hero
3. Capabilities marquee (`#capabilities`)
4. Services, 6 cards (`#services`)
5. Stats band
6. About (`#about`)
7. Case Studies, 3 cards (`#case-studies`)
8. Tech Stack, grouped (`#tech-stack`)
9. Testimonials (`#testimonials`)
10. FAQ (`#faq`), added for AEO
11. Contact with form (`#contact`)
12. Footer

Content lives in `src/content/` (`site.ts`, `services.ts`, `case-studies.ts`, `stack.ts`, `faq.ts`, `testimonials.ts`). Components hold no copy. `site.ts` is the single source for name, title, contact details, social links, canonical URL and location.

## 5. Visual system

- Tokens (semantic, themeable): `--bg`, `--surface`, `--surface-2`, `--border`, `--text`, `--text-muted`, `--accent`, `--accent-contrast`, `--glow`.
- Dark: background `#0A1020`, surface `#111A2E`, accent `#4C9AFF`. Light: background `#F7F9FC`, surface `#FFFFFF`, accent `#2563EB`. Muted text meets WCAG AA (4.5:1) in both themes.
- Type: Geist for headings and body, JetBrains Mono for data, code and stat labels. Modular scale with fluid `clamp()` sizes. Headline tracking tightened at large sizes.
- Spacing: 8px base grid. Container max width 1200px, 16px gutter on phones, 24px on tablets.
- Background: layered grid and radial glow. No photography.
- The theme defaults to the system preference, persists the user's choice, and avoids a flash on load.
- Testimonials use initial monograms on tinted tiles.

## 6. Section notes

- **Hero:** headline "Turn Difficult Websites Into Reliable Data." with the second line in the accent colour; the 6 capability ticks; two CTAs ("Discuss Your Project", "View Case Studies"); location, experience and "global clients" chips. Right side: the pipeline visual (section 7).
- **Capabilities marquee:** replaces "Trusted by businesses across industries". It scrolls concrete capabilities (session rotation, proxy management, CAPTCHA handling, OCR pipelines, Airflow DAGs, cloud scrapers, data validation). Pauses on hover and under reduced motion.
- **Services:** the 6 cards from the design (Complex Web Scraping, Anti-Bot Infrastructure, OCR & Document Extraction, ETL & Data Pipelines, Scalable Infrastructure, API & Data Integration).
- **Stats:** 5+ years, 10+ production scrapers, 100M+ pages processed, 99% uptime focus (user-supplied, see section 12).
- **About:** short bio, contact list (location, email, LinkedIn, GitHub), pull quote.
- **Case studies:** three cards linking to detail pages. Each detail page has Problem, Approach, Architecture (an SVG diagram), Stack used, Outcome, and a CTA back to contact.
- **Tech stack:** monochrome logos that take brand colour on hover, grouped as Scraping (Playwright, Selenium), Data (Python, Pandas, NumPy, PostgreSQL, MongoDB), Infrastructure (Docker, AWS, Celery, RabbitMQ, Airflow, Django), AI/OCR (Tesseract, OpenCV, spaCy, TensorFlow, EasyOCR).
- **Testimonials:** the three quotes from the design as placeholders, marked in the content file for replacement.
- **Contact:** the form (section 9) beside a direct email, LinkedIn and GitHub list.

## 7. Motion design

Principles: motion explains or rewards, never blocks. Animate only `transform` and `opacity` (plus SVG stroke offset). Durations 150–300ms for UI feedback, 500–800ms for entrances. Easing is an ease-out curve for entrances and springs (stiffness about 300, damping about 30) for interaction.

- **Hero pipeline (client island, looped, about 9s cycle):** raw HTML lines with obfuscated class names appear, a scan beam sweeps them, tokens lift into structured JSON rows that type in with a "valid" tick, and a records counter rises. Reduced motion, or no JS, shows the completed final frame, which is also what the server renders.
- **Headline:** word-by-word mask reveal on load.
- **Scroll:** `whileInView` staggered reveals, fired once, with a small viewport margin. Stats count up when they enter view.
- **Cards:** spring lift on hover, a cursor-following spotlight gradient, and an arrow shift on links.
- **Nav:** background blur and border fade in after scrolling, and an animated pill marks the active section.
- **Case study pages:** page-level fade and rise, and the architecture diagram draws its paths on view.
- `MotionConfig reducedMotion="user"` wraps the app.
- Content must stay visible without JavaScript. Elements that start hidden get a `<noscript>` style override, so crawlers and no-JS visitors see all content.

## 8. SEO, AEO, GEO

No optimisation guarantees a ranking or a citation. The deliverable is a correct, complete technical foundation plus a checklist of the manual steps only the owner can do.

### SEO (search engines)

- Next.js Metadata API on every route: unique title (under 60 characters) and description (under 160), canonical URL, Open Graph and Twitter cards, `robots` directives, `lang="en"`.
- Generated 1200x630 Open Graph images through `opengraph-image.tsx` for the homepage and each case study.
- `sitemap.xml` and `robots.txt` generated from content data, with `lastModified` values.
- Semantic HTML: one `h1` per page, a clean `h2`/`h3` outline, landmarks (`header`, `nav`, `main`, `section` with `aria-labelledby`, `footer`), descriptive link text, and alt text on every non-decorative image.
- Human-readable URLs; a real 404 page; breadcrumbs on case study pages.
- Core Web Vitals budget on a production build: LCP under 2.5s, CLS under 0.1, INP under 200ms. This is enforced through server components, self-hosted fonts with `display: swap`, no layout-shifting animations, reserved space for the hero visual, and `LazyMotion`.
- Favicon set and web manifest.

### AEO (answer engines, featured answers, voice)

- A visible FAQ section of 8 questions, with each answer written first as a direct 40–60 word answer that can stand alone, then optional detail. Questions target real queries, for example "What does a web scraping consultant do?", "Can you scrape websites with anti-bot protection?", "Can you extract data from scanned PDFs?", "Is web scraping legal?" (answered carefully and not as legal advice), "What technologies do you use?", "How do we start a project?".
- Section headings are phrased as plain statements or questions, and each section opens with a concise summary sentence.
- `FAQPage` JSON-LD that mirrors the visible FAQ exactly. Google limits FAQ rich results to a narrow set of sites, so this is for other engines and assistants that parse it; the visible content is the real AEO value.

### GEO (generative engines: ChatGPT, Claude, Perplexity, Google AI Overviews)

- Content is fully server-rendered HTML, because most AI crawlers do not execute JavaScript.
- An entity graph in JSON-LD (`@graph` with stable `@id`s): `Person` (name, `jobTitle`, `knowsAbout`, `sameAs` for LinkedIn and GitHub, `address` locality), `ProfessionalService` (`serviceType`, `areaServed`, `provider`), `WebSite`, `FAQPage`, and per case study `TechArticle` (author, `datePublished`, `dateModified`) plus `BreadcrumbList`.
- Consistent entity naming: the same name, title and one-sentence description everywhere (metadata, schema, About, footer, `llms.txt`).
- Quotable, attributable facts: specific claims with context, kept in plain text, not inside images or animations.
- `robots.txt` explicitly allows the main AI search and training crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended). One constant in `site.ts` flips AI-training crawlers off if the owner changes their mind.
- `/llms.txt` (summary and key links) and `/llms-full.txt` (full site content as Markdown), generated from the content files. This is an emerging convention and no major engine has confirmed it uses these files. It is cheap and harmless, so it is included, but it is not a substitute for the items above.
- Local and regional signals: Mumbai, India in the `Person` address and copy; `areaServed: Worldwide` on the service entity.

### Owner actions (cannot be automated)

Register a domain and set `NEXT_PUBLIC_SITE_URL`; verify the site in Google Search Console and Bing Webmaster Tools; submit the sitemap; link the site from LinkedIn and GitHub profiles so the `sameAs` graph is corroborated; earn a few real external mentions.

## 9. Contact form

Fields: name, email, project type (select), budget range (select, optional), message. Validated on both client and server with the same `zod` schema. Submits to a Route Handler that sends email through Resend using `RESEND_API_KEY` and `CONTACT_TO_EMAIL`. It includes a hidden honeypot field and a basic per-IP rate limit. Without an API key, the form falls back to opening the visitor's mail client with the fields prefilled. States: idle, submitting, success, error. Each is announced through an `aria-live` region and has a distinct visual treatment.

## 10. Accessibility and responsiveness

- WCAG 2.2 AA target: colour contrast, visible focus rings, keyboard-reachable everything, skip-to-content link, 44px minimum touch targets, form labels tied to inputs, error text linked with `aria-describedby`.
- The marquee and hero loop respect reduced motion and can be paused.
- Breakpoints: 375, 768, 1024 and 1440px checked. No horizontal scroll on any of them. The nav collapses to an accessible menu sheet on small screens.

## 11. Verification (before calling it done)

1. `next build` and `tsc --noEmit` pass with no warnings introduced.
2. Screenshots at 375, 768 and 1440px in both themes, reviewed for layout defects, and the hero animation confirmed running.
3. `curl` the built HTML of `/` and a case study to confirm the full content, the JSON-LD and the meta tags are in the server response without JS.
4. JSON-LD parsed and structurally validated by script; the FAQ schema matches the visible FAQ.
5. `/sitemap.xml`, `/robots.txt`, `/llms.txt` and `/llms-full.txt` return 200 with correct content types.
6. Lighthouse on the production build, mobile profile. Targets: Performance 95+, Accessibility 95+, Best Practices 95+, SEO 100. Actual scores are reported as measured.
7. Contact form exercised end to end: validation errors, success, and fallback path.

## 12. Open items owned by the user

- **Testimonials:** the three quotes come from the design and look like placeholders. They are flagged in `testimonials.ts` and must be replaced with real, permissioned quotes before launch.
- **Statistics:** 5+ years, 10+ scrapers, 100M+ pages, 99% uptime are used as given. Only the user can vouch for them.
- **Case study detail copy:** drafted only from the one-line summaries in the design. No metrics are invented; outcome sections are qualitative until the user supplies real figures.
- **Contact details:** the email, LinkedIn and GitHub values shown in the design are used until replaced in `site.ts`.
- **Domain and Resend key:** needed for canonical URLs and delivery respectively.

## 13. Out of scope

Blog, standalone About page, CMS, analytics and cookie banner, i18n, authentication, a booking calendar integration, and any generated or stock photography of people.
