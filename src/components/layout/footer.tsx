import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { GitHubIcon, LinkedInMark } from "@/components/ui/social-icons";
import { caseStudies } from "@/content/case-studies";
import { navLinks } from "@/content/sections";
import { site } from "@/content/site";

const linkClass = "inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-fg";

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
          <ul role="list" className="mt-4">
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
          <ul role="list" className="mt-4">
            {caseStudies.map((c) => (
              <li key={c.slug}>
                <Link href={`/case-studies/${c.slug}`} className={linkClass}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-mono text-xs uppercase tracking-[0.18em] text-fg">Connect</h2>
          <ul role="list" className="mt-4">
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

      {/* The rule sits on an inner element so it ends where the columns above it end,
          instead of running out into the Container's horizontal padding. */}
      <Container>
        <div className="flex flex-col gap-2 border-t border-line py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </p>
          <p>Building a more open and data-driven world.</p>
        </div>
      </Container>
    </footer>
  );
}
