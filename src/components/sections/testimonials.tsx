import { Quote } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { Section, SectionHeading } from "@/components/ui/section";
import { sectionCopy } from "@/content/sections";
import { publishedTestimonials } from "@/content/testimonials";

/** Renders nothing until there is at least one verified testimonial (see `src/content/testimonials.ts`). */
export function Testimonials() {
  if (publishedTestimonials.length === 0) return null;
  const copy = sectionCopy.testimonials;
  return (
    <Section id="testimonials">
      <Container>
        <SectionHeading id="testimonials" eyebrow={copy.eyebrow} title={copy.title} intro={copy.intro} />
        <ul role="list" className="grid gap-4 lg:grid-cols-3">
          {publishedTestimonials.map((t, i) => (
            <li key={t.company}>
              <Reveal delay={i * 0.08} className="h-full">
                <figure className="flex h-full flex-col rounded-2xl border border-line bg-surface p-6">
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
