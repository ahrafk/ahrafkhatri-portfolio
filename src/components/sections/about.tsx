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
        {/* `lg:items-start`: the two cards hold a few lines each, so stretching them to the text column's
            height would leave most of each card empty. */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.9fr_0.9fr] lg:items-start">
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

          <Reveal delay={0.08}>
            <ul role="list" className="space-y-1 rounded-2xl border border-line bg-surface p-5">
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

          <Reveal delay={0.16}>
            <figure className="rounded-2xl border border-line bg-surface-2 p-6">
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
