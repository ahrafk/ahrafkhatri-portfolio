# Ahraf Khatri: portfolio website

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Motion · zod · Resend.
A landing page plus three case study pages, with light and dark themes, an animated
extraction-pipeline hero, a working contact form, and SEO, AEO and GEO built in.

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server on http://localhost:3000 |
| `NEXT_PUBLIC_SITE_URL=http://localhost:3000 npm run build && npm start` | Production build and server. The build refuses to run without `NEXT_PUBLIC_SITE_URL` (see Configuration); `.env.local` also supplies it |
| `npm test` | Unit tests (Vitest) |
| `npm run e2e` | End-to-end tests (Playwright) |
| `npm run lighthouse` | Lighthouse audit against a running production server on port 3100 |
| `npm run typecheck` · `npm run lint` | Static checks |

Both browser suites drive your **system Google Chrome**, not a downloaded
browser: Playwright is configured with `channel: "chrome"`, and Lighthouse
launches `/usr/bin/google-chrome` unless you set `CHROME_PATH`.

`npm run e2e` is self-contained and a little greedy: it runs a full
`npm run build`, then starts its own server on port 3100 with
`NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100` and an empty `RESEND_API_KEY`
(so a test run can never send real email). Do not run it while a `next dev`
or `next start` of this project is using `.next` or port 3100.

`npm run lighthouse` needs you to start that server yourself first:

```bash
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100 npm run build
RESEND_API_KEY= NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3100 npx next start -p 3100
npm run lighthouse          # audits / and /case-studies/real-estate-scraping
```

It is the one command that honours `LH_BASE_URL`, so it can also be pointed
at a deployed URL. The Playwright suite cannot: `playwright.config.ts` hard-
codes the origin and `e2e/seo.spec.ts` asserts `127.0.0.1:3100`.

## Configuration

Copy `.env.example` to `.env.local`.

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical origin, no trailing slash. Drives canonical URLs, the sitemap, JSON-LD and `llms.txt`. Required in production: `next build` fails with an error if it is unset or empty, so a deploy can never ship localhost canonicals. It is baked in when `next build` runs (the metadata routes are prerendered), so it must be set at build time and not just at runtime. `next dev` and the tests fall back to `http://localhost:3000`. |
| `RESEND_API_KEY` | Enables email delivery from the contact form. Without it, the form opens the visitor's mail client instead. |
| `CONTACT_TO_EMAIL` | Where enquiries are delivered. Defaults to the email in `src/content/site.ts`. |
| `CONTACT_FROM_EMAIL` | Verified sender, for example `Portfolio <hello@yourdomain.com>`. Defaults to Resend's test sender. |
| `CHROME_PATH` | Where Lighthouse finds Chrome. Defaults to `/usr/bin/google-chrome`. |
| `LH_BASE_URL` | Origin `npm run lighthouse` audits. Defaults to `http://127.0.0.1:3100`. |

The contact form's rate limiter (5 messages per 10 minutes per visitor, kept in
memory per server instance) trusts the first `x-forwarded-for` entry, which is
correct on Vercel; behind your own proxy make sure it sets `x-forwarded-for` or
`x-real-ip`, or every visitor shares one bucket.

The build downloads Geist and JetBrains Mono from Google Fonts once
(`next/font/google` self-hosts them in the build output, so visitors never
contact Google). If the build machine has no network, switch the two font
calls at the top of `src/app/layout.tsx` to `next/font/local` with the font
files checked in.

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
4. **Register a domain**, deploy, and set `NEXT_PUBLIC_SITE_URL` to it **before the build runs**. The metadata routes are prerendered, so a value set only at runtime is too late: canonical URLs, the sitemap, JSON-LD and `llms.txt` are baked in at build time.
5. **Turn on email**: create a Resend account, verify your sending domain, then set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` and `CONTACT_FROM_EMAIL`.
6. **Verify the site** in Google Search Console and Bing Webmaster Tools, and submit `/sitemap.xml`.
7. **Link back to the site** from your LinkedIn and GitHub profiles. The `sameAs` links in the structured data are more credible when the profiles link back.
8. **Earn a few real mentions** (a talk, a guest post, a directory listing). Structured data helps engines understand you; mentions help them trust you.
9. **Re-check the deployed site** with `LH_BASE_URL=https://your-domain npm run lighthouse`. `npm run lighthouse` is the only one of the two browser suites that can be pointed at a URL; `npm run e2e` always builds this repo and tests its own server on `127.0.0.1:3100`, so run it locally before you deploy rather than against the live site.

## Measured quality

Measured on 2026-09-20 on a local production build (`next build` + `next start -p 3100`)
with Lighthouse 13's default mobile profile: a simulated slow-4G link and a 4x CPU
slowdown. Six runs per page; the median is given with the full range in brackets.

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
|---|---|---|---|---|---|---|
| Home | 93 (91-96) | 100 (96-100) | 100 | 100 | 3.0 s (2.7-3.5) | 0 |
| `/case-studies/real-estate-scraping` | 98 (95-98) | 100 | 100 | 100 | 2.4 s (2.3-3.0) | 0 |

The home page misses the 95 performance target in about half of its runs. Its
score is limited entirely by Largest Contentful Paint: under Lighthouse's
simulated throttling, LCP is charged for everything the page downloads before
its first paint. That is about 368 KB: 206 KB of JavaScript, of which roughly
140 KB is the React and Next.js client runtime, plus 86 KB of fonts and a
75 KB document. Accessibility, Best Practices and SEO hit
their targets, layout shift is zero, and on an unthrottled connection the
observed LCP is about 140 ms. One home-page run in six reported accessibility
96, from two intermittent axe findings: the hero sample's dimmed code lines
are below 4.5:1 during one phase of its animation, and the header logo's
`aria-label` does not repeat the "AK" monogram beside it.

## SEO, AEO and GEO: what is built in

- **SEO:** per-page titles, descriptions, canonical URLs, Open Graph and Twitter cards, generated social images, sitemap, robots, semantic HTML, a real 404, and a Core Web Vitals-conscious build.
- **AEO:** a visible FAQ of eight direct answers, mirrored exactly by `FAQPage` structured data. Section intros open with a concise summary sentence.
- **GEO:** fully server-rendered content, a linked `Person` / `ProfessionalService` / `WebSite` entity graph with `sameAs`, `robots.txt` rules that allow AI search and answer crawlers, and `/llms.txt` plus `/llms-full.txt`.

Honest limits: nothing here guarantees a ranking or an AI citation. `llms.txt` is an emerging convention that no major engine has confirmed it reads. AI training crawlers are allowed by default; set `allowAiTrainingCrawlers` to `false` in `src/content/site.ts` to block them while keeping AI search and answer crawlers allowed. Google restricts FAQ rich results to a narrow set of sites, so the FAQ's value here is for other engines and assistants that read structured data.
