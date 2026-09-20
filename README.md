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
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, no trailing slash. Drives canonical URLs, the sitemap, JSON-LD and `llms.txt`. Required in production. It is baked in when `next build` runs (the metadata routes are prerendered), so it must be set at build time and not just at runtime, and it must be non-empty: an empty value is not treated as unset and produces relative URLs. |
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
