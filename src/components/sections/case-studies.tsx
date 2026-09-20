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
        <ul role="list" className="grid gap-4 lg:grid-cols-3">
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
