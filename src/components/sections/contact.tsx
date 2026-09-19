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
